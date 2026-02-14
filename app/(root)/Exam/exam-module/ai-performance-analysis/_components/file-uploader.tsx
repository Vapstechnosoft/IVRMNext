'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Upload } from 'lucide-react';
import type { ChangeEvent } from 'react';

interface FileUploaderProps {
    onFileSelect: (file: File) => void;
    isLoading?: boolean;
}

export function FileUploader({ onFileSelect, isLoading }: FileUploaderProps) {
    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.files?.[0]) {
            onFileSelect(e.target.files[0]);
        }
    };

    return (
        <Card className='border-2 border-dashed'>
            <CardContent className='flex flex-col items-center justify-center space-y-4 py-10'>
                <div className='rounded-full bg-primary/10 p-4'>
                    <Upload className='h-8 w-8 text-primary' />
                </div>
                <div className='space-y-2 text-center'>
                    <h3 className='font-semibold text-lg'>Upload Class Cumulative Report</h3>
                    <p className='text-muted-foreground text-sm'>Supported formats: CSV, Excel (.xlsx, .xls)</p>
                </div>
                <div className='flex flex-col items-center gap-2'>
                    <input
                        type='file'
                        className='hidden'
                        accept='.csv, .xlsx, .xls'
                        onChange={handleFileChange}
                        disabled={isLoading}
                        id='file-upload'
                    />
                    <Button disabled={isLoading} onClick={() => document.getElementById('file-upload')?.click()}>
                        Select File
                    </Button>
                    {isLoading && <p className='animate-pulse text-muted-foreground text-xs'>Processing file...</p>}
                </div>
            </CardContent>
        </Card>
    );
}
