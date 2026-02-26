import axios from 'axios';

const PRIMARY_URL = "https://api.themoviedb.org/3";
const RELAY_URL = "https://netplix.shop/tmdb-api";
export const IMAGE_BASE = "https://images.weserv.nl/?url=https://image.tmdb.org/t/p";
const API_KEY = "36735721fd11df6180fe9deb66795321";

/**
 * NEURAL RELAY FETCH: 
 * Automatically switches to your shop proxy if Jio/Airtel block is detected.
 */
export const neuralFetch = async (endpoint, params = {}) => {
    // Standard params always include the API Key
    const queryParams = { ...params, api_key: API_KEY };

    try {
        // ATTEMPT 1: Try the direct TMDB route (fastest if not blocked)
        return await axios.get(`${PRIMARY_URL}${endpoint}`, { params: queryParams });
    } catch (error) {
        // Check if the error is a network failure (indicating an ISP block)
        const isNetworkError = !error.response;
        const isBlocked = error.response?.status === 403 || error.response?.status === 401;

        if (isNetworkError || isBlocked) {
            console.warn(`📡 Neural OS: ISP Block detected. Rerouting via Relay...`);

            // ATTEMPT 2: Use your personal Neural Relay (netplix.shop)
            try {
                return await axios.get(`${RELAY_URL}${endpoint}`, { params: queryParams });
            } catch (relayError) {
                console.error("🚨 Neural OS: All signal paths compromised.", relayError);
                throw relayError;
            }
        }
        throw error;
    }
};