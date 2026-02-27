import axios from 'axios';

// ATTEMPT 1: Direct TMDB (Fastest, but blocked by Jio/Airtel)
const PRIMARY_URL = "https://api.themoviedb.org/3";

// ATTEMPT 2: Dynamic Vercel Proxy (Automatically adapts to www or non-www to prevent CORS)
const RELAY_URL = "/tmdb-api"; 

export const IMAGE_BASE = "https://images.weserv.nl/?url=https://image.tmdb.org/t/p";
const API_KEY = "36735721fd11df6180fe9deb66795321";

export const neuralFetch = async (endpoint, params = {}) => {
    const queryParams = { ...params, api_key: API_KEY };

    try {
        return await axios.get(`${PRIMARY_URL}${endpoint}`, { params: queryParams });
    } catch (error) {
        const isNetworkError = !error.response;
        const isBlocked = error.response?.status === 403 || error.response?.status === 401;

        if (isNetworkError || isBlocked) {
            console.warn(`📡 Neural OS: ISP Block detected. Rerouting via Vercel Relay...`);
            
            try {
                // Uses the current domain securely to bypass CORS
                return await axios.get(`${RELAY_URL}${endpoint}`, { params: queryParams });
            } catch (relayError) {
                console.error("🚨 Neural OS: All signal paths compromised.", relayError);
                throw relayError;
            }
        }
        throw error;
    }
};
