'use client';
import { Label } from '@/components/ui/extension/field';
import { cn } from '@/lib/utils';
import type { IAlumniGallery } from '@/types/alumni/alumni-gallery';
import { Eye, Trash2 } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';

interface UpdateAlumniGalleryFormProps {
    selectedRow: IAlumniGallery;
    onSuccess?: () => void;
    className?: string;
}

// Static gallery view data
const staticGalleryViewData: Record<number, any[]> = {
    1: [
        { algaP_Id: 101, algaP_Photos: '/images/gallery/meet-1.jpg' },
        { algaP_Id: 102, algaP_Photos: '/images/gallery/meet-2.jpg' }
    ],
    2: [
        { algaP_Id: 201, algaP_Photos: '/images/gallery/reunion-1.jpg' },
        { algaP_Id: 202, algaP_Photos: '/images/gallery/reunion-2.jpg' },
        { algaV_Id: 203, algaV_Videos: '/videos/gallery/reunion-video.mp4' }
    ],
    3: [{ algaP_Id: 301, algaP_Photos: '/images/gallery/sports-1.jpg' }],
    4: [
        { algaP_Id: 401, algaP_Photos: '/images/gallery/convocation-1.jpg' },
        { algaP_Id: 402, algaP_Photos: '/images/gallery/convocation-2.jpg' },
        { algaP_Id: 403, algaP_Photos: '/images/gallery/convocation-3.jpg' },
        { algaV_Id: 404, algaV_Videos: '/videos/gallery/convocation.mp4' }
    ],
    5: [
        { algaP_Id: 501, algaP_Photos: '/images/gallery/cultural-1.jpg' },
        { algaP_Id: 502, algaP_Photos: '/images/gallery/cultural-2.jpg' }
    ],
    6: []
};

// Mock API functions
const mockGetCoverModelDetails = async (algA_Id: number) => {
    await new Promise((resolve) => setTimeout(resolve, 400));
    return {
        data: {
            view_galleryimg: staticGalleryViewData[algA_Id] || []
        }
    };
};

const mockToggleAlumniGalleryItem = async (algA_Id: number, algaPId: number, algaVId: number) => {
    console.log('Toggling item:', { algA_Id, algaPId, algaVId });
    await new Promise((resolve) => setTimeout(resolve, 300));
    return { success: true, message: 'Item removed from gallery' };
};

