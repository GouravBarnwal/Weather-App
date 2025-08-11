import { useEffect, useRef } from "react";

interface LocationMapProps {
  latitude: number;
  longitude: number;
  location: string;
}

export default function LocationMap({ latitude, longitude, location }: LocationMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mapRef.current) return;

    // Create map container
    const mapContainer = mapRef.current;
    mapContainer.innerHTML = '';

    // Create iframe for OpenStreetMap
    const iframe = document.createElement('iframe');
    iframe.src = `https://www.openstreetmap.org/export/embed.html?bbox=${longitude-0.01},${latitude-0.01},${longitude+0.01},${latitude+0.01}&layer=mapnik&marker=${latitude},${longitude}`;
    iframe.style.width = '100%';
    iframe.style.height = '300px';
    iframe.style.border = 'none';
    iframe.style.borderRadius = '8px';
    iframe.title = `Map showing ${location}`;

    mapContainer.appendChild(iframe);
  }, [latitude, longitude, location]);

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center space-x-2 mb-4">
        <i className="fas fa-map-marker-alt text-weather-blue"></i>
        <h3 className="text-lg font-semibold text-gray-900">Location</h3>
      </div>
      
      <div className="mb-4">
        <p className="text-sm text-gray-600">
          <strong>Location:</strong> {location}
        </p>
        <p className="text-sm text-gray-500">
          {latitude.toFixed(4)}, {longitude.toFixed(4)}
        </p>
      </div>

      <div ref={mapRef} className="w-full">
        {/* Map will be inserted here */}
      </div>
    </div>
  );
}