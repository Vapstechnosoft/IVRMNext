import { fetchInitialData } from '@/server/upload/transactions/notice-board/server-action';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';

export const useNoticeBoard = () => {
    const [data, setData] = useState<{
        yearlist: any[];
        noticeList: any[];
        classlist: any[];
        sectionlist: any[];
        departmentList: any[];
        designationList: any[];
        staffList: any[];
        studentList: any[];
        feeTerms: any[];
        feeGroups: any[];
        routes: any[];
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
            toast.error('Failed to load notice board data');
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
