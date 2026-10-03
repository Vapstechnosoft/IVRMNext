'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Save, Search, X } from 'lucide-react';
import { toast } from 'sonner';

import { 
    useCollegeActiveDeactiveInitialData,
    useCollegeActiveDeactiveCourses,
    useCollegeActiveDeactiveBranches,
    useCollegeActiveDeactiveSemesters,
    useCollegeActiveDeactiveSections,
    useCollegeActiveDeactiveSearch,
    useCollegeActiveDeactiveSave
} from '@/hooks/college/useCollegeActiveDeactiveStudents';

const CustomPagination = ({ currentPage, totalPages, onPageChange }: { currentPage: number, totalPages: number, onPageChange: (page: number) => void }) => {
    return (
        <div className="flex justify-between items-center px-2 py-4">
            <div className="text-sm text-muted-foreground">
                Page {currentPage} of {totalPages}
            </div>
            <div className="flex space-x-2">
                <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => onPageChange(currentPage - 1)} 
                    disabled={currentPage === 1}
                >
                    Previous
                </Button>
                <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => onPageChange(currentPage + 1)} 
                    disabled={currentPage === totalPages}
                >
                    Next
                </Button>
            </div>
        </div>
    );
};


export default function CollegeActiveDeactiveStudentsPage() {
    const [statusType, setStatusType] = useState('S'); // 'S' for Active, 'D' for Deactive
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

    const [students, setStudents] = useState<any[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    
    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);
    const [totalItems, setTotalItems] = useState(0);

    const { data: initialData } = useCollegeActiveDeactiveInitialData();
    const fetchCoursesMutation = useCollegeActiveDeactiveCourses();
    const fetchBranchesMutation = useCollegeActiveDeactiveBranches();
    const fetchSemestersMutation = useCollegeActiveDeactiveSemesters();
    const fetchSectionsMutation = useCollegeActiveDeactiveSections();
    const searchMutation = useCollegeActiveDeactiveSearch();
    const saveMutation = useCollegeActiveDeactiveSave();

    useEffect(() => {
        if (Array.isArray(initialData?.data)) {
            setYearList(initialData.data);
        } else if (initialData?.data?.yearlist || initialData?.yearlist) {
            setYearList(initialData?.data?.yearlist || initialData?.yearlist || []);
        }
    }, [initialData]);

    const handleClear = () => {
        setStatusType('S');
        setAsmayId('');
        setAmcoId('');
        setAmbId('');
        setAmseId('');
        setAcmsId('');
        setStudents([]);
        setCourseList([]);
        setBranchList([]);
        setSemesterList([]);
        setSectionList([]);
        setSearchTerm('');
    };

    const handleAcademicYearChange = (val: string) => {
        setAsmayId(val);
        setAmcoId('');
        setAmbId('');
        setAmseId('');
        setAcmsId('');
        setStudents([]);
        
        fetchCoursesMutation.mutate({ ASMAY_Id: val }, {
            onSuccess: (res) => {
                const list = Array.isArray(res?.data) ? res.data : (res?.data?.courselist || res?.courselist || []);
                setCourseList(list);
            }
        });
    };

    const handleCourseChange = (val: string) => {
        setAmcoId(val);
        setAmbId('');
        setAmseId('');
        setAcmsId('');
        setStudents([]);

        fetchBranchesMutation.mutate({ ASMAY_Id: asmayId, AMCO_Id: val }, {
            onSuccess: (res) => {
                const list = Array.isArray(res?.data) ? res.data : (res?.data?.branchlist || res?.branchlist || []);
                setBranchList(list);
            }
        });
    };

    const handleBranchChange = (val: string) => {
        setAmbId(val);
        setAmseId('');
        setAcmsId('');
        setStudents([]);

        fetchSemestersMutation.mutate({ ASMAY_Id: asmayId, AMCO_Id: amcoId, AMB_Id: val }, {
            onSuccess: (res) => {
                const list = Array.isArray(res?.data) ? res.data : (res?.data?.semesterlist || res?.semesterlist || []);
                setSemesterList(list);
            }
        });
    };

    const handleSemesterChange = (val: string) => {
        setAmseId(val);
        setAcmsId('');
        setStudents([]);

        fetchSectionsMutation.mutate({ ASMAY_Id: asmayId, AMCO_Id: amcoId, AMB_Id: ambId, AMSE_Id: val }, {
            onSuccess: (res) => {
                const list = Array.isArray(res?.data) ? res.data : (res?.data?.sectionlist || res?.sectionlist || []);
                setSectionList(list);
            }
        });
    };

    const handleSearch = () => {
        if (!asmayId || !amcoId || !ambId || !amseId || !acmsId) {
            toast.error('Please select all required fields');
            return;
        }

        const payload = {
            ASMAY_Id: asmayId,
            AMCO_Id: amcoId,
            AMB_Id: ambId,
            AMSE_Id: amseId,
            ACMS_Id: acmsId,
            AMCST_SOL: statusType
        };

        searchMutation.mutate(payload, {
            onSuccess: (res) => {
                const list = Array.isArray(res?.data) ? res.data : (res?.data?.studentlist || res?.studentlist || []);
                if (list.length > 0) {
                    setStudents(list.map((s: any) => ({ ...s, checkedvalue: false, remarks: '' })));
                    setTotalItems(list.length);
                } else {
                    setStudents([]);
                    toast.error('No Record Found');
                }
            }
        });
    };

    const toggleAllStudents = (checked: boolean) => {
        setStudents(prev => prev.map(s => ({ ...s, checkedvalue: checked })));
    };

    const toggleStudent = (index: number, checked: boolean) => {
        setStudents(prev => {
            const updated = [...prev];
            updated[index].checkedvalue = checked;
            return updated;
        });
    };

    const updateStudentRemark = (index: number, val: string) => {
        setStudents(prev => {
            const updated = [...prev];
            updated[index].remarks = val;
            return updated;
        });
    };

    const handleSave = () => {
        const selectedStudents = students.filter(s => s.checkedvalue);
        if (selectedStudents.length === 0) {
            toast.error('Select Atleast One Check Box');
            return;
        }

        const missingRemarks = selectedStudents.some(s => !s.remarks || s.remarks.trim() === '');
        if (missingRemarks) {
            toast.error('Enter Remarks For Selected Student');
            return;
        }

        const payload = {
            asmaY_Id: Number(asmayId),
            amcO_Id: Number(amcoId),
            amB_Id: Number(ambId),
            amsE_Id: Number(amseId),
            acmS_Id: Number(acmsId),
            savetmpdata: selectedStudents.map(s => ({
                amcsT_Id: Number(s.amcsT_Id),
                checkedvalue: s.checkedvalue,
                remarks: s.remarks
            })),
            amcsT_SOL_activate: statusType === 'S' ? 'D' : 'S'
        };

        saveMutation.mutate(payload, {
            onSuccess: (res) => {
                const returnval = res?.data?.returnval || res?.returnval;
                if (returnval) {
                    toast.success(`Record ${statusType === 'S' ? 'Deactivated' : 'Activated'} Successfully`);
                    handleClear();
                } else {
                    toast.error(`Record Not ${statusType === 'S' ? 'Deactivated' : 'Activated'} Successfully`);
                }
            }
        });
    };

    const filteredStudents = students.filter(s => 
        (s.studentname?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        (s.regno?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        (s.admno?.toLowerCase() || '').includes(searchTerm.toLowerCase())
    );

    const paginatedStudents = filteredStudents.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    const allChecked = students.length > 0 && students.every(s => s.checkedvalue);

    return (
        <div className="container mx-auto py-6 space-y-6">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold tracking-tight">Active Deactive Students</h1>
                <p className="text-muted-foreground">Manage active and deactive status of students.</p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Filter Criteria</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="flex justify-center mb-4">
                        <RadioGroup defaultValue="S" value={statusType} onValueChange={(val) => {
                            setStatusType(val);
                            setStudents([]);
                        }} className="flex items-center space-x-6">
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="S" id="r1" />
                                <Label htmlFor="r1">Active Students</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="D" id="r2" />
                                <Label htmlFor="r2">Deactive Students</Label>
                            </div>
                        </RadioGroup>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label>Academic Year <span className="text-destructive">*</span></Label>
                            <Select value={asmayId} onValueChange={handleAcademicYearChange}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select Academic Year" />
                                </SelectTrigger>
                                <SelectContent>
                                    {yearList?.map((y) => (
                                        <SelectItem key={y.asmaY_Id} value={y.asmaY_Id?.toString()}>{y.asmaY_Year}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Course <span className="text-destructive">*</span></Label>
                            <Select value={amcoId} onValueChange={handleCourseChange} disabled={!asmayId}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select Course" />
                                </SelectTrigger>
                                <SelectContent>
                                    {courseList?.map((c) => (
                                        <SelectItem key={c.amcO_Id} value={c.amcO_Id?.toString()}>{c.amcO_CourseName}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Branch <span className="text-destructive">*</span></Label>
                            <Select value={ambId} onValueChange={handleBranchChange} disabled={!amcoId}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select Branch" />
                                </SelectTrigger>
                                <SelectContent>
                                    {branchList?.map((b) => (
                                        <SelectItem key={b.amB_Id} value={b.amB_Id?.toString()}>{b.amB_BranchName}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Semester <span className="text-destructive">*</span></Label>
                            <Select value={amseId} onValueChange={handleSemesterChange} disabled={!ambId}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select Semester" />
                                </SelectTrigger>
                                <SelectContent>
                                    {semesterList?.map((s) => (
                                        <SelectItem key={s.amsE_Id} value={s.amsE_Id?.toString()}>{s.amsE_SEMName}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Section <span className="text-destructive">*</span></Label>
                            <Select value={acmsId} onValueChange={(val) => { setAcmsId(val); setStudents([]); }} disabled={!amseId}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select Section" />
                                </SelectTrigger>
                                <SelectContent>
                                    {sectionList?.map((s) => (
                                        <SelectItem key={s.acmS_Id} value={s.acmS_Id?.toString()}>{s.acmS_SectionName}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    
                    <div className="flex justify-center gap-4 mt-6">
                        <Button onClick={handleSearch} disabled={searchMutation.isPending}>
                            <Search className="w-4 h-4 mr-2" /> Search
                        </Button>
                        <Button variant="destructive" onClick={handleClear}>
                            <X className="w-4 h-4 mr-2" /> Clear
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {students.length > 0 && (
                <Card className="slide-in-from-bottom-4 animate-in">
                    <CardHeader>
                        <div className="flex justify-between items-center">
                            <CardTitle>Activate / Deactivate Students</CardTitle>
                            <div className="w-72">
                                <Input 
                                    placeholder="Search here..." 
                                    value={searchTerm} 
                                    onChange={(e) => setSearchTerm(e.target.value)} 
                                />
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="rounded-md border overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-16 text-center">SL.No.</TableHead>
                                        <TableHead className="w-16 text-center">
                                            <Checkbox 
                                                checked={allChecked} 
                                                onCheckedChange={(checked) => toggleAllStudents(!!checked)} 
                                            />
                                        </TableHead>
                                        <TableHead>Reg. No.</TableHead>
                                        <TableHead>Adm. No.</TableHead>
                                        <TableHead>Student Name</TableHead>
                                        <TableHead>Remarks</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {paginatedStudents.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={6} className="text-center text-muted-foreground h-24">
                                                No students found.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        paginatedStudents.map((student, index) => {
                                            const actualIndex = (currentPage - 1) * itemsPerPage + index;
                                            return (
                                                <TableRow key={student.amcsT_Id}>
                                                    <TableCell className="text-center">{actualIndex + 1}</TableCell>
                                                    <TableCell className="text-center">
                                                        <Checkbox 
                                                            checked={student.checkedvalue} 
                                                            onCheckedChange={(checked) => toggleStudent(actualIndex, !!checked)} 
                                                        />
                                                    </TableCell>
                                                    <TableCell>{student.regno}</TableCell>
                                                    <TableCell>{student.admno}</TableCell>
                                                    <TableCell>{student.studentname}</TableCell>
                                                    <TableCell>
                                                        <Input 
                                                            value={student.remarks} 
                                                            onChange={(e) => updateStudentRemark(actualIndex, e.target.value)} 
                                                            placeholder="Enter Remarks"
                                                            maxLength={100}
                                                        />
                                                    </TableCell>
                                                </TableRow>
                                            )
                                        })
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                        
                        {filteredStudents.length > 0 && (
                            <CustomPagination
                                currentPage={currentPage}
                                totalPages={Math.ceil(filteredStudents.length / itemsPerPage)}
                                onPageChange={setCurrentPage}
                            />
                        )}

                        <div className="flex justify-center mt-6">
                            <div className="flex items-center space-x-6 bg-muted/50 p-4 rounded-lg border">
                                <div className="flex items-center space-x-2">
                                    <Checkbox checked={statusType === 'D'} disabled />
                                    <Label className={statusType === 'D' ? 'font-bold text-primary' : 'text-muted-foreground'}>Activate the Students</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Checkbox checked={statusType === 'S'} disabled />
                                    <Label className={statusType === 'S' ? 'font-bold text-primary' : 'text-muted-foreground'}>Deactivate the Students</Label>
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-center gap-4 border-t pt-6">
                            <Button onClick={handleSave} disabled={saveMutation.isPending}>
                                <Save className="w-4 h-4 mr-2" /> Save
                            </Button>
                            <Button variant="destructive" onClick={handleClear}>
                                <X className="w-4 h-4 mr-2" /> Cancel
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
