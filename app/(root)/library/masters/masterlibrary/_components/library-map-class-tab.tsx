'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { InputText } from '@/components/ui/extension/input-text';
import { GenericDataTable, useDataTableProps } from '@/components/ui/data-table/generic-data-table';
import { useMasterLibraryMapping } from '@/hooks/library/useMasterLibraryMapping';
import { Save, X, Search } from 'lucide-react';
import { useState } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { ActionButtons } from '@/components/ui/form/action-buttons';

export function LibraryMapClassTab() {
    const { libraries, isLoading: isLibLoading } = useMasterLibraryMapping();
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedLibrary, setSelectedLibrary] = useState<string>('');
    const [selectedClasses, setSelectedClasses] = useState<number[]>([]);
    
    // Placeholder data for classes
    const classes = [
        { id: 1, name: 'I' },
        { id: 2, name: 'II' },
        { id: 3, name: 'III' },
        { id: 4, name: 'IV' },
        { id: 5, name: 'V' },
    ];

    const filteredClasses = classes.filter(c => 
        c.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleSave = () => {
        if (!selectedLibrary || selectedClasses.length === 0) {
            toast.error('Please select library and at least one class');
            return;
        }
        toast.success('Mapping saved successfully! (Simulation)');
        handleCancel();
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

    const tableProps = useDataTableProps({
        data: libraries.map((lib: any, index: number) => ({
            ...lib,
            slNo: index + 1,
            libraryName: lib.lmaL_LibraryName,
            viewClass: '---', // Placeholder
        }))
    });

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
                    <div className='grid grid-cols-1 gap-6 p-4 md:grid-cols-2'>
                        <div className='space-y-4'>
                            <div className='flex items-center gap-4'>
                                <label className='min-w-[100px] text-right text-sm font-medium'>
                                    Library Name:<span className='text-red-500'>*</span>
                                </label>
                                <div className='flex-1'>
                                    <Select value={selectedLibrary} onValueChange={setSelectedLibrary}>
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
                                            checked={selectedClasses.length === classes.length}
                                            onCheckedChange={(checked) => {
                                                if (checked) setSelectedClasses(classes.map(c => c.id));
                                                else setSelectedClasses([]);
                                            }}
                                        />
                                        <label htmlFor="all" className='text-xs font-medium'>
                                            All
                                        </label>
                                    </div>
                                    {filteredClasses.map((cls) => (
                                        <div key={cls.id} className='flex items-center space-x-2 p-1 hover:bg-muted/50 rounded'>
                                            <Checkbox 
                                                id={`cls-${cls.id}`} 
                                                checked={selectedClasses.includes(cls.id)}
                                                onCheckedChange={() => toggleClass(cls.id)}
                                            />
                                            <label htmlFor={`cls-${cls.id}`} className='text-xs'>
                                                {cls.name}
                                            </label>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className='flex justify-center gap-3 border-t pt-4 mt-4'>
                        <Button onClick={handleSave} className='bg-[#4251b1] hover:bg-[#35418e] h-8 px-6 text-xs'>
                            <Save className='mr-2 h-3.5 w-3.5' />
                            SAVE
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
                        { accessorKey: 'slNo', header: 'Sl.No.' },
                        { accessorKey: 'libraryName', header: 'Library Name' },
                        { accessorKey: 'viewClass', header: 'View Class' },
                        {
                            id: 'actions',
                            header: 'Action',
                            cell: ({ row }) => (
                                <ActionButtons
                                    rowData={row.original}
                                    buttons={{ edit: true, toggle: true }}
                                    onEdit={(data) => toast.info(`Editing mapping for ${data.libraryName}`)}
                                    onToggle={(data) => toast.info(`Toggling status for ${data.libraryName}`)}
                                    toggleConditionKey='lmaL_ActiveFlag'
                                />
                            )
                        },
                    ]}
                    columnPinning={{ right: ['actions'] }}
                    noDataTitle='No Records Found'
                />
            </CollapsibleSection>
        </div>
    );
}

