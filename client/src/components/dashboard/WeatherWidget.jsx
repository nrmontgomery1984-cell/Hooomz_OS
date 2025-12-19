import { useState, useEffect } from 'react';
import {
  Sun,
  Cloud,
  CloudRain,
  CloudSnow,
  CloudLightning,
  Wind,
  Droplets,
  Thermometer,
  MapPin,
  RefreshCw,
  AlertCircle,
} from 'lucide-react';
import { Card } from '../ui';

/**
 * Weather Widget - Shows current weather using wttr.in API
 * Supports browser geolocation and project address fallback
 */
export function WeatherWidget({ projectAddress = null, compact = false }) {
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [location, setLocation] = useState(null);

  useEffect(() => {
    fetchWeather();
  }, [projectAddress]);

  async function fetchWeather() {
    setLoading(true);
    setError(null);

    try {
      // Try to get location
      let locationQuery = '';

      if (projectAddress) {
        // Use project address
        locationQuery = encodeURIComponent(projectAddress);
        setLocation(projectAddress);
      } else {
        // Try browser geolocation
        try {
          const position = await new Promise((resolve, reject) => {
            if (!navigator.geolocation) {
              reject(new Error('Geolocation not supported'));
              return;
            }
            navigator.geolocation.getCurrentPosition(resolve, reject, {
              timeout: 5000,
              enableHighAccuracy: false,
            });
          });
          locationQuery = `${position.coords.latitude},${position.coords.longitude}`;
          setLocation('Current Location');
        } catch {
          // Fallback to IP-based location (empty query = auto-detect)
          locationQuery = '';
          setLocation('Auto-detected');
        }
      }

      // Fetch weather from wttr.in
      const response = await fetch(
        `https://wttr.in/${locationQuery}?format=j1`,
        { headers: { 'Accept': 'application/json' } }
      );

      if (!response.ok) {
        throw new Error('Weather service unavailable');
      }

      const data = await response.json();

      // Parse wttr.in response
      const current = data.current_condition?.[0];
      const area = data.nearest_area?.[0];

      if (!current) {
        throw new Error('No weather data available');
      }

      setWeather({
        temp: current.temp_C,
        tempF: current.temp_F,
        feelsLike: current.FeelsLikeC,
        condition: current.weatherDesc?.[0]?.value || 'Unknown',
        humidity: current.humidity,
        windSpeed: current.windspeedKmph,
        windDir: current.winddir16Point,
        precipitation: current.precipMM,
        uvIndex: current.uvIndex,
        city: area?.areaName?.[0]?.value || 'Unknown',
        region: area?.region?.[0]?.value || '',
        weatherCode: parseInt(current.weatherCode) || 0,
      });
    } catch (err) {
      setError(err.message || 'Failed to load weather');
    } finally {
      setLoading(false);
    }
  }

  // Get weather icon based on condition code
  const getWeatherIcon = (code) => {
    // wttr.in weather codes: https://www.worldweatheronline.com/developer/api/docs/weather-icons.aspx
    if (code >= 200 && code < 300) return CloudLightning; // Thunderstorm
    if (code >= 300 && code < 400) return CloudRain; // Drizzle
    if (code >= 500 && code < 600) return CloudRain; // Rain
    if (code >= 600 && code < 700) return CloudSnow; // Snow
    if (code >= 800 && code < 803) return Sun; // Clear/Partly cloudy
    if (code >= 803) return Cloud; // Cloudy

    // Simplified mapping for wttr.in codes
    if (code === 113) return Sun;
    if (code === 116 || code === 119) return Cloud;
    if (code >= 176 && code <= 308) return CloudRain;
    if (code >= 320 && code <= 395) return CloudSnow;
    if (code >= 386 && code <= 395) return CloudLightning;

    return Cloud;
  };

  if (loading) {
    return (
      <Card className={`${compact ? 'p-3' : 'p-4'}`}>
        <div className="flex items-center gap-3 animate-pulse">
          <div className="w-12 h-12 bg-gray-200 rounded-lg" />
          <div className="flex-1">
            <div className="h-4 bg-gray-200 rounded w-24 mb-2" />
            <div className="h-3 bg-gray-200 rounded w-32" />
          </div>
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={`${compact ? 'p-3' : 'p-4'}`}>
        <div className="flex items-center gap-3 text-gray-500">
          <AlertCircle className="w-8 h-8 text-gray-400" />
          <div className="flex-1">
            <p className="text-sm font-medium">Weather unavailable</p>
            <p className="text-xs text-gray-400">{error}</p>
          </div>
          <button
            onClick={fetchWeather}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </Card>
    );
  }

  const WeatherIcon = getWeatherIcon(weather.weatherCode);

  if (compact) {
    return (
      <Card className="p-3">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-50 rounded-lg">
            <WeatherIcon className="w-6 h-6 text-blue-500" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-xl font-semibold text-charcoal">{weather.temp}°C</span>
              <span className="text-sm text-gray-400">{weather.tempF}°F</span>
            </div>
            <p className="text-xs text-gray-500 truncate">{weather.condition}</p>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <MapPin className="w-3 h-3" />
              <span className="truncate max-w-20">{weather.city}</span>
            </div>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-1 text-sm text-gray-500">
          <MapPin className="w-4 h-4" />
          <span>{weather.city}{weather.region ? `, ${weather.region}` : ''}</span>
        </div>
        <button
          onClick={fetchWeather}
          className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
          title="Refresh weather"
        >
          <RefreshCw className="w-4 h-4 text-gray-400" />
        </button>
      </div>

      {/* Current Weather */}
      <div className="flex items-center gap-4 mb-4">
        <div className="p-3 bg-gradient-to-br from-blue-50 to-sky-100 rounded-xl">
          <WeatherIcon className="w-10 h-10 text-blue-500" />
        </div>
        <div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-charcoal">{weather.temp}°</span>
            <span className="text-lg text-gray-400">C</span>
          </div>
          <p className="text-sm text-gray-600">{weather.condition}</p>
        </div>
      </div>

      {/* Details Grid */}
      <div className="grid grid-cols-3 gap-3">
        <div className="text-center p-2 bg-gray-50 rounded-lg">
          <Thermometer className="w-4 h-4 text-orange-500 mx-auto mb-1" />
          <p className="text-xs text-gray-500">Feels Like</p>
          <p className="text-sm font-medium text-charcoal">{weather.feelsLike}°</p>
        </div>
        <div className="text-center p-2 bg-gray-50 rounded-lg">
          <Droplets className="w-4 h-4 text-blue-500 mx-auto mb-1" />
          <p className="text-xs text-gray-500">Humidity</p>
          <p className="text-sm font-medium text-charcoal">{weather.humidity}%</p>
        </div>
        <div className="text-center p-2 bg-gray-50 rounded-lg">
          <Wind className="w-4 h-4 text-teal-500 mx-auto mb-1" />
          <p className="text-xs text-gray-500">Wind</p>
          <p className="text-sm font-medium text-charcoal">{weather.windSpeed} km/h</p>
        </div>
      </div>

      {/* Location source indicator */}
      {location && (
        <p className="text-xs text-gray-400 text-center mt-3">
          {projectAddress ? 'Project location' : location}
        </p>
      )}
    </Card>
  );
}

export default WeatherWidget;
