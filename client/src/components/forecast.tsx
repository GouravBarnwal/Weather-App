interface ForecastProps {
  weatherData: any;
}

const getWeatherEmoji = (condition: string) => {
  const desc = condition?.toLowerCase() || '';
  if (desc.includes('clear') || desc.includes('sunny')) return '☀️';
  if (desc.includes('cloud')) return '☁️';
  if (desc.includes('rain') || desc.includes('drizzle')) return '🌧️';
  if (desc.includes('snow')) return '❄️';
  if (desc.includes('thunder') || desc.includes('storm')) return '⛈️';
  if (desc.includes('mist') || desc.includes('fog')) return '🌫️';
  if (desc.includes('wind')) return '💨';
  return '🌤️'; // partly cloudy default
};

interface ForecastDay {
  date?: string | Date;
  condition?: string;
  description?: string;
  highTemp?: number;
  lowTemp?: number;
  temperature?: number;
}

export default function Forecast({ weatherData }: ForecastProps) {
  if (!weatherData?.forecast) {
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

  const formatDate = (dateInput?: string | Date | number) => {
    if (!dateInput) return { dateString: 'N/A', yearString: '' };
    
    try {
      const date = new Date(dateInput);
      if (isNaN(date.getTime())) return { dateString: 'N/A', yearString: '' };
      
      return {
        dateString: date.toLocaleDateString('en-US', { 
          weekday: 'short',
          month: 'short', 
          day: 'numeric' 
        }),
        yearString: date.toLocaleDateString('en-US', { year: 'numeric' })
      };
    } catch (e) {
      console.warn('Error formatting date:', dateInput, e);
      return { dateString: 'N/A', yearString: '' };
    }
  };

  return (
    <div className="bg-gradient-to-br from-indigo-50 to-purple-100 rounded-xl shadow-lg border-0 p-6">
      <div className="flex items-center space-x-3 mb-6">
        <div className="p-2 bg-white rounded-full shadow-sm">
          <i className="fas fa-calendar-week text-indigo-600 text-xl"></i>
        </div>
        <h3 className="text-xl font-bold text-gray-900">5-Day Forecast</h3>
      </div>
      <div className="space-y-3">
        {weatherData.forecast.map((day: ForecastDay, index: number) => {
          const { dateString, yearString } = formatDate(day.date);
          
          return (
            <div className="bg-white/90 dark:bg-gray-800/90 rounded-xl p-4 backdrop-blur-sm shadow-sm hover:shadow-md transition-all duration-200 border border-gray-100 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="text-4xl">{getWeatherEmoji(day.condition || '')}</div>
                  <div className="min-w-0">
                    <p className="font-semibold text-gray-900 dark:text-gray-100 text-sm whitespace-nowrap">
                      {dateString}
                    </p>
                    {yearString && (
                      <p className="text-xs text-gray-700 dark:text-gray-300 mt-0.5 font-medium">
                        {yearString}
                      </p>
                    )}
                    <p className="text-xs text-gray-800 dark:text-gray-200 capitalize mt-1 font-medium">
                      {day.description || 'N/A'}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center space-x-1">
                    {day.highTemp !== undefined && day.lowTemp !== undefined ? (
                      <>
                        <span className="text-2xl font-bold text-gray-900 dark:text-white">{day.highTemp}°</span>
                        <span className="text-sm text-gray-700 dark:text-gray-300">/</span>
                        <span className="text-lg font-semibold text-gray-700 dark:text-gray-300">{day.lowTemp}°</span>
                      </>
                    ) : day.temperature !== undefined ? (
                      <span className="text-2xl font-bold text-gray-900 dark:text-white">{day.temperature}°</span>
                    ) : (
                      <span className="text-sm text-gray-500 dark:text-gray-400">No data</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
