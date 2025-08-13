import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage.js";
import { insertWeatherRecordSchema, updateWeatherRecordSchema } from "./schema.js";
import { z } from "zod";
import dotenv from "dotenv";
// Using global fetch (available in Node.js 18+)

// Load environment variables
dotenv.config({ path: '../.env' });

// OpenWeatherMap API integration
const OPENWEATHER_API_KEY = process.env.OPENWEATHER_API_KEY || process.env.VITE_OPENWEATHER_API_KEY || "";
const OPENWEATHER_BASE_URL = "https://api.openweathermap.org/data/2.5";

// YouTube API integration
const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY || "";
const YOUTUBE_BASE_URL = "https://www.googleapis.com/youtube/v3";

interface WeatherApiResponse {
  main: {
    temp: number;
    feels_like: number;
    humidity: number;
  };
  weather: Array<{
    main: string;
    description: string;
  }>;
  wind: {
    speed: number;
  };
  visibility: number;
  name: string;
  coord: {
    lat: number;
    lon: number;
  };
}

interface ForecastApiResponse {
  list: Array<{
    dt: number;
    main: {
      temp_max: number;
      temp_min: number;
    };
    weather: Array<{
      main: string;
      description: string;
    }>;
  }>;
}

async function fetchWeatherData(location: string) {
  try {
    // Check if API key is configured
    if (!OPENWEATHER_API_KEY || OPENWEATHER_API_KEY === "your_openweather_api_key_here") {
      throw new Error("OpenWeatherMap API key is not configured. Please add your API key to the .env file.");
    }

    // Determine if location is coordinates (lat,lon format)
    const coordPattern = /^-?\d+\.?\d*,-?\d+\.?\d*$/;
    let weatherUrl = "";
    
    if (coordPattern.test(location)) {
      const [lat, lon] = location.split(',');
      weatherUrl = `${OPENWEATHER_BASE_URL}/weather?lat=${lat}&lon=${lon}&appid=${OPENWEATHER_API_KEY}&units=metric`;
    } else {
      weatherUrl = `${OPENWEATHER_BASE_URL}/weather?q=${encodeURIComponent(location)}&appid=${OPENWEATHER_API_KEY}&units=metric`;
    }

    const weatherResponse = await fetch(weatherUrl);
    if (!weatherResponse.ok) {
      throw new Error(`Weather API error: ${weatherResponse.status}`);
    }

    const weatherData: WeatherApiResponse = await weatherResponse.json();

    // Fetch 5-day forecast
    const forecastUrl = `${OPENWEATHER_BASE_URL}/forecast?lat=${weatherData.coord.lat}&lon=${weatherData.coord.lon}&appid=${OPENWEATHER_API_KEY}&units=metric`;
    const forecastResponse = await fetch(forecastUrl);
    
    let forecastData: any[] = [];
    if (forecastResponse.ok) {
      const forecast: ForecastApiResponse = await forecastResponse.json();
      // Group forecast by day (take one entry per day at noon)
      const dailyForecasts = forecast.list.filter((_, index) => index % 8 === 0).slice(0, 5);
      forecastData = dailyForecasts.map(day => ({
        date: day.dt * 1000, // Send timestamp instead of formatted string
        highTemp: Math.round(day.main.temp_max),
        lowTemp: Math.round(day.main.temp_min),
        condition: day.weather[0].main,
        description: day.weather[0].description,
      }));
    }

    return {
      location: weatherData.name,
      latitude: weatherData.coord.lat,
      longitude: weatherData.coord.lon,
      temperature: Math.round(weatherData.main.temp),
      feelsLike: Math.round(weatherData.main.feels_like),
      humidity: weatherData.main.humidity,
      windSpeed: Math.round(weatherData.wind.speed * 3.6), // Convert m/s to km/h
      visibility: Math.round(weatherData.visibility / 1000), // Convert m to km
      description: weatherData.weather[0].description,
      condition: weatherData.weather[0].main,
      forecast: forecastData,
    };
  } catch (error) {
    console.error("Weather API error:", error);
    throw new Error("Failed to fetch weather data. Please check the location and try again.");
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  
  // GET /api/weather/:location - Fetch weather and store in database
  app.get("/api/weather/:location", async (req, res) => {
    try {
      const { location } = req.params;
      
      if (!location) {
        return res.status(400).json({ error: "Location is required" });
      }

      const weatherData = await fetchWeatherData(location);
      
      // Store in database (ensure required searchDate is included)
      const record = await storage.createWeatherRecord({
        ...weatherData,
        searchDate: new Date(),
      });
      
      res.json({ weather: weatherData, record });
    } catch (error) {
      console.error("Weather fetch error:", error);
      res.status(500).json({ error: error instanceof Error ? error.message : "Failed to fetch weather data" });
    }
  });

  // POST /api/weather - Create new weather record manually
  app.post("/api/weather", async (req, res) => {
    try {
      console.log('Received request body:', JSON.stringify(req.body, null, 2));
      
      const validatedData = insertWeatherRecordSchema.safeParse(req.body);
      
      if (!validatedData.success) {
        console.error('Validation error:', JSON.stringify(validatedData.error, null, 2));
        return res.status(400).json({ 
          error: "Validation error", 
          details: validatedData.error.errors 
        });
      }
      
      // Basic date validation
      if (validatedData.data.startDate && validatedData.data.endDate) {
        const startDate = new Date(validatedData.data.startDate);
        const endDate = new Date(validatedData.data.endDate);
        if (startDate > endDate) {
          return res.status(400).json({ error: "Start date must be before end date" });
        }
      }

      console.log('Creating record with data:', JSON.stringify(validatedData.data, null, 2));
      const record = await storage.createWeatherRecord(validatedData.data);
      console.log('Record created successfully:', record.id);
      res.json(record);
    } catch (error) {
      console.error("Create weather record error:", error);
      res.status(500).json({ 
        error: error instanceof Error ? error.message : "Failed to create weather record",
        stack: process.env.NODE_ENV === 'development' ? (error as Error).stack : undefined
      });
    }
  });

  // GET /api/weather - Get all weather records
  app.get("/api/weather", async (req, res) => {
    try {
      const records = await storage.getAllWeatherRecords();
      res.json(records);
    } catch (error) {
      console.error("Get weather records error:", error);
      res.status(500).json({ error: "Failed to fetch weather records" });
    }
  });

  // PUT /api/weather/:id - Update weather record
  app.put("/api/weather/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const validatedData = updateWeatherRecordSchema.parse(req.body);
      
      // Basic date validation
      if (validatedData.startDate && validatedData.endDate) {
        const startDate = new Date(validatedData.startDate);
        const endDate = new Date(validatedData.endDate);
        if (startDate > endDate) {
          return res.status(400).json({ error: "Start date must be before end date" });
        }
      }

      const record = await storage.updateWeatherRecord(id, validatedData);
      if (!record) {
        return res.status(404).json({ error: "Weather record not found" });
      }
      
      res.json(record);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Validation error", details: error.errors });
      }
      console.error("Update weather record error:", error);
      res.status(500).json({ error: "Failed to update weather record" });
    }
  });

  // DELETE /api/weather/:id - Delete weather record
  app.delete("/api/weather/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const success = await storage.deleteWeatherRecord(id);
      
      if (!success) {
        return res.status(404).json({ error: "Weather record not found" });
      }
      
      res.json({ success: true });
    } catch (error) {
      console.error("Delete weather record error:", error);
      res.status(500).json({ error: "Failed to delete weather record" });
    }
  });

  // GET /api/weather/export/csv - Export weather data as CSV
  app.get("/api/weather/export/csv", async (req, res) => {
    try {
      const records = await storage.getAllWeatherRecords();
      
      // Simple CSV generation
      const headers = ["Location", "Temperature", "Description", "Date", "Humidity", "Wind Speed"];
      const csvRows = [
        headers.join(","),
        ...records.map(record => [
          `"${record.location}"`,
          record.temperature,
          `"${record.description}"`,
          `"${new Date(record.searchDate).toLocaleDateString()}"`,
          record.humidity || "",
          record.windSpeed || ""
        ].join(","))
      ];
      
      const csvContent = csvRows.join("\n");
      
      res.setHeader("Content-Type", "text/csv");
      res.setHeader("Content-Disposition", "attachment; filename=weather-data.csv");
      res.send(csvContent);
    } catch (error) {
      console.error("Export CSV error:", error);
      res.status(500).json({ error: "Failed to export data" });
    }
  });

  // GET /api/videos/:location - Get YouTube videos for location
  app.get("/api/videos/:location", async (req, res) => {
    try {
      const { location } = req.params;
      
      if (!YOUTUBE_API_KEY) {
        return res.status(503).json({ 
          error: "YouTube API key not configured",
          videos: [] 
        });
      }

      const searchQuery = `${location} travel guide tourism attractions`;
      const youtubeUrl = `${YOUTUBE_BASE_URL}/search?part=snippet&q=${encodeURIComponent(searchQuery)}&type=video&maxResults=6&key=${YOUTUBE_API_KEY}&safeSearch=strict&videoDefinition=high`;

      const response = await fetch(youtubeUrl);
      
      if (!response.ok) {
        throw new Error(`YouTube API error: ${response.status}`);
      }

      const data = await response.json();
      
      const videos = data.items?.map((item: any) => ({
        id: item.id.videoId,
        title: item.snippet.title,
        thumbnail: item.snippet.thumbnails.medium.url,
        channelTitle: item.snippet.channelTitle,
      })) || [];

      res.json({ videos });
    } catch (error) {
      console.error("YouTube API error:", error);
      res.status(500).json({ 
        error: "Failed to fetch videos",
        videos: [] 
      });
    }
  });

  // GET /api/videos/random-travel - Get random travel videos as fallback
  app.get("/api/videos/random-travel", async (req, res) => {
    try {
      if (!YOUTUBE_API_KEY) {
        return res.status(503).json({ 
          error: "YouTube API key not configured",
          videos: [] 
        });
      }

      const randomSearchTerms = [
        "travel destinations 2024",
        "best places to visit",
        "beautiful travel destinations",
        "amazing travel spots",
        "world tourism",
        "travel guide popular destinations"
      ];
      
      const randomQuery = randomSearchTerms[Math.floor(Math.random() * randomSearchTerms.length)];
      const youtubeUrl = `${YOUTUBE_BASE_URL}/search?part=snippet&q=${encodeURIComponent(randomQuery)}&type=video&maxResults=6&key=${YOUTUBE_API_KEY}&safeSearch=strict&videoDefinition=high`;

      const response = await fetch(youtubeUrl);
      
      if (!response.ok) {
        throw new Error(`YouTube API error: ${response.status}`);
      }

      const data = await response.json();
      
      const videos = data.items?.map((item: any) => ({
        id: item.id.videoId,
        title: item.snippet.title,
        thumbnail: item.snippet.thumbnails.medium.url,
        channelTitle: item.snippet.channelTitle,
      })) || [];

      res.json({ videos });
    } catch (error) {
      console.error("YouTube API error:", error);
      res.status(500).json({ 
        error: "Failed to fetch videos",
        videos: [] 
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
