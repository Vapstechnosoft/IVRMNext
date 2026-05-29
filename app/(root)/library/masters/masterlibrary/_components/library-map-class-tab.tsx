'use client';

import { Button } from '@/components/ui/button';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { InputText } from '@/components/ui/extension/input-text';
import { GenericDataTable, useDataTableProps } from '@/components/ui/data-table/generic-data-table';
import { useMasterLibraryMapping, useMasterLibraryEditData, useMasterLibrarySaveClassMapping } from '@/hooks/library/useMasterLibraryMapping';
import { Save, X, Search, Eye } from 'lucide-react';
import { useState } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { ActionButtons } from '@/components/ui/form/action-buttons';
import { toggleMasterLibrary } from '@/server/library/masters/master_library';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogClose
} from '@/components/ui/dialog';
import { AdaptiveBody, AdaptiveDialog, AdaptiveFooter } from '@/components/ui/extension/adaptive-dialog';

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

    const filteredClasses = classes.filter((c: any) => 
        c.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

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
        } catch (error) {
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
        setSelectedClasses(prev => 
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
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
        } catch (error) {
            toast.error('An error occurred while toggling status');
        } finally {
            setIsToggling(false);
        }
    };

    const tableProps = useDataTableProps({
        data: libraries.map((lib: any, index: number) => ({
            ...lib,
            slNo: index + 1,
            libraryName: lib.lmaL_LibraryName,
        }))
    });

    const handleViewClasses = async (libData: any) => {
        setViewLibraryData(libData);
        setMappedClassesInPopup([]);
        setIsViewModalOpen(true);
        try {
            const response: any = await fetchEditClass(libData.lmaL_Id);
            const mappedData = response?.data?.lib_class_list || response?.lib_class_list || response?.data?.mapped_list || response?.mapped_list || [];
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
            const mappedData = response?.data?.lib_class_list || response?.lib_class_list || response?.data?.mapped_list || response?.mapped_list || [];
            
            const ids = mappedData.map((m: any) => m.asmcL_Id || m.ASMCL_Id || m.asmcl_id).filter(Boolean);
            setSelectedClasses(ids);
            
            if (ids.length > 0) {
                toast.success('Mapping details loaded for editing');
            } else {
                toast.info('No existing mapping found for this library');
            }
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } catch (error) {
            toast.error('Failed to fetch details for editing');
        }
    };

    return (
        <div className='space-y-4'>
            <div className='mx-auto max-w-3xl'>
                <CollapsibleSection
                    title='MASTER LIBRARY'
                    defaultOpen
                    variant='outline'
                    size='md'
                    className='shadow-lg duration-300'
                >
                    {/* ... (Form Content Same) ... */}
                    <div className='grid grid-cols-1 gap-6 p-4 md:grid-cols-2'>
                        <div className='space-y-4'>
                            <div className='flex items-center gap-4'>
                                <label className='min-w-[100px] text-right text-sm font-medium'>
                                    Library Name:<span className='text-red-500'>*</span>
                                </label>
                                <div className='flex-1'>
                                    <Select key={selectedLibrary} value={selectedLibrary} onValueChange={setSelectedLibrary}>
                                        <SelectTrigger className='h-9'>
                                            <SelectValue placeholder='--Select Library--' />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {(libraries || []).map((lib: any) => (
                                                <SelectItem key={lib.lmaL_Id || `lib-${Math.random()}`} value={lib.lmaL_Id?.toString() || ''}>
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
                                <label className='min-w-[100px] mt-2 text-right text-sm font-medium'>
                                    Class Name:<span className='text-red-500'>*</span>
                                </label>
                                <div className='flex-1 border rounded-md p-2 max-h-[150px] overflow-y-auto space-y-1 bg-white shadow-inner'>
                                    <div className='relative mb-2'>
                                        <Search className='absolute left-2 top-2 h-3.5 w-3.5 text-muted-foreground' />
                                        <InputText 
                                            placeholder='search here...' 
                                            className='pl-8 h-8 text-xs' 
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                        />
                                    </div>
                                    <div className='flex items-center space-x-2 p-1 border-b pb-1'>
                                        <Checkbox 
                                            id="all" 
                                            checked={classes.length > 0 && selectedClasses.length === classes.length}
                                            onCheckedChange={(checked) => {
                                                if (checked) setSelectedClasses(classes.map((c: any) => c.id));
                                                else setSelectedClasses([]);
                                            }}
                                        />
                                        <label htmlFor="all" className='text-xs font-medium cursor-pointer'>
                                            All
                                        </label>
                                    </div>
                                    {filteredClasses.length > 0 ? filteredClasses.map((cls: any) => (
                                        <div key={cls.id} className='flex items-center space-x-2 p-1 hover:bg-muted/50 rounded'>
                                            <Checkbox 
                                                id={`cls-${cls.id}`} 
                                                checked={selectedClasses.includes(cls.id)}
                                                onCheckedChange={() => toggleClass(cls.id)}
                                            />
                                            <label htmlFor={`cls-${cls.id}`} className='text-xs cursor-pointer'>
                                                {cls.name}
                                            </label>
                                        </div>
                                    )) : (
                                        <div className='text-center p-4 text-xs text-muted-foreground italic'>
                                            No classes found
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className='flex justify-center gap-3 border-t pt-4 mt-4'>
                        <Button onClick={handleSave} disabled={isSaving} className='bg-[#4251b1] hover:bg-[#35418e] h-8 px-6 text-xs'>
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

            <CollapsibleSection
                title='CLASS DETAILS'
                defaultOpen
                variant='default'
                size='lg'
                className='shadow-lg'
            >
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
                                    variant="link" 
                                    className="text-blue-600 flex items-center gap-2 p-0 h-auto font-medium"
                                    onClick={() => handleViewClasses(row.original)}
                                >
                                    <Eye className="h-4 w-4" />
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
                        },
                    ]}
                    columnPinning={{ right: ['actions'] }}
                    noDataTitle='No Records Found'
                />
            </CollapsibleSection>

            {/* View Mapped Classes Modal (Same) */}
            <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col p-0 gap-0 border-none shadow-2xl rounded-xl">
                    <DialogHeader className="bg-gradient-to-r from-[#4251b1] to-[#35418e] p-5 text-white flex flex-row items-center justify-between space-y-0 sticky top-0 z-10">
                        <DialogTitle className="text-xl font-bold tracking-tight uppercase">CLASS DETAILS</DialogTitle>
                        <DialogClose className="opacity-70 transition-opacity hover:opacity-100 focus:outline-none disabled:pointer-events-none data-[state=open]:bg-secondary data-[state=open]:text-muted-foreground bg-white/20 hover:bg-white/30 p-1.5 rounded-full ring-0 border-none">
                            <X className="h-4 w-4 text-white" />
                            <span className="sr-only">Close</span>
                        </DialogClose>
                    </DialogHeader>
                    
                    <div className="flex-1 overflow-y-auto p-6 bg-slate-50/50">
                        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                            <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/30">
                                <span className="text-sm font-semibold text-slate-700 uppercase tracking-wider">
                                    Total Grid Records: <span className="bg-[#4251b1] text-white px-2 py-0.5 rounded-full text-xs ml-1">{mappedClassesInPopup.length}</span>
                                </span>
                            </div>
                            
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm text-left border-collapse">
                                    <thead>
                                        <tr className="bg-slate-100/80 text-[#4251b1] uppercase text-[11px] font-bold tracking-widest border-b border-slate-200">
                                            <th className="px-6 py-4 border-r border-slate-200/50 w-20 text-center">Sl.No.</th>
                                            <th className="px-6 py-4 border-r border-slate-200/50">Library Name</th>
                                            <th className="px-6 py-4 border-r border-slate-200/50">Class Name</th>
                                            <th className="px-6 py-4 text-center">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {isFetchingClass ? (
                                            <tr>
                                                <td colSpan={4} className="px-6 py-12 text-center bg-white">
                                                    <div className="flex flex-col items-center gap-2">
                                                        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#4251b1] border-t-transparent"></div>
                                                        <span className="text-slate-500 font-medium">Loading mapping details...</span>
                                                    </div>
                                                </td>
                                            </tr>
                                        ) : mappedClassesInPopup.length > 0 ? (
                                            mappedClassesInPopup.map((item: any, idx: number) => (
                                                <tr key={idx} className="hover:bg-blue-50/30 transition-colors duration-150">
                                                    <td className="px-6 py-4 text-center border-r border-slate-100/50 text-slate-500 font-medium">{idx + 1}</td>
                                                    <td className="px-6 py-4 border-r border-slate-100/50 font-semibold text-slate-700">{viewLibraryData?.libraryName}</td>
                                                    <td className="px-6 py-4 border-r border-slate-100/50 text-slate-600">{item.asmcL_ClassName || 'N/A'}</td>
                                                    <td className="px-6 py-4 text-center">
                                                        <Button 
                                                            variant="link" 
                                                            className="text-red-500 hover:text-red-700 p-0 h-auto font-bold text-xs uppercase tracking-tighter"
                                                            onClick={() => toast.info(`De-activating ${item.asmcL_ClassName} for ${viewLibraryData?.libraryName}`)}
                                                        >
                                                            De-Activate
                                                        </Button>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan={4} className="px-6 py-12 text-center text-slate-400 italic bg-white">
                                                    <div className="flex flex-col items-center gap-2">
                                                        <Search className="h-8 w-8 opacity-20 mb-2" />
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
                    
                    <DialogFooter className="p-4 border-t bg-slate-50 flex justify-end">
                        <DialogClose asChild>
                            <Button variant="outline" className="h-9 px-6 border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-900 font-medium">
                                Close
                            </Button>
                        </DialogClose>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Confirmation Dialog for Toggle */}
            <AdaptiveDialog 
                title='Toggle Library Status' 
                isOpen={isToggleModalOpen} 
                onClose={() => setIsToggleModalOpen(false)}
            >
                <AdaptiveBody className='flex flex-col gap-5'>
                    <p className='text-sm text-slate-600'>
                        Are you sure you want to {toggleData?.lmaL_ActiveFlag ? 'deactivate' : 'activate'} record <strong>{toggleData?.libraryName}</strong>?
                    </p>
                </AdaptiveBody>
                <AdaptiveFooter>
                    <Button variant='secondary' onClick={() => setIsToggleModalOpen(false)} type='button' className='h-9 px-6 text-xs' disabled={isToggling}>
                        CANCEL
                    </Button>
                    <Button 
                        onClick={confirmToggleStatus} 
                        variant={toggleData?.lmaL_ActiveFlag ? 'destructive' : 'default'}
                        className='h-9 px-6 text-xs'
                        isLoading={isToggling}
                        disabled={isToggling}
                    >
                        {toggleData?.lmaL_ActiveFlag ? 'DEACTIVATE' : 'ACTIVATE'}
                    </Button>
                </AdaptiveFooter>
            </AdaptiveDialog>
        </div>
    );
}
