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

      // Get forecast data
      const forecast = data.weather?.[0];
      const todayHourly = forecast?.hourly || [];

      setWeather({
        temp: current.temp_C,
        tempF: current.temp_F,
        feelsLike: current.FeelsLikeC,
        feelsLikeF: current.FeelsLikeF,
        condition: current.weatherDesc?.[0]?.value || 'Unknown',
        humidity: current.humidity,
        windSpeed: current.windspeedKmph,
        windSpeedMph: current.windspeedMiles,
        windDir: current.winddir16Point,
        windGust: current.WindGustKmph,
        precipitation: current.precipMM,
        uvIndex: current.uvIndex,
        visibility: current.visibility,
        pressure: current.pressure,
        cloudCover: current.cloudcover,
        city: area?.areaName?.[0]?.value || 'Unknown',
        region: area?.region?.[0]?.value || '',
        weatherCode: parseInt(current.weatherCode) || 0,
        // Today's forecast
        maxTemp: forecast?.maxtempC,
        minTemp: forecast?.mintempC,
        maxTempF: forecast?.maxtempF,
        minTempF: forecast?.mintempF,
        sunrise: forecast?.astronomy?.[0]?.sunrise,
        sunset: forecast?.astronomy?.[0]?.sunset,
        chanceOfRain: todayHourly[Math.floor(new Date().getHours() / 3)]?.chanceofrain || '0',
        // 3-day forecast
        forecast: data.weather?.slice(0, 3).map(day => ({
          date: day.date,
          maxTemp: day.maxtempC,
          minTemp: day.mintempC,
          maxTempF: day.maxtempF,
          minTempF: day.mintempF,
          condition: day.hourly?.[4]?.weatherDesc?.[0]?.value || 'Unknown',
          weatherCode: parseInt(day.hourly?.[4]?.weatherCode) || 0,
          chanceOfRain: day.hourly?.[4]?.chanceofrain || '0',
        })) || [],
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
      <Card className="p-4">
        {/* Header with location */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-1 text-xs text-gray-500">
            <MapPin className="w-3 h-3" />
            <span>{weather.city}</span>
          </div>
          <button
            onClick={fetchWeather}
            className="p-1 hover:bg-gray-100 rounded transition-colors"
            title="Refresh"
          >
            <RefreshCw className="w-3 h-3 text-gray-400" />
          </button>
        </div>

        {/* Main temp and condition */}
        <div className="flex items-center gap-3 mb-3">
          <div className="p-2 bg-gradient-to-br from-blue-50 to-sky-100 rounded-xl">
            <WeatherIcon className="w-8 h-8 text-blue-500" />
          </div>
          <div className="flex-1">
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-bold text-charcoal">{weather.temp}°</span>
              <span className="text-sm text-gray-400">C</span>
            </div>
            <p className="text-xs text-gray-500">{weather.condition}</p>
          </div>
          <div className="text-right text-xs text-gray-500">
            <p>H: {weather.maxTemp}° L: {weather.minTemp}°</p>
          </div>
        </div>

        {/* Key stats row */}
        <div className="grid grid-cols-4 gap-2 text-center">
          <div className="p-1.5 bg-gray-50 rounded">
            <Thermometer className="w-3 h-3 text-orange-500 mx-auto mb-0.5" />
            <p className="text-[10px] text-gray-400">Feels</p>
            <p className="text-xs font-medium">{weather.feelsLike}°</p>
          </div>
          <div className="p-1.5 bg-gray-50 rounded">
            <Wind className="w-3 h-3 text-teal-500 mx-auto mb-0.5" />
            <p className="text-[10px] text-gray-400">Wind</p>
            <p className="text-xs font-medium">{weather.windSpeed} km/h</p>
          </div>
          <div className="p-1.5 bg-gray-50 rounded">
            <Droplets className="w-3 h-3 text-blue-500 mx-auto mb-0.5" />
            <p className="text-[10px] text-gray-400">Humidity</p>
            <p className="text-xs font-medium">{weather.humidity}%</p>
          </div>
          <div className="p-1.5 bg-gray-50 rounded">
            <CloudRain className="w-3 h-3 text-indigo-500 mx-auto mb-0.5" />
            <p className="text-[10px] text-gray-400">Rain</p>
            <p className="text-xs font-medium">{weather.chanceOfRain}%</p>
          </div>
        </div>

        {/* 3-day forecast */}
        {weather.forecast?.length > 0 && (
          <div className="mt-3 pt-3 border-t border-gray-100">
            <div className="flex justify-between">
              {weather.forecast.map((day, idx) => {
                const DayIcon = getWeatherIcon(day.weatherCode);
                const isToday = idx === 0;
                const dayName = isToday
                  ? 'Today'
                  : new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' });
                return (
                  <div key={idx} className="flex-1 text-center">
                    <p className={`text-[10px] mb-1 ${isToday ? 'text-gray-600 font-medium' : 'text-gray-400'}`}>{dayName}</p>
                    <DayIcon className={`w-4 h-4 mx-auto mb-1 ${isToday ? 'text-blue-500' : 'text-gray-400'}`} />
                    <p className="text-xs font-medium">{day.maxTemp}° / {day.minTemp}°</p>
                  </div>
                );
              })}
            </div>
          </div>
        )}
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
        <div className="flex-1">
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-charcoal">{weather.temp}°</span>
            <span className="text-lg text-gray-400">C</span>
          </div>
          <p className="text-sm text-gray-600">{weather.condition}</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-500">H: {weather.maxTemp}° L: {weather.minTemp}°</p>
          <p className="text-xs text-gray-400">Feels like {weather.feelsLike}°</p>
        </div>
      </div>

      {/* Details Grid */}
      <div className="grid grid-cols-4 gap-2 mb-4">
        <div className="text-center p-2 bg-gray-50 rounded-lg">
          <Wind className="w-4 h-4 text-teal-500 mx-auto mb-1" />
          <p className="text-xs text-gray-500">Wind</p>
          <p className="text-sm font-medium text-charcoal">{weather.windSpeed} km/h</p>
          <p className="text-[10px] text-gray-400">{weather.windDir}</p>
        </div>
        <div className="text-center p-2 bg-gray-50 rounded-lg">
          <Droplets className="w-4 h-4 text-blue-500 mx-auto mb-1" />
          <p className="text-xs text-gray-500">Humidity</p>
          <p className="text-sm font-medium text-charcoal">{weather.humidity}%</p>
        </div>
        <div className="text-center p-2 bg-gray-50 rounded-lg">
          <CloudRain className="w-4 h-4 text-indigo-500 mx-auto mb-1" />
          <p className="text-xs text-gray-500">Rain</p>
          <p className="text-sm font-medium text-charcoal">{weather.chanceOfRain}%</p>
        </div>
        <div className="text-center p-2 bg-gray-50 rounded-lg">
          <Sun className="w-4 h-4 text-yellow-500 mx-auto mb-1" />
          <p className="text-xs text-gray-500">UV Index</p>
          <p className="text-sm font-medium text-charcoal">{weather.uvIndex}</p>
        </div>
      </div>

      {/* 3-day forecast */}
      {weather.forecast?.length > 0 && (
        <div className="pt-3 border-t border-gray-100">
          <p className="text-xs font-medium text-gray-500 mb-2">3-Day Forecast</p>
          <div className="flex justify-between">
            {weather.forecast.map((day, idx) => {
              const DayIcon = getWeatherIcon(day.weatherCode);
              const isToday = idx === 0;
              const dayName = isToday
                ? 'Today'
                : new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' });
              return (
                <div key={idx} className={`flex-1 text-center ${isToday ? 'font-medium' : ''}`}>
                  <p className="text-xs text-gray-500 mb-1">{dayName}</p>
                  <DayIcon className={`w-5 h-5 mx-auto mb-1 ${isToday ? 'text-blue-500' : 'text-gray-400'}`} />
                  <p className="text-sm">{day.maxTemp}° / {day.minTemp}°</p>
                  {parseInt(day.chanceOfRain) > 20 && (
                    <p className="text-[10px] text-blue-500">{day.chanceOfRain}% rain</p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

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
