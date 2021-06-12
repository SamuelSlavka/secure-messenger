import React, { useEffect, useState } from 'react';
import { UserList } from '../messages/UserList';
import { getContractInfo } from '../messages/web3Func';

const serverAddr = 'http://192.168.1.11:5000'


export function Protected() {

  const [message, setMessage] = useState({ result: false, username: "", address: ""});
  const [isLoggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    async function fetchAuth() {


      const token = sessionStorage.getItem('token');

      const response = await fetch(serverAddr + '/api/protected', {
        method: 'get',
        headers: { Authorization: 'Bearer ' + token }
      })
      const json = await response.json();

      if (json.status_code === 401 || json.status_code === 403) {
        setMessage({result: false });
        return false;
      }
      else if (json && json.username) {
        const info = await getContractInfo();
        setLoggedIn(true);
        setMessage({ result: true, username: json.username, address: json.address, info:info });
        return true;
      }
    }

    fetchAuth();
  }, []);

  return [
    isLoggedIn
      ? <UserList key="UserList" props={message}/>
      : <h4 key='h4'>Sorry you are not authorized</h4>
  ];
}
