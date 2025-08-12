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
      <div className="bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-800 dark:to-gray-900 rounded-xl shadow-lg border-0 p-8">
        <div className="text-center text-gray-600 dark:text-gray-300">
          <div className="text-8xl mb-6">🌍</div>
          <p className="text-lg">Search for a location to see current weather</p>
        </div>
      </div>
    );
  }

  const currentDate = new Date();
  const formattedDate = {
    weekday: currentDate.toLocaleDateString('en-US', { weekday: 'long' }),
    day: currentDate.getDate(),
    month: currentDate.toLocaleDateString('en-US', { month: 'short' }),
    year: currentDate.getFullYear(),
    time: currentDate.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    })
  };

  const weatherIcon = getWeatherIcon(weatherData.description);

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
      <div className="bg-gradient-to-r from-blue-700 to-blue-800 text-white p-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 text-9xl opacity-10">
          {weatherIcon}
        </div>
        <div className="relative flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="text-6xl">{weatherIcon}</div>
            <div>
              <h3 className="text-2xl font-bold text-white">{weatherData.location}</h3>
              <div className="flex flex-col text-blue-100">
                <div className="flex items-center space-x-2">
                  <span className="text-lg font-semibold text-white">{formattedDate.weekday}</span>
                  <span className="text-blue-100">•</span>
                  <span className="text-sm text-blue-100 font-medium">{formattedDate.time}</span>
                </div>
                <div className="text-sm text-blue-100 font-medium">
                  {formattedDate.month} {formattedDate.day}, {formattedDate.year}
                </div>
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-5xl font-bold text-white drop-shadow-md">{weatherData.temperature}°C</div>
            <p className="text-blue-100 dark:text-blue-200 capitalize text-lg font-medium">{weatherData.description}</p>
          </div>
        </div>
      </div>
      
      <div className="p-6">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-white/90 dark:bg-gray-800/90 rounded-lg p-4 text-center border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-all duration-200">
            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mx-auto mb-3">
              <i className="fas fa-eye text-purple-600 dark:text-purple-400 text-xl"></i>
            </div>
            <p className="text-sm text-gray-700 dark:text-gray-200 font-medium">Visibility</p>
            <p className="text-xl font-bold text-gray-900 dark:text-white">{weatherData.visibility} km</p>
          </div>
          <div className="bg-white/90 dark:bg-gray-800/90 rounded-lg p-4 text-center border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-all duration-200">
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-3">
              <i className="fas fa-tint text-blue-600 dark:text-blue-400 text-xl"></i>
            </div>
            <p className="text-sm text-gray-700 dark:text-gray-200 font-medium">Humidity</p>
            <p className="text-xl font-bold text-gray-900 dark:text-white">{weatherData.humidity}%</p>
          </div>
          <div className="bg-white/90 dark:bg-gray-800/90 rounded-lg p-4 text-center border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-all duration-200">
            <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-3">
              <i className="fas fa-wind text-gray-600 dark:text-gray-300 text-xl"></i>
            </div>
            <p className="text-sm text-gray-700 dark:text-gray-200 font-medium">Wind Speed</p>
            <p className="text-xl font-bold text-gray-900 dark:text-white">{weatherData.windSpeed} m/s</p>
          </div>
          <div className="bg-white/90 dark:bg-gray-800/90 rounded-lg p-4 text-center border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-all duration-200">
            <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-3">
              <i className="fas fa-thermometer-half text-red-600 dark:text-red-400 text-xl"></i>
            </div>
            <p className="text-sm text-gray-700 dark:text-gray-200 font-medium">Feels Like</p>
            <p className="text-xl font-bold text-gray-900 dark:text-white">{weatherData.feelsLike}°C</p>
          </div>
        </div>
      </div>
    </div>
  );
}
