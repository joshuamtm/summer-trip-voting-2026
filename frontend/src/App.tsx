import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import VotingForm from './components/VotingForm';
import Results from './components/Results';
import './App.css';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <Routes>
          <Route path="/" element={<VotingForm />} />
          <Route path="/results" element={<Results />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
