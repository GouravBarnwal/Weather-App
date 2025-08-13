import { type User, type InsertUser, type WeatherRecord, type InsertWeatherRecord, type UpdateWeatherRecord } from "./schema.js";
import { randomUUID } from "crypto";
import mongoose from "mongoose";

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

// MongoDB Schemas
const weatherRecordSchema = new mongoose.Schema({
  location: { type: String, required: true },
  latitude: { type: Number },
  longitude: { type: Number },
  temperature: { type: Number, required: true },
  feelsLike: { type: Number },
  humidity: { type: Number },
  windSpeed: { type: Number },
  visibility: { type: Number },
  description: { type: String, required: true },
  condition: { type: String, required: true },
  forecast: { type: mongoose.Schema.Types.Mixed },
  searchDate: { type: Date, default: Date.now },
  startDate: { type: Date },
  endDate: { type: Date },
});

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
});

const WeatherRecordModel = mongoose.model('WeatherRecord', weatherRecordSchema);
const UserModel = mongoose.model('User', userSchema);

export class MongoStorage implements IStorage {
  private isConnected = false;

  async connect() {
    if (this.isConnected) return;
    
    try {
      // Try multiple common MongoDB connection strings for Windows
      const possibleUris = [
        process.env.MONGODB_URI,
        'mongodb://localhost:27017/weather_app',
        'mongodb://127.0.0.1:27017/weather_app',
        'mongodb://localhost:27018/weather_app', // Sometimes runs on different port
        'mongodb://127.0.0.1:27018/weather_app'
      ].filter(Boolean);
      
      let connected = false;
      let lastError;
      
      for (const uri of possibleUris) {
        try {
          console.log('\n=== MongoDB Connection Attempt ===');
          const safeUri = (uri as string).replace(/:[^:]*@/, ':***@');
          console.log('Attempting to connect to MongoDB at:', safeUri); // Hide password in logs
          
          const connection = await mongoose.connect(uri as string, {
            serverSelectionTimeoutMS: 5000,
            connectTimeoutMS: 10000,
            socketTimeoutMS: 45000,
          });
          
          connected = true;
          console.log('✅ Successfully connected to MongoDB!');
          console.log('MongoDB connection state:', mongoose.connection.readyState);
          console.log('Database name:', connection.connection.db?.databaseName);
          console.log('Collections:', await connection.connection.db?.listCollections().toArray());
          break;
        } catch (error) {
          lastError = error;
          console.error('❌ Failed to connect to MongoDB:');
          const err = error as any;
          console.error('Error name:', err?.name);
          console.error('Error message:', err?.message);
          if (err?.code === 'MONGODB_DUPLICATE_KEY') {
            console.error('Duplicate key error - a document with this ID already exists');
          } else if (err?.code === 'MONGODB_SERVER_SELECTION_ERROR') {
            console.error('Server selection error - check your network connection and MongoDB Atlas whitelist');
          } else if (err?.code === 'MONGODB_AUTH_ERROR') {
            console.error('Authentication failed - check your username and password');
          }
          console.log('Trying next connection string...');
        }
      }
      
      if (!connected) {
        throw lastError;
      }
      
      this.isConnected = true;
      console.log('Connected to MongoDB successfully');
    } catch (error) {
      console.error('MongoDB connection error:', error);
      throw new Error('Failed to connect to MongoDB');
    }
  }

  async getUser(id: string): Promise<User | undefined> {
    await this.connect();
    const user = await UserModel.findById(id).lean();
    return user ? { id: user._id.toString(), username: user.username, password: user.password } : undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    await this.connect();
    const user = await UserModel.findOne({ username }).lean();
    return user ? { id: user._id.toString(), username: user.username, password: user.password } : undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    await this.connect();
    const user = new UserModel(insertUser);
    const savedUser = await user.save();
    return { id: savedUser._id.toString(), username: savedUser.username, password: savedUser.password };
  }

  async createWeatherRecord(record: InsertWeatherRecord): Promise<WeatherRecord> {
    await this.connect();
    const weatherRecord = new WeatherRecordModel(record);
    const saved = await weatherRecord.save();
    return {
      id: saved._id.toString(),
      location: saved.location,
      latitude: saved.latitude ?? undefined,
      longitude: saved.longitude ?? undefined,
      temperature: saved.temperature,
      feelsLike: saved.feelsLike ?? undefined,
      humidity: saved.humidity ?? undefined,
      windSpeed: saved.windSpeed ?? undefined,
      visibility: saved.visibility ?? undefined,
      description: saved.description,
      condition: saved.condition,
      forecast: saved.forecast,
      searchDate: saved.searchDate,
      startDate: saved.startDate ?? undefined,
      endDate: saved.endDate ?? undefined,
    };
  }

