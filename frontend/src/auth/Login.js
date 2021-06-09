import React, { useState } from 'react';
import { login } from ".";
import 'bootstrap/dist/css/bootstrap.min.css';
import Button from 'react-bootstrap/Button'
import Form from 'react-bootstrap/Form'
import web3 from 'web3';


export function Login() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [result, setResult] = useState('');

    async function onSubmitClick(e) {
        e.preventDefault();
        console.log("You pressed login");
        let opts = {
            'username': username,
            'password': password
        };
        console.log(opts);

        const response = await fetch('http://192.168.1.11:5000/api/login', {
            method: 'post',
            body: JSON.stringify(opts)
        });

        const token = await response.json();

        if (token.access_token) {
            login(token);
            var CryptoJS = require("crypto-js");
            
            //stores for session only password for PK encription
            const passwdKey = CryptoJS.AES.encrypt(password, web3.utils.randomHex(32));        
            sessionStorage.setItem('passwdKey', passwdKey);     

            setResult({"class":"SuccessReg","res":"Success"});
        }
        else {
            setResult({"class":"FailReg","res":"Incorrect Username/Password"});
        }
    }

    const handleUsernameChange = (e) => {
        setUsername(e.target.value);
    };

    const handlePasswordChange = (e) => {
        setPassword(e.target.value);
    };

    return (
    <div className="input-form">
    <Form className="input-border">
        <Form.Group controlId="formBasicName" className="input-field" >
        <Form.Label>Username:</Form.Label>
        <Form.Control type="text" value={username}  onChange={handleUsernameChange} placeholder="Enter username" />
        </Form.Group>
    
        <Form.Group controlId="formBasicPassword" className="input-field">
        <Form.Label>Password:</Form.Label>
        <Form.Control type="password" value={password} onChange={handlePasswordChange} placeholder="Password" />
        </Form.Group>
    
        <Button variant="primary" id="submit-button" onClick={onSubmitClick} type="submit">
        Submit
        </Button>
    </Form>
    <div>
        <h3 id={result.class} className="regResult"> {result.res} </h3>
    </div>
    </div >
  );
}
