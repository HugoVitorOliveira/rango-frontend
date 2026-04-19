import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor: attach token from localStorage
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('rango_token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Response interceptor: handle errors globally
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            const refreshToken = localStorage.getItem('rango_refresh_token');

            if (refreshToken) {
                try {
                    const KEYCLOAK_URL = import.meta.env.VITE_KEYCLOAK_URL;
                    const KEYCLOAK_REALM = import.meta.env.VITE_KEYCLOAK_REALM;
                    const CLIENT_ID = import.meta.env.VITE_CLIENT_ID;
                    const CLIENT_SECRET = import.meta.env.VITE_CLIENT_SECRET;

                    const params = new URLSearchParams({
                        grant_type: 'refresh_token',
                        client_id: CLIENT_ID,
                        client_secret: CLIENT_SECRET,
                        refresh_token: refreshToken,
                    });

                    const { data } = await axios.post(
                        `${KEYCLOAK_URL}/realms/${KEYCLOAK_REALM}/protocol/openid-connect/token`,
                        params,
                        { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
                    );

                    localStorage.setItem('rango_token', data.access_token);
                    localStorage.setItem('rango_refresh_token', data.refresh_token);

                    // Update the header and retry the original request
                    api.defaults.headers.common['Authorization'] = `Bearer ${data.access_token}`;
                    return api(originalRequest);
                } catch (retryError) {
                    // If refresh fails, clear everything and go to login
                    localStorage.removeItem('rango_token');
                    localStorage.removeItem('rango_refresh_token');
                    localStorage.removeItem('rango_username');
                    window.location.href = '/login';
                    return Promise.reject(retryError);
                }
            }
        }

        return Promise.reject(error);
    }
);

export default api;
