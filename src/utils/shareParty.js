/**
 * Copies a unique watch party link to the user's clipboard.
 * @param {string} partyId - The unique ID of the Firestore party document.
 * @returns {Promise<boolean>} - Returns true if successful, false otherwise.
 */
export const copyPartyLink = async (partyId) => {
    // Generates a URL based on the current environment
    const url = `${window.location.origin}/party/${partyId}`;

    try {
        if (navigator.clipboard && window.isSecureContext) {
            // Modern Clipboard API
            await navigator.clipboard.writeText(url);
            return true;
        } else {
            // Fallback for older browsers or non-HTTPS
            const textArea = document.createElement("textarea");
            textArea.value = url;

            // Ensure the textarea isn't visible
            textArea.style.position = "fixed";
            textArea.style.left = "-9999px";
            textArea.style.top = "0";

            document.body.appendChild(textArea);
            textArea.focus();
            textArea.select();

            const successful = document.execCommand('copy');
            document.body.removeChild(textArea);
            return successful;
        }
    } catch (err) {
        console.error('FLIXER_SHARE_ERROR:', err);
        return false;
    }
};