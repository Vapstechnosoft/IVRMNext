'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { FileUp, Info, X } from 'lucide-react';
import { useState } from 'react';
import * as XLSX from 'xlsx';

interface ImportFormProps {
    onDataLoaded: (data: any[], columns: string[]) => void;
    onClear: () => void;
}

export default function ImportForm({ onDataLoaded, onClear }: ImportFormProps) {
    const [importType, setImportType] = useState<'all' | 'individual'>('all');
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.name.endsWith('.xlsx')) {
                setSelectedFile(file);
                parseExcel(file);
            } else {
                alert('Please upload a .xlsx file');
            }
        }
    };

    const parseExcel = (file: File) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const data = e.target?.result;
            const workbook = XLSX.read(data, { type: 'binary' });
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            
            const jsonData = XLSX.utils.sheet_to_json(worksheet);
            const headers = XLSX.utils.sheet_to_json(worksheet, { header: 1 })[0] as string[];

            if (jsonData.length === 0) {
                alert('Excel Sheet is Empty');
                return;
            }

            onDataLoaded(jsonData, headers);
        };
        reader.readAsBinaryString(file);
    };

    const handleClear = () => {
        setSelectedFile(null);
        setImportType('all');
        onClear();
    };

    return (
        <Card className='shadow-lg hover:shadow-xl transition-shadow duration-300'>
            <CardHeader className='border-b bg-muted/50'>
                <CardTitle className='text-xl font-bold flex items-center gap-2'>
                    <FileUp className='h-5 w-5 text-primary' />
                    Student Data Import
                </CardTitle>
            </CardHeader>
            <CardContent className='space-y-6 pt-6'>
                <div className='flex flex-col items-center justify-center space-y-4'>
                    <div className='flex items-center gap-8 p-4 bg-muted/30 rounded-lg border'>
                        <RadioGroup
                            value={importType}
                            onValueChange={(v) => setImportType(v as 'all' | 'individual')}
                            className='flex items-center gap-6'
                        >
                            <div className='flex items-center space-x-2'>
                                <RadioGroupItem value='all' id='all' />
                                <Label htmlFor='all' className='cursor-pointer text-base'>All</Label>
                            </div>
                            <div className='flex items-center space-x-2'>
                                <RadioGroupItem value='individual' id='individual' />
                                <Label htmlFor='individual' className='cursor-pointer text-base'>Individual</Label>
                            </div>
                        </RadioGroup>
                    </div>

                    <div className='flex items-center gap-2 text-green-600 bg-green-50 p-2 px-4 rounded-full border border-green-100'>
                        <Info className='h-4 w-4 font-bold' />
                        <span className='text-sm font-semibold'>Kindly Select Only One Excel Sheet To Import</span>
                    </div>

                    <div className='w-full max-w-md'>
                        {!selectedFile ? (
                            <div className='relative group'>
                                <Input
                                    type='file'
                                    accept='.xlsx'
                                    onChange={handleFileChange}
                                    className='hidden'
                                    id='file-upload'
                                />
                                <Label
                                    htmlFor='file-upload'
                                    className='flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-xl cursor-pointer bg-muted/20 group-hover:bg-muted/40 group-hover:border-primary/50 transition-all duration-300'
                                >
                                    <FileUp className='h-8 w-8 text-muted-foreground group-hover:text-primary mb-2' />
                                    <span className='text-sm font-medium text-muted-foreground group-hover:text-primary'>
                                        Click to upload or drag and drop
                                    </span>
                                    <span className='text-xs text-muted-foreground mt-1'>
                                        (Only .xlsx files are supported)
                                    </span>
                                </Label>
                            </div>
                        ) : (
                            <div className='flex items-center justify-between p-3 bg-secondary/20 rounded-lg border border-secondary/30'>
                                <div className='flex items-center gap-3'>
                                    <div className='p-2 bg-green-100 rounded'>
                                        <FileUp className='h-5 w-5 text-green-600' />
                                    </div>
                                    <div className='flex flex-col'>
                                        <span className='text-sm font-medium truncate max-w-[200px]'>{selectedFile.name}</span>
                                        <span className='text-xs text-muted-foreground'>{(selectedFile.size / 1024).toFixed(2)} KB</span>
                                    </div>
                                </div>
                                <Button 
                                    variant='ghost' 
                                    size='sm' 
                                    onClick={handleClear}
                                    className='hover:bg-destructive/10 text-destructive'
                                >
                                    <X className='h-4 w-4' />
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
