import React, { useEffect, useState } from 'react';
import { MessageList } from '../messages/MessageList';
import { UserList } from '../messages/UserList';

const serverAddr = 'http://192.168.1.11:5000'


export function Protected() {
  const token = sessionStorage.getItem('token');
  const [message, setMessage] = useState({ result: false, message: "", user: "", address: "", pk: "" });
  const [isLoggedIn, setLoggedIn] = useState(false);

  var top = ""
  var results = ""

  useEffect(() => {
    async function fetchAuth() {

      const response = await fetch(serverAddr + '/api/protected', {
        method: 'get',
        headers: { Authorization: 'Bearer ' + token }
      })
      const json = await response.json();

      if (json.status_code === 401 || json.status_code === 403) {
        setMessage({ ...message, 'result': false });
        return false;
      }
      else if (json && json.user) {
        setLoggedIn(true);
        setMessage({ ...message, 'result': true, 'user': json.user, 'address': json.address });
        return true;
      }
    }

    fetchAuth();
  }, []);

  if (message.result) {
    const arr = ["user: " + message.user, "address: " + message.address];
    top = arr.map((result, index) => <li key={index}>{result}</li>);
  }
  else {
    results = 'Sorry you are not authorized';
  }

  return [
    isLoggedIn
      ? <UserList />
      : <h4>Sorry you are not authorized</h4>
  ];
}
