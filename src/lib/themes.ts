/**
 * ── Foodlist Theme System ─────────────────────────────────────────────────────
 *
 * All site themes are defined here. This is the single source of truth.
 * CSS is generated automatically from this file — do NOT add theme variables
 * to globals.css.
 *
 * To add a new theme:
 *   1. Add its name to SiteTheme (union type below)
 *   2. Add its definition to THEMES
 *   3. Done — the theme appears in the profile picker automatically
 *
 * ── CSS variable reference ────────────────────────────────────────────────────
 *
 *   --bg           Main page background (body, full-width containers)
 *   --bg2          Secondary background (cards, bottom nav, modals, sidebars)
 *   --fg           Primary text (headings, body text, labels)
 *   --fg2          Secondary text (hints, muted labels, placeholder text)
 *   --primary      Brand accent (buttons, active nav icon, badges, links)
 *   --primary-hover  Primary color on hover/focus — usually a darker shade
 *   --primary-fg   Text/icon color on top of --primary surfaces (often #fff)
 *   --border       Borders, dividers, input outlines, list separators
 *   --nav-bg       Bottom navigation bar background (often equals --bg2)
 *   --input-bg     Input, select, textarea background (often equals --bg)
 *   --shadow       Box shadow rgba() — tint with primary for cohesion
 *
 * ── How to request a new theme ───────────────────────────────────────────────
 *
 * Give a description like:
 *   Thème "forest":
 *   - Ambiance: nature, calme, verdoyant
 *   - Fond principal: beige crème très clair
 *   - Accent: vert forêt profond
 *   - Texte: marron foncé
 *
 * Or specify the hex values directly using the variable names above.
 */

// ── Type definitions ──────────────────────────────────────────────────────────

export type SiteTheme = 'dark' | 'pure' | 'light' | 'happy' | 'japon' | 'girly' | 'kawaii' | 'foret' | 'space'

export interface ThemeVars {
  '--bg': string
  '--bg2': string
  '--fg': string
  '--fg2': string
  '--primary': string
  '--primary-hover': string
  '--primary-fg': string
  '--border': string
  '--nav-bg': string
  '--input-bg': string
  '--shadow': string
  '--radius': string
  '--radius-lg': string
  '--font': string
}

export interface ThemeDef {
  label: string           // Displayed in the profile picker
  description: string     // Short subtitle in the picker
  preview: {              // Three color swatches shown in the picker
    bg: string
    primary: string
    fg: string
  }
  vars: ThemeVars
  bodyCSS?: string        // Extra CSS applied to body when this theme is active
  navIcons?: {            // Custom nav icon labels (emoji or short text)
    shopping: string
    stock: string
    recipes: string
    profile: string
    mic: string
  }
}

// ── Theme definitions ─────────────────────────────────────────────────────────

