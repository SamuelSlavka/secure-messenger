import React, { useEffect, useState } from 'react';
import { UserList } from '../messages/UserList';
import { getContractInfo, fetchServer } from '../messages/generalFunc';

export function Protected() {

  const [message, setMessage] = useState({ result: false, username: "", address: ""});
  const [isLoggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    async function fetchAuth() {
      //fetches useful protected information
      const json = await fetchServer('/api/protected', { }, 'get');      

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
