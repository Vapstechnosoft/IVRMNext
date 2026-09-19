'use client';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { FileImage, Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
import { useState } from 'react';

interface ListViewDialogProps {
    title: string;
    trigger: React.ReactNode;
    data?: any[];
    fetchData?: () => Promise<any[]>;
    type: 'image' | 'video' | 'class' | 'employee' | 'other' | 'alumni';
}

export function ListViewDialog({ title, trigger, data: initialData, fetchData, type }: ListViewDialogProps) {
    const [data, setData] = useState<any[]>(initialData || []);
    const [isLoading, setIsLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [hasFetched, setHasFetched] = useState(false);

    const [selectedItem, setSelectedItem] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 10;

    const handleOpenChange = async (open: boolean) => {
        setIsOpen(open);
        if (!open) {
            setSelectedItem(null);
        } else {
            setCurrentPage(1);
        }
        if (open && fetchData && !hasFetched) {
            setIsLoading(true);
            try {
                const result = await fetchData();
                setData(result || []);
                setHasFetched(true);
            } catch (error) {
                console.error('Failed to fetch data:', error);
            } finally {
                setIsLoading(false);
            }
        }
    };

    const hasData = data && data.length > 0;
    const totalPages = Math.ceil(data.length / pageSize);
    const paginatedData = data.slice((currentPage - 1) * pageSize, currentPage * pageSize);

    const renderContent = () => {
        if (isLoading) {
            return (
                <div className='flex justify-center p-8'>
                    <Loader2 className='h-8 w-8 animate-spin text-muted-foreground' />
                </div>
            );
        }

        if (!hasData) {
            return <div className='p-4 text-center text-muted-foreground'>No records found.</div>;
        }

        switch (type) {
            case 'image':
                if (selectedItem) {
                    const paramsUrl = selectedItem;
                    const isImage = /\.(jpg|jpeg|png|gif|webp)$/i.test(paramsUrl);
                    return (
                        <div className='flex flex-col gap-4'>
                            <Button variant='outline' size='sm' onClick={() => setSelectedItem(null)} className='self-start'>
                                Back to List
                            </Button>
                            <div className={!isImage ? 'flex h-[60vh] flex-1 items-center justify-center rounded-md border bg-muted p-2' : 'flex max-h-[80vh] overflow-y-auto items-center justify-center rounded-md border bg-muted p-2'}>
                                {isImage ? (
                                    /* eslint-disable-next-line @next/next/no-img-element */
                                    <img src={paramsUrl} alt='Selected' className='max-h-[75vh] max-w-full object-contain' />
                                ) : (
                                    <iframe
                                        src={`https://docs.google.com/viewer?url=${encodeURIComponent(paramsUrl)}&embedded=true`}
                                        className='h-full w-full border-0'
                                        title='Document Viewer'
                                    />
                                )}
                            </div>
                        </div>
                    );
                }

                return (
                    <div className='grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4'>
                        {paginatedData.map((item, pageIndex) => {
                            const index = (currentPage - 1) * pageSize + pageIndex;
                            const paramsUrl = item.coeeI_Images || item.COEEI_Images;
                            const fileName = paramsUrl.split('/').pop()?.split('?')[0] || `Attachment ${index + 1}`;

                            return (
                                <div
                                    key={index}
                                    className='group flex cursor-pointer flex-col items-center gap-2 rounded-md border p-4 transition-colors hover:bg-muted/50'
                                    onClick={() => setSelectedItem(paramsUrl)}>
                                    <div className='flex h-12 w-12 items-center justify-center rounded-full bg-muted transition-colors group-hover:bg-background'>
                                        <FileImage className='h-6 w-6 text-blue-600' />
                                    </div>
                                    <span className='line-clamp-2 break-all text-center font-medium text-sm' title={fileName}>
                                        {fileName}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                );
            case 'video':
                return (
                    <div className='flex flex-col gap-4'>
                        {paginatedData.map((item, pageIndex) => {
                            const index = (currentPage - 1) * pageSize + pageIndex;
                            return (
                                <div key={index} className='aspect-video w-full overflow-hidden rounded-md border bg-muted'>
                                    <video controls className='h-full w-full'>
                                        <source src={item.coeeV_Videos || item.COEEV_Videos || item.COEEV_VideoURL} />
                                        Your browser does not support the video tag.
                                    </video>
                                </div>
                            );
                        })}
                    </div>
                );
            case 'class':
                return (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className='text-center font-bold uppercase'>Sl. No</TableHead>
                                <TableHead className='text-center font-bold uppercase'>Class Name</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {paginatedData.map((item, pageIndex) => {
                                const index = (currentPage - 1) * pageSize + pageIndex;
                                return (
                                    <TableRow key={index}>
                                        <TableCell className='text-center'>{index + 1}</TableCell>
                                        <TableCell className='text-center'>{item.asmcL_ClassName || item.ASMCL_ClassName}</TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                );
            case 'employee':
                return (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className='text-center font-bold uppercase'>Sl. No</TableHead>
                                <TableHead className='text-center font-bold uppercase'>Employee Group Type</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {paginatedData.map((item, pageIndex) => {
                                const index = (currentPage - 1) * pageSize + pageIndex;
                                return (
                                    <TableRow key={index}>
                                        <TableCell className='text-center'>{index + 1}</TableCell>
                                        <TableCell className='text-center'>
                                            {item.hrmgT_EmployeeGroupType ||
                                                item.HRMGT_EmployeeGroupType ||
                                                item.hrmD_DepartmentName ||
                                                item.HRMD_DepartmentName ||
                                                item.hrmD_Id}
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                );
            case 'other':
                return (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className='text-center font-bold uppercase'>Name</TableHead>
                                <TableHead className='text-center font-bold uppercase'>Mobile</TableHead>
                                <TableHead className='text-center font-bold uppercase'>Email</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {paginatedData.map((item, pageIndex) => {
                                const index = (currentPage - 1) * pageSize + pageIndex;
                                return (
                                    <TableRow key={index}>
                                        <TableCell className='text-center'>{item.coeeO_Name || item.COEEO_Name}</TableCell>
                                        <TableCell className='text-center'>{item.coeeO_MobileNo || item.COEEO_MobileNo}</TableCell>
                                        <TableCell className='text-center'>{item.coeeO_Emailid || item.COEEO_Emailid}</TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                );
            case 'alumni':
                return (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className='text-center font-bold uppercase'>Sl. No</TableHead>
                                <TableHead className='text-center font-bold uppercase'>Alumni Name</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {paginatedData.map((item, pageIndex) => {
                                const index = (currentPage - 1) * pageSize + pageIndex;
                                return (
                                    <TableRow key={index}>
                                        <TableCell className='text-center'>{index + 1}</TableCell>
                                        <TableCell className='text-center'>{item.alumni_name || item.ALUMNI_NAME || 'Linked'}</TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                );
            default:
                return null;
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>{trigger}</DialogTrigger>
            <DialogContent className='flex max-h-[80vh] w-full max-w-4xl flex-col'>
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                </DialogHeader>
                <ScrollArea className='flex-1 pr-4'>{renderContent()}</ScrollArea>
                {hasData && totalPages > 1 && !selectedItem && (
                    <div className='flex items-center justify-between border-t pt-4'>
                        <Button
                            variant='outline'
                            size='sm'
                            onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                            disabled={currentPage === 1}>
                            <ChevronLeft className='mr-1 h-4 w-4' /> Previous
                        </Button>
                        <span className='text-muted-foreground text-sm'>
                            Page {currentPage} of {totalPages}
                        </span>
                        <Button
                            variant='outline'
                            size='sm'
                            onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                            disabled={currentPage === totalPages}>
                            Next <ChevronRight className='ml-1 h-4 w-4' />
                        </Button>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}
