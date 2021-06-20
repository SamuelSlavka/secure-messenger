import React, { useEffect, useState } from 'react';
import { fetchServer } from '../messages/generalFunc';

export function Logout() {
  const [message, setMessage] = useState('');

  useEffect(() => {
    // blacklists token for further use
    async function fetchAuth() {
      const token = sessionStorage.getItem('token');

      if (token !== null) {
        try {
          //sends directive to blacklist JWT
          const json = await fetchServer('/api/logout', { token: token });

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
