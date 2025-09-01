import React, { useState, useEffect } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import axios from 'axios';
import { TripOption, Rankings } from '../types';
import TripCard from './TripCard';

interface SortableItemProps {
  trip: TripOption;
  rank: number;
}

const SortableItem: React.FC<SortableItemProps> = ({ trip, rank }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: trip.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <TripCard trip={trip} rank={rank} isDraggable={true} />
    </div>
  );
};

const VotingForm: React.FC = () => {
  const [orderedTrips, setOrderedTrips] = useState<TripOption[]>([]);
  const [name, setName] = useState('');
  const [comments, setComments] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    fetchTrips();
  }, []);

  const fetchTrips = async () => {
    try {
      const apiUrl = process.env.REACT_APP_API_URL === '' ? '' : (process.env.REACT_APP_API_URL || 'http://localhost:5000');
      const response = await axios.get(`${apiUrl}/api/trip-options`);
      setOrderedTrips(response.data);
    } catch (error) {
      console.error('Error fetching trips:', error);
      setError('Failed to load trip options');
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setOrderedTrips((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      setError('Please enter your name');
      return;
    }

    setLoading(true);
    setError('');

    const rankings: Rankings = {
      first_choice: orderedTrips[0].id,
      second_choice: orderedTrips[1].id,
      third_choice: orderedTrips[2].id,
    };

    try {
      const apiUrl = process.env.REACT_APP_API_URL === '' ? '' : (process.env.REACT_APP_API_URL || 'http://localhost:5000');
      await axios.post(`${apiUrl}/api/votes`, {
        name: name.trim(),
        rankings,
        comments: comments.trim() || null,
      });
      setSubmitted(true);
    } catch (error: any) {
      if (error.response?.status === 409) {
        setError('You have already submitted a vote with this name');
      } else {
        setError('Failed to submit vote. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
          <h2 className="text-2xl font-bold mb-2">Thank You!</h2>
          <p>Your vote has been successfully submitted.</p>
          <button
            onClick={() => window.location.href = '/results'}
            className="mt-4 bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
          >
            View Results
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-center mb-4 text-gray-800">
        Let's Vote on Our Epic Summer 2026 Adventure! 🗳️
      </h1>
      
      <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
        <h2 className="text-lg font-semibold text-green-800 mb-3">Hey everyone!</h2>
        <p className="text-gray-700 mb-3">
          Jessica and I have been brainstorming about our big group trip for next summer (targeting the second half of August 2026), 
          and we've narrowed it down to three amazing options. Since we want to find something that works for as many people as possible, 
          we built this quick voting app to gather everyone's preferences.
        </p>
        
        <div className="my-4 space-y-2">
          <p className="text-gray-700 font-medium">The three finalists are:</p>
          <p className="text-gray-700">🏡 <strong>Option 1: Berkshires House Rental</strong> - Rent a big house for 2 weeks where people can come and go as their schedules allow.</p>
          <p className="text-gray-700">🥾 <strong>Option 2: Inn-to-Inn AT Hike</strong> - A 10-12 day hiking adventure along the Appalachian Trail through Massachusetts.</p>
          <p className="text-gray-700">🛶 <strong>Option 3: Boundary Waters Canoe Trip</strong> - A week-ish wilderness adventure in Minnesota's Boundary Waters.</p>
        </div>
        
        <p className="text-gray-700 mb-3">
          Check out the detailed descriptions below, rank them in order of your preference (even if you're not 100% sure you can make it), 
          add your name and any comments/concerns/excited reactions, and hit submit!
        </p>
        
        <p className="text-gray-700 italic">
          Remember - expressing interest doesn't lock you in, but it helps us gauge what the group is most excited about. 
          Can't wait to adventure with you all next summer!
        </p>
        
        <p className="text-gray-700 font-semibold mt-3">- J & J</p>
      </div>

      <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-6">
        <p className="text-blue-700">
          <strong>How to Vote:</strong> Drag and drop the trip options below to rank them in order of your preference. 
          Your top choice should be at the top. Click "Show More Details" on each card to see benefits, challenges, and full information.
        </p>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Rank Your Choices (Drag to Reorder)</h2>
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={orderedTrips.map(t => t.id)}
              strategy={verticalListSortingStrategy}
            >
              {orderedTrips.map((trip, index) => (
                <SortableItem key={trip.id} trip={trip} rank={index + 1} />
              ))}
            </SortableContext>
          </DndContext>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="mb-4">
            <label htmlFor="name" className="block text-gray-700 font-semibold mb-2">
              Your Name *
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
              required
            />
          </div>

          <div className="mb-4">
            <label htmlFor="comments" className="block text-gray-700 font-semibold mb-2">
              Comments (Optional)
            </label>
            <textarea
              id="comments"
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              maxLength={500}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
              placeholder="Any additional thoughts or preferences..."
            />
            <p className="text-sm text-gray-500 mt-1">
              {comments.length}/500 characters
            </p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 px-4 rounded font-semibold text-white transition ${
              loading
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {loading ? 'Submitting...' : 'Submit Vote'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default VotingForm;