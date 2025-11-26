'use client';

import { Button } from '@/components/ui/button';
import type { DataTableRef } from '@/components/ui/data-table/data-table';
import { GenericDataTable, useDataTableProps } from '@/components/ui/data-table/generic-data-table';
import { Label } from '@/components/ui/extension/field';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAcademicYearDropdown } from '@/hooks/admission/preadmission/useMasters';
import {
    useActivePreadmissionDetails,
    usePreadmissionAdmissionStatusDropdown,
    usePreadmissionClassDropdown,
    usePreadmissionStudentList
} from '@/hooks/admission/preadmission/useTransactions';
import { cn } from '@/lib/utils';
import { CheckSquare, ChevronDown, RotateCcw, Search, Square } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import { use, useRef, useState } from 'react';
import { toast } from 'sonner';
import { ClasswiseStudentDetailsColumns } from './_components/columns';

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

/* -------------------------------------------------------------
   Checkbox Multi-select Component
------------------------------------------------------------- */

const CheckboxMultiSelect = ({
    label,
    options,
    selected,
    onChange
}: {
    label: string;
    options: { id: number; name: string }[];
    selected: number[];
    onChange: (selected: number[]) => void;
}) => {
    const [search, setSearch] = useState('');
    const filtered = options.filter((o) => o.name.toLowerCase().includes(search.toLowerCase()));
    const allSelected = options.length > 0 && selected.length === options.length;

    return (
        <div className='flex flex-col gap-2'>
            <Label className='font-semibold'>{label}</Label>

            <Popover>
                <PopoverTrigger asChild>
                    <Button variant='outline' className='h-10 w-full justify-between'>
                        <span className='truncate text-sm'>
                            {selected.length === 0 ? `All ${label}` : allSelected ? 'All Selected' : `${selected.length} selected`}
                        </span>
                        <ChevronDown className='h-4 w-4 opacity-50' />
                    </Button>
                </PopoverTrigger>

                {/* FIXED WIDTH */}
                <PopoverContent align='start' className='w-[var(--radix-popover-trigger-width)] p-3'>
                    <div className='relative mb-3'>
                        <Search className='absolute top-2.5 left-3 h-4 w-4 text-muted-foreground' />
                        <Input
                            placeholder={`Search ${label.toLowerCase()}...`}
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className='h-9 pl-10 text-sm'
                        />
                    </div>

                    <div className='max-h-64 space-y-1.5 overflow-y-auto'>
                        <div
                            onClick={() => onChange(allSelected ? [] : options.map((o) => o.id))}
                            className={cn(
                                'flex cursor-pointer items-center gap-3 rounded-md border px-3 py-2 font-medium text-sm transition-all',
                                allSelected ? 'border-primary bg-primary/5 text-primary' : 'border-gray-200 hover:border-primary/40'
                            )}>
                            {allSelected ? <CheckSquare className='h-5 w-5 text-primary' /> : <Square className='h-5 w-5 text-gray-400' />}
                            <span>Select All</span>
                        </div>

                        {filtered.map((item) => {
                            const isSelected = selected.includes(item.id);
                            return (
                                <div
                                    key={item.id}
                                    onClick={() => onChange(isSelected ? selected.filter((x) => x !== item.id) : [...selected, item.id])}
                                    className={cn(
                                        'flex cursor-pointer items-center gap-3 rounded-md border px-3 py-2 text-sm transition-all',
                                        isSelected ? 'border-primary bg-primary/5' : 'border-gray-200 hover:border-primary/40'
                                    )}>
                                    {isSelected ? (
                                        <CheckSquare className='h-5 w-5 text-primary' />
                                    ) : (
                                        <Square className='h-5 w-5 text-gray-400' />
                                    )}
                                    <span>{item.name}</span>
                                </div>
                            );
                        })}
                    </div>
                </PopoverContent>
            </Popover>
        </div>
    );
};

/* -------------------------------------------------------------
   Main Component
------------------------------------------------------------- */

