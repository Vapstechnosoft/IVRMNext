'use client';

import { Checkbox } from '@/components/ui/checkbox';
import { FormError, Label } from '@/components/ui/extension/field';
import type React from 'react';
import { useState } from 'react';

interface Option {
    label: string;
    value: string;
}

interface CustomMultiSelectBoxProps {
    options: Option[];
    value: string[];
    onChange: (vals: string[]) => void;
    label?: string;
    height?: string;
    isSearchRequired?: boolean;
    error?: string;
    placeholder?: string;
}

export const CustomMultiSelectBox: React.FC<CustomMultiSelectBoxProps> = ({
    options,
    value,
    onChange,
    label,
    height = '200px',
    isSearchRequired = false,
    error
}) => {
    const [search, setSearch] = useState('');

    const filteredOptions = options.filter((opt) => opt.label.toLowerCase().includes(search.toLowerCase()));

    const allSelected = filteredOptions.every((opt) => value.includes(opt.value)) && filteredOptions.length > 0;

    const toggleSelect = (option: Option) => {
        if (value.includes(option.value)) {
            onChange(value.filter((v) => v !== option.value));
        } else {
            onChange([...value, option.value]);
        }
    };

    const toggleSelectAll = () => {
        if (allSelected) {
            const newValues = value.filter((v) => !filteredOptions.some((opt) => opt.value === v));
            if (newValues.length !== value.length) onChange(newValues);
        } else {
            const newValues = [...value, ...filteredOptions.filter((opt) => !value.includes(opt.value)).map((opt) => opt.value)];
            if (newValues.length !== value.length) onChange(newValues);
        }
    };

    return (
        <div className='flex flex-col gap-1'>
            {label && <Label>{label}</Label>}

            <div className='relative overflow-hidden rounded-md border' style={{ height }}>
                {isSearchRequired && (
                    <div className='sticky top-0 z-10 border-b bg-white p-2'>
                        <input
                            type='text'
                            placeholder='Search...'
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className='w-full rounded-md border px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-400'
                        />
                    </div>
                )}

                <div className='overflow-y-auto p-2 text-sm' style={{ height: `calc(${height} - ${isSearchRequired ? '48px' : '0px'})` }}>
                    {/* Select All */}
                    {filteredOptions.length > 0 && (
                        <div className='mb-2 flex items-center gap-2 rounded-md p-1 font-medium text-sm hover:bg-accent'>
                            <Checkbox checked={allSelected} onCheckedChange={toggleSelectAll} />
                            <span>Select All</span>
                        </div>
                    )}

                    {filteredOptions.map((opt) => (
                        <div key={opt.value} className='mb-1 flex cursor-pointer items-center gap-2 rounded-md p-1 text-sm hover:bg-accent'>
                            <Checkbox checked={value.includes(opt.value)} onCheckedChange={() => toggleSelect(opt)} />
                            <span onClick={() => toggleSelect(opt)}>{opt.label}</span>
                        </div>
                    ))}

                    {filteredOptions.length === 0 && <div className='text-muted-foreground text-sm'>No options found</div>}
                </div>
            </div>

            {error && <FormError>{error}</FormError>}
        </div>
    );
};
