import { type User, type InsertUser, type WeatherRecord, type InsertWeatherRecord, type UpdateWeatherRecord } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Weather records CRUD operations
  createWeatherRecord(record: InsertWeatherRecord): Promise<WeatherRecord>;
  getAllWeatherRecords(): Promise<WeatherRecord[]>;
  getWeatherRecord(id: string): Promise<WeatherRecord | undefined>;
  updateWeatherRecord(id: string, updates: UpdateWeatherRecord): Promise<WeatherRecord | undefined>;
  deleteWeatherRecord(id: string): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private weatherRecords: Map<string, WeatherRecord>;

  constructor() {
    this.users = new Map();
    this.weatherRecords = new Map();
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async createWeatherRecord(record: InsertWeatherRecord): Promise<WeatherRecord> {
    const id = randomUUID();
    const weatherRecord: WeatherRecord = {
      ...record,
      id,
      searchDate: new Date(),
    };
    this.weatherRecords.set(id, weatherRecord);
    return weatherRecord;
  }

  async getAllWeatherRecords(): Promise<WeatherRecord[]> {
    return Array.from(this.weatherRecords.values()).sort(
      (a, b) => new Date(b.searchDate).getTime() - new Date(a.searchDate).getTime()
    );
  }

  async getWeatherRecord(id: string): Promise<WeatherRecord | undefined> {
    return this.weatherRecords.get(id);
  }

  async updateWeatherRecord(id: string, updates: UpdateWeatherRecord): Promise<WeatherRecord | undefined> {
    const existing = this.weatherRecords.get(id);
    if (!existing) return undefined;

    const updated: WeatherRecord = { ...existing, ...updates };
    this.weatherRecords.set(id, updated);
    return updated;
  }

  async deleteWeatherRecord(id: string): Promise<boolean> {
    return this.weatherRecords.delete(id);
  }
}

export const storage = new MemStorage();
