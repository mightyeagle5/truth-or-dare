/**
 * Theme Editor Utilities
 * Extracts, parses, and manages CSS custom properties for theme editing
 */

export interface ThemeTokens {
  colors: {
    primary: Record<string, string>;
    secondary: Record<string, string>;
    neutral: Record<string, string>;
    success: Record<string, string>;
    warning: Record<string, string>;
    error: Record<string, string>;
    purple: Record<string, string>;
    level: Record<string, string>;
    gender: Record<string, string>;
    challenge: Record<string, string>;
    source: Record<string, string>;
    background: Record<string, string>;
    text: Record<string, string>;
    border: Record<string, string>;
  };
  spacing: Record<string, string>;
  typography: {
    fontSize: Record<string, string>;
    fontWeight: Record<string, string>;
    lineHeight: Record<string, string>;
  };
  borderRadius: Record<string, string>;
  shadows: Record<string, string>;
  transitions: Record<string, string>;
  zIndex: Record<string, string>;
  components: {
    button: Record<string, string>;
    input: Record<string, string>;
    card: Record<string, string>;
    layout: Record<string, string>;
  };
}

/**
 * Extracts all CSS custom properties from :root
 */
export function extractThemeTokens(): ThemeTokens {
  const rootStyles = getComputedStyle(document.documentElement);
  const tokens: ThemeTokens = {
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

  // Get all CSS custom properties
  Array.from(document.styleSheets).forEach((styleSheet) => {
    try {
      Array.from(styleSheet.cssRules).forEach((rule) => {
        if (rule instanceof CSSStyleRule && rule.selectorText === ':root') {
          Array.from(rule.style).forEach((property) => {
            if (property.startsWith('--')) {
              const value = rule.style.getPropertyValue(property).trim();
              categorizeToken(property, value, tokens);
            }
          });
        }
      });
    } catch (e) {
      // Skip external stylesheets that might cause CORS issues
    }
  });

  return tokens;
}

/**
 * Categorizes a CSS custom property into the appropriate token category
 */
function categorizeToken(property: string, value: string, tokens: ThemeTokens): void {
  const name = property.slice(2); // Remove '--' prefix

  // Color categories
  if (name.startsWith('color-primary-')) {
    const key = name.replace('color-primary-', '');
    tokens.colors.primary[key] = value;
  } else if (name.startsWith('color-secondary-')) {
    const key = name.replace('color-secondary-', '');
    tokens.colors.secondary[key] = value;
  } else if (name.startsWith('color-neutral-')) {
    const key = name.replace('color-neutral-', '');
    tokens.colors.neutral[key] = value;
  } else if (name.startsWith('color-success-')) {
    const key = name.replace('color-success-', '');
    tokens.colors.success[key] = value;
  } else if (name.startsWith('color-warning-')) {
    const key = name.replace('color-warning-', '');
    tokens.colors.warning[key] = value;
  } else if (name.startsWith('color-error-')) {
    const key = name.replace('color-error-', '');
    tokens.colors.error[key] = value;
  } else if (name.startsWith('color-purple-')) {
    const key = name.replace('color-purple-', '');
    tokens.colors.purple[key] = value;
  } else if (name.startsWith('color-level-')) {
    const key = name.replace('color-level-', '');
    tokens.colors.level[key] = value;
  } else if (name.startsWith('color-gender-')) {
    const key = name.replace('color-gender-', '');
    tokens.colors.gender[key] = value;
  } else if (name.startsWith('color-challenge-')) {
    const key = name.replace('color-challenge-', '');
    tokens.colors.challenge[key] = value;
  } else if (name.startsWith('color-source-')) {
    const key = name.replace('color-source-', '');
    tokens.colors.source[key] = value;
  } else if (name.startsWith('color-bg-')) {
    const key = name.replace('color-bg-', '');
    tokens.colors.background[key] = value;
  } else if (name.startsWith('color-text-')) {
    const key = name.replace('color-text-', '');
    tokens.colors.text[key] = value;
  } else if (name.startsWith('color-border-')) {
    const key = name.replace('color-border-', '');
    tokens.colors.border[key] = value;
  }
  // Spacing
  else if (name.startsWith('space-')) {
    const key = name.replace('space-', '');
    tokens.spacing[key] = value;
  }
  // Typography
  else if (name.startsWith('font-size-')) {
    const key = name.replace('font-size-', '');
    tokens.typography.fontSize[key] = value;
  } else if (name.startsWith('font-weight-')) {
    const key = name.replace('font-weight-', '');
    tokens.typography.fontWeight[key] = value;
  } else if (name.startsWith('line-height-')) {
    const key = name.replace('line-height-', '');
    tokens.typography.lineHeight[key] = value;
  }
  // Border Radius
  else if (name.startsWith('radius-')) {
    const key = name.replace('radius-', '');
    tokens.borderRadius[key] = value;
  }
  // Shadows
  else if (name.startsWith('shadow-')) {
    const key = name.replace('shadow-', '');
    tokens.shadows[key] = value;
  }
  // Transitions
  else if (name.startsWith('transition-')) {
    const key = name.replace('transition-', '');
    tokens.transitions[key] = value;
  }
  // Z-Index
  else if (name.startsWith('z-')) {
    const key = name.replace('z-', '');
    tokens.zIndex[key] = value;
  }
  // Component-specific
  else if (name.startsWith('button-')) {
    const key = name.replace('button-', '');
    tokens.components.button[key] = value;
  } else if (name.startsWith('input-')) {
    const key = name.replace('input-', '');
    tokens.components.input[key] = value;
  } else if (name.startsWith('card-')) {
    const key = name.replace('card-', '');
    tokens.components.card[key] = value;
  } else if (name.match(/^(header|footer|sidebar|content)-/)) {
    tokens.components.layout[name] = value;
  }
}

/**
 * Updates a CSS custom property value
 */
export function updateThemeToken(property: string, value: string): void {
  document.documentElement.style.setProperty(property, value);
}

/**
 * Exports the current theme as JSON
 */
export function exportTheme(tokens: ThemeTokens): string {
  return JSON.stringify(tokens, null, 2);
}

/**
 * Downloads theme as a JSON file
 */
export function downloadTheme(tokens: ThemeTokens, filename = 'theme.json'): void {
  const json = exportTheme(tokens);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Imports and applies a theme from JSON
 */
export function importTheme(json: string): ThemeTokens {
  const tokens = JSON.parse(json) as ThemeTokens;
  applyTheme(tokens);
  return tokens;
}

/**
 * Applies theme tokens to CSS custom properties
 */
export function applyTheme(tokens: ThemeTokens): void {
  // Colors
  Object.entries(tokens.colors.primary).forEach(([key, value]) => {
    updateThemeToken(`--color-primary-${key}`, value);
  });
  Object.entries(tokens.colors.secondary).forEach(([key, value]) => {
    updateThemeToken(`--color-secondary-${key}`, value);
  });
  Object.entries(tokens.colors.neutral).forEach(([key, value]) => {
    updateThemeToken(`--color-neutral-${key}`, value);
  });
  Object.entries(tokens.colors.success).forEach(([key, value]) => {
    updateThemeToken(`--color-success-${key}`, value);
  });
  Object.entries(tokens.colors.warning).forEach(([key, value]) => {
    updateThemeToken(`--color-warning-${key}`, value);
  });
  Object.entries(tokens.colors.error).forEach(([key, value]) => {
    updateThemeToken(`--color-error-${key}`, value);
  });
  Object.entries(tokens.colors.purple).forEach(([key, value]) => {
    updateThemeToken(`--color-purple-${key}`, value);
  });
  Object.entries(tokens.colors.level).forEach(([key, value]) => {
    updateThemeToken(`--color-level-${key}`, value);
  });
  Object.entries(tokens.colors.gender).forEach(([key, value]) => {
    updateThemeToken(`--color-gender-${key}`, value);
  });
  Object.entries(tokens.colors.challenge).forEach(([key, value]) => {
    updateThemeToken(`--color-challenge-${key}`, value);
  });
  Object.entries(tokens.colors.source).forEach(([key, value]) => {
    updateThemeToken(`--color-source-${key}`, value);
  });
  Object.entries(tokens.colors.background).forEach(([key, value]) => {
    updateThemeToken(`--color-bg-${key}`, value);
  });
  Object.entries(tokens.colors.text).forEach(([key, value]) => {
    updateThemeToken(`--color-text-${key}`, value);
  });
  Object.entries(tokens.colors.border).forEach(([key, value]) => {
    updateThemeToken(`--color-border-${key}`, value);
  });

  // Spacing
  Object.entries(tokens.spacing).forEach(([key, value]) => {
    updateThemeToken(`--space-${key}`, value);
  });

  // Typography
  Object.entries(tokens.typography.fontSize).forEach(([key, value]) => {
    updateThemeToken(`--font-size-${key}`, value);
  });
  Object.entries(tokens.typography.fontWeight).forEach(([key, value]) => {
    updateThemeToken(`--font-weight-${key}`, value);
  });
  Object.entries(tokens.typography.lineHeight).forEach(([key, value]) => {
    updateThemeToken(`--line-height-${key}`, value);
  });

  // Border Radius
  Object.entries(tokens.borderRadius).forEach(([key, value]) => {
    updateThemeToken(`--radius-${key}`, value);
  });

  // Shadows
  Object.entries(tokens.shadows).forEach(([key, value]) => {
    updateThemeToken(`--shadow-${key}`, value);
  });

  // Transitions
  Object.entries(tokens.transitions).forEach(([key, value]) => {
    updateThemeToken(`--transition-${key}`, value);
  });

  // Z-Index
  Object.entries(tokens.zIndex).forEach(([key, value]) => {
    updateThemeToken(`--z-${key}`, value);
  });

  // Components
  Object.entries(tokens.components.button).forEach(([key, value]) => {
    updateThemeToken(`--button-${key}`, value);
  });
  Object.entries(tokens.components.input).forEach(([key, value]) => {
    updateThemeToken(`--input-${key}`, value);
  });
  Object.entries(tokens.components.card).forEach(([key, value]) => {
    updateThemeToken(`--card-${key}`, value);
  });
  Object.entries(tokens.components.layout).forEach(([key, value]) => {
    updateThemeToken(`--${key}`, value);
  });
}

/**
 * Resets theme to original values by reloading the page
 */
export function resetTheme(): void {
  // Clear any inline styles on :root
  document.documentElement.removeAttribute('style');
  // Reload to get original stylesheet values
  window.location.reload();
}

/**
 * Checks if a value is a color (hex, rgb, rgba, hsl, hsla, or color name)
 */
export function isColorValue(value: string): boolean {
  // Check for hex colors
  if (/^#[0-9a-f]{3,8}$/i.test(value)) return true;
  
  // Check for rgb/rgba
  if (/^rgba?\(/.test(value)) return true;
  
  // Check for hsl/hsla
  if (/^hsla?\(/.test(value)) return true;
  
  // Check for CSS variables (might reference colors)
  if (value.startsWith('var(--color')) return true;
  
  return false;
}

/**
 * Resolves CSS variable references to actual values
 */
export function resolveValue(value: string): string {
  if (value.startsWith('var(')) {
    const varName = value.match(/var\((--[^,)]+)/)?.[1];
    if (varName) {
      const resolvedValue = getComputedStyle(document.documentElement)
        .getPropertyValue(varName)
        .trim();
      return resolvedValue || value;
    }
  }
  return value;
}

