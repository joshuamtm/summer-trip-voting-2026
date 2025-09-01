const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const { v4: uuidv4 } = require('uuid');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// SQLite database connection
const db = new sqlite3.Database('./votes.db');

// Trip options data
const tripOptions = [
  {
    id: 1,
    title: "Berkshires House Rental",
    description: "A flexible two-week rental of a large house in the Berkshires with room for 8-10 people to come and go as they please",
    details: {
      duration: "Two weeks (flexible arrival/departure)",
      location: "The Berkshires, Massachusetts",
      activities: [
        "Tanglewood concerts",
        "Hiking Mount Greylock",
        "Swimming at local lakes",
        "Theater and arts festivals",
        "Farmers markets",
        "Museum visits"
      ],
      accommodation: "Large rental house with 8-10 person capacity",
      estimatedCost: "$300-500 per person (depending on length of stay)",
      highlights: [
        "World-class cultural events (Tanglewood, Jacob's Pillow, theaters)",
        "Beautiful mountain scenery just 2.5 hours from Boston/NYC",
        "Flexibility to come for any portion of the two weeks",
        "Mix of outdoor activities and cultural experiences",
        "Charming New England towns to explore",
        "Group dinners and gathering spaces in the house"
      ],
      benefits: [
        "Most flexible option - come when you can",
        "Accommodates all fitness levels and interests",
        "Weather-independent activities available",
        "Perfect for mixed group dynamics",
        "Kitchen for group meals and cost savings"
      ],
      challenges: [
        "Peak season means higher costs and crowds",
        "Need cars for getting around the area",
        "Cultural events require advance booking",
        "Group coordination for house logistics"
      ]
    }
  },
  {
    id: 2,
    title: "Appalachian Trail Inn-to-Inn Hike",
    description: "A 10-12 day inn-to-inn hike through the southern Berkshires along the Appalachian Trail, covering 8-12 miles daily with stays in different towns each night",
    details: {
      duration: "10-12 days",
      location: "Appalachian Trail through Massachusetts",
      activities: [
        "Daily hiking (8-12 miles)",
        "Trail town exploration",
        "Summit views",
        "Evening dinners in local restaurants",
        "Historic site visits along the trail"
      ],
      accommodation: "Different Airbnb or inn each night",
      estimatedCost: "$1500-2500 per person",
      highlights: [
        "Iconic Appalachian Trail experience without camping",
        "Mount Greylock summit (highest point in MA)",
        "Mount Everett and spectacular views",
        "Comfortable beds and hot showers each night",
        "Local restaurant dinners in trail towns",
        "1000-2000 feet elevation gain daily for fitness challenge"
      ],
      benefits: [
        "Incredible sense of accomplishment",
        "Strong group bonding through shared challenge",
        "No camping gear needed",
        "Experience multiple Berkshire towns",
        "Potentially car-independent with Ubers/shuttles"
      ],
      challenges: [
        "Requires good physical fitness",
        "Daily hiking commitment rain or shine",
        "Limited flexibility once itinerary is set",
        "Group must maintain similar pace",
        "Weather can significantly impact experience"
      ]
    }
  },
  {
    id: 3,
    title: "Boundary Waters Canoe Adventure",
    description: "A wilderness canoe trip in the Boundary Waters with options for basecamp day trips or touring, adaptable to group comfort level",
    details: {
      duration: "5-7 days",
      location: "Boundary Waters, Minnesota",
      activities: [
        "Canoeing pristine lakes",
        "Portaging between waters",
        "Wildlife observation",
        "Fishing",
        "Swimming",
        "Campfire evenings",
        "Stargazing"
      ],
      accommodation: "Wilderness camping (basecamp or touring)",
      estimatedCost: "$400-700 per person (self-guided with gear rental)",
      highlights: [
        "True wilderness experience in pristine nature",
        "Over 1 million acres of lakes and forests",
        "Complete disconnect from technology",
        "Incredible wildlife (moose, bears, eagles)",
        "August has fewer bugs and perfect water temps",
        "Flexibility between basecamp and touring options"
      ],
      benefits: [
        "Strongest group bonding through wilderness challenges",
        "Self-guided adventure - we set our own pace",
        "More affordable than guided trips",
        "Gear rental available (canoes, paddles, camping equipment)",
        "Unforgettable wilderness immersion",
        "Cooperative nature builds team spirit",
        "Less crowded than many national parks"
      ],
      challenges: [
        "Physical demands of paddling and portaging",
        "Primitive conditions (no showers, basic facilities)",
        "Weather dependent with limited backup options",
        "Some mosquitoes and bugs even in August",
        "Requires advance permit reservations",
        "Need to plan routes and logistics ourselves",
        "Group needs some wilderness/camping experience"
      ]
    }
  }
];

