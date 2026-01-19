'use client';

import RequestList from '@/app/(root)/alumni/alumni-module/transactions/alumni-friend-request/_components/request-list';
import SearchForm from '@/app/(root)/alumni/alumni-module/transactions/alumni-friend-request/_components/search-form';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import type { IAlumniFriendRequest } from '@/types/alumni/alumni-friend-request';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';

// Static alumni data
const staticAlumniData: IAlumniFriendRequest[] = [
    {
        ALMST_Id: 101,
        studentname: 'John Smith',
        ASMAY_Year: '2015',
        ALSFRND_RequestDate: null,
        ALSFRND_AcceptedDate: null,
        ALSFRND_AcceptFlag: null,
        checktru: false,
        selected: false
    },
    {
        ALMST_Id: 102,
        studentname: 'Sarah Johnson',
        ASMAY_Year: '2016',
        ALSFRND_RequestDate: '2024-01-15T10:30:00.000Z',
        ALSFRND_AcceptedDate: '2024-01-20T14:45:00.000Z',
        ALSFRND_AcceptFlag: 'ACCEPT',
        checktru: true,
        selected: false
    },
    {
        ALMST_Id: 103,
        studentname: 'Michael Chen',
        ASMAY_Year: '2014',
        ALSFRND_RequestDate: '2024-02-10T09:15:00.000Z',
        ALSFRND_AcceptedDate: null,
        ALSFRND_AcceptFlag: 'REJECT',
        checktru: true,
        selected: false
    },
    {
        ALMST_Id: 104,
        studentname: 'Priya Sharma',
        ASMAY_Year: '2017',
        ALSFRND_RequestDate: null,
        ALSFRND_AcceptedDate: null,
        ALSFRND_AcceptFlag: null,
        checktru: false,
        selected: false
    },
    {
        ALMST_Id: 105,
        studentname: 'David Wilson',
        ASMAY_Year: '2013',
        ALSFRND_RequestDate: '2024-03-05T16:20:00.000Z',
        ALSFRND_AcceptedDate: null,
        ALSFRND_AcceptFlag: null,
        checktru: true,
        selected: false
    },
    {
        ALMST_Id: 106,
        studentname: 'Emma Watson',
        ASMAY_Year: '2018',
        ALSFRND_RequestDate: null,
        ALSFRND_AcceptedDate: null,
        ALSFRND_AcceptFlag: null,
        checktru: false,
        selected: false
    },
    {
        ALMST_Id: 107,
        studentname: 'Robert Brown',
        ASMAY_Year: '2012',
        ALSFRND_RequestDate: '2024-01-30T11:00:00.000Z',
        ALSFRND_AcceptedDate: '2024-02-05T13:30:00.000Z',
        ALSFRND_AcceptFlag: 'ACCEPT',
        checktru: true,
        selected: false
    },
    {
        ALMST_Id: 108,
        studentname: 'Lisa Anderson',
        ASMAY_Year: '2019',
        ALSFRND_RequestDate: null,
        ALSFRND_AcceptedDate: null,
        ALSFRND_AcceptFlag: null,
        checktru: false,
        selected: false
    }
];

// Mock API functions
const mockGetAlumniFriendRequestData = async (payload: any) => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    return {
        success: true,
        data: {
            searchResult: staticAlumniData,
            friendrequest: []
        }
    };
};

const mockSearchAlumniFriendRequest = async (payload: any) => {
    await new Promise((resolve) => setTimeout(resolve, 300));

    const searchValue = payload.output2?.[0]?.[0] || '';
    const searchTerm = searchValue.toLowerCase();

    if (!searchTerm) {
        return {
            success: true,
            data: {
                searchResult: staticAlumniData,
                friendrequest: []
            }
        };
    }

    const filteredResults = staticAlumniData.filter((alumni) => alumni.studentname.toLowerCase().includes(searchTerm));

    return {
        success: true,
        data: {
            searchResult: filteredResults,
            friendrequest: []
        }
    };
};

