'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Save, Search, X, Plus, Minus } from 'lucide-react';
import { toast } from 'sonner';

import { 
    useClgSeatDistributionInitialData,
    useClgSeatDistributionCourses,
    useClgSeatDistributionBranches,
    useClgSeatDistributionSemesters,
    useClgSeatDistributionCategories,
    useClgSeatDistributionSave
} from '@/hooks/college/useClgSeatDistribution';

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

export default function ClgSeatDistributionPage() {
    const [showForm, setShowForm] = useState(false);
    const [asmayId, setAsmayId] = useState('');
    const [amcoId, setAmcoId] = useState('');
    const [ambId, setAmbId] = useState('');
    
    const [yearList, setYearList] = useState<any[]>([]);
    const [courseList, setCourseList] = useState<any[]>([]);
    const [branchList, setBranchList] = useState<any[]>([]);
    const [branchDetails, setBranchDetails] = useState<any[]>([]);
    const [semesterList, setSemesterList] = useState<any[]>([]);
    const [sectionList, setSectionList] = useState<any[]>([]);
    const [acmsId, setAcmsId] = useState('');

    const [seatCategories, setSeatCategories] = useState<any[]>([]);
    
    // Grid Data
    const [gridData, setGridData] = useState<any[]>([]);
    const [gridSearch, setGridSearch] = useState('');
    
    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);

    const { data: initialData, refetch: refetchInitial } = useClgSeatDistributionInitialData();
    const fetchCoursesMutation = useClgSeatDistributionCourses();
    const fetchBranchesMutation = useClgSeatDistributionBranches();
    const fetchSemestersMutation = useClgSeatDistributionSemesters();
    const fetchCategoriesMutation = useClgSeatDistributionCategories();
    const saveMutation = useClgSeatDistributionSave();

    useEffect(() => {
        if (initialData?.data || initialData) {
            const res = initialData?.data || initialData;
            setYearList(res.yearlist || res.getYear || []);
            setCourseList(res.courselist || []);
            setBranchList(res.branchlist || []);
            setSemesterList(res.semisterlist?.map((s: any) => ({ ...s, checkedsub: true })) || []);
            setSectionList(res.sectionlist || []);
            setGridData(res.alldetails || res.getSeatsdetails || []);
        }
    }, [initialData]);

    const handleYearChange = (val: string) => {
        setAsmayId(val);
        setAmcoId('');
        setAmbId('');
        setBranchDetails([]);
        setSemesterList([]);
        setSeatCategories([]);

        fetchCoursesMutation.mutate({ ASMAY_Id: val }, {
            onSuccess: (res) => {
                const data = res?.data || res;
                const courses = Array.isArray(data) ? data : (data.courselist || data.getCourse || []);
                setCourseList(courses);
            }
        });
    };

    const handleCourseChange = (val: string) => {
        setAmcoId(val);
        setAmbId('');
        setBranchDetails([]);
        setSemesterList([]);
        setSeatCategories([]);

        fetchBranchesMutation.mutate({ ASMAY_Id: asmayId, AMCO_Id: val }, {
            onSuccess: (res) => {
                const data = res?.data || res;
                const branches = Array.isArray(data) ? data : (data.branchlist || data.getBranch || []);
                setBranchList(branches);
            }
        });
    };

    const handleBranchChange = (val: string) => {
        setAmbId(val);
        setSeatCategories([]);

        fetchSemestersMutation.mutate({ ASMAY_Id: asmayId, AMCO_Id: amcoId, AMB_Id: val }, {
            onSuccess: (res) => {
                const data = res?.data || res;
                setBranchDetails(data.branchdetails || data.getBranchDetails || []);
                const semesters = data.semisterlist || data.getSemester || [];
                setSemesterList(semesters.map((s: any) => ({ ...s, checkedsub: true })));
            }
        });
    };

    const handleSearchCategories = () => {
        if (!asmayId || !amcoId || !ambId) {
            toast.error('Please select Year, Course and Branch');
            return;
        }

        fetchCategoriesMutation.mutate({ ASMAY_Id: asmayId, AMCO_Id: amcoId, AMB_Id: ambId }, {
            onSuccess: (res) => {
                const data = res?.data || res;
                const categories = data.getSeatCategory || [];
                const savedDetails = data.getSeatsdetails1 || [];

                const mappedCategories = categories.map((cat: any) => {
                    const saved = savedDetails.find((s: any) => s.acQ_Id === cat.acQ_Id && s.acqC_Id === cat.acqC_Id);
                    if (saved) {
                        return {
                            ...cat,
                            xyz: true,
                            acscD_SeatPer: saved.acscD_SeatPer,
                            acscD_SeatNos: saved.acscD_SeatNos,
                            acscD_Remarks: saved.acscD_Remarks
                        };
                    }
                    return { ...cat, xyz: false, acscD_SeatPer: 0, acscD_SeatNos: 0, acscD_Remarks: '' };
                });

                if (mappedCategories.length === 0) {
                    toast.error('No categories found');
                }
                
                setSeatCategories(mappedCategories);
            }
        });
    };

    const toggleAllCategories = (checked: boolean) => {
        setSeatCategories(prev => prev.map(s => {
            if (!checked) return { ...s, xyz: false, acscD_SeatPer: 0, acscD_SeatNos: 0 };
            return { ...s, xyz: true };
        }));
    };

    const toggleCategory = (index: number, checked: boolean) => {
        setSeatCategories(prev => {
            const arr = [...prev];
            arr[index].xyz = checked;
            if (!checked) {
                arr[index].acscD_SeatPer = 0;
                arr[index].acscD_SeatNos = 0;
            }
            return arr;
        });
    };

    const updateCategoryPercent = (index: number, val: string) => {
        // Allow decimals
        if (!/^\d*\.?\d*$/.test(val)) return;
        
        const capacity = branchDetails.length > 0 ? branchDetails[0].amB_StudentCapacity : 0;
        
        setSeatCategories(prev => {
            const arr = [...prev];
            arr[index].acscD_SeatPer = val;
            
            const percentNum = parseFloat(val) || 0;
            arr[index].acscD_SeatNos = Math.round((capacity / 100) * percentNum);
            
            // Recalculate total seats to ensure it doesn't exceed capacity
            const totalSeats = arr.reduce((acc, curr) => acc + (curr.xyz ? (parseFloat(curr.acscD_SeatNos) || 0) : 0), 0);
            
            if (totalSeats > capacity) {
                toast.error(`Total Seats Available Is: ${capacity}. Selected Seats Are: ${totalSeats}`);
                arr[index].xyz = false;
                arr[index].acscD_SeatPer = 0;
                arr[index].acscD_SeatNos = 0;
            }

            return arr;
        });
    };

    const updateCategoryRemarks = (index: number, val: string) => {
        setSeatCategories(prev => {
            const arr = [...prev];
            arr[index].acscD_Remarks = val;
            return arr;
        });
    };

    const handleClear = () => {
        setAsmayId('');
        setAmcoId('');
        setAmbId('');
        setCourseList([]);
        setBranchList([]);
        setBranchDetails([]);
        setSemesterList([]);
        setSeatCategories([]);
    };

    const handleSave = () => {
        const selectedSeats = seatCategories.filter(s => s.xyz);
        if (selectedSeats.length === 0) {
            toast.error('Select Atleast One Category To Save Data!!!');
            return;
        }

        const invalidPercent = selectedSeats.some(s => !s.acscD_SeatPer || parseFloat(s.acscD_SeatPer) <= 0);
        if (invalidPercent) {
            toast.error('Please enter seat percentage more than 0%');
            return;
        }

        const selectedSemesters = semesterList.filter(s => s.checkedsub).map(s => s.amsE_Id);

        const payload = {
            asmaY_Id: parseInt(asmayId),
            amcO_Id: parseInt(amcoId),
            amB_Id: parseInt(ambId),
            amsE_Sem: selectedSemesters.map(id => parseInt(id)),
            seat_data: selectedSeats.map(s => ({
                acQ_Id: s.acQ_Id,
                acqC_Id: s.acqC_Id,
                acscD_SeatPer: parseFloat(s.acscD_SeatPer),
                acscD_SeatNos: parseFloat(s.acscD_SeatNos),
                acscD_Remarks: s.acscD_Remarks || ""
            }))
        };

        saveMutation.mutate(payload, {
            onSuccess: (res) => {
                const data = res?.data || res;
                if (data.returnval) {
                    toast.success("Record Saved/Updated Successfully");
                    handleClear();
                    refetchInitial();
                } else if (data.returnduplicatestatus === 'Duplicate') {
                    toast.error("Record already exist");
                } else {
                    toast.error("Failed to save, please contact administrator");
                }
            }
        });
    };

    const filteredGridData = gridData.filter(g => 
        (g.amcO_CourseName || '').toLowerCase().includes(gridSearch.toLowerCase()) ||
        (g.amB_BranchName || '').toLowerCase().includes(gridSearch.toLowerCase()) ||
        (g.amsE_SEMName || '').toLowerCase().includes(gridSearch.toLowerCase()) ||
        (g.acQ_QuotaName || '').toLowerCase().includes(gridSearch.toLowerCase()) ||
        (g.acqC_CategoryName || '').toLowerCase().includes(gridSearch.toLowerCase())
    );

    const paginatedGridData = filteredGridData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    const capacity = branchDetails.length > 0 ? branchDetails[0].amB_StudentCapacity : '';
    const aidedUnaided = branchDetails.length > 0 ? branchDetails[0].amB_AidedUnAided : '';

    return (
        <div className="container mx-auto py-6 space-y-6">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold tracking-tight">Seat Distribution</h1>
                <p className="text-muted-foreground">Manage and distribute quota seats across branches.</p>
            </div>

            <div className="flex justify-end">
                <Button 
                    onClick={() => setShowForm(!showForm)} 
                    className="bg-[#f25e36] hover:bg-[#d64e29] text-white rounded-full px-6"
                >
                    {showForm ? <Minus className="w-4 h-4 mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
                    {showForm ? 'Close' : 'Add New Seat Distribution'}
                </Button>
            </div>

            {showForm && (
            <Card>
                <CardHeader>
                    <CardTitle>Seat Distribution Filter</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <div className="flex flex-col space-y-2">
                                <Label>Academic Year <span className="text-destructive">*</span></Label>
                                <Select value={asmayId} onValueChange={handleYearChange}>
                                    <SelectTrigger><SelectValue placeholder="Select Year" /></SelectTrigger>
                                    <SelectContent>
                                        {yearList.map(y => (
                                            <SelectItem key={y.asmaY_Id} value={y.asmaY_Id?.toString()}>{y.asmaY_Year}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="flex flex-col space-y-2">
                                <Label>Course <span className="text-destructive">*</span></Label>
                                <Select value={amcoId} onValueChange={handleCourseChange} disabled={!asmayId}>
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
                                <Select value={ambId} onValueChange={handleBranchChange} disabled={!amcoId}>
                                    <SelectTrigger><SelectValue placeholder="Select Branch" /></SelectTrigger>
                                    <SelectContent>
                                        {branchList.map(b => (
                                            <SelectItem key={b.amB_Id} value={b.amB_Id?.toString()}>{b.amB_BranchName}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="flex flex-col space-y-2">
                                <Label>Section <span className="text-destructive">*</span></Label>
                                <Select value={acmsId} onValueChange={setAcmsId} disabled={!ambId}>
                                    <SelectTrigger><SelectValue placeholder="Select Section" /></SelectTrigger>
                                    <SelectContent>
                                        {sectionList.map(s => (
                                            <SelectItem key={s.acmS_Id} value={s.acmS_Id?.toString()}>{s.acmS_SectionName}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="flex flex-col space-y-2">
                                <Label>Branch Aided / UnAided <span className="text-destructive">*</span></Label>
                                <Input value={aidedUnaided} disabled placeholder="Auto-populated" />
                            </div>
                            <div className="flex flex-col space-y-2">
                                <Label>Total Strength <span className="text-destructive">*</span></Label>
                                <Input value={capacity} disabled placeholder="Auto-populated" />
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="flex flex-col space-y-2">
                                <Label>Semester's <span className="text-destructive">*</span></Label>
                                <div className="border rounded-md p-2 h-48 overflow-y-auto space-y-2 bg-muted/50">
                                    <div className="flex items-center space-x-2 pb-2 border-b">
                                        <Checkbox checked={semesterList.length > 0} disabled />
                                        <Label>All</Label>
                                    </div>
                                    {semesterList.map(sem => (
                                        <div key={sem.amsE_Id} className="flex items-center space-x-2">
                                            <Checkbox checked={sem.checkedsub} disabled />
                                            <Label>{sem.amsE_SEMName}</Label>
                                        </div>
                                    ))}
                                    {semesterList.length === 0 && <p className="text-sm text-muted-foreground pt-2">No semesters found. Please select a branch.</p>}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-center gap-4 mt-6">
                        <Button onClick={handleSearchCategories} disabled={fetchCategoriesMutation.isPending}>
                            <Search className="w-4 h-4 mr-2" /> Search
                        </Button>
                        <Button variant="destructive" onClick={handleClear}>
                            <X className="w-4 h-4 mr-2" /> Cancel
                        </Button>
                    </div>

                    {seatCategories.length > 0 && (
                        <div className="mt-8 space-y-4 slide-in-from-bottom-4 animate-in">
                            <h3 className="text-lg font-semibold border-b pb-2">Seat Categories</h3>
                            <div className="rounded-md border overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="w-16">SL.No.</TableHead>
                                            <TableHead className="w-12 text-center">
                                                <Checkbox 
                                                    checked={seatCategories.every(s => s.xyz)} 
                                                    onCheckedChange={(c) => toggleAllCategories(!!c)} 
                                                />
                                            </TableHead>
                                            <TableHead>Quota</TableHead>
                                            <TableHead>Quota Category</TableHead>
                                            <TableHead className="w-40 text-center">Percent (%)</TableHead>
                                            <TableHead className="w-40 text-center">Number</TableHead>
                                            <TableHead>Remarks</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {seatCategories.map((cat, index) => (
                                            <TableRow key={index}>
                                                <TableCell>{index + 1}</TableCell>
                                                <TableCell className="text-center">
                                                    <Checkbox 
                                                        checked={cat.xyz} 
                                                        onCheckedChange={(c) => toggleCategory(index, !!c)} 
                                                    />
                                                </TableCell>
                                                <TableCell>{cat.acQ_QuotaName}</TableCell>
                                                <TableCell>{cat.acqC_CategoryName}</TableCell>
                                                <TableCell>
                                                    <Input 
                                                        value={cat.acscD_SeatPer} 
                                                        onChange={(e) => updateCategoryPercent(index, e.target.value)}
                                                        disabled={!cat.xyz}
                                                        className="text-center"
                                                        placeholder="0"
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    <Input 
                                                        value={cat.acscD_SeatNos} 
                                                        disabled 
                                                        className="text-center"
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    <Input 
                                                        value={cat.acscD_Remarks || ''} 
                                                        onChange={(e) => updateCategoryRemarks(index, e.target.value)}
                                                        disabled={!cat.xyz}
                                                        placeholder="Remarks"
                                                    />
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                            
                            <div className="flex justify-center gap-4 mt-6">
                                <Button onClick={handleSave} disabled={saveMutation.isPending}>
                                    <Save className="w-4 h-4 mr-2" /> Save
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
                            <CardTitle>Seat Distribution List</CardTitle>
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
                                        <TableHead className="w-16">SL. No.</TableHead>
                                        <TableHead>Course</TableHead>
                                        <TableHead>Branch</TableHead>
                                        <TableHead>Semester</TableHead>
                                        <TableHead>Quota</TableHead>
                                        <TableHead>Quota Category</TableHead>
                                        <TableHead className="text-center">Percent (%)</TableHead>
                                        <TableHead className="text-center">Number</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {paginatedGridData.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={8} className="text-center py-4">No records found</TableCell>
                                        </TableRow>
                                    ) : paginatedGridData.map((seat, index) => (
                                        <TableRow key={index}>
                                            <TableCell>{(currentPage - 1) * itemsPerPage + index + 1}</TableCell>
                                            <TableCell>{seat.amcO_CourseName}</TableCell>
                                            <TableCell>{seat.amB_BranchName}</TableCell>
                                            <TableCell>{seat.amsE_SEMName}</TableCell>
                                            <TableCell>{seat.acQ_QuotaName}</TableCell>
                                            <TableCell>{seat.acqC_CategoryName}</TableCell>
                                            <TableCell className="text-center">{seat.acscD_SeatPer}</TableCell>
                                            <TableCell className="text-center">{seat.acscD_SeatNos}</TableCell>
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
        </div>
    );
}
