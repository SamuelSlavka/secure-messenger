import Web3 from 'web3';
import { provider } from '../constants';
import { getPK, getPublicKey, fetchServer } from './generalFunc';

const EthCrypto = require('eth-crypto');
const crypto = require('crypto');


let web3 = new Web3();

web3.setProvider(new web3.providers.WebsocketProvider(provider));


async function encryptMessage(message, recvPublic, PK){
  const signature = EthCrypto.sign(
    PK,
    EthCrypto.hash.keccak256(message)
  );

  //sending checksum to blockchain
  const payload = {
    message: message,
    signature
  };

  //encrypted data for db storage
  const encrypted = await EthCrypto.encryptWithPublicKey(
    recvPublic.result,
    JSON.stringify(payload)
  );

  return EthCrypto.cipher.stringify(encrypted);   
}

async function decryptMessage(message, myAddress,PK){
  if(myAddress === message[2])
    message[6] = message[7]

  const encryptedObject = EthCrypto.cipher.parse(message[6]);

  const decrypted = await EthCrypto.decryptWithPrivateKey( PK, encryptedObject );

  const decryptedPayload = JSON.parse(decrypted);

  //TODO check signature
  //const senderAddress = EthCrypto.recover(
  //  decryptedPayload.signature,
  //  EthCrypto.hash.keccak256(decryptedPayload.message)
  //);

  message[6] = decryptedPayload.message    
  return message;
}

//encrypt message and send to db
//create checksum of the message and send to blockchain
export async function sendMessageToAddr(info, message, sendAddress, recvAddress, sendName, recvName) {
  try {
    const PK = getPK();

    // == ETH ==    
    //checksum for blckchain storage
    const checksum = crypto.createHash('md5').update(message).digest("hex");

    // Add account from private key
    web3.eth.accounts.wallet.add(PK)
    const from = web3.eth.accounts.wallet[0].address;
    
    //contract instance
    const contract = new web3.eth.Contract(JSON.parse(info.abi), info.address);
    const transaction = contract.methods.createMessage(checksum, recvAddress);

    //estimate cost
    let estimate = await transaction.estimateGas({ from: from });
    estimate = Math.round(estimate * 1.5);

    var result = transaction.send({
      from: from,
      to: info.address,
      gas: estimate,
    })
   
    // == DB ==
    //gets public keys for encrypting
    let [recvPublic, sendPublic] = await Promise.all([
      getPublicKey(recvName, recvAddress),
      getPublicKey(sendName, sendAddress)
    ]);

    //creates two encryptions so that both sides can read later on
    let [recvEncrypted, sendEncrypted] = await Promise.all([
      encryptMessage(message, recvPublic, PK),
      encryptMessage(message, sendPublic, PK)
    ]);

    //save transaction to psql db
    fetchServer( '/api/savemessage',{
      recvAddress: recvAddress,
      sendAddress: sendAddress,
      recvName: recvName,
      sendName: sendName,
      timestamp: Date.now(),
      recvContents: recvEncrypted,
      sendContents: sendEncrypted
    });
  }
  catch (error) {
    console.log(error)
    return { 'Error': true, 'body': error };
  }
  return { 'Error': false, 'body': result };
}

//get encrypted messages from db and checksums from blockchain
//decrypt and check mesaages then return
export async function getMessagesFromAddr(info, recvAddress, sendAddress) {
  let result = []
  try {
    const PK = getPK();

    //create contract instance
    const contract = new web3.eth.Contract(JSON.parse(info.abi), info.address);
    // unlock wallet
    web3.eth.accounts.wallet.add(PK)
    const account = web3.eth.accounts.wallet[0].address
    
    
    let [contractRes, dbRes] = await Promise.all([
      //call get method with wallet
      contract.methods.getLastMessages(recvAddress, sendAddress,0,10).call({ from: account }),
      //fetch same mesasges form db
      fetchServer( '/api/getmessages', { recvAddress: recvAddress, sendAddress: sendAddress, offset: 0, count: 10 })
    ]);
    
    const contractChecks = Array.from(contractRes, x => x[0]).filter(x => x !== "");
    
    let db = dbRes.result;    
    
    console.log(contractRes);
    console.log(db);

    for(let i=0; i < db.length; i++){
      let decr = await decryptMessage(db[i], account, PK);      
      //get checksum from decrypted message
      let decrChsum = crypto.createHash('md5').update(decr[6]).digest("hex");      
      
      //compare with smart contract output
      if (contractChecks.includes(decrChsum))
      result.push(decr);
    }
  }
  catch (error) {
    console.log(error);
    return error;
  }
  return result;
}


//return address balance
export async function getBalance(address) {
  var balance;
  try {
    balance = await web3.eth.getBalance(address);
  }
  catch (exception_var) {
    balance = 0;
  }
  finally {
    return balance;
  }
}
