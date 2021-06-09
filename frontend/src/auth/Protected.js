import React, { useEffect, useState } from 'react';
import { authFetch } from ".";
import Button from 'react-bootstrap/Button'
import Form from 'react-bootstrap/Form'
import Web3 from 'web3';

function getPK() {
  var CryptoJS = require("crypto-js");

  var passwdKey = sessionStorage.getItem('passwdKey');
  var pk = localStorage.getItem('privateKey');
  
  if(passwdKey === "" || passwdKey === null)
    return "You are not logged in"
  if(pk === null)
    return "No pk in memmory"

  //decrypts PK
  const bytes =  CryptoJS.AES.decrypt( (pk.toString()), passwdKey);
  return bytes.toString(CryptoJS.enc.Utf8);
}


export function Protected() {
  const [message, setMessage] = useState('');

  useEffect(() => {
    async function fetchAuth() {

      const response = await authFetch("http://192.168.1.11:5000/api/protected");
      const json = await response.json();
      console.log(json.status_code)
      if (json.status_code === 401 || json.status_code === 403) {
        setMessage("Sorry you aren't authorized!");
      }
      else if (json && json.user) {
        setMessage( 'user: '+json.user+' address: '+json.address+' PK: '+ getPK());
      }
    }

    fetchAuth();
  }, []);
  return (
    <div>
    <br />
      <h3>{message}</h3>    
    </div>
  );
}
