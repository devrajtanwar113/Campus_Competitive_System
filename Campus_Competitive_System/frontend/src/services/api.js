
const BASE_URL = (
    import.meta.env.VITE_API_URL || 'http://localhost:8080/api'
).replace(/\/$/, '');

async function request(path, options = {}) {

    const token = localStorage.getItem('token');

    let response;

    try {

        response = await fetch(`${BASE_URL}${path}`, {

            ...options,

            headers: {

                'Content-Type': 'application/json',

                ...(token
                    ? { Authorization: `Bearer ${token}` }
                    : {}),

                ...(options.headers || {})

            }

        });

    } catch (error) {

        throw new Error(
            'Cannot connect to backend. Please start Spring Boot.'
        );

    }

    const raw = await response.text();

    let data = null;

    try {

        data = raw ? JSON.parse(raw) : null;

    } catch {

        data = raw;

    }

    if (!response.ok) {

        const message =
            data?.message ||
            (typeof data === 'string' ? data : null) ||
            `Request failed with status ${response.status}`;

        if (response.status === 401) {

            ['token', 'role', 'username'].forEach(
                key => localStorage.removeItem(key)
            );

            if (window.location.pathname !== '/login') {
                window.location.href = '/login';
            }

        }

        throw new Error(message);

    }

    return data;

}

// ==================================
// AUTHENTICATION
// ==================================

export const login = (username, password) => {

    return request('/auth/login', {

        method: 'POST',

        body: JSON.stringify({
            username: username.trim(),
            password
        })

    });

};

// ==================================
// CONTEST APIs
// ==================================

export const getContests = () => {

    return request('/contests');

};

export const createContest = (payload) => {

    return request('/contests', {

        method: 'POST',

        body: JSON.stringify(payload)

    });

};

export const joinContest = (id) => {

    return request(`/contests/${id}/join`, {

        method: 'POST',

        body: JSON.stringify({})

    });

};

export const submitSolution = (id, payload) => {

    return request(`/contests/${id}/submissions`, {

        method: 'POST',

        body: JSON.stringify(payload)

    });

};

// ==================================
// STUDENT APIs
// ==================================

export const getMySubmissions = () => {

    return request('/submissions/mine');

};

export const getLeaderboard = () => {

    return request('/leaderboard');

};

export const getMyAnalytics = () => {

    return request('/analytics/mine');

};
