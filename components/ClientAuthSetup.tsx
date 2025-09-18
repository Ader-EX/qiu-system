'use client';
import {useEffect} from 'react';

export function ClientAuthSetup() {
    useEffect(() => {
        // Dynamic import to ensure it only runs on client
        import('@/lib/auth');
    }, []);

    return null; // This component renders nothing
}