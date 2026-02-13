import React, { createContext, useContext, useState, useCallback } from 'react';

type Coordinates = {
  lat: number;
  lng: number;
};

interface LocationContextValue {
  coords: Coordinates | null;
  locationEnabled: boolean;
  requesting: boolean;
  requestLocation: () => void;
}

const LocationContext = createContext<LocationContextValue | undefined>(undefined);

export const LocationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [coords, setCoords] = useState<Coordinates | null>(null);
  const [locationEnabled, setLocationEnabled] = useState(false);
  const [requesting, setRequesting] = useState(false);

  const requestLocation = useCallback(() => {
    if (!('geolocation' in navigator)) {
      return;
    }
    setRequesting(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCoords({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
        setLocationEnabled(true);
        setRequesting(false);
      },
      () => {
        setLocationEnabled(false);
        setRequesting(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
      }
    );
  }, []);

  return (
    <LocationContext.Provider
      value={{
        coords,
        locationEnabled,
        requesting,
        requestLocation,
      }}
    >
      {children}
    </LocationContext.Provider>
  );
};

export const useLocationContext = () => {
  const ctx = useContext(LocationContext);
  if (!ctx) {
    throw new Error('useLocationContext must be used within a LocationProvider');
  }
  return ctx;
};


