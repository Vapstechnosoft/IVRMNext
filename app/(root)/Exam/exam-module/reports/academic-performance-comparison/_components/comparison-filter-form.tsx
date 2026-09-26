'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/extension/field';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Filter, Printer, RefreshCcw, Search } from 'lucide-react';
import type { IFilterParams } from './types';

interface ComparisonFilterFormProps {
    filterParams: IFilterParams;
    onFilterChange: (newParams: Partial<IFilterParams>) => void;
    onGenerate: () => void;
    onReset: () => void;
    onPrint: () => void;
    isLoading?: boolean;
}

export default function ComparisonFilterForm({
    filterParams,
    onFilterChange,
    onGenerate,
    onReset,
    onPrint,
    isLoading = false
}: ComparisonFilterFormProps) {
    return (
        <Card className='border border-border/60 shadow-md transition-shadow duration-300 hover:shadow-lg'>
            <CardHeader className='border-b bg-muted/40 pt-4 pb-3'>
                <div className='flex flex-wrap items-center justify-between gap-2'>
                    <div className='flex items-center gap-2'>
                        <Filter className='h-5 w-5 text-primary' />
                        <CardTitle className='font-bold text-lg text-primary'>Academic Performance Comparison Filters</CardTitle>
                    </div>
                    <div className='flex items-center gap-2'>
                        <Button type='button' variant='outline' size='sm' onClick={onPrint} className='gap-1.5 shadow-sm hover:bg-muted'>
                            <Printer className='h-4 w-4 text-blue-600' />
                            Print / Export PDF
                        </Button>
                    </div>
                </div>
            </CardHeader>
            <CardContent className='pt-4'>
                <form
                    onSubmit={(e) => {
                        e.preventDefault();
                        onGenerate();
                    }}
                    className='space-y-4'>
                    <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4'>
                        {/* Academic Year */}
                        <div className='space-y-1.5'>
                            <Label className='font-semibold text-foreground/80 text-xs'>
                                Academic Year <span className='text-destructive'>*</span>
                            </Label>
                            <Select value={filterParams.academicYear} onValueChange={(val) => onFilterChange({ academicYear: val })}>
                                <SelectTrigger className='h-9'>
                                    <SelectValue placeholder='Select Academic Year' />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value='2026-27'>2026–2027</SelectItem>
                                    <SelectItem value='2025-26'>2025–2026</SelectItem>
                                    <SelectItem value='2024-25'>2024–2025</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Exam / Examination */}
                        <div className='space-y-1.5'>
                            <Label className='font-semibold text-foreground/80 text-xs'>
                                Exam / Examination <span className='text-destructive'>*</span>
                            </Label>
                            <Select value={filterParams.exam} onValueChange={(val) => onFilterChange({ exam: val })}>
                                <SelectTrigger className='h-9'>
                                    <SelectValue placeholder='Select Exam' />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value='Term 1'>Term 1</SelectItem>
                                    <SelectItem value='Term 2'>Term 2</SelectItem>
                                    <SelectItem value='Mid Term Exam'>Mid Term Exam</SelectItem>
                                    <SelectItem value='Annual Exam'>Annual Exam</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Subject */}
                        <div className='space-y-1.5'>
                            <Label className='font-semibold text-foreground/80 text-xs'>
                                Subject <span className='text-destructive'>*</span>
                            </Label>
                            <Select value={filterParams.subject} onValueChange={(val) => onFilterChange({ subject: val })}>
                                <SelectTrigger className='h-9'>
                                    <SelectValue placeholder='Select Subject' />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value='(All)'>All Subjects</SelectItem>
                                    <SelectItem value='Mathematics'>Mathematics</SelectItem>
                                    <SelectItem value='Science'>Science</SelectItem>
                                    <SelectItem value='Physics'>Physics</SelectItem>
                                    <SelectItem value='Chemistry'>Chemistry</SelectItem>
                                    <SelectItem value='Computer Science'>Computer Science</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Comparison Type */}
                        <div className='space-y-1.5'>
                            <Label className='font-semibold text-foreground/80 text-xs'>
                                Comparison Type <span className='text-destructive'>*</span>
                            </Label>
                            <Select
                                value={filterParams.comparisonType}
                                onValueChange={(val: any) => onFilterChange({ comparisonType: val })}>
                                <SelectTrigger className='h-9'>
                                    <SelectValue placeholder='Select Type' />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value='section_vs_section'>Section vs Section</SelectItem>
                                    <SelectItem value='teacher_vs_teacher'>Teacher vs Teacher</SelectItem>
                                    <SelectItem value='class_vs_class'>Class vs Class</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Class */}
                        <div className='space-y-1.5'>
                            <Label className='font-semibold text-foreground/80 text-xs'>
                                Class <span className='text-destructive'>*</span>
                            </Label>
                            <Select value={filterParams.selectedClass} onValueChange={(val) => onFilterChange({ selectedClass: val })}>
                                <SelectTrigger className='h-9'>
                                    <SelectValue placeholder='Select Class' />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value='(All)'>All Classes</SelectItem>
                                    <SelectItem value='VIII'>Class VIII</SelectItem>
                                    <SelectItem value='IX'>Class IX</SelectItem>
                                    <SelectItem value='X'>Class X</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Section / Teacher Group A */}
                        <div className='space-y-1.5'>
                            <Label className='font-semibold text-foreground/80 text-xs'>Comparison Group A</Label>
                            <Select value={filterParams.sectionA} onValueChange={(val) => onFilterChange({ sectionA: val })}>
                                <SelectTrigger className='h-9'>
                                    <SelectValue placeholder='Group A' />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value='VIII-A (Teacher A)'>VIII-A (Teacher A: Ms. Ramesh)</SelectItem>
                                    <SelectItem value='IX-A (Teacher C)'>IX-A (Teacher C: Mr. Sharma)</SelectItem>
                                    <SelectItem value='Class VIII Overall'>Class VIII Overall</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Section / Teacher Group B */}
                        <div className='space-y-1.5'>
                            <Label className='font-semibold text-foreground/80 text-xs'>Comparison Group B</Label>
                            <Select value={filterParams.sectionB} onValueChange={(val) => onFilterChange({ sectionB: val })}>
                                <SelectTrigger className='h-9'>
                                    <SelectValue placeholder='Group B' />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value='VIII-B (Teacher B)'>VIII-B (Teacher B: Mrs. Anitha)</SelectItem>
                                    <SelectItem value='IX-B (Teacher D)'>IX-B (Teacher D: Mrs. Priya)</SelectItem>
                                    <SelectItem value='Class IX Overall'>Class IX Overall</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Action Buttons */}
                        <div className='flex items-end gap-2 sm:col-span-2 lg:col-span-1'>
                            <Button
                                type='submit'
                                className='h-9 flex-1 gap-1.5 font-medium shadow-md transition-transform hover:scale-[1.02]'
                                disabled={isLoading}>
                                <Search className='h-4 w-4' />
                                Generate
                            </Button>
                            <Button
                                type='button'
                                variant='outline'
                                className='h-9 gap-1.5 shadow-sm hover:bg-destructive/10 hover:text-destructive'
                                onClick={onReset}>
                                <RefreshCcw className='h-3.5 w-3.5' />
                                Reset
                            </Button>
                        </div>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
}