export default function AlumniFriendRequestPage() {
    const [searchResult, setSearchResult] = useState<IAlumniFriendRequest[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isSearching, setIsSearching] = useState(false);

    const loadInitialData = useCallback(async () => {
        setIsLoading(true);
        try {
            const res = await mockGetAlumniFriendRequestData({});
            if (res.success && res.data) {
                setSearchResult(res.data.searchResult);
            }
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
            // Mapping to legacy payload structure
            const payload = {
                output: [{ 0: values.field }],
                output1: [{ 0: values.operator }],
                output2: [{ 0: values.value }]
            };
            const res = await mockSearchAlumniFriendRequest(payload);
            if (res.success && res.data) {
                setSearchResult(res.data.searchResult);
                if (res.data.searchResult.length === 0) {
                    toast.info('No alumni found matching your search');
                }
            } else {
                toast.error('No records found');
                setSearchResult([]);
            }
        } catch (error) {
            toast.error('Search failed');
        } finally {
            setIsSearching(false);
        }
    };

    const handleClear = () => {
        loadInitialData();
    };

    return (
        <div className='container min-h-screen space-y-6 p-4'>
            <div className='flex items-center justify-between'>
                <h2 className='font-bold text-2xl tracking-tight'>Alumni Friend Request</h2>
                <div className='text-muted-foreground text-sm'>Connect with your batchmates and expand your professional network</div>
            </div>

            <CollapsibleSection title='Search Alumni' defaultOpen={true} variant='default'>
                <div className='rounded-xl border border-blue-100 bg-gradient-to-r from-blue-50 to-purple-50 p-6'>
                    <h3 className='mb-4 font-bold text-blue-800 text-lg'>Find Your Friends</h3>
                    <p className='mb-6 text-muted-foreground text-sm'>
                        Search for alumni by name to send friend requests. You can send requests to multiple alumni at once.
                    </p>
                    <SearchForm onSearch={handleSearch} isLoading={isSearching} onClear={handleClear} />
                </div>
            </CollapsibleSection>

            <CollapsibleSection title='Alumni Search Results' defaultOpen={true} variant='outline'>
                <div className='rounded-xl bg-white p-1'>
                    <div className='mb-4 flex items-center justify-between px-2'>
                        <div>
                            <h3 className='font-bold text-lg'>Found {searchResult.length} Alumni</h3>
                            <p className='text-muted-foreground text-sm'>
                                Select alumni to send friend requests. Green indicates accepted requests.
                            </p>
                        </div>
                        <div className='text-muted-foreground text-sm'>
                            Showing {searchResult.filter((r) => !r.checktru).length} available for request
                        </div>
                    </div>
                    <RequestList data={searchResult} isLoading={isLoading || isSearching} onRefresh={loadInitialData} />
                </div>
            </CollapsibleSection>

            <div className='rounded-xl border border-green-200 bg-gradient-to-r from-green-50 to-emerald-50 p-6'>
                <h3 className='mb-3 font-bold text-green-800 text-lg'>Networking Benefits</h3>
                <div className='grid grid-cols-1 gap-4 md:grid-cols-3'>
                    <div className='rounded-lg bg-white p-4 shadow-sm'>
                        <div className='mb-2 font-bold text-2xl text-green-600'>1</div>
                        <h4 className='mb-2 font-bold text-green-700'>Professional Growth</h4>
                        <p className='text-muted-foreground text-sm'>
                            Connect with alumni in your industry for mentorship and opportunities.
                        </p>
                    </div>
                    <div className='rounded-lg bg-white p-4 shadow-sm'>
                        <div className='mb-2 font-bold text-2xl text-green-600'>2</div>
                        <h4 className='mb-2 font-bold text-green-700'>Knowledge Sharing</h4>
                        <p className='text-muted-foreground text-sm'>Share experiences and learn from others' career journeys.</p>
                    </div>
                    <div className='rounded-lg bg-white p-4 shadow-sm'>
                        <div className='mb-2 font-bold text-2xl text-green-600'>3</div>
                        <h4 className='mb-2 font-bold text-green-700'>Community Building</h4>
                        <p className='text-muted-foreground text-sm'>Stay connected with your alma mater and fellow graduates.</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
