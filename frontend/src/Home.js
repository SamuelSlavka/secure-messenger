import React, { useState, useLayoutEffect } from 'react';

export function Home() {
  const [transaction, setTransaction] = useState('');

  async function fetchMyAPI() {
    const response = await fetch('http://192.168.1.11:5000/api/');
    const blocks = await response.json();
    setTransaction ( JSON.stringify(blocks, null, 2) );
  }

  useLayoutEffect(() => {
    fetchMyAPI()
    const interval = setInterval(() => {
      fetchMyAPI()
    }, 5000);
    return () => clearInterval(interval);
  }, []);


  return (
    <div>
      <h2>Latest transaction on ETH:</h2><br />
      <pre>{transaction}</pre>
    </div>
    );
  
}


