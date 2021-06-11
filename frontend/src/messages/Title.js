import React, { useEffect, useState } from 'react';
const serverAddr = 'http://192.168.1.11:5000';

export function Title() {
  const [message, setMessage] = useState('');

  useEffect(() => {
    // blacklists token for further use
    async function fetchAuth() {
      const token = await sessionStorage.getItem('token');
      setMessage("Title");
    }
    fetchAuth();
  }, []);
  return (
    <h2>{message}</h2>
  );
}
