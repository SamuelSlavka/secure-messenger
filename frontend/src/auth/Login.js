import React, { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import Button from 'react-bootstrap/Button'
import Form from 'react-bootstrap/Form'

var serverAddr = 'https://slavka.one';

export function Login() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [result, setResult] = useState('');

    async function onSubmitClick(e) {
        e.preventDefault();

        let opts = {
            'username': username,
            'password': password
        };

        const response = await fetch(serverAddr+'/api/login', {
            method: 'post',
            body: JSON.stringify(opts)
        });

        const token = await response.json();

        if (token.access_token) {
            sessionStorage.setItem('token', token.access_token);
            
            //stores password in session storage
            sessionStorage.setItem('passwdKey', password);                        
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
