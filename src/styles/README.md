# Styling Architecture - Truth or Dare Game

This document outlines the styling architecture and design system for the Truth or Dare game.

## Overview

The styling architecture is built on a foundation of design tokens, utility classes, and component-specific styles. This approach provides:

- **Consistency**: All components use the same design tokens
- **Maintainability**: Changes to design tokens automatically update all components
- **Scalability**: Easy to add new components and themes
- **Performance**: Optimized CSS with minimal redundancy

## File Structure

```
src/styles/
├── tokens.css          # Design tokens (colors, spacing, typography, etc.)
├── utilities.css       # Utility classes for common patterns
├── index.css          # Base styles and imports
└── README.md          # This documentation
```

## Design Tokens

### Color System

The color system is organized into semantic categories:

#### Primary Colors
- `--color-primary-50` to `--color-primary-900`: Blue color scale
- Used for: Primary actions, links, focus states

#### Secondary Colors
- `--color-secondary-50` to `--color-secondary-900`: Gray color scale
- Used for: Secondary elements, borders, backgrounds

#### Semantic Colors
- **Success**: `--color-success-*` (Green scale)
- **Warning**: `--color-warning-*` (Yellow/Orange scale)
- **Error**: `--color-error-*` (Red scale)
- **Purple**: `--color-purple-*` (Purple scale for Kinky level)

#### Game-Specific Colors
- **Level Colors**: `--color-level-soft`, `--color-level-mild`, etc.
- **Gender Colors**: `--color-gender-male`, `--color-gender-female`
- **Challenge Colors**: `--color-challenge-truth`, `--color-challenge-dare`
- **Source Colors**: `--color-source-custom`, `--color-source-game`

