import {useEffect, useState} from 'react';
import {useRouter} from 'next/navigation';
import {clearTokens, getTokens, isTokenExpired, refreshTokens} from "@/lib/auth";


export const useAuth = () => {
    const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();

    const checkAuth = async () => {
        const {accessToken, refreshToken} = getTokens();

        if (!accessToken && !refreshToken) {
            setIsAuthenticated(false);
            setIsLoading(false);
            return;
        }

        if (accessToken && !isTokenExpired(accessToken)) {
            setIsAuthenticated(true);
            setIsLoading(false);
            return;
        }

        // Try to refresh token
        const refreshed = await refreshTokens()
        if (refreshed) {
            setIsAuthenticated(true);
        } else {
            setIsAuthenticated(false);
            router.push('/login');
        }
        setIsLoading(false);
    };

    const logout = () => {
        clearTokens();
        setIsAuthenticated(false);
        router.push('/login');
    };

    useEffect(() => {
        checkAuth();
    }, []);

    return {
        isAuthenticated,
        isLoading,
        logout,
        checkAuth
    };
};
