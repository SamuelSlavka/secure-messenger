import Web3 from 'web3';
var crc32 = require('crc-32');
let web3 = new Web3();

const serverAddr = 'http://192.168.1.11:5000'
web3.setProvider(new web3.providers.HttpProvider('http://192.168.1.21:7545'));

const token = sessionStorage.getItem('token');

//fetch contract address and abi
async function getContractInfo() { 
  const response = await fetch(serverAddr + '/api/info', {
    method: 'post',
    headers: { Authorization: 'Bearer ' + token }
  })
  const json = await response.json();
  return json;
}

async function initWeb3(address) {
    //gets address and abi
    var info = await getContractInfo()
    //creates contract
    var contract = new web3.eth.Contract(JSON.parse(info.abi),info.address);
  
    //subscribes to event of recieving a message
    contract.events.MessageCreated( {filter: {reciever: address}},
        function(error, result) {
        if (!error){
          console.log(result);
        }
    });
  
    return contract;
  }
  
  async function sendMessagesToAddr(message,myaddr, send) {
    var contract = await initWeb3(myaddr);
    await contract.createMessage(message,send).send();
    return true;
  }

async function getMessagesFromAddr(recv, send) {
    var contract = await initWeb3(recv);
    var res = await contract.methods.getMessages(recv, send).call()
    
    //return numbers.map((result) =>  <li>{result}</li>);
    return "address";
}

export async function getBalance(address) {
  var balance;
  try {
    var balance = await web3.eth.getBalance(address);
  }
  catch (exception_var) {
    balance=0;
  }
  finally {
    return balance;
  }    
}



export function getPK() {
  var CryptoJS = require("crypto-js");

  var passwdKey = sessionStorage.getItem('passwdKey');
  var pk = localStorage.getItem('privateKey');

  if (passwdKey === "" || passwdKey === null)
    return "You are not logged in"
  if (pk === null)
    return "No pk in memmory"

  //decrypts PK
  const bytes = CryptoJS.AES.decrypt((pk.toString()), passwdKey);
  return bytes.toString(CryptoJS.enc.Utf8);
}