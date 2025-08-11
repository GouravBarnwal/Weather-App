import { useState } from "react";
import WeatherSearch from "@/components/weather-search";
import CurrentWeather from "@/components/current-weather";
import Forecast from "@/components/forecast";
import WeatherHistory from "@/components/weather-history";
import CrudOperations from "@/components/crud-operations";
import InfoModal from "@/components/info-modal";

export default function Home() {
  const [currentWeather, setCurrentWeather] = useState<any>(null);
  const [showInfoModal, setShowInfoModal] = useState(false);

  return (
    <div className="bg-weather-surface min-h-screen">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <i className="fas fa-cloud-sun text-weather-blue text-2xl"></i>
              <h1 className="text-xl font-semibold text-gray-900">Weather App</h1>
            </div>
            <button 
              onClick={() => setShowInfoModal(true)}
              className="flex items-center space-x-2 bg-weather-blue text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
            >
              <i className="fas fa-info-circle"></i>
              <span>About</span>
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Weather Search */}
        <WeatherSearch onWeatherUpdate={setCurrentWeather} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column: Current Weather & Forecast */}
          <div className="lg:col-span-2 space-y-8">
            <CurrentWeather weatherData={currentWeather} />
            <Forecast weatherData={currentWeather} />
          </div>

          {/* Right Column: History & CRUD Operations */}
          <div className="space-y-8">
            <WeatherHistory />
            <CrudOperations />
          </div>

        </div>

      </div>

      {/* Info Modal */}
      <InfoModal 
        isOpen={showInfoModal} 
        onClose={() => setShowInfoModal(false)} 
      />
    </div>
  );
}
