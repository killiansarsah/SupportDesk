import { createContext, useContext } from 'react';
import { Theme } from '../types';

export interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (themeName: string) => void;
}

export const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
