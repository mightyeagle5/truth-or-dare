import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { 
  loadSavedTheme, 
  loadThemeByName, 
  applyTheme,
  type ThemeName 
} from '../lib/themeUtils';

export function useTheme() {
  const [currentTheme, setCurrentTheme] = useState<ThemeName>('default');
  const [isLoading, setIsLoading] = useState(false);
  const location = useLocation();

  // Check if we're on admin page
  const isAdminPage = location.pathname.startsWith('/admin');

  useEffect(() => {
    // Don't apply themes on admin page
    if (isAdminPage) {
      // Reset to default styles for admin
      document.body.style.background = '';
      return;
    }

    // Load and apply saved theme
    const savedTheme = loadSavedTheme();
    if (savedTheme && savedTheme !== 'default') {
      setCurrentTheme(savedTheme);
      loadAndApplyTheme(savedTheme);
    }
  }, [location.pathname, isAdminPage]);

  const loadAndApplyTheme = async (themeName: ThemeName) => {
    setIsLoading(true);
    try {
      const theme = await loadThemeByName(themeName);
      if (theme) {
        applyTheme(theme);
        setCurrentTheme(themeName);
      }
    } catch (error) {
      console.error('Failed to apply theme:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    currentTheme,
    isLoading,
    isAdminPage,
  };
}

