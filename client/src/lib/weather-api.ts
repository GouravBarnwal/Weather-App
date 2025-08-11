export interface WeatherData {
  location: string;
  temperature: number;
  description: string;
  humidity: number;
  windSpeed: number;
  visibility: number;
  feelsLike: number;
  condition: string;
  forecast?: ForecastDay[];
}

export interface ForecastDay {
  date: string;
  highTemp: number;
  lowTemp: number;
  condition: string;
  description: string;
}

export const getWeatherIcon = (condition: string): string => {
  switch (condition.toLowerCase()) {
    case 'clear':
    case 'sunny':
      return 'fas fa-sun text-yellow-500';
    case 'clouds':
    case 'cloudy':
      return 'fas fa-cloud text-gray-500';
    case 'rain':
    case 'drizzle':
      return 'fas fa-cloud-rain text-blue-500';
    case 'thunderstorm':
      return 'fas fa-bolt text-purple-500';
    case 'snow':
      return 'fas fa-snowflake text-blue-300';
    case 'mist':
    case 'fog':
      return 'fas fa-smog text-gray-400';
    default:
      return 'fas fa-cloud-sun text-yellow-400';
  }
};

export const validateLocation = (location: string): boolean => {
  if (!location || location.trim().length === 0) {
    return false;
  }
  
  // Basic validation - allow alphanumeric, spaces, commas, periods, and coordinates
  const validPattern = /^[a-zA-Z0-9\s\-,.\°]+$/;
  return validPattern.test(location.trim());
};

export const isCoordinate = (location: string): boolean => {
  const coordPattern = /^-?\d+\.?\d*,-?\d+\.?\d*$/;
  return coordPattern.test(location.trim());
};
