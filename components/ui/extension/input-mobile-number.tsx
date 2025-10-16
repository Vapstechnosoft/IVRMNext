'use client';

import { FieldError, FieldGroup, Label } from '@/components/ui/extension/field';
import { cn } from '@/lib/utils';
import type * as React from 'react';
import { Input } from 'react-aria-components'; // Or shadcn's Input

interface MobileNumberInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    description?: string;
    required?: boolean;
    optional?: boolean;
    error?: string;
    inputFieldClassName?: string;
    showSpinner?: boolean;
}

function MobileNumberInput({
    label,
    description,
    error,
    className,
    inputFieldClassName,
    required,
    optional,
    showSpinner = true,
    ...props
}: MobileNumberInputProps) {
    return (
        <div className={cn('group flex flex-col gap-1.5', className)}>
            <Label aria-label={label}>
                {label}
                {required && <span className='ml-1 text-red-500'>*</span>}
                {optional && <span className='text-muted-foreground'>(optional)</span>}
            </Label>
            <FieldGroup className={cn('w-full', inputFieldClassName)}>
                <Input
                    type='tel'
                    className='w-fit min-w-0 flex-1 border-transparent bg-background pr-2 outline outline-0 placeholder:text-muted-foreground'
                    pattern='[0-9]*'
                    inputMode='tel'
                    {...props}
                />
            </FieldGroup>
            {description && !error && <span className='text-[0.8rem] text-muted-foreground'>{description}</span>}
            <FieldError>{error}</FieldError>
        </div>
    );
}

export { MobileNumberInput };
export type { MobileNumberInputProps };
