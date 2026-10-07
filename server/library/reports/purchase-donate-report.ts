'use server';

import { api } from '@/lib/apiService';
import { auth } from '@/lib/auth';
import type { IPurchaseDonateReportGridData, IPurchaseDonateReportRequest } from '@/types/library/reports/purchase-donate-report';

const FACADE = 'PurchaseDonateReport';

const extractList = (list: any): any[] => {
    if (!list) return [];
    if (Array.isArray(list)) return list;

    if (list && typeof list === 'object' && '$values' in list && Array.isArray(list.$values)) {
        return list.$values;
    }

    const actual =
        list.data ||
        list.reportlist ||
        list.reportList ||
        list.griddata ||
        list.gridList ||
        list.alldata ||
        list.purchaselist ||
        list.donatelist ||
        list.get_report ||
        list.$values;

    if (Array.isArray(actual)) return actual;
    if (actual && typeof actual === 'object' && '$values' in actual && Array.isArray(actual.$values)) {
        return actual.$values;
    }

    return [];
};

const normalizeReportItem = (item: any): IPurchaseDonateReportGridData => {
    if (!item || typeof item !== 'object') return item;
    return {
        lmB_BookType: item.lmB_BookType ?? item.LMB_BookType ?? item.bookType ?? item.booktype ?? '',
        lmbanO_AccessionNo:
            item.lmbanO_AccessionNo ?? item.LMBANO_AccessionNo ?? item.lmbano_AccessionNo ?? item.accessionNo ?? item.accessionno ?? '',
        lmB_BookTitle: item.lmB_BookTitle ?? item.LMB_BookTitle ?? item.lmb_BookTitle ?? item.bookTitle ?? item.title ?? '',
        name: item.name ?? item.Name ?? item.authorName ?? item.author_Name ?? item.lmba_AuthorName ?? '',
        lmV_VendorName: item.lmV_VendorName ?? item.LMV_VendorName ?? item.lmv_VendorName ?? item.vendorName ?? item.vendor_name ?? '',
        lmB_PurchaseDate: item.lmB_PurchaseDate ?? item.LMB_PurchaseDate ?? item.lmb_PurchaseDate ?? item.purchaseDate ?? '',
        lmB_NoOfCopies: Number(item.lmB_NoOfCopies ?? item.LMB_NoOfCopies ?? item.lmb_NoOfCopies ?? item.noOfCopies ?? item.copies ?? 0),
        lmB_Price: Number(item.lmB_Price ?? item.LMB_Price ?? item.lmb_Price ?? item.price ?? 0),
        lmB_Discount: Number(item.lmB_Discount ?? item.LMB_Discount ?? item.lmb_Discount ?? item.discount ?? 0),
        lmB_NetPrice: Number(
            item.lmB_NetPrice ?? item.LMB_NetPrice ?? item.lmb_NetPrice ?? item.netPrice ?? item.netAmount ?? item.net_Price ?? 0
        ),
        ...item
    };
};

export async function getPurchaseDonateReportData(data: IPurchaseDonateReportRequest) {
    try {
        const session = await auth();

        const rawCirc = data.circ_Flag || data.LMB_BookType || 'BOOK';
        let circFlag = String(rawCirc).trim();
        if (circFlag.toLowerCase() === 'book') circFlag = 'BOOK';
        else if (circFlag.toLowerCase() === 'non-book' || circFlag.toLowerCase() === 'nonbook') circFlag = 'NON-BOOK';

        const rawFlag = data.lbcpA_Flg || data.book_Flag || 'Purchaged';
        let lbcpAFlg = String(rawFlag).trim();
        if (
            lbcpAFlg.toLowerCase() === 'purchased' ||
            lbcpAFlg.toLowerCase() === 'purchaged' ||
            lbcpAFlg.toLowerCase() === 'purchase' ||
            lbcpAFlg === 'P'
        ) {
            lbcpAFlg = 'Purchaged';
        } else if (
            lbcpAFlg.toLowerCase() === 'donated' ||
            lbcpAFlg.toLowerCase() === 'donate' ||
            lbcpAFlg === 'D'
        ) {
            lbcpAFlg = 'Donated';
        }

        const miId = session?.mi_id ?? data.mI_Id ?? data.MI_Id ?? 30;
        const ivrmulId = session?.roleId ?? (session as any)?.user_id ?? 0;

        // URL format: PurchaseDonateReport/getdata/BOOK/Purchaged
        const url = `${FACADE}/getdata/${circFlag}/${lbcpAFlg}`;

        const payload = {

            circ_Flag: circFlag,
            lbcpA_Flg: lbcpAFlg,
          
        };

        let response: any;
        try {
            response = await api.get<any>('library', url, { params: payload });
        } catch (getErr: any) {
            try {
                response = await api.post<any>('library', url, payload);
            } catch {
                if (lbcpAFlg === 'Purchaged') {
                    // Try with 'Purchased' spelling fallback
                    const altUrl = `${FACADE}/getdata/${circFlag}/Purchased`;
                    try {
                        response = await api.get<any>('library', altUrl, { params: payload });
                    } catch {
                        response = await api.post<any>('library', altUrl, payload);
                    }
                } else {
                    throw getErr;
                }
            }
        }

        const responseData = response?.data ?? response;
        const rawList = extractList(responseData);
        const normalizedList = rawList.map(normalizeReportItem);

        return {
            success: true,
            data: normalizedList
        };
    } catch (error: any) {
        console.error('Error in getPurchaseDonateReportData:', error);
        return {
            success: false,
            message: error?.message || 'Failed to fetch purchase/donate report data',
            data: []
        };
    }
}
