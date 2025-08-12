import { z } from "zod";

// Simple schemas without drizzle-orm
export const insertWeatherRecordSchema = z.object({
  location: z.string(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  temperature: z.number(),
  feelsLike: z.number().optional(),
  humidity: z.number().optional(),
  windSpeed: z.number().optional(),
  visibility: z.number().optional(),
  description: z.string(),
  condition: z.string(),
  forecast: z.any().optional(),
  startDate: z.date().optional(),
  endDate: z.date().optional(),
});

export const updateWeatherRecordSchema = insertWeatherRecordSchema.partial();

export type InsertWeatherRecord = z.infer<typeof insertWeatherRecordSchema>;
export type UpdateWeatherRecord = z.infer<typeof updateWeatherRecordSchema>;

export interface WeatherRecord {
  id: string;
  location: string;
  latitude?: number;
  longitude?: number;
  temperature: number;
  feelsLike?: number;
  humidity?: number;
  windSpeed?: number;
  visibility?: number;
  description: string;
  condition: string;
  forecast?: any;
  searchDate: Date;
  startDate?: Date;
  endDate?: Date;
}

export const insertUserSchema = z.object({
  username: z.string(),
  password: z.string(),
});

export type InsertUser = z.infer<typeof insertUserSchema>;

export interface User {
  id: string;
  username: string;
  password: string;
}
