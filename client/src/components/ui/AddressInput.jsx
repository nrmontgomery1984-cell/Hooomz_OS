import { useState, useRef, useEffect, useCallback } from 'react';
import { MapPin, Navigation } from 'lucide-react';

/**
 * AddressInput - Google Places Autocomplete input
 *
 * Features:
 * - Address autocomplete as you type
 * - Stores full place data (address, lat/lng, place_id)
 * - "Open in Maps" button for navigation
 * - Falls back to regular input if Google Maps not loaded
 *
 * @param {string} label - Field label
 * @param {string} value - Current address string
 * @param {function} onChange - Called with address string
 * @param {function} onPlaceSelect - Called with full place data { address, lat, lng, placeId }
 * @param {object} placeData - Current place data (for showing map link)
 * @param {string} error - Error message
 * @param {string} placeholder - Placeholder text
 */
export function AddressInput({
  label,
  value = '',
  onChange,
  onPlaceSelect,
  placeData,
  error,
  placeholder = 'Start typing an address...',
  required,
  className = '',
}) {
  const inputRef = useRef(null);
  const autocompleteRef = useRef(null);
  const [isGoogleLoaded, setIsGoogleLoaded] = useState(false);

  // Ensure value is always a string to prevent controlled/uncontrolled warnings
  const safeValue = value ?? '';

  // Check if Google Maps is loaded
  useEffect(() => {
    const checkGoogle = () => {
      if (window.google?.maps?.places) {
        setIsGoogleLoaded(true);
        return true;
      }
      return false;
    };

    if (checkGoogle()) return;

    // Poll for Google Maps to load (in case script loads after component mounts)
    const interval = setInterval(() => {
      if (checkGoogle()) {
        clearInterval(interval);
      }
    }, 500);

    // Stop checking after 10 seconds
    const timeout = setTimeout(() => clearInterval(interval), 10000);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, []);

  // Initialize autocomplete when Google loads
  useEffect(() => {
    if (!isGoogleLoaded || !inputRef.current || autocompleteRef.current) return;

    try {
      autocompleteRef.current = new window.google.maps.places.Autocomplete(
        inputRef.current,
        {
          types: ['address'],
          componentRestrictions: { country: ['us', 'ca'] },
          fields: ['formatted_address', 'geometry', 'place_id', 'address_components'],
        }
      );

      autocompleteRef.current.addListener('place_changed', () => {
        const place = autocompleteRef.current.getPlace();

        if (place.formatted_address) {
          onChange(place.formatted_address);

          if (onPlaceSelect) {
            onPlaceSelect({
              address: place.formatted_address,
              lat: place.geometry?.location?.lat(),
              lng: place.geometry?.location?.lng(),
              placeId: place.place_id,
              components: parseAddressComponents(place.address_components),
            });
          }
        }
      });
    } catch (err) {
      console.warn('Failed to initialize Google Places Autocomplete:', err);
    }
  }, [isGoogleLoaded, onChange, onPlaceSelect]);

  // Parse address components into a structured object
  const parseAddressComponents = (components) => {
    if (!components) return null;

    const result = {};
    components.forEach((component) => {
      const type = component.types[0];
      if (type === 'street_number') result.streetNumber = component.long_name;
      if (type === 'route') result.street = component.long_name;
      if (type === 'locality') result.city = component.long_name;
      if (type === 'administrative_area_level_1') result.state = component.short_name;
      if (type === 'postal_code') result.zip = component.long_name;
      if (type === 'country') result.country = component.short_name;
    });
    return result;
  };

  // Open in Google Maps
  const openInMaps = useCallback(() => {
    if (placeData?.lat && placeData?.lng) {
      // Use coordinates for precise location
      window.open(
        `https://www.google.com/maps/search/?api=1&query=${placeData.lat},${placeData.lng}`,
        '_blank'
      );
    } else if (safeValue) {
      // Fall back to address search
      window.open(
        `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(safeValue)}`,
        '_blank'
      );
    }
  }, [placeData, safeValue]);

  // Handle manual input change
  const handleChange = (e) => {
    onChange(e.target.value);
    // Clear place data when manually editing (address no longer validated)
    if (onPlaceSelect && placeData) {
      onPlaceSelect(null);
    }
  };

  return (
    <div className={`space-y-1 ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <MapPin className="w-4 h-4 text-gray-400" />
        </div>

        <input
          ref={inputRef}
          type="text"
          value={safeValue}
          onChange={handleChange}
          placeholder={placeholder}
          className={`
            w-full pl-9 pr-10 py-2 text-sm border rounded-md transition-colors
            focus:outline-none focus:ring-2 focus:ring-charcoal focus:ring-offset-1
            ${error
              ? 'border-red-300 focus:ring-red-500'
              : 'border-gray-300 hover:border-gray-400'
            }
          `}
        />

        {/* Map link when address has value */}
        <div className="absolute inset-y-0 right-0 pr-2 flex items-center">
          {safeValue ? (
            <button
              type="button"
              onClick={openInMaps}
              className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
              title="Open in Google Maps"
            >
              <Navigation className="w-4 h-4" />
            </button>
          ) : null}
        </div>
      </div>

      {/* Verified address indicator */}
      {placeData?.placeId && (
        <p className="text-xs text-green-600 flex items-center gap-1">
          <MapPin className="w-3 h-3" />
          Address verified
        </p>
      )}

      {error && <p className="text-xs text-red-500">{error}</p>}

      {/* Hint when Google not loaded */}
      {!isGoogleLoaded && !error && (
        <p className="text-xs text-gray-400">
          Enter address manually (autocomplete unavailable)
        </p>
      )}
    </div>
  );
}
