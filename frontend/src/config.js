// Central configuration file for Dynamic Backend URL Switching

/**
 * Returns the current API URL.
 * Checks if a custom URL (like Ngrok) is stored in LocalStorage.
 * If not, it falls back to the default Render URL defined in Vite env vars.
 */
export const getApiUrl = () => {
    let customUrl = localStorage.getItem('CUSTOM_API_URL');
    if (customUrl && customUrl.trim() !== '') {
        customUrl = customUrl.trim();
        // Automatically add /api at the end if the user forgot to type it!
        if (!customUrl.endsWith('/api')) {
            // Remove trailing slash if user added it accidentally (e.g. ngrok-free.app/)
            if (customUrl.endsWith('/')) {
                customUrl = customUrl.slice(0, -1);
            }
            customUrl = `${customUrl}/api`;
        }
        return customUrl;
    }
    return import.meta.env.VITE_API_URL || "/api";
};

/**
 * Returns the Socket URL by deriving it from the API URL.
 * (Strips out '/api' from the end)
 */
export const getSocketUrl = () => {
    const apiUrl = getApiUrl();
    if (apiUrl) {
        return apiUrl.replace('/api', '');
    }
    return '/';
};
