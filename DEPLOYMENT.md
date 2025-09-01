# Deployment Guide

## Current Deployment Status

✅ **Frontend**: Deployed to Netlify at https://summer-trip-voting-2026.netlify.app
✅ **Database**: Neon PostgreSQL database connected via Netlify DB
⏳ **Backend**: Ready for deployment (instructions below)

## Database Setup (Neon)

The Neon database has been initialized through Netlify DB. Environment variables are automatically set:
- `NETLIFY_DATABASE_URL` - Connection string for the database
- `NETLIFY_DATABASE_URL_UNPOOLED` - Direct connection string

## Backend Deployment Options

### Option 1: Deploy to Render (Recommended)

1. Go to [Render](https://render.com)
2. Create a new Web Service
3. Connect your GitHub repository (joshuamtm/summer-trip-voting)
4. Configure:
   - **Name**: summer-trip-voting-api
   - **Root Directory**: backend
   - **Build Command**: `npm install`
   - **Start Command**: `node server-neon.js`
   - **Environment Variables**:
     - `DATABASE_URL`: (copy from Netlify environment variables)
     - `PORT`: 5000

### Option 2: Deploy to Railway

1. Go to [Railway](https://railway.app)
2. Create new project from GitHub
3. Select the repository
4. Add PostgreSQL database or use Neon URL
5. Deploy the backend service

### Option 3: Deploy to Vercel (API Routes)

1. Create `api` folder in frontend
2. Move backend logic to API routes
3. Deploy with Vercel

## Environment Variables

### Frontend (.env)
```
REACT_APP_API_URL=https://your-backend-url.com
```

### Backend (.env)
```
DATABASE_URL=postgresql://...  # From Neon/Netlify
PORT=5000
NODE_ENV=production
```

## Testing the Deployment

1. **Test Frontend**: Visit https://carnegie-ai-proposal-mtm.netlify.app
2. **Test API**: Once backend is deployed, update `REACT_APP_API_URL` in Netlify environment variables
3. **Test Database**: Submit a test vote and check results

## Updating the Deployment

### Frontend Updates
```bash
git add .
git commit -m "Your changes"
git push origin main
# Netlify auto-deploys from GitHub
```

### Backend Updates
```bash
git add .
git commit -m "Backend changes"
git push origin main
# Your backend host auto-deploys
```

### Database Schema Updates
Use the Drizzle migration in `backend/db/schema.js` or run SQL directly in Neon dashboard.

## Monitoring

- **Frontend Logs**: https://app.netlify.com/projects/carnegie-ai-proposal-mtm/logs
- **Database**: Access via Neon dashboard
- **Backend Logs**: Check your hosting provider's dashboard

## Troubleshooting

### CORS Issues
- Ensure backend has proper CORS configuration for Netlify domain
- Update `cors` options in `server-neon.js` if needed

### Database Connection
- Check DATABASE_URL is correctly set
- Ensure SSL is configured for production

### API Connection
- Verify REACT_APP_API_URL is set in Netlify environment variables
- Check backend is running and accessible