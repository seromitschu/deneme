import { createClient } from '@supabase/supabase-js';

export const prerender = false;

export async function POST({ request }) {
  try {
    const formData = await request.formData();
    const name = formData.get('name')?.toString() || 'anonim';
    const message = formData.get('message')?.toString() || '';

    if (!message.trim()) {
      return new Response(JSON.stringify({ success: false, error: "Mesaj boş olamaz." }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Env hiyerarşik taraması (API tarafında da garantiye alıyoruz)
const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL;
const supabaseKey = import.meta.env.PUBLIC_SUPABASE_KEY;

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Veritabanına ekle
    const { data, error } = await supabase
      .from('guestbook')
      .insert([{ name, message }])
      .select()
      .single();

    if (error) {
      return new Response(JSON.stringify({ success: false, error: error.message }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // TEK BİR BAŞARILI CEVAP DÖNÜLÜYOR (ResponseSentError'u engeller)
    return new Response(JSON.stringify({ success: true, data }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (err) {
    return new Response(JSON.stringify({ success: false, error: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}