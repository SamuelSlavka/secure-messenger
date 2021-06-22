import React, { useEffect, useState } from 'react';
import UserList from '../messages/UserList';
import MessageList from '../messages/MessageList';
import { getContractInfo, fetchServer } from '../messages/generalFunc';

export default function Protected() {
  const [message, setMessage] = useState({ result: false, username: '', address: '' });
  const [isLoggedIn, setLoggedIn] = useState(false);
  const [state, setState] = useState('userlist');

  const callback = (input) => {
    setState(input.state);
    setMessage(input.message);
  };

  useEffect(() => {
    async function fetchAuth() {
      // fetches useful protected information
      const json = await fetchServer('/api/protected', { }, 'get');

      if (json.status_code === 401 || json.status_code === 403) {
        setMessage({ result: false });
        return false;
      }
      if (json && json.username) {
        const info = await getContractInfo();
        setLoggedIn(true);
        setMessage({
          result: true, username: json.username, address: json.address, info,
        });
        return true;
      }
      return false;
    }

    fetchAuth();
  }, []);

  if (!isLoggedIn) return <h4 key="h4">Sorry you are not authorized</h4>;

  return [
    state === 'userlist'
      ? <UserList key="UserList" args={{ data: message, parent: callback }} />
      : <MessageList key="MessageList" args={{ data: message, parent: callback }} />,
  ];
}
