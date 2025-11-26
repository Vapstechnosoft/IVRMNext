'use client';

import { Button } from '@/components/ui/button';
import { useRef } from 'react';
import { ChevronLeft } from 'lucide-react';

interface StandardTabActionsProps {
    errors: any;
    isSubmitting: boolean;
    onClear?: () => void;
    currentTab?: string;
    onPreviousTab?: () => void;
}

export function StandardTabActions({ isSubmitting, onClear, currentTab, onPreviousTab }: StandardTabActionsProps) {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const isFirstTab = currentTab === 'employee';

    const handleImportClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            // Handle the file import here
            console.log('Selected file:', file.name);
            // TODO: Add file import logic here
        }
        // Reset the input so the same file can be selected again
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    return (
        <div className='flex flex-col gap-3 pt-4 sm:flex-row sm:justify-center'>
            {!isFirstTab && onPreviousTab && (
                <Button 
                    type='button' 
                    className='bg-muted px-8 text-foreground hover:opacity-90' 
                    onClick={onPreviousTab}>
                    <ChevronLeft className='mr-2 h-4 w-4' />
                    Previous
                </Button>
            )}
            <Button type='submit' className='bg-primary px-8 text-primary-foreground hover:opacity-90' disabled={isSubmitting}>
                {isSubmitting ? 'Saving...' : 'Save & Proceed'}
            </Button>
            <Button type='button' className='bg-secondary px-8 text-secondary-foreground hover:opacity-90' onClick={onClear}>
                Clear
            </Button>
            {isFirstTab && (
                <>
                    <Button type='button' className='bg-accent px-8 text-accent-foreground hover:opacity-90'>
                        Download Template
                    </Button>
                    <Button type='button' className='bg-muted px-8 text-foreground hover:opacity-90' onClick={handleImportClick}>
                        Import Employee Details
                    </Button>
                    <input
                        ref={fileInputRef}
                        type='file'
                        accept='.xlsx'
                        onChange={handleFileChange}
                        className='hidden'
                    />
                </>
            )}
        </div>
    );
}
