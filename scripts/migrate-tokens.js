#!/usr/bin/env node

/**
 * Migration script to replace hardcoded CSS values with design tokens
 * Usage: node scripts/migrate-tokens.js [file-path]
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Color mappings from hardcoded values to design tokens
const colorMappings = {
  // Primary colors
  '#3B82F6': 'var(--color-primary-500)',
  '#2563EB': 'var(--color-primary-600)',
  '#1D4ED8': 'var(--color-primary-700)',
  '#1E40AF': 'var(--color-primary-800)',
  '#1E3A8A': 'var(--color-primary-900)',
  '#60A5FA': 'var(--color-primary-400)',
  '#93C5FD': 'var(--color-primary-300)',
  
  // Secondary/Neutral colors
  '#374151': 'var(--color-border-primary)',
  '#4B5563': 'var(--color-neutral-600)',
  '#6B7280': 'var(--color-neutral-500)',
  '#9CA3AF': 'var(--color-text-muted)',
  '#D1D5DB': 'var(--color-text-tertiary)',
  '#F9FAFB': 'var(--color-text-secondary)',
  '#ffffff': 'var(--color-text-primary)',
  '#0a0a0a': 'var(--color-bg-primary)',
  '#101721': 'var(--color-bg-secondary)',
  '#1f2937': 'var(--color-bg-tertiary)',
  '#262c36': 'var(--color-bg-card)',
  
  // Success colors
  '#10B981': 'var(--color-success-500)',
  '#059669': 'var(--color-success-600)',
  '#047857': 'var(--color-success-700)',
  '#6EE7B7': 'var(--color-level-soft)',
  '#22C55E': 'var(--color-success-400)',
  '#4ADE80': 'var(--color-success-300)',
  
  // Warning colors
  '#F59E0B': 'var(--color-level-hot)',
  '#D97706': 'var(--color-warning-600)',
  '#FCD34D': 'var(--color-warning-300)',
  
  // Error colors
  '#EF4444': 'var(--color-error-500)',
  '#DC2626': 'var(--color-error-600)',
  '#B91C1C': 'var(--color-error-700)',
  '#F87171': 'var(--color-level-spicy)',
  
  // Purple colors
  '#8B5CF6': 'var(--color-purple-500)',
  '#7C3AED': 'var(--color-purple-600)',
  '#6D28D9': 'var(--color-purple-700)',
  '#A78BFA': 'var(--color-level-kinky)',
  '#A855F7': 'var(--color-purple-500)',
  '#9333EA': 'var(--color-purple-600)',
  
  // Game-specific colors
  '#ec4899': 'var(--color-gender-female)',
};

// Spacing mappings (assuming 16px = 1rem base)
const spacingMappings = {
  '0px': 'var(--space-0)',
  '4px': 'var(--space-1)',
  '8px': 'var(--space-2)',
  '12px': 'var(--space-3)',
  '16px': 'var(--space-4)',
  '20px': 'var(--space-5)',
  '24px': 'var(--space-6)',
  '32px': 'var(--space-8)',
  '40px': 'var(--space-10)',
  '48px': 'var(--space-12)',
  '64px': 'var(--space-16)',
  '80px': 'var(--space-20)',
  '96px': 'var(--space-24)',
};

// Font size mappings
const fontSizeMappings = {
  '12px': 'var(--font-size-xs)',
  '14px': 'var(--font-size-sm)',
  '16px': 'var(--font-size-base)',
  '18px': 'var(--font-size-lg)',
  '20px': 'var(--font-size-xl)',
  '24px': 'var(--font-size-2xl)',
  '30px': 'var(--font-size-3xl)',
  '36px': 'var(--font-size-4xl)',
  '48px': 'var(--font-size-5xl)',
};

// Font weight mappings
const fontWeightMappings = {
  '400': 'var(--font-weight-normal)',
  '500': 'var(--font-weight-medium)',
  '600': 'var(--font-weight-semibold)',
  '700': 'var(--font-weight-bold)',
};

// Border radius mappings
const borderRadiusMappings = {
  '0px': 'var(--radius-none)',
  '2px': 'var(--radius-sm)',
  '4px': 'var(--radius-base)',
  '6px': 'var(--radius-md)',
  '8px': 'var(--radius-lg)',
  '12px': 'var(--radius-xl)',
  '16px': 'var(--radius-2xl)',
  '24px': 'var(--radius-full)',
  '9999px': 'var(--radius-full)',
};

// Transition mappings
const transitionMappings = {
  '0.2s ease': 'var(--transition-fast)',
  '0.3s ease': 'var(--transition-base)',
  '0.5s ease': 'var(--transition-slow)',
  '150ms ease-in-out': 'var(--transition-fast)',
  '300ms ease-in-out': 'var(--transition-base)',
  '500ms ease-in-out': 'var(--transition-slow)',
};

// Z-index mappings
const zIndexMappings = {
  '100': 'var(--z-dropdown)',
  '1020': 'var(--z-sticky)',
  '1030': 'var(--z-fixed)',
  '1040': 'var(--z-modal-backdrop)',
  '1050': 'var(--z-modal)',
  '1060': 'var(--z-popover)',
  '1070': 'var(--z-tooltip)',
};

function migrateFile(filePath) {
  if (!fs.existsSync(filePath)) {
    console.error(`File not found: ${filePath}`);
    return;
  }

  let content = fs.readFileSync(filePath, 'utf8');
  let changes = 0;

  // Apply all mappings
  const allMappings = {
    ...colorMappings,
    ...spacingMappings,
    ...fontSizeMappings,
    ...fontWeightMappings,
    ...borderRadiusMappings,
    ...transitionMappings,
    ...zIndexMappings,
  };

  for (const [oldValue, newValue] of Object.entries(allMappings)) {
    const regex = new RegExp(`\\b${oldValue.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'g');
    const matches = content.match(regex);
    if (matches) {
      content = content.replace(regex, newValue);
      changes += matches.length;
    }
  }

  if (changes > 0) {
    fs.writeFileSync(filePath, content);
    console.log(`✅ Migrated ${filePath}: ${changes} replacements made`);
  } else {
    console.log(`ℹ️  No changes needed for ${filePath}`);
  }
}

function migrateDirectory(dirPath) {
  if (!fs.existsSync(dirPath)) {
    console.error(`Directory not found: ${dirPath}`);
    return;
  }

  const files = fs.readdirSync(dirPath, { recursive: true });
  const cssFiles = files.filter(file => 
    typeof file === 'string' && 
    file.endsWith('.css') && 
    !file.includes('tokens.css') &&
    !file.includes('utilities.css')
  );

  console.log(`Found ${cssFiles.length} CSS files to migrate in ${dirPath}`);
  
  for (const file of cssFiles) {
    const fullPath = path.join(dirPath, file);
    migrateFile(fullPath);
  }
}

// Main execution
const targetPath = process.argv[2] || 'src';

if (fs.statSync(targetPath).isDirectory()) {
  migrateDirectory(targetPath);
} else {
  migrateFile(targetPath);
}

console.log('🎉 Migration complete!');
