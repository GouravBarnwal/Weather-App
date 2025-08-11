# Weather Pro Application

A professional full-stack weather application built with React, Express.js, and MongoDB. Features real-time weather data, 5-day forecasts, search history, and complete CRUD operations.

## Features

- 🌤️ Real-time weather search by location (city, zip code, GPS coordinates, landmarks)
- 📍 Automatic location detection using browser geolocation
- 🌡️ Current weather display with temperature, humidity, wind speed, visibility
- 📅 5-day weather forecast with icons
- 📊 Weather search history with export to CSV
- ✏️ Complete CRUD operations for weather records
- 💾 Smart storage system (MongoDB when available, in-memory fallback)

## Technology Stack

**Frontend:**
- React 18 with TypeScript
- Tailwind CSS + shadcn/ui components
- TanStack Query for state management
- Wouter for routing

**Backend:**
- Node.js + Express.js
- MongoDB with Mongoose ODM
- OpenWeatherMap API integration
- RESTful API design

## Setup Instructions

### 1. Install Dependencies
```bash
npm install
```

### 2. Get OpenWeatherMap API Key
1. Go to [OpenWeatherMap API](https://openweathermap.org/api)
2. Sign up for a free account
3. Get your API key from the dashboard

### 3. Environment Variables
The app will ask for the OpenWeatherMap API key when needed. 

For MongoDB connection (optional):
- Set `MONGODB_URI` environment variable to your MongoDB connection string
- Example: `MONGODB_URI=mongodb://localhost:27017/weather_app`
- If not set, the app will use in-memory storage

### 4. MongoDB Setup (Optional)
**For Local MongoDB on Windows:**
```bash
# Start MongoDB service
net start MongoDB

# Or start manually
"C:\Program Files\MongoDB\Server\8.0\bin\mongod.exe" --config "C:\Program Files\MongoDB\Server\8.0\bin\mongod.cfg"
```

**For MongoDB Atlas (Cloud):**
1. Create account at [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a cluster
3. Get connection string
4. Set as `MONGODB_URI`

### 5. Run the Application
```bash
npm run dev
```

The app will automatically:
- Start on port 5000
- Try to connect to MongoDB (if configured)
- Fall back to in-memory storage if MongoDB is unavailable
- Request OpenWeatherMap API key when needed

## API Endpoints

- `GET /api/weather` - Get all weather records
- `GET /api/weather/:location` - Fetch weather for location and store
- `POST /api/weather` - Create new weather record
- `PUT /api/weather/:id` - Update weather record
- `DELETE /api/weather/:id` - Delete weather record
- `GET /api/weather/export/csv` - Export data as CSV

## Usage

1. **Search Weather**: Enter a location or use "My Location" button
2. **View History**: See all previous searches in the sidebar
3. **Manage Records**: Use CRUD operations to add/edit/delete weather data
4. **Export Data**: Download search history as CSV

## Development Notes

- The app uses a smart storage system that automatically detects MongoDB availability
- All CRUD operations work with both MongoDB and in-memory storage
- Date range validation ensures start date ≤ end date
- Location validation supports various input formats
- Responsive design works on desktop and mobile

## About

Built by Gourav Barnwal

---

*A modern weather application with React, Express, MongoDB, and OpenWeatherMap API.*