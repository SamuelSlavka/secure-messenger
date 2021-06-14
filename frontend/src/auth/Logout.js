import React, { useEffect, useState } from 'react';

var serverAddr = 'https://slavka.one';

export function Logout() {
  const [message, setMessage] = useState('');

  useEffect(() => {
    // blacklists token for further use
    async function fetchAuth() {
      const token = await sessionStorage.getItem('token');
      
      if (token !== null) {
        //sends directive to blacklist JWT
        const response = await fetch(serverAddr + '/api/logout', {
          method: 'post',
          headers: { Authorization: 'Bearer ' + token },
          body: { token: token }
        })
        const json = await response.json();

        if (response && response.status === 401) 
          setMessage("Failed to logout.");      
        if (json && json.message) 
          setMessage(json.message);              
      }
      else
        setMessage("You are not logged in");
    }
    fetchAuth();
    sessionStorage.clear();
  }, []);
  return (
    <h2>{message}</h2>
  );
}
