import { defineConfig } from 'astro/config';
import vercel from '@astrojs/vercel';

// https://astro.build/config
export default defineConfig({
  // Vercel üzerinde Ziyaretçi Defteri ve Galeri gibi dinamik yapıların çalışması için SSR modu şart
  output: 'server',
  adapter: vercel(),
  
  // Astro'nun build'i durduran katı şema kontrolünü tamamen kaldırıyoruz.
  // Çevre değişkenleri artık doğrudan kod içinden (runtime/çalışma zamanında) okunacak.
  env: {
    schema: {}
  }
});