#### Background Colors
- `--color-bg-primary`: Main background (#0a0a0a)
- `--color-bg-secondary`: Secondary background (#101721)
- `--color-bg-tertiary`: Tertiary background (#1f2937)
- `--color-bg-card`: Card backgrounds (#262c36)
- `--color-bg-input`: Input backgrounds (#374151)

#### Text Colors
- `--color-text-primary`: Primary text (#ffffff)
- `--color-text-secondary`: Secondary text (#f9fafb)
- `--color-text-tertiary`: Tertiary text (#d1d5db)
- `--color-text-muted`: Muted text (#9ca3af)
- `--color-text-disabled`: Disabled text (#6b7280)

### Spacing Scale

The spacing scale uses a consistent 4px base unit:

```css
--space-0: 0;           /* 0px */
--space-1: 0.25rem;     /* 4px */
--space-2: 0.5rem;      /* 8px */
--space-3: 0.75rem;     /* 12px */
--space-4: 1rem;        /* 16px */
--space-5: 1.25rem;     /* 20px */
--space-6: 1.5rem;      /* 24px */
--space-8: 2rem;        /* 32px */
--space-10: 2.5rem;     /* 40px */
--space-12: 3rem;       /* 48px */
--space-16: 4rem;       /* 64px */
--space-20: 5rem;       /* 80px */
--space-24: 6rem;       /* 96px */
```

### Typography Scale

```css
--font-size-xs: 0.75rem;    /* 12px */
--font-size-sm: 0.875rem;   /* 14px */
--font-size-base: 1rem;     /* 16px */
--font-size-lg: 1.125rem;   /* 18px */
--font-size-xl: 1.25rem;    /* 20px */
--font-size-2xl: 1.5rem;    /* 24px */
--font-size-3xl: 1.875rem;  /* 30px */
--font-size-4xl: 2.25rem;   /* 36px */
--font-size-5xl: 3rem;      /* 48px */
```

### Border Radius

```css
--radius-none: 0;
--radius-sm: 0.125rem;   /* 2px */
--radius-base: 0.25rem;  /* 4px */
--radius-md: 0.375rem;   /* 6px */
--radius-lg: 0.5rem;     /* 8px */
--radius-xl: 0.75rem;    /* 12px */
--radius-2xl: 1rem;      /* 16px */
--radius-full: 9999px;
```

### Transitions

```css
--transition-fast: 150ms ease-in-out;
--transition-base: 300ms ease-in-out;
--transition-slow: 500ms ease-in-out;
```

## Utility Classes

### Layout Utilities

```css
.flex, .flex-col, .flex-row
.items-center, .items-start, .items-end
.justify-center, .justify-between, .justify-start, .justify-end
.gap-1, .gap-2, .gap-3, .gap-4, .gap-6, .gap-8
```

### Spacing Utilities

```css
.p-0, .p-1, .p-2, .p-3, .p-4, .p-6, .p-8
.px-0, .px-1, .px-2, .px-3, .px-4, .px-6, .px-8
.py-0, .py-1, .py-2, .py-3, .py-4, .py-6, .py-8
.m-0, .m-1, .m-2, .m-3, .m-4, .m-6, .m-8
.mx-auto, .my-auto
```

### Typography Utilities

```css
.text-xs, .text-sm, .text-base, .text-lg, .text-xl, .text-2xl, .text-3xl, .text-4xl, .text-5xl
.font-normal, .font-medium, .font-semibold, .font-bold
.leading-tight, .leading-normal, .leading-relaxed
.text-center, .text-left, .text-right
```

### Color Utilities

```css
.text-primary, .text-secondary, .text-tertiary, .text-muted, .text-disabled
.text-success, .text-warning, .text-error
.bg-primary, .bg-secondary, .bg-tertiary, .bg-card
```

### Border Utilities

```css
.border, .border-2, .border-t, .border-b, .border-l, .border-r
.border-focus, .border-error
.rounded, .rounded-sm, .rounded-md, .rounded-lg, .rounded-xl, .rounded-2xl, .rounded-full
```

### Component Base Classes

```css
.button-base     /* Base button styles */
.input-base      /* Base input styles */
.card-base       /* Base card styles */
.pill-base       /* Base pill styles */
```

## Usage Guidelines

### 1. Use Design Tokens

Always use design tokens instead of hardcoded values:

```css
/* ✅ Good */
.button {
  background: var(--color-primary-500);
  padding: var(--space-3) var(--space-4);
  border-radius: var(--radius-md);
  font-size: var(--font-size-base);
}

/* ❌ Bad */
.button {
  background: #3b82f6;
  padding: 12px 16px;
  border-radius: 6px;
  font-size: 16px;
}
```

### 2. Use Utility Classes

Use utility classes for common patterns:

```jsx
// ✅ Good
<div className="flex items-center gap-4 p-6 bg-card rounded-lg">
  <span className="text-lg font-semibold text-primary">Title</span>
</div>

// ❌ Bad
<div style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '24px', backgroundColor: '#262c36', borderRadius: '8px' }}>
  <span style={{ fontSize: '18px', fontWeight: '600', color: '#3b82f6' }}>Title</span>
</div>
```

### 3. Component-Specific Styles

Use component-specific styles for complex components:

```css
/* Component.module.css */
.complexComponent {
  /* Use design tokens */
  background: var(--color-bg-card);
  border: 2px solid var(--color-border-primary);
  border-radius: var(--radius-lg);
  padding: var(--space-6);
  box-shadow: var(--shadow-base);
}

.complexComponent:hover {
  border-color: var(--color-border-focus);
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
}
```

### 4. Responsive Design

Use responsive utilities for mobile-first design:

```css
.responsiveComponent {
  padding: var(--space-4);
}

@media (max-width: 768px) {
  .responsiveComponent {
    padding: var(--space-2);
  }
}

/* Or use utility classes */
<div className="p-4 mobile:p-2">
```

## Migration Guide

### From Hardcoded Values to Design Tokens

1. **Identify hardcoded values** in your CSS
2. **Find the appropriate design token** in `tokens.css`
3. **Replace the hardcoded value** with the token
4. **Test the component** to ensure it looks correct

### Example Migration

```css
/* Before */
.oldComponent {
  background: #374151;
  color: #ffffff;
  padding: 16px;
  border-radius: 8px;
  font-size: 14px;
}

/* After */
.newComponent {
  background: var(--color-bg-input);
  color: var(--color-text-primary);
  padding: var(--space-4);
  border-radius: var(--radius-lg);
  font-size: var(--font-size-sm);
}
```

## Best Practices

1. **Always use design tokens** for colors, spacing, typography, and other design values
2. **Use utility classes** for simple styling needs
3. **Create component-specific styles** for complex components
4. **Follow the naming conventions** established in the design system
5. **Test on multiple screen sizes** to ensure responsive design works
6. **Use semantic color tokens** (e.g., `--color-text-primary` instead of `--color-neutral-900`)
7. **Keep component styles focused** on component-specific needs
8. **Use CSS custom properties** for dynamic theming when needed

## Future Enhancements

- **Dark/Light theme support** using CSS custom properties
- **Component variants** using CSS custom properties
- **Animation tokens** for consistent motion design
- **Breakpoint tokens** for responsive design
- **Component composition** utilities for complex layouts
