'use client';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/extension/field';
import { HRMSInputText } from '@/app/(root)/hrms/_components/hrms-input-text';
import { Plus, Trash2, Upload } from 'lucide-react';
import { useFieldArray } from 'react-hook-form';
import { StandardTabActions } from './standard-tab-actions';
export function UploadDocumentTab({ control, register, errors, isSubmitting, watch, onClear, currentTab, onPreviousTab }: any) {
    const { fields, append, remove } = useFieldArray({
        control,
        name: 'documentList'
    });
    const addEmptyRow = () => {
        append({} as any);
    };
    // Watch for file changes to display selected file names
    const watchDocuments = watch('documentList');
    return (
        <div className='space-y-4'>
            <div className='rounded-md border'>
                <div className='flex items-center justify-between border-b bg-muted px-4 py-2'>
                    <h3 className='font-semibold text-base text-gray-900 uppercase'>DOCUMENT UPLOAD DETAILS [ONLY JPEG,DOCX,DOC,PDF FILES (0-2MB)]</h3>
                    <Button 
                        type='button' 
                        className='h-7 w-auto rounded-md px-2.5 py-1.5 text-xs bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80'
                        onClick={addEmptyRow}>
                        <Plus className='mr-1 h-3.5 w-3.5' /> Add Document
                    </Button>
                </div>
            </div>
            {fields.length === 0 && (
                <div className='rounded-md border p-6 text-muted-foreground text-sm'>
                    No documents added yet. Click "Add Document" to start.
                </div>
            )}
            <div className='space-y-4'>
                {fields.map((field, index) => {
                    // Get the selected file for this document
                    const selectedFile = watchDocuments?.[index]?.document?.[0];
                    const fileName = selectedFile?.name;
                    // Get the existing document image name from the form data (for edit mode)
                    const existingFileName = watchDocuments?.[index]?.documentImageName;
                    const displayFileName = fileName || existingFileName;
                    return (
                        <div key={field.id} className='rounded-lg border bg-card p-4 shadow-sm'>
                            <div className='mb-3 flex items-center justify-between'>
                                <div className='font-semibold'>Document #{index + 1}</div>
                                <div className='flex gap-2'>
                                    <Badge variant='secondary'>Row {index + 1}</Badge>
                                    <Button 
                                        type='button' 
                                        className='h-7 w-auto rounded-md px-2.5 py-1.5 text-xs hover:bg-accent hover:text-accent-foreground'
                                        onClick={() => remove(index)}>
                                        <Trash2 className='mr-1 h-3.5 w-3.5' /> Remove
                                    </Button>
                                </div>
                            </div>
                            <div className='grid grid-cols-1 gap-3 md:grid-cols-2'>
                                <HRMSInputText
                                    label='Document Name *'
                                    id={`documentList.${index}.documentName`}
                                    maxLength={255}
                                    {...register(`documentList.${index}.documentName`)}
                                    placeholder='Enter document name'
                                    error={errors.documentList?.[index]?.documentName?.message}
                                />
                                <HRMSInputText
                                    label='Description *'
                                    id={`documentList.${index}.documentDescription`}
                                    maxLength={400}
                                    {...register(`documentList.${index}.documentDescription`)}
                                    placeholder='Enter description'
                                    error={errors.documentList?.[index]?.documentDescription?.message}
                                />
                                <div className='space-y-2 md:col-span-2'>
                                    <Label>Upload Document</Label>
                                    <div className='flex items-center gap-2'>
                                        <input
                                            type='file'
                                            id={`documentList.${index}.document`}
                                            accept='.jpeg,.jpg,.docx,.doc,.pdf'
                                            {...register(`documentList.${index}.document`)}
                                            className='hidden'
                                        />
                                        <Button
                                            type='button'
                                            variant='outline'
                                            size='sm'
                                            className='w-fit'
                                            onClick={() => document.getElementById(`documentList.${index}.document`)?.click()}>
                                            <Upload className='mr-1 h-4 w-4' /> Choose File
                                        </Button>
                                        {displayFileName && (
                                            <div className='flex items-center gap-2 rounded-md bg-muted px-3 py-2'>
                                                <span className='text-muted-foreground text-sm'>Selected:</span>
                                                <span className='max-w-xs truncate font-medium text-sm'>{displayFileName}</span>
                                                {selectedFile && (
                                                    <Badge variant='secondary' className='ml-2'>
                                                        {(selectedFile.size / 1024).toFixed(2)} KB
                                                    </Badge>
                                                )}
                                                {existingFileName && !selectedFile && (
                                                    <Badge variant='outline' className='ml-2'>
                                                        Existing File
                                                    </Badge>
                                                )}
                                            </div>
                                        )}
                                        {!displayFileName && <span className='text-muted-foreground text-sm'>No file selected</span>}
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
            <StandardTabActions errors={errors} isSubmitting={isSubmitting} onClear={onClear} currentTab={currentTab} onPreviousTab={onPreviousTab} />
        </div>
    );
}
// Payroll Tab Component - Dynamic with API Integration
// Note: PayrollTabProps interface removed as it's not currently used
