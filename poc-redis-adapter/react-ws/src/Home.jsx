import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Home = () => {
  const [userId, setUserId] = useState('');
  const [machineId, setMachineId] = useState('');
  const navigate = useNavigate();

  const handleConnect = () => {
    if (userId) {
      navigate(`/machine/${machineId}/specificUser/${userId}`);
    }
  };

  return (
    <div className="App">
      <h1>WebSocket Client</h1>
      <div className="form">
        <input
          type="text"
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
          placeholder="Enter User ID"
        />
        <input
          type="text"
          value={machineId}
          onChange={(e) => setMachineId(e.target.value)}
          placeholder="Enter Machine ID"
        />
        <button onClick={handleConnect}>Connect</button>
      </div>
    </div>
  );
};

export default Home;
