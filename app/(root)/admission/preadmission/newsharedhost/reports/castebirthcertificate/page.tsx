'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useReactToPrint } from 'react-to-print';
import { format } from 'date-fns';
import { Printer, X, FileText } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { DatePicker } from '@/components/ui/date-picker';
import { Checkbox } from '@/components/ui/checkbox';

import {
    useCasteBirthCertificateInitialData,
    useSearchCasteBirthStudentMutation,
    useCasteBirthStudentReportMutation,
    useGenerateCasteBirthQRCodeMutation
} from '@/hooks/admission/preadmission/newsharedhost/reports/useCasteBirthCertificate';

const formSchema = z.object({
    allOrIndi: z.enum(['A', 'I']),
    studentStatus: z.enum(['S', 'L', 'D']),
    certificateType: z.string().min(1, 'Please select certificate type'),
    academicYear: z.string().min(1, 'Academic Year is required'),
    classId: z.string().optional(),
    sectionId: z.string().optional(),
    issueDate: z.date({ required_error: 'Date is required' }),
    studentId: z.string().min(1, 'Student is required'),
    addressType: z.enum(['address_per', 'address_con']),
    parentNameType: z.enum(['0', '1', '2']),
});

type FormValues = z.infer<typeof formSchema>;

export default function CasteBirthCertificate() {
    const printRef = useRef<HTMLDivElement>(null);
    const [studentList, setStudentList] = useState<any[]>([]);
    const [certificateData, setCertificateData] = useState<any>(null);
    const [showCertificate, setShowCertificate] = useState(false);
    
    // Default config values
    const [isBoysSchool, setIsBoysSchool] = useState(false);
    const [isGirlsSchool, setIsGirlsSchool] = useState(false);
    const [isCoEdSchool, setIsCoEdSchool] = useState(false);
    const [isCommon, setIsCommon] = useState(true);
    const [showFatherMotherRadio, setShowFatherMotherRadio] = useState(false);
    
    const { data: initialData, isLoading: isInitialLoading } = useCasteBirthCertificateInitialData(1);
    const searchStudentMutation = useSearchCasteBirthStudentMutation();
    const reportMutation = useCasteBirthStudentReportMutation();
    const qrCodeMutation = useGenerateCasteBirthQRCodeMutation();

    const academicYears: any[] = Array.isArray(initialData?.data?.allAcademicYear) ? initialData.data.allAcademicYear : [];
    const classes: any[] = Array.isArray(initialData?.data?.allclasslist) ? initialData.data.allclasslist : [];
    const sections: any[] = Array.isArray(initialData?.data?.allsectionlist) ? initialData.data.allsectionlist : [];
    
    useEffect(() => {
        const masterCompany: any = initialData?.data?.masterCompany;
        if (masterCompany && masterCompany.length > 0 && masterCompany[0]?.mI_Id === 6) {
            setShowFatherMotherRadio(true);
        } else {
            setShowFatherMotherRadio(false);
        }
    }, [initialData]);

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            allOrIndi: 'A',
            studentStatus: 'S',
            certificateType: '0', // 0 = Caste/Birth Certificate
            academicYear: '',
            classId: '',
            sectionId: '',
            issueDate: new Date(),
            studentId: '',
            addressType: 'address_per',
            parentNameType: '0',
        }
    });

    const allOrIndi = form.watch('allOrIndi');
    const studentStatus = form.watch('studentStatus');
    const academicYear = form.watch('academicYear');
    const classId = form.watch('classId');
    const sectionId = form.watch('sectionId');
    const addressType = form.watch('addressType');
    const parentNameType = form.watch('parentNameType');
    
    // Disable class/section validation if 'A' is selected
    useEffect(() => {
        if (allOrIndi === 'A') {
            form.setValue('classId', '');
            form.setValue('sectionId', '');
        }
    }, [allOrIndi, form]);

    // Handle student search logic
    const handleSearchStudent = (searchQuery: string) => {
        if (searchQuery.length < 2) return;
        
        let searchClassId = 0;
        let searchSectionId = 0;
        
        if (allOrIndi === 'I') {
            searchClassId = Number(classId) || 0;
            searchSectionId = Number(sectionId) || 0;
        }

        const data = {
            filterinitialdata: studentStatus,
            searchfilter: searchQuery,
            ASMAY_Id: Number(academicYear),
            AMST_SOL: studentStatus,
            ASMCL_Id: searchClassId,
            ASMC_Id: searchSectionId,
            allorindid: allOrIndi
        };

        searchStudentMutation.mutate(data, {
            onSuccess: (res: any) => {
                if (res?.data?.count > 0) {
                    setStudentList(res.data.fillstudlist);
                } else {
                    setStudentList([]);
                }
            }
        });
    };

    const onSubmit = (values: FormValues) => {
        const reqData = {
            ASMAY_Id: Number(values.academicYear) || 0,
            ASMCL_Id: Number(values.classId) || 0,
            ASMC_Id: Number(values.sectionId) || 0,
            AMST_Id: Number(values.studentId),
            ASCISS_CertificateFlg: "SC"
        };

        reportMutation.mutate(reqData, {
            onSuccess: (res: any) => {
                const responseData = res?.data;
                if (responseData?.studentlist && responseData.studentlist.length > 0) {
                    const student = responseData.studentlist[0];
                    const miId = parseInt(responseData.masterCompany?.[0]?.mI_Id || '0');
                    
                    setIsCoEdSchool(miId === 5);
                    setIsGirlsSchool(miId === 4);
                    setIsBoysSchool(miId === 6);
                    setIsCommon(miId !== 4 && miId !== 5 && miId !== 6);

                    let fatherNameStr = student.fatherName;
                    if (miId === 6) {
                        if (values.parentNameType === '0') fatherNameStr = `Mr. ${student.fatherName}`;
                        else if (values.parentNameType === '1') fatherNameStr = `Mrs. ${student.mothername}`;
                        else if (values.parentNameType === '2') fatherNameStr = `Mr. ${student.fatherName} And Mrs. ${student.mothername}`;
                    }

                    setCertificateData({
                        ...student,
                        issueDate: values.issueDate,
                        fatherNameFormatted: fatherNameStr,
                        genderTitle: student.AMST_Sex?.toLowerCase() === 'male' ? 'Kumar' : 'Kumari',
                        relationTitle: student.AMST_Sex?.toLowerCase() === 'male' ? 'S/O' : 'D/O',
                        genderPronoun: student.AMST_Sex?.toLowerCase() === 'male' ? 'He' : 'She',
                        principalSign: responseData.principalsign?.[0]?.ivrmgC_PrincipalSign || ''
                    });

                    setShowCertificate(true);
                    
                    // Generate QR Code as well
                    const qrData = {
                        ASMAY_Id: reqData.ASMAY_Id,
                        ASMCL_Id: reqData.ASMCL_Id,
                        ASMC_Id: reqData.ASMC_Id,
                        AMST_Id: reqData.AMST_Id,
                        CertificateDate: values.issueDate,
                        ASCISS_HtmlTemplate: "Template Data", // simplified
                        ASCISS_CertificateFlg: "SC"
                    };
                    qrCodeMutation.mutate(qrData);

                } else {
                    toast.error('Record not found');
                    setShowCertificate(false);
                }
            },
            onError: () => {
                toast.error('Failed to generate report');
            }
        });
    };

    const handleClear = () => {
        form.reset();
        setShowCertificate(false);
        setCertificateData(null);
        setStudentList([]);
    };

    const handlePrint = useReactToPrint({
        contentRef: printRef,
        documentTitle: 'Caste_Birth_Certificate',
    });

    return (
        <div className="min-h-screen p-4 space-y-6">
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <CollapsibleSection title="Caste/Birth Certificate Report" defaultOpen={true} className="shadow-lg">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6 bg-white">
                            {/* Radio Groups */}
                            <FormField
                                control={form.control}
                                name="allOrIndi"
                                render={({ field }) => (
                                    <FormItem className="space-y-3">
                                        <FormControl>
                                            <RadioGroup
                                                onValueChange={field.onChange}
                                                defaultValue={field.value}
                                                className="flex flex-row space-x-4"
                                            >
                                                <FormItem className="flex items-center space-x-2 space-y-0">
                                                    <FormControl><RadioGroupItem value="A" /></FormControl>
                                                    <FormLabel className="font-normal">All</FormLabel>
                                                </FormItem>
                                                <FormItem className="flex items-center space-x-2 space-y-0">
                                                    <FormControl><RadioGroupItem value="I" /></FormControl>
                                                    <FormLabel className="font-normal">Individual</FormLabel>
                                                </FormItem>
                                            </RadioGroup>
                                        </FormControl>
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="studentStatus"
                                render={({ field }) => (
                                    <FormItem className="space-y-3">
                                        <FormControl>
                                            <RadioGroup
                                                onValueChange={field.onChange}
                                                defaultValue={field.value}
                                                className="flex flex-row space-x-4"
                                            >
                                                <FormItem className="flex items-center space-x-2 space-y-0">
                                                    <FormControl><RadioGroupItem value="S" /></FormControl>
                                                    <FormLabel className="font-normal">Studying</FormLabel>
                                                </FormItem>
                                                <FormItem className="flex items-center space-x-2 space-y-0">
                                                    <FormControl><RadioGroupItem value="L" /></FormControl>
                                                    <FormLabel className="font-normal">Left</FormLabel>
                                                </FormItem>
                                                <FormItem className="flex items-center space-x-2 space-y-0">
                                                    <FormControl><RadioGroupItem value="D" /></FormControl>
                                                    <FormLabel className="font-normal">Deactive</FormLabel>
                                                </FormItem>
                                            </RadioGroup>
                                        </FormControl>
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="certificateType"
                                render={({ field }) => (
                                    <FormItem className="flex items-center space-x-2">
                                        <FormControl>
                                            <RadioGroup onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormItem className="flex items-center space-x-2 space-y-0">
                                                    <FormControl><RadioGroupItem value="0" /></FormControl>
                                                    <FormLabel className="font-normal">Caste/Birth Certificate</FormLabel>
                                                </FormItem>
                                            </RadioGroup>
                                        </FormControl>
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 bg-gray-50 border-t">
                            <div className="space-y-4">
                                <FormField
                                    control={form.control}
                                    name="academicYear"
                                    render={({ field }) => (
                                        <FormItem className="grid grid-cols-[120px_1fr] items-center gap-4">
                                            <FormLabel className="text-right">Academic Year:<span className="text-red-500">*</span></FormLabel>
                                            <Select onValueChange={field.onChange} value={field.value}>
                                                <FormControl><SelectTrigger><SelectValue placeholder="--Select--" /></SelectTrigger></FormControl>
                                                <SelectContent>
                                                    {academicYears.map((yr: any) => (
                                                        <SelectItem key={yr.asmaY_Id} value={yr.asmaY_Id.toString()}>
                                                            {yr.asmaY_Year}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <FormMessage className="col-start-2" />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="classId"
                                    render={({ field }) => (
                                        <FormItem className="grid grid-cols-[120px_1fr] items-center gap-4">
                                            <FormLabel className="text-right">Class:{allOrIndi === 'I' && <span className="text-red-500">*</span>}</FormLabel>
                                            <Select onValueChange={field.onChange} value={field.value} disabled={allOrIndi === 'A'}>
                                                <FormControl><SelectTrigger><SelectValue placeholder="--Select--" /></SelectTrigger></FormControl>
                                                <SelectContent>
                                                    {classes.map((cls: any) => (
                                                        <SelectItem key={cls.asmcL_Id} value={cls.asmcL_Id.toString()}>
                                                            {cls.asmcL_ClassName}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <FormMessage className="col-start-2" />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="sectionId"
                                    render={({ field }) => (
                                        <FormItem className="grid grid-cols-[120px_1fr] items-center gap-4">
                                            <FormLabel className="text-right">Section:{allOrIndi === 'I' && <span className="text-red-500">*</span>}</FormLabel>
                                            <Select onValueChange={field.onChange} value={field.value} disabled={allOrIndi === 'A'}>
                                                <FormControl><SelectTrigger><SelectValue placeholder="--Select--" /></SelectTrigger></FormControl>
                                                <SelectContent>
                                                    {sections.map((sec: any) => (
                                                        <SelectItem key={sec.asmS_Id} value={sec.asmS_Id.toString()}>
                                                            {sec.asmC_SectionName}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <FormMessage className="col-start-2" />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <div className="space-y-4">
                                <FormField
                                    control={form.control}
                                    name="issueDate"
                                    render={({ field }) => (
                                        <FormItem className="grid grid-cols-[120px_1fr] items-center gap-4">
                                            <FormLabel className="text-right">Date:<span className="text-red-500">*</span></FormLabel>
                                            <FormControl>
                                                <DatePicker
                                                    date={field.value}
                                                    setDate={field.onChange}
                                                />
                                            </FormControl>
                                            <FormMessage className="col-start-2" />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="studentId"
                                    render={({ field }) => (
                                        <FormItem className="grid grid-cols-[120px_1fr] items-center gap-4">
                                            <FormLabel className="text-right">Student:<span className="text-red-500">*</span></FormLabel>
                                            <div className="relative">
                                                <Input 
                                                    placeholder="Search Student..." 
                                                    onChange={(e) => handleSearchStudent(e.target.value)}
                                                    className="mb-2"
                                                />
                                                <Select onValueChange={field.onChange} value={field.value}>
                                                    <FormControl><SelectTrigger><SelectValue placeholder="Select Student" /></SelectTrigger></FormControl>
                                                    <SelectContent>
                                                        {studentList.map((stud: any) => (
                                                            <SelectItem key={stud.amsT_Id} value={stud.amsT_Id.toString()}>
                                                                {stud.amsT_FirstName}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <FormMessage className="col-start-2" />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="addressType"
                                    render={({ field }) => (
                                        <FormItem className="mt-4">
                                            <FormControl>
                                                <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex space-x-4 justify-center">
                                                    <FormItem className="flex items-center space-x-2">
                                                        <FormControl><RadioGroupItem value="address_per" /></FormControl>
                                                        <FormLabel className="font-normal">Permanent Address</FormLabel>
                                                    </FormItem>
                                                    <FormItem className="flex items-center space-x-2">
                                                        <FormControl><RadioGroupItem value="address_con" /></FormControl>
                                                        <FormLabel className="font-normal">Communication Address</FormLabel>
                                                    </FormItem>
                                                </RadioGroup>
                                            </FormControl>
                                        </FormItem>
                                    )}
                                />

                                {showFatherMotherRadio && (
                                    <FormField
                                        control={form.control}
                                        name="parentNameType"
                                        render={({ field }) => (
                                            <FormItem className="mt-4">
                                                <FormControl>
                                                    <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex space-x-4 justify-center">
                                                        <FormItem className="flex items-center space-x-2">
                                                            <FormControl><RadioGroupItem value="0" /></FormControl>
                                                            <FormLabel className="font-normal">Father Name</FormLabel>
                                                        </FormItem>
                                                        <FormItem className="flex items-center space-x-2">
                                                            <FormControl><RadioGroupItem value="1" /></FormControl>
                                                            <FormLabel className="font-normal">Mother Name</FormLabel>
                                                        </FormItem>
                                                        <FormItem className="flex items-center space-x-2">
                                                            <FormControl><RadioGroupItem value="2" /></FormControl>
                                                            <FormLabel className="font-normal">Both</FormLabel>
                                                        </FormItem>
                                                    </RadioGroup>
                                                </FormControl>
                                            </FormItem>
                                        )}
                                    />
                                )}
                            </div>
                        </div>
                        <div className="p-4 text-center space-x-4 bg-white border-t">
                            <Button type="submit" disabled={reportMutation.isPending} className="bg-blue-600 hover:bg-blue-700">
                                <FileText className="mr-2 h-4 w-4" /> Report
                            </Button>
                            <Button type="button" onClick={handleClear} variant="destructive">
                                <X className="mr-2 h-4 w-4" /> Cancel
                            </Button>
                            <Button type="button" onClick={handlePrint} disabled={!showCertificate} className="bg-gray-600 hover:bg-gray-700">
                                <Printer className="mr-2 h-4 w-4" /> Print
                            </Button>
                        </div>
                    </CollapsibleSection>
                </form>
            </Form>

            {/* Print Section */}
            {showCertificate && certificateData && (
                <div className="bg-white p-8 shadow-lg overflow-x-auto">
                    <div ref={printRef} className="print-section" style={{ padding: '20px' }}>
                        <style type="text/css" media="print">
                            {`
                                @page { size: A4; margin: 0; }
                                html, body { background: #fff; margin: 0; padding: 0; }
                                .print-container {
                                    width: 210mm;
                                    height: 297mm;
                                    padding: 24mm 20mm 25mm 20mm;
                                    margin: auto;
                                    border: 8px double #000;
                                    box-sizing: border-box;
                                    font-family: 'Times New Roman', serif;
                                    position: relative;
                                }
                                .u-long, .u-mid {
                                    display: inline-block;
                                    border-bottom: 1px dotted #000;
                                    text-align: center;
                                    padding: 0 4px;
                                }
                                .u-long { min-width: 300px; }
                                .u-mid { min-width: 150px; }
                                .certificate-title {
                                    font-size: 26px; font-weight: bold; text-decoration: underline; text-align: center; margin-top: 15px;
                                }
                                .certificate-header img { width: 100%; max-width: 520px; }
                                hr { border: 1px solid #000; width: 100%; margin: 10px 0; }
                                .certificate-body { font-size: 20px; line-height: 34px; text-align: justify; margin-top: 10px; }
                                .certificate-footer { display: flex; justify-content: space-between; font-size: 18px; margin-top: 50px; }
                                .principal-sign { text-align: center; font-weight: bold; }
                                .principal-sign div { border-top: 1px solid #000; padding-top: 5px; width: 220px; }
                            `}
                        </style>
                        <div className="print-container border-8 border-double border-black p-8 font-serif" style={{ maxWidth: '800px', margin: '0 auto' }}>
                            <div className="text-center">
                                {certificateData.MI_Logo && (
                                    <img src={certificateData.MI_Logo} alt="Institution Logo" className="w-full max-w-lg mx-auto" />
                                )}
                                <hr className="border-black border-t-2 my-4" />
                                <div className="text-2xl font-bold underline my-4">CASTE / BIRTH CERTIFICATE</div>
                            </div>
                            
                            <div className="text-lg leading-loose text-justify mt-8">
                                <p>
                                    I, <span className="inline-block border-b border-dotted border-black min-w-[200px] text-center px-2">MAHADEVI P BHAT</span>
                                    Principal of <span className="inline-block border-b border-dotted border-black min-w-[300px] text-center px-2">VISHWADARSHANA CENTRAL SCHOOL</span>
                                </p>
                                <p>
                                    I, do hereby certify that <span className="inline-block border-b border-dotted border-black min-w-[400px] text-center px-2 font-bold">{certificateData.studentnam}</span>
                                    {certificateData.relationTitle}
                                </p>
                                <p>
                                    <span className="inline-block border-b border-dotted border-black min-w-[300px] text-center px-2">{certificateData.fatherNameFormatted}</span>
                                    is a student of our institute. {certificateData.genderPronoun} is studying
                                </p>
                                <p>
                                    in class <span className="inline-block border-b border-dotted border-black min-w-[100px] text-center px-2">{certificateData.class}</span>
                                    in <span className="inline-block border-b border-dotted border-black min-w-[150px] text-center px-2">{certificateData.acadamicyear}</span> the academic year
                                    with Admission Number
                                </p>
                                <p>
                                    <span className="inline-block border-b border-dotted border-black min-w-[150px] text-center px-2">{certificateData.admno}</span>
                                    & Enrollment Number
                                    <span className="inline-block border-b border-dotted border-black min-w-[150px] text-center px-2">{certificateData.RegistrationNo}</span>.
                                </p>
                                <br />
                                <p>
                                    I declare that {certificateData.genderPronoun} belongs to the
                                    <span className="inline-block border-b border-dotted border-black min-w-[250px] text-center px-2 font-bold">{certificateData.caste_name}</span> caste belonging to
                                </p>
                                <p>
                                    <span className="inline-block border-b border-dotted border-black min-w-[200px] text-center px-2 font-bold">{certificateData.CategoryName}</span> category as per school register.
                                    {certificateData.genderPronoun === 'He' ? 'His' : 'Her'} date of birth is
                                </p>
                                <p>
                                    <span className="inline-block border-b border-dotted border-black min-w-[150px] text-center px-2">
                                        {certificateData.dob ? format(new Date(certificateData.dob), 'dd-MM-yyyy') : ''}
                                    </span>
                                    (In words)
                                    <span className="inline-block border-b border-dotted border-black min-w-[300px] text-center px-2">{certificateData.dobwords}</span>.
                                </p>
                            </div>

                            <div className="flex justify-between items-end mt-16 text-lg">
                                <div>
                                    <p><strong>Date:</strong> <span className="inline-block border-b border-dotted border-black min-w-[150px] px-2">{certificateData.issueDate ? format(certificateData.issueDate, 'dd-MM-yyyy') : format(new Date(), 'dd-MM-yyyy')}</span></p>
                                    <p className="mt-4"><strong>Place:</strong> <span className="inline-block border-b border-dotted border-black min-w-[150px] px-2">{certificateData.area}</span></p>
                                </div>
                                <div className="text-center font-bold">
                                    <div className="border-t border-black pt-2 w-56 text-center">Principal Signature</div>
                                </div>
                            </div>
                            
                            <div className="text-center text-lg mt-8 ml-auto w-1/2">
                                <p><strong>Full Name:</strong> <span className="inline-block border-b border-dotted border-black min-w-[200px] px-2">MAHADEVI P BHAT</span></p>
                            </div>
                            
                            <div className="text-center text-lg mt-12">
                                ..............................Thanking you...................................
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
