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
import { useLoginPrivileges } from '@/hooks/admission/preadmission/useLoginPrivilege';
import {
    useAcademicYearDropdown,
    useClassTeacherEmployee,
    useMasterClassDropdown,
    useMasterSectionDropdown,
    useMasterSubjectDropdown
} from '@/hooks/admission/preadmission/useMasters';
import type { ILoginPrivilege, ILoginPrivilegeDTO } from '@/types/admission/preadmission/login_privilege';
import { Loader2, X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
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
    const { data: privileges, isLoading, refetch, createPrivilege, fetchDataByType, isSearching } = useLoginPrivileges();

    // Safety check for data array
    const tableData = Array.isArray(privileges) ? privileges : (privileges as any)?.data || [];

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
                />

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
            </div>
        </div>
    );
}

interface PrivilegeFormProps {
    createPrivilege: (data: ILoginPrivilegeDTO) => Promise<any>;
    refetch: () => void;
    fetchDataByType: (data: any) => Promise<any>;
    isSearching: boolean;
}

function PrivilegeForm({ createPrivilege, refetch, fetchDataByType, isSearching }: PrivilegeFormProps) {
    const { selectedRow, closeEditForm } = useFormContext<ILoginPrivilege>();

    // Form State
    const [role, setRole] = useState<string>('class_teacher'); // Default to class teacher as per image? Or subject teacher.
    // Image 1 shows "Class Teacher" selected
    const [selectedYearId, setSelectedYearId] = useState<string>('');
    const [selectedStaffId, setSelectedStaffId] = useState<string>('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Visibility State for Mapping
    const [showMapping, setShowMapping] = useState(false);

    // Selection State
    const [selectedClassSections, setSelectedClassSections] = useState<string[]>([]);
    const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);

    // Data Hooks
    const { data: yearData } = useAcademicYearDropdown();
    const MI_ID = 30; // Hardcoded MI_ID
    const { data: staffData } = useClassTeacherEmployee(Number(selectedYearId));
    const { data: classData } = useMasterClassDropdown();
    const { data: sectionData } = useMasterSectionDropdown();
    const { data: subjectData } = useMasterSubjectDropdown(MI_ID);

    // Derived Lists
    // Derived Lists with Safe Array Checks
    const academicYears = Array.isArray((yearData as any)?.data) ? (yearData as any)?.data : Array.isArray(yearData) ? yearData : [];

    const staffList = Array.isArray((staffData as any)?.data) ? (staffData as any)?.data : Array.isArray(staffData) ? staffData : [];

    const classes = Array.isArray((classData as any)?.data) ? (classData as any)?.data : Array.isArray(classData) ? classData : [];

    const sections = Array.isArray((sectionData as any)?.data) ? (sectionData as any)?.data : Array.isArray(sectionData) ? sectionData : [];

    const subjects = Array.isArray((subjectData as any)?.data) ? (subjectData as any)?.data : Array.isArray(subjectData) ? subjectData : [];

    // Synthesize Class-Section List
    const classSectionList = useMemo(() => {
        if (!Array.isArray(classes) || !Array.isArray(sections)) return [];
        const list: { id: string; label: string; classId: number; sectionId: number }[] = [];
        classes.forEach((c: any) => {
            sections.forEach((s: any) => {
                list.push({
                    id: `${c.asmcL_Id}-${s.asmS_Id}`,
                    label: `${c.asmcL_ClassName} : ${s.asmC_SectionName}`,
                    classId: c.asmcL_Id,
                    sectionId: s.asmS_Id
                });
            });
        });
        return list;
    }, [classes, sections]);

    // Handle Edit Mode Population
    useEffect(() => {
        if (selectedRow) {
            // Populate form when editing
            // Note: In a real app we would map properly.
            // For now, let's just simulate opening the form
            // We would need to set year, staff, role from the selectedRow data
            // Since DTO might differ from View Model, simplified here:
            // Assuming selectedRow has the IDs needed or we can infer them
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
        if (!selectedYearId || !selectedStaffId) {
            toast.error('Please select Academic Year and Staff');
            return;
        }

        try {
            // Explicitly passing Role as per user question
            const searchPayload = {
                asmaY_Id: Number(selectedYearId),
                hrmE_Id: Number(selectedStaffId),
                role: role
            };

            console.log('Search Payload:', searchPayload); // For debugging
            const result = await fetchDataByType(searchPayload);

            // Auto-populate logic if data exists
            if (result && Array.isArray(result) && result.length > 0) {
                if (role === 'subject_teacher') {
                    // Map backend data to tempList structure if possible
                    // Assuming result matches DTO details: { asmcL_Id, asmS_Id, ismS_Id }
                    // We need to match these IDs back to labels.
                    const mappedTemp = result
                        .map((r: any, idx: number) => {
                            const csObj = classSectionList.find((x) => x.classId === r.asmcL_Id && x.sectionId === r.asmS_Id);
                            const subObj = subjects.find((s: any) => s.ismS_Id === r.ismS_Id);
                            if (csObj && subObj) {
                                return {
                                    id: `loaded-${idx}`,
                                    classSectionId: csObj.id,
                                    classSectionLabel: csObj.label,
                                    subjectId: String(r.ismS_Id),
                                    subjectLabel: subObj.ismS_SubjectName,
                                    asmcL_Id: r.asmcL_Id,
                                    asmS_Id: r.asmS_Id,
                                    ismS_Id: r.ismS_Id
                                };
                            }
                            return null;
                        })
                        .filter(Boolean);
                    // @ts-ignore
                    setTempList(mappedTemp);
                } else {
                    // Class Teacher / Others
                    const mappedSelection = result
                        .map((r: any) => {
                            const csObj = classSectionList.find((x) => x.classId === r.asmcL_Id && x.sectionId === r.asmS_Id);
                            return csObj ? csObj.id : null;
                        })
                        .filter(Boolean);
                    // @ts-ignore
                    setSelectedClassSections(mappedSelection);
                }
                toast.success(`Loaded ${result.length} existing privileges`);
            } else {
                // No data, just show empty form
                toast.info('No existing privileges found. Please add new.');
            }

            setShowMapping(true);
        } catch (e) {
            console.error(e);
            // Even if fail, show mapping to allow adding new
            setShowMapping(true);
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
            let details: { asmcL_Id: number; asmS_Id: number; ismS_Id: number }[] = [];

            if (role === 'subject_teacher') {
                if (tempList.length === 0) {
                    toast.error('Please Add at least one mapping (Class-Section + Subject) before saving.');
                    setIsSubmitting(false);
                    return;
                }
                details = tempList.map((item) => ({
                    asmcL_Id: item.asmcL_Id,
                    asmS_Id: item.asmS_Id,
                    ismS_Id: item.ismS_Id
                }));
            } else {
                // Class Teacher / Others
                if (selectedClassSections.length === 0) {
                    toast.error('Please select at least one Class-Section');
                    setIsSubmitting(false);
                    return;
                }
                details = selectedClassSections.map((csId) => {
                    const [cId, sId] = csId.split('-').map(Number);
                    return {
                        asmcL_Id: cId,
                        asmS_Id: sId,
                        ismS_Id: 0 // No subject
                    };
                });
            }

            const payload: ILoginPrivilegeDTO = {
                lp_role: role,
                asmaY_Id: Number(selectedYearId),
                hrmE_Id: Number(selectedStaffId),
                details: details
            };

            await createPrivilege(payload);
            handleClear();
            refreshGrid(); // Refetch Data
        } catch (error) {
            toast.error('Failed to save');
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
                    {/* Role Radio Group */}
                    <div className='mb-2 text-center font-bold text-red-600'>Please Select Radio Button to Proceed</div>
                    <div className='mb-6 flex justify-center'>
                        <div className='flex items-center gap-6 rounded-md border bg-white p-3 shadow-sm'>
                            <RadioGroup
                                value={role}
                                onValueChange={(val) => {
                                    setRole(val);
                                    setShowMapping(false); // Reset mapping if role changes
                                    setTempList([]);
                                    setSelectedClassSections([]);
                                    setSelectedSubjects([]);
                                }}
                                className='flex items-center gap-6'>
                                <div className='flex items-center space-x-2'>
                                    <RadioGroupItem value='subject_teacher' id='r_sub' />
                                    <Label htmlFor='r_sub'>Subject Teacher</Label>
                                </div>
                                <div className='flex items-center space-x-2'>
                                    <RadioGroupItem value='class_teacher' id='r_class' />
                                    <Label htmlFor='r_class'>Class Teacher</Label>
                                </div>
                                <div className='flex items-center space-x-2'>
                                    <RadioGroupItem value='others' id='r_others' />
                                    <Label htmlFor='r_others'>Others</Label>
                                </div>
                            </RadioGroup>
                        </div>
                    </div>

                    <div className='grid grid-cols-1 gap-6 md:grid-cols-12'>
                        <div className='space-y-4 md:col-span-6 md:col-start-4'>
                            {/* Academic Year */}
                            <div className='grid grid-cols-4 items-center gap-4'>
                                <Label className='col-span-1 text-right font-medium'>
                                    Academic Year:<span className='text-destructive'>*</span>
                                </Label>
                                <div className='col-span-3'>
                                    <Select
                                        value={selectedYearId}
                                        onValueChange={(val) => {
                                            setSelectedYearId(val);
                                            setSelectedStaffId(''); // Reset staff on year change
                                        }}>
                                        <SelectTrigger>
                                            <SelectValue placeholder='2023-2024' /> {/* Placeholder from image */}
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
                            </div>

                            {/* User/Staff */}
                            <div className='grid grid-cols-4 items-center gap-4'>
                                <Label className='col-span-1 text-right font-medium'>
                                    User/ Staff:<span className='text-destructive'>*</span>
                                </Label>
                                <div className='col-span-3'>
                                    <Select
                                        value={selectedStaffId}
                                        onValueChange={(val) => {
                                            setSelectedStaffId(val);
                                        }}>
                                        <SelectTrigger>
                                            <SelectValue placeholder='Select Staff' />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {staffList.map((s: any) => (
                                                <SelectItem key={s.employee_code || s.hrmE_Id} value={String(s.hrmE_Id)}>
                                                    {s.employee_name || s.hrmE_EmployeeName} : {s.employee_code || s.hrmE_EmployeeCode}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            {/* Search Button (Implicitly requested via "Search") */}
                            <div className='flex justify-center pt-2'>
                                <Button
                                    type='button'
                                    className='w-32 bg-[#3b82f6] text-white hover:bg-[#2563eb]'
                                    onClick={handleSearch}
                                    disabled={isSearching}>
                                    {isSearching ? <Loader2 className='mr-2 h-4 w-4 animate-spin' /> : null}
                                    Search
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </CollapsibleSection>

            {/* Mapping Section */}
            {showMapping && (
                <CollapsibleSection
                    title={role === 'subject_teacher' ? 'CLASS-SECTION & SUBJECT MAPPING' : 'CLASS-SECTION MAPPING'}
                    defaultOpen={true}
                    variant='outline'
                    size='md'
                    className='fade-in slide-in-from-top-4 animate-in border-t-4 border-t-primary shadow-lg duration-500'>
                    <div className='p-6'>
                        {/* Subject Teacher View */}
                        {role === 'subject_teacher' && (
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

                        {/* Class Teacher / Others View (Transfer List Style) */}
                        {role !== 'subject_teacher' && (
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
                                className='w-32 bg-[#1e40af] text-white hover:bg-[#1e3a8a]'
                                onClick={handleSave}
                                disabled={isSubmitting}>
                                {isSubmitting ? (
                                    <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                                ) : (
                                    <Loader2 className='mr-2 hidden h-4 w-4' />
                                )}
                                SAVE
                            </Button>
                            <Button
                                variant='destructive'
                                className='w-32 bg-[#ea580c] text-white hover:bg-[#c2410c]'
                                onClick={handleClear}
                                disabled={isSubmitting}>
                                <X className='mr-1 h-4 w-4' /> CANCEL
                            </Button>
                        </div>
                    </div>
                </CollapsibleSection>
            )}
        </div>
    );
}
