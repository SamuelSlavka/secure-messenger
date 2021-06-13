import React, { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import Button from 'react-bootstrap/Button'
import Form from 'react-bootstrap/Form'
import Web3 from 'web3'


var serverAddr = 'https://slavka.one'
serverAddr = 'http://192.168.1.11:5000'

async function loadBlockchainData(password) {
    const web3 = new Web3('https://rinkeby.infura.io/v3/1e87c1070ba04d9a8921909bd0f76091');
    //create account
    const acc = web3.eth.accounts.create(web3.utils.randomHex(32));
    return acc;
}

export function Register() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [result, setResult] = useState('');
    const [className, setClassName] = useState('');
    var CryptoJS = require("crypto-js");

    async function onSubmitClick(e) {
        e.preventDefault();
        let opts = {
            'username': username,
            'password': password
        };

        const response = await fetch(serverAddr + '/api/register', {
            method: 'post',
            body: JSON.stringify(opts)
        });

        const token = await response.json();

        if (token.access_token) {
            sessionStorage.setItem('token', token.access_token);

            const acc = await loadBlockchainData(username);
            opts = {
                'address': acc.address
            };
            console.log(acc.address)
            console.log(acc.privateKey)
            //fetch save account address in server
            await fetch(serverAddr + '/api/saveAddress', {
                method: 'post',
                body: JSON.stringify(opts),
                headers: { Authorization: 'Bearer ' + token.access_token }
            })

            // stores encripterd private key in local storage   
            localStorage.setItem('privateKey', (CryptoJS.AES.encrypt(acc.privateKey, password )));
            sessionStorage.setItem('passwdKey', password);

            setResult("Your private key was encrypted and saved localy. If you loose it, you loose acces to your account. You can view it in the Account tab.");
            setClassName("SuccessReg");
        }
        else {
            setResult("Username already taken");
            setClassName("FailReg");
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
                    <Form.Control type="text" value={username} onChange={handleUsernameChange} placeholder="Enter username" autoComplete="new-password" />
                </Form.Group>

                <Form.Group controlId="formBasicPassword" className="input-field">
                    <Form.Label>Password:</Form.Label>
                    <Form.Control type="password" value={password} onChange={handlePasswordChange} placeholder="Password" autoComplete="new-password" />
                </Form.Group>

                <Button variant="primary" id="submit-button" onClick={onSubmitClick} type="submit">
                    Submit
                </Button>
            </Form>
            <div>
                <h3 id={className} className="regResult"> {result} </h3>
            </div>
        </div >
    );
}
