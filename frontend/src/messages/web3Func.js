import Web3 from 'web3';
var crc32 = require('crc-32');
let web3 = new Web3();

const serverAddr = 'http://192.168.1.11:5000'
web3.setProvider(new web3.providers.HttpProvider('http://192.168.1.21:7545'));

const token = sessionStorage.getItem('token');

//fetch contract address and abi
export async function getContractInfo() {
  const response = await fetch(serverAddr + '/api/info', {
    method: 'post',
    headers: { Authorization: 'Bearer ' + token },
    body: JSON.stringify({})
  })
  const json = await response.json();
  return json;
}

async function initWeb3(info, address) {
  //gets address and abi
  var info = await getContractInfo()

  //creates contract
  var contract = new web3.eth.Contract(JSON.parse(info.abi), info.address);

  //subscribes to event of recieving a message
  contract.events.MessageCreated({ filter: { reciever: address } },
    function (error, result) {
      if (!error) {
        console.log("recieved: " + result);
      }
    });

  return contract;
}

export async function sendMessageToAddr(info, message, sendAddress, recvAddress, sendName, recvName) {
  try {
    const contract = new web3.eth.Contract(JSON.parse(info.abi), info.address);

    var res = await contract.methods.createMessage(message, recvAddress).send({
      to: info.address, // contract address
      from: sendAddress,
      gas: 3000000
    });

    await fetch(serverAddr + '/api/savemessage', {
      method: 'post',
      headers: { Authorization: 'Bearer ' + token },
      body: JSON.stringify({
        recvAddress: recvAddress,
        sendAddress: sendAddress,
        recvName: recvName,
        sendName: sendName,
        timestamp: 1,
        contents: message
      })
    })
  }
  catch (error) {
    return false;
  }
  return res;
}

export async function getMessagesFromAddr(info, recvAddress, sendAddress) {
  try {
    const contract = new web3.eth.Contract(JSON.parse(info.abi), info.address);

    var res = await contract.methods.getMessages(recvAddress, sendAddress).call({
      to: info.address, // contract address
      from: sendAddress,
      gas: 3000000
    });
  }
  catch (error) {
    return error;
  }
  return res;
}

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

export async function getContacts(address) {
  var res = "";
  const token2 = sessionStorage.getItem('token');
  try {
    const response = await fetch(serverAddr + '/api/contacts', {
      method: 'post',
      headers: { Authorization: 'Bearer ' + token2 },
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