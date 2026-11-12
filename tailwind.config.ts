import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Master Palette - Backgrounds
        'warm-gray': '#EAECE9',       // Main Background
        'soft-sage': '#E2E9E3',       // Secondary / Sidebar
        'muted-ivory': '#F4F5F1',     // Content Surface (Cards)
        'soft-neutral': '#ECEFEA',    // Elevated Surface
        'light-sage': '#E9ECE7',      // Input Background

        // Master Palette - Brand
        'navy': {
          DEFAULT: '#34495E',
          hover: '#293B4D',
          dark: '#1F2D3A',
        },
        'teal': {
          DEFAULT: '#648F87',
          hover: '#527B73',
          pale: '#DCE8E2',
        },

        // Master Palette - Typography
        'text-heading': '#2E3B40',
        'text-main': '#344047',
        'text-secondary': '#69777A',
        'text-muted': '#87918F',
        'text-disabled': '#A5ADA8',

        // Master Palette - Borders
        'border-soft': '#D9DFDA',
        'divider': '#DDE2DC',

        // Master Palette - Status
        'status-success': {
          text: '#548C75',
          bg: '#E1EDE4',
        },
        'status-warning': {
          text: '#9A7137',
          bg: '#F2EBDD',
        },
        'status-danger': {
          text: '#A95353',
          bg: '#F2E3E1',
        },
        'status-info': {
          text: '#527493',
          bg: '#E3EAF0',
        },
      },
      borderRadius: {
        'card': '14px',
        'btn': '10px',
        'input': '10px',
      },
      boxShadow: {
        'soft': '0 2px 8px -2px rgba(46, 59, 64, 0.05), 0 1px 3px -1px rgba(46, 59, 64, 0.03)',
        'modal': '0 16px 36px -8px rgba(46, 59, 64, 0.12), 0 4px 12px -2px rgba(46, 59, 64, 0.06)',
      },
      fontFamily: {
        sans: ['Inter', 'Plus Jakarta Sans', 'system-ui', '-apple-system', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
export default config;
