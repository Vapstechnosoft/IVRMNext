'use client';

import { Printer, Loader2, Check, Search, X, Users, Briefcase, Building2 } from 'lucide-react';
import { useRef, useState, useMemo, useEffect } from 'react';
import { useReactToPrint } from 'react-to-print';

import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/extension/field';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import {
    useStpeterEmployeeIdCardLoadData,
    useGetStpeterDepts,
    useGetStpeterDesig,
    useFilterStpeterEmployees,
    useGetStpeterEmployeeDetails
} from '@/hooks/admission/preadmission/reports/useStpeterEmployeeIdCard';

export default function EmployeeIDcardReportSTpeterPage() {
    const printRef = useRef<HTMLDivElement>(null);

    /* -------------------- Masters -------------------- */
    const { data: loadData, isLoading: isLoadDataLoading } = useStpeterEmployeeIdCardLoadData();

    /* -------------------- UI State -------------------- */
    const [groupTypes, setGroupTypes] = useState<any[]>([]);
    const [departments, setDepartments] = useState<any[]>([]);
    const [designations, setDesignations] = useState<any[]>([]);
    
    const [selectedGroupIds, setSelectedGroupIds] = useState<number[]>([]);
    const [selectedDeptIds, setSelectedDeptIds] = useState<number[]>([]);
    const [selectedDesigIds, setSelectedDesigIds] = useState<number[]>([]);

    const [employeeList, setEmployeeList] = useState<any[]>([]);
    const [selectedEmployeeIds, setSelectedEmployeeIds] = useState<number[]>([]);
    const [employeeSearch, setEmployeeSearch] = useState('');

    const [showReport, setShowReport] = useState(false);
    const [reportData, setReportData] = useState<any[]>([]);

    const deptMutation = useGetStpeterDepts();
    const desigMutation = useGetStpeterDesig();
    const filterMutation = useFilterStpeterEmployees();
    const detailsMutation = useGetStpeterEmployeeDetails();

    const formatIdList = (ids: number[]) => (ids.length === 0 ? [0] : ids);
    const getData = (res: any) => res?.data?.data || res?.data || res;

    /* -------------------- Initial Data -------------------- */
    useEffect(() => {
        const data = getData(loadData);
        if (data) {
            const groups = data.groupTypelist || [];
            const depts = data.departmentlist || [];
            const desigs = data.designationlist || [];

            setGroupTypes(groups);
            setDepartments(depts);
            setDesignations(desigs);

            // Default: Select all groups
            setSelectedGroupIds(groups.map((g: any) => g.hrmgT_Id));
            setSelectedDeptIds(depts.map((d: any) => d.hrmD_Id));
            setSelectedDesigIds(desigs.map((ds: any) => ds.hrmdeS_Id));
        }
    }, [loadData]);

    const updateDepartments = async (groupIds: number[]) => {
        try {
            const res = await deptMutation.mutateAsync({ hrmgT_IdList: formatIdList(groupIds) });
            const data = getData(res);
            const depts = Array.isArray(data?.departmentlist) ? data.departmentlist : [];
            setDepartments(depts);
            const allDeptIds = depts.map((d: any) => d.hrmD_Id);
            setSelectedDeptIds(allDeptIds);
            return allDeptIds;
        } catch (error) {
            toast.error('Failed to update departments');
            return [];
        }
    };

    const updateDesignations = async (groupIds: number[], deptIds: number[]) => {
        try {
            const res = await desigMutation.mutateAsync({ 
                hrmgT_IdList: formatIdList(groupIds), 
                hrmD_IdList: formatIdList(deptIds) 
            });
            const data = getData(res);
            const desigs = Array.isArray(data?.designationlist) ? data.designationlist : [];
            setDesignations(desigs);
            const allDesigIds = desigs.map((d: any) => d.hrmdeS_Id);
            setSelectedDesigIds(allDesigIds);
            return allDesigIds;
        } catch (error) {
            toast.error('Failed to update designations');
            return [];
        }
    };

    /* -------------------- Handlers -------------------- */
    const handleGroupToggle = async (id: number) => {
        const newGroupIds = selectedGroupIds.includes(id) 
            ? selectedGroupIds.filter(i => i !== id) 
            : [...selectedGroupIds, id];
        setSelectedGroupIds(newGroupIds);
        
        const newDeptIds = await updateDepartments(newGroupIds);
        await updateDesignations(newGroupIds, newDeptIds);
    };

    const handleDeptToggle = async (id: number) => {
        const newDeptIds = selectedDeptIds.includes(id) 
            ? selectedDeptIds.filter(i => i !== id) 
            : [...selectedDeptIds, id];
        setSelectedDeptIds(newDeptIds);
        await updateDesignations(selectedGroupIds, newDeptIds);
    };

    const handleSearchEmployees = async () => {
        try {
            const res = await filterMutation.mutateAsync({
                hrmgT_IdList: formatIdList(selectedGroupIds),
                hrmD_IdList: formatIdList(selectedDeptIds),
                hrmdeS_IdList: formatIdList(selectedDesigIds)
            });
            const data = getData(res);
            const employees = Array.isArray(data?.employeedropdown) ? data.employeedropdown : [];
            setEmployeeList(employees);
            if (employees.length === 0) toast.error('No employees found for this selection');
            else toast.success(`Found ${employees.length} employees`);
        } catch (error) {
            toast.error('Error filtering employees');
        }
    };

    const handleClear = () => {
        const data = getData(loadData);
        if (data) {
            const groups = data.groupTypelist || [];
            const depts = data.departmentlist || [];
            const desigs = data.designationlist || [];

            setGroupTypes(groups);
            setDepartments(depts);
            setDesignations(desigs);

            setSelectedGroupIds(groups.map((g: any) => g.hrmgT_Id));
            setSelectedDeptIds(depts.map((d: any) => d.hrmD_Id));
            setSelectedDesigIds(desigs.map((ds: any) => ds.hrmdeS_Id));
        }
        setEmployeeList([]);
        setSelectedEmployeeIds([]);
        setEmployeeSearch('');
        setShowReport(false);
        setReportData([]);
    };

    const handleShowDetails = async () => {
        if (selectedEmployeeIds.length === 0) {
            toast.error('Please select at least one employee');
            return;
        }

        try {
            const res = await detailsMutation.mutateAsync({ hrmE_multiId: selectedEmployeeIds });
            const data = getData(res);
            if (data?.arrayempsList?.length > 0) {
                setReportData(data.arrayempsList);
                setShowReport(true);
            } else {
                toast.error('Could not fetch employee details');
            }
        } catch (error) {
            toast.error('Failed to generate report');
        }
    };

    const handlePrint = useReactToPrint({
        contentRef: printRef,
        documentTitle: 'St_Peters_Employee_ID_Cards'
    });

    const filteredEmployees = useMemo(() => {
        return employeeList.filter(e => 
            `${e.hrmE_EmployeeFirstName} ${e.hrmE_EmployeeMiddleName || ''} ${e.hrmE_EmployeeLastName || ''}`.toLowerCase().includes(employeeSearch.toLowerCase())
        );
    }, [employeeList, employeeSearch]);

    return (
        <div className='min-h-screen p-4'>
        <CollapsibleSection
            title='Employee Profile Report'
            description="Generate printable ID cards for St. Peter's School employees"
            defaultOpen={true}
            variant='outline'
            className='shadow-lg'>

            <div className='p-6 space-y-6'>
                    {/* Multi-Select Filters Grid */}
                    <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
                        {/* Group Type */}
                        <div className='flex flex-col border border-blue-200 rounded-sm overflow-hidden h-[300px]'>
                            <div className='px-3 py-1.5 bg-white border-b border-blue-100 flex items-center justify-between'>
                                <Label className='text-[11px] font-bold text-slate-700'>
                                    Group Type:<span className='text-red-500'>*</span>
                                </Label>
                                <div className='flex items-center gap-1.5'>
                                    <Checkbox 
                                        id='grp-all'
                                        checked={selectedGroupIds.length === groupTypes.length && groupTypes.length > 0}
                                        onCheckedChange={async (checked) => {
                                            const ids = checked ? groupTypes.map(g => g.hrmgT_Id) : [];
                                            setSelectedGroupIds(ids);
                                            const newDepts = await updateDepartments(ids);
                                            await updateDesignations(ids, newDepts);
                                        }}
                                        className='h-3.5 w-3.5 rounded-none border-slate-400'
                                    />
                                    <Label htmlFor='grp-all' className='text-[10px] font-bold text-slate-500'>All</Label>
                                </div>
                            </div>
                            <ScrollArea className='flex-grow bg-white'>
                                <div className='p-1'>
                                    {groupTypes.map((g: any) => (
                                        <div 
                                            key={g.hrmgT_Id} 
                                            className='flex items-center space-x-2 px-3 py-1 hover:bg-blue-50/50 cursor-pointer transition-colors group'
                                            onClick={() => handleGroupToggle(g.hrmgT_Id)}>
                                            <Checkbox 
                                                checked={selectedGroupIds.includes(g.hrmgT_Id)} 
                                                className='h-3 w-3 rounded-none border-slate-300 data-[state=checked]:bg-[#3f51b5] data-[state=checked]:border-[#3f51b5]'
                                            />
                                            <span className='text-[10px] font-medium text-slate-600 group-hover:text-blue-700'>{g.hrmgT_EmployeeGroupType}</span>
                                        </div>
                                    ))}
                                </div>
                            </ScrollArea>
                        </div>

                        {/* Department */}
                        <div className='flex flex-col border border-blue-200 rounded-sm overflow-hidden h-[300px]'>
                            <div className='px-3 py-1.5 bg-white border-b border-blue-100 flex items-center justify-between'>
                                <Label className='text-[11px] font-bold text-slate-700'>
                                    Department:<span className='text-red-500'>*</span>
                                </Label>
                                <div className='flex items-center gap-1.5'>
                                    <Checkbox 
                                        id='dept-all'
                                        checked={selectedDeptIds.length === departments.length && departments.length > 0}
                                        onCheckedChange={async (checked) => {
                                            const ids = checked ? departments.map(d => d.hrmD_Id) : [];
                                            setSelectedDeptIds(ids);
                                            await updateDesignations(selectedGroupIds, ids);
                                        }}
                                        className='h-3.5 w-3.5 rounded-none border-slate-400'
                                    />
                                    <Label htmlFor='dept-all' className='text-[10px] font-bold text-slate-500'>All</Label>
                                </div>
                            </div>
                            <ScrollArea className='flex-grow bg-white'>
                                <div className='p-1'>
                                    {departments.map((d: any) => (
                                        <div 
                                            key={d.hrmD_Id} 
                                            className='flex items-center space-x-2 px-3 py-1 hover:bg-blue-50/50 cursor-pointer transition-colors group'
                                            onClick={() => handleDeptToggle(d.hrmD_Id)}>
                                            <Checkbox 
                                                checked={selectedDeptIds.includes(d.hrmD_Id)} 
                                                className='h-3 w-3 rounded-none border-slate-300 data-[state=checked]:bg-[#3f51b5] data-[state=checked]:border-[#3f51b5]'
                                            />
                                            <span className='text-[10px] font-medium text-slate-600 group-hover:text-blue-700'>{d.hrmD_DepartmentName}</span>
                                        </div>
                                    ))}
                                </div>
                            </ScrollArea>
                        </div>

                        {/* Designation */}
                        <div className='flex flex-col border border-blue-200 rounded-sm overflow-hidden h-[300px]'>
                            <div className='px-3 py-1.5 bg-white border-b border-blue-100 flex items-center justify-between'>
                                <Label className='text-[11px] font-bold text-slate-700'>
                                    Designation:<span className='text-red-500'>*</span>
                                </Label>
                                <div className='flex items-center gap-1.5'>
                                    <Checkbox 
                                        id='desig-all'
                                        checked={selectedDesigIds.length === designations.length && designations.length > 0}
                                        onCheckedChange={(checked) => {
                                            const ids = checked ? designations.map(d => d.hrmdeS_Id) : [];
                                            setSelectedDesigIds(ids);
                                        }}
                                        className='h-3.5 w-3.5 rounded-none border-slate-400'
                                    />
                                    <Label htmlFor='desig-all' className='text-[10px] font-bold text-slate-500'>All</Label>
                                </div>
                            </div>
                            <ScrollArea className='flex-grow bg-white'>
                                <div className='p-1'>
                                    {designations.map((d: any) => (
                                        <div 
                                            key={d.hrmdeS_Id} 
                                            className='flex items-center space-x-2 px-3 py-1 hover:bg-blue-50/50 cursor-pointer transition-colors group'
                                            onClick={() => setSelectedDesigIds(prev => prev.includes(d.hrmdeS_Id) ? prev.filter(i => i !== d.hrmdeS_Id) : [...prev, d.hrmdeS_Id])}>
                                            <Checkbox 
                                                checked={selectedDesigIds.includes(d.hrmdeS_Id)} 
                                                className='h-3 w-3 rounded-none border-slate-300 data-[state=checked]:bg-[#3f51b5] data-[state=checked]:border-[#3f51b5]'
                                            />
                                            <span className='text-[10px] font-medium text-slate-600 group-hover:text-blue-700'>{d.hrmdeS_DesignationName}</span>
                                        </div>
                                    ))}
                                </div>
                            </ScrollArea>
                        </div>
                    </div>

                    <div className='flex justify-center border-t pt-6 gap-3'>
                        <Button
                            size='sm'
                            onClick={handleSearchEmployees}
                            disabled={filterMutation.isPending}
                            className='min-w-[120px] bg-[#3f51b5] hover:bg-[#303f9f] rounded-sm font-bold text-[11px] h-9 shadow-sm uppercase'>
                            {filterMutation.isPending ? <Loader2 className='animate-spin mr-2 h-4 w-4' /> : <Search className='mr-2 h-4 w-4' />}
                            SEARCH
                        </Button>
                        <Button
                            size='sm'
                            variant='destructive'
                            onClick={handleClear}
                            className='min-w-[120px] bg-[#ff5722] hover:bg-[#e64a19] rounded-sm font-bold text-[11px] h-9 shadow-sm uppercase'>
                            <X className='mr-2 h-4 w-4' />
                            CANCEL
                        </Button>
                    </div>

                    {/* Employee List Section */}
                    {employeeList.length > 0 && (
                        <div className='space-y-4 max-w-4xl mx-auto border-t pt-8'>
                            <div className='flex items-center justify-between px-2'>
                                <Label className='text-xs font-bold text-slate-700 uppercase'>1. Select Employees</Label>
                                <div className='flex items-center space-x-2 bg-slate-50 px-3 py-1 border rounded-sm'>
                                    <Checkbox 
                                        id='sel-all-emp' 
                                        checked={selectedEmployeeIds.length === employeeList.length}
                                        onCheckedChange={(checked) => setSelectedEmployeeIds(checked ? employeeList.map(e => e.hrmE_Id) : [])}
                                        className='h-3.5 w-3.5 rounded-none border-slate-400'
                                    />
                                    <Label htmlFor='sel-all-emp' className='font-bold text-[10px] text-slate-500'>SELECT ALL</Label>
                                </div>
                            </div>
                            <div className='relative max-w-md'>
                                <Search className='absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400' />
                                <Input 
                                    className='pl-10 h-9 rounded-sm text-[11px] border-slate-200 focus:ring-0 focus:border-[#3f51b5]' 
                                    placeholder='Search employee by name...' 
                                    value={employeeSearch}
                                    onChange={(e) => setEmployeeSearch(e.target.value)}
                                />
                                {employeeSearch && <X className='absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 cursor-pointer' onClick={() => setEmployeeSearch('')} />}
                            </div>
                            <ScrollArea className='h-[300px] border border-blue-100 rounded-sm p-1 bg-white'>
                                <div className='grid grid-cols-1 md:grid-cols-2 gap-1'>
                                    {filteredEmployees.map((e: any) => (
                                        <div 
                                            key={e.hrmE_Id}
                                            onClick={() => setSelectedEmployeeIds(prev => prev.includes(e.hrmE_Id) ? prev.filter(i => i !== e.hrmE_Id) : [...prev, e.hrmE_Id])}
                                            className={cn(
                                                'flex items-center space-x-3 p-2 rounded-sm cursor-pointer transition-all border group',
                                                selectedEmployeeIds.includes(e.hrmE_Id) ? 'bg-blue-50 border-blue-200 text-blue-700' : 'bg-white border-transparent hover:border-slate-100 hover:bg-slate-50'
                                            )}>
                                            <Checkbox 
                                                checked={selectedEmployeeIds.includes(e.hrmE_Id)} 
                                                className='h-3 w-3 rounded-none border-slate-300 data-[state=checked]:bg-[#3f51b5] data-[state=checked]:border-[#3f51b5]'
                                            />
                                            <div className='flex flex-col'>
                                                <span className='text-[10px] font-bold uppercase'>{e.hrmE_EmployeeFirstName} {e.hrmE_EmployeeLastName}</span>
                                                <span className='text-[9px] opacity-60'>Code: {e.hrmE_EmployeeCode || 'N/A'}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </ScrollArea>

                            {/* Final Action Buttons */}
                            <div className='flex justify-center gap-4 pt-4'>
                                <Button
                                    size='sm'
                                    onClick={handleShowDetails}
                                    disabled={detailsMutation.isPending}
                                    className='min-w-[140px] bg-slate-700 hover:bg-slate-800 rounded-sm font-bold text-[11px] h-9 shadow-sm'>
                                    {detailsMutation.isPending ? <Loader2 className='animate-spin' /> : 'SHOW CARDS'}
                                </Button>
                                <Button
                                    size='sm'
                                    onClick={handlePrint}
                                    disabled={!showReport}
                                    className='min-w-[140px] bg-[#3f51b5] hover:bg-[#303f9f] rounded-sm font-bold text-[11px] h-9 shadow-sm'>
                                    <Printer className='mr-2 h-4 w-4' />
                                    PRINT
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            </CollapsibleSection>

            {/* Print Preview */}
            {showReport && reportData.length > 0 && (
                <div className='mt-8 flex flex-col items-center bg-slate-100 p-10 rounded-[40px] border-2 border-dashed border-slate-300 overflow-auto'>
                    <div ref={printRef} className='flex flex-wrap justify-center gap-8 bg-white p-10 printable-content shadow-2xl'>
                        {reportData.map((single: any, index: number) => (
                            <div key={index} className="id-card-wrapper">
                                <div className="id-card">
                                    <div className="top-blue">
                                        <div className="school-logo-container">
                                            <img src="https://dcampusstrg.blob.core.windows.net/files/17/ISM_Attachments/5c2382c2-78ff-4a46-8b4b-3e120cf31216.png" alt="School Logo" />
                                            <div className="school-name-style">
                                                St. Peter&apos;s School
                                            </div>
                                        </div>
                                        <div className="subtitle-style">
                                            UNDER THE DIOCESE OF DURGAPUR, (CHURCH OF NORTH INDIA)<br />
                                            Affiliated to the Council for the Indian School Certificate Examination, New Delhi<br />
                                            School Code : WB065
                                        </div>
                                    </div>

                                    <div className="photo-container">
                                        <img src={single.empdetails?.hrmE_Photo || "https://vapsclg.blob.core.windows.net/files/76/NoticeUpload/d120170c-fbbf-48c2-b675-ef8d053a0d03.jpg"} alt="Employee Photo" />
                                    </div>

                                    <div className="info-area">
                                        <div className="info-row">
                                            <span className="info-label">Name : </span>
                                            <span className="info-value name-highlight">
                                                {single.empdetails?.hrmE_EmployeeFirstName} {single.empdetails?.hrmE_EmployeeMiddleName || ''} {single.empdetails?.hrmE_EmployeeLastName}
                                            </span>
                                        </div>
                                        <div className="info-row">
                                            <span className="info-label">Designation : </span>
                                            <span className="info-value italic">{single.empdetails?.hrmdeS_DesignationName || 'Employee'}</span>
                                        </div>
                                        <div className="info-row">
                                            <span className="info-label">Address : </span>
                                            <span className="info-value text-xs line-clamp-2">{single.empdetails?.hrmE_PerStreet || 'Durgapur, West Bengal'}</span>
                                        </div>
                                        <div className="info-row">
                                            <span className="info-label">Blood Group : </span>
                                            <span className="info-value">{single.empdetails?.hrmE_BloodGroup || 'N/A'}</span>
                                        </div>
                                        <div className="info-row">
                                            <span className="info-label">Emg. Con. No. : </span>
                                            <span className="info-value">{single.empdetails?.hrmE_MobileNo || 'XXXXXXXXXX'}</span>
                                        </div>
                                    </div>

                                    <div className="id-card-footer">
                                        MIRABAI ROAD, DURGAPUR-713204 PHONE : 0343-2564132 / 2663994
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <style jsx global>{`
                @import url('https://fonts.googleapis.com/css2?family=UnifrakturCook:wght@700&display=swap');

                .id-card-wrapper {
                   page-break-inside: avoid;
                }

                .id-card {
                    position: relative;
                    width: 350px;
                    height: 535px;
                    background: linear-gradient(211deg, transparent 48%, black 43%, black 78%, transparent 60%), 
                                linear-gradient(149deg, transparent 48%, black 33%, black 60%, transparent 60%), 
                                linear-gradient(142deg, #2DBDE6 55%, transparent 46%), 
                                linear-gradient(165deg, black, black 114%);
                    box-shadow: 3px 3px 15px rgba(0,0,0,0.5);
                    border-radius: 12px;
                    color: white;
                    overflow: hidden;
                    font-family: Arial, sans-serif;
                }

                .id-card::before {
                    content: "";
                    position: absolute;
                    top: 38%;
                    left: -15px;
                    width: 160px;
                    border-top: 2px dashed rgba(255,255,255,0.4);
                    transform: rotate(31deg);
                    pointer-events: none;
                }

                .id-card::after {
                    content: "";
                    position: absolute;
                    top: 36%;
                    left: 255px;
                    width: 110px;
                    border-top: 2px dashed rgba(255,255,255,0.4);
                    transform: rotate(-31deg);
                    pointer-events: none;
                }

                .top-blue {
                    background-color: #2dbde4;
                    height: 140px;
                    padding: 10px;
                    text-align: center;
                }

                .school-logo-container img {
                    width: 45px;
                    height: auto;
                    margin: 0 auto;
                }

                .school-name-style {
                    font-family: 'UnifrakturCook', cursive;
                    font-size: 32px;
                    line-height: 1;
                    margin-top: 5px;
                    text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
                }

                .subtitle-style {
                    font-size: 8.5px;
                    font-weight: 800;
                    line-height: 1.2;
                    margin-top: 8px;
                    color: rgba(255,255,255,0.95);
                    text-align: center;
                    text-transform: uppercase;
                }

                .photo-container {
                    margin: 15px auto;
                    width: 160px;
                    height: 180px;
                    clip-path: polygon( 50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25% );
                    background: white;
                    border: 3px solid #003366;
                    position: relative;
                    z-index: 10;
                    box-shadow: 0 5px 15px rgba(0,0,0,0.3);
                }

                .photo-container img {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                }

                .info-area {
                    margin: 20px 25px;
                    font-size: 14px;
                    line-height: 1.4;
                }

                .info-row {
                    display: flex;
                    margin-bottom: 8px;
                    justify-content: flex-start;
                }

                .info-label {
                    width: 110px;
                    font-weight: 800;
                    color: #2dbde4;
                    font-size: 12px;
                    text-transform: uppercase;
                }

                .info-value {
                    flex: 1;
                    font-weight: 600;
                    letter-spacing: 0.5px;
                }

                .name-highlight {
                    color: #f1a311;
                    font-size: 16px;
                    font-weight: 900;
                    text-transform: uppercase;
                    border-bottom: 1px solid rgba(241, 163, 17, 0.3);
                }

                .id-card-footer {
                    position: absolute;
                    bottom: 0;
                    width: 100%;
                    background-color: #2dbde4;
                    padding: 8px;
                    font-size: 10px;
                    font-weight: 900;
                    text-align: center;
                    letter-spacing: 1px;
                }

                @media print {
                    .printable-content {
                        width: 100% !important;
                        padding: 0 !important;
                        gap: 20px !important;
                        box-shadow: none !important;
                    }
                    @page {
                        size: A4;
                        margin: 10mm;
                    }
                    .id-card {
                        box-shadow: none !important;
                        border: 1px solid #000;
                        -webkit-print-color-adjust: exact !important;
                        print-color-adjust: exact !important;
                    }
                }
            `}</style>
        </div>
    );
}
