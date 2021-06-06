import React, { useEffect, useState } from 'react';
import { authFetch } from ".";

export function Protected() {
  const [message, setMessage] = useState('');

  useEffect(() => {
    async function fetchAuth() {

      const response = await authFetch("http://localhost:5000/api/protected");
      const json = await response.json();

      if (json.status === 401) {
        setMessage("Sorry you aren't authorized!");
        return null;
      }
      else if (json && json.message) {
        setMessage(json.message);
      }

      return json;
    }

    fetchAuth();
  }, []);
  return (
    <h2>Account: {message}</h2>
  );
}