  async getAllWeatherRecords(): Promise<WeatherRecord[]> {
    await this.connect();
    const records = await WeatherRecordModel.find().sort({ searchDate: -1 }).lean();
    return records.map(record => ({
      id: record._id.toString(),
      location: record.location,
      latitude: (record as any).latitude ?? undefined,
      longitude: (record as any).longitude ?? undefined,
      temperature: record.temperature,
      feelsLike: (record as any).feelsLike ?? undefined,
      humidity: (record as any).humidity ?? undefined,
      windSpeed: (record as any).windSpeed ?? undefined,
      visibility: (record as any).visibility ?? undefined,
      description: record.description,
      condition: record.condition,
      forecast: (record as any).forecast,
      searchDate: (record as any).searchDate,
      startDate: (record as any).startDate ?? undefined,
      endDate: (record as any).endDate ?? undefined,
    }));
  }

  async getWeatherRecord(id: string): Promise<WeatherRecord | undefined> {
    await this.connect();
    const record = await WeatherRecordModel.findById(id).lean();
    if (!record) return undefined;
    
    return {
      id: record._id.toString(),
      location: record.location,
      latitude: record.latitude ?? undefined,
      longitude: record.longitude ?? undefined,
      temperature: record.temperature,
      feelsLike: record.feelsLike ?? undefined,
      humidity: record.humidity ?? undefined,
      windSpeed: record.windSpeed ?? undefined,
      visibility: record.visibility ?? undefined,
      description: record.description,
      condition: record.condition,
      forecast: record.forecast,
      searchDate: record.searchDate,
      startDate: record.startDate ?? undefined,
      endDate: record.endDate ?? undefined,
    };
  }

  async updateWeatherRecord(id: string, updates: UpdateWeatherRecord): Promise<WeatherRecord | undefined> {
    await this.connect();
    const updated = await WeatherRecordModel.findByIdAndUpdate(id, updates, { new: true }).lean();
    if (!updated) return undefined;
    
    return {
      id: updated._id.toString(),
      location: updated.location,
      latitude: updated.latitude ?? undefined,
      longitude: updated.longitude ?? undefined,
      temperature: updated.temperature,
      feelsLike: updated.feelsLike ?? undefined,
      humidity: updated.humidity ?? undefined,
      windSpeed: updated.windSpeed ?? undefined,
      visibility: updated.visibility ?? undefined,
      description: updated.description,
      condition: updated.condition,
      forecast: updated.forecast,
      searchDate: updated.searchDate,
      startDate: updated.startDate ?? undefined,
      endDate: updated.endDate ?? undefined,
    };
  }

  async deleteWeatherRecord(id: string): Promise<boolean> {
    await this.connect();
    const result = await WeatherRecordModel.findByIdAndDelete(id);
    return result !== null;
  }
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
      latitude: record.latitude ?? undefined,
      longitude: record.longitude ?? undefined,
      feelsLike: record.feelsLike ?? undefined,
      humidity: record.humidity ?? undefined,
      windSpeed: record.windSpeed ?? undefined,
      visibility: record.visibility ?? undefined,
      forecast: record.forecast ?? undefined,
      startDate: record.startDate ?? undefined,
      endDate: record.endDate ?? undefined,
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

// Smart storage that tries MongoDB first, falls back to memory storage
class SmartStorage implements IStorage {
  private mongoStorage = new MongoStorage();
  private memStorage = new MemStorage();
  private useMemory = false;

  private async getStorage(): Promise<IStorage> {
    if (this.useMemory) return this.memStorage;
    
    // Use MongoDB Atlas when MONGODB_URI is provided, otherwise use memory storage
    if (!process.env.MONGODB_URI) {
      console.log('Using in-memory storage for development (set MONGODB_URI to connect to MongoDB Atlas)');
      this.useMemory = true;
      return this.memStorage;
    }
    
    try {
      await this.mongoStorage.connect();
      return this.mongoStorage;
    } catch (error) {
      console.log('MongoDB connection failed, falling back to in-memory storage');
      this.useMemory = true;
      return this.memStorage;
    }
  }

  async getUser(id: string): Promise<User | undefined> {
    const storage = await this.getStorage();
    return storage.getUser(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const storage = await this.getStorage();
    return storage.getUserByUsername(username);
  }

  async createUser(user: InsertUser): Promise<User> {
    const storage = await this.getStorage();
    return storage.createUser(user);
  }

  async createWeatherRecord(record: InsertWeatherRecord): Promise<WeatherRecord> {
    const storage = await this.getStorage();
    return storage.createWeatherRecord(record);
  }

  async getAllWeatherRecords(): Promise<WeatherRecord[]> {
    const storage = await this.getStorage();
    return storage.getAllWeatherRecords();
  }

  async getWeatherRecord(id: string): Promise<WeatherRecord | undefined> {
    const storage = await this.getStorage();
    return storage.getWeatherRecord(id);
  }

  async updateWeatherRecord(id: string, updates: UpdateWeatherRecord): Promise<WeatherRecord | undefined> {
    const storage = await this.getStorage();
    return storage.updateWeatherRecord(id, updates);
  }

  async deleteWeatherRecord(id: string): Promise<boolean> {
    const storage = await this.getStorage();
    return storage.deleteWeatherRecord(id);
  }
}

export const storage = new SmartStorage();
