import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertWeatherRecordSchema, updateWeatherRecordSchema } from "@shared/schema";
import { z } from "zod";

// OpenWeatherMap API integration
const OPENWEATHER_API_KEY = process.env.OPENWEATHER_API_KEY || process.env.VITE_OPENWEATHER_API_KEY || "";
const OPENWEATHER_BASE_URL = "https://api.openweathermap.org/data/2.5";

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
        date: new Date(day.dt * 1000).toLocaleDateString('en-US', { weekday: 'long' }),
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
      
      // Store in database
      const record = await storage.createWeatherRecord(weatherData);
      
      res.json({ weather: weatherData, record });
    } catch (error) {
      console.error("Weather fetch error:", error);
      res.status(500).json({ error: error instanceof Error ? error.message : "Failed to fetch weather data" });
    }
  });

  // POST /api/weather - Create new weather record manually
  app.post("/api/weather", async (req, res) => {
    try {
      const validatedData = insertWeatherRecordSchema.parse(req.body);
      
      // Basic date validation
      if (validatedData.startDate && validatedData.endDate) {
        const startDate = new Date(validatedData.startDate);
        const endDate = new Date(validatedData.endDate);
        if (startDate > endDate) {
          return res.status(400).json({ error: "Start date must be before end date" });
        }
      }

      const record = await storage.createWeatherRecord(validatedData);
      res.json(record);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Validation error", details: error.errors });
      }
      console.error("Create weather record error:", error);
      res.status(500).json({ error: "Failed to create weather record" });
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

  const httpServer = createServer(app);
  return httpServer;
}
