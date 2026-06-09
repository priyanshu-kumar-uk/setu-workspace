
export const getApiUrl = () => {
    let customUrl = localStorage.getItem('CUSTOM_API_URL');
    if (customUrl && customUrl.trim() !== '') {
        customUrl = customUrl.trim();
        if (customUrl.endsWith('/')) {
            customUrl = customUrl.slice(0, -1);
        }
        if (!customUrl.endsWith('/api')) {
            customUrl = `${customUrl}/api`;
        }
        return customUrl;
    }
    return import.meta.env.VITE_API_URL || "/api";
};


export const getSocketUrl = () => {
    const apiUrl = getApiUrl();
    if (apiUrl) {
        return apiUrl.replace('/api', '');
    }
    return '/';
};
