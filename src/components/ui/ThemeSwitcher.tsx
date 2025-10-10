import { useState, useEffect } from 'react';
import { 
  saveTheme, 
  loadSavedTheme, 
  loadThemeByName, 
  applyTheme,
  type ThemeName 
} from '../../lib/themeUtils';
import styles from './ThemeSwitcher.module.css';

export function ThemeSwitcher() {
  const [currentTheme, setCurrentTheme] = useState<ThemeName>('default');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Load saved theme on mount
    const savedTheme = loadSavedTheme();
    if (savedTheme) {
      setCurrentTheme(savedTheme);
      if (savedTheme !== 'default') {
        loadAndApplyTheme(savedTheme);
      }
    }
  }, []);

  const loadAndApplyTheme = async (themeName: ThemeName) => {
    setIsLoading(true);
    try {
      const theme = await loadThemeByName(themeName);
      if (theme) {
        applyTheme(theme);
      }
    } catch (error) {
      console.error('Failed to apply theme:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggle = async () => {
    const newTheme: ThemeName = currentTheme === 'default' ? 'purple-gradient' : 'default';
    setCurrentTheme(newTheme);
    saveTheme(newTheme);
    await loadAndApplyTheme(newTheme);
  };

  return (
    <div className={styles.container}>
      <label className={styles.switch}>
        <input
          type="checkbox"
          checked={currentTheme === 'purple-gradient'}
          onChange={handleToggle}
          disabled={isLoading}
          className={styles.checkbox}
        />
        <span className={styles.slider}>
          <span className={styles.labelDefault}>Default</span>
          <span className={styles.labelPurple}>Purple</span>
        </span>
      </label>
    </div>
  );
}

