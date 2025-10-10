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
  const [checkedProperties, setCheckedProperties] = useState<Set<string>>(new Set());
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
    if (!tokens) return;
    
    // If no properties are checked, show warning
    if (checkedProperties.size === 0) {
      showNotification('⚠️ Please check at least one property to export');
      return;
    }

    // Export only checked properties
    const filteredTokens: ThemeTokens = {
      colors: {
        primary: {},
        secondary: {},
        neutral: {},
        success: {},
        warning: {},
        error: {},
        purple: {},
        level: {},
        gender: {},
        challenge: {},
        source: {},
        background: {},
        text: {},
        border: {},
      },
      spacing: {},
      typography: {
        fontSize: {},
        fontWeight: {},
        lineHeight: {},
      },
      borderRadius: {},
      shadows: {},
      transitions: {},
      zIndex: {},
      components: {
        button: {},
        input: {},
        card: {},
        layout: {},
      },
    };

    // Filter tokens based on checked properties
    checkedProperties.forEach((varName) => {
      const [categoryKey, subcategoryKey, tokenKey] = parseVariableName(varName);
      const value = getTokenValue(tokens, categoryKey, subcategoryKey, tokenKey);
      if (value) {
        setTokenValue(filteredTokens, categoryKey, subcategoryKey, tokenKey, value);
      }
    });

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
    downloadTheme(filteredTokens, `theme-${timestamp}.json`);
    showNotification(`Exported ${checkedProperties.size} selected properties!`);
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
          
          // Check only the properties that were imported
          const importedVarNames = new Set<string>();
          extractVariableNames(imported).forEach(varName => importedVarNames.add(varName));
          setCheckedProperties(importedVarNames);
          
          showNotification(`Imported ${importedVarNames.size} properties!`);
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

  const togglePropertyCheck = (variableName: string) => {
    setCheckedProperties((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(variableName)) {
        newSet.delete(variableName);
      } else {
        newSet.add(variableName);
      }
      return newSet;
    });
  };

  const toggleAllInCategory = (category: CategoryConfig) => {
    if (!tokens) return;
    
    const categoryVarNames = new Set<string>();
    const categoryData = tokens[category.key];
    
    if (category.subcategories) {
      category.subcategories.forEach((subcat) => {
        const subcatData = categoryData[subcat as keyof typeof categoryData];
        if (subcatData && typeof subcatData === 'object') {
          Object.keys(subcatData).forEach((key) => {
            const varName = getVariableName(category.key, subcat, key);
            categoryVarNames.add(varName);
          });
        }
      });
    } else {
      Object.keys(categoryData).forEach((key) => {
        const varName = getVariableName(category.key, null, key);
        categoryVarNames.add(varName);
      });
    }

    // Check if all are already checked
    const allChecked = Array.from(categoryVarNames).every(varName => 
      checkedProperties.has(varName)
    );

    setCheckedProperties((prev) => {
      const newSet = new Set(prev);
      if (allChecked) {
        // Uncheck all in this category
        categoryVarNames.forEach(varName => newSet.delete(varName));
      } else {
        // Check all in this category
        categoryVarNames.forEach(varName => newSet.add(varName));
      }
      return newSet;
    });
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
    const isChecked = checkedProperties.has(variableName);

    return (
      <div key={variableName} className={styles.tokenItem}>
        <input
          type="checkbox"
          checked={isChecked}
          onChange={() => togglePropertyCheck(variableName)}
          className={styles.checkbox}
          title="Select for export"
        />
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

  const parseVariableName = (varName: string): [string, string | null, string] => {
    // Remove -- prefix
    const name = varName.startsWith('--') ? varName.slice(2) : varName;
    
    // Try to match patterns
    if (name.startsWith('color-bg-')) {
      return ['colors', 'background', name.replace('color-bg-', '')];
    }
    if (name.startsWith('color-text-')) {
      return ['colors', 'text', name.replace('color-text-', '')];
    }
    if (name.startsWith('color-border-')) {
      return ['colors', 'border', name.replace('color-border-', '')];
    }
    if (name.startsWith('color-')) {
      const parts = name.split('-');
      return ['colors', parts[1], parts.slice(2).join('-')];
    }
    if (name.startsWith('space-')) {
      return ['spacing', null, name.replace('space-', '')];
    }
    if (name.startsWith('font-size-')) {
      return ['typography', 'fontSize', name.replace('font-size-', '')];
    }
    if (name.startsWith('font-weight-')) {
      return ['typography', 'fontWeight', name.replace('font-weight-', '')];
    }
    if (name.startsWith('line-height-')) {
      return ['typography', 'lineHeight', name.replace('line-height-', '')];
    }
    if (name.startsWith('radius-')) {
      return ['borderRadius', null, name.replace('radius-', '')];
    }
    if (name.startsWith('shadow-')) {
      return ['shadows', null, name.replace('shadow-', '')];
    }
    if (name.startsWith('transition-')) {
      return ['transitions', null, name.replace('transition-', '')];
    }
    if (name.startsWith('z-')) {
      return ['zIndex', null, name.replace('z-', '')];
    }
    if (name.startsWith('button-') || name.startsWith('input-') || name.startsWith('card-')) {
      const parts = name.split('-');
      return ['components', parts[0], parts.slice(1).join('-')];
    }
    if (name.match(/^(header|footer|sidebar|content)-/)) {
      return ['components', 'layout', name];
    }
    
    return ['', null, name];
  };

  const getTokenValue = (
    tokens: ThemeTokens,
    categoryKey: string,
    subcategoryKey: string | null,
    tokenKey: string
  ): string | undefined => {
    const categoryData = tokens[categoryKey as keyof ThemeTokens];
    if (!categoryData) return undefined;
    
    if (subcategoryKey) {
      const subcatData = categoryData[subcategoryKey as keyof typeof categoryData];
      if (subcatData && typeof subcatData === 'object') {
        return (subcatData as Record<string, string>)[tokenKey];
      }
    } else {
      return (categoryData as Record<string, string>)[tokenKey];
    }
    return undefined;
  };

  const setTokenValue = (
    tokens: ThemeTokens,
    categoryKey: string,
    subcategoryKey: string | null,
    tokenKey: string,
    value: string
  ): void => {
    const categoryData = tokens[categoryKey as keyof ThemeTokens];
    if (!categoryData) return;
    
    if (subcategoryKey) {
      const subcatData = categoryData[subcategoryKey as keyof typeof categoryData];
      if (subcatData && typeof subcatData === 'object') {
        (subcatData as Record<string, string>)[tokenKey] = value;
      }
    } else {
      (categoryData as Record<string, string>)[tokenKey] = value;
    }
  };

  const extractVariableNames = (tokens: ThemeTokens): string[] => {
    const varNames: string[] = [];
    
    // Colors
    Object.keys(tokens.colors).forEach((subcatKey) => {
      const subcatData = tokens.colors[subcatKey as keyof typeof tokens.colors];
      if (subcatData && typeof subcatData === 'object') {
        Object.keys(subcatData).forEach((key) => {
          varNames.push(getVariableName('colors', subcatKey, key));
        });
      }
    });
    
    // Spacing
    Object.keys(tokens.spacing).forEach((key) => {
      varNames.push(getVariableName('spacing', null, key));
    });
    
    // Typography
    Object.keys(tokens.typography).forEach((subcatKey) => {
      const subcatData = tokens.typography[subcatKey as keyof typeof tokens.typography];
      if (subcatData && typeof subcatData === 'object') {
        Object.keys(subcatData).forEach((key) => {
          varNames.push(getVariableName('typography', subcatKey, key));
        });
      }
    });
    
    // Border Radius
    Object.keys(tokens.borderRadius).forEach((key) => {
      varNames.push(getVariableName('borderRadius', null, key));
    });
    
    // Shadows
    Object.keys(tokens.shadows).forEach((key) => {
      varNames.push(getVariableName('shadows', null, key));
    });
    
    // Transitions
    Object.keys(tokens.transitions).forEach((key) => {
      varNames.push(getVariableName('transitions', null, key));
    });
    
    // Z-Index
    Object.keys(tokens.zIndex).forEach((key) => {
      varNames.push(getVariableName('zIndex', null, key));
    });
    
    // Components
    Object.keys(tokens.components).forEach((subcatKey) => {
      const subcatData = tokens.components[subcatKey as keyof typeof tokens.components];
      if (subcatData && typeof subcatData === 'object') {
        Object.keys(subcatData).forEach((key) => {
          varNames.push(getVariableName('components', subcatKey, key));
        });
      }
    });
    
    return varNames;
  };

  const renderCategory = (category: CategoryConfig) => {
    if (!tokens) return null;

    const categoryData = tokens[category.key];
    if (!categoryData) return null;

    const isExpanded = expandedCategories.has(category.key);
    
    // Count tokens in category and how many are checked
    let tokenCount = 0;
    let checkedCount = 0;
    const categoryVarNames: string[] = [];
    
    if (category.subcategories) {
      category.subcategories.forEach((subcat) => {
        const subcatData = categoryData[subcat as keyof typeof categoryData];
        if (subcatData && typeof subcatData === 'object') {
          Object.keys(subcatData).forEach((key) => {
            tokenCount++;
            const varName = getVariableName(category.key, subcat, key);
            categoryVarNames.push(varName);
            if (checkedProperties.has(varName)) checkedCount++;
          });
        }
      });
    } else {
      Object.keys(categoryData).forEach((key) => {
        tokenCount++;
        const varName = getVariableName(category.key, null, key);
        categoryVarNames.push(varName);
        if (checkedProperties.has(varName)) checkedCount++;
      });
    }

    // Filter logic
    const matchesSearch = (text: string) =>
      text.toLowerCase().includes(searchQuery.toLowerCase());

    return (
      <div key={category.key} className={styles.category}>
        <div className={styles.categoryHeader}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            <input
              type="checkbox"
              checked={checkedCount === tokenCount && tokenCount > 0}
              onChange={() => toggleAllInCategory(category)}
              className={styles.categoryCheckbox}
              title="Select all in category"
              onClick={(e) => e.stopPropagation()}
            />
            <h3 className={styles.categoryTitle} onClick={() => toggleCategory(category.key)}>
              {category.title}
            </h3>
            <span className={styles.categoryBadge}>
              {checkedCount > 0 ? `${checkedCount}/` : ''}{tokenCount}
            </span>
          </div>
          <span 
            className={`${styles.chevron} ${isExpanded ? styles.expanded : ''}`}
            onClick={() => toggleCategory(category.key)}
          >
            ▼
          </span>
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

