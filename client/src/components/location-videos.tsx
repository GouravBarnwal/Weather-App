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
      const response = await fetch(`/api/videos/${encodeURIComponent(location)}`);
      if (!response.ok) {
        throw new Error("Failed to fetch videos");
      }
      
      const data = await response.json();
      setVideos(data.videos || []);
    } catch (err) {
      setError("Unable to load videos for this location");
      console.error("Video fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  if (!location) return null;

  return (
    <div className="bg-gradient-to-br from-red-50 to-pink-100 rounded-xl shadow-lg border-0 p-6">
      <div className="flex items-center space-x-3 mb-6">
        <div className="p-2 bg-white rounded-full shadow-sm">
          <i className="fab fa-youtube text-red-600 text-xl"></i>
        </div>
        <h3 className="text-xl font-bold text-gray-900">Videos about {location}</h3>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-8">
          <i className="fas fa-spinner animate-spin text-red-600 text-2xl mr-3"></i>
          <span className="text-gray-600">Loading videos...</span>
        </div>
      )}

      {error && (
        <div className="bg-red-100 border border-red-300 rounded-lg p-4 mb-4">
          <div className="flex items-center">
            <i className="fas fa-exclamation-triangle text-red-600 mr-2"></i>
            <span className="text-red-800">{error}</span>
          </div>
        </div>
      )}

      {videos.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {videos.slice(0, 4).map((video) => (
            <div key={video.id} className="bg-white bg-opacity-70 rounded-xl p-4 backdrop-blur-sm shadow-sm hover:shadow-md transition-all duration-200">
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
              <h4 className="font-medium text-gray-900 text-sm line-clamp-2 mb-2">
                {video.title}
              </h4>
              <p className="text-xs text-gray-600">{video.channelTitle}</p>
            </div>
          ))}
        </div>
      )}

      {videos.length === 0 && !loading && !error && (
        <div className="text-center py-8">
          <div className="text-6xl mb-4">🎥</div>
          <p className="text-gray-600">No videos found for this location</p>
        </div>
      )}
    </div>
  );
}