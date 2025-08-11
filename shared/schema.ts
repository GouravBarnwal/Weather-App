import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, real, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const weatherRecords = pgTable("weather_records", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  location: text("location").notNull(),
  latitude: real("latitude"),
  longitude: real("longitude"),
  temperature: real("temperature").notNull(),
  feelsLike: real("feels_like"),
  humidity: real("humidity"),
  windSpeed: real("wind_speed"),
  visibility: real("visibility"),
  description: text("description").notNull(),
  condition: text("condition").notNull(),
  forecast: jsonb("forecast"),
  searchDate: timestamp("search_date").defaultNow().notNull(),
  startDate: timestamp("start_date"),
  endDate: timestamp("end_date"),
});

export const insertWeatherRecordSchema = createInsertSchema(weatherRecords).omit({
  id: true,
  searchDate: true,
});

export const updateWeatherRecordSchema = createInsertSchema(weatherRecords).omit({
  id: true,
  searchDate: true,
}).partial();

export type InsertWeatherRecord = z.infer<typeof insertWeatherRecordSchema>;
export type UpdateWeatherRecord = z.infer<typeof updateWeatherRecordSchema>;
export type WeatherRecord = typeof weatherRecords.$inferSelect;

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
