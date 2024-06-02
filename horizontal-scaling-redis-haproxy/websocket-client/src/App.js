import React, { useEffect } from 'react';

function App() {
  useEffect(() => {
    const ws = new WebSocket("ws://localhost:8080");
    ws.onopen = () => ws.send("Hello! I'm client");
    ws.onmessage = message => console.log(`Received: ${message.data}`);
  }, []);

  return (
    <div className="App">
      <h1>WebSocket Client</h1>
    </div>
  );
}

export default App;