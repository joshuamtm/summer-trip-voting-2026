import React, { useState } from 'react';
import { TripOption } from '../types';

interface TripCardProps {
  trip: TripOption;
  rank?: number;
  onRankSelect?: (tripId: number, rank: number) => void;
  isDraggable?: boolean;
  dragHandleProps?: any;
}

const TripCard: React.FC<TripCardProps> = ({ trip, rank, onRankSelect, isDraggable = true, dragHandleProps }) => {
  const [expanded, setExpanded] = useState(false);

  const getRankBadgeColor = (rank: number | undefined) => {
    switch (rank) {
      case 1:
        return 'bg-yellow-500';
      case 2:
        return 'bg-gray-400';
      case 3:
        return 'bg-orange-600';
      default:
        return 'bg-gray-200';
    }
  };

  const getIcon = (tripId: number) => {
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

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-4 transition-all hover:shadow-lg">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center flex-1">
          {isDraggable && dragHandleProps && (
            <div 
              {...dragHandleProps}
              className="mr-3 cursor-move p-2 hover:bg-gray-100 rounded"
              title="Drag to reorder"
            >
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
              </svg>
            </div>
          )}
          <span className="text-4xl mr-4">{getIcon(trip.id)}</span>
          <div>
            <h3 className="text-xl font-bold text-gray-800">{trip.title}</h3>
            <p className="text-gray-600 text-sm">{trip.details.location}</p>
          </div>
        </div>
        {rank && (
          <div className={`${getRankBadgeColor(rank)} text-white px-4 py-2 rounded-full font-bold`}>
            #{rank}
          </div>
        )}
      </div>

      <p className="text-gray-700 mb-4">{trip.description}</p>

      <div className="flex flex-wrap gap-2 mb-4">
        <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
          {trip.details.duration}
        </span>
        <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
          {trip.details.estimatedCost}
        </span>
      </div>

      <button
        onClick={() => setExpanded(!expanded)}
        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
      >
        {expanded ? 'Show Less' : 'Show More Details'}
      </button>

      {expanded && (
        <div className="mt-4 space-y-4 border-t pt-4">
          <div>
            <h4 className="font-semibold text-gray-800 mb-2">Activities:</h4>
            <div className="flex flex-wrap gap-2">
              {trip.details.activities.map((activity, index) => (
                <span
                  key={index}
                  className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded"
                >
                  {activity}
                </span>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-gray-800 mb-2">What Makes This Special:</h4>
            <ul className="list-disc list-inside text-gray-700 text-sm space-y-1">
              {trip.details.highlights.map((highlight, index) => (
                <li key={index}>{highlight}</li>
              ))}
            </ul>
          </div>

          {trip.details.benefits && (
            <div>
              <h4 className="font-semibold text-green-700 mb-2">Benefits:</h4>
              <ul className="list-disc list-inside text-gray-700 text-sm space-y-1">
                {trip.details.benefits.map((benefit, index) => (
                  <li key={index}>{benefit}</li>
                ))}
              </ul>
            </div>
          )}

          {trip.details.challenges && (
            <div>
              <h4 className="font-semibold text-orange-700 mb-2">Considerations:</h4>
              <ul className="list-disc list-inside text-gray-700 text-sm space-y-1">
                {trip.details.challenges.map((challenge, index) => (
                  <li key={index}>{challenge}</li>
                ))}
              </ul>
            </div>
          )}

          <div>
            <h4 className="font-semibold text-gray-800 mb-1">Accommodation:</h4>
            <p className="text-gray-700 text-sm">{trip.details.accommodation}</p>
          </div>
        </div>
      )}

      {onRankSelect && !rank && (
        <div className="mt-4 flex gap-2">
          <button
            onClick={() => onRankSelect(trip.id, 1)}
            className="flex-1 bg-yellow-500 text-white py-2 px-4 rounded hover:bg-yellow-600 transition"
          >
            1st Choice
          </button>
          <button
            onClick={() => onRankSelect(trip.id, 2)}
            className="flex-1 bg-gray-400 text-white py-2 px-4 rounded hover:bg-gray-500 transition"
          >
            2nd Choice
          </button>
          <button
            onClick={() => onRankSelect(trip.id, 3)}
            className="flex-1 bg-orange-600 text-white py-2 px-4 rounded hover:bg-orange-700 transition"
          >
            3rd Choice
          </button>
        </div>
      )}
    </div>
  );
};

export default TripCard;