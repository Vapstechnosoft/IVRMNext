'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { GenericDataTable } from '@/components/ui/data-table/generic-data-table';
import { tableSearchVariables } from '@/lib/data-table.config';
import { createUsername, getInitialData } from '@/server/alumni/user-password-creation';
import type { IClass, ISection, IStudent, IYear } from '@/types/alumni/user-password-creation';
import { KeyRound, Loader2, RefreshCcw } from 'lucide-react';
import { parseAsInteger, useQueryState } from 'nuqs';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { userPasswordCreationColumns } from './_components/columns';
import FilterForm from './_components/filter-form';

export default function UserPasswordCreationPage() {
    const [years, setYears] = useState<IYear[]>([]);
    const [classes, setClasses] = useState<IClass[]>([]);
    const [sections, setSections] = useState<ISection[]>([]);
    const [students, setStudents] = useState<IStudent[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isTableLoading, setIsTableLoading] = useState(false);
    const [isCreating, setIsCreating] = useState(false);
    const [selectedStudents, setSelectedStudents] = useState<IStudent[]>([]);
    const [filterData, setFilterData] = useState<string>('');
    const [totalItems, setTotalItems] = useState<number>(0);

    const [currentPage] = useQueryState(tableSearchVariables.page, parseAsInteger.withOptions({ shallow: false }).withDefault(1));
    const [pageSize] = useQueryState(tableSearchVariables.page_size, parseAsInteger.withOptions({ shallow: false }).withDefault(10));

    const paginatedStudents = students.slice((currentPage - 1) * pageSize, currentPage * pageSize);

    const fetchInitialData = useCallback(async () => {
        setIsLoading(true);
        try {
            const res = await getInitialData();
            if (res.success && res.data) {
                setYears(res.data.yearList || []);
                setClasses(res.data.classlist || []);
                setSections(res.data.sectionlist || []);
            } else {
                toast.error('Failed to load initial dropdown data');
            }
        } catch (error: any) {
            console.error('fetchInitialData error:', error);
            toast.error(error.message || 'Failed to load initial data');
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchInitialData();
    }, [fetchInitialData]);

    const handleFilterSuccess = (studentList: IStudent[], filterdata: string, total?: number) => {
        setStudents(studentList);
        setFilterData(filterdata);
        setTotalItems(total ?? studentList.length);
        setSelectedStudents([]);
    };

    const handleReset = () => {
        setStudents([]);
        setSelectedStudents([]);
        setFilterData('');
        setTotalItems(0);
    };

    const handleCreateUsername = async () => {
        if (selectedStudents.length === 0) {
            toast.error('Please select at least one student');
            return;
        }

        setIsCreating(true);
        try {
            const payload = {
                filterdata: filterData,
                data_array: selectedStudents.map((student) => ({
                    AMST_Id: student.amst_id
                }))
            };
            const res = await createUsername(payload);
            if (res.success) {
                toast.success('Usernames created successfully');
                handleReset();
            } else {
                toast.error(res.message || 'Failed to create usernames');
            }
        } catch (error: any) {
            console.error('handleCreateUsername error:', error);
            toast.error(error.message || 'Error occurred during creation');
        } finally {
            setIsCreating(false);
        }
    };

    return (
        <div className='container mx-auto space-y-8 p-6'>
            <Card className='w-full border-t-4 border-t-primary shadow-lg'>
                <CardHeader>
                    <CardTitle className='text-center font-bold text-2xl text-primary'>User Password Creation</CardTitle>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className='flex h-32 items-center justify-center'>
                            <Loader2 className='h-8 w-8 animate-spin text-primary' />
                        </div>
                    ) : (
                        <FilterForm
                            years={years}
                            classes={classes}
                            sections={sections}
                            onSuccess={handleFilterSuccess}
                            onReset={handleReset}
                            onLoading={setIsTableLoading}
                        />
                    )}
                </CardContent>
            </Card>

            {students.length > 0 && (
                <Card className='w-full border-t-4 border-t-primary shadow-lg'>
                    <CardHeader className='flex flex-row items-center justify-between pb-2'>
                        <CardTitle className='font-bold text-primary text-xl'>Student List ({totalItems})</CardTitle>
                    </CardHeader>
                    <CardContent className='space-y-6 pt-2'>
                        <GenericDataTable<IStudent>
                            data={paginatedStudents}
                            columns={userPasswordCreationColumns}
                            isLoading={isTableLoading}
                            showExportOptions={true}
                            onRowSelectionChange={setSelectedStudents}
                            totalItems={totalItems}
                            isPaginationRequired={true}
                            getRowId={(row) => row.amst_id.toString()}
                        />

                        {selectedStudents.length > 0 && (
                            <div className='flex justify-center gap-4 border-t pt-4'>
                                <Button
                                    onClick={handleCreateUsername}
                                    disabled={isCreating}
                                    className='h-10 w-52 bg-primary font-semibold shadow-lg transition-all hover:scale-105 hover:bg-primary/90'>
                                    {isCreating ? (
                                        <>
                                            <Loader2 className='mr-2 h-4 w-4 animate-spin' /> Creating...
                                        </>
                                    ) : (
                                        <>
                                            <KeyRound className='mr-2 h-4 w-4' /> Create Usernames
                                        </>
                                    )}
                                </Button>
                                <Button onClick={() => setSelectedStudents([])} variant='outline' className='h-10 w-32 font-semibold'>
                                    <RefreshCcw className='mr-2 h-4 w-4' /> Clear
                                </Button>
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
