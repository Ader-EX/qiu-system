import {useAuth} from '@/hooks/useAuth';
import {ReactNode} from 'react';
import {Loader2} from 'lucide-react';

interface AuthGuardProps {
    children: ReactNode;
    fallback?: ReactNode;
}

export const AuthGuard = ({children, fallback}: AuthGuardProps) => {
    const {isAuthenticated, isLoading} = useAuth();

    if (isLoading) {
        return (
            fallback || (
                <div className="flex items-center justify-center min-h-screen">
                    <Loader2 className="h-8 w-8 animate-spin"/>
                </div>
            )
        );
    }

    if (!isAuthenticated) {
        return null; // useAuth hook will redirect to login
    }

    return <>{children}</>;
};