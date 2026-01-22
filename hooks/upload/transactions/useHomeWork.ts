import { fetchInitialData } from '@/server/upload/transactions/ivrm-homework/server-action';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';

export const useHomeWork = (params?: any) => {
    const [data, setData] = useState<{
        yearlist: any[];
        classlist: any[];
        classwork: any[];
        academicyear: any[];
    } | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<any>(null);

    const loadData = useCallback(async () => {
        setIsLoading(true);
        try {
            const result = await fetchInitialData();
            setData(result);
        } catch (err) {
            setError(err);
            toast.error('Failed to load homework data');
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        loadData();
    }, [loadData]);

    return {
        data,
        isLoading,
        error,
        refetchAll: loadData
    };
};
