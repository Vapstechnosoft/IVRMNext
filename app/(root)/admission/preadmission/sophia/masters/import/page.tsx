'use client';

import { useState } from 'react';
import ImportForm from './_components/import-form';
import PreviewTable from './_components/preview-table';
import { Button } from '@/components/ui/button';
import { Save, X, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import Swal from 'sweetalert2';
import { checkImportValidation, saveImportedData } from '@/server/admission/preadmission/masters/admission_import';

export default function StudentImportPage() {
    const [importedData, setImportedData] = useState<any[]>([]);
    const [headers, setHeaders] = useState<string[]>([]);
    const [isValidated, setIsValidated] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isValidating, setIsValidating] = useState(false);

    const handleDataLoaded = async (data: any[], cols: string[]) => {
        setImportedData(data);
        setHeaders(cols);
        setIsValidated(false);

        // Auto-validate upon upload
        await performValidation(data);
    };

    const performValidation = async (data: any[]) => {
        setIsValidating(true);
        try {
            const dataToValidate = {
                asmaY_Id: 231,
                stuStatus: 'Active',
                newlstget1: data.map((item) => ({
                    ...item,
                    asmaY_Id: 231,
                    stuStatus: 'Active',
                })),
            };
            const response = await checkImportValidation(dataToValidate);

            if (response.stuStatus && response.stuStatus !== '') {
                Swal.fire({
                    icon: 'warning',
                    title: 'Validation Failed',
                    text: String(response.stuStatus),
                    confirmButtonColor: '#3085d6',
                });
                setImportedData([]); // Clear data if validation fails as per legacy logic
                setHeaders([]);
            } else {
                setIsValidated(true);
                toast.success('Excel data validated successfully!');
            }
        } catch (error) {
            console.error('Validation error:', error);
            toast.error('Failed to validate excel data');
        } finally {
            setIsValidating(false);
        }
    };

    const handleSave = async () => {
        if (!isValidated) {
            toast.error('Please validate the data first');
            return;
        }

        setIsSaving(true);
        try {
            const dataToSave = {
                asmaY_Id: 231,
                stuStatus: 'Active',
                newlstget1: importedData.map((item) => ({
                    ...item,
                    asmaY_Id: 231,
                    stuStatus: 'Active',
                })),
            };
            const response = await saveImportedData(dataToSave);
            
            // Support legacy responses where success is indicated by 'true' at the start of message or stuStatus
            const responseMessage = String(response.message || response.stuStatus || '');
            const isSuccess = response.success || 
                              response.stuStatus === 'true' || 
                              responseMessage.toLowerCase().startsWith('true');

            if (isSuccess) {
                Swal.fire({
                    icon: 'success',
                    title: 'Import Result',
                    text: responseMessage,
                }).then(() => {
                    window.location.reload();
                });
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Save Failed',
                    text: responseMessage || 'An error occurred while saving the data',
                });
            }
        } catch (error) {
            console.error('Save error:', error);
            toast.error('An error occurred while saving the data');
        } finally {
            setIsSaving(false);
        }
    };

    const handleClear = () => {
        setImportedData([]);
        setHeaders([]);
        setIsValidated(false);
    };

    return (
        <div className='container mx-auto py-8 space-y-8 animate-in fade-in duration-500'>
            {/* Header section with page title */}
            <div className='flex flex-col space-y-2'>
                <h1 className='text-3xl font-extrabold tracking-tight bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent'>
                    Excel Data Import
                </h1>
                <p className='text-muted-foreground'>
                    Upload and manage student data imports effectively from Microsoft Excel files.
                </p>
            </div>

            {/* Import Form Section */}
            <ImportForm onDataLoaded={handleDataLoaded} onClear={handleClear} />

            {/* Preview and Save Section */}
            {importedData.length > 0 && (
                <div className='space-y-6 animate-in slide-in-from-bottom-4 duration-300'>
                    <PreviewTable 
                        data={importedData} 
                        headers={headers} 
                        isLoading={isValidating} 
                    />

                    <div className='flex items-center justify-center gap-4 py-8 bg-muted/20 rounded-xl border border-dashed'>
                        <Button
                            size='lg'
                            onClick={handleSave}
                            disabled={!isValidated || isSaving || isValidating}
                            className='min-w-[150px] shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all duration-300'
                        >
                            {isSaving ? (
                                <Loader2 className='h-5 w-5 animate-spin mr-2' />
                            ) : (
                                <Save className='h-5 w-5 mr-2' />
                            )}
                            {isSaving ? 'Saving...' : 'Save Data'}
                        </Button>
                        <Button
                            variant='outline'
                            size='lg'
                            onClick={handleClear}
                            disabled={isSaving}
                            className='min-w-[150px] hover:bg-destructive/10 hover:text-destructive hover:border-destructive/50 transition-all duration-300'
                        >
                            <X className='h-5 w-5 mr-2' />
                            Cancel
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}
