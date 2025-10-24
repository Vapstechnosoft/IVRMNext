'use client';

import { Checkbox } from '@/components/ui/checkbox'; // your Radix Checkbox
import { FormError, Label } from '@/components/ui/extension/field';
import type React from 'react';
import { useState } from 'react';

interface Option {
    label: string;
    value: string; // always string
}

interface CustomMultiSelectBoxProps {
    options: Option[];
    value: string[]; // selected values as strings
    onChange: (vals: string[]) => void; // returns string[]
    label?: string;
    height?: string; // e.g. "200px"
    isSearchRequired?: boolean;
    error?: string;
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

    const toggleSelect = (option: Option) => {
        if (value.includes(option.value)) {
            onChange(value.filter((v) => v !== option.value));
        } else {
            onChange([...value, option.value]);
        }
    };

    return (
        <div className='flex flex-col gap-1'>
            {label && <Label>{label}</Label>}

            {isSearchRequired && (
                <input
                    type='text'
                    placeholder='Search...'
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className='rounded-md border px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-400'
                />
            )}

            <div className='overflow-y-auto rounded-md border p-2' style={{ height }}>
                {filteredOptions.map((opt) => (
                    <div key={opt.value} className={`mb-1 flex cursor-pointer items-center gap-2 rounded-md p-1 ${'hover:bg-accent'}`}>
                        <Checkbox checked={value.includes(opt.value)} onCheckedChange={() => toggleSelect(opt)} />
                        <span onClick={() => toggleSelect(opt)}>{opt.label}</span>
                    </div>
                ))}
            </div>

            {error && <FormError>{error}</FormError>}
        </div>
    );
};
