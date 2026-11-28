import { PORTAL_QUERY_KEYS } from '@/constants/query-keys';
import {
    getStudentDashboardClasswork,
    getStudentDashboardNoticeAttachment,
    getStudentDashboardNoticeBoard
} from '@/server/student-portal/student-dashboard';
import { useQuery, useQueryClient } from '@tanstack/react-query';

export const useNoticeBoard = (amstId?: number, yearId?: number, miId?: number) => {
    const queryClient = useQueryClient();

    return {
        ...useQuery({
            queryKey: [PORTAL_QUERY_KEYS.NOTICE_BOARD_LIST, amstId, yearId, miId],
            queryFn: async () => {
                const requestData = {
                    MI_Id: miId,
                    AMST_Id: amstId,
                    ASMAY_Id: yearId,
                    flag: 'O',
                    OnClickOrOnChange: 'OnClick'
                };
                const result: any = await getStudentDashboardNoticeBoard(requestData);

                // Extract notice array from any format returned by backend
                const rawList =
                    result?.data?.noticelist ||
                    result?.noticelist ||
                    result?.data?.noticelist_byid ||
                    result?.noticelist_byid ||
                    result?.data?.notice_list ||
                    result?.notice_list ||
                    (Array.isArray(result?.data) ? result.data : (Array.isArray(result) ? result : []));

                if (!Array.isArray(rawList)) return [];

                return rawList.map((nt: any, index: number) => ({
                    index: index + 1,
                    INTB_Id: nt.intB_Id ?? nt.INTB_Id ?? index,
                    INTB_Title: nt.intB_Title ?? nt.INTB_Title ?? '',
                    INTB_Description: nt.intB_Description ?? nt.INTB_Description ?? '-',
                    INTB_StartDate: nt.intB_StartDate ?? nt.INTB_StartDate ?? '',
                    INTB_EndDate: nt.intB_EndDate ?? nt.INTB_EndDate ?? '',
                    Filecount: nt.Filecount ?? nt.filecount ?? 0,
                    INTB_Attachment: nt.intB_Attachment ?? nt.INTB_Attachment ?? '',
                    INTB_FilePath: nt.intB_FilePath ?? nt.INTB_FilePath ?? ''
                }));
            },
            enabled: !!amstId || !!yearId
        }),

        refetchAll: () =>
            queryClient.invalidateQueries({
                queryKey: [PORTAL_QUERY_KEYS.NOTICE_BOARD_LIST]
            })
    };
};

export const useClasswork = (amstId?: number, yearId?: number, miId?: number) => {
    const queryClient = useQueryClient();

    return {
        ...useQuery({
            queryKey: [PORTAL_QUERY_KEYS.CLASSWORK_LIST, amstId, yearId, miId],
            queryFn: async () => {
                const requestData = {
                    MI_Id: miId,
                    AMST_Id: amstId,
                    ASMAY_Id: yearId,
                    flag: 'O',
                    OnClickOrOnChange: 'OnClick'
                };
                const result: any = await getStudentDashboardClasswork(requestData);
                const rawList =
                    result?.data?.classworklist_byid ||
                    result?.classworklist_byid ||
                    result?.data?.classworklist ||
                    result?.classworklist ||
                    (Array.isArray(result?.data) ? result.data : (Array.isArray(result) ? result : []));
                return Array.isArray(rawList) ? rawList : [];
            },
            enabled: !!amstId || !!yearId
        }),

        refetchAll: () =>
            queryClient.invalidateQueries({
                queryKey: [PORTAL_QUERY_KEYS.CLASSWORK_LIST]
            })
    };
};
