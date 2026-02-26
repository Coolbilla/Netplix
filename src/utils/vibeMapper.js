// A few useful TMDB Keyword IDs: 
// Cyberpunk: 210024, Space: 9882, Revenge: 9748, Based on Comic: 9715
export const VIBE_LIBRARY = {
    "cyberpunk": { genres: "878", keywords: "210024", animation: false },
    "space": { genres: "878,12", keywords: "9882", animation: false },
    "revenge": { genres: "80,18", keywords: "9748", animation: false },
    "dark": { genres: "27,53", keywords: "", animation: false },
    "fun": { genres: "35,10751", keywords: "", animation: false },
    "anime": { genres: "16", keywords: "210024", animation: true }
};

export const getParamsFromVibe = (query) => {
    const lowercaseQuery = query.toLowerCase();
    let params = { with_genres: "", with_keywords: "" };

    // Search our library for matches in the user's query
    Object.keys(VIBE_LIBRARY).forEach(vibe => {
        if (lowercaseQuery.includes(vibe)) {
            params.with_genres = VIBE_LIBRARY[vibe].genres;
            params.with_keywords = VIBE_LIBRARY[vibe].keywords;
        }
    });

    return params;
};