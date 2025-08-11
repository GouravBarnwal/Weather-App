# Weather App

## Overview

A professional full-stack weather application that allows users to search for weather information by location (city, zip code, coordinates, or landmarks), displays current weather conditions with a 5-day forecast, and maintains a searchable history of weather queries. The application features real-time weather data from OpenWeatherMap API, geolocation support for automatic location detection, and comprehensive CRUD operations for weather data management using MongoDB for persistent storage.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript and Vite for fast development and building
- **UI Framework**: shadcn/ui components built on Radix UI primitives with Tailwind CSS for styling
- **State Management**: TanStack Query (React Query) for server state management and caching
- **Routing**: Wouter for lightweight client-side routing
- **Form Handling**: React Hook Form with Zod validation for type-safe form validation
- **Styling**: Tailwind CSS with custom CSS variables for theming and Font Awesome icons for weather icons

### Backend Architecture
- **Runtime**: Node.js with Express.js server framework
- **Database ORM**: Drizzle ORM with PostgreSQL dialect for type-safe database operations
- **Database Provider**: Neon Database (serverless PostgreSQL) for cloud-hosted database
- **API Design**: RESTful API with endpoints for weather data CRUD operations
- **Session Management**: In-memory storage for development with extensible interface for production databases
- **Error Handling**: Centralized error handling middleware with proper HTTP status codes

### Data Storage Solutions
- **Primary Database**: MongoDB with Mongoose ODM for weather records and user data
- **Schema Design**: 
  - Weather records collection with location, coordinates, temperature, humidity, wind speed, visibility, forecast data
  - User authentication collection (prepared for future use)
  - Mixed type storage for forecast arrays with structured date-based weather predictions
- **Database Management**: Mongoose ODM for schema definition and data validation
- **Connection Management**: Automatic MongoDB connection with local fallback support

### Authentication and Authorization
- **Current State**: Basic user schema prepared but not actively implemented
- **Session Storage**: Connect-pg-simple for PostgreSQL-backed sessions (configured but not active)
- **Future-Ready**: Infrastructure in place for user authentication and authorization

## External Dependencies

### Third-Party APIs
- **OpenWeatherMap API**: Primary weather data source for current conditions and 5-day forecasts
- **Browser Geolocation API**: For automatic location detection using navigator.geolocation

### Cloud Services
- **Neon Database**: Serverless PostgreSQL hosting for production data storage
- **Environment Configuration**: Environment variables for API keys and database connections

### Development Tools
- **Replit Integration**: Custom Vite plugins for Replit development environment
- **Hot Module Replacement**: Vite HMR for fast development cycles
- **TypeScript**: Full type safety across frontend, backend, and shared schemas

### Key Libraries
- **UI Components**: Radix UI primitives for accessible, unstyled components
- **Data Fetching**: TanStack Query for server state management with automatic caching
- **Validation**: Zod for runtime type validation and schema definition
- **Date Handling**: date-fns for date formatting and manipulation
- **Styling**: Tailwind CSS with class-variance-authority for component variants