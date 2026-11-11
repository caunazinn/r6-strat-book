import type { Config } from 'tailwindcss';
const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: { ink: '#0b141b', panel: '#12212c', line: '#1f3646', blueprint: '#4fa3d1', amber: '#f2b134', atk: '#e8553d', def: '#3ea0d8' },
    },
  },
  plugins: [],
};
export default config;
