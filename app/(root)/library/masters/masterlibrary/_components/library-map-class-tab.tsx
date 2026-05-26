'use client';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { GenericDataTable, useDataTableProps } from '@/components/ui/data-table/generic-data-table';
import { Dialog, DialogClose, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AdaptiveBody, AdaptiveDialog, AdaptiveFooter } from '@/components/ui/extension/adaptive-dialog';
import { InputText } from '@/components/ui/extension/input-text';
import { ActionButtons } from '@/components/ui/form/action-buttons';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
    useMasterLibraryEditData,
    useMasterLibraryMapping,
    useMasterLibrarySaveClassMapping
} from '@/hooks/library/useMasterLibraryMapping';
import { toggleMasterLibrary } from '@/server/library/masters/master_library';
import { Eye, Save, Search, X } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

export function LibraryMapClassTab() {
    const { libraries, classes: fetchedClasses, isLoading: isLibLoading, refetchAll } = useMasterLibraryMapping();
    const { fetchEditClass, isFetchingClass } = useMasterLibraryEditData();
    const saveMapping = useMasterLibrarySaveClassMapping();
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedLibrary, setSelectedLibrary] = useState<string>('');
    const [selectedClasses, setSelectedClasses] = useState<number[]>([]);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [viewLibraryData, setViewLibraryData] = useState<any>(null);
    const [mappedClassesInPopup, setMappedClassesInPopup] = useState<any[]>([]);
    const [isSaving, setIsSaving] = useState(false);

    // Toggle Modal State
    const [isToggleModalOpen, setIsToggleModalOpen] = useState(false);
    const [toggleData, setToggleData] = useState<any>(null);
    const [isToggling, setIsToggling] = useState(false);

    const classes = (fetchedClasses || []).map((c: any) => ({
        id: c.asmcL_Id,
        name: c.asmcL_ClassName
    }));

    const filteredClasses = classes.filter((c: any) => c.name.toLowerCase().includes(searchTerm.toLowerCase()));

    const handleSave = async () => {
        if (!selectedLibrary || selectedClasses.length === 0) {
            toast.error('Please select library and at least one class');
            return;
        }

        setIsSaving(true);
        const payload = {
            LMAL_Id: Number(selectedLibrary),
            classlst: selectedClasses.map((id: any) => ({ ASMCL_Id: Number(id) }))
        };

        try {
            const response = await saveMapping.mutateAsync(payload);
            if (response.success || response.message?.toLowerCase().includes('success')) {
                toast.success(response.message || 'Mapping saved successfully!');
                handleCancel();
                refetchAll();
            } else {
                toast.error(response.message || 'Failed to save mapping');
            }
        } catch (_error) {
            toast.error('An error occurred while saving');
        } finally {
            setIsSaving(false);
        }
    };

    const handleCancel = () => {
        setSelectedLibrary('');
        setSelectedClasses([]);
        setSearchTerm('');
    };

    const toggleClass = (id: number) => {
        setSelectedClasses((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]));
    };

    const openToggleDialog = (libData: any) => {
        setToggleData(libData);
        setIsToggleModalOpen(true);
    };

    const confirmToggleStatus = async () => {
        if (!toggleData) return;
        setIsToggling(true);
        try {
            const response = await toggleMasterLibrary(Number(toggleData.lmaL_Id));
            if (response.success || response.message?.toLowerCase().includes('success')) {
                toast.success(response.message || 'Status updated successfully');
                refetchAll();
                setIsToggleModalOpen(false);
            } else {
                toast.error(response.message || 'Failed to update status');
            }
        } catch (_error) {
            toast.error('An error occurred while toggling status');
        } finally {
            setIsToggling(false);
        }
    };

    const tableProps = useDataTableProps({
        data: libraries.map((lib: any, index: number) => ({
            ...lib,
            slNo: index + 1,
            libraryName: lib.lmaL_LibraryName
        }))
    });

    const handleViewClasses = async (libData: any) => {
        setViewLibraryData(libData);
        setMappedClassesInPopup([]);
        setIsViewModalOpen(true);
        try {
            const response: any = await fetchEditClass(libData.lmaL_Id);
            const mappedData =
                response?.data?.lib_class_list || response?.lib_class_list || response?.data?.mapped_list || response?.mapped_list || [];
            setMappedClassesInPopup(mappedData);
        } catch (error) {
            console.error('Error fetching mapped classes:', error);
            toast.error('Failed to fetch mapped classes');
        }
    };

    const handleEdit = async (libData: any) => {
        setSelectedLibrary(libData.lmaL_Id.toString());
        setSelectedClasses([]); // Clear first
        try {
            const response: any = await fetchEditClass(libData.lmaL_Id);
            const mappedData =
                response?.data?.lib_class_list || response?.lib_class_list || response?.data?.mapped_list || response?.mapped_list || [];

            const ids = mappedData.map((m: any) => m.asmcL_Id || m.ASMCL_Id || m.asmcl_id).filter(Boolean);
            setSelectedClasses(ids);

            if (ids.length > 0) {
                toast.success('Mapping details loaded for editing');
            } else {
                toast.info('No existing mapping found for this library');
            }
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } catch (_error) {
            toast.error('Failed to fetch details for editing');
        }
    };

    return (
        <div className='space-y-4'>
            <div className='mx-auto max-w-3xl'>
                <CollapsibleSection title='MASTER LIBRARY' defaultOpen variant='outline' size='md' className='shadow-lg duration-300'>
                    {/* ... (Form Content Same) ... */}
                    <div className='grid grid-cols-1 gap-6 p-4 md:grid-cols-2'>
                        <div className='space-y-4'>
                            <div className='flex items-center gap-4'>
                                <label className='min-w-[100px] text-right font-medium text-sm'>
                                    Library Name:<span className='text-red-500'>*</span>
                                </label>
                                <div className='flex-1'>
                                    <Select key={selectedLibrary} value={selectedLibrary} onValueChange={setSelectedLibrary}>
                                        <SelectTrigger className='h-9'>
                                            <SelectValue placeholder='--Select Library--' />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {(libraries || []).map((lib: any) => (
                                                <SelectItem
                                                    key={lib.lmaL_Id || `lib-${Math.random()}`}
                                                    value={lib.lmaL_Id?.toString() || ''}>
                                                    {lib.lmaL_LibraryName}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </div>

                        <div className='space-y-2'>
                            <div className='flex items-start gap-4'>
                                <label className='mt-2 min-w-[100px] text-right font-medium text-sm'>
                                    Class Name:<span className='text-red-500'>*</span>
                                </label>
                                <div className='max-h-[150px] flex-1 space-y-1 overflow-y-auto rounded-md border bg-white p-2 shadow-inner'>
                                    <div className='relative mb-2'>
                                        <Search className='absolute top-2 left-2 h-3.5 w-3.5 text-muted-foreground' />
                                        <InputText
                                            placeholder='search here...'
                                            className='h-8 pl-8 text-xs'
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                        />
                                    </div>
                                    <div className='flex items-center space-x-2 border-b p-1 pb-1'>
                                        <Checkbox
                                            id='all'
                                            checked={classes.length > 0 && selectedClasses.length === classes.length}
                                            onCheckedChange={(checked) => {
                                                if (checked) setSelectedClasses(classes.map((c: any) => c.id));
                                                else setSelectedClasses([]);
                                            }}
                                        />
                                        <label htmlFor='all' className='cursor-pointer font-medium text-xs'>
                                            All
                                        </label>
                                    </div>
                                    {filteredClasses.length > 0 ? (
                                        filteredClasses.map((cls: any) => (
                                            <div key={cls.id} className='flex items-center space-x-2 rounded p-1 hover:bg-muted/50'>
                                                <Checkbox
                                                    id={`cls-${cls.id}`}
                                                    checked={selectedClasses.includes(cls.id)}
                                                    onCheckedChange={() => toggleClass(cls.id)}
                                                />
                                                <label htmlFor={`cls-${cls.id}`} className='cursor-pointer text-xs'>
                                                    {cls.name}
                                                </label>
                                            </div>
                                        ))
                                    ) : (
                                        <div className='p-4 text-center text-muted-foreground text-xs italic'>No classes found</div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className='mt-4 flex justify-center gap-3 border-t pt-4'>
                        <Button onClick={handleSave} disabled={isSaving} className='h-8 bg-[#4251b1] px-6 text-xs hover:bg-[#35418e]'>
                            <Save className='mr-2 h-3.5 w-3.5' />
                            {isSaving ? 'SAVING...' : 'SAVE'}
                        </Button>
                        <Button onClick={handleCancel} variant='destructive' className='h-8 px-6 text-xs'>
                            <X className='mr-2 h-3.5 w-3.5' />
                            CANCEL
                        </Button>
                    </div>
                </CollapsibleSection>
            </div>

            <CollapsibleSection title='CLASS DETAILS' defaultOpen variant='default' size='lg' className='shadow-lg'>
                <GenericDataTable
                    {...tableProps}
                    isLoading={isLibLoading}
                    columns={[
                        { accessorKey: 'slNo', header: 'Sl.No.', size: 80 },
                        { accessorKey: 'libraryName', header: 'Library Name' },
                        {
                            accessorKey: 'viewClass',
                            header: 'View Class',
                            cell: ({ row }) => (
                                <Button
                                    variant='link'
                                    className='flex h-auto items-center gap-2 p-0 font-medium text-blue-600'
                                    onClick={() => handleViewClasses(row.original)}>
                                    <Eye className='h-4 w-4' />
                                    @View Classes
                                </Button>
                            )
                        },
                        {
                            id: 'actions',
                            header: 'Action',
                            size: 150,
                            cell: ({ row }) => (
                                <ActionButtons
                                    rowData={row.original}
                                    buttons={{ edit: true, toggle: true }}
                                    onEdit={handleEdit}
                                    onToggle={() => openToggleDialog(row.original)}
                                    toggleConditionKey='lmaL_ActiveFlag'
                                />
                            )
                        }
                    ]}
                    columnPinning={{ right: ['actions'] }}
                    noDataTitle='No Records Found'
                />
            </CollapsibleSection>

            {/* View Mapped Classes Modal (Same) */}
            <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
                <DialogContent className='flex max-h-[90vh] max-w-4xl flex-col gap-0 overflow-hidden rounded-xl border-none p-0 shadow-2xl'>
                    <DialogHeader className='sticky top-0 z-10 flex flex-row items-center justify-between space-y-0 bg-gradient-to-r from-[#4251b1] to-[#35418e] p-5 text-white'>
                        <DialogTitle className='font-bold text-xl uppercase tracking-tight'>CLASS DETAILS</DialogTitle>
                        <DialogClose className='rounded-full border-none bg-white/20 p-1.5 opacity-70 ring-0 transition-opacity hover:bg-white/30 hover:opacity-100 focus:outline-none disabled:pointer-events-none data-[state=open]:bg-secondary data-[state=open]:text-muted-foreground'>
                            <X className='h-4 w-4 text-white' />
                            <span className='sr-only'>Close</span>
                        </DialogClose>
                    </DialogHeader>

                    <div className='flex-1 overflow-y-auto bg-slate-50/50 p-6'>
                        <div className='overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm'>
                            <div className='flex items-center justify-between border-slate-100 border-b bg-slate-50/30 p-4'>
                                <span className='font-semibold text-slate-700 text-sm uppercase tracking-wider'>
                                    Total Grid Records:{' '}
                                    <span className='ml-1 rounded-full bg-[#4251b1] px-2 py-0.5 text-white text-xs'>
                                        {mappedClassesInPopup.length}
                                    </span>
                                </span>
                            </div>

                            <div className='overflow-x-auto'>
                                <table className='w-full border-collapse text-left text-sm'>
                                    <thead>
                                        <tr className='border-slate-200 border-b bg-slate-100/80 font-bold text-[#4251b1] text-[11px] uppercase tracking-widest'>
                                            <th className='w-20 border-slate-200/50 border-r px-6 py-4 text-center'>Sl.No.</th>
                                            <th className='border-slate-200/50 border-r px-6 py-4'>Library Name</th>
                                            <th className='border-slate-200/50 border-r px-6 py-4'>Class Name</th>
                                            <th className='px-6 py-4 text-center'>Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className='divide-y divide-slate-100'>
                                        {isFetchingClass ? (
                                            <tr>
                                                <td colSpan={4} className='bg-white px-6 py-12 text-center'>
                                                    <div className='flex flex-col items-center gap-2'>
                                                        <div className='h-8 w-8 animate-spin rounded-full border-4 border-[#4251b1] border-t-transparent' />
                                                        <span className='font-medium text-slate-500'>Loading mapping details...</span>
                                                    </div>
                                                </td>
                                            </tr>
                                        ) : mappedClassesInPopup.length > 0 ? (
                                            mappedClassesInPopup.map((item: any, idx: number) => (
                                                <tr key={idx} className='transition-colors duration-150 hover:bg-blue-50/30'>
                                                    <td className='border-slate-100/50 border-r px-6 py-4 text-center font-medium text-slate-500'>
                                                        {idx + 1}
                                                    </td>
                                                    <td className='border-slate-100/50 border-r px-6 py-4 font-semibold text-slate-700'>
                                                        {viewLibraryData?.libraryName}
                                                    </td>
                                                    <td className='border-slate-100/50 border-r px-6 py-4 text-slate-600'>
                                                        {item.asmcL_ClassName || 'N/A'}
                                                    </td>
                                                    <td className='px-6 py-4 text-center'>
                                                        <Button
                                                            variant='link'
                                                            className='h-auto p-0 font-bold text-red-500 text-xs uppercase tracking-tighter hover:text-red-700'
                                                            onClick={() =>
                                                                toast.info(
                                                                    `De-activating ${item.asmcL_ClassName} for ${viewLibraryData?.libraryName}`
                                                                )
                                                            }>
                                                            De-Activate
                                                        </Button>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan={4} className='bg-white px-6 py-12 text-center text-slate-400 italic'>
                                                    <div className='flex flex-col items-center gap-2'>
                                                        <Search className='mb-2 h-8 w-8 opacity-20' />
                                                        No mapped classes found for this library.
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                    <DialogFooter className='flex justify-end border-t bg-slate-50 p-4'>
                        <DialogClose asChild>
                            <Button
                                variant='outline'
                                className='h-9 border-slate-200 px-6 font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900'>
                                Close
                            </Button>
                        </DialogClose>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Confirmation Dialog for Toggle */}
            <AdaptiveDialog title='Toggle Library Status' isOpen={isToggleModalOpen} onClose={() => setIsToggleModalOpen(false)}>
                <AdaptiveBody className='flex flex-col gap-5'>
                    <p className='text-slate-600 text-sm'>
                        Are you sure you want to {toggleData?.lmaL_ActiveFlag ? 'deactivate' : 'activate'} record{' '}
                        <strong>{toggleData?.libraryName}</strong>?
                    </p>
                </AdaptiveBody>
                <AdaptiveFooter>
                    <Button
                        variant='secondary'
                        onClick={() => setIsToggleModalOpen(false)}
                        type='button'
                        className='h-9 px-6 text-xs'
                        disabled={isToggling}>
                        CANCEL
                    </Button>
                    <Button
                        onClick={confirmToggleStatus}
                        variant={toggleData?.lmaL_ActiveFlag ? 'destructive' : 'default'}
                        className='h-9 px-6 text-xs'
                        isLoading={isToggling}
                        disabled={isToggling}>
                        {toggleData?.lmaL_ActiveFlag ? 'DEACTIVATE' : 'ACTIVATE'}
                    </Button>
                </AdaptiveFooter>
            </AdaptiveDialog>
        </div>
    );
}
