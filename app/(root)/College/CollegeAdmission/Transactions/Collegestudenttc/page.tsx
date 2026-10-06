'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { ChevronRight, ChevronLeft, Save, X } from 'lucide-react';

import { 
    useCollegeStudentTcInitialData,
    useCollegeStudentTcCourses,
    useCollegeStudentTcBranches,
    useCollegeStudentTcSemesters,
    useCollegeStudentTcSections,
    useCollegeStudentTcStudents,
    useCollegeStudentTcStudentDetails,
    useCollegeStudentTcCheckDuplicate,
    useCollegeStudentTcSave
} from '@/hooks/college/useCollegeStudentTc';

export default function CollegeStudentTcPage() {
    const [admnoallind, setAdmnoallind] = useState('All');
    const [status, setStatus] = useState('S'); // S, L, D, T
    const [admnoName, setAdmnoName] = useState('N'); // A, N
    const [tempchkTc, setTempchkTc] = useState(false);
    
    // Dropdowns
    const [asmayId, setAsmayId] = useState('');
    const [amcoId, setAmcoId] = useState('');
    const [ambId, setAmbId] = useState('');
    const [amseId, setAmseId] = useState('');
    const [acmsId, setAcmsId] = useState('');
    
    const [yearList, setYearList] = useState<any[]>([]);
    const [courseList, setCourseList] = useState<any[]>([]);
    const [branchList, setBranchList] = useState<any[]>([]);
    const [semesterList, setSemesterList] = useState<any[]>([]);
    const [sectionList, setSectionList] = useState<any[]>([]);
    const [studentList, setStudentList] = useState<any[]>([]);
    
    const [selectedStudent, setSelectedStudent] = useState<any>(null);
    const [studentDetails, setStudentDetails] = useState<any>(null);

    // Config
    const [tcPaymentConfig, setTcPaymentConfig] = useState(0);
    const [tcNumberingConfig, setTcNumberingConfig] = useState<any>(null);
    const [isManualTc, setIsManualTc] = useState(false);

    // Form states
    const [activeTab, setActiveTab] = useState('student_details');
    
    // Student Details Tab (mostly readonly except promotion date and instruction)
    const [doa, setDoa] = useState('');
    const [dateOfPromotion, setDateOfPromotion] = useState('');
    const [mediumOfInstruction, setMediumOfInstruction] = useState('');
    const [languagesStudied, setLanguagesStudied] = useState('');
    const [electivesStudied, setElectivesStudied] = useState('');
    const [scholarship, setScholarship] = useState('');
    const [medicallyExamined, setMedicallyExamined] = useState('');
    
    // TC Details Tab
    const [tcNo, setTcNo] = useState('');
    const [tcApplicationDate, setTcApplicationDate] = useState('');
    const [leavingReason, setLeavingReason] = useState('');
    const [tcDate, setTcDate] = useState('');
    const [lastDateOfAttendance, setLastDateOfAttendance] = useState('');
    const [noOfSchoolDays, setNoOfSchoolDays] = useState('');
    const [noOfAttendedDays, setNoOfAttendedDays] = useState('');
    
    // Student Personal Details Tab (Readonly)
    // Other Details Tab
    const [feesPaid, setFeesPaid] = useState('');
    const [feesConcession, setFeesConcession] = useState('');
    const [lastExamDetails, setLastExamDetails] = useState('');
    const [results, setResults] = useState('');
    const [failedDetails, setFailedDetails] = useState('');
    const [promotionQualified, setPromotionQualified] = useState('');
    const [qualifiedDetails, setQualifiedDetails] = useState('');
    const [nccDetails, setNccDetails] = useState('');
    const [extraCurricular, setExtraCurricular] = useState('');
    const [conduct, setConduct] = useState('');
    const [remarks, setRemarks] = useState('');

    // Due Details Tab (Readonly)
    const [feesDue, setFeesDue] = useState<number>(0);
    const [libraryDue, setLibraryDue] = useState<number>(0);
    const [storeDue, setStoreDue] = useState<number>(0);
    const [pdaDue, setPdaDue] = useState<number>(0);

    const { data: initialData } = useCollegeStudentTcInitialData();
    const fetchCoursesMutation = useCollegeStudentTcCourses();
    const fetchBranchesMutation = useCollegeStudentTcBranches();
    const fetchSemestersMutation = useCollegeStudentTcSemesters();
    const fetchSectionsMutation = useCollegeStudentTcSections();
    const fetchStudentsMutation = useCollegeStudentTcStudents();
    const fetchStudentDetailsMutation = useCollegeStudentTcStudentDetails();
    const checkDuplicateMutation = useCollegeStudentTcCheckDuplicate();
    const saveMutation = useCollegeStudentTcSave();

    useEffect(() => {
        if (initialData?.data || initialData) {
            const res = initialData?.data || initialData;
            setYearList(res.getyear || []);
            
            const config = res.getconfigurationdetails?.[0];
            if (config) {
                if (config.asC_AdmNo_RegNo_RollNo_DefaultFlag === "3") {
                    setStatus('S');
                    setAdmnoName('A');
                } else {
                    setStatus('S');
                    setAdmnoName('N');
                }
                setTcPaymentConfig(config.admC_TCAllowBalanceFlg || 0);
            }

            const transConfig = res.admTransNumSetting;
            if (transConfig && transConfig.length > 0) {
                const tcConfig = transConfig.find((t: any) => t.imN_Flag === "tcno");
                if (tcConfig) {
                    setTcNumberingConfig(tcConfig);
                    setIsManualTc(tcConfig.imN_AutoManualFlag === "Manual");
                }
            } else {
                toast.warning("Please Map The Transaction Numbering For TC Number Generation");
            }
        }
    }, [initialData]);

    const handleYearChange = (val: string) => {
        setAsmayId(val);
        setAmcoId(''); setAmbId(''); setAmseId(''); setAcmsId('');
        setSelectedStudent(null); setStudentDetails(null);
        if (admnoallind === 'Indi') {
            fetchCoursesMutation.mutate({ ASMAY_Id: val }, { 
                onSuccess: (res) => {
                    const courses = res?.data?.getcourse || res?.getcourse || (Array.isArray(res?.data) ? res.data : []);
                    setCourseList(courses);
                } 
            });
        }
    };

    const handleCourseChange = (val: string) => {
        setAmcoId(val);
        setAmbId(''); setAmseId(''); setAcmsId('');
        setSelectedStudent(null); setStudentDetails(null);
        fetchBranchesMutation.mutate({ ASMAY_Id: asmayId, AMCO_Id: val }, { 
            onSuccess: (res) => {
                const branches = res?.data?.getbranch || res?.getbranch || (Array.isArray(res?.data) ? res.data : []);
                setBranchList(branches);
            } 
        });
    };

    const handleBranchChange = (val: string) => {
        setAmbId(val);
        setAmseId(''); setAcmsId('');
        setSelectedStudent(null); setStudentDetails(null);
        fetchSemestersMutation.mutate({ ASMAY_Id: asmayId, AMCO_Id: amcoId, AMB_Id: val }, { 
            onSuccess: (res) => {
                const semesters = res?.data?.getsemester || res?.getsemester || (Array.isArray(res?.data) ? res.data : []);
                setSemesterList(semesters);
            } 
        });
    };

    const handleSemesterChange = (val: string) => {
        setAmseId(val);
        setAcmsId('');
        setSelectedStudent(null); setStudentDetails(null);
        fetchSectionsMutation.mutate({ ASMAY_Id: asmayId, AMCO_Id: amcoId, AMB_Id: ambId, AMSE_Id: val }, { 
            onSuccess: (res) => {
                const sections = res?.data?.getssection || res?.getssection || (Array.isArray(res?.data) ? res.data : []);
                setSectionList(sections);
            } 
        });
    };

    const handleStudentSearch = (inputValue: string) => {
        if (inputValue.length < 2) return;
        
        const payload = {
            ASMAY_Id: asmayId,
            AMCO_Id: admnoallind === 'All' ? 0 : amcoId,
            AMB_Id: admnoallind === 'All' ? 0 : ambId,
            AMSE_Id: admnoallind === 'All' ? 0 : amseId,
            ACMS_Id: admnoallind === 'All' ? 0 : acmsId,
            searchfilter: inputValue,
            AMCST_SOL: status,
            allorindividual: admnoallind,
            adm_num_flag: admnoName
        };

        fetchStudentsMutation.mutate(payload, {
            onSuccess: (res) => {
                const data = res?.data || res;
                const studentList = data.getstudentlist || (Array.isArray(data) ? data : []);
                if (studentList && studentList.length > 0) {
                    setStudentList(studentList.map((s: any) => ({ value: s.amcsT_Id, label: s.studentName })));
                } else {
                    setStudentList([]);
                }
            }
        });
    };

    const handleStudentSelect = (selectedOption: any) => {
        setSelectedStudent(selectedOption);
        if (!selectedOption) {
            setStudentDetails(null);
            return;
        }

        const payload = {
            ASMAY_Id: asmayId,
            AMCO_Id: admnoallind === 'All' ? 0 : amcoId,
            AMB_Id: admnoallind === 'All' ? 0 : ambId,
            AMSE_Id: admnoallind === 'All' ? 0 : amseId,
            ACMS_Id: admnoallind === 'All' ? 0 : acmsId,
            AMCST_Id: selectedOption.value,
            AMCST_SOL: status,
            adm_num_flag: admnoName
        };

        fetchStudentDetailsMutation.mutate(payload, {
            onSuccess: (res) => {
                const data = res?.data || res;
                const studentDetailsArr = data.getstudentdetails || (Array.isArray(data) ? data : []);
                if (studentDetailsArr && studentDetailsArr.length > 0) {
                    const student = studentDetailsArr[0];
                    setStudentDetails(student);
                    
                    // Populate initial form fields based on status
                    setDoa(student.doa ? format(new Date(student.doa), 'yyyy-MM-dd') : '');
                    setMediumOfInstruction(student.ACSTC_MediumOfINStruction || '');
                    setScholarship(student.ACSTC_Scholarship || '');
                    setMedicallyExamined(student.ACSTC_MedicallyExam || '');
                    
                    if (status === 'L' || status === 'T') {
                        setDateOfPromotion(student.ACSTC_PromotionDate ? format(new Date(student.ACSTC_PromotionDate), 'yyyy-MM-dd') : '');
                        setTcApplicationDate(student.ACSTC_TCApplicationDate ? format(new Date(student.ACSTC_TCApplicationDate), 'yyyy-MM-dd') : '');
                        setLeavingReason(student.ACSTC_LeavingReason || '');
                        setTcDate(student.ACSTC_TCDate ? format(new Date(student.ACSTC_TCDate), 'yyyy-MM-dd') : '');
                        setTcNo(student.ACSTC_TCNO || '');
                        
                        setFeesConcession(student.ACSTC_FeeConcession || '');
                        setLastExamDetails(student.ACSTC_LastExamDetails || '');
                        setResults(student.ACSTC_Result || '');
                        setFailedDetails(student.ACSTC_ResultDetails || '');
                        setPromotionQualified(student.ACSTC_Qual_PromotionFlag || '');
                        setQualifiedDetails(student.ACSTC_Qual_Course || '');
                        setNccDetails(student.ACSTC_NCCDetails || '');
                        setExtraCurricular(student.ACSTC_ExtraActivities || '');
                        setConduct(student.ACSTC_Conduct || '');
                        setRemarks(student.ACSTC_Remarks || '');

                        setNoOfSchoolDays(student.ACSTC_WorkingDays || '');
                        setNoOfAttendedDays(student.ACSTC_AttendedDays || '');
                        setLastDateOfAttendance(student.ACSTC_LastAttendedDate ? format(new Date(student.ACSTC_LastAttendedDate), 'yyyy-MM-dd') : '');
                        
                        setLanguagesStudied(student.ACSTC_LanguageStudied || '');
                        setElectivesStudied(student.ACSTC_ElectivesStudied || '');
                    } else {
                        setDateOfPromotion(format(new Date(), 'yyyy-MM-dd'));
                        setTcApplicationDate(format(new Date(), 'yyyy-MM-dd'));
                        setTcDate(format(new Date(), 'yyyy-MM-dd'));
                        setLeavingReason('');
                        setTcNo('');
                        
                        setFeesConcession('');
                        setLastExamDetails('');
                        setResults('');
                        setFailedDetails('');
                        setPromotionQualified('');
                        setQualifiedDetails('');
                        setNccDetails('');
                        setExtraCurricular('');
                        setConduct('');
                        setRemarks('');

                        // Attendance Details
                        const attDetails = data.getstudentattendancedetails?.[0];
                        if (attDetails && attDetails.classheld) {
                            setNoOfSchoolDays(attDetails.classheld.toString());
                            setNoOfAttendedDays(attDetails.classattened.toString());
                            setLastDateOfAttendance(attDetails.lastdate ? format(new Date(attDetails.lastdate), 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd'));
                        } else {
                            setNoOfSchoolDays('');
                            setNoOfAttendedDays('');
                            setLastDateOfAttendance(format(new Date(), 'yyyy-MM-dd'));
                        }

                        // Subjects
                        const langs = data.getstudentlanguagesubjects || [];
                        const lStudy = langs.filter((l: any) => l.flag === 1).map((l: any) => l.subjectname).join(',');
                        const eStudy = langs.filter((l: any) => l.flag !== 1).map((l: any) => l.subjectname).join(',');
                        setLanguagesStudied(lStudy);
                        setElectivesStudied(eStudy);
                    }

                    // Dues
                    const feeAmt = parseFloat(student.Fee_Due_Amnt) || 0;
                    setFeesDue(feeAmt);
                    setLibraryDue(parseFloat(student.Library_Due_Amnt) || 0);
                    setStoreDue(parseFloat(student.Store_Canteen_Due) || 0);
                    setPdaDue(parseFloat(student.PDA_Due) || 0);
                    setFeesPaid(feeAmt > 0 ? 'No' : 'Yes');
                } else {
                    toast.error("No Records Found");
                }
            }
        });
    };

    const handleCheckTcDup = (val: string) => {
        if (!val) return;
        checkDuplicateMutation.mutate({ ACSTC_TCNO: val }, {
            onSuccess: (res) => {
                if (res?.data?.message === 'Exists' || res?.message === 'Exists') {
                    toast.error('TC Number Already Exists', { description: 'Please Enter Different TC Number' });
                }
            }
        });
    };

    const handleSave = () => {
        if (!selectedStudent || !studentDetails) {
            toast.error("Please select a student first");
            return;
        }

        if (feesDue > 0 && tcPaymentConfig === 1 && (status === 'S' || status === 'D' || status === 'T') && !tempchkTc) {
            toast.error(`${feesDue} Rs. Amount is Due! So You Can Not Proceed Until Fee Due Is Clear`);
            return;
        }

        if (feesDue > 0) {
            if (!confirm(`${feesDue} Rs. Amount is Due! Do you want to Submit the Details?`)) {
                return;
            }
        }

        const emailFlag = confirm("Do you want to send the Email?") ? "Yes" : "No";

        const payload = {
            AMCST_Id: selectedStudent.value,
            ASMAY_Id: asmayId,
            AMCO_Id: amcoId,
            AMB_Id: ambId,
            AMSE_Id: amseId,
            ACMS_Id: acmsId,
            ACSTC_TCNO: tcNo,
            ACSTC_TCApplicationDate: tcApplicationDate,
            ACSTC_LeavingReason: leavingReason,
            ACSTC_TCDate: tcDate,
            ACSTC_TCIssueDate: tcDate,
            ACSTC_LastAttendedDate: lastDateOfAttendance,
            ACSTC_WorkingDays: parseInt(noOfSchoolDays) || 0,
            ACSTC_AttendedDays: parseInt(noOfAttendedDays) || 0,
            ACSTC_PromotionDate: dateOfPromotion,
            ACSTC_MediumOfINStruction: mediumOfInstruction,
            ACSTC_LanguageStudied: languagesStudied,
            ACSTC_ElectivesStudied: electivesStudied,
            ACSTC_Scholarship: scholarship,
            ACSTC_MedicallyExam: medicallyExamined,
            ACSTC_FeePaid: feesPaid,
            ACSTC_FeeConcession: feesConcession,
            ACSTC_LastExamDetails: lastExamDetails,
            ACSTC_Result: results,
            ACSTC_ResultDetails: failedDetails,
            ACSTC_Qual_PromotionFlag: promotionQualified,
            ACSTC_Qual_Course: qualifiedDetails,
            ACSTC_NCCDetails: nccDetails,
            ACSTC_ExtraActivities: extraCurricular,
            ACSTC_Conduct: conduct,
            ACSTC_Remarks: remarks,
            ACSTC_TemporaryFlag: tempchkTc ? 1 : 0,
            ACSTC_ActiveFlag: status,
            Fee_Due_Amnt: feesDue,
            Library_Due_Amnt: libraryDue,
            Store_Canteen_Due: storeDue,
            PDA_Due: pdaDue,
            Email_flag: emailFlag,
            transnumconfigsettings: tcNumberingConfig,
            allorindividual: admnoallind,
            admission_Date: studentDetails?.doa || new Date().toISOString(),
            last_Course_Studied: studentDetails?.coursename || '',
            caste: studentDetails?.caste || ''
        };

        saveMutation.mutate(payload, {
            onSuccess: (res) => {
                const data = res?.data || res;
                if (data.tcflagexists === "Exists" || data.message === "Exists") {
                    toast.error('TC Number Already Exists', { description: 'Please Enter Different TC Number' });
                } else if (data.returnval) {
                    toast.success('Record Saved Successfully');
                    if (data.email_flag === 'sent') toast.success('Mail Sent Successfully');
                    else if (data.email_flag === 'sms_sent') toast.success('SMS Sent Successfully');
                    
                    // Reset
                    setSelectedStudent(null);
                    setStudentDetails(null);
                } else {
                    toast.error('Failed to Save', { description: 'Record Already Exists or an error occurred' });
                }
            }
        });
    };

    return (
        <div className="container mx-auto py-6 space-y-6">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold tracking-tight">Student TC</h1>
                <p className="text-muted-foreground">Manage and generate Transfer Certificates for College Students.</p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Filter & Selection</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <div className="flex items-center justify-center space-x-6 p-4 bg-muted rounded-md">
                                <RadioGroup value={admnoallind} onValueChange={setAdmnoallind} className="flex space-x-4">
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="All" id="all" />
                                        <Label htmlFor="all">All</Label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="Indi" id="indi" />
                                        <Label htmlFor="indi">Individual</Label>
                                    </div>
                                </RadioGroup>
                            </div>

                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label className="text-right">Academic Year <span className="text-destructive">*</span></Label>
                                <Select value={asmayId} onValueChange={handleYearChange}>
                                    <SelectTrigger className="col-span-3"><SelectValue placeholder="Select Academic Year" /></SelectTrigger>
                                    <SelectContent>
                                        {yearList.map(y => <SelectItem key={y.asmaY_Id} value={y.asmaY_Id?.toString()}>{y.asmaY_Year}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label className="text-right">Course <span className="text-destructive">*</span></Label>
                                <Select value={amcoId} onValueChange={handleCourseChange} disabled={admnoallind === 'All'}>
                                    <SelectTrigger className="col-span-3"><SelectValue placeholder="Select Course" /></SelectTrigger>
                                    <SelectContent>
                                        {courseList.map(c => <SelectItem key={c.amcO_Id} value={c.amcO_Id?.toString()}>{c.amcO_CourseName}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label className="text-right">Branch <span className="text-destructive">*</span></Label>
                                <Select value={ambId} onValueChange={handleBranchChange} disabled={admnoallind === 'All'}>
                                    <SelectTrigger className="col-span-3"><SelectValue placeholder="Select Branch" /></SelectTrigger>
                                    <SelectContent>
                                        {branchList.map(b => <SelectItem key={b.amB_Id} value={b.amB_Id?.toString()}>{b.amB_BranchName}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label className="text-right">Semester <span className="text-destructive">*</span></Label>
                                <Select value={amseId} onValueChange={handleSemesterChange} disabled={admnoallind === 'All'}>
                                    <SelectTrigger className="col-span-3"><SelectValue placeholder="Select Semester" /></SelectTrigger>
                                    <SelectContent>
                                        {semesterList.map(s => <SelectItem key={s.amsE_Id} value={s.amsE_Id?.toString()}>{s.amsE_SEMName}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label className="text-right">Section <span className="text-destructive">*</span></Label>
                                <Select value={acmsId} onValueChange={setAcmsId} disabled={admnoallind === 'All'}>
                                    <SelectTrigger className="col-span-3"><SelectValue placeholder="Select Section" /></SelectTrigger>
                                    <SelectContent>
                                        {sectionList.map(s => <SelectItem key={s.acmS_Id} value={s.acmS_Id?.toString()}>{s.acmS_SectionName}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="p-4 bg-muted rounded-md space-y-4">
                                <h4 className="font-semibold text-sm">Student Status</h4>
                                <RadioGroup value={status} onValueChange={(val) => { setStatus(val); if(val==='L'||val==='T') setTempchkTc(true); else setTempchkTc(false); }} className="flex flex-wrap gap-4">
                                    <div className="flex items-center space-x-2"><RadioGroupItem value="S" id="st_s" /><Label htmlFor="st_s">Active</Label></div>
                                    <div className="flex items-center space-x-2"><RadioGroupItem value="L" id="st_l" /><Label htmlFor="st_l">Left</Label></div>
                                    <div className="flex items-center space-x-2"><RadioGroupItem value="D" id="st_d" /><Label htmlFor="st_d">Deactive</Label></div>
                                    <div className="flex items-center space-x-2"><RadioGroupItem value="T" id="st_t" /><Label htmlFor="st_t">Temporary</Label></div>
                                </RadioGroup>
                            </div>
                            
                            <div className="p-4 bg-muted rounded-md">
                                <div className="flex items-center space-x-2">
                                    <Checkbox checked={tempchkTc} onCheckedChange={(c) => setTempchkTc(!!c)} disabled={status === 'L' || status === 'T'} id="temp_tc" />
                                    <Label htmlFor="temp_tc">Temporary TC</Label>
                                </div>
                            </div>

                            <div className="p-4 bg-muted rounded-md">
                                <RadioGroup value={admnoName} onValueChange={setAdmnoName} className="flex space-x-4">
                                    <div className="flex items-center space-x-2"><RadioGroupItem value="A" id="adm_a" /><Label htmlFor="adm_a">Adm. No:Name</Label></div>
                                    <div className="flex items-center space-x-2"><RadioGroupItem value="N" id="adm_n" /><Label htmlFor="adm_n">Name:Adm No.</Label></div>
                                </RadioGroup>
                            </div>

                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label className="text-right">Student <span className="text-destructive">*</span></Label>
                                <div className="col-span-3">
                                    <Select 
                                        value={selectedStudent?.value?.toString()} 
                                        onValueChange={(val) => {
                                            const student = studentList.find(s => s.value.toString() === val);
                                            handleStudentSelect(student || null);
                                        }}
                                        onOpenChange={(open) => {
                                            if (open && studentList.length === 0) {
                                                handleStudentSearch(" ");
                                            }
                                        }}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select student..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {studentList.map(s => (
                                                <SelectItem key={s.value} value={s.value.toString()}>{s.label}</SelectItem>
                                            ))}
                                            {studentList.length === 0 && (
                                                <div className="p-2 text-sm text-muted-foreground text-center">
                                                    Start typing or select filters to see students
                                                </div>
                                            )}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {studentDetails && (
                <div className="space-y-6 slide-in-from-bottom-4 animate-in">
                    <Card>
                        <CardHeader>
                            <CardTitle>Basic Summary</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex flex-col md:flex-row gap-6">
                                <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2 text-sm">
                                    <div className="grid grid-cols-3 gap-2"><span className="font-semibold text-muted-foreground">Name:</span> <span className="col-span-2">{studentDetails.studentname}</span></div>
                                    <div className="grid grid-cols-3 gap-2"><span className="font-semibold text-muted-foreground">Adm No:</span> <span className="col-span-2">{studentDetails.admno}</span></div>
                                    <div className="grid grid-cols-3 gap-2"><span className="font-semibold text-muted-foreground">Reg No:</span> <span className="col-span-2">{studentDetails.regno}</span></div>
                                    <div className="grid grid-cols-3 gap-2"><span className="font-semibold text-muted-foreground">Course:</span> <span className="col-span-2">{studentDetails.coursename}</span></div>
                                    <div className="grid grid-cols-3 gap-2"><span className="font-semibold text-muted-foreground">Branch:</span> <span className="col-span-2">{studentDetails.branchname}</span></div>
                                    <div className="grid grid-cols-3 gap-2"><span className="font-semibold text-muted-foreground">Semester:</span> <span className="col-span-2">{studentDetails.semestername}</span></div>
                                    <div className="grid grid-cols-3 gap-2"><span className="font-semibold text-muted-foreground">Section:</span> <span className="col-span-2">{studentDetails.sectionname}</span></div>
                                    <div className="grid grid-cols-3 gap-2"><span className="font-semibold text-muted-foreground">Father Name:</span> <span className="col-span-2">{studentDetails.fathername}</span></div>
                                </div>
                                {studentDetails.studentphoto && (
                                    <div className="w-32 h-32 shrink-0 border rounded-md overflow-hidden bg-muted flex items-center justify-center">
                                        <img src={studentDetails.studentphoto} alt="Student" className="object-cover w-full h-full" />
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-0">
                            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                                <div className="border-b px-4">
                                    <TabsList className="h-12 w-full justify-start bg-transparent">
                                        <TabsTrigger value="student_details" className="data-[state=active]:bg-muted">Student Details</TabsTrigger>
                                        <TabsTrigger value="tc_details" className="data-[state=active]:bg-muted">TC Details</TabsTrigger>
                                        <TabsTrigger value="personal_details" className="data-[state=active]:bg-muted">Personal Details</TabsTrigger>
                                        <TabsTrigger value="other_details" className="data-[state=active]:bg-muted">Other Details</TabsTrigger>
                                        <TabsTrigger value="due_details" className="data-[state=active]:bg-muted">Due Details</TabsTrigger>
                                    </TabsList>
                                </div>
                                
                                <div className="p-6">
                                    <TabsContent value="student_details" className="mt-0 space-y-4">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-4">
                                                <div className="grid grid-cols-3 items-center gap-4">
                                                    <Label className="text-right">Date Of Admission</Label>
                                                    <Input className="col-span-2" type="date" value={doa} disabled />
                                                </div>
                                                <div className="grid grid-cols-3 items-center gap-4">
                                                    <Label className="text-right">Date Of Promotion</Label>
                                                    <Input className="col-span-2" type="date" value={dateOfPromotion} onChange={(e) => setDateOfPromotion(e.target.value)} />
                                                </div>
                                                <div className="grid grid-cols-3 items-center gap-4">
                                                    <Label className="text-right">Caste</Label>
                                                    <Input className="col-span-2" value={studentDetails.castename || ''} disabled />
                                                </div>
                                                <div className="grid grid-cols-3 items-center gap-4">
                                                    <Label className="text-right">Medium Of Instruction</Label>
                                                    <Input className="col-span-2" value={mediumOfInstruction} onChange={(e) => setMediumOfInstruction(e.target.value)} />
                                                </div>
                                            </div>
                                            <div className="space-y-4">
                                                <div className="grid grid-cols-3 items-center gap-4">
                                                    <Label className="text-right">Languages Studied</Label>
                                                    <Input className="col-span-2" value={languagesStudied} onChange={(e) => setLanguagesStudied(e.target.value)} />
                                                </div>
                                                <div className="grid grid-cols-3 items-center gap-4">
                                                    <Label className="text-right">Elective Studied</Label>
                                                    <Input className="col-span-2" value={electivesStudied} onChange={(e) => setElectivesStudied(e.target.value)} />
                                                </div>
                                                <div className="grid grid-cols-3 items-center gap-4">
                                                    <Label className="text-right">Scholarship</Label>
                                                    <Input className="col-span-2" value={scholarship} onChange={(e) => setScholarship(e.target.value)} />
                                                </div>
                                                <div className="grid grid-cols-3 items-center gap-4">
                                                    <Label className="text-right">Medically Examined?</Label>
                                                    <Input className="col-span-2" placeholder="Yes/No" value={medicallyExamined} onChange={(e) => setMedicallyExamined(e.target.value)} />
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex justify-end pt-4">
                                            <Button onClick={() => setActiveTab('tc_details')}>Next <ChevronRight className="w-4 h-4 ml-2" /></Button>
                                        </div>
                                    </TabsContent>

                                    <TabsContent value="tc_details" className="mt-0 space-y-4">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-4">
                                                {isManualTc && (
                                                    <div className="grid grid-cols-3 items-center gap-4">
                                                        <Label className="text-right">TC No. <span className="text-destructive">*</span></Label>
                                                        <Input className="col-span-2" value={tcNo} onChange={(e) => setTcNo(e.target.value)} onBlur={(e) => handleCheckTcDup(e.target.value)} disabled={status === 'L' || status === 'T'} />
                                                    </div>
                                                )}
                                                <div className="grid grid-cols-3 items-center gap-4">
                                                    <Label className="text-right">TC Application Date <span className="text-destructive">*</span></Label>
                                                    <Input className="col-span-2" type="date" value={tcApplicationDate} onChange={(e) => setTcApplicationDate(e.target.value)} />
                                                </div>
                                                <div className="grid grid-cols-3 items-center gap-4">
                                                    <Label className="text-right">Leaving Reason <span className="text-destructive">*</span></Label>
                                                    <Textarea className="col-span-2" value={leavingReason} onChange={(e) => setLeavingReason(e.target.value)} />
                                                </div>
                                                <div className="grid grid-cols-3 items-center gap-4">
                                                    <Label className="text-right">TC Date <span className="text-destructive">*</span></Label>
                                                    <Input className="col-span-2" type="date" value={tcDate} onChange={(e) => setTcDate(e.target.value)} />
                                                </div>
                                            </div>
                                            <div className="space-y-4">
                                                <h4 className="font-semibold border-b pb-2">Attendance Details</h4>
                                                <div className="grid grid-cols-3 items-center gap-4">
                                                    <Label className="text-right">Last Date Of Attendance <span className="text-destructive">*</span></Label>
                                                    <Input className="col-span-2" type="date" value={lastDateOfAttendance} onChange={(e) => setLastDateOfAttendance(e.target.value)} />
                                                </div>
                                                <div className="grid grid-cols-3 items-center gap-4">
                                                    <Label className="text-right">No. Of School Days <span className="text-destructive">*</span></Label>
                                                    <Input className="col-span-2" type="number" value={noOfSchoolDays} onChange={(e) => setNoOfSchoolDays(e.target.value)} />
                                                </div>
                                                <div className="grid grid-cols-3 items-center gap-4">
                                                    <Label className="text-right">No. Of Attended Days <span className="text-destructive">*</span></Label>
                                                    <Input className="col-span-2" type="number" value={noOfAttendedDays} onChange={(e) => setNoOfAttendedDays(e.target.value)} />
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex justify-between pt-4">
                                            <Button variant="outline" onClick={() => setActiveTab('student_details')}><ChevronLeft className="w-4 h-4 mr-2" /> Previous</Button>
                                            <Button onClick={() => setActiveTab('personal_details')}>Next <ChevronRight className="w-4 h-4 ml-2" /></Button>
                                        </div>
                                    </TabsContent>

                                    <TabsContent value="personal_details" className="mt-0 space-y-4">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-4">
                                                <div className="grid grid-cols-3 items-center gap-4"><Label className="text-right">Date Of Birth:</Label><Input className="col-span-2" value={studentDetails.dob ? format(new Date(studentDetails.dob), 'dd-MM-yyyy') : ''} disabled /></div>
                                                <div className="grid grid-cols-3 items-center gap-4"><Label className="text-right">DOB in Words:</Label><Input className="col-span-2" value={studentDetails.dobinwords || ''} disabled /></div>
                                                <div className="grid grid-cols-3 items-center gap-4"><Label className="text-right">IFSC Code:</Label><Input className="col-span-2" value={studentDetails.ifsccode || ''} disabled /></div>
                                                <div className="grid grid-cols-3 items-center gap-4"><Label className="text-right">Birth Place:</Label><Input className="col-span-2" value={studentDetails.birthplace || ''} disabled /></div>
                                                <div className="grid grid-cols-3 items-center gap-4"><Label className="text-right">Age:</Label><Input className="col-span-2" value={studentDetails.age || ''} disabled /></div>
                                                <div className="grid grid-cols-3 items-center gap-4"><Label className="text-right">Gender:</Label><Input className="col-span-2" value={studentDetails.gender || ''} disabled /></div>
                                            </div>
                                            <div className="space-y-4">
                                                <div className="grid grid-cols-3 items-center gap-4"><Label className="text-right">Mother Tongue:</Label><Input className="col-span-2" value={studentDetails.mothertounge || ''} disabled /></div>
                                                <div className="grid grid-cols-3 items-center gap-4"><Label className="text-right">Nationality:</Label><Input className="col-span-2" value={studentDetails.nationality || ''} disabled /></div>
                                                <div className="grid grid-cols-3 items-center gap-4"><Label className="text-right">Mobile No:</Label><Input className="col-span-2" value={studentDetails.mobileno || ''} disabled /></div>
                                                <div className="grid grid-cols-3 items-center gap-4"><Label className="text-right">Email ID:</Label><Input className="col-span-2" value={studentDetails.emailid || ''} disabled /></div>
                                                <div className="grid grid-cols-3 items-center gap-4"><Label className="text-right">Aadhar No:</Label><Input className="col-span-2" value={studentDetails.aadharno || ''} disabled /></div>
                                            </div>
                                        </div>
                                        <div className="flex justify-between pt-4">
                                            <Button variant="outline" onClick={() => setActiveTab('tc_details')}><ChevronLeft className="w-4 h-4 mr-2" /> Previous</Button>
                                            <Button onClick={() => setActiveTab('other_details')}>Next <ChevronRight className="w-4 h-4 ml-2" /></Button>
                                        </div>
                                    </TabsContent>

                                    <TabsContent value="other_details" className="mt-0 space-y-6">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-4">
                                                <h4 className="font-semibold border-b pb-2">Fee Related Details</h4>
                                                <div className="grid grid-cols-3 items-center gap-4"><Label className="text-right">Fees Paid?</Label><Input className="col-span-2" value={feesPaid} disabled /></div>
                                                <div className="grid grid-cols-3 items-center gap-4"><Label className="text-right">Fees Concession</Label><Input className="col-span-2" value={feesConcession} onChange={(e) => setFeesConcession(e.target.value)} /></div>
                                                
                                                <h4 className="font-semibold border-b pb-2 mt-6">Exam Related Details</h4>
                                                <div className="grid grid-cols-3 items-center gap-4"><Label className="text-right">Last Exam Details</Label><Input className="col-span-2" value={lastExamDetails} onChange={(e) => setLastExamDetails(e.target.value)} /></div>
                                                <div className="grid grid-cols-3 items-center gap-4"><Label className="text-right">Results</Label><Input className="col-span-2" value={results} onChange={(e) => setResults(e.target.value)} /></div>
                                                <div className="grid grid-cols-3 items-center gap-4"><Label className="text-right">Whether failed</Label><Input className="col-span-2" value={failedDetails} onChange={(e) => setFailedDetails(e.target.value)} /></div>
                                                <div className="grid grid-cols-3 items-center gap-4"><Label className="text-right">Promotion Qualified?</Label><Input className="col-span-2" placeholder="Yes/No" value={promotionQualified} onChange={(e) => setPromotionQualified(e.target.value)} /></div>
                                                <div className="grid grid-cols-3 items-center gap-4">
                                                    <Label className="text-right">Qualified Status <span className="text-destructive">*</span></Label>
                                                    <Select value={qualifiedDetails} onValueChange={setQualifiedDetails}>
                                                        <SelectTrigger className="col-span-2"><SelectValue placeholder="Select Status" /></SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="Granted">Granted</SelectItem>
                                                            <SelectItem value="Promoted">Promoted</SelectItem>
                                                            <SelectItem value="Detained">Detained</SelectItem>
                                                            <SelectItem value="Not Applicable">Not Applicable</SelectItem>
                                                            <SelectItem value="Pass Certificate Awarded">Pass Certificate Awarded</SelectItem>
                                                            <SelectItem value="Pass Certificate Not Awarded">Pass Certificate Not Awarded</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                            </div>
                                            <div className="space-y-4">
                                                <h4 className="font-semibold border-b pb-2">Miscellaneous Details</h4>
                                                <div className="grid grid-cols-3 items-center gap-4"><Label className="text-right">NCC cadet/scout?</Label><Input className="col-span-2" placeholder="Yes/No" value={nccDetails} onChange={(e) => setNccDetails(e.target.value)} /></div>
                                                <div className="grid grid-cols-3 items-center gap-4"><Label className="text-right">Extra curricular</Label><Textarea className="col-span-2" rows={2} value={extraCurricular} onChange={(e) => setExtraCurricular(e.target.value)} /></div>
                                                
                                                <h4 className="font-semibold border-b pb-2 mt-6">Remarks</h4>
                                                <div className="grid grid-cols-3 items-center gap-4"><Label className="text-right">Conduct/Character <span className="text-destructive">*</span></Label><Input className="col-span-2" value={conduct} onChange={(e) => setConduct(e.target.value)} /></div>
                                                <div className="grid grid-cols-3 items-center gap-4"><Label className="text-right">Remarks</Label><Textarea className="col-span-2" rows={3} value={remarks} onChange={(e) => setRemarks(e.target.value)} /></div>
                                            </div>
                                        </div>
                                        <div className="flex justify-between pt-4">
                                            <Button variant="outline" onClick={() => setActiveTab('personal_details')}><ChevronLeft className="w-4 h-4 mr-2" /> Previous</Button>
                                            <Button onClick={() => setActiveTab('due_details')}>Next <ChevronRight className="w-4 h-4 ml-2" /></Button>
                                        </div>
                                    </TabsContent>

                                    <TabsContent value="due_details" className="mt-0 space-y-4">
                                        <div className="max-w-xl mx-auto space-y-4">
                                            <div className="grid grid-cols-2 items-center gap-4"><Label className="text-right">Fee Due:</Label><Input value={feesDue} disabled /></div>
                                            <div className="grid grid-cols-2 items-center gap-4"><Label className="text-right">Library Due:</Label><Input value={libraryDue} disabled /></div>
                                            <div className="grid grid-cols-2 items-center gap-4"><Label className="text-right">Store/Canteen Due:</Label><Input value={storeDue} disabled /></div>
                                            <div className="grid grid-cols-2 items-center gap-4"><Label className="text-right">PDA Due:</Label><Input value={pdaDue} disabled /></div>
                                        </div>
                                        <div className="flex justify-between pt-8">
                                            <Button variant="outline" onClick={() => setActiveTab('other_details')}><ChevronLeft className="w-4 h-4 mr-2" /> Previous</Button>
                                            <div className="space-x-4">
                                                <Button onClick={handleSave} disabled={saveMutation.isPending}><Save className="w-4 h-4 mr-2" /> Save TC Details</Button>
                                            </div>
                                        </div>
                                    </TabsContent>
                                </div>
                            </Tabs>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    );
}
