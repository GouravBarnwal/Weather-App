import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

interface WeatherSearchProps {
  onWeatherUpdate: (weather: any) => void;
}

export default function WeatherSearch({ onWeatherUpdate }: WeatherSearchProps) {
  const [location, setLocation] = useState("");
  const [isUsingLocation, setIsUsingLocation] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const weatherMutation = useMutation({
    mutationFn: async (searchLocation: string) => {
      const response = await apiRequest("GET", `/api/weather/${encodeURIComponent(searchLocation)}`);
      return response.json();
    },
    onSuccess: (data) => {
      onWeatherUpdate(data.weather);
      setLocation("");
      queryClient.invalidateQueries({ queryKey: ["/api/weather"] });
      toast({
        title: "Weather data fetched successfully",
        description: `Got weather for ${data.weather.location}`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to fetch weather",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!location.trim()) {
      toast({
        title: "Location required",
        description: "Please enter a location to search for weather",
        variant: "destructive",
      });
      return;
    }
    weatherMutation.mutate(location.trim());
  };

  const useCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast({
        title: "Geolocation not supported",
        description: "Your browser doesn't support geolocation",
        variant: "destructive",
      });
      return;
    }

    setIsUsingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const coords = `${latitude.toFixed(6)},${longitude.toFixed(6)}`;
        weatherMutation.mutate(coords);
        setIsUsingLocation(false);
      },
      (error) => {
        setIsUsingLocation(false);
        toast({
          title: "Location access denied",
          description: "Unable to access your location. Please search manually.",
          variant: "destructive",
        });
      }
    );
  };

  return (
    <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 p-6 transition-all duration-300 hover:shadow-xl">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-1">Weather Search</h2>
        <p className="text-gray-500 dark:text-gray-400">Get current weather and forecasts for any location</p>
      </div>
      
      <form onSubmit={handleSearch} className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <Input
              type="text"
              placeholder="Enter city, zip code, or coordinates..."
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:text-white dark:placeholder-gray-500 transition-all duration-200"
              disabled={weatherMutation.isPending || isUsingLocation}
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 ml-1">Try: New York, 10001, 40.7128,-74.0060, or Eiffel Tower</p>
          </div>
          <div className="flex gap-3">
            <Button 
              type="submit"
              disabled={weatherMutation.isPending || isUsingLocation}
              className="flex-1 sm:flex-none bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
            >
              {weatherMutation.isPending ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Searching...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  Search
                </>
              )}
            </Button>
            <Button
              type="button"
              onClick={useCurrentLocation}
              disabled={weatherMutation.isPending || isUsingLocation}
              variant="outline"
              className="flex-1 sm:flex-none border-2 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800/50 px-4 py-3 rounded-xl font-medium transition-all duration-200 hover:border-blue-400 hover:text-blue-600 dark:hover:text-blue-400"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span className="ml-2 hidden sm:inline">My Location</span>
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
