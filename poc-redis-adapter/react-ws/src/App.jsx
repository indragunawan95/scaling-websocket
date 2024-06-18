import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from './Home';
import UserNotifications from './UserNotifications';
import UserNotifications2 from './UserNotifications2';
import UserNotifications3 from './UserNotifications3';
import './App.css';

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/machine/3001/specificUser/:id" element={<UserNotifications />} />
        <Route path="/machine/3002/specificUser/:id" element={<UserNotifications2 />} />
        <Route path="/machine/3003/specificUser/:id" element={<UserNotifications3 />} />
      </Routes>
    </Router>
  );
};

export default App;
