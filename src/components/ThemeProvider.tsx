import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Theme } from '../types';

const THEMES: Record<string, Theme> = {
  dark: {
    mode: 'dark',
    primary: 'from-indigo-900 via-purple-900 to-pink-900',
    secondary: 'bg-white/10',
    background: 'bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900',
    surface: 'bg-white/10 backdrop-blur-lg border-white/20',
    text: 'text-white'
  },
  light: {
    mode: 'light',
    primary: 'from-blue-50 via-indigo-50 to-purple-50',
    secondary: 'bg-gray-100',
    background: 'bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50',
    surface: 'bg-white/90 backdrop-blur-lg border-gray-200',
    text: 'text-gray-900'
  }
};

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (themeName: string) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [currentTheme, setCurrentTheme] = useState<Theme>(THEMES.dark);

  useEffect(() => {
    const savedTheme = localStorage.getItem('app-theme');
    if (savedTheme && THEMES[savedTheme]) {
      setCurrentTheme(THEMES[savedTheme]);
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = currentTheme.mode === 'dark' ? THEMES.light : THEMES.dark;
    setCurrentTheme(newTheme);
    localStorage.setItem('app-theme', newTheme.mode);
  };

  const setTheme = (themeName: string) => {
    if (THEMES[themeName]) {
      setCurrentTheme(THEMES[themeName]);
      localStorage.setItem('app-theme', themeName);
    }
  };

  return (
    <ThemeContext.Provider value={{ theme: currentTheme, toggleTheme, setTheme }}>
      <div className={`min-h-screen ${currentTheme.background} ${currentTheme.text}`}>
        {children}
      </div>
    </ThemeContext.Provider>
  );
};

export default ThemeProvider;