'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart3, GraduationCap } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import ComparisonFilterForm from './_components/comparison-filter-form';
import { defaultFilterParams } from './_components/mockData';
import SectionComparisonReport from './_components/section-comparison-report';
import TeacherPerformanceReport from './_components/teacher-performance-report';
import type { IFilterParams } from './_components/types';

export default function AcademicPerformanceComparisonPage() {
    const [filterParams, setFilterParams] = useState<IFilterParams>(defaultFilterParams);
    const [activeTab, setActiveTab] = useState<string>('comparison');
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const handleFilterChange = (newParams: Partial<IFilterParams>) => {
        setFilterParams((prev) => ({ ...prev, ...newParams }));
    };

    const handleGenerate = () => {
        setIsLoading(true);
        setTimeout(() => {
            setIsLoading(false);
            toast.success('Performance comparison report generated successfully!');
        }, 300);
    };

    const handleReset = () => {
        setFilterParams(defaultFilterParams);
        toast.info('Filters reset to default values.');
    };

    const handlePrint = () => {
        window.print();
    };

    return (
        <div className='min-h-screen space-y-6 p-3 sm:p-6'>
            {/* Header Title Banner */}
            <div className='flex flex-col justify-between gap-4 sm:flex-row sm:items-center'>
                <div>
                    <div className='flex items-center gap-2 text-muted-foreground text-xs'>
                        <span>Exam Module</span>
                        <span>/</span>
                        <span>Reports</span>
                        <span>/</span>
                        <span className='font-semibold text-primary'>Academic Performance Comparison</span>
                    </div>
                    <h1 className='mt-1 font-black text-2xl text-foreground tracking-tight sm:text-3xl'>
                        Teacher & Section-Wise Academic Performance Comparison
                    </h1>
                    <p className='text-muted-foreground text-xs'>
                        TASK/19859/2026-2027 • Comprehensive comparison analysis across sections, classes, subjects & teachers.
                    </p>
                </div>
            </div>

            {/* Filter Section Form */}
            <ComparisonFilterForm
                filterParams={filterParams}
                onFilterChange={handleFilterChange}
                onGenerate={handleGenerate}
                onReset={handleReset}
                onPrint={handlePrint}
                isLoading={isLoading}
            />

            {/* Navigation Tabs for Switching Between Comparison and Teacher-Wise Views */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className='w-full space-y-6'>
                <TabsList className='grid w-full max-w-xl grid-cols-2 border border-border shadow-sm'>
                    <TabsTrigger value='comparison' className='gap-2 font-bold text-xs sm:text-sm'>
                        <BarChart3 className='h-4 w-4 text-blue-600' />
                        Section / Class Comparison
                    </TabsTrigger>
                    <TabsTrigger value='teacher' className='gap-2 font-bold text-xs sm:text-sm'>
                        <GraduationCap className='h-4 w-4 text-indigo-600' />
                        Teacher-Wise Performance Report
                    </TabsTrigger>
                </TabsList>

                {/* Tab 1: Section / Class / Teacher Side-by-Side Comparison */}
                <TabsContent value='comparison' className='mt-0 space-y-6 focus-visible:outline-none'>
                    <SectionComparisonReport filterParams={filterParams} />
                </TabsContent>

                {/* Tab 2: Teacher-Wise Performance Breakdown */}
                <TabsContent value='teacher' className='mt-0 space-y-6 focus-visible:outline-none'>
                    <TeacherPerformanceReport filterParams={filterParams} />
                </TabsContent>
            </Tabs>
        </div>
    );
}
