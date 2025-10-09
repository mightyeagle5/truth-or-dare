import { useState, useEffect, useRef } from 'react';
import {
  extractThemeTokens,
  updateThemeToken,
  downloadTheme,
  importTheme,
  resetTheme,
  isColorValue,
  resolveValue,
  type ThemeTokens,
} from '../../lib/themeUtils';
import styles from './ThemeEditor.module.css';

interface CategoryConfig {
  title: string;
  key: keyof ThemeTokens;
  subcategories?: string[];
}

const CATEGORIES: CategoryConfig[] = [
  {
    title: '🎨 Colors',
    key: 'colors',
    subcategories: [
      'primary',
      'secondary',
      'neutral',
      'success',
      'warning',
      'error',
      'purple',
      'level',
      'gender',
      'challenge',
      'source',
      'background',
      'text',
      'border',
    ],
  },
  { title: '📏 Spacing', key: 'spacing' },
  { title: '✏️ Typography', key: 'typography', subcategories: ['fontSize', 'fontWeight', 'lineHeight'] },
  { title: '⭕ Border Radius', key: 'borderRadius' },
  { title: '🌑 Shadows', key: 'shadows' },
  { title: '⚡ Transitions', key: 'transitions' },
  { title: '📚 Z-Index', key: 'zIndex' },
  {
    title: '🧩 Components',
    key: 'components',
    subcategories: ['button', 'input', 'card', 'layout'],
  },
];

