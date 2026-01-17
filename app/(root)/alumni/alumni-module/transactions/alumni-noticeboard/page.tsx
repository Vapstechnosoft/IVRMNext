'use client';

import { Button } from '@/components/ui/button';
import { GenericDataTable, useDataTableProps } from '@/components/ui/data-table/generic-data-table';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { FormProvider, useFormContext } from '@/components/ui/form/form-provider';
import type { IAlumniNoticeBoard } from '@/types/alumni/alumni-notice-board';
import { Plus, X } from 'lucide-react';
import { use, useCallback, useEffect, useState } from 'react';
import AddAlumniNoticeBoardForm from './_components/add-form';
import { AlumniNoticeBoardColumns } from './_components/columns';
import UpdateAlumniNoticeBoardForm from './_components/update-form';

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

// Static mock data
const staticNoticeBoardData = {
    alumninoticeboardlist: [
        {
            alntB_Id: 1,
            mI_Id: 30,
            alntB_Title: 'Annual Alumni Meet 2024',
            alntB_Description: 'Join us for the annual alumni meet on December 15th, 2024. Networking, dinner, and keynote speeches.',
            alntB_FilePath: '/documents/alumni/notice1.pdf',
            alntB_Attachment: 'notice1.pdf',
            alntB_StartDate: '2024-12-01T00:00:00.000Z',
            alntB_EndDate: '2024-12-31T23:59:59.000Z',
            alntB_DisplayDate: '2024-11-25T00:00:00.000Z',
            alntB_ActiveFlag: true,
            alntB_CreatedDate: '2024-10-01T10:30:00.000Z',
            alntB_UpdatedDate: '2024-10-01T10:30:00.000Z',
            slNo: 1,
            attachment_Array: [
                {
                    alntbfL_Id: 101,
                    alntbfL_FileName: 'meet-schedule.pdf',
                    alntbfL_FilePath: '/uploads/alumni/meet-schedule.pdf'
                },
                {
                    alntbfL_Id: 102,
                    alntbfL_FileName: 'venue-map.jpg',
                    alntbfL_FilePath: '/uploads/alumni/venue-map.jpg'
                }
            ]
        },
        {
            alntB_Id: 2,
            mI_Id: 30,
            alntB_Title: 'Job Opening: Software Engineer',
            alntB_Description: 'TechCorp is hiring software engineers. Alumni get preference in hiring process.',
            alntB_FilePath: '/documents/alumni/job-opening.docx',
            alntB_Attachment: 'job-opening.docx',
            alntB_StartDate: '2024-11-01T00:00:00.000Z',
            alntB_EndDate: '2024-12-15T23:59:59.000Z',
            alntB_DisplayDate: '2024-10-28T00:00:00.000Z',
            alntB_ActiveFlag: true,
            alntB_CreatedDate: '2024-10-15T14:20:00.000Z',
            alntB_UpdatedDate: '2024-10-15T14:20:00.000Z',
            slNo: 2,
            attachment_Array: [
                {
                    alntbfL_Id: 103,
                    alntbfL_FileName: 'job-description.pdf',
                    alntbfL_FilePath: '/uploads/alumni/job-description.pdf'
                }
            ]
        },
        {
            alntB_Id: 3,
            mI_Id: 30,
            alntB_Title: 'Workshop: AI & Machine Learning',
            alntB_Description: 'Free workshop for alumni on the latest trends in AI and Machine Learning.',
            alntB_FilePath: '/documents/alumni/workshop.pptx',
            alntB_Attachment: 'workshop.pptx',
            alntB_StartDate: '2024-11-10T00:00:00.000Z',
            alntB_EndDate: '2024-11-30T23:59:59.000Z',
            alntB_DisplayDate: '2024-11-05T00:00:00.000Z',
            alntB_ActiveFlag: false,
            alntB_CreatedDate: '2024-10-20T09:15:00.000Z',
            alntB_UpdatedDate: '2024-10-20T09:15:00.000Z',
            slNo: 3,
            attachment_Array: []
        },
        {
            alntB_Id: 4,
            mI_Id: 30,
            alntB_Title: 'Library Membership Renewal',
            alntB_Description: 'Renew your library membership for 2025. Special discount for alumni members.',
            alntB_FilePath: '',
            alntB_Attachment: '',
            alntB_StartDate: '2024-12-01T00:00:00.000Z',
            alntB_EndDate: '2025-01-31T23:59:59.000Z',
            alntB_DisplayDate: null,
            alntB_ActiveFlag: true,
            alntB_CreatedDate: '2024-10-25T16:45:00.000Z',
            alntB_UpdatedDate: '2024-10-25T16:45:00.000Z',
            slNo: 4,
            attachment_Array: [
                {
                    alntbfL_Id: 104,
                    alntbfL_FileName: 'membership-form.pdf',
                    alntbfL_FilePath: '/uploads/alumni/membership-form.pdf'
                },
                {
                    alntbfL_Id: 105,
                    alntbfL_FileName: 'fee-structure.xlsx',
                    alntbfL_FilePath: '/uploads/alumni/fee-structure.xlsx'
                }
            ]
        },
        {
            alntB_Id: 5,
            mI_Id: 30,
            alntB_Title: 'Campus Visit Program',
            alntB_Description: 'Alumni can visit campus on weekends. Prior registration required.',
            alntB_FilePath: '/documents/alumni/visit-program.pdf',
            alntB_Attachment: 'visit-program.pdf',
            alntB_StartDate: '2024-11-01T00:00:00.000Z',
            alntB_EndDate: '2025-03-31T23:59:59.000Z',
            alntB_DisplayDate: '2024-10-20T00:00:00.000Z',
            alntB_ActiveFlag: true,
            alntB_CreatedDate: '2024-10-10T11:30:00.000Z',
            alntB_UpdatedDate: '2024-10-10T11:30:00.000Z',
            slNo: 5,
            attachment_Array: [
                {
                    alntbfL_Id: 106,
                    alntbfL_FileName: 'visit-guidelines.pdf',
                    alntbfL_FilePath: '/uploads/alumni/visit-guidelines.pdf'
                }
            ]
        }
    ],
    total: 5
};

