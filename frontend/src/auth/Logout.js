import React, { useEffect, useState } from 'react';

var serverAddr = 'https://slavka.one';

export function Logout() {
  const [message, setMessage] = useState('');

  useEffect(() => {
    // blacklists token for further use
    async function fetchAuth() {
      const token = sessionStorage.getItem('token');

      if (token !== null) {
        try {
          //sends directive to blacklist JWT
          const response = await fetch(serverAddr + '/api/logout', {
            method: 'post',
            headers: { 'Authorization': 'Bearer ' + token },
            body: { 'token': token }
          })
          const json = await response.json();
          setMessage("Logged out: "+json.result);
        }
        catch (e) {
          console.log(e)
          setMessage("Failed to logout: " + e);
        }
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
