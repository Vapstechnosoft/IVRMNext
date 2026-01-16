import { fetchInitialData } from '@/server/upload/transactions/ivrm-classwork/server-action';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';

export const useClassWork = (searchParams: { [key: string]: string | string[] | undefined }) => {
    const [data, setData] = useState<{
        yearlist: any[];
        classlist: any[];
        classwork: any[];
    } | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<any>(null);

    const fetchData = useCallback(async () => {
        setIsLoading(true);
        try {
            const result = await fetchInitialData();
            setData(result);
        } catch (err) {
            setError(err);
            toast.error('Failed to load initial data');
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    return {
        data,
        isLoading,
        error,
        refetchAll: fetchData
    };
};