export default function AlumniNoticeBoardPage(props: { searchParams: SearchParams }) {
    const searchParams = use(props.searchParams);
    const [data, setData] = useState<{ alumninoticeboardlist: IAlumniNoticeBoard[]; total?: number } | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<any>(null);

    const refetchAll = useCallback(async () => {
        setIsLoading(true);
        try {
            // Use static data instead of API call
            await new Promise((resolve) => setTimeout(resolve, 500)); // Simulate loading delay
            setData(staticNoticeBoardData);
            setError(null);
        } catch (err) {
            setError(err);
        } finally {
            setIsLoading(false);
        }
    }, [searchParams]);

    useEffect(() => {
        refetchAll();
    }, [refetchAll]);

    return (
        <FormProvider<IAlumniNoticeBoard>>
            <PageContent response={data} isLoading={isLoading} error={error} refetchAll={refetchAll} />
        </FormProvider>
    );
}

function PageContent({
    response,
    isLoading,
    error,
    refetchAll
}: {
    response: any;
    isLoading: boolean;
    error: any;
    refetchAll: any;
}) {
    const { openAddForm } = useFormContext<IAlumniNoticeBoard>();
    const tableProps = useDataTableProps(response?.alumninoticeboardlist || []);

    return (
        <div className='min-h-screen'>
            <div className='container space-y-4 p-1'>
                <div className='flex gap-4 sm:flex-row sm:items-center sm:justify-self-end'>
                    <Button
                        type='button'
                        onClick={openAddForm}
                        className='w-fit shadow-md transition-all duration-200 hover:scale-105 hover:shadow-lg'>
                        <Plus className='h-4 w-4' />
                        Add Notice
                    </Button>
                </div>

                <CollapsibleSection
                    defaultOpen={true}
                    variant='default'
                    size='lg'
                    className='shadow-lg transition-shadow duration-300 hover:shadow-xl'>
                    <GenericDataTable<IAlumniNoticeBoard>
                        {...tableProps}
                        data={response?.alumninoticeboardlist || []}
                        columns={AlumniNoticeBoardColumns}
                        isLoading={isLoading}
                        error={error}
                        columnPinning={{ right: ['actions'] }}
                        loadingMessage='Loading notices...'
                        noDataTitle='No Notices Found'
                        noDataDescription='Create a new notice to get started'
                        errorTitle='Error Loading Notices'
                    />
                </CollapsibleSection>

                <FormSections onSuccess={refetchAll} />
            </div>
        </div>
    );
}

function FormSections({ onSuccess }: { onSuccess: () => void }) {
    const { isAddFormOpen, isEditFormOpen, selectedRow, closeAddForm, closeEditForm, addFormRef, editFormRef } =
        useFormContext<IAlumniNoticeBoard>();

    return (
        <>
            {isAddFormOpen && (
                <div ref={addFormRef}>
                    <CollapsibleSection
                        title='Add New Notice'
                        defaultOpen={true}
                        variant='outline'
                        size='md'
                        className='slide-in-from-top-4 animate-in shadow-lg duration-300'>
                        <div className='relative'>
                            <Button
                                type='button'
                                onClick={closeAddForm}
                                variant='ghost'
                                size='sm'
                                className='-top-[3.5rem] absolute right-12 w-fit border p-2 shadow-md hover:bg-destructive/10'>
                                <X className='h-4 w-4 text-destructive' /> Close
                            </Button>
                            <AddAlumniNoticeBoardForm
                                onSuccess={() => {
                                    onSuccess();
                                    closeAddForm();
                                }}
                            />
                        </div>
                    </CollapsibleSection>
                </div>
            )}

            {isEditFormOpen && selectedRow && (
                <div ref={editFormRef}>
                    <CollapsibleSection
                        title='Edit Notice'
                        defaultOpen={true}
                        variant='outline'
                        size='md'
                        className='slide-in-from-top-4 animate-in border-primary/20 shadow-lg duration-300'>
                        <div className='relative'>
                            <Button
                                type='button'
                                onClick={closeEditForm}
                                variant='ghost'
                                size='sm'
                                className='-top-[3.5rem] absolute right-12 w-fit border p-2 shadow-md hover:bg-destructive/10'>
                                <X className='h-4 w-4 text-destructive' /> Close
                            </Button>
                            <UpdateAlumniNoticeBoardForm
                                selectedRow={selectedRow}
                                onSuccess={() => {
                                    onSuccess();
                                    closeEditForm();
                                }}
                            />
                        </div>
                    </CollapsibleSection>
                </div>
            )}
        </>
    );
}