export const THEMES: Record<SiteTheme, ThemeDef> = {

  dark: {
    label: 'Dark',
    description: 'Mode sombre',
    preview: { bg: '#0f172a', primary: '#60a5fa', fg: '#f1f5f9' },
    vars: {
      '--bg':            '#0f172a',
      '--bg2':           '#1e293b',
      '--fg':            '#f1f5f9',
      '--fg2':           '#94a3b8',
      '--primary':       '#60a5fa',
      '--primary-hover': '#3b82f6',
      '--primary-fg':    '#0f172a',
      '--border':        '#334155',
      '--nav-bg':        '#1e293b',
      '--input-bg':      '#1e293b',
      '--shadow':        'rgba(0, 0, 0, 0.4)',
      '--radius':        '8px',
      '--radius-lg':     '12px',
      '--font':          'system-ui, -apple-system, BlinkMacSystemFont, sans-serif',
    },
  },

  pure: {
    label: 'Pure',
    description: 'Blanc épuré',
    preview: { bg: '#fff', primary: '#374151', fg: '#111827' },
    vars: {
      '--bg':            '#fff',
      '--bg2':           '#fff',
      '--fg':            '#111827',
      '--fg2':           '#6b7280',
      '--primary':       '#374151',
      '--primary-hover': '#1f2937',
      '--primary-fg':    '#fff',
      '--border':        '#f3f4f6',
      '--nav-bg':        '#fff',
      '--input-bg':      '#fff',
      '--shadow':        'rgba(0, 0, 0, 0.05)',
      '--radius':        '8px',
      '--radius-lg':     '12px',
      '--font':          'system-ui, -apple-system, BlinkMacSystemFont, sans-serif',
    },
  },

  light: {
    label: 'Light',
    description: 'Bleu ciel',
    preview: { bg: '#f0f9ff', primary: '#0284c7', fg: '#0c4a6e' },
    vars: {
      '--bg':            '#f0f9ff',
      '--bg2':           '#e0f2fe',
      '--fg':            '#0c4a6e',
      '--fg2':           '#0369a1',
      '--primary':       '#0284c7',
      '--primary-hover': '#0369a1',
      '--primary-fg':    '#fff',
      '--border':        '#bae6fd',
      '--nav-bg':        '#e0f2fe',
      '--input-bg':      '#f0f9ff',
      '--shadow':        'rgba(2, 132, 199, 0.1)',
      '--radius':        '8px',
      '--radius-lg':     '12px',
      '--font':          'system-ui, -apple-system, BlinkMacSystemFont, sans-serif',
    },
  },

  happy: {
    label: 'Happy',
    description: 'Orange chaleureux',
    preview: { bg: '#fffbeb', primary: '#f97316', fg: '#1c1917' },
    vars: {
      '--bg':            '#fffbeb',
      '--bg2':           '#fef3c7',
      '--fg':            '#1c1917',
      '--fg2':           '#92400e',
      '--primary':       '#f97316',
      '--primary-hover': '#ea580c',
      '--primary-fg':    '#fff',
      '--border':        '#fde68a',
      '--nav-bg':        '#fef3c7',
      '--input-bg':      '#fffbeb',
      '--shadow':        'rgba(249, 115, 22, 0.1)',
      '--radius':        '14px',
      '--radius-lg':     '18px',
      '--font':          "'Nunito', system-ui, sans-serif",
    },
    navIcons: { shopping: '☀️', stock: '🌻', recipes: '🍳', profile: '😊', mic: '☀️' },
    bodyCSS: `background-image: url(/patterns/happy-bg.svg); background-repeat: repeat;`,
  },

  japon: {
    label: 'Japon',
    description: 'Papier washi & laque rouge',
    preview: { bg: '#fdf4e3', primary: '#c0151a', fg: '#1c0a00' },
    vars: {
      '--bg':            '#fdf4e3',
      '--bg2':           '#f5e8cc',
      '--fg':            '#1c0a00',
      '--fg2':           '#7a4a28',
      '--primary':       '#c0151a',
      '--primary-hover': '#960e13',
      '--primary-fg':    '#fff',
      '--border':        '#e0c898',
      '--nav-bg':        '#f5e8cc',
      '--input-bg':      '#fdf4e3',
      '--shadow':        'rgba(192, 21, 26, 0.15)',
      '--radius':        '4px',
      '--radius-lg':     '6px',
      '--font':          "'Noto Serif JP', Georgia, serif",
    },
    navIcons: { shopping: '⛩️', stock: '📦', recipes: '🍱', profile: '🎎', mic: '🗻' },
    bodyCSS: `background-image: url(/patterns/japon-bg.svg); background-repeat: repeat;`,
  },

  girly: {
    label: 'Girly',
    description: 'Rose bonbon & mauve',
    preview: { bg: '#fff5fb', primary: '#f72d8c', fg: '#2d0a1e' },
    vars: {
      '--bg':            '#fff5fb',
      '--bg2':           '#ffe4f5',
      '--fg':            '#2d0a1e',
      '--fg2':           '#b05090',
      '--primary':       '#f72d8c',
      '--primary-hover': '#d1196d',
      '--primary-fg':    '#fff',
      '--border':        '#ffaad8',
      '--nav-bg':        '#ffe4f5',
      '--input-bg':      '#fff5fb',
      '--shadow':        'rgba(247, 45, 140, 0.12)',
      '--radius':        '18px',
      '--radius-lg':     '22px',
      '--font':          "'Quicksand', system-ui, sans-serif",
    },
    navIcons: { shopping: '🍬', stock: '🛍️', recipes: '🧁', profile: '🎀', mic: '🍭' },
    bodyCSS: `background-image: url(/patterns/girly-bg.svg); background-repeat: repeat;`,
  },

  kawaii: {
    label: 'Kawaii',
    description: 'Pastel bleu & shiba',
    preview: { bg: '#eef4fb', primary: '#6a9fd8', fg: '#1e2d40' },
    vars: {
      '--bg':            '#eef4fb',
      '--bg2':           '#dfeaf5',
      '--fg':            '#1e2d40',
      '--fg2':           '#6880a0',
      '--primary':       '#6a9fd8',
      '--primary-hover': '#5588c0',
      '--primary-fg':    '#fff',
      '--border':        '#b8d0e8',
      '--nav-bg':        '#dfeaf5',
      '--input-bg':      '#eef4fb',
      '--shadow':        'rgba(106, 159, 216, 0.12)',
      '--radius':        '16px',
      '--radius-lg':     '20px',
      '--font':          "'Quicksand', system-ui, sans-serif",
    },
    navIcons: { shopping: '🛒', stock: '🐾', recipes: '🍳', profile: '🐱', mic: '🌸' },
    bodyCSS: `background-image: url(/patterns/kawaii-bg.svg); background-repeat: repeat;`,
  },

  foret: {
    label: 'Forêt',
    description: 'Forêt au soleil couchant',
    preview: { bg: '#2a3a20', primary: '#8fbc6a', fg: '#e8eed8' },
    vars: {
      '--bg':            '#2a3a20',
      '--bg2':           '#344828',
      '--fg':            '#e8eed8',
      '--fg2':           '#a0b888',
      '--primary':       '#8fbc6a',
      '--primary-hover': '#7aaa55',
      '--primary-fg':    '#1a2810',
      '--border':        '#4a6038',
      '--nav-bg':        '#2e4024',
      '--input-bg':      '#344828',
      '--shadow':        'rgba(143, 188, 106, 0.15)',
      '--radius':        '10px',
      '--radius-lg':     '14px',
      '--font':          "'Nunito', system-ui, sans-serif",
    },
    navIcons: { shopping: '🍂', stock: '🌰', recipes: '🍄', profile: '🦊', mic: '🌲' },
    bodyCSS: `background-image: url(/patterns/foret-bg.svg); background-repeat: repeat;`,
  },

  space: {
    label: 'Space',
    description: 'Cosmos & étoiles',
    preview: { bg: '#0b0d1a', primary: '#7c6ef0', fg: '#e8e6f0' },
    vars: {
      '--bg':            '#0b0d1a',
      '--bg2':           '#141828',
      '--fg':            '#e8e6f0',
      '--fg2':           '#8a86a8',
      '--primary':       '#7c6ef0',
      '--primary-hover': '#6558d4',
      '--primary-fg':    '#fff',
      '--border':        '#2a2d45',
      '--nav-bg':        '#101325',
      '--input-bg':      '#141828',
      '--shadow':        'rgba(124, 110, 240, 0.15)',
      '--radius':        '10px',
      '--radius-lg':     '14px',
      '--font':          'system-ui, -apple-system, BlinkMacSystemFont, sans-serif',
    },
    navIcons: { shopping: '🚀', stock: '🌍', recipes: '⭐', profile: '👨‍🚀', mic: '📡' },
    bodyCSS: `background-image: url(/patterns/space-bg.svg); background-repeat: repeat;`,
  },

}

