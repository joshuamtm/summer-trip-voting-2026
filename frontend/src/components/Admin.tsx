import React, { useState } from 'react';
import axios from 'axios';

const Admin: React.FC = () => {
  const [password, setPassword] = useState('');
  const [authenticated, setAuthenticated] = useState(false);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const ADMIN_PASSWORD = 'summer2026admin'; // You should change this!

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      setAuthenticated(true);
      setMessage('');
    } else {
      setMessage('Incorrect password');
    }
  };

  const handleClearVotes = async () => {
    if (!window.confirm('Are you sure you want to delete ALL votes? This cannot be undone!')) {
      return;
    }

    setLoading(true);
    try {
      const apiUrl = process.env.REACT_APP_API_URL === '' ? '' : (process.env.REACT_APP_API_URL || 'http://localhost:5000');
      await axios.delete(`${apiUrl}/api/admin/clear-votes`, {
        headers: {
          'X-Admin-Password': ADMIN_PASSWORD
        }
      });
      setMessage('All votes have been cleared successfully!');
    } catch (error) {
      setMessage('Failed to clear votes. Check the console for details.');
      console.error('Error clearing votes:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!authenticated) {
    return (
      <div className="max-w-md mx-auto p-6 mt-20">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h1 className="text-2xl font-bold mb-4">Admin Access</h1>
          <form onSubmit={handleLogin}>
            <div className="mb-4">
              <label htmlFor="password" className="block text-gray-700 font-semibold mb-2">
                Admin Password
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                required
              />
            </div>
            {message && (
              <div className="mb-4 text-red-600 text-sm">{message}</div>
            )}
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
            >
              Login
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>
      
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Database Management</h2>
        
        <div className="space-y-4">
          <div className="border-l-4 border-yellow-400 bg-yellow-50 p-4">
            <p className="text-gray-700 mb-3">
              <strong>Warning:</strong> Clearing votes will permanently delete all submitted votes from the database.
              Make sure to export or save any important data before proceeding.
            </p>
          </div>

          <button
            onClick={handleClearVotes}
            disabled={loading}
            className={`px-6 py-3 rounded font-semibold text-white transition ${
              loading
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-red-600 hover:bg-red-700'
            }`}
          >
            {loading ? 'Clearing...' : 'Clear All Votes'}
          </button>

          {message && (
            <div className={`p-4 rounded ${
              message.includes('success') 
                ? 'bg-green-100 text-green-700' 
                : 'bg-red-100 text-red-700'
            }`}>
              {message}
            </div>
          )}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">Quick Links</h2>
        <div className="space-y-2">
          <a href="/" className="block text-blue-600 hover:text-blue-800">
            → View Voting Page
          </a>
          <a href="/results" className="block text-blue-600 hover:text-blue-800">
            → View Results
          </a>
          <a 
            href="https://app.netlify.com/projects/summer-trip-voting-2026/extensions/neon" 
            target="_blank" 
            rel="noopener noreferrer"
            className="block text-blue-600 hover:text-blue-800"
          >
            → Manage Database (Neon Dashboard) ↗
          </a>
        </div>
      </div>

      <div className="mt-6 text-center">
        <button
          onClick={() => {
            setAuthenticated(false);
            setPassword('');
            setMessage('');
          }}
          className="text-gray-600 hover:text-gray-800 text-sm"
        >
          Logout
        </button>
      </div>
    </div>
  );
};

export default Admin;