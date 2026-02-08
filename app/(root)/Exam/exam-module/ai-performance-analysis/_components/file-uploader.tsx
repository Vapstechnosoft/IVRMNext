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
        <Card className="border-dashed border-2">
            <CardContent className="flex flex-col items-center justify-center py-10 space-y-4">
                <div className="p-4 bg-primary/10 rounded-full">
                    <Upload className="w-8 h-8 text-primary" />
                </div>
                <div className="text-center space-y-2">
                    <h3 className="font-semibold text-lg">Upload Class Cumulative Report</h3>
                    <p className="text-sm text-muted-foreground">
                        Supported formats: CSV, Excel (.xlsx, .xls)
                    </p>
                </div>
                <div className="flex flex-col items-center gap-2">
                    <input
                        type="file"
                        className="hidden"
                        accept=".csv, .xlsx, .xls"
                        onChange={handleFileChange}
                        disabled={isLoading}
                        id="file-upload"
                    />
                    <Button
                        disabled={isLoading}
                        onClick={() => document.getElementById('file-upload')?.click()}
                    >
                        Select File
                    </Button>
                    {isLoading && <p className="text-xs text-muted-foreground animate-pulse">Processing file...</p>}
                </div>
            </CardContent>
        </Card>
    );
}
