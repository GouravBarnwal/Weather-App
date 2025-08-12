Gourav's Weather App
A modern weather application built with React, TypeScript, and Node.js. Get real-time forecasts, search locations, and toggle dark/light mode. Responsive design for all devices.

- Real-time weather data
- 7-day forecast
- Location search
- Dark/Light mode
- Responsive design
- Interactive weather charts

- Frontend: React, TypeScript, Vite, TailwindCSS
- Backend: Node.js, Express.js
- Database: MongoDB Atlas for cloud storage and everyones access

# 1. Clone the repository

```bash
git clone https://github.com/your-username/weather-app.git
cd weather-app
```

# 2. Install Dependencies

# Frontend
```bash
cd client
npm install
```

# Backend
```bash
cd ../server
npm install
```

# 3. Environment Setup

Create a `.env` file in the `server` directory:

```env
MONGODB_URI=your_mongodb_connection_string
PORT=3001
NODE_ENV=development
```

# 4. Run the Application

# Development Mode

1. Start the backend server:
```bash
cd server
npm run dev
```

2. In a new terminal, start the frontend:
```bash
cd client
npm run dev
```

Visit `http://localhost:5173` in your browser.

# Production Build

1. Build the frontend:
```bash
cd client
npm run build
```

2. Start the production server:
```bash
cd ../server
npm start
```