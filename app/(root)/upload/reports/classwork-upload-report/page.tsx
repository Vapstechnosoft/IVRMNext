'use client';

import { useDataTableProps } from '@/components/ui/data-table/generic-data-table';
import { GenericDataTable } from '@/components/ui/view-data-table/view-generic-data-table';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { useEffect, useState } from 'react';
import type { IClassWorkReport } from '@/types/upload/reports/classwork-upload-report';
import ClassWorkReportForm from './_components/add-form';
import { getColumns } from './_components/columns';
import { ViewAttachmentModal } from './_components/view-attachment-modal';
import { getReportData, viewAttachmentData } from '@/server/upload/reports/classwork-upload-report';
import { toast } from 'sonner';
import type { ApiSearchparams } from '@/types';

export default function ClassWorkUploadReportPage() {
    const [reportData, setReportData] = useState<IClassWorkReport[]>([]);
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
            const res = await getReportData({ ...payload, ...sParams });
            if (res.data && res.data.classreportlist) {
                setReportData(res.data.classreportlist);
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

    const handleViewAttachment = async (item: IClassWorkReport) => {
        try {
            const payload = {
                ICW_Id: item.icW_Id,
                ASMAY_Id: 0,
                Temp: 0,
            };

            const res = await viewAttachmentData(payload);
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
            <CollapsibleSection title='ClassWork Upload Report' defaultOpen>
                <ClassWorkReportForm onSuccess={handleReportSuccess} apiSearchParams={searchParams} />
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

