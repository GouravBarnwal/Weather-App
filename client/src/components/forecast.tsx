interface ForecastProps {
  weatherData: any;
}

const getWeatherEmoji = (condition: string) => {
  const desc = condition.toLowerCase();
  if (desc.includes('clear') || desc.includes('sunny')) return '☀️';
  if (desc.includes('cloud')) return '☁️';
  if (desc.includes('rain') || desc.includes('drizzle')) return '🌧️';
  if (desc.includes('snow')) return '❄️';
  if (desc.includes('thunder') || desc.includes('storm')) return '⛈️';
  if (desc.includes('mist') || desc.includes('fog')) return '🌫️';
  if (desc.includes('wind')) return '💨';
  return '🌤️'; // partly cloudy default
};

export default function Forecast({ weatherData }: ForecastProps) {
  if (!weatherData || !weatherData.forecast) {
    return (
      <div className="bg-gradient-to-br from-indigo-50 to-purple-100 rounded-xl shadow-lg border-0 p-6">
        <div className="flex items-center space-x-3 mb-6">
          <div className="p-2 bg-white rounded-full shadow-sm">
            <i className="fas fa-calendar-week text-indigo-600 text-xl"></i>
          </div>
          <h3 className="text-xl font-bold text-gray-900">5-Day Forecast</h3>
        </div>
        <div className="text-center text-gray-600 py-8">
          <div className="text-8xl mb-6">📅</div>
          <p className="text-lg">Forecast will appear after searching for weather</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-indigo-50 to-purple-100 rounded-xl shadow-lg border-0 p-6">
      <div className="flex items-center space-x-3 mb-6">
        <div className="p-2 bg-white rounded-full shadow-sm">
          <i className="fas fa-calendar-week text-indigo-600 text-xl"></i>
        </div>
        <h3 className="text-xl font-bold text-gray-900">5-Day Forecast</h3>
      </div>
      <div className="space-y-3">
        {weatherData.forecast.map((day: any, index: number) => (
          <div key={index} className="bg-white bg-opacity-70 rounded-xl p-4 backdrop-blur-sm shadow-sm hover:shadow-md transition-all duration-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="text-3xl">{getWeatherEmoji(day.condition)}</div>
                <div>
                  <p className="font-bold text-gray-900">{day.date}</p>
                  <p className="text-sm text-gray-600 capitalize">{day.description}</p>
                </div>
              </div>
              <div className="text-right">
                <div className="flex items-center space-x-2">
                  <span className="text-xl font-bold text-gray-900">{day.highTemp}°</span>
                  <span className="text-sm text-gray-500">/</span>
                  <span className="text-sm font-medium text-gray-600">{day.lowTemp}°</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
