import axios from 'axios';

// 🚀 PURE PROXY ROUTE:
// Bypasses Jio/Airtel blocks instantly without waiting for a timeout.
// Uses a relative path so it perfectly matches www or non-www (Zero CORS errors).
const BASE_URL = "/tmdb-api"; 

export const IMAGE_BASE = "https://images.weserv.nl/?url=https://image.tmdb.org/t/p";
const API_KEY = "36735721fd11df6180fe9deb66795321";

export const neuralFetch = async (endpoint, params = {}) => {
    const queryParams = { ...params, api_key: API_KEY };

    try {
        // One clean, unblockable signal path
        return await axios.get(`${BASE_URL}${endpoint}`, { params: queryParams });
    } catch (error) {
        console.error("🚨 Neural OS: Signal path compromised.", error);
        throw error;
    }
};
