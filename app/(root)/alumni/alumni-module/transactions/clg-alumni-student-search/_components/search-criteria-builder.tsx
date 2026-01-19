'use client';

import { Button } from '@/components/ui/button';
import { InputText } from '@/components/ui/extension/input-text';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { IAlumniSearchCriteriaRow } from '@/types/alumni/clg-alumni-student-search';
import { Filter, Minus, Plus, Search, XCircle } from 'lucide-react';
import { useState } from 'react';

interface SearchCriteriaBuilderProps {
    onSearch: (criteria: IAlumniSearchCriteriaRow[]) => void;
    onClear: () => void;
}

const FIELDS = [
    { value: 'ALCMST_FirstName', name: 'First Name', type: 'text' },
    { value: 'ALCMST_RegistrationNo', name: 'Reg No', type: 'text' },
    { value: 'ALCMST_AdmNo', name: 'Admission No', type: 'text' },
    { value: 'ALCMST_MobileNo', name: 'Mobile No', type: 'text' },
    { value: 'ALCMST_Sex', name: 'Gender', type: 'select', options: ['Male', 'Female', 'Other'] },
    { value: 'ALCMST_Date', name: 'Date', type: 'date' },
    { value: 'ALCMST_emailId', name: 'Email ID', type: 'email' },
    { value: 'ALCMST_FatherName', name: 'Father Name', type: 'text' },
    { value: 'ALCMST_MotherName', name: 'Mother Name', type: 'text' },
    { value: 'StudentName', name: 'Student Name', type: 'text' }
];

const OPERATORS = [
    { value: '=', name: 'Equal to', symbol: '=' },
    { value: '!=', name: 'Not Equal to', symbol: '≠' },
    { value: 'like', name: 'Contains', symbol: '⊃' },
    { value: '>', name: 'Greater than', symbol: '>' },
    { value: '<', name: 'Less than', symbol: '<' },
    { value: '>=', name: 'Greater or equal', symbol: '≥' },
    { value: '<=', name: 'Less or equal', symbol: '≤' }
];

const CONDITIONS = [
    { value: 'AND', name: 'AND', color: 'bg-blue-100 text-blue-700 border-blue-200' },
    { value: 'OR', name: 'OR', color: 'bg-green-100 text-green-700 border-green-200' }
];

