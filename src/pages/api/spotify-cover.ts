// src/pages/api/spotify-cover.ts
import type { APIRoute } from 'astro';

export const prerender = false;

export const GET: APIRoute = async ({ request }) => {
  const SPOTIFY_CLIENT_ID = import.meta.env.SPOTIFY_CLIENT_ID;
  const SPOTIFY_CLIENT_SECRET = import.meta.env.SPOTIFY_CLIENT_SECRET;

  const urlObj = new URL(request.url);
  const searchQ = urlObj.searchParams.get('q');
  const searchArtist = urlObj.searchParams.get('artist');
  const searchType = urlObj.searchParams.get('type') || 'track';

  if (!searchQ) {
    return new Response(JSON.stringify({ error: 'Sorgu parametresi eksik' }), { status: 400 });
  }

  try {
    const tokenRes = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': 'Basic ' + btoa(SPOTIFY_CLIENT_ID + ':' + SPOTIFY_CLIENT_SECRET)
      },
      body: 'grant_type=client_credentials'
    });
    
    const tokenData = await tokenRes.json();
    const accessToken = tokenData.access_token;

    let spotifyQuery = '';
    if (searchType === 'track' && searchArtist) {
      spotifyQuery = `track:${searchQ} artist:${searchArtist}`;
    } else if (searchType === 'album' && searchArtist) {
      spotifyQuery = `album:${searchQ} artist:${searchArtist}`;
    } else {
      spotifyQuery = `artist:${searchQ}`;
    }

    const searchRes = await fetch(`https://api.spotify.com/v1/search?q=$${encodeURIComponent(spotifyQuery)}&type=${searchType === 'album' ? 'album' : searchType}&limit=1`, {
      headers: { 'Authorization': `Bearer ${accessToken}` }
    });
    
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
};