import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Results as ResultsType, TripOption, Vote } from '../types';

const Results: React.FC = () => {
  const [results, setResults] = useState<ResultsType | null>(null);
  const [trips, setTrips] = useState<TripOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [resultsResponse, tripsResponse] = await Promise.all([
        axios.get(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/results`),
        axios.get(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/trip-options`),
      ]);
      setResults(resultsResponse.data);
      setTrips(tripsResponse.data);
    } catch (error) {
      console.error('Error fetching results:', error);
      setError('Failed to load results');
    } finally {
      setLoading(false);
    }
  };

  const getTripTitle = (tripId: number) => {
    const trip = trips.find(t => t.id === tripId);
    return trip?.title || `Trip ${tripId}`;
  };

  const getTripIcon = (tripId: number) => {
    switch (tripId) {
      case 1:
        return '🏡';
      case 2:
        return '🥾';
      case 3:
        return '🛶';
      default:
        return '✈️';
    }
  };

  const getSortedTrips = () => {
    if (!results) return [];
    return Object.entries(results.tripScores)
      .sort(([, a], [, b]) => b - a)
      .map(([id]) => parseInt(id));
  };

  const getPercentage = (count: number) => {
    if (!results || results.totalVotes === 0) return 0;
    return Math.round((count / results.totalVotes) * 100);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-xl">Loading results...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      </div>
    );
  }

  if (!results || results.totalVotes === 0) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <h1 className="text-3xl font-bold text-center mb-8">Voting Results</h1>
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
          No votes have been submitted yet.
        </div>
      </div>
    );
  }

  const sortedTripIds = getSortedTrips();

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-center mb-8">Voting Results</h1>

      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Summary</h2>
          <div className="space-y-2">
            <p className="text-gray-700">
              <span className="font-semibold">Total Votes:</span> {results.totalVotes}
            </p>
            <p className="text-gray-700">
              <span className="font-semibold">Leading Choice:</span>{' '}
              {getTripIcon(sortedTripIds[0])} {getTripTitle(sortedTripIds[0])}
            </p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Overall Rankings</h2>
          <div className="space-y-3">
            {sortedTripIds.map((tripId, index) => (
              <div key={tripId} className="flex items-center justify-between">
                <div className="flex items-center">
                  <span className={`mr-3 font-bold text-lg ${
                    index === 0 ? 'text-yellow-500' :
                    index === 1 ? 'text-gray-400' :
                    'text-orange-600'
                  }`}>
                    #{index + 1}
                  </span>
                  <span className="text-2xl mr-2">{getTripIcon(tripId)}</span>
                  <span className="font-medium">{getTripTitle(tripId)}</span>
                </div>
                <div className="text-right">
                  <div className="font-bold text-lg">{results.tripScores[tripId]} pts</div>
                  <div className="text-sm text-gray-600">
                    {results.firstChoiceCount[tripId]} first choices
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">First Choice Distribution</h2>
        <div className="space-y-3">
          {trips.map(trip => {
            const firstChoices = results.firstChoiceCount[trip.id] || 0;
            const percentage = getPercentage(firstChoices);
            return (
              <div key={trip.id}>
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium">
                    {getTripIcon(trip.id)} {trip.title}
                  </span>
                  <span className="text-sm text-gray-600">
                    {firstChoices} votes ({percentage}%)
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-6">
                  <div
                    className="bg-blue-600 h-6 rounded-full flex items-center justify-center text-white text-xs"
                    style={{ width: `${percentage}%` }}
                  >
                    {percentage > 10 && `${percentage}%`}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">All Votes</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2 px-3">Name</th>
                <th className="text-left py-2 px-3">1st Choice</th>
                <th className="text-left py-2 px-3">2nd Choice</th>
                <th className="text-left py-2 px-3">3rd Choice</th>
                <th className="text-left py-2 px-3">Comments</th>
                <th className="text-left py-2 px-3">Submitted</th>
              </tr>
            </thead>
            <tbody>
              {results.allVotes.map((vote: Vote) => (
                <tr key={vote.id} className="border-b hover:bg-gray-50">
                  <td className="py-2 px-3 font-medium">{vote.name}</td>
                  <td className="py-2 px-3">
                    <span className="text-xl mr-1">{getTripIcon(vote.first_choice)}</span>
                    {getTripTitle(vote.first_choice)}
                  </td>
                  <td className="py-2 px-3">
                    <span className="text-xl mr-1">{getTripIcon(vote.second_choice)}</span>
                    {getTripTitle(vote.second_choice)}
                  </td>
                  <td className="py-2 px-3">
                    <span className="text-xl mr-1">{getTripIcon(vote.third_choice)}</span>
                    {getTripTitle(vote.third_choice)}
                  </td>
                  <td className="py-2 px-3 text-sm text-gray-600">
                    {vote.comments || '-'}
                  </td>
                  <td className="py-2 px-3 text-sm text-gray-600">
                    {new Date(vote.submitted_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-6 text-center">
        <button
          onClick={() => window.location.href = '/'}
          className="bg-blue-600 text-white py-2 px-6 rounded hover:bg-blue-700"
        >
          Back to Voting
        </button>
      </div>
    </div>
  );
};

export default Results;