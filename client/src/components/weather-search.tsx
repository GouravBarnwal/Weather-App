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
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Get Weather Information</h2>
      <form onSubmit={handleSearch} className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <Input
              type="text"
              placeholder="Enter city, zip code, GPS coordinates, or landmark..."
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-weather-blue focus:border-transparent"
              disabled={weatherMutation.isPending || isUsingLocation}
            />
            <p className="text-sm text-gray-500 mt-2">Supports: City names, ZIP codes, GPS coordinates (lat,lon), landmarks</p>
          </div>
          <div className="flex gap-2">
            <Button 
              type="submit"
              disabled={weatherMutation.isPending || isUsingLocation}
              className="bg-weather-blue text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors font-medium"
            >
              {weatherMutation.isPending ? (
                <>
                  <i className="fas fa-spinner animate-spin mr-2"></i>
                  Searching...
                </>
              ) : (
                <>
                  <i className="fas fa-search mr-2"></i>
                  Search
                </>
              )}
            </Button>
            <Button 
              type="button"
              onClick={useCurrentLocation}
              disabled={weatherMutation.isPending || isUsingLocation}
              className="bg-weather-teal text-white px-6 py-3 rounded-lg hover:bg-teal-600 transition-colors font-medium"
            >
              {isUsingLocation ? (
                <>
                  <i className="fas fa-spinner animate-spin mr-2"></i>
                  Locating...
                </>
              ) : (
                <>
                  <i className="fas fa-map-marker-alt mr-2"></i>
                  My Location
                </>
              )}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
