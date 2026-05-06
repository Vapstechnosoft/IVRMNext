'use server';

import { api, getSearchParamsUrl } from '@/lib/apiService';
import type { ApiSearchparams } from '@/types';
import type { IPDAMasterHeadResponse, IPDAMasterHead } from '@/types/pda/master/master-head';

export async function getPDAMasterHeadDetails(searchParams?: ApiSearchparams) {
    // Assuming pageid is 2 as per angular code
    const pageId = 2;
    const url = `PDAMasterHead/getalldetails/${pageId}`;
    return await api.get<IPDAMasterHeadResponse>('pettycashandassettracking', url);
}

export async function savePDAMasterHead(data: any) {
    const url = 'PDAMasterHead/savedetails';
    return await api.post<IPDAMasterHeadResponse>('pettycashandassettracking', url, data);
}

export async function togglePDAMasterHead(data: IPDAMasterHead) {
    const url = 'PDAMasterHead/deactivate';
    return await api.post<IPDAMasterHeadResponse>('pettycashandassettracking', url, data);
}