// Initialize database
function initDatabase() {
  db.serialize(() => {
    db.run(`
      CREATE TABLE IF NOT EXISTS votes (
        id TEXT PRIMARY KEY,
        name TEXT UNIQUE NOT NULL,
        first_choice INTEGER NOT NULL,
        second_choice INTEGER NOT NULL,
        third_choice INTEGER NOT NULL,
        comments TEXT,
        submitted_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `, (err) => {
      if (err) {
        console.error('Error creating table:', err);
      } else {
        console.log('Database initialized successfully');
      }
    });
  });
}

// Routes
app.get('/api/trip-options', (req, res) => {
  res.json(tripOptions);
});

app.post('/api/votes', async (req, res) => {
  const { name, rankings, comments } = req.body;

  // Validation
  if (!name || !rankings) {
    return res.status(400).json({ error: 'Name and rankings are required' });
  }

  if (!rankings.first_choice || !rankings.second_choice || !rankings.third_choice) {
    return res.status(400).json({ error: 'All three rankings must be provided' });
  }

  // Check for duplicates in rankings
  const rankValues = [rankings.first_choice, rankings.second_choice, rankings.third_choice];
  if (new Set(rankValues).size !== 3) {
    return res.status(400).json({ error: 'Each trip must have a unique ranking' });
  }

  // Check if all values are 1, 2, or 3
  if (!rankValues.every(val => [1, 2, 3].includes(val))) {
    return res.status(400).json({ error: 'Rankings must be 1, 2, or 3' });
  }

  const id = uuidv4();
  
  db.run(
    `INSERT INTO votes (id, name, first_choice, second_choice, third_choice, comments)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [id, name, rankings.first_choice, rankings.second_choice, rankings.third_choice, comments || null],
    function(err) {
      if (err) {
        if (err.message.includes('UNIQUE constraint failed')) {
          return res.status(409).json({ error: 'A vote has already been submitted with this name' });
        }
        console.error('Error submitting vote:', err);
        return res.status(500).json({ error: 'Failed to submit vote' });
      }
      
      db.get('SELECT * FROM votes WHERE id = ?', [id], (err, row) => {
        if (err) {
          return res.status(500).json({ error: 'Failed to retrieve vote' });
        }
        res.status(201).json(row);
      });
    }
  );
});

app.get('/api/votes', (req, res) => {
  db.all('SELECT * FROM votes ORDER BY submitted_at DESC', [], (err, rows) => {
    if (err) {
      console.error('Error fetching votes:', err);
      return res.status(500).json({ error: 'Failed to fetch votes' });
    }
    res.json(rows);
  });
});

app.get('/api/results', (req, res) => {
  db.all('SELECT * FROM votes', [], (err, votes) => {
    if (err) {
      console.error('Error calculating results:', err);
      return res.status(500).json({ error: 'Failed to calculate results' });
    }
    
    // Calculate rankings
    const results = {
      totalVotes: votes.length,
      tripScores: {},
      firstChoiceCount: {},
      allVotes: votes
    };

    // Initialize counters
    tripOptions.forEach(trip => {
      results.tripScores[trip.id] = 0;
      results.firstChoiceCount[trip.id] = 0;
    });

    // Calculate scores (3 points for 1st, 2 for 2nd, 1 for 3rd)
    votes.forEach(vote => {
      results.tripScores[vote.first_choice] += 3;
      results.tripScores[vote.second_choice] += 2;
      results.tripScores[vote.third_choice] += 1;
      results.firstChoiceCount[vote.first_choice] += 1;
    });

    res.json(results);
  });
});

// Initialize database and start server
initDatabase();

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});