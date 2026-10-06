'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Save, Search, X, Plus, Minus, Trash2, Edit2, Eye } from 'lucide-react';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';

import { 
    useAttenLoginUserInitialData,
    useAttenLoginUserCourses,
    useAttenLoginUserBranches,
    useAttenLoginUserSemesters,
    useAttenLoginUserSave,
    useAttenLoginUserSubjects,
    useAttenLoginUserToggleStatus
} from '@/hooks/college/useAttenLoginUser';

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

export default function AttenLoginUserPage() {
    const [showForm, setShowForm] = useState(false);
    // Dropdowns and selections
    const [acaluId, setAcaluId] = useState(0);
    const [asmayId, setAsmayId] = useState('');
    const [hrmeId, setHrmeId] = useState('');
    const [amcoId, setAmcoId] = useState('');
    const [ambId, setAmbId] = useState('');

    const [yearList, setYearList] = useState<any[]>([]);
    const [staffList, setStaffList] = useState<any[]>([]);
    const [courseList, setCourseList] = useState<any[]>([]);
    const [branchList, setBranchList] = useState<any[]>([]);
    
    // Multi-select Lists
    const [sectionList, setSectionList] = useState<any[]>([]);
    const [semesterList, setSemesterList] = useState<any[]>([]);
    const [subjectList, setSubjectList] = useState<any[]>([]);

    // Filter values for multi-select
    const [sectionFilter, setSectionFilter] = useState('');
    const [semesterFilter, setSemesterFilter] = useState('');
    const [subjectFilter, setSubjectFilter] = useState('');

    // Temp List
    const [selectedTemp, setSelectedTemp] = useState<any[]>([]);

    // Main Grid List
    const [gridData, setGridData] = useState<any[]>([]);
    const [gridSearch, setGridSearch] = useState('');

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);

    // Modal
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalSubjects, setModalSubjects] = useState<any[]>([]);
    const [activeUserForModal, setActiveUserForModal] = useState<any>(null);

    const { data: initialData } = useAttenLoginUserInitialData();
    const fetchCoursesMutation = useAttenLoginUserCourses();
    const fetchBranchesMutation = useAttenLoginUserBranches();
    const fetchSemestersMutation = useAttenLoginUserSemesters();
    const saveMutation = useAttenLoginUserSave();
    const viewSubjectsMutation = useAttenLoginUserSubjects();
    const toggleStatusMutation = useAttenLoginUserToggleStatus();

    useEffect(() => {
        if (initialData?.data || initialData) {
            const res = initialData?.data || initialData;
            setYearList(res.yearlist || []);
            setStaffList(res.stafflist || []);
            setSectionList(res.sectionlist?.map((s: any) => ({ ...s, checked: false })) || []);
            setSubjectList(res.subjectlist?.map((s: any) => ({ ...s, checked: false })) || []);
            setGridData(res.saveddata || []);
        }
    }, [initialData]);

    const handleYearChange = (val: string) => {
        setAsmayId(val);
        setAmcoId('');
        fetchCoursesMutation.mutate({ ASMAY_Id: val }, {
            onSuccess: (res) => {
                const data = res?.data || res;
                setCourseList(data.courselist || []);
            }
        });
    };

    const handleCourseChange = (val: string) => {
        setAmcoId(val);
        setAmbId('');
        fetchBranchesMutation.mutate({ ASMAY_Id: asmayId, AMCO_Id: val }, {
            onSuccess: (res) => {
                const data = res?.data || res;
                setBranchList(data.branchlist || []);
            }
        });
    };

    const handleBranchChange = (val: string) => {
        setAmbId(val);
        fetchSemestersMutation.mutate({ ASMAY_Id: asmayId, AMCO_Id: amcoId, AMB_Id: val }, {
            onSuccess: (res) => {
                const data = res?.data || res;
                setSemesterList(data.semisterlist?.map((s: any) => ({ ...s, checked: false })) || []);
            }
        });
    };

    const handleAddTemp = () => {
        if (!asmayId || !hrmeId || !amcoId || !ambId) {
            toast.error('Please fill all required dropdowns');
            return;
        }

        const selectedSemesters = semesterList.filter(s => s.checked);
        const selectedSections = sectionList.filter(s => s.checked);
        const selectedSubjects = subjectList.filter(s => s.checked);

        if (selectedSemesters.length === 0) {
            toast.error('Please Select Atleast One Semester');
            return;
        }
        if (selectedSections.length === 0) {
            toast.error('Please Select Atleast One Section');
            return;
        }
        if (selectedSubjects.length === 0) {
            toast.error('Please Select Atleast One Subject');
            return;
        }

        const yearName = yearList.find(y => y.asmaY_Id == asmayId)?.asmaY_Year;
        const staffName = staffList.find(s => s.hrmE_Id == hrmeId)?.hrmE_EmployeeFirstName;
        const courseName = courseList.find(c => c.amcO_Id == amcoId)?.amcO_CourseName;
        const branchName = branchList.find(b => b.amB_Id == ambId)?.amB_BranchName;

        const newTemp = [...selectedTemp];

        selectedSemesters.forEach(sem => {
            selectedSections.forEach(sec => {
                const subjects = selectedSubjects.map(sub => ({ ISMS_Id: sub.ismS_Id, ISMS_SubjectName: sub.ismS_SubjectName }));
                
                const existingIndex = newTemp.findIndex(t => 
                    t.ASMAY_Id == asmayId && t.HRME_Id == hrmeId && t.AMCO_Id == amcoId && t.AMB_Id == ambId && t.AMSE_Id == sem.amsE_Id && t.ACMS_Id == sec.acmS_Id
                );

                if (existingIndex > -1) {
                    newTemp[existingIndex].subjects = subjects;
                } else {
                    newTemp.push({
                        ASMAY_Id: asmayId, ASMAY_Year: yearName,
                        HRME_Id: hrmeId, HRME_EmployeeFirstName: staffName,
                        AMCO_Id: amcoId, AMCO_CourseName: courseName,
                        AMB_Id: ambId, AMB_BranchName: branchName,
                        AMSE_Id: sem.amsE_Id, AMSE_SEMName: sem.amsE_SEMName,
                        ACMS_Id: sec.acmS_Id, ACMS_SectionName: sec.acmS_SectionName,
                        subjects: subjects
                    });
                }
            });
        });

        setSelectedTemp(newTemp);
        handleClearTemp();
    };

    const handleClearTemp = () => {
        if (selectedTemp.length === 0) {
            setAsmayId('');
            setHrmeId('');
            setCourseList([]);
        }
        setAmcoId('');
        setAmbId('');
        setBranchList([]);
        
        setSemesterList(prev => prev.map(s => ({ ...s, checked: false })));
        setSectionList(prev => prev.map(s => ({ ...s, checked: false })));
        setSubjectList(prev => prev.map(s => ({ ...s, checked: false })));
        
        setSemesterFilter('');
        setSectionFilter('');
        setSubjectFilter('');
    };

    const handleEditTemp = (row: any, index: number) => {
        handleClearTemp();
        setAsmayId(row.ASMAY_Id?.toString());
        setHrmeId(row.HRME_Id?.toString());
        
        fetchCoursesMutation.mutate({ ASMAY_Id: row.ASMAY_Id }, {
            onSuccess: (res) => {
                const data = res?.data || res;
                setCourseList(data.courselist || []);
                setAmcoId(row.AMCO_Id?.toString());
                
                fetchBranchesMutation.mutate({ ASMAY_Id: row.ASMAY_Id, AMCO_Id: row.AMCO_Id }, {
                    onSuccess: (res2) => {
                        const data2 = res2?.data || res2;
                        setBranchList(data2.branchlist || []);
                        setAmbId(row.AMB_Id?.toString());
                        
                        fetchSemestersMutation.mutate({ ASMAY_Id: row.ASMAY_Id, AMCO_Id: row.AMCO_Id, AMB_Id: row.AMB_Id }, {
                            onSuccess: (res3) => {
                                const data3 = res3?.data || res3;
                                const sList = data3.semisterlist || [];
                                setSemesterList(sList.map((s: any) => ({ ...s, checked: s.amsE_Id == row.AMSE_Id })));
                                
                                setSectionList(prev => prev.map(s => ({ ...s, checked: s.acmS_Id == row.ACMS_Id })));
                                setSubjectList(prev => prev.map(s => ({
                                    ...s,
                                    checked: row.subjects.some((sub: any) => sub.ISMS_Id == s.ismS_Id)
                                })));
                            }
                        });
                    }
                });
            }
        });
    };

    const handleDeleteTemp = (index: number) => {
        const newTemp = [...selectedTemp];
        newTemp.splice(index, 1);
        setSelectedTemp(newTemp);
        handleClearTemp();
    };

    const handleSaveData = () => {
        if (selectedTemp.length === 0) return;
        
        const details = selectedTemp.map(t => ({
            amcO_Id: t.AMCO_Id,
            amB_Id: t.AMB_Id,
            amsE_Id: t.AMSE_Id,
            acmS_Id: t.ACMS_Id,
            ismS_Ids: t.subjects.map((sub: any) => sub.ISMS_Id)
        }));

        const payload = {
            asmaY_Id: selectedTemp[0].ASMAY_Id,
            hrmE_Id: selectedTemp[0].HRME_Id,
            details: details
        };

        saveMutation.mutate(payload, {
            onSuccess: (res) => {
                const data = res?.data || res;
                if (data.returnval) {
                    toast.success(acaluId > 0 ? "Record Updated Successfully" : "Record Saved Successfully");
                } else {
                    toast.error(acaluId > 0 ? "Failed To Update Record" : "Failed To Save Record");
                }
                handleClearAll();
                if (data.saveddata) setGridData(data.saveddata);
            }
        });
    };

    const handleClearAll = () => {
        setAcaluId(0);
        setSelectedTemp([]);
        handleClearTemp();
        setAsmayId('');
        setHrmeId('');
    };

    const handleViewModal = (user: any) => {
        setActiveUserForModal(user);
        viewSubjectsMutation.mutate(user, {
            onSuccess: (res) => {
                const data = res?.data || res;
                setModalSubjects(data.subjectlist || []);
                setIsModalOpen(true);
            }
        });
    };

    const handleToggleStatus = (subject: any) => {
        const actionStr = subject.acalD_ActiveFlag ? 'Deactivate' : 'Activate';
        if (!confirm(`Are you sure you want to ${actionStr} this record?`)) return;
        
        toggleStatusMutation.mutate(subject, {
            onSuccess: (res) => {
                const data = res?.data || res;
                if (data.returnval) {
                    toast.success(`Record ${actionStr}d Successfully`);
                } else {
                    toast.error(`Record Not ${actionStr}d Successfully`);
                }
                
                if (activeUserForModal) {
                    handleViewModal(activeUserForModal);
                }
                handleClearAll();
            }
        });
    };

    const handleEditMainGrid = (user: any) => {
        viewSubjectsMutation.mutate(user, {
            onSuccess: (res) => {
                const data = res?.data || res;
                setAcaluId(user.acalU_Id);
                
                const selectedSubjects = data.subjectlist.filter((s: any) => s.acalD_ActiveFlag).map((s: any) => ({
                    ISMS_Id: s.ismS_Id, ISMS_SubjectName: s.ismS_SubjectName
                }));

                const newTempItem = {
                    ASMAY_Id: user.asmaY_Id, ASMAY_Year: user.asmaY_Year,
                    HRME_Id: user.hrmE_Id, HRME_EmployeeFirstName: user.hrmE_EmployeeFirstName,
                    AMCO_Id: user.amcO_Id, AMCO_CourseName: user.amcO_CourseName,
                    AMB_Id: user.amB_Id, AMB_BranchName: user.amB_BranchName,
                    AMSE_Id: user.amsE_Id, AMSE_SEMName: user.amsE_SEMName,
                    ACMS_Id: user.acmS_Id, ACMS_SectionName: user.acmS_SectionName,
                    subjects: selectedSubjects
                };

                setSelectedTemp([newTempItem]);
                
                setAsmayId(user.asmaY_Id?.toString());
                fetchCoursesMutation.mutate({ ASMAY_Id: user.asmaY_Id }, {
                    onSuccess: (res2) => {
                        const data2 = res2?.data || res2;
                        setCourseList(data2.courselist || []);
                        setHrmeId(user.hrmE_Id?.toString());
                    }
                });
            }
        });
    };

    // Filters for lists
    const filteredSections = sectionList.filter(s => s.acmS_SectionName?.toLowerCase().includes(sectionFilter.toLowerCase()));
    const filteredSemesters = semesterList.filter(s => s.amsE_SEMName?.toLowerCase().includes(semesterFilter.toLowerCase()));
    const filteredSubjects = subjectList.filter(s => s.ismS_SubjectName?.toLowerCase().includes(subjectFilter.toLowerCase()));

    const filteredGridData = gridData.filter(g => 
        g.asmaY_Year?.toLowerCase().includes(gridSearch.toLowerCase()) ||
        g.hrmE_EmployeeFirstName?.toLowerCase().includes(gridSearch.toLowerCase()) ||
        g.amcO_CourseName?.toLowerCase().includes(gridSearch.toLowerCase()) ||
        g.amB_BranchName?.toLowerCase().includes(gridSearch.toLowerCase()) ||
        g.amsE_SEMName?.toLowerCase().includes(gridSearch.toLowerCase()) ||
        g.acmS_SectionName?.toLowerCase().includes(gridSearch.toLowerCase())
    );

    const paginatedGridData = filteredGridData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    return (
        <div className="container mx-auto py-6 space-y-6">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold tracking-tight">Attendance Login User</h1>
                <p className="text-muted-foreground">Manage user mappings for attendance login.</p>
            </div>

            <div className="flex justify-end">
                <Button 
                    onClick={() => setShowForm(!showForm)} 
                    className="bg-[#f25e36] hover:bg-[#d64e29] text-white rounded-full px-6"
                >
                    {showForm ? <Minus className="w-4 h-4 mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
                    {showForm ? 'Close' : 'Add New Login User'}
                </Button>
            </div>

            {showForm && (
            <Card>
                <CardHeader>
                    <CardTitle>Attendance Login User Setup</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <div className="flex flex-col space-y-2">
                                <Label>Academic Year <span className="text-destructive">*</span></Label>
                                <Select value={asmayId} onValueChange={handleYearChange} disabled={selectedTemp.length > 0}>
                                    <SelectTrigger><SelectValue placeholder="Select Academic Year" /></SelectTrigger>
                                    <SelectContent>
                                        {yearList.map(y => (
                                            <SelectItem key={y.asmaY_Id} value={y.asmaY_Id?.toString()}>{y.asmaY_Year}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="flex flex-col space-y-2">
                                <Label>Staff Name <span className="text-destructive">*</span></Label>
                                <Select value={hrmeId} onValueChange={setHrmeId} disabled={selectedTemp.length > 0}>
                                    <SelectTrigger><SelectValue placeholder="Select Staff Name" /></SelectTrigger>
                                    <SelectContent>
                                        {staffList.map(s => (
                                            <SelectItem key={s.hrmE_Id} value={s.hrmE_Id?.toString()}>{s.hrmE_EmployeeFirstName}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="flex flex-col space-y-2">
                                <Label>Course <span className="text-destructive">*</span></Label>
                                <Select value={amcoId} onValueChange={handleCourseChange}>
                                    <SelectTrigger><SelectValue placeholder="Select Course" /></SelectTrigger>
                                    <SelectContent>
                                        {courseList.map(c => (
                                            <SelectItem key={c.amcO_Id} value={c.amcO_Id?.toString()}>{c.amcO_CourseName}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="flex flex-col space-y-2">
                                <Label>Branch <span className="text-destructive">*</span></Label>
                                <Select value={ambId} onValueChange={handleBranchChange}>
                                    <SelectTrigger><SelectValue placeholder="Select Branch" /></SelectTrigger>
                                    <SelectContent>
                                        {branchList.map(b => (
                                            <SelectItem key={b.amB_Id} value={b.amB_Id?.toString()}>{b.amB_BranchName}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="flex flex-col space-y-2">
                                <Label>Section <span className="text-destructive">*</span></Label>
                                <div className="border rounded-md p-2 h-40 overflow-y-auto space-y-2 bg-background">
                                    <Input placeholder="Search section..." value={sectionFilter} onChange={(e) => setSectionFilter(e.target.value)} className="h-8 mb-2" />
                                    <div className="flex items-center space-x-2 pb-2 border-b">
                                        <Checkbox 
                                            checked={sectionList.length > 0 && sectionList.every(s => s.checked)}
                                            onCheckedChange={(checked) => setSectionList(prev => prev.map(s => ({ ...s, checked: !!checked })))}
                                        />
                                        <Label>Select All</Label>
                                    </div>
                                    {filteredSections.map(sec => (
                                        <div key={sec.acmS_Id} className="flex items-center space-x-2">
                                            <Checkbox 
                                                checked={sec.checked}
                                                onCheckedChange={(checked) => setSectionList(prev => prev.map(s => s.acmS_Id === sec.acmS_Id ? { ...s, checked: !!checked } : s))}
                                            />
                                            <Label>{sec.acmS_SectionName}</Label>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <div className="flex flex-col space-y-2">
                                <Label>Semester <span className="text-destructive">*</span></Label>
                                <div className="border rounded-md p-2 h-40 overflow-y-auto space-y-2 bg-background">
                                    <Input placeholder="Search semester..." value={semesterFilter} onChange={(e) => setSemesterFilter(e.target.value)} className="h-8 mb-2" />
                                    <div className="flex items-center space-x-2 pb-2 border-b">
                                        <Checkbox 
                                            checked={semesterList.length > 0 && semesterList.every(s => s.checked)}
                                            onCheckedChange={(checked) => setSemesterList(prev => prev.map(s => ({ ...s, checked: !!checked })))}
                                        />
                                        <Label>Select All</Label>
                                    </div>
                                    {filteredSemesters.map(sem => (
                                        <div key={sem.amsE_Id} className="flex items-center space-x-2">
                                            <Checkbox 
                                                checked={sem.checked}
                                                onCheckedChange={(checked) => setSemesterList(prev => prev.map(s => s.amsE_Id === sem.amsE_Id ? { ...s, checked: !!checked } : s))}
                                            />
                                            <Label>{sem.amsE_SEMName}</Label>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <div className="space-y-4">
                            <div className="flex flex-col space-y-2">
                                <Label>Subject <span className="text-destructive">*</span></Label>
                                <div className="border rounded-md p-2 h-40 overflow-y-auto space-y-2 bg-background">
                                    <Input placeholder="Search subject..." value={subjectFilter} onChange={(e) => setSubjectFilter(e.target.value)} className="h-8 mb-2" />
                                    <div className="flex items-center space-x-2 pb-2 border-b">
                                        <Checkbox 
                                            checked={subjectList.length > 0 && subjectList.every(s => s.checked)}
                                            onCheckedChange={(checked) => setSubjectList(prev => prev.map(s => ({ ...s, checked: !!checked })))}
                                        />
                                        <Label>Select All</Label>
                                    </div>
                                    {filteredSubjects.map(sub => (
                                        <div key={sub.ismS_Id} className="flex items-center space-x-2">
                                            <Checkbox 
                                                checked={sub.checked}
                                                onCheckedChange={(checked) => setSubjectList(prev => prev.map(s => s.ismS_Id === sub.ismS_Id ? { ...s, checked: !!checked } : s))}
                                            />
                                            <Label>{sub.ismS_SubjectName}</Label>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-center gap-4 mt-6">
                        <Button onClick={handleAddTemp}>
                            <Plus className="w-4 h-4 mr-2" /> Add
                        </Button>
                        <Button variant="destructive" onClick={handleClearTemp}>
                            <X className="w-4 h-4 mr-2" /> Clear
                        </Button>
                    </div>

                    {selectedTemp.length > 0 && (
                        <div className="mt-8 space-y-4">
                            <h3 className="text-lg font-semibold border-b pb-2">Pending Details</h3>
                            <div className="rounded-md border overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="w-16">SL NO</TableHead>
                                            <TableHead>Academic Year</TableHead>
                                            <TableHead>Staff</TableHead>
                                            <TableHead>Course</TableHead>
                                            <TableHead>Branch</TableHead>
                                            <TableHead>Semester</TableHead>
                                            <TableHead>Section</TableHead>
                                            <TableHead>Subjects</TableHead>
                                            <TableHead className="text-center">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {selectedTemp.map((row, index) => (
                                            <TableRow key={index}>
                                                <TableCell>{index + 1}</TableCell>
                                                <TableCell>{row.ASMAY_Year}</TableCell>
                                                <TableCell>{row.HRME_EmployeeFirstName}</TableCell>
                                                <TableCell>{row.AMCO_CourseName}</TableCell>
                                                <TableCell>{row.AMB_BranchName}</TableCell>
                                                <TableCell>{row.AMSE_SEMName}</TableCell>
                                                <TableCell>{row.ACMS_SectionName}</TableCell>
                                                <TableCell>
                                                    {row.subjects.map((sub: any) => (
                                                        <div key={sub.ISMS_Id}>{sub.ISMS_SubjectName}</div>
                                                    ))}
                                                </TableCell>
                                                <TableCell className="text-center">
                                                    <div className="flex justify-center gap-2">
                                                        <Button variant="ghost" size="icon" onClick={() => handleEditTemp(row, index)}>
                                                            <Edit2 className="w-4 h-4 text-primary" />
                                                        </Button>
                                                        <Button variant="ghost" size="icon" onClick={() => handleDeleteTemp(index)}>
                                                            <Trash2 className="w-4 h-4 text-destructive" />
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                            <div className="flex justify-center gap-4 mt-6">
                                <Button onClick={handleSaveData} disabled={saveMutation.isPending}>
                                    <Save className="w-4 h-4 mr-2" /> Save
                                </Button>
                                <Button variant="outline" onClick={handleClearAll}>
                                    Cancel
                                </Button>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
            )}

            <Card>
                    <CardHeader>
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                            <CardTitle>Attendance Login User Details</CardTitle>
                            <div className="flex items-center gap-4">
                                <div className="text-sm font-medium">Total: <span className="badge bg-primary text-primary-foreground px-2 py-1 rounded">{filteredGridData.length}</span></div>
                                <Input 
                                    placeholder="Search here..." 
                                    value={gridSearch}
                                    onChange={(e) => setGridSearch(e.target.value)}
                                    className="w-64"
                                />
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="rounded-md border overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-16">SL.No.</TableHead>
                                        <TableHead>Academic Year</TableHead>
                                        <TableHead>Staff Name</TableHead>
                                        <TableHead>Course</TableHead>
                                        <TableHead>Branch</TableHead>
                                        <TableHead>Semester</TableHead>
                                        <TableHead>Section</TableHead>
                                        <TableHead className="text-center">Subjects</TableHead>
                                        <TableHead className="text-center">Action</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {paginatedGridData.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={9} className="text-center py-4">No records found</TableCell>
                                        </TableRow>
                                    ) : paginatedGridData.map((user, index) => (
                                        <TableRow key={user.acalU_Id}>
                                            <TableCell>{(currentPage - 1) * itemsPerPage + index + 1}</TableCell>
                                            <TableCell>{user.asmaY_Year}</TableCell>
                                            <TableCell>{user.hrmE_EmployeeFirstName}</TableCell>
                                            <TableCell>{user.amcO_CourseName}</TableCell>
                                            <TableCell>{user.amB_BranchName}</TableCell>
                                            <TableCell>{user.amsE_SEMName}</TableCell>
                                            <TableCell>{user.acmS_SectionName}</TableCell>
                                            <TableCell className="text-center">
                                                <Button variant="ghost" size="icon" onClick={() => handleViewModal(user)}>
                                                    <Eye className="w-4 h-4 text-purple-600" />
                                                </Button>
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <Button variant="ghost" size="icon" onClick={() => handleEditMainGrid(user)}>
                                                    <Edit2 className="w-4 h-4 text-primary" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                        {filteredGridData.length > 0 && (
                            <CustomPagination
                                currentPage={currentPage}
                                totalPages={Math.ceil(filteredGridData.length / itemsPerPage)}
                                onPageChange={setCurrentPage}
                            />
                        )}
                    </CardContent>
                </Card>

            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>Mapped Subjects</DialogTitle>
                    </DialogHeader>
                    <div className="py-4">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-16">SL.NO.</TableHead>
                                    <TableHead>Subject Name</TableHead>
                                    <TableHead className="text-center">Action</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {modalSubjects.map((sub, idx) => (
                                    <TableRow key={idx}>
                                        <TableCell>{idx + 1}</TableCell>
                                        <TableCell>{sub.ismS_SubjectName}</TableCell>
                                        <TableCell className="text-center">
                                            <Button 
                                                variant="ghost" 
                                                size="sm" 
                                                className={sub.acalD_ActiveFlag ? 'text-red-500' : 'text-green-500'}
                                                onClick={() => handleToggleStatus(sub)}
                                            >
                                                {sub.acalD_ActiveFlag ? 'Deactivate Now' : 'Activate Now'}
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                    <DialogFooter>
                        <Button variant="secondary" onClick={() => setIsModalOpen(false)}>Close</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
