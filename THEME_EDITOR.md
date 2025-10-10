# Theme Editor

The theme editor is hidden by default but can be enabled for development.

## How to Enable

### Method 1: URL Parameter (Recommended)
Add `?themeEditor=true` to any URL in dev mode:
```
http://localhost:5173/?themeEditor=true
```

This will automatically save the preference to localStorage.

### Method 2: Browser Console
Open browser console (F12) and run:
```javascript
localStorage.setItem('enableThemeEditor', 'true')
```

Then refresh the page.

## How to Disable

### Method 1: Browser Console
```javascript
localStorage.removeItem('enableThemeEditor')
```

Then refresh the page.

### Method 2: Clear localStorage
Simply clear your browser's localStorage for the site.

## Features

- **Live CSS Variable Editing**: Edit all CSS custom properties in real-time
- **Search**: Filter properties by name
- **Categories**: Organized by colors, spacing, typography, etc.
- **Export**: Export selected properties to JSON (check boxes first)
- **Import**: Import JSON to update only selected properties
- **Reset**: Reset all properties to default values

## Location

The theme editor appears as a floating panel on the left side of the screen (only in dev mode when enabled).

