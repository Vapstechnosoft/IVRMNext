'use client';

import { useState, useEffect } from 'react';
import {
    getInitialData,
    getReportDetails,
    resetStudentPassword,
    sendSMS,
    sendEmail,
    sendWhatsApp
} from '@/server/alumni/student-password-creation';
import type {
    IYear,
    IClass,
    ISection,
    ICredentialStudent
} from '@/types/alumni/student-password-creation';
import FilterForm from './_components/filter-form';
import { getStudentPasswordCreationColumns } from './_components/columns';
import { GenericDataTable } from '@/components/ui/data-table/generic-data-table';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import {
    MessageSquare,
    Mail,
    Phone,
    Printer,
    FileSpreadsheet,
    Loader2
} from 'lucide-react';
import { exportToExcel } from '@/lib/export-to-file';

export default function StudentPasswordCreationPage() {
    const [initialLoading, setInitialLoading] = useState(true);
    const [tableLoading, setTableLoading] = useState(false);
    const [years, setYears] = useState<IYear[]>([]);
    const [classes, setClasses] = useState<IClass[]>([]);
    const [sections, setSections] = useState<ISection[]>([]);
    const [students, setStudents] = useState<ICredentialStudent[]>([]);
    const [selectedStudents, setSelectedStudents] = useState<ICredentialStudent[]>([]);
    const [filterParams, setFilterParams] = useState<any>(null);

    useEffect(() => {
        const fetchInitial = async () => {
            const res = await getInitialData();
            if (res.success) {
                setYears(res.data?.yearList || []);
                setClasses(res.data?.classlist || []);
                setSections(res.data?.sectionlist || []);
            } else {
                toast.error(res.message);
            }
            setInitialLoading(false);
        };
        fetchInitial();
    }, []);

    const handleReportDetails = async (values: any) => {
        setTableLoading(true);
        setFilterParams(values);
        const res = await getReportDetails({
            asmaY_Id: parseInt(values.asmaY_Id),
            asmcL_Id: parseInt(values.asmcL_Id),
            asmS_Id: values.asmS_Id ? parseInt(values.asmS_Id) : 0,
            filterdata: values.filterdata
        });
        if (res.success) {
            if (res.data?.length === 0) {
                toast.warning('No records found');
            }
            setStudents(res.data || []);
        } else {
            toast.error(res.message);
        }
        setTableLoading(false);
    };

    const handleResetPassword = async (student: ICredentialStudent) => {
        const res = await resetStudentPassword(student, selectedStudents);
        if (res.success) {
            toast.success(res.message);
            // Re-fetch report to update data
            if (filterParams) handleReportDetails(filterParams);
        } else {
            toast.error(res.message);
        }
    };

    const handleSendSMS = async () => {
        if (selectedStudents.length === 0) {
            toast.warning('Please select atleast one student');
            return;
        }
        const res = await sendSMS(filterParams.filterdata, selectedStudents);
        if (res.success) toast.success(res.message);
        else toast.error(res.message);
    };

    const handleSendEmail = async () => {
        if (selectedStudents.length === 0) {
            toast.warning('Please select atleast one student');
            return;
        }
        const res = await sendEmail(filterParams.filterdata, selectedStudents);
        if (res.success) toast.success(res.message);
        else toast.error(res.message);
    };

    const handleSendWhatsApp = async () => {
        if (selectedStudents.length === 0) {
            toast.warning('Please select atleast one student');
            return;
        }
        const res = await sendWhatsApp(filterParams.filterdata, selectedStudents);
        if (res.success) toast.success(res.message);
        else toast.error(res.message);
    };

    const columns = getStudentPasswordCreationColumns(handleResetPassword);

    return (
        <div className="container space-y-8 p-6">
            <div className="flex items-center justify-between border-b pb-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Student Password Creation</h1>
                    <p className="text-sm text-muted-foreground">Search and manage student credentials</p>
                </div>
            </div>

            <CollapsibleSection title="Search Filters" defaultOpen={true}>
                {initialLoading ? (
                    <div className="flex h-32 items-center justify-center">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                ) : (
                    <FilterForm
                        years={years}
                        classes={classes}
                        sections={sections}
                        onSubmit={handleReportDetails}
                        onCancel={() => {
                            setStudents([]);
                            setSelectedStudents([]);
                        }}
                    />
                )}
            </CollapsibleSection>

            {students.length > 0 && (
                <CollapsibleSection title="Student Credentials List" defaultOpen={true}>
                    <div className="space-y-4">
                        <GenericDataTable<ICredentialStudent>
                            data={students}
                            columns={columns}
                            isLoading={tableLoading}
                            onRowSelectionChange={setSelectedStudents}
                        />

                        <div className="flex flex-wrap items-center justify-center gap-4 border-t pt-6">
                            <Button
                                onClick={handleSendSMS}
                                className="w-32 bg-blue-600 hover:bg-blue-700"
                                disabled={selectedStudents.length === 0}
                            >
                                <Phone className="mr-2 h-4 w-4" /> SMS
                            </Button>
                            <Button
                                onClick={handleSendEmail}
                                className="w-32 bg-cyan-600 hover:bg-cyan-700"
                                disabled={selectedStudents.length === 0}
                            >
                                <Mail className="mr-2 h-4 w-4" /> EMAIL
                            </Button>
                            <Button
                                onClick={handleSendWhatsApp}
                                className="w-32 bg-green-600 hover:bg-green-700"
                                disabled={selectedStudents.length === 0}
                            >
                                <MessageSquare className="mr-2 h-4 w-4" /> WHATSAPP
                            </Button>
                            <Button
                                variant="outline"
                                className="w-32"
                                onClick={() => window.print()}
                                disabled={selectedStudents.length === 0}
                            >
                                <Printer className="mr-2 h-4 w-4" /> PRINT
                            </Button>
                            <Button
                                variant="outline"
                                className="w-32 border-green-600 text-green-600 hover:bg-green-50"
                                onClick={() => exportToExcel(
                                    'Student_Credentials',
                                    JSON.stringify([
                                        { label: 'Name', value: 'studentname' },
                                        { label: 'Adm No', value: 'amsT_AdmNo' },
                                        { label: 'User Name', value: 'username' },
                                        { label: 'Password', value: 'password' },
                                        { label: 'Class', value: 'asmcL_ClassName' },
                                        { label: 'Section', value: 'asmC_SectionName' },
                                        { label: 'Mobile', value: 'amsT_MobileNo' },
                                        { label: 'Email', value: 'amsT_emailId' }
                                    ]),
                                    JSON.stringify(selectedStudents)
                                )}
                                disabled={selectedStudents.length === 0}
                            >
                                <FileSpreadsheet className="mr-2 h-4 w-4" /> EXCEL
                            </Button>
                        </div>
                    </div>
                </CollapsibleSection>
            )}
        </div>
    );
}
