'use client';

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

interface ProviderProps {
    children: React.ReactNode;
}

const Providers = ({children}: ProviderProps) => {
    const queryClient = new QueryClient();
    return (
        <QueryClientProvider client={queryClient}>
            {children}
        </QueryClientProvider>
    );
}

export default Providers;