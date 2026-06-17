const API_BASE_URL = "/api";

export const apiCall = async (endpoint, options = {}) => {
    const token = localStorage.getItem("token");
    
    const headers = {
        ...options.headers,
    };

    // Only set default content type if not sending FormData
    if (!(options.body instanceof FormData) && !headers["Content-Type"]) {
        headers["Content-Type"] = "application/json";
    }

    if (token) {
        headers["Authorization"] = `Bearer ${token}`;
    }

    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            ...options,
            headers,
        });

        const contentType = response.headers.get("content-type");
        let data;
        if (contentType && contentType.includes("application/json")) {
            data = await response.json();
        } else {
            data = { message: await response.text() };
        }

        if (!response.ok) {
            // Check for unauthorized access (token expired)
            if (response.status === 401 || response.status === 403) {
                console.warn("Unauthorized access - redirecting to login");
                // Optional: localStorage.clear(); window.location.href = "/";
            }
            throw new Error(data.message || `Error: ${response.status}`);
        }

        return data;
    } catch (error) {
        console.error(`API Call failed [${endpoint}]:`, error);
        throw error;
    }
};
