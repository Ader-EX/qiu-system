import Cookies from 'js-cookie';

interface TokenPayload {
    exp: number;
    sub: string;
}

const isTokenExpired = (token: string): boolean => {
    try {
        const payload: TokenPayload = JSON.parse(
            Buffer.from(token.split('.')[1], 'base64').toString()
        );
        const now = Math.floor(Date.now() / 1000);
        return payload.exp <= (now + 300); // 5 min buffer
    } catch {
        return true;
    }
};

const refreshTokens = async (): Promise<boolean> => {
    const refreshToken = Cookies.get('refresh_token');

    if (!refreshToken || isTokenExpired(refreshToken)) {
        Cookies.remove('access_token');
        Cookies.remove('refresh_token');
        return false;
    }

    try {
        const response = await originalFetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/refresh`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({refresh_token: refreshToken})
        });

        if (response.ok) {
            const {access_token} = await response.json();
            Cookies.set('access_token', access_token);
            return true;
        }

        Cookies.remove('access_token');
        Cookies.remove('refresh_token');
        return false;
    } catch {
        Cookies.remove('access_token');
        Cookies.remove('refresh_token');
        return false;
    }
};

const originalFetch = window.fetch;
let isRefreshing = false;
const refreshQueue: Array<{ resolve: Function; reject: Function; requestInfo: any; requestInit: any }> = [];

// Override global fetch
window.fetch = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
    const url = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url;

    if (url.includes('/login') || url.includes('/auth/register')) {
        return originalFetch(input, init);
    }

    const token = Cookies.get('access_token');
    if (token && !isTokenExpired(token)) {
        init = {
            ...init,
            headers: {
                ...init?.headers,
                Authorization: `Bearer ${token}`
            }
        };
    }

    // Make the request
    let response = await originalFetch(input, init);

    // Handle 401 responses
    if (response.status === 401) {
        if (isRefreshing) {
            // If already refreshing, queue this request
            return new Promise((resolve, reject) => {
                refreshQueue.push({resolve, reject, requestInfo: input, requestInit: init});
            });
        }

        isRefreshing = true;

        try {
            const refreshed = await refreshTokens();

            if (refreshed) {
                // Process queued requests
                const newToken = Cookies.get('access_token');
                const updatedInit = {
                    ...init,
                    headers: {
                        ...init?.headers,
                        Authorization: `Bearer ${newToken}`
                    }
                };

                // Retry original request
                response = await originalFetch(input, updatedInit);

                // Process queue
                refreshQueue.forEach(({resolve, requestInfo, requestInit}) => {
                    const queuedInit = {
                        ...requestInit,
                        headers: {
                            ...requestInfo?.headers,
                            Authorization: `Bearer ${newToken}`
                        }
                    };
                    resolve(originalFetch(requestInfo, queuedInit));
                });
                refreshQueue.length = 0;
            } else {
                // Refresh failed - redirect to login
                window.location.href = '/login';

                // Reject queued requests
                refreshQueue.forEach(({reject}) => {
                    reject(new Error('Authentication failed'));
                });
                refreshQueue.length = 0;
            }
        } finally {
            isRefreshing = false;
        }
    }

    return response;
};

export const setupGlobalAuth = () => {
    // This function just needs to be called once to setup the global fetch override
    console.log('Global auth interceptor setup complete');
};