# Summer Trip Voting App

A web application for friend groups to vote on summer trip options using ranked choice voting.

🌐 **Live Site**: https://summer-trip-voting-2026.netlify.app  
📦 **GitHub Repository**: https://github.com/joshuamtm/summer-trip-voting-2026

## Trip Options

1. **Berkshires House Rental**: Two-week flexible stay in a large house for 8-10 people
2. **Appalachian Trail Inn-to-Inn Hike**: 10-12 day hike with nightly inn stays
3. **Boundary Waters Canoe Adventure**: 5-7 day wilderness canoe trip

## Features
- **Drag-and-Drop Ranking**: Intuitive interface to rank preferences
- **Rich Trip Details**: Expandable cards with activities, highlights, and costs
- **Vote Submission**: Name-based voting with optional comments
- **Results Dashboard**: Real-time results with scores, distributions, and all votes
- **Mobile Responsive**: Works on all devices
- **Duplicate Prevention**: One vote per person

## Tech Stack

- **Frontend**: React with TypeScript, Tailwind CSS, @dnd-kit for drag-and-drop
- **Backend**: Node.js with Express
- **Database**: SQLite (local) or PostgreSQL (production)
- **APIs**: RESTful endpoints for votes and results

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm

### Installation

1. Clone the repository:
```bash
git clone [your-repo-url]
cd summer-trip-voting
```

2. Install backend dependencies:
```bash
cd backend
npm install
```

3. Install frontend dependencies:
```bash
cd ../frontend
npm install
```

### Running the Application

1. Start the backend server:
```bash
cd backend
npm start
```
The server will run on http://localhost:5000

2. In a new terminal, start the frontend:
```bash
cd frontend
npm start
```
The app will open at http://localhost:3000

## Usage

1. **View Trip Options**: Browse the three trip options with detailed information
2. **Rank Your Choices**: Drag and drop the cards to order them by preference (1st, 2nd, 3rd)
3. **Submit Your Vote**: Enter your name and optional comments, then submit
4. **View Results**: Click "View Results" to see the current standings and all votes

## API Endpoints

- `GET /api/trip-options` - Get all trip options
- `POST /api/votes` - Submit a vote
- `GET /api/votes` - Get all votes
- `GET /api/results` - Get aggregated results

## Database Schema

```sql
votes {
  id: UUID
  name: string (unique)
  first_choice: integer (1-3)
  second_choice: integer (1-3)
  third_choice: integer (1-3)
  comments: text (optional)
  submitted_at: timestamp
}
```

## Scoring System

- 1st choice: 3 points
- 2nd choice: 2 points
- 3rd choice: 1 point

## Deployment

### For Production with PostgreSQL:

1. Set up a PostgreSQL database
2. Update the `.env` file with your database URL:
```
DATABASE_URL=postgresql://username:password@host:port/database
NODE_ENV=production
```

### Deploy to Netlify/Vercel:

1. Build the frontend:
```bash
cd frontend
npm run build
```

2. Deploy the build folder to your hosting service

3. Deploy the backend to a service like Railway, Render, or Heroku

## Future Enhancements

- User authentication for vote editing
- Email notifications for new votes
- Calendar integration for availability
- Budget calculator per trip
- Photo galleries
- Discussion threads
- PDF export of results

## License

MIT