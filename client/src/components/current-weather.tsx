interface CurrentWeatherProps {
  weatherData: any;
}

export default function CurrentWeather({ weatherData }: CurrentWeatherProps) {
  if (!weatherData) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
        <div className="text-center text-gray-500">
          <i className="fas fa-cloud text-6xl text-gray-300 mb-4"></i>
          <p>Search for a location to see current weather</p>
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

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="bg-gradient-to-r from-weather-blue to-blue-600 text-white p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-semibold">{weatherData.location}</h3>
            <p className="text-blue-100">{currentDate}</p>
          </div>
          <div className="text-right">
            <div className="text-4xl font-bold">{weatherData.temperature}°C</div>
            <p className="text-blue-100 capitalize">{weatherData.description}</p>
          </div>
        </div>
      </div>
      
      <div className="p-6">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="text-center">
            <i className="fas fa-eye text-weather-blue text-xl mb-2"></i>
            <p className="text-sm text-gray-500">Visibility</p>
            <p className="font-semibold">{weatherData.visibility} km</p>
          </div>
          <div className="text-center">
            <i className="fas fa-tint text-weather-blue text-xl mb-2"></i>
            <p className="text-sm text-gray-500">Humidity</p>
            <p className="font-semibold">{weatherData.humidity}%</p>
          </div>
          <div className="text-center">
            <i className="fas fa-wind text-weather-blue text-xl mb-2"></i>
            <p className="text-sm text-gray-500">Wind Speed</p>
            <p className="font-semibold">{weatherData.windSpeed} km/h</p>
          </div>
          <div className="text-center">
            <i className="fas fa-thermometer-half text-weather-blue text-xl mb-2"></i>
            <p className="text-sm text-gray-500">Feels Like</p>
            <p className="font-semibold">{weatherData.feelsLike}°C</p>
          </div>
        </div>
      </div>
    </div>
  );
}