export default function SearchCriteriaBuilder({ onSearch, onClear }: SearchCriteriaBuilderProps) {
    const [rows, setRows] = useState<IAlumniSearchCriteriaRow[]>([{ field: '', operator: '', value: '', condition: 'AND' }]);

    const addRow = () => {
        setRows([...rows, { field: '', operator: '', value: '', condition: 'AND' }]);
    };

    const removeRow = (index: number) => {
        if (rows.length > 1) {
            setRows(rows.filter((_, i) => i !== index));
        }
    };

    const updateRow = (index: number, updates: Partial<IAlumniSearchCriteriaRow>) => {
        const newRows = [...rows];
        newRows[index] = { ...newRows[index], ...updates };
        setRows(newRows);
    };

    const handleSearch = () => {
        const validRows = rows.filter((r) => r.field && r.operator && r.value);
        if (validRows.length === 0) {
            toast.warning('Please provide at least one complete search criterion.');
            return;
        }
        onSearch(rows);
    };

    const handleClear = () => {
        setRows([{ field: '', operator: '', value: '', condition: 'AND' }]);
        onClear();
    };

    const getFieldType = (fieldValue: string) => {
        const field = FIELDS.find((f) => f.value === fieldValue);
        return field?.type || 'text';
    };

    const getFieldOptions = (fieldValue: string) => {
        const field = FIELDS.find((f) => f.value === fieldValue);
        return field?.options || [];
    };

    return (
        <div className='space-y-6'>
            <div className='flex items-center justify-between'>
                <div className='flex items-center gap-3'>
                    <div className='rounded-lg bg-primary/10 p-2.5'>
                        <Filter className='h-5 w-5 text-primary' />
                    </div>
                    <div>
                        <h3 className='font-bold text-gray-800'>Search Criteria Builder</h3>
                        <p className='text-muted-foreground text-sm'>Add multiple criteria for precise filtering</p>
                    </div>
                </div>
                <div className='flex items-center gap-2'>
                    <Button
                        variant='outline'
                        size='sm'
                        onClick={addRow}
                        className='gap-2 border-primary/20 text-primary hover:bg-primary/5'>
                        <Plus className='h-4 w-4' /> Add Row
                    </Button>
                </div>
            </div>

            <div className='overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm'>
                <table className='w-full border-collapse'>
                    <thead className='bg-gradient-to-r from-gray-50 to-blue-50'>
                        <tr className='border-b'>
                            <th className='px-4 py-3 text-left font-semibold text-gray-700 text-sm'>#</th>
                            <th className='px-4 py-3 text-left font-semibold text-gray-700 text-sm'>
                                Field <span className='text-red-500'>*</span>
                            </th>
                            <th className='px-4 py-3 text-left font-semibold text-gray-700 text-sm'>
                                Operator <span className='text-red-500'>*</span>
                            </th>
                            <th className='px-4 py-3 text-left font-semibold text-gray-700 text-sm'>
                                Value <span className='text-red-500'>*</span>
                            </th>
                            <th className='px-4 py-3 text-left font-semibold text-gray-700 text-sm'>Condition</th>
                            <th className='w-[120px] px-4 py-3 text-center font-semibold text-gray-700 text-sm'>Actions</th>
                        </tr>
                    </thead>
                    <tbody className='divide-y'>
                        {rows.map((row, index) => (
                            <tr key={index} className='group transition-colors hover:bg-gray-50/50'>
                                <td className='px-4 py-4'>
                                    <div className='flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 font-bold text-primary'>
                                        {index + 1}
                                    </div>
                                </td>
                                <td className='min-w-[180px] px-4 py-4'>
                                    <Select value={row.field} onValueChange={(v) => updateRow(index, { field: v, value: '' })}>
                                        <SelectTrigger className='h-10 border-gray-300 focus:ring-primary/20'>
                                            <SelectValue placeholder='Select field' />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {FIELDS.map((f) => (
                                                <SelectItem key={f.value} value={f.value} className='py-3'>
                                                    <div className='flex items-center gap-2'>
                                                        {/* biome-ignore lint/style/useSelfClosingElements: <explanation> */}
                                                        <div
                                                            className={`h-2 w-2 rounded-full ${getFieldType(f.value) === 'select' ? 'bg-green-500' : 'bg-blue-500'}`}></div>
                                                        {f.name}
                                                    </div>
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </td>
                                <td className='min-w-[150px] px-4 py-4'>
                                    <Select value={row.operator} onValueChange={(v) => updateRow(index, { operator: v })}>
                                        <SelectTrigger className='h-10 border-gray-300 focus:ring-primary/20'>
                                            <SelectValue placeholder='Select operator' />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {OPERATORS.map((o) => (
                                                <SelectItem key={o.value} value={o.value} className='py-3'>
                                                    <div className='flex items-center gap-2'>
                                                        <span className='font-mono text-lg'>{o.symbol}</span>
                                                        <span>{o.name}</span>
                                                    </div>
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </td>
                                <td className='min-w-[200px] px-4 py-4'>
                                    {getFieldType(row.field) === 'select' ? (
                                        <Select value={row.value} onValueChange={(v) => updateRow(index, { value: v })}>
                                            <SelectTrigger className='h-10 border-gray-300 focus:ring-primary/20'>
                                                <SelectValue placeholder='Select value' />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {getFieldOptions(row.field).map((opt) => (
                                                    <SelectItem key={opt} value={opt}>
                                                        {opt}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    ) : getFieldType(row.field) === 'date' ? (
                                        <InputText
                                            type='date'
                                            value={row.value}
                                            onChange={(e) => updateRow(index, { value: e.target.value })}
                                            className='h-10 border-gray-300'
                                        />
                                    ) : getFieldType(row.field) === 'email' ? (
                                        <InputText
                                            type='email'
                                            value={row.value}
                                            onChange={(e) => updateRow(index, { value: e.target.value })}
                                            placeholder='email@example.com'
                                            className='h-10 border-gray-300'
                                        />
                                    ) : (
                                        <InputText
                                            value={row.value}
                                            onChange={(e) => updateRow(index, { value: e.target.value })}
                                            placeholder='Enter value'
                                            className='h-10 border-gray-300'
                                        />
                                    )}
                                </td>
                                <td className='min-w-[100px] px-4 py-4'>
                                    {index < rows.length - 1 && (
                                        <Select value={row.condition} onValueChange={(v) => updateRow(index, { condition: v })}>
                                            <SelectTrigger
                                                className={`h-10 ${CONDITIONS.find((c) => c.value === row.condition)?.color} border font-medium`}>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {CONDITIONS.map((c) => (
                                                    <SelectItem key={c.value} value={c.value} className={c.color}>
                                                        {c.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    )}
                                </td>
                                <td className='px-4 py-4 text-center'>
                                    <div className='flex items-center justify-center gap-2'>
                                        <Button
                                            type='button'
                                            variant='ghost'
                                            size='icon'
                                            className='h-9 w-9 rounded-full transition-all hover:bg-primary/10 hover:text-primary'
                                            onClick={addRow}
                                            title='Add row'>
                                            <Plus className='h-4 w-4' />
                                        </Button>
                                        {rows.length > 1 && (
                                            <Button
                                                type='button'
                                                variant='ghost'
                                                size='icon'
                                                className='h-9 w-9 rounded-full transition-all hover:bg-destructive/10 hover:text-destructive'
                                                onClick={() => removeRow(index)}
                                                title='Remove row'>
                                                <Minus className='h-4 w-4' />
                                            </Button>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className='flex flex-col items-center justify-between gap-4 border-t pt-6 sm:flex-row'>
                <div className='text-muted-foreground text-sm'>
                    <span className='font-medium'>{rows.filter((r) => r.field && r.operator && r.value).length}</span> of {rows.length}{' '}
                    criteria complete
                </div>
                <div className='flex flex-wrap items-center justify-center gap-3'>
                    <Button
                        onClick={handleSearch}
                        className='h-11 min-w-[140px] bg-gradient-to-r from-blue-600 to-purple-600 shadow-lg hover:from-blue-700 hover:to-purple-700'>
                        <Search className='mr-2 h-4 w-4' />
                        Search Database
                    </Button>
                    <Button
                        variant='outline'
                        onClick={handleClear}
                        className='h-11 min-w-[120px] border-gray-300 text-gray-700 hover:bg-gray-100'>
                        <XCircle className='mr-2 h-4 w-4' />
                        Clear All
                    </Button>
                </div>
            </div>
        </div>
    );
}

// Mock toast function for this component
const toast = {
    warning: (msg: string) => alert(msg),
    error: (msg: string) => alert(msg),
    success: (msg: string) => alert(msg),
    info: (msg: string) => alert(msg)
};
