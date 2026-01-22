'use client';

import { useDataTableProps } from '@/components/ui/data-table/generic-data-table';
import { GenericDataTable } from '@/components/ui/view-data-table/view-generic-data-table';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { useEffect, useState } from 'react';
import type { IHomeWorkReport } from '@/types/upload/reports/homework-upload-report';
import HomeWorkReportForm from './_components/add-form';
import { getColumns } from './_components/columns';
import { ViewAttachmentModal } from './_components/view-attachment-modal';
import { getHomeWorkReportData, viewHomeWorkAttachmentData } from '@/server/upload/reports/homework-upload-report';
import { toast } from 'sonner';
import type { ApiSearchparams } from '@/types';

export default function HomeWorkUploadReportPage() {
    const [reportData, setReportData] = useState<IHomeWorkReport[]>([]);
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
            const res = await getHomeWorkReportData({ ...payload, ...sParams });
            if (res.data && res.data.homeworkreportlist) {
                setReportData(res.data.homeworkreportlist);
            } else {
                setReportData([]);
                toast.info('No records found');
            }
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

    const handleViewAttachment = async (item: IHomeWorkReport) => {
        try {
            const payload = {
                IHW_Id: item.ihW_Id,
                ASMAY_Id: item.asmaY_Id || 0,
                Temp: 1,
            };

            const res = await viewHomeWorkAttachmentData(payload);
            if (res.data && res.data.attachementlist && res.data.attachementlist.length > 0) {
                setModalAttachments(res.data.attachementlist);
                setIsModalOpen(true);
            } else {
                toast.info('No attachments details found.');
            }
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
            <CollapsibleSection title='HomeWork Upload Report' defaultOpen>
                <HomeWorkReportForm onSuccess={handleReportSuccess} apiSearchParams={searchParams} />
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

