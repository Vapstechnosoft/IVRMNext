'use client';

import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Search, RotateCcw, FileText, Loader2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/extension/field';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { GenericDataTable } from '@/components/ui/data-table/generic-data-table';

import {
    useAdmissionProcedureInitialDetails,
    useAdmissionProcedureClass,
    useAdmissionProcedureReport,
    useViewAdmissionDetails
} from '@/hooks/admission/preadmission/useAdmissionProcedureReport';

import { getAdmissionProcedureColumns, type IAdmissionProcedureReport } from './_components/columns';
import AdmissionProcedureModal from './_components/admission-procedure-modal';
import AdmissionFormModal from './_components/admission-form-modal';

export default function AdmissionProcedureReportPage() {
    // Hooks
    const { data: initialData, isLoading: isInitialLoading } = useAdmissionProcedureInitialDetails();
    const classMutation = useAdmissionProcedureClass();
    const reportMutation = useAdmissionProcedureReport();
    const viewDetailsMutation = useViewAdmissionDetails();

    // State
    const [academicYearId, setAcademicYearId] = useState<string | null>(null);
    const [categoryId, setCategoryId] = useState<string>('0');
    const [reportType, setReportType] = useState('1'); // 1: All
    const [students, setStudents] = useState<IAdmissionProcedureReport[]>([]);
    const [isGenerating, setIsGenerating] = useState(false);

    // Modal State
    const [selectedStudentData, setSelectedStudentData] = useState<any>(null);
    const [isProcedureModalOpen, setIsProcedureModalOpen] = useState(false);
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);

    // Initial load handling for default year
    useEffect(() => {
        if (initialData?.data?.academicListdefault?.[0]) {
            setAcademicYearId(initialData.data.academicListdefault[0].asmaY_Id.toString());
        }
    }, [initialData]);

    // Handlers
    const handleYearChange = (val: string) => {
        setAcademicYearId(val);
        setStudents([]);
    };

    const handleCategoryChange = (val: string) => {
        setCategoryId(val);
        setStudents([]);
    };

    const handleGetReport = async () => {
        if (!academicYearId) {
            toast.error('Please select Academic Year');
            return;
        }

        try {
            setIsGenerating(true);
            const res = await reportMutation.mutateAsync({
                type: Number(reportType),
                ASMAY_Id: Number(academicYearId),
                ASMCL_Id: 0,
                ASMC_Id: 0,
                AMC_Id: Number(categoryId),
            });

            if (res?.data?.admissionprocedure && res.data.admissionprocedure.length > 0) {
                setStudents(res.data.admissionprocedure);
            } else {
                setStudents([]);
                toast.error('No records found');
            }
        } catch (error) {
            toast.error('Failed to generate report');
        } finally {
            setIsGenerating(false);
        }
    };

    const handleCancel = () => {
        setAcademicYearId(initialData?.data?.academicListdefault?.[0]?.asmaY_Id?.toString() || null);
        setCategoryId('0');
        setReportType('1');
        setStudents([]);
    };

    const handleViewDetails = async (student: IAdmissionProcedureReport, type: 'procedure' | 'form') => {
        try {
            const res = await viewDetailsMutation.mutateAsync({
                AMST_Id: student.AMST_Id,
                ASMCL_Id: student.ASMCL_Id,
                ASMAY_Id: Number(academicYearId)
            });

            if (res?.data) {
                setSelectedStudentData(res.data);
                if (type === 'procedure') {
                    setIsProcedureModalOpen(true);
                } else {
                    setIsFormModalOpen(true);
                }
            } else {
                toast.error('No details available for this student');
            }
        } catch (error) {
            toast.error('Failed to load student details');
        }
    };

    const columns = getAdmissionProcedureColumns(
        (row) => handleViewDetails(row, 'procedure'),
        (row) => handleViewDetails(row, 'form')
    );

    return (
        <div className="min-h-screen p-4 space-y-6 bg-gray-50">
            <CollapsibleSection
                title="ADMISSION PROCEDURE REPORT"
                description="Generate and view detailed admission procedure and form reports"
                defaultOpen={true}
                variant="outline"
                className="shadow-md"
            >
                <div className="space-y-8 bg-white p-6 rounded-lg">
                    <div className="flex justify-center border-b pb-6">
                        <RadioGroup 
                            value={reportType} 
                            onValueChange={setReportType}
                            className="flex gap-12"
                        >
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="1" id="type-all" />
                                <Label htmlFor="type-all" className="font-bold cursor-pointer">ALL</Label>
                            </div>
                            <div className="flex items-center space-x-2 opacity-50 cursor-not-allowed">
                                <RadioGroupItem value="2" id="type-ind" disabled />
                                <Label htmlFor="type-ind" className="font-bold cursor-pointer">INDIVIDUAL</Label>
                            </div>
                        </RadioGroup>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                        <div className="space-y-2">
                            <Label className="text-sm font-bold">Academic Year:<span className="text-red-500">*</span></Label>
                            <Select
                                value={academicYearId || ''}
                                onValueChange={handleYearChange}
                            >
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Select Year" />
                                </SelectTrigger>
                                <SelectContent>
                                    {initialData?.data?.yearDropdown?.map((item: any) => (
                                        <SelectItem key={item.asmaY_Id} value={item.asmaY_Id.toString()}>
                                            {item.asmaY_Year}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {initialData?.data?.categoryflag && (
                            <div className="space-y-2">
                                <Label className="text-sm font-bold">Category:</Label>
                                <Select
                                    value={categoryId}
                                    onValueChange={handleCategoryChange}
                                >
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Select Category" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="0">All</SelectItem>
                                        {initialData?.data?.categoryDropdown?.map((item: any) => (
                                            <SelectItem key={item.amC_Id} value={item.amC_Id.toString()}>
                                                {item.amC_Name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        )}
                    </div>

                    <div className="flex justify-center gap-4 pt-4">
                        <Button
                            onClick={handleGetReport}
                            disabled={isGenerating || !academicYearId}
                            className="min-w-[140px] bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-lg"
                        >
                            {isGenerating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <FileText className="mr-2 h-4 w-4" />}
                            REPORT
                        </Button>
                        <Button
                            onClick={handleCancel}
                            variant="destructive"
                            className="min-w-[140px] font-bold"
                        >
                            <RotateCcw className="mr-2 h-4 w-4" />
                            CANCEL
                        </Button>
                    </div>
                </div>
            </CollapsibleSection>

            {students.length > 0 && (
                <div className="bg-white p-6 rounded-lg shadow-md space-y-4">
                    <h3 className="text-lg font-bold uppercase text-indigo-700">Admission Procedure Report</h3>
                    <GenericDataTable
                        data={students}
                        columns={columns}
                        isLoading={isGenerating}
                    />
                </div>
            )}

            {/* Modals */}
            <AdmissionProcedureModal
                isOpen={isProcedureModalOpen}
                onClose={() => setIsProcedureModalOpen(false)}
                data={selectedStudentData}
                logo={initialData?.data?.photopathname || ''}
            />

            <AdmissionFormModal
                isOpen={isFormModalOpen}
                onClose={() => setIsFormModalOpen(false)}
                data={selectedStudentData}
                logo={initialData?.data?.photopathname || ''}
            />
        </div>
    );
}