// ── Derived exports (used by profile picker and auth) ─────────────────────────

/** Flat metadata map — used by the profile theme picker UI */
export const SITE_THEMES: Record<SiteTheme, { label: string; description: string; bg: string; primary: string; fg: string }> =
  Object.fromEntries(
    Object.entries(THEMES).map(([key, def]) => [
      key,
      { label: def.label, description: def.description, ...def.preview },
    ])
  ) as Record<SiteTheme, { label: string; description: string; bg: string; primary: string; fg: string }>

// ── CSS generation ────────────────────────────────────────────────────────────

/** Generates the full CSS string for all themes, injected in layout.tsx.
 *  `dark` is the CSS root default. `[data-theme="default"]` also maps to dark
 *  for backwards compatibility with any stored cookies. */
export function generateThemeCSS(): string {
  return Object.entries(THEMES)
    .map(([name, def]) => {
      const selector = name === 'dark'
        ? ':root, [data-theme="dark"], [data-theme="default"]'
        : `[data-theme="${name}"]`
      const vars = Object.entries(def.vars)
        .map(([k, v]) => `  ${k}: ${v};`)
        .join('\n')
      let css = `${selector} {\n${vars}\n}`
      if (def.bodyCSS) {
        css += `\n[data-theme="${name}"] body { ${def.bodyCSS} }`
      }
      return css
    })
    .join('\n\n')
}
