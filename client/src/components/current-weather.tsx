interface CurrentWeatherProps {
  weatherData: any;
}

// Weather condition to icon mapping
const getWeatherIcon = (description: string) => {
  const desc = description.toLowerCase();
  if (desc.includes('clear') || desc.includes('sunny')) return '☀️';
  if (desc.includes('cloud')) return '☁️';
  if (desc.includes('rain') || desc.includes('drizzle')) return '🌧️';
  if (desc.includes('snow')) return '❄️';
  if (desc.includes('thunder') || desc.includes('storm')) return '⛈️';
  if (desc.includes('mist') || desc.includes('fog')) return '🌫️';
  if (desc.includes('wind')) return '💨';
  return '🌤️'; // partly cloudy default
};

export default function CurrentWeather({ weatherData }: CurrentWeatherProps) {
  if (!weatherData) {
    return (
      <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-xl shadow-lg border-0 p-8">
        <div className="text-center text-gray-600">
          <div className="text-8xl mb-6">🌍</div>
          <p className="text-lg">Search for a location to see current weather</p>
        </div>
      </div>
    );
  }

  const currentDate = new Date().toLocaleDateString('en-US', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  const weatherIcon = getWeatherIcon(weatherData.description);

  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-xl shadow-lg border-0 overflow-hidden">
      <div className="bg-gradient-to-r from-weather-blue to-blue-600 text-white p-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 text-9xl opacity-10">
          {weatherIcon}
        </div>
        <div className="relative flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="text-6xl">{weatherIcon}</div>
            <div>
              <h3 className="text-2xl font-bold">{weatherData.location}</h3>
              <p className="text-blue-100">{currentDate}</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-5xl font-bold">{weatherData.temperature}°C</div>
            <p className="text-blue-100 capitalize text-lg">{weatherData.description}</p>
          </div>
        </div>
      </div>
      
      <div className="p-6">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-white bg-opacity-70 rounded-xl p-4 text-center backdrop-blur-sm shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <i className="fas fa-eye text-purple-600 text-xl"></i>
            </div>
            <p className="text-sm text-gray-600 font-medium">Visibility</p>
            <p className="text-xl font-bold text-gray-900">{weatherData.visibility} km</p>
          </div>
          <div className="bg-white bg-opacity-70 rounded-xl p-4 text-center backdrop-blur-sm shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <i className="fas fa-tint text-blue-600 text-xl"></i>
            </div>
            <p className="text-sm text-gray-600 font-medium">Humidity</p>
            <p className="text-xl font-bold text-gray-900">{weatherData.humidity}%</p>
          </div>
          <div className="bg-white bg-opacity-70 rounded-xl p-4 text-center backdrop-blur-sm shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <i className="fas fa-wind text-gray-600 text-xl"></i>
            </div>
            <p className="text-sm text-gray-600 font-medium">Wind Speed</p>
            <p className="text-xl font-bold text-gray-900">{weatherData.windSpeed} m/s</p>
          </div>
          <div className="bg-white bg-opacity-70 rounded-xl p-4 text-center backdrop-blur-sm shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <i className="fas fa-thermometer-half text-red-600 text-xl"></i>
            </div>
            <p className="text-sm text-gray-600 font-medium">Feels Like</p>
            <p className="text-xl font-bold text-gray-900">{weatherData.feelsLike}°C</p>
          </div>
        </div>
      </div>
    </div>
  );
}
