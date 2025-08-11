interface ForecastProps {
  weatherData: any;
}

const getWeatherIcon = (condition: string) => {
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

export default function Forecast({ weatherData }: ForecastProps) {
  if (!weatherData || !weatherData.forecast) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">5-Day Forecast</h3>
        <div className="text-center text-gray-500 py-8">
          <i className="fas fa-calendar-alt text-4xl text-gray-300 mb-4"></i>
          <p>Forecast will appear after searching for weather</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">5-Day Forecast</h3>
      <div className="space-y-4">
        {weatherData.forecast.map((day: any, index: number) => (
          <div key={index} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
            <div className="flex items-center space-x-4">
              <i className={`${getWeatherIcon(day.condition)} text-xl w-6`}></i>
              <div>
                <p className="font-medium">{day.date}</p>
                <p className="text-sm text-gray-500 capitalize">{day.description}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="font-semibold">{day.highTemp}°</p>
              <p className="text-sm text-gray-500">{day.lowTemp}°</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
