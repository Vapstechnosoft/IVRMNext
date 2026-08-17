'use client';

import { useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Search, X, Printer, Plus, Eye } from 'lucide-react';
import { useReactToPrint } from 'react-to-print';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { GenericDataTable } from '@/components/ui/data-table/generic-data-table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';

import {
    useSchoolTpinGenerationInitialDetails,
    useSearchSchoolTpinGenerationMutation,
    useGenerateSchoolTpinMutation
} from '@/hooks/admission/hutchings/useSchoolTpinGeneration';

const formSchema = z.object({
    ASMAY_Id: z.string().min(1, 'Academic Year is required'),
});

type FormValues = z.infer<typeof formSchema>;

export default function SchoolTpinGeneration() {
    const [reportData, setReportData] = useState<any[]>([]);
    const [selectedYearName, setSelectedYearName] = useState<string>('');
    const [notGeneratedList, setNotGeneratedList] = useState<any[]>([]);
    const [generatedList, setGeneratedList] = useState<any[]>([]);
    
    const [isGeneratedModalOpen, setIsGeneratedModalOpen] = useState(false);
    const [isNotGeneratedModalOpen, setIsNotGeneratedModalOpen] = useState(false);
    
    const printRef = useRef<HTMLDivElement>(null);

    // Fetch initial details (Academic Years)
    const { data: initialDetails, isLoading: isInitialLoading } = useSchoolTpinGenerationInitialDetails();
    const academicYears: any[] = Array.isArray(initialDetails?.data) ? initialDetails.data : (Array.isArray(initialDetails?.getyearlist) ? initialDetails.getyearlist : []);

    const searchMutation = useSearchSchoolTpinGenerationMutation();
    const generateMutation = useGenerateSchoolTpinMutation();

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            ASMAY_Id: '',
        },
    });

    const onSubmit = (data: FormValues) => {
        const yearObj = academicYears.find((y: any) => y.asmaY_Id.toString() === data.ASMAY_Id);
        if (yearObj) {
            setSelectedYearName(yearObj.asmaY_Year);
        }

        searchMutation.mutate(
            { ASMAY_Id: Number(data.ASMAY_Id) },
            {
                onSuccess: (res: any) => {
                    let notGen: any[] = [];
                    let gen: any[] = [];
                    const responseData = res?.data || res;
                    
                    if (responseData?.studentList || responseData?.studentList1) {
                        const allStudents = [
                            ...(responseData.studentList || []),
                            ...(responseData.studentList1 || [])
                        ];
                        notGen = allStudents.filter((s: any) => !s.tpin);
                        gen = allStudents.filter((s: any) => s.tpin);
                    } else {
                        notGen = responseData?.gettpinnotgeneratedliststudent || [];
                        gen = responseData?.gettpingeneratedliststudent || [];
                    }
                    
                    setNotGeneratedList(notGen);
                    setGeneratedList(gen);
                    
                    if (notGen.length > 0 || gen.length > 0) {
                        setReportData([{
                            id: 1,
                            year: yearObj?.asmaY_Year || '',
                            notgeneratedlist: notGen,
                            genereatedlist: gen,
                        }]);
                    } else {
                        setReportData([]);
                        toast.error('No Records Found');
                    }
                },
                onError: () => {
                    toast.error('Failed to fetch data');
                }
            }
        );
    };

    const handleClear = () => {
        form.reset();
        setReportData([]);
        setNotGeneratedList([]);
        setGeneratedList([]);
        setSelectedYearName('');
    };

    const handleGenerateTpin = () => {
        const asmayId = form.getValues('ASMAY_Id');
        if (!asmayId) return;

        generateMutation.mutate(
            { ASMAY_Id: Number(asmayId) },
            {
                onSuccess: (res: any) => {
                    if (res?.success === true || res?.returnval === true) {
                        toast.success(res?.message || 'Tpin Number Generated Successfully');
                        setIsNotGeneratedModalOpen(false);
                        // Re-fetch data
                        onSubmit(form.getValues());
                    } else {
                        toast.error(res?.message || 'Failed to Generate Tpin Number');
                    }
                },
                onError: () => {
                    toast.error('Failed to generate Tpin Number');
                }
            }
        );
    };

    const handlePrint = useReactToPrint({
        contentRef: printRef,
        documentTitle: 'Tpin_Generated_Student_List',
    });

    const mainColumns = [
        {
            id: 'slno',
            header: () => <div className="font-bold text-black text-center">SL.No.</div>,
            cell: (info: any) => <div className="text-center">{info.row.index + 1}</div>,
        },
        { 
            accessorKey: 'year', 
            header: () => <div className="font-bold text-black text-center">Year</div>,
            cell: (info: any) => <div className="text-center">{info.getValue()}</div>
        },
        {
            id: 'generated',
            header: () => <div className="font-bold text-black text-center">Tpin Generated Students List</div>,
            cell: (info: any) => {
                const list = info.row.original.genereatedlist;
                if (list && list.length > 0) {
                    return (
                        <div className="text-center">
                            <Button
                                variant="link"
                                className="text-blue-600 p-0 h-auto"
                                onClick={() => setIsGeneratedModalOpen(true)}
                            >
                                View Details <Eye className="ml-1 h-4 w-4" />
                            </Button>
                        </div>
                    );
                }
                return <div className="text-center">No Students</div>;
            }
        },
        {
            id: 'notGenerated',
            header: () => <div className="font-bold text-black text-center">Tpin Not Generated Students List</div>,
            cell: (info: any) => {
                const list = info.row.original.notgeneratedlist;
                if (list && list.length > 0) {
                    return (
                        <div className="text-center">
                            <Button
                                variant="link"
                                className="text-blue-600 p-0 h-auto"
                                onClick={() => setIsNotGeneratedModalOpen(true)}
                            >
                                View Details <Eye className="ml-1 h-4 w-4" />
                            </Button>
                        </div>
                    );
                }
                return <div className="text-center">No Students</div>;
            }
        }
    ];

    const studentColumns = [
        { id: 'slno', header: () => <div className="font-bold text-black text-center">SLNO</div>, cell: (info: any) => <div className="text-center">{info.row.index + 1}</div> },
        { accessorKey: 'studentname', header: () => <div className="font-bold text-black text-center">Student Name</div>, cell: (info: any) => <div className="text-center">{info.getValue()}</div> },
        { accessorKey: 'admno', header: () => <div className="font-bold text-black text-center">Admno</div>, cell: (info: any) => <div className="text-center">{info.getValue()}</div> },
        { accessorKey: 'classname', header: () => <div className="font-bold text-black text-center">Class</div>, cell: (info: any) => <div className="text-center">{info.getValue()}</div> },
        { accessorKey: 'sectionname', header: () => <div className="font-bold text-black text-center">Section</div>, cell: (info: any) => <div className="text-center">{info.getValue()}</div> },
    ];

    const generatedStudentColumns = [
        ...studentColumns,
        { accessorKey: 'tpin', header: () => <div className="font-bold text-black text-center">Tpin</div>, cell: (info: any) => <div className="text-center">{info.getValue()}</div> },
    ];

    return (
        <div className="min-h-screen p-4 space-y-6">
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <CollapsibleSection
                        title="Tpin Generation"
                        description="Select Academic Year to search"
                        defaultOpen={true}
                        variant="outline"
                        className="shadow-lg"
                    >
                        <div className="flex flex-col items-center justify-center gap-8 p-6 bg-white max-w-2xl mx-auto">
                            <div className="w-full max-w-md">
                                <FormField
                                    control={form.control}
                                    name="ASMAY_Id"
                                    render={({ field }) => (
                                        <FormItem className="grid grid-cols-[120px_1fr] items-center gap-4">
                                            <FormLabel className="text-sm font-bold m-0 text-right">
                                                Academic Year:<span className="text-red-500">*</span>
                                            </FormLabel>
                                            <div className="space-y-1">
                                                <Select
                                                    onValueChange={(val) => {
                                                        field.onChange(val);
                                                        setReportData([]); // clear grid on change
                                                    }}
                                                    value={field.value}
                                                    disabled={isInitialLoading}
                                                >
                                                    <FormControl>
                                                        <SelectTrigger className="h-8">
                                                            <SelectValue placeholder="Select Academic Year" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        {(Array.isArray(academicYears) ? academicYears : []).map((item: any) => (
                                                            <SelectItem key={item.asmaY_Id} value={item.asmaY_Id.toString()}>
                                                                {item.asmaY_Year}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </div>
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <div className="flex flex-wrap items-center justify-center gap-4">
                                <Button
                                    type="submit"
                                    disabled={searchMutation.isPending}
                                    className="bg-blue-600 hover:bg-blue-700 text-white min-w-[100px]"
                                >
                                    <Search className="mr-2 h-4 w-4" /> Search
                                </Button>
                                <Button
                                    type="button"
                                    onClick={handleClear}
                                    className="bg-red-500 hover:bg-red-600 text-white min-w-[100px]"
                                >
                                    <X className="mr-2 h-4 w-4" /> Cancel
                                </Button>
                            </div>
                        </div>
                    </CollapsibleSection>
                </form>
            </Form>

            {reportData.length > 0 && (
                <CollapsibleSection
                    title="Tpin Generation"
                    defaultOpen={true}
                    variant="outline"
                    className="shadow-lg"
                >
                    <div className="p-4 bg-white">
                        <GenericDataTable
                            data={reportData}
                            columns={mainColumns}
                            isLoading={searchMutation.isPending}
                            isPaginationRequired={true}
                            isSearchRequired={true}
                        />
                    </div>
                </CollapsibleSection>
            )}

            {/* Modal for Tpin Not Generated List */}
            <Dialog open={isNotGeneratedModalOpen} onOpenChange={setIsNotGeneratedModalOpen}>
                <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Tpin Not Generated Students List</DialogTitle>
                    </DialogHeader>
                    <div className="mt-4">
                        <GenericDataTable
                            data={notGeneratedList}
                            columns={studentColumns}
                            isLoading={false}
                            isPaginationRequired={true}
                            isSearchRequired={true}
                        />
                    </div>
                    <DialogFooter className="mt-4 flex gap-2">
                        <Button variant="outline" onClick={() => setIsNotGeneratedModalOpen(false)}>
                            Close
                        </Button>
                        <Button onClick={handleGenerateTpin} disabled={generateMutation.isPending} className="bg-blue-600 hover:bg-blue-700 text-white">
                            <Plus className="mr-2 h-4 w-4" /> Generate Tpin
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Modal for Tpin Generated List */}
            <Dialog open={isGeneratedModalOpen} onOpenChange={setIsGeneratedModalOpen}>
                <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Tpin Generated Students List</DialogTitle>
                    </DialogHeader>
                    <div className="mt-4">
                        <GenericDataTable
                            data={generatedList}
                            columns={generatedStudentColumns}
                            isLoading={false}
                            isPaginationRequired={true}
                            isSearchRequired={true}
                        />
                    </div>
                    <DialogFooter className="mt-4 flex gap-2">
                        <Button variant="outline" onClick={() => setIsGeneratedModalOpen(false)}>
                            Close
                        </Button>
                        <Button onClick={handlePrint} className="bg-gray-200 hover:bg-gray-300 text-gray-800">
                            <Printer className="mr-2 h-4 w-4" /> Print
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Print Section */}
            <div className="hidden">
                <div ref={printRef} className="p-8 font-sans">
                    <div className="text-center mb-6">
                        <h4 className="text-xl font-bold">Tpin Generated Student List</h4>
                        <p className="text-md">Academic Year: {selectedYearName}</p>
                    </div>
                    <table className="w-full border-collapse border border-gray-300 mt-4 text-sm">
                        <thead>
                            <tr className="bg-gray-100">
                                <th className="border border-gray-300 p-2 text-center">SLNO</th>
                                <th className="border border-gray-300 p-2 text-left">Student Name</th>
                                <th className="border border-gray-300 p-2 text-left">Admno</th>
                                <th className="border border-gray-300 p-2 text-left">Class</th>
                                <th className="border border-gray-300 p-2 text-left">Section</th>
                                <th className="border border-gray-300 p-2 text-left">Tpin</th>
                            </tr>
                        </thead>
                        <tbody>
                            {generatedList.map((user, index) => (
                                <tr key={index}>
                                    <td className="border border-gray-300 p-2 text-center">{index + 1}</td>
                                    <td className="border border-gray-300 p-2 text-left">{user.studentname}</td>
                                    <td className="border border-gray-300 p-2 text-left">{user.admno}</td>
                                    <td className="border border-gray-300 p-2 text-left">{user.classname}</td>
                                    <td className="border border-gray-300 p-2 text-left">{user.sectionname}</td>
                                    <td className="border border-gray-300 p-2 text-left">{user.tpin}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
