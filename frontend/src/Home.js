import React, { useState, useLayoutEffect } from 'react';

var serverAddr = 'https://slavka.one'
serverAddr = 'http://192.168.1.11:5000'

export function Home() {
  const [transaction, setTransaction] = useState('');

  async function fetchMyAPI() {
    const response = await fetch(serverAddr+'/api/');
    const blocks = await response.json();
    setTransaction ( JSON.stringify(blocks, null, 2) );
  }

  useLayoutEffect(() => {
      fetchMyAPI();
  }, []);

  return (
    <div>
      <h2>Latest transaction on ETH:</h2><br />
      <pre>{transaction}</pre>
    </div>
    );
  
}