export default function ClassWiseStudentDetails(props: { searchParams: SearchParams }) {
    const searchParams = use(props.searchParams);
    const router = useRouter();
    const pathname = usePathname();
    const tableRef = useRef<DataTableRef>(null);

    // States
    const [academicYearId, setAcademicYearId] = useState<number>(0);
    const [selectedClasses, setSelectedClasses] = useState<number[]>([]);
    const [selectedSections, setSelectedSections] = useState<number[]>([]);
    const [categoryId, setCategoryId] = useState<number>(0);
    const [selectedColumns, setSelectedColumns] = useState<string[]>([]);

    const [admissionType, setAdmissionType] = useState<'new' | 'total' | 'promoted'>('total');
    const [studentStatus, setStudentStatus] = useState<'yearloss' | 'deactivated' | null>(null);
    const [reportFormat, setReportFormat] = useState<'table' | 'kendo'>('table');

    // ⚠️ Keep state, do NOT render in UI (as requested)
    const [tcType, setTcType] = useState<'temporary' | 'permanent'>('temporary');

    // API
    const { data: activePreadmission } = useActivePreadmissionDetails();
    const { data: academicYearOptions } = useAcademicYearDropdown();
    const { data: classOptions } = usePreadmissionClassDropdown();
    const { data: sectionOptions } = usePreadmissionAdmissionStatusDropdown();
    const { data: categoryOptions } = usePreadmissionAdmissionStatusDropdown();

    const effectiveYear = academicYearId || activePreadmission?.data?.asmaY_Id || 0;

    const { data: response, isLoading } = usePreadmissionStudentList(
        effectiveYear,
        (selectedClasses.length > 0 ? selectedClasses : undefined) as any,
        (selectedSections.length > 0 ? selectedSections : undefined) as any,
        searchParams
    );

    const tableProps = useDataTableProps(response);

    const handleReset = () => {
        setAcademicYearId(0);
        setSelectedClasses([]);
        setSelectedSections([]);
        setCategoryId(0);
        setSelectedColumns([]);
        setAdmissionType('total');
        setStudentStatus(null);
        setReportFormat('table');
        setTcType('temporary');
        tableRef.current?.resetSelection();
        router.replace(pathname);
        toast.success('All filters reset');
    };

    return (
        <div className='min-h-screen space-y-6 p-4'>
            <div className='rounded-xl border bg-card p-6 shadow-xl'>
                <div className='space-y-6'>
                    {/* Academic Year | Class | Section */}
                    <div className='grid grid-cols-1 gap-6 md:grid-cols-3'>
                        {/* Academic Year */}
                        <div className='flex flex-col gap-2'>
                            <Label className='font-semibold'>Academic Year</Label>
                            <Select
                                onValueChange={(v) => setAcademicYearId(Number(v))}
                                value={academicYearId ? academicYearId.toString() : undefined}>
                                <SelectTrigger className='h-10'>
                                    <SelectValue placeholder='Select Academic Year' />
                                </SelectTrigger>
                                <SelectContent>
                                    {academicYearOptions?.data?.map((y) => (
                                        <SelectItem key={y.asmaY_Id} value={y.asmaY_Id.toString()}>
                                            {y.asmaY_Year}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Class Multi Select */}
                        <CheckboxMultiSelect
                            label='Class'
                            options={classOptions?.data?.map((c) => ({ id: c.asmcL_Id, name: c.asmcL_ClassName })) || []}
                            selected={selectedClasses}
                            onChange={setSelectedClasses}
                        />

                        {/* Section Multi Select */}
                        <CheckboxMultiSelect
                            label='Section'
                            options={sectionOptions?.data?.map((s) => ({ id: s.pamsT_Id, name: s.pamsT_Status })) || []}
                            selected={selectedSections}
                            onChange={setSelectedSections}
                        />
                    </div>

                    {/* Columns */}
                    <div className='flex max-w-md flex-col gap-2'>
                        <Label className='font-semibold'>Columns</Label>

                        <Popover>
                            <PopoverTrigger asChild>
                                <Button variant='outline' className='h-10 w-full justify-between'>
                                    <span className='truncate text-sm'>
                                        {selectedColumns.length === 0 ? 'Select Columns' : `${selectedColumns.length} selected`}
                                    </span>
                                    <ChevronDown className='h-4 w-4 opacity-50' />
                                </Button>
                            </PopoverTrigger>

                            <PopoverContent align='start' className='w-[var(--radix-popover-trigger-width)] p-3'>
                                <div className='relative mb-3'>
                                    <Search className='absolute top-2.5 left-3 h-4 w-4 text-muted-foreground' />
                                    <Input placeholder='Search columns...' className='h-9 pl-10 text-sm' />
                                </div>

                                <div className='max-h-64 space-y-1.5 overflow-y-auto'>
                                    {['Student Name', 'Registration No.', 'TC No.', 'Leaving Class', 'Admission Class Name'].map((col) => {
                                        const isSelected = selectedColumns.includes(col);
                                        return (
                                            <div
                                                key={col}
                                                onClick={() =>
                                                    setSelectedColumns((prev) =>
                                                        isSelected ? prev.filter((c) => c !== col) : [...prev, col]
                                                    )
                                                }
                                                className={cn(
                                                    'flex cursor-pointer items-center gap-3 rounded-md border px-3 py-2 text-sm transition-all',
                                                    isSelected ? 'border-primary bg-primary/5' : 'border-gray-200 hover:border-primary/40'
                                                )}>
                                                {isSelected ? (
                                                    <CheckSquare className='h-5 w-5 text-primary' />
                                                ) : (
                                                    <Square className='h-5 w-5 text-gray-400' />
                                                )}
                                                <span>{col}</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </PopoverContent>
                        </Popover>
                    </div>

                    {/* Category */}
                    <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
                        <div className='flex max-w-md flex-col gap-2'>
                            <Label className='font-semibold'>Student Category</Label>
                            <Select onValueChange={(v) => setCategoryId(Number(v))} value={categoryId ? categoryId.toString() : undefined}>
                                <SelectTrigger className='h-10'>
                                    <SelectValue placeholder='All Categories' />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value='0'>All Categories</SelectItem>
                                    {categoryOptions?.data?.map((cat) => (
                                        <SelectItem key={cat.pamsT_Id} value={String(cat.pamsT_Id)}>
                                            {cat.pamsT_Status}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* -------------------------------------------------------------
                        RADIO BUTTON GROUPS (RESTORED EXACTLY AS ORIGINAL ORDER)
                    ------------------------------------------------------------- */}

                    <div className='space-y-5 border-t pt-6'>
                        {/* Admission Type */}
                        <div className='flex flex-wrap items-center gap-8'>
                            <Label className='w-48 font-semibold'>Admission Type:</Label>

                            <label className='flex items-center gap-2'>
                                <input
                                    type='radio'
                                    name='admission'
                                    checked={admissionType === 'new'}
                                    onChange={() => setAdmissionType('new')}
                                    className='h-4 w-4'
                                />
                                New Admission
                            </label>

                            <label className='flex items-center gap-2'>
                                <input
                                    type='radio'
                                    name='admission'
                                    checked={admissionType === 'total'}
                                    onChange={() => setAdmissionType('total')}
                                    className='h-4 w-4'
                                />
                                Total Students
                            </label>

                            <label className='flex items-center gap-2'>
                                <input
                                    type='radio'
                                    name='admission'
                                    checked={admissionType === 'promoted'}
                                    onChange={() => setAdmissionType('promoted')}
                                    className='h-4 w-4'
                                />
                                Promoted
                            </label>
                        </div>

                        {/* Student Status */}
                        <div className='flex flex-wrap items-center gap-8'>
                            <Label className='w-48 font-semibold'>Student Status:</Label>

                            <label className='flex items-center gap-2'>
                                <input
                                    type='radio'
                                    name='studentStatus'
                                    checked={studentStatus === 'yearloss'}
                                    onChange={() => setStudentStatus(studentStatus === 'yearloss' ? null : 'yearloss')}
                                    className='h-4 w-4'
                                />
                                Year Loss
                            </label>

                            <label className='flex items-center gap-2'>
                                <input
                                    type='radio'
                                    name='studentStatus'
                                    checked={studentStatus === 'deactivated'}
                                    onChange={() => setStudentStatus(studentStatus === 'deactivated' ? null : 'deactivated')}
                                    className='h-4 w-4'
                                />
                                Deactivated
                            </label>
                        </div>

                        {/* Report Format */}
                        <div className='flex flex-wrap items-center gap-8'>
                            <Label className='w-48 font-semibold'>Report Format:</Label>

                            <label className='flex items-center gap-2'>
                                <input
                                    type='radio'
                                    name='reportFormat'
                                    checked={reportFormat === 'table'}
                                    onChange={() => setReportFormat('table')}
                                    className='h-4 w-4'
                                />
                                Table Format
                            </label>

                            <label className='flex items-center gap-2'>
                                <input
                                    type='radio'
                                    name='reportFormat'
                                    checked={reportFormat === 'kendo'}
                                    onChange={() => setReportFormat('kendo')}
                                    className='h-4 w-4'
                                />
                                Kendo Format
                            </label>
                        </div>
                    </div>

                    {/* Buttons */}
                    <div className='mt-6 flex gap-4'>
                        <Button size='lg'>Generate Report</Button>

                        <Button variant='outline' size='lg' onClick={handleReset}>
                            <RotateCcw className='mr-2 h-4 w-4' />
                            Reset All
                        </Button>
                    </div>
                </div>
            </div>

            {/* Data Table */}
            <CollapsibleSection defaultOpen={true} className='shadow-lg' variant='default' size='lg'>
                <GenericDataTable
                    {...tableProps}
                    ref={tableRef}
                    columns={ClasswiseStudentDetailsColumns}
                    isLoading={isLoading}
                    loadingMessage='Loading students...'
                    noDataTitle='No Data Found'
                    noDataDescription='No preadmission students found'
                />
            </CollapsibleSection>
        </div>
    );
}
