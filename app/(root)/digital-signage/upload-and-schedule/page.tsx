'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { motion } from 'framer-motion';
import { 
    Upload, 
    Calendar, 
    Monitor, 
    Image as ImageIcon, 
    Video, 
    FileText, 
    Plus, 
    Trash2, 
    Play, 
    RefreshCw,
    Search
} from 'lucide-react';
import { useState } from 'react';
import { GenericDataTable } from '@/components/ui/data-table/generic-data-table';
import type { ColumnDef } from '@tanstack/react-table';

// Interfaces for our data
interface MediaItem {
    mediaId: number;
    name: string;
    mediaType: string;
    fileName: string;
    fileSizeFormatted: string;
    width: number;
    height: number;
    orientation: string;
    createdDt: string;
}

interface ScheduleItem {
    eventId: number;
    campaign: string;
    displayGroupList: string;
    eventTypeName: string;
    displayFromDt: string;
    displayToDt: string;
    createdOn: string;
}

interface DisplayItem {
    displayId: number;
    display: string;
    clientType: string;
    statusDescription: string;
    lastAccessed: string;
}

export default function UploadAndSchedule() {
    const [isUploading, setIsUploading] = useState(false);

    // Data will be fetched from backend
    const mediaData: MediaItem[] = [];
    const scheduleData: ScheduleItem[] = [];
    const displayData: DisplayItem[] = [];

    // Column Definitions
    const mediaColumns: ColumnDef<MediaItem>[] = [
        { accessorKey: 'mediaId', header: 'mediaId' },
        { accessorKey: 'name', header: 'name' },
        { accessorKey: 'mediaType', header: 'mediaType' },
        { accessorKey: 'fileName', header: 'fileName', cell: ({ row }) => <span className='truncate max-w-[150px] inline-block'>{row.original.fileName}</span> },
        { accessorKey: 'fileSizeFormatted', header: 'size' },
        { accessorKey: 'width', header: 'width' },
        { accessorKey: 'height', header: 'height' },
        { accessorKey: 'orientation', header: 'orientation' },
        { accessorKey: 'createdDt', header: 'createdDt' },
        {
            id: 'actions',
            header: 'Action',
            cell: () => (
                <Button variant='destructive' size='sm' className='h-8 px-2'>
                    <Trash2 className='h-4 w-4 mr-1' /> Delete
                </Button>
            )
        }
    ];

    const scheduleColumns: ColumnDef<ScheduleItem>[] = [
        { accessorKey: 'eventId', header: 'eventId' },
        { accessorKey: 'campaign', header: 'campaign' },
        { accessorKey: 'displayGroupList', header: 'displayGroupList' },
        { accessorKey: 'eventTypeName', header: 'eventTypeName' },
        { accessorKey: 'displayFromDt', header: 'displayFromDt' },
        { accessorKey: 'displayToDt', header: 'displayToDt' },
        { accessorKey: 'createdOn', header: 'createdOn' },
        {
            id: 'actions',
            header: 'Action',
            cell: () => (
                <Button variant='destructive' size='sm' className='h-8 px-2'>
                    <Trash2 className='h-4 w-4 mr-1' /> Delete
                </Button>
            )
        }
    ];

    const displayColumns: ColumnDef<DisplayItem>[] = [
        { accessorKey: 'displayId', header: 'displayId' },
        { accessorKey: 'display', header: 'display' },
        { accessorKey: 'clientType', header: 'clientType' },
        { accessorKey: 'statusDescription', header: 'statusDescription' },
        { accessorKey: 'lastAccessed', header: 'lastAccessed' },
        {
            id: 'actions',
            header: 'Action',
            cell: () => (
                <Button variant='default' size='sm' className='h-8 px-2 bg-blue-600 hover:bg-blue-700'>
                    <RefreshCw className='h-4 w-4 mr-1' /> Request Shot
                </Button>
            )
        }
    ];

    const handleUpload = () => {
        setIsUploading(true);
        setTimeout(() => setIsUploading(false), 2000);
    };

    return (
        <div className='container mx-auto p-4 space-y-6'>
            {/* Header */}
            <motion.div 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className='flex flex-col gap-2'
            >
                <h1 className='text-3xl font-bold tracking-tight text-orange-600'>Signage Management</h1>
                <p className='text-muted-foreground'>Use this form to upload and schedule media in one request.</p>
            </motion.div>

            <div className='grid gap-6 lg:grid-cols-12'>
                {/* Left Sidebar: Upload Form */}
                <motion.div 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className='lg:col-span-4 space-y-6'
                >
                    <Card className='border-orange-100 shadow-lg sticky top-6'>
                        <CardHeader className='bg-orange-50/50 border-b border-orange-100'>
                            <CardTitle className='text-orange-900 flex items-center gap-2'>
                                <Upload className='h-5 w-5' /> Upload Content
                            </CardTitle>
                        </CardHeader>
                        <CardContent className='p-6 space-y-6'>
                            <div className='space-y-2'>
                                <Label htmlFor='media-file' className='font-bold'>Image File</Label>
                                <div className='flex items-center justify-center w-full'>
                                    <label htmlFor='media-file' className='flex flex-col items-center justify-center w-full h-32 border-2 border-orange-200 border-dashed rounded-lg cursor-pointer bg-orange-50/30 hover:bg-orange-50 transition-colors'>
                                        <div className='flex flex-col items-center justify-center pt-5 pb-6'>
                                            <Upload className='w-8 h-8 mb-3 text-orange-500' />
                                            <p className='mb-2 text-sm text-orange-700'><span className='font-semibold'>Click to upload</span> or drag and drop</p>
                                            <p className='text-xs text-orange-600/60'>PNG, JPG or MP4 (MAX. 500MB)</p>
                                        </div>
                                        <input id='media-file' type='file' className='hidden' />
                                    </label>
                                </div>
                            </div>

                            <div className='space-y-4'>
                                <div className='space-y-2'>
                                    <Label htmlFor='start-dt' className='font-bold'>Start Date & Time</Label>
                                    <Input id='start-dt' type='datetime-local' className='focus-visible:ring-orange-500' />
                                </div>
                                <div className='space-y-2'>
                                    <Label htmlFor='end-dt' className='font-bold'>End Date & Time</Label>
                                    <Input id='end-dt' type='datetime-local' className='focus-visible:ring-orange-500' />
                                </div>
                                <div className='space-y-2'>
                                    <Label htmlFor='display-id' className='font-bold'>Display ID</Label>
                                    <Input id='display-id' placeholder='Enter Display ID' className='focus-visible:ring-orange-500' />
                                </div>
                            </div>

                            <Button 
                                className='w-full bg-[#1e6355] hover:bg-[#154d42] text-white font-bold py-6 shadow-lg' 
                                onClick={handleUpload}
                                disabled={isUploading}
                            >
                                {isUploading ? 'Processing...' : 'Upload and Schedule'}
                            </Button>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Right Content: Tables */}
                <motion.div 
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className='lg:col-span-8 space-y-8'
                >
                    {/* Media Table */}
                    <Card className='border-orange-100 shadow-md'>
                        <CardHeader className='pb-3'>
                            <div className='flex items-center justify-between'>
                                <CardTitle className='text-orange-900'>Media Table</CardTitle>
                                <Button variant='outline' size='sm' className='h-8 text-orange-600 border-orange-200'>
                                    <Plus className='h-4 w-4 mr-1' /> Add Media
                                </Button>
                            </div>
                            <CardDescription>Manage uploaded media assets</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <GenericDataTable 
                                data={mediaData} 
                                columns={mediaColumns} 
                                isLoading={false}
                                isSearchRequired={false}
                                isPaginationRequired={true}
                                totalItems={mediaData.length}
                                maxHeight='400px'
                                scrollable={true}
                            />
                        </CardContent>
                    </Card>

                    {/* Schedule Table */}
                    <Card className='border-orange-100 shadow-md'>
                        <CardHeader className='pb-3'>
                            <CardTitle className='text-orange-900'>Schedule Table</CardTitle>
                            <CardDescription>Currently active and upcoming broadcast events</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <GenericDataTable 
                                data={scheduleData} 
                                columns={scheduleColumns} 
                                isLoading={false}
                                isSearchRequired={false}
                                isPaginationRequired={true}
                                totalItems={scheduleData.length}
                            />
                        </CardContent>
                    </Card>

                    {/* Display Table */}
                    <Card className='border-orange-100 shadow-md'>
                        <CardHeader className='pb-3'>
                            <CardTitle className='text-orange-900'>Display Table</CardTitle>
                            <CardDescription>Connected signage devices status</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <GenericDataTable 
                                data={displayData} 
                                columns={displayColumns} 
                                isLoading={false}
                                isSearchRequired={false}
                                isPaginationRequired={true}
                                totalItems={displayData.length}
                            />
                        </CardContent>
                    </Card>


                </motion.div>
            </div>
        </div>
    );
}
