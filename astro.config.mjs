import { defineConfig } from 'astro/config';
import vercel from '@astrojs/vercel'; // 1. Bu importun olduğundan emin olun

export default defineConfig({
  output: 'server', // veya 'hybrid' - SSR için bu şarttır
  adapter: vercel(), // 2. Vercel adapter'ının burada tanımlı olması gerekir
});
