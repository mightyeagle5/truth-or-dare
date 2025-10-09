# Theme Editor

A development tool for testing and customizing the app's visual design tokens in real-time.

## Overview

The Theme Editor allows you to:
- **Live Edit**: Modify all CSS custom properties (colors, spacing, typography, etc.) in real-time
- **Export Themes**: Save your customizations as JSON files
- **Import Themes**: Load previously saved themes to test different design variants
- **Systematic Testing**: All design tokens are organized by category for easy navigation

## Access

The Theme Editor is only available in **development mode** and can be accessed at:
- **Direct URL**: `http://localhost:5173/dev/theme-editor`
- **From Home Page**: Click the "🎨 Theme" link in the top-right corner (only visible in dev mode)

## Features

### 🎨 Live Color Editing
- Click on color swatches to use the browser's color picker
- Type hex, rgb, rgba, hsl, or color names directly
- Changes apply instantly across all pages
- Organized by category: Primary, Secondary, Success, Warning, Error, etc.

### 📏 Token Categories
All design tokens are organized into categories:
- **Colors**: All color palettes including game-specific colors (levels, genders, challenges)
- **Spacing**: Padding, margin, and gap values
- **Typography**: Font sizes, weights, and line heights
- **Border Radius**: Rounded corner values
- **Shadows**: Box shadow presets
- **Transitions**: Animation timing values
- **Z-Index**: Layer stacking values
- **Components**: Component-specific tokens (buttons, inputs, cards, layout)

### 🔍 Search Functionality
Use the search box to quickly find specific tokens by name. For example:
- Search "primary" to find all primary color tokens
- Search "button" to find all button-related tokens
- Search "space" to find all spacing tokens

### 💾 Export/Import
- **Export**: Click the "💾 Export" button to download the current theme as a JSON file
  - Files are automatically named with a timestamp: `theme-2025-10-09T12-30-45.json`
- **Import**: Click the "📥" icon in the header to upload a previously saved theme JSON file
  - Theme changes apply immediately
  - Invalid JSON files will show an error notification

### 🔄 Reset
Click the "🔄 Reset" button to restore all tokens to their original values from `tokens.css`. This requires a page reload.

## Sample Themes

Two sample theme files are included in the `theme-samples/` directory:
- **`dark-purple-theme.json`**: A purple/violet themed variant
- **`ocean-blue-theme.json`**: A cyan/blue ocean-inspired variant

To test a sample theme:
1. Navigate to `/dev/theme-editor`
2. Click the Theme Editor button (top-right)
3. Click the import icon (📥)
4. Select one of the sample JSON files
5. Navigate through the app to see the changes

## Testing Your Theme

After making changes in the Theme Editor, test them across all pages:
- **Home Page**: `/` - See how your theme affects the setup form, player list, and buttons
- **Create Custom Game**: `/create-custom-game` - Test form inputs and custom game creation UI
- **Game Page**: Start a game to see how themes affect the choice screen and item screen
- **Admin Page**: `/admin/edit-challenges` - Test complex forms and data tables

## Technical Details

### Architecture
- **Utility**: `src/lib/themeUtils.ts` - Token extraction, parsing, and management
- **Component**: `src/components/dev/ThemeEditor.tsx` - Main UI component
- **Page**: `src/routes/ThemeEditorPage.tsx` - Dedicated route with instructions
- **Route**: `/dev/theme-editor` - Accessible only in development mode

### How It Works
1. Extracts all CSS custom properties from `:root` using `getComputedStyle()`
2. Categorizes tokens based on naming conventions (e.g., `--color-primary-500`)
3. Updates CSS variables in real-time using `document.documentElement.style.setProperty()`
4. Changes are runtime-only and don't modify source files
5. Export/import uses JSON for portability

### JSON Structure
The exported JSON mirrors the CSS variable structure:
```json
{
  "colors": {
    "primary": { "50": "#eff6ff", "100": "#dbeafe", ... },
    "background": { "primary": "#0a0a0a", ... }
  },
  "spacing": { "1": "0.25rem", "2": "0.5rem", ... },
  "typography": { "fontSize": { ... }, "fontWeight": { ... } },
  ...
}
```

## Workflow

### Creating a New Theme Variant
1. Open the Theme Editor
2. Make your desired changes using color pickers and inputs
3. Export the theme with a descriptive filename
4. Test the theme across different pages
5. Iterate as needed

### Comparing Themes
1. Export your current theme
2. Import a different theme
3. Navigate through pages to compare
4. Import your original theme to switch back
5. Choose the best variant

### Finding the Perfect Colors
1. Use the search to find related tokens (e.g., "background")
2. Adjust multiple related tokens together for consistency
3. Test in both light and dark areas of the app
4. Check contrast ratios for accessibility
5. Export when satisfied

## Development Only

**Important**: The Theme Editor is a temporary development tool and should not be deployed to production. It's automatically hidden when:
- `import.meta.env.DEV` is false (production build)
- The route `/dev/theme-editor` will 404 in production

## Cleanup

When you're done testing themes and want to remove the Theme Editor:
1. Delete the `/dev/theme-editor` route from `src/App.tsx`
2. Delete `src/components/dev/` directory
3. Delete `src/lib/themeUtils.ts`
4. Delete `src/routes/ThemeEditorPage.tsx`
5. Delete the theme link from `src/routes/HomePage.tsx`
6. Delete `theme-samples/` directory
7. Delete this README

Or simply merge the feature branch and delete it when done, then remove the files in a cleanup commit.

