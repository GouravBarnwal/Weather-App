import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";

interface LocationVideosProps {
  location: string;
}

interface YouTubeVideo {
  id: string;
  title: string;
  thumbnail: string;
  channelTitle: string;
}

export default function LocationVideos({ location }: LocationVideosProps) {
  const [videos, setVideos] = useState<YouTubeVideo[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (location) {
      fetchLocationVideos();
    }
  }, [location]);

  const fetchLocationVideos = async () => {
    setLoading(true);
    setError("");
    
    try {
      // First try location-specific videos
      const response = await fetch(`/api/videos/${encodeURIComponent(location)}`);
      if (!response.ok) {
        throw new Error("Failed to fetch videos");
      }
      
      const data = await response.json();
      
      // If no location videos found, try random travel videos
      if (!data.videos || data.videos.length === 0) {
        const randomResponse = await fetch(`/api/videos/random-travel`);
        if (randomResponse.ok) {
          const randomData = await randomResponse.json();
          setVideos(randomData.videos || []);
          setError(`No videos found for ${location}. Showing popular travel videos instead.`);
        } else {
          setVideos([]);
          setError(`No videos available for ${location}`);
        }
      } else {
        setVideos(data.videos);
      }
    } catch (err) {
      setError(`Unable to load videos for ${location}`);
      console.error("Video fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  if (!location) return null;

  return (
    <div className="bg-gradient-to-br from-red-50 to-pink-100 dark:from-red-900/20 dark:to-pink-900/20 rounded-xl shadow-lg border-0 p-6">
      <div className="flex items-center space-x-3 mb-6">
        <div className="p-2 bg-white dark:bg-gray-800 rounded-full shadow-sm">
          <i className="fab fa-youtube text-red-600 text-xl"></i>
        </div>
        <h3 className="text-xl font-bold text-gray-900 dark:text-white">Videos about {location}</h3>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-8">
          <i className="fas fa-spinner animate-spin text-red-600 text-2xl mr-3"></i>
          <span className="text-gray-600">Loading videos...</span>
        </div>
      )}

      {error && (
        <div className="bg-yellow-100 dark:bg-yellow-900/20 border border-yellow-300 dark:border-yellow-700 rounded-lg p-4 mb-4">
          <div className="flex items-center">
            <i className="fas fa-info-circle text-yellow-600 dark:text-yellow-400 mr-2"></i>
            <span className="text-yellow-800 dark:text-yellow-300">{error}</span>
          </div>
        </div>
      )}

      {videos.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {videos.slice(0, 4).map((video) => (
            <div key={video.id} className="bg-white dark:bg-gray-800 bg-opacity-70 dark:bg-opacity-70 rounded-xl p-4 backdrop-blur-sm shadow-sm hover:shadow-md transition-all duration-200">
              <div className="relative mb-3">
                <img 
                  src={video.thumbnail} 
                  alt={video.title}
                  className="w-full h-32 object-cover rounded-lg"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Button
                    onClick={() => window.open(`https://www.youtube.com/watch?v=${video.id}`, '_blank')}
                    className="bg-red-600 hover:bg-red-700 text-white rounded-full p-3"
                    size="sm"
                  >
                    <i className="fas fa-play text-lg"></i>
                  </Button>
                </div>
              </div>
              <h4 className="font-medium text-gray-900 dark:text-white text-sm line-clamp-2 mb-2">
                {video.title}
              </h4>
              <p className="text-xs text-gray-600 dark:text-gray-400">{video.channelTitle}</p>
            </div>
          ))}
        </div>
      )}

      {videos.length === 0 && !loading && !error && (
        <div className="text-center py-8">
          <div className="text-6xl mb-4">🎥</div>
          <p className="text-gray-600 dark:text-gray-400">No videos found for this location</p>
        </div>
      )}
    </div>
  );
}