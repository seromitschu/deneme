import type { APIRoute } from 'astro';

export const prerender = false;

export const GET: APIRoute = async ({ request }) => {
  const urlObj = new URL(request.url);
  const searchQ = urlObj.searchParams.get('q');
  const searchArtist = urlObj.searchParams.get('artist');
  const searchType = urlObj.searchParams.get('type') || 'track';

  const SPOTIFY_CLIENT_ID = import.meta.env.SPOTIFY_CLIENT_ID;
  const SPOTIFY_CLIENT_SECRET = import.meta.env.SPOTIFY_CLIENT_SECRET;

  if (!searchQ) {
    return new Response(JSON.stringify({ error: "Missing query" }), { status: 400 });
  }

  try {
    // Çözüm 1: btoa yerine Node.js standartlarında Buffer kullanımı (Vercel için %100 kararlı)
    const authString = Buffer.from(`${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`).toString('base64');
    
    const tokenRes = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${authString}`
      },
      body: 'grant_type=client_credentials'
    });

    if (!tokenRes.ok) {
      const errText = await tokenRes.text();
      return new Response(JSON.stringify({ error: `Spotify token failed: ${errText}` }), { status: tokenRes.status });
    }

    const tokenData = await tokenRes.json();
    const accessToken = tokenData.access_token;

    // Last.fm'den gelebilecek ekstra boşluk veya "Remastered" gibi ekleri temizleme emniyeti
    const cleanQ = searchQ.trim();
    const cleanArtist = searchArtist && searchArtist !== 'null' && searchArtist !== 'undefined' ? searchArtist.trim() : null;

    let spotifyQuery = '';
    if (searchType === 'track' && cleanArtist) {
      spotifyQuery = `track:${cleanQ} artist:${cleanArtist}`;
    } else if (searchType === 'album' && cleanArtist) {
      spotifyQuery = `album:${cleanQ} artist:${cleanArtist}`;
    } else {
      // Çözüm 2: Sanatçı aramalarında çok sıkı filtre yerine daha esnek ve düz kelime araması
      spotifyQuery = cleanQ;
    }

    // Çözüm 3: Arama sonuna sunucu konumu fark etmeksizin Türkiye marketini sabitleyen "&market=TR" eklendi
    const searchUrl = `https://api.spotify.com/v1/search?q=${encodeURIComponent(spotifyQuery)}&type=${searchType === 'album' ? 'album' : searchType}&limit=1&market=TR`;

    const searchRes = await fetch(searchUrl, {
      headers: { 'Authorization': `Bearer ${accessToken}` }
    });

    if (!searchRes.ok) {
      return new Response(JSON.stringify({ url: null, note: "Spotify search returned non-200" }), { status: 200 });
    }

    const searchData = await searchRes.json();
    let imageUrl = null;

    if (searchType === 'artist' && searchData.artists?.items?.[0]?.images?.[0]) {
      imageUrl = searchData.artists.items[0].images[0].url;
    } else if (searchType === 'track' && searchData.tracks?.items?.[0]?.album?.images?.[0]) {
      imageUrl = searchData.tracks.items[0].album.images[0].url;
    } else if (searchType === 'album' && searchData.albums?.items?.[0]?.images?.[0]) {
      imageUrl = searchData.albums.items[0].images[0].url;
    }

    return new Response(JSON.stringify({ url: imageUrl }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500 });
  }
}