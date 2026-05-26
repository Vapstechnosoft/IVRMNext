'use client';

import { Button } from '@/components/ui/button';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { FormProvider } from '@/components/ui/form/form-provider';
import { useEffect, useState } from 'react';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { checkLibraryDataValidation, getImportLibraryDataInitial, saveImportLibraryData } from '@/server/library/reports/importlibrarydata';
import { toast } from 'sonner';
import * as XLSX from 'xlsx';

export default function ImportLibraryDataPage() {
    return (
        <FormProvider<any>>
            <ImportLibraryDataContent />
        </FormProvider>
    );
}

function ImportLibraryDataContent() {
    const [libraries, setLibraries] = useState<any[]>([]);
    const [selectedLibraryId, setSelectedLibraryId] = useState<string>('');
    const [gridData, setGridData] = useState<any[]>([]);
    const [columns, setColumns] = useState<any[]>([]);
    const [filename, setFilename] = useState<string>('');
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        setIsLoading(true);
        getImportLibraryDataInitial()
            .then((res) => {
                if (res?.masterlibarary?.length > 0) {
                    setLibraries(res.masterlibarary);
                }
            })
            .catch((err) => {
                toast.error(err.message || 'Failed to fetch libraries');
            })
            .finally(() => {
                setIsLoading(false);
            });
    }, []);

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.type !== 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' && !file.name.endsWith('.xlsx')) {
            toast.error('Please upload a valid .xlsx file');
            return;
        }

        setFilename(file.name);
        const reader = new FileReader();
        reader.onload = async (evt) => {
            try {
                const data = evt.target?.result;
                const workbook = XLSX.read(data, { type: 'binary' });
                const firstSheetName = workbook.SheetNames[0];
                const headerNames = XLSX.utils.sheet_to_json<string[]>(workbook.Sheets[firstSheetName], { header: 1 })[0];
                const rowData = XLSX.utils.sheet_to_json<any>(workbook.Sheets[firstSheetName]);

                if (!rowData || rowData.length === 0) {
                    toast.error('Excel Sheet is Empty');
                    setGridData([]);
                    setColumns([]);
                    if (e.target) e.target.value = '';
                    return;
                }

                // Validation API
                const validationPayload = { newlstget1: rowData };
                const res = await checkLibraryDataValidation(validationPayload);
                if (res?.stuStatus && res.stuStatus !== '') {
                    toast.error(res.stuStatus);
                    setGridData([]);
                    setColumns([]);
                    if (e.target) e.target.value = '';
                } else {
                    setGridData(rowData);
                    setColumns(headerNames || []);
                }
            } catch (_error: any) {
                toast.error('Error parsing excel file');
            }
        };
        reader.readAsBinaryString(file);
    };

    const handleSave = async () => {
        if (!selectedLibraryId) {
            toast.error('Library Name Is Not Selected !');
            return;
        }
        if (gridData.length === 0) {
            toast.error('Please upload a valid excel data');
            return;
        }

        setIsSaving(true);
        try {
            let data: any = {};
            // Formatting dates if necessary like the old angular script did.
            const formattedData = gridData.map((item) => {
                const newItem = { ...item };
                if (newItem.LBTR_IssuedDate) newItem.LBTR_IssuedDate = new Date(newItem.LBTR_IssuedDate).toISOString().split('T')[0];
                if (newItem.LBTR_ReturnedDate) newItem.LBTR_ReturnedDate = new Date(newItem.LBTR_ReturnedDate).toISOString().split('T')[0];
                return newItem;
            });

            if (filename === 'LIB.LIB_Master_Subject.xlsx') {
                data = { mastersub: formattedData, LMAL_Id: selectedLibraryId };
            } else if (filename === 'LIB.LIB_Master_Department.xlsx') {
                data = { masterdep: formattedData, LMAL_Id: selectedLibraryId };
            } else if (filename === 'LIB.LIB_Master_Language.xlsx') {
                data = { masterlang: formattedData };
            } else if (filename === 'LIB.LIB_Master_Publisher.xlsx') {
                data = { masterpubl: formattedData, LMAL_Id: selectedLibraryId };
            } else if (filename === 'LIB_Master_Book.xlsx') {
                data = { masterbook: formattedData, LMAL_Id: selectedLibraryId };
            } else if (filename === 'LIB_Master_Rack.xlsx') {
                data = { masterrack: formattedData, LMAL_Id: selectedLibraryId };
            } else if (filename === 'LIB_Master_Book_Author.xlsx') {
                data = { masterauthor: formattedData, LMAL_Id: selectedLibraryId };
            } else if (filename === 'LIB_Master_Book_AccnNo.xlsx') {
                data = { masteracces: formattedData, LMAL_Id: selectedLibraryId };
            } else if (filename === 'LIB_trans.xlsx') {
                data = { booktransIMP: formattedData, LMAL_Id: selectedLibraryId };
            } else if (filename === 'vendor.xlsx') {
                data = { mastervender: formattedData, LMAL_Id: selectedLibraryId };
            } else {
                toast.error('Please Select Correct File Format Name');
                setIsSaving(false);
                return;
            }

            const response = await saveImportLibraryData(data);
            if (response?.returnval) {
                toast.success(`Row Saved --${response.suscnt} Failed Row --${response.failcnt} Existing Row --${response.dupcnt}`);
                setGridData([]);
                setColumns([]);
                setSelectedLibraryId('');
                setFilename('');
            } else {
                toast.error('Please Select Correct File Format');
            }
        } catch (error: any) {
            toast.error(error.message || 'Failed to save data');
        } finally {
            setIsSaving(false);
        }
    };

    const handleClear = () => {
        setGridData([]);
        setColumns([]);
        setSelectedLibraryId('');
        setFilename('');
        // clear file input via ref if we had one, but state clear is enough for logic
    };

    return (
        <div className='min-h-screen'>
            <div className='container space-y-4 p-1'>
                <CollapsibleSection title='LIBRARY DATA IMPORT' defaultOpen={true} variant='outline' size='md' className='shadow-lg'>
                    <div className='flex justify-center p-4'>
                        <div className='rounded border px-6 py-2 text-center font-semibold text-green-600'>
                            ** Kindly Select Only One Excel Sheet To Import
                        </div>
                    </div>
                </CollapsibleSection>

                <CollapsibleSection title='IMPORTED DATA FROM EXCEL' defaultOpen={true} variant='default' size='lg' className='shadow-lg'>
                    <div className='space-y-6 p-4'>
                        {/* Top Controls Row */}
                        <div className='flex flex-wrap items-center justify-between gap-4 border-b pb-4'>
                            <div className='flex flex-wrap items-center gap-6'>
                                <div className='relative'>
                                    <Input id='excel-upload' type='file' accept='.xlsx' onChange={handleFileUpload} className='hidden' />
                                    <Label
                                        htmlFor='excel-upload'
                                        className='flex min-w-[150px] cursor-pointer items-center justify-center rounded bg-yellow-400 px-6 py-2 font-bold text-black text-sm shadow-sm hover:bg-yellow-500'>
                                        Choose File
                                    </Label>
                                </div>
                                <div className='flex items-center gap-3'>
                                    <Label className='whitespace-nowrap'>Library Name</Label>
                                    <Select value={selectedLibraryId} onValueChange={setSelectedLibraryId} disabled={isLoading}>
                                        <SelectTrigger className='w-[250px]'>
                                            <SelectValue placeholder='Select Library Name' />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {libraries.map((lib: any) => (
                                                <SelectItem key={lib.lmaL_Id} value={String(lib.lmaL_Id)}>
                                                    {lib.lmaL_LibraryName}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <div className='w-full md:w-[250px]'>
                                <div className='relative'>
                                    <Input placeholder='search here...' className='pr-8 pl-3' />
                                    <div className='pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3'>
                                        <svg
                                            className='h-4 w-4 text-gray-500'
                                            fill='none'
                                            stroke='currentColor'
                                            viewBox='0 0 24 24'
                                            xmlns='http://www.w3.org/2000/svg'>
                                            <path
                                                strokeLinecap='round'
                                                strokeLinejoin='round'
                                                strokeWidth='2'
                                                d='M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z'
                                            />
                                        </svg>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className='flex justify-center gap-4'>
                            <Button
                                size='sm'
                                onClick={handleSave}
                                disabled={isSaving || !selectedLibraryId || gridData.length === 0}
                                className='w-24 bg-red-600 text-white hover:bg-red-700'>
                                {isSaving ? 'Saving...' : 'Save'}
                            </Button>
                            <Button variant='destructive' size='sm' onClick={handleClear} disabled={isSaving} className='w-24'>
                                Cancel
                            </Button>
                        </div>

                        {/* Table */}
                        {gridData.length > 0 ? (
                            <div className='max-h-[500px] overflow-auto rounded-md border'>
                                <table className='w-full border-collapse text-center text-sm'>
                                    <thead className='sticky top-0 bg-primary text-primary-foreground'>
                                        <tr>
                                            <th className='border p-2'>SLNO</th>
                                            {columns.map((col, idx) => (
                                                <th key={idx} className='border p-2'>
                                                    {col}
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {gridData.map((row, rIdx) => (
                                            <tr key={rIdx} className='border-b hover:bg-muted/50'>
                                                <td className='border p-2'>{rIdx + 1}</td>
                                                {columns.map((col, cIdx) => (
                                                    <td key={cIdx} className='border p-2'>
                                                        {row[col]}
                                                    </td>
                                                ))}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className='overflow-x-auto rounded-md border'>
                                <div className='flex min-h-[20px] items-center justify-center bg-gray-100 p-4' />
                            </div>
                        )}
                    </div>
                </CollapsibleSection>
            </div>
        </div>
    );
}
