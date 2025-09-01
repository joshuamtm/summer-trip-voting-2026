const { neon } = require('@neondatabase/serverless');

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
      estimatedCost: "$1000-1700 per person (guided)",
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
        "Accommodates various skill levels with right planning",
        "Unforgettable wilderness immersion",
        "Cooperative nature builds team spirit",
        "Less crowded than many national parks"
      ],
      challenges: [
        "Physical demands of paddling and portaging",
        "Primitive conditions (no showers, basic facilities)",
        "Weather dependent with limited backup options",
        "Some mosquitoes and bugs even in August",
        "Requires advance permit reservations"
      ]
    }
  }
];

exports.handler = async (event, context) => {
  // Get the path after /.netlify/functions/api
  let path = event.path.replace('/.netlify/functions/api', '');
  // Ensure path starts with /
  if (!path.startsWith('/')) {
    path = '/' + path;
  }
  const method = event.httpMethod;
  
  console.log('Request path:', path, 'Method:', method);
  
  // CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Content-Type': 'application/json',
  };

  // Handle OPTIONS request
  if (method === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: '',
    };
  }

  // Initialize database connection
  const sql = neon(process.env.NETLIFY_DATABASE_URL);

  // Initialize database tables
  async function initDatabase() {
    try {
      await sql`
        CREATE TABLE IF NOT EXISTS votes (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          name TEXT UNIQUE NOT NULL,
          first_choice INTEGER NOT NULL,
          second_choice INTEGER NOT NULL,
          third_choice INTEGER NOT NULL,
          comments TEXT,
          submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `;
    } catch (error) {
      console.error('Error initializing database:', error);
    }
  }

  await initDatabase();

  // Route handling - handle both /trip-options and /api/trip-options
  if ((path === '/trip-options' || path === '/api/trip-options') && method === 'GET') {
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(tripOptions),
    };
  }

  if ((path === '/votes' || path === '/api/votes') && method === 'POST') {
    try {
      const { name, rankings, comments } = JSON.parse(event.body);

      // Validation
      if (!name || !rankings) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: 'Name and rankings are required' }),
        };
      }

      if (!rankings.first_choice || !rankings.second_choice || !rankings.third_choice) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: 'All three rankings must be provided' }),
        };
      }

      const rankValues = [rankings.first_choice, rankings.second_choice, rankings.third_choice];
      if (new Set(rankValues).size !== 3) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: 'Each trip must have a unique ranking' }),
        };
      }

      if (!rankValues.every(val => [1, 2, 3].includes(val))) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: 'Rankings must be 1, 2, or 3' }),
        };
      }

      const result = await sql`
        INSERT INTO votes (name, first_choice, second_choice, third_choice, comments)
        VALUES (${name.trim()}, ${rankings.first_choice}, ${rankings.second_choice}, ${rankings.third_choice}, ${comments || null})
        RETURNING *
      `;

      return {
        statusCode: 201,
        headers,
        body: JSON.stringify(result[0]),
      };
    } catch (error) {
      if (error.message && error.message.includes('duplicate key')) {
        return {
          statusCode: 409,
          headers,
          body: JSON.stringify({ error: 'A vote has already been submitted with this name' }),
        };
      }
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: 'Failed to submit vote' }),
      };
    }
  }

  if ((path === '/votes' || path === '/api/votes') && method === 'GET') {
    try {
      const allVotes = await sql`SELECT * FROM votes ORDER BY submitted_at DESC`;
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(allVotes),
      };
    } catch (error) {
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: 'Failed to fetch votes' }),
      };
    }
  }

  if ((path === '/results' || path === '/api/results') && method === 'GET') {
    try {
      const allVotes = await sql`SELECT * FROM votes`;
      
      const results = {
        totalVotes: allVotes.length,
        tripScores: {},
        firstChoiceCount: {},
        allVotes: allVotes
      };

      tripOptions.forEach(trip => {
        results.tripScores[trip.id] = 0;
        results.firstChoiceCount[trip.id] = 0;
      });

      allVotes.forEach(vote => {
        results.tripScores[vote.first_choice] = (results.tripScores[vote.first_choice] || 0) + 3;
        results.tripScores[vote.second_choice] = (results.tripScores[vote.second_choice] || 0) + 2;
        results.tripScores[vote.third_choice] = (results.tripScores[vote.third_choice] || 0) + 1;
        results.firstChoiceCount[vote.first_choice] = (results.firstChoiceCount[vote.first_choice] || 0) + 1;
      });

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(results),
      };
    } catch (error) {
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: 'Failed to calculate results' }),
      };
    }
  }

  return {
    statusCode: 404,
    headers,
    body: JSON.stringify({ error: 'Not found' }),
  };
};