export default function UpdateAlumniGalleryForm({ selectedRow, onSuccess, className = '' }: UpdateAlumniGalleryFormProps) {
    const [viewData, setViewData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchDetails = useCallback(async () => {
        setLoading(true);
        try {
            const res = await mockGetCoverModelDetails(selectedRow.algA_Id);
            setViewData(res?.data?.view_galleryimg || []);
        } catch (err: any) {
            toast.error('Failed to load gallery details');
        } finally {
            setLoading(false);
        }
    }, [selectedRow.algA_Id]);

    useEffect(() => {
        fetchDetails();
    }, [fetchDetails]);

    const handleToggleItem = async (itemId: number, type: 'P' | 'V') => {
        try {
            const algaPId = type === 'P' ? itemId : 0;
            const algaVId = type === 'V' ? itemId : 0;
            const res = await mockToggleAlumniGalleryItem(selectedRow.algA_Id, algaPId, algaVId);
            if (res) {
                toast.success('Item removed from gallery');
                fetchDetails();
            }
        } catch (err: any) {
            toast.error(err.message || 'Failed to remove item');
        }
    };

    const formatDate = (dateString: string | Date) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    return (
        <div className={cn('space-y-6', className)}>
            <div className='rounded-xl border border-blue-100 bg-gradient-to-r from-blue-50 to-purple-50 p-6'>
                <div className='flex flex-col gap-2'>
                    <Label className='font-bold text-2xl text-primary'>Gallery: {selectedRow.algA_GalleryName}</Label>
                    <div className='grid grid-cols-1 gap-4 text-sm md:grid-cols-3'>
                        <div className='rounded-lg bg-white p-3 shadow-sm'>
                            <span className='block text-muted-foreground'>Date:</span>
                            <span className='font-semibold'>{formatDate(selectedRow.algA_Date)}</span>
                        </div>
                        <div className='rounded-lg bg-white p-3 shadow-sm'>
                            <span className='block text-muted-foreground'>Time:</span>
                            <span className='font-semibold'>{selectedRow.algA_Time}</span>
                        </div>
                        <div className='rounded-lg bg-white p-3 shadow-sm'>
                            <span className='block text-muted-foreground'>Status:</span>
                            <span className={`font-semibold ${selectedRow.algA_ActiveFlag ? 'text-green-600' : 'text-red-600'}`}>
                                {selectedRow.algA_ActiveFlag ? 'Active' : 'Inactive'}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            <div className='rounded-lg border border-orange-200 bg-orange-50 p-4'>
                <p className='flex items-center gap-2 font-medium text-orange-800 text-sm'>
                    <span className='text-lg'>📸</span>
                    Click the eye icon to view files, or trash icon to remove items from this gallery
                </p>
            </div>

            {loading ? (
                <div className='flex items-center justify-center p-12'>
                    <div className='flex flex-col items-center gap-3'>
                        {/* biome-ignore lint/style/useSelfClosingElements: <explanation> */}
                        <div className='h-10 w-10 animate-spin rounded-full border-primary border-b-2'></div>
                        <p className='text-muted-foreground'>Loading gallery contents...</p>
                    </div>
                </div>
            ) : (
                <div className='grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-5'>
                    {viewData.length === 0 ? (
                        <div className='col-span-full rounded-xl border-2 border-gray-300 border-dashed bg-gradient-to-br from-gray-50 to-white p-12 text-center'>
                            <div className='flex flex-col items-center gap-4'>
                                <div className='rounded-full bg-gray-100 p-4'>
                                    <span className='text-3xl'>📁</span>
                                </div>
                                <div>
                                    <h3 className='font-bold text-gray-700 text-lg'>No media files found</h3>
                                    <p className='mt-2 text-muted-foreground text-sm'>
                                        This gallery doesn't contain any images or videos yet.
                                    </p>
                                </div>
                            </div>
                        </div>
                    ) : (
                        viewData.map((item, index) => (
                            <div
                                key={index}
                                className='group hover:-translate-y-1 relative overflow-hidden rounded-xl border-2 border-gray-200 bg-white transition-all duration-300 hover:shadow-xl'>
                                {item.algaP_Photos ? (
                                    <div className='relative aspect-square'>
                                        <div className='absolute top-2 right-2 z-10'>
                                            <span className='rounded-full bg-blue-500 px-2 py-1 text-white text-xs'>Image</span>
                                        </div>
                                        <img
                                            src={item.algaP_Photos}
                                            // biome-ignore lint/a11y/noRedundantAlt: <explanation>
                                            alt={`Gallery image ${index + 1}`}
                                            className='h-full w-full object-cover transition-transform duration-300 group-hover:scale-105'
                                        />
                                        <div className='absolute inset-0 flex items-end justify-center bg-gradient-to-t from-black/60 via-transparent to-transparent p-4 opacity-0 transition-opacity duration-300 group-hover:opacity-100'>
                                            <div className='flex gap-2'>
                                                <a
                                                    href={item.algaP_Photos}
                                                    target='_blank'
                                                    rel='noopener noreferrer'
                                                    className='rounded-full bg-white/90 p-3 shadow-lg transition-colors hover:bg-white'
                                                    title='View full size'>
                                                    <Eye className='h-5 w-5 text-gray-800' />
                                                </a>
                                                {/* biome-ignore lint/a11y/useButtonType: <explanation> */}
                                                <button
                                                    onClick={() => handleToggleItem(item.algaP_Id, 'P')}
                                                    className='rounded-full bg-red-500/90 p-3 shadow-lg transition-colors hover:bg-red-600'
                                                    title='Remove from gallery'>
                                                    <Trash2 className='h-5 w-5 text-white' />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ) : item.algaV_Videos ? (
                                    <div className='relative aspect-square bg-black'>
                                        <div className='absolute top-2 right-2 z-10'>
                                            <span className='rounded-full bg-red-500 px-2 py-1 text-white text-xs'>Video</span>
                                        </div>
                                        <div className='flex h-full w-full items-center justify-center'>
                                            <div className='text-center'>
                                                <span className='mb-2 block text-4xl'>🎬</span>
                                                <p className='font-medium text-white text-xs'>Video File</p>
                                            </div>
                                        </div>
                                        <div className='absolute inset-0 flex items-end justify-center bg-gradient-to-t from-black/60 via-transparent to-transparent p-4 opacity-0 transition-opacity duration-300 group-hover:opacity-100'>
                                            <div className='flex gap-2'>
                                                <a
                                                    href={item.algaV_Videos}
                                                    target='_blank'
                                                    rel='noopener noreferrer'
                                                    className='rounded-full bg-white/90 p-3 shadow-lg transition-colors hover:bg-white'
                                                    title='Play video'>
                                                    <Eye className='h-5 w-5 text-gray-800' />
                                                </a>
                                                {/* biome-ignore lint/a11y/useButtonType: <explanation> */}
                                                <button
                                                    onClick={() => handleToggleItem(item.algaV_Id, 'V')}
                                                    className='rounded-full bg-red-500/90 p-3 shadow-lg transition-colors hover:bg-red-600'
                                                    title='Remove from gallery'>
                                                    <Trash2 className='h-5 w-5 text-white' />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ) : null}
                                <div className='bg-white p-3'>
                                    <p className='truncate font-medium text-gray-700 text-xs'>
                                        {item.algaP_Photos ? `IMG_${index + 1}.jpg` : `VID_${index + 1}.mp4`}
                                    </p>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}

            <div className='border-t pt-4 text-center text-muted-foreground text-sm'>
                <p>Showing {viewData.length} items in this gallery • Click on items to manage</p>
            </div>
        </div>
    );
}
