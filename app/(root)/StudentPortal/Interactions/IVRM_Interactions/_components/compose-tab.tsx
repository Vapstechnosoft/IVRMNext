'use client';


import { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
    Send, 
    X, 
    Plus, 
    Paperclip, 
    Loader2, 
    User, 
    Users, 
    Search,
    GraduationCap,
    School,
    UserCheck,
    ClipboardCheck,
    Calendar
} from 'lucide-react';
import { 
    getRecipientsByRole, 
    getSectionsForInteraction, 
    getStudentsForInteraction,
    saveInteractionData
} from '@/server/staff-portal/interactions';
import { uploadDocument } from '@/server/document_upload';
import type { IInteractionsInitialData, IRecipient, ISaveInteractionDataRequest, IFILESLISTdata } from '@/types/staff-portal/interactions';

import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

interface ComposeTabProps {
    data: IInteractionsInitialData;
    mode: 'Group' | 'Individual';
    onCancel: () => void;
    onSuccess: () => void;
}

export function ComposeTab({ data, mode, onCancel, onSuccess }: ComposeTabProps) {
    const [userFlag, setUserFlag] = useState<string>('');
    const [recipients, setRecipients] = useState<IRecipient[]>([]);
    const [sections, setSections] = useState<any[]>([]);
    const [students, setStudents] = useState<IRecipient[]>([]);
    
    const [selectedClass, setSelectedClass] = useState<string>('');
    const [selectedSection, setSelectedSection] = useState<string>('');
    const [selectedRecipientId, setSelectedRecipientId] = useState<string>('');
    const [selectedGroupItems, setSelectedGroupItems] = useState<number[]>([]);
    
    const [subject, setSubject] = useState('');
    const [message, setMessage] = useState('');
    const [selectedYear, setSelectedYear] = useState<string>(data.allacademicyear?.[0]?.asmaY_Id?.toString() || '');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoadingDetails, setIsLoadingDetails] = useState(false);
    
    const [files, setFiles] = useState<{ name: string; file: File | null; path?: string }[]>([{ name: '', file: null }]);
    const [searchTerm, setSearchTerm] = useState('');

    const roleFlg = data.roletype?.[0]?.ivrmrT_Role || 'Staff';
    const isStudentRole = roleFlg === 'Student';
    const config = data.configflag?.[0] || {};

    // Filter available user types based on role and config flags (legacy parity)
    const availableUserTypes = useMemo(() => {
        if (!isStudentRole) {
            const types = [];
            if (data.chatwithstudent !== false) types.push({ id: 'Student', label: 'Student', icon: <GraduationCap className="h-4 w-4" /> });
            if (data.chatwithstaff !== false) types.push({ id: 'Teachers', label: 'Teacher', icon: <User className="h-4 w-4" /> });
            
            if (mode === 'Individual' && data.chatwithstaff !== false) {
                if (config.ivrmgC_EnableHODIntFlg) types.push({ id: 'HOD', label: 'HOD', icon: <Users className="h-4 w-4" /> });
                types.push({ id: 'Principal', label: 'Principal', icon: <School className="h-4 w-4" /> });
                types.push({ id: 'AS', label: 'Academic Supervisor', icon: <UserCheck className="h-4 w-4" /> });
                types.push({ id: 'EC', label: 'Exam Coordinator', icon: <ClipboardCheck className="h-4 w-4" /> });
            }
            return types;
        } else {
            const types = [];
            if (config.ivrmgC_EnableSTSUBTIntFlg) types.push({ id: 'SubjectTeacher', label: 'Subject Teacher', icon: <User className="h-4 w-4" /> });
            if (config.ivrmgC_EnableSTCTIntFlg) types.push({ id: 'ClassTeacher', label: 'Class Teacher', icon: <UserCheck className="h-4 w-4" /> });
            if (config.ivrmgC_EnableSTHODIntFlg) types.push({ id: 'HOD', label: 'HOD', icon: <Users className="h-4 w-4" /> });
            if (config.ivrmgC_EnableSTPrincipalIntFlg) types.push({ id: 'Principal', label: 'Principal', icon: <School className="h-4 w-4" /> });
            if (config.ivrmgC_EnableSTASIntFlg) types.push({ id: 'AS', label: 'Academic Supervisor', icon: <UserCheck className="h-4 w-4" /> });
            if (config.ivrmgC_EnableSTECIntFlg) types.push({ id: 'EC', label: 'Exam Coordinator', icon: <ClipboardCheck className="h-4 w-4" /> });
            return types;
        }
    }, [isStudentRole, data, config, mode]);

    // Recipient selection logic - matches legacy getdetail
    useEffect(() => {
        if (!userFlag || !selectedYear) return;
        const fetchDetails = async () => {
            setIsLoadingDetails(true);
            try {
                const res = await getRecipientsByRole(roleFlg, userFlag, Number(selectedYear));
                if (res.success && res.data) {
                    setRecipients(res.data.getdetails || []);
                } else {
                     toast.error(res.message || 'No recipients found for this type');
                     setRecipients([]);
                }
            } catch (error) {
                toast.error('Failed to load recipients');
            } finally {
                setIsLoadingDetails(false);
            }
        };
        fetchDetails();
        
        // Reset selections
        setSelectedClass('');
        setSections([]);
        setSelectedSection('');
        setStudents([]);
        setSelectedRecipientId('');
        setSelectedGroupItems([]);
    }, [userFlag, selectedYear, roleFlg]);
    
    // Extract unique classes for student interaction dropdown
    const classList = useMemo(() => {
        if (userFlag !== 'Student') return [];
        const uniqueClasses: any[] = [];
        const seenIds = new Set();
        
        recipients.forEach((item: any) => {
            if (item.ASMCL_Id && !seenIds.has(item.ASMCL_Id)) {
                seenIds.add(item.ASMCL_Id);
                uniqueClasses.push(item);
            }
        });
        return uniqueClasses;
    }, [recipients, userFlag]);

    // Fetch sections when class changes (for Student selection)
    const handleClassChange = async (classId: string) => {
        setSelectedClass(classId);
        setSelectedSection('');
        setStudents([]);
        
        setIsLoadingDetails(true);
        try {
            const res = await getSectionsForInteraction(Number(classId), Number(selectedYear), roleFlg);
            if (res.success && res.data) {
                setSections(res.data.sectionList || []);
            }
        } catch (error) {
            toast.error('Failed to load sections');
        } finally {
            setIsLoadingDetails(false);
        }
    };

    // Fetch students when section changes
    const handleSectionChange = async (sectionId: string) => {
        setSelectedSection(sectionId);
        setIsLoadingDetails(true);
        try {
            const res = await getStudentsForInteraction(Number(selectedClass), Number(sectionId));
            if (res.success && res.data) {
                setStudents(res.data.get_student || []);
            }
        } catch (error) {
            toast.error('Failed to load students');
        } finally {
            setIsLoadingDetails(false);
        }
    };

    const handleSelectAll = (checked: boolean) => {
        if (checked) {
            const list = userFlag === 'Student' ? students : recipients;
            const allIds = list.map(item => (userFlag === 'Student' ? item.AMST_Id : item.HRME_Id)).filter((id): id is number => !!id);
            setSelectedGroupItems(allIds);
        } else {
            setSelectedGroupItems([]);
        }
    };

    const toggleItemSelection = (id: number) => {
        setSelectedGroupItems(prev => 
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    const handleFileChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] || null;
        if (file) {
            const newFiles = [...files];
            newFiles[index] = { name: file.name, file: file };
            setFiles(newFiles);
        }
    };

    const addNewFile = () => setFiles([...files, { name: '', file: null }]);
    const removeFile = (index: number) => setFiles(files.filter((_, i) => i !== index));

    const handleSubmit = async () => {
        if (!userFlag || !subject || !message) {
            toast.error('Please fill in all required fields');
            return;
        }

        if (mode === 'Group' && selectedGroupItems.length === 0) {
            toast.error('Please select at least one recipient');
            return;
        }

        if (mode === 'Individual' && !selectedRecipientId && !['HOD', 'Principal', 'AS', 'ClassTeacher'].includes(userFlag)) {
             // For some roles, it might be auto-selected (like first HOD in list)
             if (recipients.length === 0) {
                toast.error('No recipients available');
                return;
             }
        }

        setIsSubmitting(true);
        try {
            // Upload files first - matches legacy UploadImgs pattern
            const uploadedFiles: IFILESLISTdata[] = [];
            for (const fileObj of files) {
                if (fileObj.file) {
                    const formData = new FormData();
                    formData.append('file', fileObj.file);
                    const uploadRes = await uploadDocument(formData);
                    if (uploadRes.success && uploadRes.data) {
                        uploadedFiles.push({
                            ISMID_Filename: fileObj.name,
                            ISMID_Filepath: uploadRes.data
                        });
                    }
                }
            }

            const payload: ISaveInteractionDataRequest = {
                ISMINT_GroupOrIndFlg: mode,
                ISMINT_Subject: subject,
                ISMINT_Interaction: message,
                ISMINT_MACAddress: '00-00-00-00-00-00', // Placeholder as per common patterns
                ISMINT_ISPIPAddress: '127.0.0.1',
                userflag: userFlag,
                roleflg: roleFlg,
                ISTINT_ToId: 0,
                transnumbconfigurationsettingsss: {
                    IMN_AutoManualFlag: "Auto",
                    IMN_DuplicatesFlag: "No",
                    IMN_Flag: isStudentRole ? "InteractionStudent" : "InteractionStaff",
                    IMN_PrefixAcadYearCode: true,
                    IMN_PrefixParticular: "INT",
                    IMN_SuffixAcadYearCode: false,
                    IMN_SuffixParticular: "",
                    IMN_WidthNumeric: "6",
                    IMN_ZeroPrefixFlag: "Yes",
                    IMN_RestartNumFlag: "Yearly",
                    ASMAY_Id: Number(selectedYear)
                },
                FILESLISTdata: uploadedFiles,
                images_paths: uploadedFiles.map(f => f.ISMID_Filepath)
            };

            // Recipient mapping logic (legacy parity)
            if (mode === 'Group') {
                if (userFlag === 'Student') {
                    payload.arrayStudent = students
                        .filter(s => selectedGroupItems.includes(s.AMST_Id!))
                        .map(s => ({ AMST_Id: s.AMST_Id! }));
                } else {
                    payload.arrayTeachers = recipients
                        .filter(r => selectedGroupItems.includes(r.HRME_Id!))
                        .map(r => ({ HRME_Id: r.HRME_Id! }));
                }
            } else {
                let toId = 0;
                if (userFlag === 'Student') {
                    toId = Number(selectedRecipientId);
                    payload.arrayStudent = [{ AMST_Id: toId }];
                } else if (userFlag === 'Teachers' || userFlag === 'SubjectTeacher') {
                    toId = Number(selectedRecipientId);
                    payload.arrayTeachers = [{ HRME_Id: toId }];
                } else {
                    // Single choice or auto-selected role (HOD, Principal etc)
                    toId = recipients[0]?.HRME_Id || 0;
                    if (selectedRecipientId) toId = Number(selectedRecipientId);
                    payload.arrayTeachers = [{ HRME_Id: toId }];
                }
                payload.ISTINT_ToId = toId;
            }

            const res = await saveInteractionData(payload);

            if (res.success && res.data?.returnval) {
                toast.success('Interaction sent successfully');
                onSuccess();
            } else {
                toast.error(res.message || 'Failed to send interaction');
            }
        } catch (error) {
            toast.error('An error occurred while sending');
        } finally {
            setIsSubmitting(false);
        }
    };

    const filteredRecipientsList = recipients.filter(r => 
        (r.EmpName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (r.HRME_EmployeeCode || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    const filteredStudentsList = students.filter(s => 
        (s.studentName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (s.AMST_AdmNo || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="flex flex-col gap-10">
            <div className="grid gap-8 lg:grid-cols-2">
                <div className="flex flex-col gap-6 rounded-2xl border bg-accent/5 p-8 shadow-sm">
                    <div className="space-y-6">
                        <div className="space-y-3">
                            <Label className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                                <Calendar className="h-4 w-4" /> Academic Year
                            </Label>
                            <Select value={selectedYear} onValueChange={setSelectedYear}>
                                <SelectTrigger className="h-12 bg-background font-bold border-2">
                                    <SelectValue placeholder="Select Academic Year" />
                                </SelectTrigger>
                                <SelectContent>
                                    {data.allacademicyear?.map((year) => (
                                        <SelectItem key={year.asmaY_Id} value={year.asmaY_Id.toString()} className="font-medium">
                                            {year.asmaY_Year}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-3">
                            <Label className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                                <Search className="h-4 w-4" /> Interaction With
                            </Label>
                            <div className="p-1 rounded-xl bg-muted/30 border-2 border-dashed">
                                <RadioGroup 
                                    value={userFlag} 
                                    onValueChange={setUserFlag}
                                    className="grid grid-cols-2 gap-2"
                                >
                                    {availableUserTypes.map((type) => (
                                        <Label 
                                            key={type.id}
                                            className={cn(
                                                "flex cursor-pointer items-center gap-3 rounded-lg border-2 p-3 transition-all hover:bg-background/80 group",
                                                userFlag === type.id ? "border-primary bg-background shadow-md shadow-primary/10" : "border-transparent opacity-60 grayscale-[0.5] hover:opacity-100 hover:grayscale-0"
                                            )}
                                        >
                                            <RadioGroupItem value={type.id} className="sr-only" />
                                            <div className={cn(
                                                "p-2 rounded-md transition-colors",
                                                userFlag === type.id ? "bg-primary text-white" : "bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary"
                                            )}>
                                                {type.icon}
                                            </div>
                                            <span className="text-xs font-bold leading-tight">{type.label}</span>
                                        </Label>
                                    ))}
                                </RadioGroup>
                            </div>
                        </div>
                    </div>

                    {userFlag === 'Student' && (
                        <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label className="text-[11px] font-black uppercase text-muted-foreground ml-1">Class</Label>
                                    <Select value={selectedClass} onValueChange={handleClassChange}>
                                        <SelectTrigger className="h-11 bg-background font-bold">
                                            <SelectValue placeholder="Class" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {classList.map((cls: any) => (
                                                <SelectItem key={cls.ASMCL_Id} value={cls.ASMCL_Id.toString()} className="font-bold">
                                                    {cls.ASMCL_ClassName}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-[11px] font-black uppercase text-muted-foreground ml-1">Section</Label>
                                    <Select 
                                        value={selectedSection} 
                                        onValueChange={handleSectionChange}
                                        disabled={!selectedClass}
                                    >
                                        <SelectTrigger className="h-11 bg-background font-bold">
                                            <SelectValue placeholder="Section" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {sections.map((sec: any) => (
                                                <SelectItem key={sec.asmS_Id} value={sec.asmS_Id.toString()} className="font-bold">
                                                    {sec.asmC_SectionName}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="relative mt-2 min-h-[300px] flex flex-col gap-4">
                        {isLoadingDetails ? (
                            <div className="flex flex-col flex-1 items-center justify-center py-20 gap-4">
                                <Loader2 className="h-10 w-10 animate-spin text-primary" />
                                <p className="text-xs font-bold text-primary animate-pulse tracking-widest uppercase">Fetching Details...</p>
                            </div>
                        ) : !userFlag ? (
                            <div className="flex flex-col flex-1 items-center justify-center text-muted-foreground/30 py-20">
                                <Users className="mb-4 h-16 w-16" />
                                <p className="text-sm font-black uppercase tracking-widest">Select a user type to begin</p>
                            </div>
                        ) : mode === 'Group' ? (
                            <div className="bg-card rounded-2xl border p-4 shadow-inner space-y-4">
                                <div className="flex items-center justify-between gap-4">
                                    <div className="relative flex-1">
                                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                        <Input 
                                            placeholder="Quick filter..." 
                                            className="h-10 pl-9 text-xs font-bold bg-muted/20 border-none rounded-full" 
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                        />
                                    </div>
                                    <div className="flex items-center gap-3 px-3">
                                        <Checkbox 
                                            id="select-all" 
                                            className="h-5 w-5 rounded-md"
                                            onCheckedChange={handleSelectAll} 
                                            checked={
                                                (userFlag === 'Student' ? students : recipients).length > 0 && 
                                                selectedGroupItems.length === (userFlag === 'Student' ? students : recipients).length
                                            }
                                        />
                                        <Label htmlFor="select-all" className="text-sm font-black uppercase cursor-pointer">All</Label>
                                    </div>
                                </div>
                                
                                <ScrollArea className="h-[280px] pr-4">
                                    <div className="grid gap-2 pr-2">
                                        {(userFlag === 'Student' ? filteredStudentsList : filteredRecipientsList).map((item) => {
                                            const id = userFlag === 'Student' ? item.AMST_Id! : item.HRME_Id!;
                                            const name = userFlag === 'Student' ? item.studentName : item.EmpName;
                                            const sub = (userFlag === 'Student' ? item.AMST_AdmNo : item.HRME_EmployeeCode);
                                            return (
                                                <div 
                                                    key={id}
                                                    className={cn(
                                                        "group flex items-center justify-between gap-3 rounded-xl border-2 p-3 transition-all cursor-pointer",
                                                        selectedGroupItems.includes(id) 
                                                            ? "bg-primary/[0.08] border-primary shadow-sm" 
                                                            : "bg-background border-transparent hover:border-muted-foreground/20"
                                                    )}
                                                    onClick={() => toggleItemSelection(id)}
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <Checkbox checked={selectedGroupItems.includes(id)} className="h-4 w-4 data-[state=checked]:bg-primary" />
                                                        <div className="flex flex-col">
                                                            <span className="text-xs font-black tracking-tight">{name}</span>
                                                            <span className="text-[10px] font-bold text-muted-foreground opacity-70 uppercase tracking-tighter">
                                                                {sub} 
                                                                {userFlag !== 'Student' && (item as any).ASMCL_ClassName && ` | ${(item as any).ASMCL_ClassName}`}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    {selectedGroupItems.includes(id) && (
                                                        <Badge className="bg-primary hover:bg-primary shadow-none h-5 px-1.5 text-[9px] font-black uppercase">Selected</Badge>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </ScrollArea>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {['Principal', 'HOD', 'AS', 'EC', 'ClassTeacher'].includes(userFlag) ? (
                                    <div className="rounded-2xl bg-primary/5 p-6 border-2 border-primary/20 flex flex-col gap-4 animate-in zoom-in-95 duration-300">
                                         <div className="flex items-center gap-4">
                                            <div className="bg-primary p-4 rounded-2xl text-white shadow-lg shadow-primary/30">
                                                <User className="h-6 w-6" />
                                            </div>
                                            <div>
                                                <p className="text-[11px] font-black uppercase text-primary tracking-widest opacity-70">Assigned Recipient</p>
                                                <p className="text-xl font-black tracking-tighter">
                                                    {recipients.length > 0 ? recipients[0].EmpName : `Searching ${userFlag}...`}
                                                </p>
                                            </div>
                                         </div>
                                         {recipients.length > 1 && (
                                              <ScrollArea className="max-h-[150px] mt-2 border-t pt-4">
                                                  <div className="grid gap-2">
                                                      {recipients.map(r => (
                                                          <Button 
                                                            variant="ghost" 
                                                            key={r.HRME_Id}
                                                            className={cn(
                                                                "justify-start font-bold h-10 rounded-lg",
                                                                (selectedRecipientId === r.HRME_Id?.toString() || (!selectedRecipientId && recipients[0].HRME_Id === r.HRME_Id)) && "bg-primary/10 text-primary"
                                                            )}
                                                            onClick={() => setSelectedRecipientId(r.HRME_Id?.toString() || '')}
                                                          >
                                                              {r.EmpName}
                                                          </Button>
                                                      ))}
                                                  </div>
                                              </ScrollArea>
                                         )}
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        <Label className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                                            <User className="h-4 w-4" /> Select Individual
                                        </Label>
                                        <Select value={selectedRecipientId} onValueChange={setSelectedRecipientId}>
                                            <SelectTrigger className="h-12 bg-background font-bold border-2">
                                                <SelectValue placeholder={`Select ${userFlag}`} />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {(userFlag === 'Student' ? students : recipients).map((item) => {
                                                    const id = userFlag === 'Student' ? item.AMST_Id! : item.HRME_Id!;
                                                    const name = userFlag === 'Student' ? item.studentName : item.EmpName;
                                                    const sub = (userFlag === 'Student' ? item.AMST_AdmNo : item.HRME_EmployeeCode);
                                                    return (
                                                        <SelectItem key={id} value={id.toString()} className="font-bold">
                                                            {name} {sub ? `(${sub})` : ''}
                                                        </SelectItem>
                                                    );
                                                })}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex flex-col gap-8">
                    <div className="flex flex-col gap-6">
                        <div className="space-y-3">
                            <Label className="text-sm font-bold uppercase tracking-wider text-muted-foreground ml-1">Interaction Subject</Label>
                            <Input 
                                placeholder="What is this about?" 
                                className="h-14 bg-background px-6 text-lg font-black tracking-tight border-2 focus-visible:ring-primary/20"
                                value={subject}
                                onChange={(e) => setSubject(e.target.value)}
                            />
                        </div>
                        <div className="space-y-3">
                            <Label className="text-sm font-bold uppercase tracking-wider text-muted-foreground ml-1">Detailed Message</Label>
                            <Textarea 
                                placeholder="Type your message here..." 
                                className="min-h-[250px] resize-none bg-background p-6 text-sm font-medium leading-relaxed border-2 focus-visible:ring-primary/20"
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="space-y-4">
                        <Label className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2 ml-1">
                            <Paperclip className="h-4 w-4" /> Files & Attachments
                        </Label>
                        <div className="grid gap-3 p-4 rounded-2xl bg-muted/20 border-2 border-dashed">
                            {files.map((file, idx) => (
                                <div key={idx} className="flex items-center gap-3 animate-in slide-in-from-left-2 duration-200">
                                    <div className="relative flex-1 group">
                                        <div className="flex h-12 w-full items-center justify-between rounded-xl border-2 bg-background px-4 py-2 text-sm font-bold shadow-sm transition-all group-hover:border-primary/50 group-hover:shadow-md">
                                            <span className="truncate max-w-[250px] text-muted-foreground group-hover:text-foreground">
                                                {file.name || 'Click to browse or drag file...'}
                                            </span>
                                            <Input 
                                                type="file" 
                                                className="absolute inset-0 opacity-0 cursor-pointer"
                                                onChange={(e) => handleFileChange(idx, e)}
                                            />
                                            {!file.name && <Plus className="h-5 w-5 text-primary opacity-40 group-hover:opacity-100" />}
                                            {file.name && <UserCheck className="h-5 w-5 text-primary" />}
                                        </div>
                                    </div>
                                    {files.length > 1 && (
                                        <Button 
                                            variant="ghost" 
                                            size="icon" 
                                            className="h-12 w-12 rounded-xl text-destructive hover:bg-destructive/10"
                                            onClick={() => removeFile(idx)}
                                        >
                                            <X className="h-5 w-5" />
                                        </Button>
                                    )}
                                    {idx === files.length - 1 && (
                                        <Button 
                                            variant="outline" 
                                            size="icon" 
                                            className="h-12 w-12 rounded-xl border-2 border-primary/20 text-primary hover:bg-primary hover:text-white"
                                            onClick={addNewFile}
                                        >
                                            <Plus className="h-5 w-5" />
                                        </Button>
                                    )}
                                </div>
                            ))}
                            <p className="text-[10px] font-bold text-muted-foreground/60 uppercase text-center mt-2 tracking-widest">
                                Accepted: jpg, jpeg, png, doc, ppt, excel, pdf
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex h-24 items-center justify-between border-t bg-muted/10 px-10 -mx-10 -mb-10 rounded-b-3xl">
                <Button variant="ghost" onClick={onCancel} disabled={isSubmitting} className="font-bold text-muted-foreground uppercase tracking-widest">
                    Discard Draft
                </Button>
                <Button 
                    size="lg"
                    className="min-w-[220px] h-14 rounded-2xl font-black text-lg shadow-xl shadow-primary/30 transition-all hover:scale-[1.02] active:scale-[0.98]" 
                    onClick={handleSubmit} 
                    disabled={isSubmitting || !userFlag}
                >
                    {isSubmitting ? (
                        <>
                            <Loader2 className="mr-3 h-6 w-6 animate-spin" />
                            Sending...
                        </>
                    ) : (
                        <>
                            <Send className="mr-3 h-5 w-5" />
                            Send Interaction
                        </>
                    )}
                </Button>
            </div>
        </div>
    );
}