export function ThemeEditor() {
  const [isOpen, setIsOpen] = useState(false);
  const [tokens, setTokens] = useState<ThemeTokens | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set(['colors']));
  const [notification, setNotification] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Extract tokens on mount
    const extracted = extractThemeTokens();
    setTokens(extracted);
  }, []);

  const showNotification = (message: string) => {
    setNotification(message);
    setTimeout(() => setNotification(null), 3000);
  };

  const toggleCategory = (category: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(category)) {
      newExpanded.delete(category);
    } else {
      newExpanded.add(category);
    }
    setExpandedCategories(newExpanded);
  };

  const handleTokenChange = (variableName: string, value: string) => {
    updateThemeToken(variableName, value);
    // Re-extract to update state
    const extracted = extractThemeTokens();
    setTokens(extracted);
  };

  const handleExport = () => {
    if (tokens) {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
      downloadTheme(tokens, `theme-${timestamp}.json`);
      showNotification('Theme exported successfully!');
    }
  };

  const handleImport = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const json = e.target?.result as string;
          const imported = importTheme(json);
          setTokens(imported);
          showNotification('Theme imported successfully!');
        } catch (error) {
          showNotification('Failed to import theme. Invalid JSON format.');
          console.error('Import error:', error);
        }
      };
      reader.readAsText(file);
    }
    // Reset input so the same file can be selected again
    event.target.value = '';
  };

  const handleReset = () => {
    if (confirm('Reset theme to default values? This will reload the page.')) {
      resetTheme();
    }
  };

  const renderTokenInput = (
    categoryKey: string,
    subcategoryKey: string | null,
    tokenKey: string,
    value: string
  ) => {
    const variableName = getVariableName(categoryKey, subcategoryKey, tokenKey);
    const resolvedValue = resolveValue(value);
    const isColor = isColorValue(resolvedValue);

    return (
      <div key={variableName} className={styles.tokenItem}>
        <span className={styles.tokenLabel} title={variableName}>
          {tokenKey}
        </span>
        {isColor ? (
          <>
            <label className={styles.colorPreview} style={{ backgroundColor: resolvedValue }}>
              <input
                type="color"
                value={resolvedValue.startsWith('#') ? resolvedValue : '#000000'}
                onChange={(e) => handleTokenChange(variableName, e.target.value)}
                className={styles.colorInput}
              />
            </label>
            <input
              type="text"
              value={value}
              onChange={(e) => handleTokenChange(variableName, e.target.value)}
              className={styles.tokenInput}
              placeholder="Color value"
            />
          </>
        ) : (
          <input
            type="text"
            value={value}
            onChange={(e) => handleTokenChange(variableName, e.target.value)}
            className={styles.tokenInput}
            placeholder="Value"
          />
        )}
      </div>
    );
  };

  const getVariableName = (
    categoryKey: string,
    subcategoryKey: string | null,
    tokenKey: string
  ): string => {
    if (categoryKey === 'colors') {
      if (subcategoryKey === 'background') return `--color-bg-${tokenKey}`;
      if (subcategoryKey === 'text') return `--color-text-${tokenKey}`;
      if (subcategoryKey === 'border') return `--color-border-${tokenKey}`;
      return `--color-${subcategoryKey}-${tokenKey}`;
    }
    if (categoryKey === 'spacing') return `--space-${tokenKey}`;
    if (categoryKey === 'typography') {
      if (subcategoryKey === 'fontSize') return `--font-size-${tokenKey}`;
      if (subcategoryKey === 'fontWeight') return `--font-weight-${tokenKey}`;
      if (subcategoryKey === 'lineHeight') return `--line-height-${tokenKey}`;
    }
    if (categoryKey === 'borderRadius') return `--radius-${tokenKey}`;
    if (categoryKey === 'shadows') return `--shadow-${tokenKey}`;
    if (categoryKey === 'transitions') return `--transition-${tokenKey}`;
    if (categoryKey === 'zIndex') return `--z-${tokenKey}`;
    if (categoryKey === 'components') {
      if (subcategoryKey === 'layout') return `--${tokenKey}`;
      return `--${subcategoryKey}-${tokenKey}`;
    }
    return `--${tokenKey}`;
  };

  const renderCategory = (category: CategoryConfig) => {
    if (!tokens) return null;

    const categoryData = tokens[category.key];
    if (!categoryData) return null;

    const isExpanded = expandedCategories.has(category.key);
    
    // Count tokens in category
    let tokenCount = 0;
    if (category.subcategories) {
      category.subcategories.forEach((subcat) => {
        const subcatData = categoryData[subcat as keyof typeof categoryData];
        if (subcatData && typeof subcatData === 'object') {
          tokenCount += Object.keys(subcatData).length;
        }
      });
    } else {
      tokenCount = Object.keys(categoryData).length;
    }

    // Filter logic
    const matchesSearch = (text: string) =>
      text.toLowerCase().includes(searchQuery.toLowerCase());

    return (
      <div key={category.key} className={styles.category}>
        <div className={styles.categoryHeader} onClick={() => toggleCategory(category.key)}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            <h3 className={styles.categoryTitle}>{category.title}</h3>
            <span className={styles.categoryBadge}>{tokenCount}</span>
          </div>
          <span className={`${styles.chevron} ${isExpanded ? styles.expanded : ''}`}>▼</span>
        </div>
        {isExpanded && (
          <div className={styles.categoryContent}>
            {category.subcategories ? (
              category.subcategories.map((subcatKey) => {
                const subcatData = categoryData[subcatKey as keyof typeof categoryData];
                if (!subcatData || typeof subcatData !== 'object') return null;

                const filteredTokens = Object.entries(subcatData).filter(([key]) =>
                  searchQuery ? matchesSearch(key) || matchesSearch(subcatKey) : true
                );

                if (filteredTokens.length === 0) return null;

                return (
                  <div key={subcatKey} className={styles.subcategory}>
                    <h4 className={styles.subcategoryTitle}>{subcatKey}</h4>
                    <div className={styles.tokenList}>
                      {filteredTokens.map(([key, value]) =>
                        renderTokenInput(category.key, subcatKey, key, value as string)
                      )}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className={styles.tokenList}>
                {Object.entries(categoryData)
                  .filter(([key]) => (searchQuery ? matchesSearch(key) : true))
                  .map(([key, value]) =>
                    renderTokenInput(category.key, null, key, value as string)
                  )}
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  if (!isOpen) {
    return (
      <button className={styles.toggle} onClick={() => setIsOpen(true)}>
        <span>🎨</span>
        <span>Theme Editor</span>
      </button>
    );
  }

  return (
    <>
      <div className={styles.container}>
        <div className={styles.header}>
          <h2 className={styles.title}>🎨 Theme Editor</h2>
          <div className={styles.headerActions}>
            <button
              className={styles.iconButton}
              onClick={handleImport}
              title="Import theme from JSON"
            >
              📥
            </button>
            <button
              className={styles.iconButton}
              onClick={() => setIsOpen(false)}
              title="Close"
            >
              ✕
            </button>
          </div>
        </div>

        <div className={styles.searchBox}>
          <input
            type="text"
            placeholder="Search tokens..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={styles.searchInput}
          />
        </div>

        <div className={styles.content}>
          {tokens ? (
            CATEGORIES.map((category) => renderCategory(category))
          ) : (
            <div className={styles.emptyState}>Loading theme tokens...</div>
          )}
        </div>

        <div className={styles.footer}>
          <button className={`${styles.footerButton} ${styles.exportButton}`} onClick={handleExport}>
            <span>💾</span>
            <span>Export</span>
          </button>
          <button className={`${styles.footerButton} ${styles.resetButton}`} onClick={handleReset}>
            <span>🔄</span>
            <span>Reset</span>
          </button>
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        onChange={handleFileChange}
        className={styles.fileInput}
      />

      {notification && <div className={styles.notification}>{notification}</div>}
    </>
  );
}

