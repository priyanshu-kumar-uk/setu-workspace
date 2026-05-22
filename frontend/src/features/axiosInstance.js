import axios from "axios"

let accessToken = null;
export const setAccessToken = (token) => {
    accessToken = token;
};

export const getAccessToken = () => accessToken;

const api = axios.create({
    baseURL: "/api",
    withCredentials: true
});

// Req
api.interceptors.request.use(
    (config) => {
        if (accessToken) {
            config.headers.Authorization = `Bearer ${accessToken}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Res
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;
        // if token time khatam ho gya to api call karo new access token create karne kai liye
        if (error.response?.status === 401 && !originalRequest._retry) {  // check a token accesseable or not 
            originalRequest._retry = true;   // it mean only one time dobara sai fetch karke dekhe 

            try {  // api 
                const res = await axios.post("/api/auth/refreshToken", {}, {  // api of create new access token
                    withCredentials: true
                });

                const newToken = res.data.data.accessToken;  // new token 

                setAccessToken(newToken);  // store here memory

                originalRequest.headers.Authorization = `Bearer ${newToken}`;  // yha new token headers mai add kar diya taki backend ko bta sake hamre pass new(accessble token ) hai 
                return api(originalRequest);

            } catch (refreshError) {   // if refresh token bhi expire ho gya to 
                setAccessToken(null);  // memory token null karo 
                // Only redirect to /login if NOT already on the login page
                // Otherwise it causes an infinite reload loop!
                if (window.location.pathname !== "/login") {
                    window.location.href = "/login";
                }
                return Promise.reject(refreshError);
            }
        }
        return Promise.reject(error);
    }
);

export default api;