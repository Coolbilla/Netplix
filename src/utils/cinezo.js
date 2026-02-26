/**
 * Generates a premium Cinezo engine URL for Flixer.
 * Handles both Movies and TV Shows with automated episode routing.
 */
export const getFlixerUrl = (tmdbId, type = 'movie', season = 1, episode = 1) => {
    const base = "https://api.cinezo.net/embed";

    // 1. Sanitize inputs: Ensure they are numbers and handle "0" indices
    const s = Math.max(1, parseInt(season) || 1);
    const e = Math.max(1, parseInt(episode) || 1);

    // 2. Construct the specialized Cinezo path
    const path = type === 'movie' || type === 'movie'
        ? `/tmdb-movie-${tmdbId}`
        : `/tmdb-tv-${tmdbId}/${s}/${e}`;

    // 3. Advanced Engine Parameters
    const params = new URLSearchParams({
        fedapi: 'true',           // Enable multi-server selection
        'interface-settings': 'true', // Enable quality and sub controls
        tips: 'true',             // Show scraping/loading progress
        allinone: 'true',         // Inject internal episode/next buttons
        'has-watchparty': 'true', // Prepare for future watch-along features
        theme: 'mocha',           // Match Flixer's dark UI
        logo: 'false',            // Clean, unbranded interface
        'language-order': 'en,hi',// Priority for English/Hindi audio
        quality: '1080p',         // Force highest available quality
        backlink: window.location.origin,
        // Optional: Adding auto-resume logic if supported by the provider
        'auto-resume': 'true'
    });

    return `${base}${path}?${params.toString()}`;
};