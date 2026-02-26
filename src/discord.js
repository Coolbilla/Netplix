import { DiscordSDK } from "@discord/embedded-app-sdk";

// Paste your actual Client ID from the Discord Developer Portal here
// 1. Define the ID, but DO NOT initialize the SDK yet!
const DISCORD_CLIENT_ID = "1475765373981822976";
let discordSdk = null;

// 2. Check if we are actually inside Discord before initializing
const queryParams = new URLSearchParams(window.location.search);
if (queryParams.has('frame_id')) {
    discordSdk = new DiscordSDK(DISCORD_CLIENT_ID);
}

export { discordSdk };
