import { useState, useEffect, useCallback } from 'react';
import { 
    fetchMessData, 
    deleteMess, 
    IMess
} from '@/server/hostel/master-mess/server-action';
import { toast } from 'sonner';

export const useMasterMess = () => {
    const [messList, setMessList] = useState<IMess[]>([]);
    const [loading, setLoading] = useState(true);

    const loadData = useCallback(async () => {
        try {
            setLoading(true);
            const response = await fetchMessData();
            if (response.success && response.data) {
                setMessList(response.data.messList);
            }
        } catch (error) {
            console.error(error);
            toast.error('Failed to load data');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const onDelete = async (id: number) => {
        try {
            const response = await deleteMess(id);
            if (response.success) {
                toast.success(response.message);
                loadData();
            } else {
                toast.error(response.message);
            }
        } catch (error) {
            console.error(error);
            toast.error('An error occurred');
        }
    };

    return {
        messList,
        loading,
        refetch: loadData,
        onDelete
    };
};
