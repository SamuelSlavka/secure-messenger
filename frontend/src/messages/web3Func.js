import Web3 from 'web3';
import { provider } from '../constants';
import { getPK, getPublicKey, fetchServer } from './generalFunc';

const EthCrypto = require('eth-crypto');
const crypto = require('crypto');

const web3 = new Web3();

web3.setProvider(new web3.providers.WebsocketProvider(provider));

// encrypt message with public kry
async function encryptMessage(message, recvPublic, PK) {
  const signature = EthCrypto.sign(
    PK,
    EthCrypto.hash.keccak256(message),
  );

  // sending checksum to blockchain
  const payload = {
    message,
    signature,
  };

  // encrypted data for db storage
  const encrypted = await EthCrypto.encryptWithPublicKey(
    recvPublic.result,
    JSON.stringify(payload),
  );

  return EthCrypto.cipher.stringify(encrypted);
}

// decrypt message and save result to sixth position of input
async function decryptMessage(message, myAddress, PK) {
  const mesg = message;
  if (myAddress === message[2]) {
    mesg.splice(6, 0, message[7]);
  }

  const encryptedObject = EthCrypto.cipher.parse(message[6]);
  const decrypted = await EthCrypto.decryptWithPrivateKey(PK, encryptedObject);
  const decryptedPayload = JSON.parse(decrypted);

  // TODO check signature
  // const senderAddress = EthCrypto.recover(
  //  decryptedPayload.signature,
  //  EthCrypto.hash.keccak256(decryptedPayload.message)
  // );

  mesg[6] = decryptedPayload.message;
  return mesg;
}

// encrypt message and send to db
// create checksum of the message and send to blockchain
export async function sendMessageToAddr(info, message, sendAddress,
  recvAddress, sendName, recvName) {
  try {
    const PK = getPK();

    // == ETH ==
    // checksum for blckchain storage
    const checksum = crypto.createHash('md5').update(message).digest('hex');

    // Add account from private key
    web3.eth.accounts.wallet.add(PK);
    const from = web3.eth.accounts.wallet[0].address;

    // contract instance
    const contract = new web3.eth.Contract(JSON.parse(info.abi), info.address);
    const transaction = contract.methods.createMessage(checksum, recvAddress);

    // estimate cost
    let estimate = await transaction.estimateGas({ from });
    estimate = Math.round(estimate * 1.5);

    // send transaction
    transaction.send({
      from,
      to: info.address,
      gas: estimate,
    });

    // == DB ==
    // gets public keys for encrypting
    const [recvPublic, sendPublic] = await Promise.all([
      getPublicKey(recvName, recvAddress),
      getPublicKey(sendName, sendAddress),
    ]);

    // creates two encryptions so that both sides can read later on
    const [recvEncrypted, sendEncrypted] = await Promise.all([
      encryptMessage(message, recvPublic, PK),
      encryptMessage(message, sendPublic, PK),
    ]);

    // save transaction to psql db
    fetchServer('/api/savemessage', {
      recvAddress,
      sendAddress,
      recvName,
      sendName,
      timestamp: Date.now(),
      recvContents: recvEncrypted,
      sendContents: sendEncrypted,
    });
  } catch (error) {
    return { Error: true, body: error };
  }
  return { Error: false, body: 'Transaction Failed' };
}

// get encrypted messages from db and checksums from blockchain
// decrypt and check mesaages then return
export async function getMessagesFromAddr(info, recvAddress, sendAddress) {
  let result = [];
  try {
    const PK = getPK();

    // create contract instance
    const contract = new web3.eth.Contract(JSON.parse(info.abi), info.address);
    // unlock wallet
    web3.eth.accounts.wallet.add(PK);
    const account = web3.eth.accounts.wallet[0].address;

    const [contractRes, dbRes] = await Promise.all([
      // call get method with wallet
      contract.methods.getLastMessages(recvAddress, sendAddress, 0, 10).call({ from: account }),
      // fetch same mesasges form db
      fetchServer('/api/getmessages', {
        recvAddress, sendAddress, offset: 0, count: 10,
      }),
    ]);

    // get checksums from contract output
    const contractChecks = Array.from(contractRes, (x) => x[0]).filter((y) => y !== '');
    const db = dbRes.result;

    // decrypt messages
    const decriptedPromises = db.map((x) => decryptMessage(x, account, PK));
    const decripted = await Promise.all(decriptedPromises);

    // generate hashes and connect them to messages
    const hashPromises = decripted.map((x) => [crypto.createHash('md5').update(x[6]).digest('hex'), x]);
    const hashes = await Promise.all(hashPromises);

    const currentTime = Date.now();
    // return message values with correct checksums or younger than 10 seconds for blochain latency
    const resultPromisses = hashes.filter(
      (x) => contractChecks.includes(x[0]) || currentTime - x[1][5] < 10000,
    ).map((y) => y[1]);
    // collect all results
    result = await Promise.all(resultPromisses);
  } catch (error) {
    return error;
  }
  return result;
}

// return address balance
export async function getBalance(address) {
  try {
    return await web3.eth.getBalance(address);
  } catch (exceptionVar) {
    return 0;
  }
}
