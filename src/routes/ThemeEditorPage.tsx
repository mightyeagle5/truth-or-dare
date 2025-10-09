import { ThemeEditor } from '../components/dev';
import { PageLayout } from '../components/layout';

export function ThemeEditorPage() {
  return (
    <PageLayout>
      <div style={{ 
        padding: 'var(--space-8)', 
        maxWidth: 'var(--content-max-width)', 
        margin: '0 auto' 
      }}>
        <h1 style={{ 
          fontSize: 'var(--font-size-4xl)', 
          fontWeight: 'var(--font-weight-bold)',
          marginBottom: 'var(--space-4)',
          color: 'var(--color-text-primary)'
        }}>
          Theme Editor
        </h1>
        <p style={{ 
          fontSize: 'var(--font-size-lg)', 
          color: 'var(--color-text-tertiary)',
          marginBottom: 'var(--space-8)'
        }}>
          Click the "Theme Editor" button in the top-right corner to customize the app's colors and design tokens.
          You can export your theme as JSON and import it later to test different variants.
        </p>
        
        <div style={{
          background: 'var(--color-bg-card)',
          border: '2px solid var(--color-border-primary)',
          borderRadius: 'var(--radius-lg)',
          padding: 'var(--space-6)',
          marginBottom: 'var(--space-6)'
        }}>
          <h2 style={{ 
            fontSize: 'var(--font-size-2xl)', 
            fontWeight: 'var(--font-weight-semibold)',
            marginBottom: 'var(--space-4)',
            color: 'var(--color-text-secondary)'
          }}>
            Quick Guide
          </h2>
          <ul style={{ 
            color: 'var(--color-text-tertiary)',
            fontSize: 'var(--font-size-base)',
            lineHeight: 'var(--line-height-relaxed)',
            paddingLeft: 'var(--space-6)'
          }}>
            <li style={{ marginBottom: 'var(--space-2)' }}>
              <strong>Edit Colors:</strong> Click on color swatches to use the color picker, or type hex/rgb values directly
            </li>
            <li style={{ marginBottom: 'var(--space-2)' }}>
              <strong>Search:</strong> Use the search box to quickly find specific tokens
            </li>
            <li style={{ marginBottom: 'var(--space-2)' }}>
              <strong>Export:</strong> Save your current theme as a JSON file
            </li>
            <li style={{ marginBottom: 'var(--space-2)' }}>
              <strong>Import:</strong> Load a previously saved theme from JSON
            </li>
            <li style={{ marginBottom: 'var(--space-2)' }}>
              <strong>Reset:</strong> Restore default theme values (requires page reload)
            </li>
          </ul>
        </div>

        <div style={{
          background: 'var(--color-bg-card)',
          border: '2px solid var(--color-border-primary)',
          borderRadius: 'var(--radius-lg)',
          padding: 'var(--space-6)'
        }}>
          <h2 style={{ 
            fontSize: 'var(--font-size-2xl)', 
            fontWeight: 'var(--font-weight-semibold)',
            marginBottom: 'var(--space-4)',
            color: 'var(--color-text-secondary)'
          }}>
            Test Your Theme
          </h2>
          <p style={{ 
            color: 'var(--color-text-tertiary)',
            fontSize: 'var(--font-size-base)',
            lineHeight: 'var(--line-height-relaxed)',
            marginBottom: 'var(--space-4)'
          }}>
            Navigate to different pages to see how your theme changes affect the entire app:
          </p>
          <div style={{ 
            display: 'flex', 
            gap: 'var(--space-3)',
            flexWrap: 'wrap'
          }}>
            <a 
              href="/" 
              style={{
                padding: 'var(--space-3) var(--space-4)',
                background: 'var(--color-primary-600)',
                color: 'var(--color-text-primary)',
                borderRadius: 'var(--radius-md)',
                textDecoration: 'none',
                fontSize: 'var(--font-size-sm)',
                fontWeight: 'var(--font-weight-medium)',
                transition: 'background var(--transition-fast)'
              }}
            >
              🏠 Home Page
            </a>
            <a 
              href="/create-custom-game" 
              style={{
                padding: 'var(--space-3) var(--space-4)',
                background: 'var(--color-primary-600)',
                color: 'var(--color-text-primary)',
                borderRadius: 'var(--radius-md)',
                textDecoration: 'none',
                fontSize: 'var(--font-size-sm)',
                fontWeight: 'var(--font-weight-medium)',
                transition: 'background var(--transition-fast)'
              }}
            >
              ➕ Create Custom Game
            </a>
            <a 
              href="/admin/edit-challenges" 
              style={{
                padding: 'var(--space-3) var(--space-4)',
                background: 'var(--color-primary-600)',
                color: 'var(--color-text-primary)',
                borderRadius: 'var(--radius-md)',
                textDecoration: 'none',
                fontSize: 'var(--font-size-sm)',
                fontWeight: 'var(--font-weight-medium)',
                transition: 'background var(--transition-fast)'
              }}
            >
              ⚙️ Admin Page
            </a>
          </div>
        </div>
      </div>
      
      <ThemeEditor />
    </PageLayout>
  );
}

