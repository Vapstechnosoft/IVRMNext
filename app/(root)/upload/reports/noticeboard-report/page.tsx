'use client';

import { useDataTableProps } from '@/components/ui/data-table/generic-data-table';
import { GenericDataTable } from '@/components/ui/view-data-table/view-generic-data-table';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { useEffect, useState } from 'react';
import type { INoticeBoardReport } from '@/types/upload/reports/noticeboard-report';
import NoticeBoardReportForm from './_components/add-form';
import { getColumns } from './_components/columns';
import { ViewAttachmentModal } from './_components/view-attachment-modal';
import { getNoticeBoardReportData, viewNoticeBoardAttachmentData } from '@/server/upload/reports/noticeboard-report';
import { toast } from 'sonner';
import type { ApiSearchparams } from '@/types';

export default function NoticeBoardReportPage() {
    const [reportData, setReportData] = useState<INoticeBoardReport[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalAttachments, setModalAttachments] = useState<any[]>([]);
    const [searchParams, setSearchParams] = useState<ApiSearchparams>({ page: 1, page_size: 10 });
    const [currentPayload, setCurrentPayload] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(false);

    const tableProps = useDataTableProps(reportData);

    const handleReportSuccess = async (payload: any, sParams: ApiSearchparams) => {
        if (!payload) {
            setReportData([]);
            setCurrentPayload(null);
            return;
        }

        setCurrentPayload(payload);
        setIsLoading(true);
        try {
            const res = await getNoticeBoardReportData({ ...payload, ...sParams });
            // if (res.data && res.data.noticereportlist) {
            //     setReportData(res.data.noticereportlist);
            // } else {
            //     setReportData([]);
            //     toast.info('No records found');
            // }
        } catch (error) {
            console.error('Error fetching report:', error);
            toast.error('Failed to fetch report');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (currentPayload) {
            handleReportSuccess(currentPayload, searchParams);
        }
    }, [searchParams]);

    const handleViewAttachment = async (item: INoticeBoardReport) => {
        try {
            const payload = {
                INTB_Id: item.intB_Id,
            };

            const res = await viewNoticeBoardAttachmentData(payload);
            // if (res.data && res.data.attachementlist && res.data.attachementlist.length > 0) {
            //     setModalAttachments(res.data.attachementlist);
            //     setIsModalOpen(true);
            // } else {
            //     toast.info('No attachments details found.');
            // }
        } catch (error) {
            console.error('Error fetching attachments:', error);
            toast.error('Failed to fetch attachments');
        }
    };

    const columns = getColumns({ onViewAttachment: handleViewAttachment });

    const handleApiSearchParms = (sParams: ApiSearchparams) => {
        setSearchParams(sParams);
    };

    return (
        <div className='container mx-auto space-y-6 p-4'>
            <CollapsibleSection title='NoticeBoard Report' defaultOpen>
                <NoticeBoardReportForm onSuccess={handleReportSuccess} apiSearchParams={searchParams} />
            </CollapsibleSection>

            {reportData.length > 0 && (
                <CollapsibleSection title='Report Details' defaultOpen>
                    <GenericDataTable
                        {...tableProps}
                        data={reportData}
                        columns={columns}
                        noDataTitle='No records found'
                        isLoading={isLoading}
                        onSearchQueryChange={handleApiSearchParms}
                        currentApiParams={searchParams}
                        showPagination={true}
                    />
                </CollapsibleSection>
            )}

            <ViewAttachmentModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                attachments={modalAttachments}
            />
        </div>
    );
}

