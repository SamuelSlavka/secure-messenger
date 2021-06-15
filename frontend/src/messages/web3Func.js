import Web3 from 'web3';
const EthCrypto = require('eth-crypto');
const crypto = require('crypto');

let web3 = new Web3();

var serverAddr = 'https://slavka.one';

web3.setProvider(new web3.providers.WebsocketProvider('wss://rinkeby.infura.io/ws/v3/1e87c1070ba04d9a8921909bd0f76091'));


//fetch contract address and abi
export async function getContractInfo() {
  const token = sessionStorage.getItem('token');
  const response = await fetch(serverAddr + '/api/info', {
    method: 'post',
    headers: { Authorization: 'Bearer ' + token },
    body: JSON.stringify({})
  })
  const json = await response.json();
  return json;
}

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

  const decrypted = await EthCrypto.decryptWithPrivateKey(
    PK,
    encryptedObject
  );

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
    // == DB ==
    const PK = getPK();
    //creates two encryptions so that both sides can read later on
    
    const recvPublic = await getPublicKey(recvName, recvAddress)
    const recvEncrypted = await encryptMessage(message, recvPublic, PK)
    const sendPublic = await getPublicKey(sendName, sendAddress)
    const sendEncrypted = await encryptMessage(message, sendPublic, PK)


    const token = sessionStorage.getItem('token');
    //save transaction to psql db
    await fetch(serverAddr + '/api/savemessage', {
      method: 'post',
      headers: { Authorization: 'Bearer ' + token },
      body: JSON.stringify({
        recvAddress: recvAddress,
        sendAddress: sendAddress,
        recvName: recvName,
        sendName: sendName,
        timestamp: recvAddress,
        recvContents: recvEncrypted,
        sendContents: sendEncrypted
      })
    });

    // == ETH ==    
    const account = web3.eth.accounts.privateKeyToAccount(PK)
    //checksum for blckchain storage
    const checksum = crypto.createHash('md5').update(message).digest("hex");

    const contract = new web3.eth.Contract(JSON.parse(info.abi), info.address);
    const transaction = contract.methods.createMessage(checksum, recvAddress);

    //message params
    const options = {
      to: info.address,
      data: transaction.encodeABI(),
      gas: await transaction.estimateGas({ from: account.address }),
      gasPrice: await web3.eth.getGasPrice() 
    };

    //check if account has enought founds
    const balance = await web3.eth.getBalance(sendAddress);
    const gasPrice = await web3.eth.getGasPrice();
    const limit = await web3.eth.estimateGas(options);
    if (balance < (gasPrice * limit)) {
      console.log('cost: ' + gasPrice * limit);
      console.log('balance: ' + balance);
      return { 'Error': false, 'body': 'Not enought founds' };
    }

    // sign transaction
    const signed = await web3.eth.accounts.signTransaction(options, PK);
    // get result
    var receipt = await web3.eth.sendSignedTransaction(signed.rawTransaction);
  }
  catch (error) {
    console.log(error)
    return { 'Error': true, 'body': error };
  }
  return { 'Error': false, 'body': receipt };
}

//get encrypted messages from db and checksums from blockchain
//decrypt and check mesaages then return
export async function getMessagesFromAddr(info, recvAddress, sendAddress) {
  try {
    const token = sessionStorage.getItem('token');
    const PK = getPK();

    //create contract instance
    const contract = new web3.eth.Contract(JSON.parse(info.abi), info.address);
    // unlock wallet
    web3.eth.accounts.wallet.add(PK)
    const account = web3.eth.accounts.wallet[0].address
    //call get method with wallet
    const contractRes = await contract.methods.getMessages(recvAddress, sendAddress).call({ from: account });
    var contractChecks = Array.from(contractRes, x => x[0]);

    //fetch same mesasges form db
    var res = await fetch(serverAddr + '/api/getmessages', {
      method: 'post',
      headers: { Authorization: 'Bearer ' + token },
      body: JSON.stringify({
        recvAddress: recvAddress,
        sendAddress: sendAddress
      })
    });
    const dbRes = await res.json();

    let db = dbRes.result;
    var result = []

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

//decrypts PK
export function getPK() {
  var CryptoJS = require("crypto-js");
  var res = "";
  try {
    const passwdKey = sessionStorage.getItem('passwdKey');
    var pk = localStorage.getItem('privateKey');
    const bytes = CryptoJS.AES.decrypt((pk.toString()), passwdKey);
    res = bytes.toString(CryptoJS.enc.Utf8);
  }
  catch (exception_var) {
    res = "No pk found";
  }
  finally {
    return res;
  }
}

//returns list of usesr, that addres has communicated with
export async function getContacts(address) {
  var res = "";
  const token = sessionStorage.getItem('token');
  try {
    const response = await fetch(serverAddr + '/api/contacts', {
      method: 'post',
      headers: { Authorization: 'Bearer ' + token },
      body: JSON.stringify({ address: address })
    })
    res = await response.json();
  }
  catch (exception_var) {
    res = "No contacts found";
  }
  finally {
    return res;
  }
}

//reqestes founds
export async function askForMoney(address) {
  var res = "Founds transfered";
  const token = sessionStorage.getItem('token');
  try {
    const response = await fetch(serverAddr + '/api/poor', {
      method: 'post',
      headers: { Authorization: 'Bearer ' + token },
      body: JSON.stringify({ address: address })
    })
    res = await response.json();
  }
  catch (exception_var) {
    console.log(exception_var)
    res = "No founds left";
  }
  finally {
    return res;
  }
}

//return public key of adress
export async function getPublicKey(username, address) {
  var res = "";
  const token = sessionStorage.getItem('token');
  try {
    const response = await fetch(serverAddr + '/api/public', {
      method: 'post',
      headers: { Authorization: 'Bearer ' + token },
      body: JSON.stringify({
        username: username,
        address: address
      })
    })
    res = await response.json();
  }
  catch (exception_var) {
    console.log(exception_var)
    res = "No pulic key found";
  }
  finally {
    return res;
  }
}

//return address for username
export async function getAddressFromName(username) {
  var res = "";
  const token = sessionStorage.getItem('token');
  try {
    const response = await fetch(serverAddr + '/api/getUserAddress', {
      method: 'post',
      headers: { Authorization: 'Bearer ' + token },
      body: JSON.stringify({
        username: username
      })
    })
    let ret = await response.json();
    res = ret.result;
  }
  catch (exception_var) {
    console.log(exception_var)
    res = "";
  }
  finally {
    return res;
  }
}

//return public key of adress
export async function isUserRegistred(username, address) {
  var res = false;
  const token = sessionStorage.getItem('token');
  try {
    const response = await fetch(serverAddr + '/api/isValid', {
      method: 'post',
      headers: { Authorization: 'Bearer ' + token },
      body: JSON.stringify({
        username: username,
        address: address
      })
    })
    let ret = await response.json();
    console.log(ret)
    if(ret.result === 1)
      res = true;
  }
  catch (exception_var) {
    console.log(exception_var)
    res = false;
  }
  finally {
    return res;
  }
}