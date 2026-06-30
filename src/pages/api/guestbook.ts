import type { APIRoute } from 'astro';
import { createClient } from '@supabase/supabase-js';

export const prerender = false;

const supabaseUrl = 
  (typeof process !== 'undefined' && process.env ? process.env.PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL : '') || 
  'https://brfcnnlvrywtplfacwcv.supabase.co'; 

const supabaseKey = 
  (typeof process !== 'undefined' && process.env ? process.env.PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY : '') || 
  'sb_publishable_fAWMggTPsfco2IhadpQFJQ_rdm5LsA9';

const supabase = createClient(supabaseUrl, supabaseKey);

export const POST: APIRoute = async ({ request }) => {
  try {
    const data = await request.formData();
    const name = data.get('name')?.toString().trim();
    const message = data.get('message')?.toString().trim();

    if (!name || !message) {
      return new Response(JSON.stringify({ error: "Ad veya mesaj alanı boş bırakılamaz." }), { status: 400 });
    }

    const { data: insertedData, error } = await supabase
      .from('guestbook')
      .insert([{ name, message }])
      .select();

    if (error) throw error;

    return new Response(JSON.stringify({ success: true, data: insertedData[0] }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
};