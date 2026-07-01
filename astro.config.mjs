import { defineConfig } from 'astro/config';
import vercel from '@astrojs/vercel';

// https://astro.build/config
export default defineConfig({
  // Vercel üzerinde dinamik SSR (Ziyaretçi Defteri / Galeri) çalışabilmesi için şarttır
  output: 'server',
  adapter: vercel(),

  // Vercel build loglarında patlayan [astro:env] hatasını kökten çözen şema tanımı
  env: {
    schema: {
      PUBLIC_SUPABASE_URL: { 
        type: 'string', 
        context: 'client', 
        access: 'public',
        optional: true // Değişken Vercel'de anlık okunamazsa bile build'i kilitlemez
      },
      PUBLIC_SUPABASE_KEY: { 
        type: 'string', 
        context: 'client', 
        access: 'public',
        optional: true // Çakışmaları ve eksiklikleri önlemek için opsiyonel yaptık
      },
      PUBLIC_SUPABASE_ANON_KEY: { 
        type: 'string', 
        context: 'client', 
        access: 'public',
        optional: true
      }
    }
  }
});
