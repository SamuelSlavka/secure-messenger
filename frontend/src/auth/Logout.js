import React, { useEffect, useState } from 'react';
import { authFetch } from ".";

export function Logout() {
  const [message, setMessage] = useState('');

  useEffect(() => {
    async function fetchAuth() {

      const response = await authFetch("http://localhost:5000/api/logout");
      const json = await response.json();

      if (response.status === 401) {
        setMessage("Failed to logout.");
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
    <h2>{message}</h2>
  );
}
