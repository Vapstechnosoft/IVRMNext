'use client';

import { Button } from '@/components/ui/button';

interface StandardTabActionsProps {
    errors: any;
    isSubmitting: boolean;
}

export function StandardTabActions({ isSubmitting }: StandardTabActionsProps) {
    return (
        <div className='flex flex-col gap-3 pt-4 sm:flex-row sm:justify-center'>
            <Button type='submit' className='bg-primary px-8 text-primary-foreground hover:opacity-90' disabled={isSubmitting}>
                {isSubmitting ? 'Saving...' : 'Save & Proceed'}
            </Button>
            <Button type='button' className='bg-secondary px-8 text-secondary-foreground hover:opacity-90'>
                Clear
            </Button>
            <Button type='button' className='bg-accent px-8 text-accent-foreground hover:opacity-90'>
                Set Employee Order
            </Button>
            <Button type='button' className='bg-muted px-8 text-foreground hover:opacity-90'>
                Import Employee Details
            </Button>
        </div>
    );
}
