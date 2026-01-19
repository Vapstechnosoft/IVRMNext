'use client';

import AddAlumniGalleryForm from '@/app/(root)/alumni/alumni-module/transactions/alumni-gallery/_components/add-form';
import { AlumniGalleryColumns } from '@/app/(root)/alumni/alumni-module/transactions/alumni-gallery/_components/columns';
import ToggleAlumniGalleryForm from '@/app/(root)/alumni/alumni-module/transactions/alumni-gallery/_components/toggle-form';
import UpdateAlumniGalleryForm from '@/app/(root)/alumni/alumni-module/transactions/alumni-gallery/_components/update-form';
import { Button } from '@/components/ui/button';
import { GenericDataTable, useDataTableProps } from '@/components/ui/data-table/generic-data-table';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { FormProvider, useFormContext } from '@/components/ui/form/form-provider';
import type { IAlumniGallery } from '@/types/alumni/alumni-gallery';
import { Plus, X } from 'lucide-react';
import { use, useCallback, useEffect, useState } from 'react';

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

// Static gallery data
const staticGalleryData: IAlumniGallery[] = [
    {
        algA_Id: 1,
        algA_GalleryName: 'Annual Alumni Meet 2024',
        algA_Date: '2024-12-15T00:00:00.000Z',
        algA_Time: '14:30:00',
        algA_CommonGalleryFlg: 'Y',
        algA_ActiveFlag: true,
        images_list: [
            {
                filePath: '/images/gallery/meet-1.jpg',
                fileName: 'meet-1.jpg'
            },
            {
                filePath: '/images/gallery/meet-2.jpg',
                fileName: 'meet-2.jpg'
            }
        ]
    },
    {
        algA_Id: 2,
        algA_GalleryName: 'Campus Reunion 2023',
        algA_Date: '2023-11-10T00:00:00.000Z',
        algA_Time: '10:00:00',
        algA_CommonGalleryFlg: 'Y',
        algA_ActiveFlag: true,
        images_list: [
            {
                filePath: '/images/gallery/reunion-1.jpg',
                fileName: 'reunion-1.jpg'
            },
            {
                filePath: '/images/gallery/reunion-2.jpg',
                fileName: 'reunion-2.jpg'
            },
            {
                filePath: '/videos/gallery/reunion-video.mp4',
                fileName: 'reunion-video.mp4'
            }
        ]
    },
    {
        algA_Id: 3,
        algA_GalleryName: 'Sports Day Memories',
        algA_Date: '2024-02-25T00:00:00.000Z',
        algA_Time: '09:45:00',
        algA_CommonGalleryFlg: 'N',
        algA_ActiveFlag: false,
        images_list: [
            {
                filePath: '/images/gallery/sports-1.jpg',
                fileName: 'sports-1.jpg'
            }
        ]
    },
    {
        algA_Id: 4,
        algA_GalleryName: 'Convocation Ceremony 2022',
        algA_Date: '2022-05-20T00:00:00.000Z',
        algA_Time: '11:00:00',
        algA_CommonGalleryFlg: 'Y',
        algA_ActiveFlag: true,
        images_list: [
            {
                filePath: '/images/gallery/convocation-1.jpg',
                fileName: 'convocation-1.jpg'
            },
            {
                filePath: '/images/gallery/convocation-2.jpg',
                fileName: 'convocation-2.jpg'
            },
            {
                filePath: '/images/gallery/convocation-3.jpg',
                fileName: 'convocation-3.jpg'
            },
            {
                filePath: '/videos/gallery/convocation.mp4',
                fileName: 'convocation.mp4'
            }
        ]
    },
    {
        algA_Id: 5,
        algA_GalleryName: 'Cultural Fest 2021',
        algA_Date: '2021-10-05T00:00:00.000Z',
        algA_Time: '18:30:00',
        algA_CommonGalleryFlg: 'Y',
        algA_ActiveFlag: true,
        images_list: [
            {
                filePath: '/images/gallery/cultural-1.jpg',
                fileName: 'cultural-1.jpg'
            },
            {
                filePath: '/images/gallery/cultural-2.jpg',
                fileName: 'cultural-2.jpg'
            }
        ]
    },
    {
        algA_Id: 6,
        algA_GalleryName: 'Tech Workshop Series',
        algA_Date: '2024-03-12T00:00:00.000Z',
        algA_Time: '15:20:00',
        algA_CommonGalleryFlg: 'N',
        algA_ActiveFlag: true,
        images_list: []
    }
];

// Mock API function
const mockGetAlumniGalleryData = async () => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    return {
        data: {
            get_galleryimg: staticGalleryData
        }
    };
};

export default function AlumniGalleryPage(props: { searchParams: SearchParams }) {
    const searchParams = use(props.searchParams);
    const [data, setData] = useState<IAlumniGallery[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<any>(null);

    const refetchAll = useCallback(async () => {
        setIsLoading(true);
        try {
            const res: any = await mockGetAlumniGalleryData();
            const list = res?.data?.get_galleryimg || [];
            setData(list);
            setError(null);
        } catch (err) {
            setError(err);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        refetchAll();
    }, [refetchAll]);

    return (
        <FormProvider<IAlumniGallery>>
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
    response: IAlumniGallery[];
    isLoading: boolean;
    error: any;
    refetchAll: any;
}) {
    const { openAddForm } = useFormContext<IAlumniGallery>();
    const tableProps = useDataTableProps(response || []);

    return (
        <div className='min-h-screen'>
            <div className='container space-y-4 p-1'>
                <div className='flex gap-4 sm:flex-row sm:items-center sm:justify-self-end'>
                    <Button
                        type='button'
                        onClick={openAddForm}
                        className='w-fit shadow-md transition-all duration-200 hover:scale-105 hover:shadow-lg'>
                        <Plus className='h-4 w-4' />
                        Add Gallery Entry
                    </Button>
                    <div className='ml-4 text-muted-foreground text-sm'>Manage alumni photos and videos galleries</div>
                </div>

                <CollapsibleSection
                    defaultOpen={true}
                    variant='default'
                    size='lg'
                    className='shadow-lg transition-shadow duration-300 hover:shadow-xl'>
                    <GenericDataTable<IAlumniGallery>
                        {...tableProps}
                        data={response || []}
                        columns={AlumniGalleryColumns}
                        isLoading={isLoading}
                        error={error}
                        columnPinning={{ right: ['actions'] }}
                        loadingMessage='Loading gallery...'
                        noDataTitle='No Gallery Entries Found'
                        noDataDescription='Create a new gallery entry to get started'
                        errorTitle='Error Loading Gallery'
                    />
                </CollapsibleSection>

                <FormSections onSuccess={refetchAll} />
            </div>
        </div>
    );
}

function FormSections({ onSuccess }: { onSuccess: () => void }) {
    const {
        isAddFormOpen,
        isEditFormOpen,
        isToggleFormOpen,
        selectedRow,
        closeAddForm,
        closeEditForm,
        closeToggleForm,
        addFormRef,
        editFormRef
    } = useFormContext<IAlumniGallery>();

    return (
        <>
            {isAddFormOpen && (
                <div ref={addFormRef}>
                    <CollapsibleSection
                        title='Add New Gallery Entry'
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
                            <AddAlumniGalleryForm
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
                        title='View Gallery Details'
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
                            <UpdateAlumniGalleryForm
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

            {isToggleFormOpen && selectedRow && (
                <ToggleAlumniGalleryForm rowData={selectedRow} onClose={closeToggleForm} onSuccess={onSuccess} />
            )}
        </>
    );
}
