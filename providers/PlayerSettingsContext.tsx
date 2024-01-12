"use client";

import { createContext, useContext, useState, ReactNode } from 'react';

interface PlayerSettingsContextProps {
  children: ReactNode;
}

interface PlayerSettingsContextValue {
  volume: number;
  setVolume: React.Dispatch<React.SetStateAction<number>>;
  isOnLoop: boolean;
  setIsOnLoop: React.Dispatch<React.SetStateAction<boolean>>;
  isOnShuffle: boolean;
  setIsOnShuffle: React.Dispatch<React.SetStateAction<boolean>>;
}

const PlayerSettingsContext = createContext<PlayerSettingsContextValue | undefined>(undefined);

export const PlayerSettingsProvider: React.FC<PlayerSettingsContextProps> = ({ children }) => {
  const [volume, setVolume] = useState(1);
  const [isOnLoop, setIsOnLoop] = useState(true);
  const [isOnShuffle, setIsOnShuffle] = useState(false);

  const contextValue: PlayerSettingsContextValue = {
    volume,
    setVolume,
    isOnLoop,
    setIsOnLoop,
    isOnShuffle,
    setIsOnShuffle,
  };

  return (
    <PlayerSettingsContext.Provider value={contextValue}>
      {children}
    </PlayerSettingsContext.Provider>
  );
};

export const usePlayerSettings = () => {
  const context = useContext(PlayerSettingsContext);
  if (!context) {
    throw new Error('usePlayerSettings must be used within a PlayerSettingsProvider');
  }
  return context;
};
