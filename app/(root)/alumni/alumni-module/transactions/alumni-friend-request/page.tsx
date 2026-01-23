'use client';

import RequestList from '@/app/(root)/alumni/alumni-module/transactions/alumni-friend-request/_components/request-list';
import SearchForm from '@/app/(root)/alumni/alumni-module/transactions/alumni-friend-request/_components/search-form';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { getAlumniFriendRequestData, searchAlumniFriendRequest } from '@/server/alumni/alumni-friend-request';
import type { IAlumniFriendRequest } from '@/types/alumni/alumni-friend-request';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';

export default function AlumniFriendRequestPage() {
    const [searchResult, setSearchResult] = useState<IAlumniFriendRequest[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isSearching, setIsSearching] = useState(false);

    const loadInitialData = useCallback(async () => {
        setIsLoading(true);
        try {
            const res = await getAlumniFriendRequestData({});
            if (res.success && res.data) {
                // Backend returns data array directly (not data.searchResult)
                const dataArray = Array.isArray(res.data) ? res.data : res.data.searchResult || [];
                // Map backend fields (lowercase) to frontend fields (PascalCase)
                const list = dataArray.map((item: any) => {
                    const requestDate = item.alsfrnD_RequestDate || item.ALSFRND_RequestDate;
                    return {
                        ALMST_Id: item.almsT_Id || item.amst_Id || item.student_id || item.ALMST_Id,
                        studentname: item.studentname,
                        ASMAY_Year: item.asmaY_Year || item.ASMAY_Year,
                        ALSFRND_RequestDate: item.alsfrnD_RequestDate || item.ALSFRND_RequestDate,
                        ALSFRND_AcceptedDate: item.alsfrnD_AcceptedDate || item.ALSFRND_AcceptedDate,
                        ALSFRND_AcceptFlag: item.alsfrnD_AcceptFlag || item.ALSFRND_AcceptFlag,
                        checktru: requestDate !== null,
                        selected: false
                    };
                });
                setSearchResult(list);
            }
            // biome-ignore lint/correctness/noUnusedVariables: <explanation>
        } catch (error) {
            toast.error('Failed to load alumni data');
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        loadInitialData();
    }, [loadInitialData]);

    const handleSearch = async (values: any) => {
        setIsSearching(true);
        try {
            // Mapping to new DTO payload structure
            const payload = {
                field: [values.field],
                Operator: [values.operator],
                value: [values.value],
                condition: ['AND'] // Providing default condition
            };
            const res = await searchAlumniFriendRequest(payload);
            if (res.success && res.data) {
                // Backend returns data array directly (not data.searchResult)
                const dataArray = Array.isArray(res.data) ? res.data : res.data.searchResult || [];
                // Map backend fields (lowercase) to frontend fields (PascalCase)
                const list = dataArray.map((item: any) => ({
                    ALMST_Id: item.almsT_Id || item.amst_Id || item.student_id || item.ALMST_Id,
                    studentname: item.studentname,
                    ASMAY_Year: item.asmaY_Year || item.ASMAY_Year,
                    ALSFRND_RequestDate: item.alsfrnD_RequestDate || item.ALSFRND_RequestDate,
                    ALSFRND_AcceptedDate: item.alsfrnD_AcceptedDate || item.ALSFRND_AcceptedDate,
                    ALSFRND_AcceptFlag: item.alsfrnD_AcceptFlag || item.ALSFRND_AcceptFlag,
                    checktru: (item.alsfrnD_RequestDate || item.ALSFRND_RequestDate) !== null,
                    selected: false
                }));
                setSearchResult(list);
            } else {
                toast.error(res.message || 'No records found');
                setSearchResult([]);
            }
            // biome-ignore lint/correctness/noUnusedVariables: <explanation>
        } catch (error) {
            toast.error('Search failed');
        } finally {
            setIsSearching(false);
        }
    };

    return (
        <div className='container min-h-screen space-y-6 p-4'>
            <div className='flex items-center justify-between'>
                <h2 className='font-bold text-2xl tracking-tight'>Alumni Friend Request</h2>
            </div>

            <CollapsibleSection title='Search Alumni' defaultOpen={true} variant='default'>
                <SearchForm onSearch={handleSearch} isLoading={isSearching} onClear={loadInitialData} />
            </CollapsibleSection>

            <CollapsibleSection title='Alumni Search Results' defaultOpen={true} variant='outline'>
                <RequestList data={searchResult} isLoading={isLoading || isSearching} onRefresh={loadInitialData} />
            </CollapsibleSection>
        </div>
    );
}
