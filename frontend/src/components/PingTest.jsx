import { useEffect, useState } from 'react';

export function PingTest() {
  const [message, setMessage] = useState('Loading...');

  useEffect(() => {
    fetch('http://localhost:8080/api/ping')
      .then((res) => res.json())
      .then((data) => setMessage(data.data)) // pong が返ってくる
      .catch((err) => {
        console.error(err);
        setMessage('Error fetching ping');
      });
  }, []);

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
      <h2>Ping API Test</h2>
      <p>Response: {message}</p>
    </div>
  );
}

console.log('PingTest import check:', PingTest);
