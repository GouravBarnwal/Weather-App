import { useState } from "react";
import WeatherSearch from "@/components/weather-search";
import CurrentWeather from "@/components/current-weather";
import Forecast from "@/components/forecast";
import WeatherHistory from "@/components/weather-history";
import CrudOperations from "@/components/crud-operations";
import InfoModal from "@/components/info-modal";
import LocationMap from "@/components/location-map";
import LocationVideos from "@/components/location-videos";
import { ThemeToggle } from "@/components/theme-toggle";

export default function Home() {
  const [currentWeather, setCurrentWeather] = useState<any>(null);
  const [showInfoModal, setShowInfoModal] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-gray-900 dark:to-gray-950 transition-colors duration-300">
      {/* Header */}
      <header className="bg-white/80 dark:bg-gray-900/90 backdrop-blur-lg border-b border-gray-100 dark:border-gray-800 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/70 rounded-lg">
                <svg className="w-6 h-6 text-blue-600 dark:text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent dark:from-blue-400 dark:to-cyan-300">
                Gourav's Weather App
              </h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <ThemeToggle />
              <button 
                onClick={() => setShowInfoModal(true)}
                className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="hidden sm:inline">About</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Weather Search */}
        <div className="bg-white dark:bg-gray-900/80 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-800">
          <WeatherSearch onWeatherUpdate={setCurrentWeather} />
        </div>

        {currentWeather ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left Column: Current Weather & Forecast */}
            <div className="lg:col-span-8 space-y-8">
              <div className="bg-white dark:bg-gray-900/80 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-800">
                <CurrentWeather weatherData={currentWeather} />
              </div>
              <div className="bg-white dark:bg-gray-900/80 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-800">
                <Forecast weatherData={currentWeather} />
              </div>
              
              {currentWeather && (
                <div className="bg-white dark:bg-gray-900/80 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-800">
                  <LocationMap 
                    latitude={currentWeather.latitude}
                    longitude={currentWeather.longitude}
                    location={currentWeather.location}
                  />
                </div>
              )}
              
              {currentWeather && (
                <div className="bg-white dark:bg-gray-900/80 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-800">
                  <LocationVideos location={currentWeather.location} />
                </div>
              )}
            </div>

            {/* Right Column: History & CRUD Operations - Wider */}
            <div className="lg:col-span-4 space-y-8">
              <div className="bg-white dark:bg-gray-900/80 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-800">
                <WeatherHistory />
              </div>
              <div className="bg-white dark:bg-gray-900/80 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-800">
                <CrudOperations />
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="mx-auto w-24 h-24 bg-blue-100 dark:bg-blue-900/50 rounded-full flex items-center justify-center mb-4">
              <svg className="w-12 h-12 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">Search for a location</h2>
            <p className="text-gray-500 dark:text-gray-400">Enter a city name to view weather information</p>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white/80 dark:bg-gray-900/90 backdrop-blur-lg border-t border-gray-100 dark:border-gray-800 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center text-sm text-gray-600 dark:text-gray-400">
            <p>Created by Gourav Barnwal for PM Accelerator</p>
            <a 
              href="https://www.linkedin.com/in/grv1404" 
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center space-x-2 text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium mt-2 transition-colors duration-200"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
              </svg>
              <span>linkedin.com/in/grv1404</span>
            </a>
          </div>
        </div>
      </footer>

      {/* Info Modal */}
      <InfoModal 
        isOpen={showInfoModal} 
        onClose={() => setShowInfoModal(false)} 
      />
    </div>
  );
}
