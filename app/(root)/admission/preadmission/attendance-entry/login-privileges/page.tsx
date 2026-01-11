'use client';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { GenericDataTable } from '@/components/ui/data-table/generic-data-table';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { FormProvider, useFormContext } from '@/components/ui/form/form-provider';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useGetLoginPrivilegeEmployees, useLoginPrivileges } from '@/hooks/admission/preadmission/useLoginPrivilege';
import {
    useAcademicYearDropdown,
    useMasterClassDropdown,
    useMasterSectionDropdown,
    useMasterSubjectDropdown
} from '@/hooks/admission/preadmission/useMasters';
import type { ILoginPrivilege, ILoginPrivilegeDTO } from '@/types/admission/preadmission/login_privilege';
import { Loader2, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { loginPrivilegeColumns } from './_components/columns';

export default function LoginPrivilegePage() {
    return (
        <FormProvider<ILoginPrivilege>>
            <LoginPrivilegePageContent />
        </FormProvider>
    );
}

function LoginPrivilegePageContent() {
    const { data: initialData, isLoading, refetch, createPrivilege, fetchDataByType, isSearching } = useLoginPrivileges();
    const [showList, setShowList] = useState(false);

    // State for Table Data
    const [tableData, setTableData] = useState<any[]>([]);

    // Sync initial data
    useEffect(() => {
        if (initialData) {
            const data = Array.isArray(initialData) ? initialData : (initialData as any)?.data || [];
            setTableData(data);
            setShowList(true);
        }
    }, [initialData]);

    const tableProps = {
        data: tableData,
        totalItems: tableData.length,
        isLoading,
        error: null,
        success: true
    };

    return (
        <div className='min-h-screen'>
            <div className='container space-y-4 p-1'>
                <PrivilegeForm
                    createPrivilege={createPrivilege}
                    refetch={refetch}
                    fetchDataByType={fetchDataByType}
                    isSearching={isSearching}
                    onSearchSuccess={(data) => {
                        setTableData(data);
                        setShowList(true);
                    }}
                />

                {showList && (
                    <CollapsibleSection
                        defaultOpen={true}
                        title='ATTENDANCE LOGIN PRIVILEGES LIST'
                        variant='default'
                        size='lg'
                        className='shadow-lg transition-shadow duration-300 hover:shadow-xl'>
                        <GenericDataTable<ILoginPrivilege>
                            {...tableProps}
                            columns={loginPrivilegeColumns}
                            isLoading={isLoading}
                            showViewOptions={false}
                            columnPinning={{ right: ['actions'] }}
                            loadingMessage='Loading privileges...'
                            noDataTitle='No Privileges Found'
                            noDataDescription='Assign first privilege'
                        />
                    </CollapsibleSection>
                )}
            </div>
        </div>
    );
}

interface PrivilegeFormProps {
    createPrivilege: (data: ILoginPrivilegeDTO) => Promise<any>;
    refetch: () => void;
    fetchDataByType: (data: any) => Promise<any>;
    isSearching: boolean;
    onSearchSuccess: (data: any[]) => void;
}

function PrivilegeForm({ createPrivilege, refetch, fetchDataByType, isSearching, onSearchSuccess }: PrivilegeFormProps) {
    const { selectedRow, closeEditForm } = useFormContext<ILoginPrivilege>();

    // ... existing state ...
    const [role, setRole] = useState<string>('class_teacher');
    const [selectedYearId, setSelectedYearId] = useState<string>('');
    const [selectedStaffId, setSelectedStaffId] = useState<string>('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Visibility State for Mapping
    const [showMapping, setShowMapping] = useState(false);

    // Selection State
    const [selectedClassSections, setSelectedClassSections] = useState<string[]>([]);
    const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);

    // ... hooks ...

    // Data Hooks
    const { data: yearData } = useAcademicYearDropdown();
    const MI_ID = 30; // Hardcoded MI_ID
    const { data: staffData } = useGetLoginPrivilegeEmployees();
    const { data: classData } = useMasterClassDropdown();
    const { data: sectionData } = useMasterSectionDropdown();
    const { data: subjectData } = useMasterSubjectDropdown(MI_ID);

    // Derived Lists
    // Derived Lists with Safe Array Checks
    const academicYears = Array.isArray((yearData as any)?.data) ? (yearData as any)?.data : Array.isArray(yearData) ? yearData : [];

    const staffList = Array.isArray((staffData as any)?.employeeList)
        ? (staffData as any)?.employeeList
        : Array.isArray((staffData as any)?.data?.employeeList)
          ? (staffData as any)?.data?.employeeList
          : [];

    // Removed unused classes/sections derivations if strictly relying on search results

    // State for Mapping Lists (populated from Search)
    const [classSectionList, setMappingClassSections] = useState<any[]>([]);
    const [subjects, setMappingSubjects] = useState<any[]>([]);

    // Handle Edit Mode Population
    useEffect(() => {
        if (selectedRow) {
            // Populate form when editing
            if (selectedRow.asmaY_Id) setSelectedYearId(String(selectedRow.asmaY_Id));
            if (selectedRow.hrmE_Id) setSelectedStaffId(String(selectedRow.hrmE_Id));
            if (selectedRow.lp_role) {
                // Map display role back to value key
                if (selectedRow.lp_role === 'Class Teacher') setRole('class_teacher');
                else if (selectedRow.lp_role === 'Subject Teacher') setRole('subject_teacher');
                else setRole('others');
            }
            setShowMapping(true); // Auto-show mapping on edit
        }
    }, [selectedRow]);

    const handleClassSectionToggle = (id: string) => {
        setSelectedClassSections((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
    };

    const handleSubjectToggle = (id: string) => {
        setSelectedSubjects((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
    };
    const handleSearch = async () => {
        if (!selectedYearId) {
            toast.error('Please select Academic Year');
            return;
        }

        try {
            // Map Role to ASALU_EntryTypeFlag
            let entryTypeFlag = 0;
            // Subject Teacher = 0, Class Teacher = 1, Others = 2
            if (role === 'subject_teacher') entryTypeFlag = 0;
            else if (role === 'class_teacher') entryTypeFlag = 1;
            else if (role === 'others') entryTypeFlag = 2;

            const searchPayload = {
                ASMAY_Id: Number(selectedYearId),
                ASALU_EntryTypeFlag: entryTypeFlag
            };

            console.log('Searching with payload:', searchPayload);

            const result = await fetchDataByType(searchPayload);
            console.log('Search Response Raw:', result);

            // Handle various response structures
            // Ensure we extract the inner 'data' object correctly
            // If result has 'classSectionList' directly, use result.
            // If result.data has it, use result.data.
            // If result.data.data has it, use result.data.data.

            let data: any = null;
            if (result && Array.isArray(result.classSectionList)) {
                data = result;
            } else if (result?.data && Array.isArray(result.data.classSectionList)) {
                data = result.data;
            } else if (result?.data?.data && Array.isArray(result.data.data.classSectionList)) {
                data = result.data.data;
            } else {
                // Fallback to previous logic if array check fails (maybe it's null but exists?)
                data = (result as any)?.data?.data || (result as any)?.data || result;
            }

            console.log('Extracted Data Object:', data);

            if (data) {
                // 1. Populate Available Class-Sections
                let csList: any[] = [];
                console.log('Raw classSectionList:', data.classSectionList);

                if (Array.isArray(data.classSectionList)) {
                    const seenIds = new Set();
                    csList = data.classSectionList.reduce((acc: any[], item: any) => {
                        const uniqueId = `${item.asmcL_Id}-${item.asmC_Id}`;
                        if (!seenIds.has(uniqueId)) {
                            seenIds.add(uniqueId);
                            acc.push({
                                id: uniqueId, // Unique ID
                                label: item.name || `${item.asmcL_ClassName || ''} : ${item.asmC_SectionName || ''}`,
                                classId: item.asmcL_Id,
                                sectionId: item.asmC_Id,
                                nameRaw: item.name // Store for matching
                            });
                        }
                        return acc;
                    }, []);
                    setMappingClassSections(csList);
                    console.log('Mapped csList (Unique):', csList);
                } else {
                    console.warn('classSectionList is NOT an array');
                    setMappingClassSections([]);
                }

                // 2. Populate Available Subjects
                if (Array.isArray(data.subjectList)) {
                    setMappingSubjects(data.subjectList);
                } else {
                    setMappingSubjects([]);
                }

                // 3. Populate Grid Table with Existing Privileges
                let existingPrivileges: any[] = [];
                if (Array.isArray(data.loginPrivileges)) {
                    existingPrivileges = data.loginPrivileges;
                    onSearchSuccess(existingPrivileges);
                } else {
                    onSearchSuccess([]);
                }

                // 4. Pre-select Checkboxes ("Remember all fields")
                // User requested NO pre-selection: "nothing should be selected bydeafult"
                setSelectedClassSections([]);

                // const preSelectedIds: string[] = [];

                // if (existingPrivileges.length > 0 && csList.length > 0) {
                //     existingPrivileges.forEach((priv: any) => {
                //         // Construct the name signature to match 'name' in classSectionList
                //         const constructName = `${priv.asmcL_ClassName} - ${priv.asmC_SectionName}`;

                //         // Find matching item in csList
                //         const match = csList.find(c => c.nameRaw === constructName || c.nameRaw === constructName.trim());
                //         if (match) {
                //             preSelectedIds.push(match.id);
                //         }
                //     });
                // }

                // Set the selected IDs
                // setSelectedClassSections(preSelectedIds);
                // console.log('Pre-selected IDs:', preSelectedIds);

                // If finding matches for Subject mapping (tempList)
                // If Role is Subject Teacher, we might need to populate tempList differently
                // But for now, user focus seems to be Class Teacher/Others class mapping

                toast.success('Data fetched successfully');
                setShowMapping(true);
            }
        } catch (e) {
            console.error('Search Error:', e);
            toast.error('Failed to fetch data');
        }
    };

    // Temp List for Subject Teacher Batching
    const [tempList, setTempList] = useState<
        {
            id: string; // Unique ID for removal
            classSectionId: string;
            classSectionLabel: string;
            subjectId: string;
            subjectLabel: string;
            asmcL_Id: number;
            asmS_Id: number;
            ismS_Id: number;
        }[]
    >([]);

    const handleAdd = () => {
        if (selectedClassSections.length === 0) {
            toast.error('Please select at least one Class-Section');
            return;
        }
        if (selectedSubjects.length === 0) {
            toast.error('Please select at least one Subject');
            return;
        }

        const newItems: typeof tempList = [];

        selectedClassSections.forEach((csId) => {
            const csObj = classSectionList.find((x) => x.id === csId);
            if (!csObj) return;

            selectedSubjects.forEach((subId) => {
                const subObj = subjects.find((x: any) => String(x.ismS_Id) === subId);
                if (!subObj) return;

                // Avoid Duplicates in Temp List
                const exists =
                    tempList.some((x) => x.classSectionId === csId && x.subjectId === subId) ||
                    newItems.some((x) => x.classSectionId === csId && x.subjectId === subId);

                if (!exists) {
                    newItems.push({
                        id: `${csId}-${subId}-${Date.now()}`,
                        classSectionId: csId,
                        classSectionLabel: csObj.label,
                        subjectId: subId,
                        subjectLabel: subObj.ismS_SubjectName,
                        asmcL_Id: csObj.classId,
                        asmS_Id: csObj.sectionId,
                        ismS_Id: Number(subId)
                    });
                }
            });
        });

        if (newItems.length === 0) {
            toast.warning('Selected items are already added.');
        } else {
            setTempList([...tempList, ...newItems]);
            toast.success(`Added ${newItems.length} items`);
            // Optional: Clear selection after add? Usually simpler for user.
            setSelectedClassSections([]);
            setSelectedSubjects([]);
        }
    };

    const handleRemoveTempItem = (id: string) => {
        setTempList(tempList.filter((x) => x.id !== id));
    };

    const handleSave = async () => {
        if (!selectedYearId || !selectedStaffId) {
            toast.error('Please select Year and Staff');
            return;
        }

        setIsSubmitting(true);
        try {
            const classSectionsPayload: { asmcL_Id: number; asmC_Id: number }[] = [];
            const classSectionSubjectsPayload: { asmcL_Id: number; asmC_Id: number; subjectIds: number[] }[] = [];

            // Determine EntryTypeFlag
            let entryTypeFlag = 0;
            if (role === 'subject_teacher') entryTypeFlag = 0;
            else if (role === 'class_teacher') entryTypeFlag = 1;
            else if (role === 'others') entryTypeFlag = 2;

            if (role === 'subject_teacher' || role === 'others') {
                if (tempList.length === 0) {
                    toast.error('Please Add at least one mapping (Class-Section + Subject) before saving.');
                    setIsSubmitting(false);
                    return;
                }

                // Populate classSectionSubjects
                const grouped = tempList.reduce(
                    (acc, curr) => {
                        const key = `${curr.asmcL_Id}-${curr.asmS_Id}`;
                        if (!acc[key]) {
                            acc[key] = {
                                asmcL_Id: curr.asmcL_Id,
                                asmC_Id: curr.asmS_Id,
                                subjectIds: []
                            };
                        }
                        acc[key].subjectIds.push(curr.ismS_Id);
                        return acc;
                    },
                    {} as Record<string, { asmcL_Id: number; asmC_Id: number; subjectIds: number[] }>
                );

                Object.values(grouped).forEach((item) => {
                    classSectionSubjectsPayload.push(item);
                });
            } else {
                // Class Teacher (Only Class-Sections)
                if (selectedClassSections.length === 0) {
                    toast.error('Please select at least one Class-Section');
                    setIsSubmitting(false);
                    return;
                }

                selectedClassSections.forEach((csId) => {
                    const [cId, sId] = csId.split('-').map(Number);
                    classSectionsPayload.push({
                        asmcL_Id: cId,
                        asmC_Id: sId
                    });
                });
            }

            const payload: ILoginPrivilegeDTO = {
                asalU_Id: 0, // 0 for Create
                asalU_EntryTypeFlag: entryTypeFlag,
                asmaY_Id: Number(selectedYearId),
                hrmE_Id: Number(selectedStaffId),
                mI_Id: MI_ID, // Use valid MI_ID
                classSections: classSectionsPayload,
                classSectionSubjects: classSectionSubjectsPayload
            };

            console.log('Saving Payload:', JSON.stringify(payload, null, 2)); // Debug log

            await createPrivilege(payload);
            handleClear(); // Clear form on success
            // Note: success toast is handled by hook
            refreshGrid();
        } catch (error) {
            console.error(error);
            // Error toast handled by hook
        } finally {
            setIsSubmitting(false);
        }
    };

    // Rename refetch to more explicit name if needed, but 'refetch' is fine.
    const refreshGrid = () => {
        refetch();
    };

    const handleClear = () => {
        setSelectedClassSections([]);
        setSelectedSubjects([]);
        setTempList([]);
        // Don't clear Year/Staff as user might want to add more for same person
        // But usually "Clear" clears the form. Let's keep Year/Staff?
        // Reference usually clears "Selection" not "Configuration".
        // But the previous implementation cleared everything.
        // Let's reset Selection only to be helpful.
        // If user wants full reset, they can refresh or change.
        // User request "check one by one".
        // Let's clear Selection + TempList.
    };

    return (
        <div className='space-y-4'>
            {/* Top Config Section */}
            <CollapsibleSection
                title='ATTENDANCE LOGIN PRIVILEGES'
                defaultOpen={true}
                variant='outline'
                size='md'
                className='border-t-4 border-t-primary shadow-lg'>
                <div className='p-6'>
                    {/* Role Selection - Compact */}
                    <div className='mb-6'>
                        <Label className='mb-3 block font-medium text-muted-foreground text-sm'>
                            Select Entry Type <span className='text-destructive'>*</span>
                        </Label>
                        <RadioGroup
                            value={role}
                            onValueChange={(val) => {
                                setRole(val);
                                setShowMapping(false);
                                setTempList([]);
                                setSelectedClassSections([]);
                                setSelectedSubjects([]);
                                setMappingClassSections([]);
                                setMappingSubjects([]);
                            }}
                            className='flex flex-wrap items-center gap-6'>
                            <div className='flex items-center space-x-2'>
                                <RadioGroupItem value='subject_teacher' id='r_sub' />
                                <Label htmlFor='r_sub' className='cursor-pointer font-normal'>
                                    Subject Teacher
                                </Label>
                            </div>
                            <div className='flex items-center space-x-2'>
                                <RadioGroupItem value='class_teacher' id='r_class' />
                                <Label htmlFor='r_class' className='cursor-pointer font-normal'>
                                    Class Teacher
                                </Label>
                            </div>
                            <div className='flex items-center space-x-2'>
                                <RadioGroupItem value='others' id='r_others' />
                                <Label htmlFor='r_others' className='cursor-pointer font-normal'>
                                    Others
                                </Label>
                            </div>
                        </RadioGroup>
                    </div>

                    <div className='grid grid-cols-1 items-end gap-4 md:grid-cols-2 lg:grid-cols-3'>
                        {/* Academic Year */}
                        <div className='space-y-2'>
                            <Label className='font-medium text-sm'>
                                Academic Year <span className='text-destructive'>*</span>
                            </Label>
                            <Select
                                value={selectedYearId}
                                onValueChange={(val) => {
                                    setSelectedYearId(val);
                                    setSelectedStaffId('');
                                    setShowMapping(false);
                                    setMappingClassSections([]);
                                    setMappingSubjects([]);
                                }}>
                                <SelectTrigger>
                                    <SelectValue placeholder='Select Year' />
                                </SelectTrigger>
                                <SelectContent>
                                    {academicYears.map((y: any) => (
                                        <SelectItem key={y.asmaY_Id} value={String(y.asmaY_Id)}>
                                            {y.asmaY_Year}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* User/Staff */}
                        <div className='space-y-2'>
                            <Label className='font-medium text-sm'>
                                User / Staff <span className='text-destructive'>*</span>
                            </Label>
                            <Select value={selectedStaffId} onValueChange={(val) => setSelectedStaffId(val)}>
                                <SelectTrigger>
                                    <SelectValue placeholder='Select Staff' />
                                </SelectTrigger>
                                <SelectContent>
                                    {staffList.map((s: any) => (
                                        <SelectItem key={s.id || s.hrmE_Id} value={String(s.id)}>
                                            {s.userName || s.hrmE_EmployeeName}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Search Button */}
                        <div className='pt-2'>
                            <Button
                                type='button'
                                className='w-full bg-[#f97316] text-white hover:bg-[#ea580c]'
                                onClick={handleSearch}
                                disabled={isSearching}>
                                {isSearching ? <Loader2 className='mr-2 h-4 w-4 animate-spin' /> : null}
                                Search
                            </Button>
                        </div>
                    </div>
                </div>
            </CollapsibleSection>

            {/* Mapping Section */}
            {showMapping && (
                <CollapsibleSection
                    title='CLASS-SECTION & SUBJECT MAPPING'
                    defaultOpen={true}
                    variant='outline'
                    size='md'
                    className='fade-in slide-in-from-top-4 animate-in border-t-4 border-t-primary shadow-lg duration-500'>
                    <div className='p-6'>
                        {/* Checkbox Mapping View (Subject Teacher & Others) */}
                        {(role === 'subject_teacher' || role === 'others') && (
                            <div className='flex flex-col gap-6'>
                                <div className='grid grid-cols-1 gap-8 md:grid-cols-2'>
                                    {/* Class-Section Box */}
                                    <div className='overflow-hidden rounded-md border border-border shadow-sm'>
                                        <div className='bg-primary p-2 font-bold text-primary-foreground text-sm'>
                                            Class-Section:<span className='text-red-400'>*</span>
                                        </div>
                                        <ScrollArea className='h-[250px] bg-background p-2'>
                                            {classSectionList.map((item) => (
                                                <div
                                                    key={item.id}
                                                    className='flex items-center space-x-2 rounded py-1 pl-1 hover:bg-accent hover:text-accent-foreground'>
                                                    <Checkbox
                                                        id={`cs-${item.id}`}
                                                        checked={selectedClassSections.includes(item.id)}
                                                        onCheckedChange={() => handleClassSectionToggle(item.id)}
                                                    />
                                                    <Label htmlFor={`cs-${item.id}`} className='cursor-pointer font-normal text-sm'>
                                                        {item.label}
                                                    </Label>
                                                </div>
                                            ))}
                                            {classSectionList.length === 0 && (
                                                <div className='py-8 text-center text-muted-foreground text-sm'>
                                                    No Class-Sections Found
                                                </div>
                                            )}
                                        </ScrollArea>
                                    </div>

                                    {/* Subject Box */}
                                    <div className='overflow-hidden rounded-md border border-border shadow-sm'>
                                        <div className='bg-primary p-2 font-bold text-primary-foreground text-sm'>
                                            Subject:<span className='text-red-400'>*</span>
                                        </div>
                                        <ScrollArea className='h-[250px] bg-background p-2'>
                                            {subjects.map((sub: any) => (
                                                <div
                                                    key={sub.ismS_Id}
                                                    className='flex items-center space-x-2 rounded py-1 pl-1 hover:bg-accent hover:text-accent-foreground'>
                                                    <Checkbox
                                                        id={`sub-${sub.ismS_Id}`}
                                                        checked={selectedSubjects.includes(String(sub.ismS_Id))}
                                                        onCheckedChange={() => handleSubjectToggle(String(sub.ismS_Id))}
                                                    />
                                                    <Label htmlFor={`sub-${sub.ismS_Id}`} className='cursor-pointer font-normal text-sm'>
                                                        {sub.ismS_SubjectName}
                                                    </Label>
                                                </div>
                                            ))}
                                            {subjects.length === 0 && (
                                                <div className='py-8 text-center text-muted-foreground text-sm'>No Subjects Found</div>
                                            )}
                                        </ScrollArea>
                                    </div>
                                </div>
                                <div className='flex justify-end gap-2'>
                                    <Button variant='default' size='sm' className='w-24' onClick={handleAdd}>
                                        + ADD
                                    </Button>
                                    <Button
                                        variant='destructive'
                                        size='sm'
                                        className='w-24'
                                        onClick={() => {
                                            setSelectedClassSections([]);
                                            setSelectedSubjects([]);
                                        }}>
                                        X CLEAR
                                    </Button>
                                </div>

                                {/* Temp List Display */}
                                {tempList.length > 0 && (
                                    <div className='mt-4 overflow-hidden rounded-md border border-border'>
                                        <table className='w-full text-sm'>
                                            <thead className='bg-muted text-muted-foreground'>
                                                <tr>
                                                    <th className='p-2 text-left'>Class-Section</th>
                                                    <th className='p-2 text-left'>Subject</th>
                                                    <th className='p-2 text-center'>Action</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {tempList.map((t) => (
                                                    <tr key={t.id} className='border-border border-t'>
                                                        <td className='p-2'>{t.classSectionLabel}</td>
                                                        <td className='p-2'>{t.subjectLabel}</td>
                                                        <td className='p-2 text-center'>
                                                            <Button
                                                                size='icon'
                                                                variant='ghost'
                                                                className='h-6 w-6 text-destructive'
                                                                onClick={() => handleRemoveTempItem(t.id)}>
                                                                <X className='h-4 w-4' />
                                                            </Button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Class Teacher View (Transfer List Style) */}
                        {role === 'class_teacher' && (
                            <div className='grid grid-cols-1 gap-8 md:grid-cols-2'>
                                {/* Available Box */}
                                <div className='overflow-hidden rounded-md border border-border shadow-sm'>
                                    <div className='bg-primary p-2 font-bold text-primary-foreground text-sm'>
                                        Class-Section:<span className='text-red-400'>*</span>
                                    </div>
                                    <ScrollArea className='h-[250px] bg-background p-2'>
                                        {classSectionList
                                            .filter((x) => !selectedClassSections.includes(x.id))
                                            .map((item) => (
                                                <div
                                                    key={item.id}
                                                    className='flex cursor-pointer items-center space-x-2 rounded px-2 py-1 transition-colors hover:bg-accent hover:text-accent-foreground'
                                                    onClick={() => handleClassSectionToggle(item.id)} // Click to move
                                                >
                                                    <span className='text-sm'>{item.label}</span>
                                                </div>
                                            ))}
                                        {classSectionList.filter((x) => !selectedClassSections.includes(x.id)).length === 0 && (
                                            <div className='py-8 text-center text-muted-foreground text-sm'>
                                                No Available Class-Sections
                                            </div>
                                        )}
                                    </ScrollArea>
                                </div>

                                {/* Selected Box (Destination) */}
                                <div className='overflow-hidden rounded-md border border-border shadow-sm'>
                                    <div className='bg-primary p-2 font-bold text-primary-foreground text-sm'>Selected Class-Section</div>
                                    <ScrollArea className='h-[250px] bg-background p-2'>
                                        {classSectionList
                                            .filter((x) => selectedClassSections.includes(x.id))
                                            .map((item) => (
                                                <div
                                                    key={item.id}
                                                    className='flex cursor-pointer items-center justify-between rounded bg-muted px-2 py-1 transition-colors hover:bg-destructive/10'
                                                    onClick={() => handleClassSectionToggle(item.id)} // Click to remove
                                                >
                                                    <span className='font-medium text-sm'>{item.label}</span>
                                                    <X className='h-3 w-3 text-destructive' />
                                                </div>
                                            ))}
                                        {selectedClassSections.length === 0 && (
                                            <div className='py-8 text-center text-muted-foreground text-sm'>No Selection</div>
                                        )}
                                    </ScrollArea>
                                </div>
                            </div>
                        )}

                        {/* Bottom Actions */}
                        <div className='mt-8 flex justify-center gap-4 border-t pt-6'>
                            <Button
                                className='w-32 bg-[#f97316] text-white hover:bg-[#ea580c]'
                                onClick={handleSave}
                                disabled={isSubmitting}>
                                {isSubmitting ? (
                                    <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                                ) : (
                                    <Loader2 className='mr-2 hidden h-4 w-4' />
                                )}
                                SAVE
                            </Button>
                            <Button variant='destructive' className='w-32' onClick={handleClear} disabled={isSubmitting}>
                                <X className='mr-1 h-4 w-4' /> CLEAR
                            </Button>
                        </div>
                    </div>
                </CollapsibleSection>
            )}
        </div>
    );
}
