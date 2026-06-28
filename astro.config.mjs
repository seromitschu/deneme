import { defineConfig } from 'astro/config';
import vercel from '@astrojs/vercel'; // Bu satır eklenmeli

export default defineConfig({
  output: 'server', // Vercel'de SSR (dinamik) çalışması için bu şart
  adapter: vercel(), // Vercel adaptörü
});