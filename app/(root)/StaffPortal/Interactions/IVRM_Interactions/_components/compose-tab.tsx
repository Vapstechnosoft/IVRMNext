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
    saveInteraction
} from '@/server/staff-portal/interactions';
import { uploadDocument } from '@/server/document_upload';
import type { IInteractionsInitialData, IRecipient } from '@/types/staff-portal/interactions';

import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';

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

    const [file, setFile] = useState<{ name: string; file: File | null; path?: string } | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [isMounted, setIsMounted] = useState(false);

    const roleFlg = data.roletype?.[0]?.ivrmrT_Role || 'Staff';
    const isStudentRole = roleFlg === 'Student';
    const config = data.configflag?.[0] || {};

    // Filter available user types based on role and config flags (legacy parity)
    const availableUserTypes = useMemo(() => {
        if (!isStudentRole) {
            const types = [];
            if (data.chatwithstudent !== false) types.push({ id: 'Student', label: 'Student', icon: <GraduationCap className="h-4 w-4" /> });
            if (data.chatwithstaff !== false) types.push({ id: 'Teachers', label: 'Teachers', icon: <User className="h-4 w-4" /> });

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

    // Mount check for hydration
    useEffect(() => {
        setIsMounted(true);
    }, []);

    // Recipient selection logic - matches legacy getdetail
    useEffect(() => {
        if (!userFlag || !selectedYear) return;
        const fetchDetails = async () => {
            setIsLoadingDetails(true);
            try {
                const res = await getRecipientsByRole(roleFlg, userFlag, Number(selectedYear));
                if (res.success && res.data) {
                    // Handle JSON-serialized filter data if present (special case for Student flag)
                    let details = (res.data as any).getdetails || [];

                    // The backend sometimes returns a serialized JSON string in a 'data' array
                    const rawData = (res.data as any).data || res.data;
                    if (Array.isArray(rawData) && rawData.length > 0 && rawData[0].IVRM_Interaction_filter) {
                        try {
                            details = JSON.parse(rawData[0].IVRM_Interaction_filter);
                        } catch (e) {
                            console.error('Failed to parse IVRM_Interaction_filter:', e);
                        }
                    } else if (Array.isArray(rawData) && !details.length) {
                        details = rawData;
                    }

                    setRecipients(details || []);
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
                // Handle different backend structures (sectionList vs direct data array)
                const sectionList = (res.data as any).sectionList || (Array.isArray(res.data) ? res.data : []);
                setSections(sectionList);
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
                // Handle different backend structures (get_student vs direct data array)
                const studentList = (res.data as any).get_student || (Array.isArray(res.data) ? res.data : []);
                setStudents(studentList);
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

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0] || null;
        if (selectedFile) {
            setFile({ name: selectedFile.name, file: selectedFile });
        }
    };

    const removeFile = () => setFile(null);

    const viewFile = () => {
        if (file?.file) {
            const url = URL.createObjectURL(file.file);
            window.open(url, '_blank');
        }
    };

    const downloadFile = () => {
        if (file?.file) {
            const url = URL.createObjectURL(file.file);
            const a = document.createElement('a');
            a.href = url;
            a.download = file.name;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }
    };

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
            if (recipients.length === 0) {
                toast.error('No recipients available');
                return;
            }
        }

        setIsSubmitting(true);
        try {
            // Upload file if present
            let uploadedFilePath = '';
            if (file && file.file) {
                const formData = new FormData();
                formData.append('file', file.file);
                const uploadRes = await uploadDocument(formData);
                if (uploadRes.success && uploadRes.data) {
                    uploadedFilePath = uploadRes.data;
                }
            }

            let toId = 0;
            if (mode === 'Individual') {
                if (selectedRecipientId) {
                    toId = Number(selectedRecipientId);
                } else if (!['HOD', 'Principal', 'AS', 'ClassTeacher'].includes(userFlag)) {
                    toId = recipients[0]?.HRME_Id || 0;
                }
            }

            const payload: any = {
                userflag: userFlag,
                roleflg: roleFlg,
                isminT_GroupOrIndFlg: mode,
                isminT_Subject: subject,
                isminT_Interaction: message,
                images_paths: uploadedFilePath ? [uploadedFilePath] : [],
                isminT_MACAddress: '00:1A:2B:3C:4D:5E', // As per latest user requirement
                isminT_ISPIPAddress: '192.168.1.100',   // As per latest user requirement
                transnumbconfigurationsettingsss: {
                    imN_AutoManualFlag: "Auto"
                }
            };

            // Recipient mapping logic based on user examples
            if (mode === 'Individual') {
                payload.istinT_ToId = toId;
            } else {
                // Group Mode: Use arrays
                if (userFlag === 'Student') {
                    payload.arrayStudent = students
                        .filter(s => selectedGroupItems.includes(s.AMST_Id!))
                        .map(s => ({ AMST_Id: s.AMST_Id! }));
                } else {
                    payload.arrayTeachers = recipients
                        .filter(r => selectedGroupItems.includes(r.HRME_Id!))
                        .map(r => ({ HRME_Id: r.HRME_Id! }));
                }
            }

            const res = await saveInteraction(payload);

            if (res.success) {
                toast.success(res.message || 'Interaction sent successfully');
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
        <div className="flex flex-col gap-6 py-4">
            {/* Recipient Selection Box */}
            <div className={cn(
                "mx-auto w-full max-w-4xl border border-slate-200 bg-white p-6 shadow-sm rounded-none",
                isSubmitting && "opacity-50 pointer-events-none"
            )}>
                <div className="flex flex-col items-center gap-6">
                    {/* Radio Group for Role Selection - Centered like legacy */}
                    <RadioGroup
                        value={userFlag}
                        onValueChange={setUserFlag}
                        className="grid grid-cols-2 sm:flex sm:flex-wrap justify-center items-center gap-x-8 gap-y-4 max-w-xl mx-auto"
                    >
                        {availableUserTypes.map((type) => (
                            <div key={type.id} className="flex items-center space-x-2">
                                <RadioGroupItem value={type.id} id={`role-${type.id}`} className="h-4 w-4 border-[#1e40af] text-[#1e40af]" />
                                <Label htmlFor={`role-${type.id}`} className="text-[11px] font-semibold text-slate-600 cursor-pointer">
                                    {type.label}
                                </Label>
                            </div>
                        ))}
                    </RadioGroup>

                    {/* Dependent Dropdowns - Sentence Case Labels */}
                    <div className="grid w-full max-w-2xl gap-4 border-t pt-8 mt-2">
                        {userFlag === 'Student' && (
                            <>
                                <div className="flex items-center gap-4">
                                    <Label className="w-32 text-right text-[11px] font-bold text-slate-500">Class :*</Label>
                                    <select
                                        className="flex-1 h-9 border border-slate-300 rounded-none px-3 text-[12px] focus:border-[#1e40af] outline-none transition-all"
                                        value={selectedClass}
                                        onChange={(e) => handleClassChange(e.target.value)}
                                    >
                                        <option value="">Select Class</option>
                                        {classList.filter(cls => cls.ASMCL_Id != null).map((cls: any) => (
                                            <option key={cls.ASMCL_Id} value={cls.ASMCL_Id.toString()}>{cls.ASMCL_ClassName}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="flex items-center gap-4">
                                    <Label className="w-32 text-right text-[11px] font-bold text-slate-500">Section :*</Label>
                                    <select
                                        className="flex-1 h-9 border border-slate-300 rounded-none px-3 text-[12px] focus:border-[#1e40af] outline-none transition-all disabled:opacity-50"
                                        value={selectedSection}
                                        onChange={(e) => handleSectionChange(e.target.value)}
                                        disabled={!selectedClass}
                                    >
                                        <option value="">Select Section</option>
                                        {sections.filter(sec => sec.asmS_Id != null).map((sec: any) => (
                                            <option key={sec.asmS_Id} value={sec.asmS_Id.toString()}>{sec.asmC_SectionName}</option>
                                        ))}
                                    </select>
                                </div>
                            </>
                        )}

                        {mode === 'Individual' ? (
                            <div className="flex items-center gap-4">
                                <Label className="w-32 text-right text-[11px] font-bold text-slate-500">
                                    {userFlag === 'Student' ? 'Student' : (userFlag || 'Recipient')} :*
                                </Label>
                                <select
                                    className="flex-1 h-9 border border-slate-300 rounded-none px-3 text-[12px] focus:border-[#1e40af] outline-none transition-all disabled:opacity-50"
                                    value={selectedRecipientId}
                                    onChange={(e) => setSelectedRecipientId(e.target.value)}
                                    disabled={!userFlag || (userFlag === 'Student' && !selectedSection)}
                                >
                                    <option value="">Select {userFlag || 'Recipient'}</option>
                                    {(userFlag === 'Student' ? filteredStudentsList : filteredRecipientsList).filter(item => (userFlag === 'Student' ? item.AMST_Id : item.HRME_Id) != null).map((item) => {
                                        const id = userFlag === 'Student' ? item.AMST_Id! : item.HRME_Id!;
                                        const name = userFlag === 'Student' ? item.studentName : item.EmpName;
                                        const sub = (userFlag === 'Student' ? item.AMST_AdmNo : item.HRME_EmployeeCode);
                                        return (
                                            <option key={id} value={id.toString()}>
                                                {name} {sub ? `(${sub})` : ''}
                                            </option>
                                        );
                                    })}
                                </select>
                            </div>
                        ) : (
                            <div className="flex flex-col gap-4 border border-slate-200 p-4">
                                <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-2">
                                    <div className="flex items-center gap-2">
                                        <Checkbox
                                            id="select-all"
                                            checked={(userFlag === 'Student' ? students : recipients).length > 0 && selectedGroupItems.length === (userFlag === 'Student' ? students : recipients).length}
                                            onCheckedChange={handleSelectAll}
                                            className="h-4 w-4 border-[#1e40af] data-[state=checked]:bg-[#1e40af]"
                                        />
                                        <Label htmlFor="select-all" className="text-[11px] font-bold text-slate-500 cursor-pointer">SELECT ALL</Label>
                                    </div>
                                    <div className="relative w-48">
                                        <Input
                                            placeholder="Search..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            className="h-7 text-[10px] rounded-none border-slate-200 pl-7 focus-visible:ring-0"
                                        />
                                        <Search className="absolute left-2 top-1.5 h-3.5 w-3.5 text-slate-400" />
                                    </div>
                                </div>
                                <ScrollArea className="h-64 pr-4">
                                    <div className="space-y-1">
                                        {(userFlag === 'Student' ? filteredStudentsList : filteredRecipientsList).filter(item => (userFlag === 'Student' ? item.AMST_Id : item.HRME_Id) != null).map((item) => {
                                            const id = userFlag === 'Student' ? item.AMST_Id! : item.HRME_Id!;
                                            const name = userFlag === 'Student' ? item.studentName : item.EmpName;
                                            const sub = (userFlag === 'Student' ? item.AMST_AdmNo : item.HRME_EmployeeCode);
                                            return (
                                                <div key={id} className="flex items-center gap-3 py-1 hover:bg-slate-50 px-2 transition-colors">
                                                    <Checkbox
                                                        id={`item-${id}`}
                                                        checked={selectedGroupItems.includes(id)}
                                                        onCheckedChange={() => toggleItemSelection(id)}
                                                        className="h-3.5 w-3.5 border-slate-400 data-[state=checked]:bg-[#1e40af] data-[state=checked]:border-[#1e40af]"
                                                    />
                                                    <Label htmlFor={`item-${id}`} className="text-[11px] text-slate-600 cursor-pointer flex-1">
                                                        {name} <span className="text-slate-400 font-normal">({sub})</span>
                                                    </Label>
                                                </div>
                                            );
                                        })}
                                        {(userFlag === 'Student' ? students : recipients).length === 0 && (
                                            <div className="text-center py-8 text-slate-400 text-[11px]">No items found</div>
                                        )}
                                    </div>
                                </ScrollArea>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Message Area */}
            <div className="mx-auto w-full max-w-4xl border border-[#1e40af]/30 bg-white shadow-md rounded-none overflow-hidden">
                {/* Legacy Header */}
                <div className="border-t-2 border-t-orange-400 bg-slate-50 px-4 py-2 flex items-center justify-between border-b border-orange-200">
                    <h3 className="text-[11px] font-black uppercase tracking-wider text-[#1e40af]">
                        NEW MESSAGE
                    </h3>
                    <div className="flex items-center gap-2 text-[10px] font-black text-slate-400">
                        {isMounted ? format(new Date(), 'dd/MM/yyyy hh:mm a') : '   /  /     :   '}
                    </div>
                </div>

                <div className="p-8 space-y-6">
                    <div className="flex gap-4">
                        <Label className="w-32 text-right text-[11px] font-black uppercase text-slate-600 mt-2.5">Subject :*</Label>
                        <Input
                            placeholder="Interaction Subject"
                            className="flex-1 h-10 border-slate-300 rounded-none bg-white text-[12px] focus-visible:ring-0 focus-visible:border-[#1e40af]"
                            value={subject}
                            onChange={(e) => setSubject(e.target.value)}
                        />
                    </div>

                    <div className="flex gap-4">
                        <Label className="w-32 text-right text-[11px] font-black uppercase text-slate-600 mt-2.5">Message :*</Label>
                        <Textarea
                            placeholder="Message"
                            className="flex-1 min-h-[180px] border-slate-300 rounded-none bg-white text-[12px] resize-none focus-visible:ring-0 focus-visible:border-[#1e40af]"
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                        />
                    </div>

                    {/* Single File Upload in Legacy Style */}
                    <div className="flex flex-col gap-3 ml-36">
                        <div className="flex items-center gap-4">
                            <div className="relative group">
                                <Button
                                    className="h-8 rounded-none bg-[#1e40af] px-4 text-[11px] font-bold uppercase tracking-wider hover:bg-[#1e3abf] flex items-center gap-2"
                                >
                                    {file ? 'Change File' : 'Browse'}
                                    <Send className="h-3.5 w-3.5 rotate-[270deg]" />
                                </Button>
                                <input
                                    type="file"
                                    className="absolute inset-0 opacity-0 cursor-pointer"
                                    onChange={handleFileChange}
                                />
                            </div>

                            {file && (
                                <div className="flex items-center gap-3">
                                    <span className="text-[11px] font-bold text-[#1e40af] truncate max-w-[200px]">
                                        {file.name}
                                    </span>
                                    <div className="flex items-center gap-1">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => {
                                                if (file?.file) {
                                                    const ext = file.name.split('.').pop()?.toLowerCase();
                                                    if (['docx', 'doc', 'xlsx', 'xls', 'pptx', 'ppt'].includes(ext || '')) {
                                                        toast.info('Excel/Word files will be downloaded for viewing');
                                                        const url = URL.createObjectURL(file.file);
                                                        const a = document.createElement('a');
                                                        a.href = url;
                                                        a.download = file.name;
                                                        a.click();
                                                        URL.revokeObjectURL(url);
                                                    } else {
                                                        const url = URL.createObjectURL(file.file);
                                                        window.open(url, '_blank');
                                                    }
                                                }
                                            }}
                                            className="h-7 px-2 text-[#1e40af] hover:text-blue-700 hover:bg-blue-50 text-[10px] font-bold uppercase"
                                        >
                                            View
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={downloadFile}
                                            className="h-7 px-2 text-[#1e40af] hover:text-blue-700 hover:bg-blue-50 text-[10px] font-bold uppercase"
                                        >
                                            Download
                                        </Button>
                                        <button onClick={removeFile} className="text-red-500 hover:text-red-700 ml-1">
                                            <X className="h-4 w-4" />
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                        <p className="text-[10px] font-bold text-red-600 mt-1">
                            Accept File: jpg, jpeg, png, doc, ppt, excel, pdf
                        </p>
                    </div>
                </div>

                {/* Legacy Footer Buttons */}
                <div className="bg-slate-50 border-t border-slate-100 p-6 flex justify-center gap-4">
                    <Button
                        className="h-10 min-w-[120px] rounded-none bg-[#1e40af] text-[12px] font-black uppercase tracking-wider hover:bg-[#1e3abf] shadow-sm flex items-center gap-2"
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                        SEND
                    </Button>
                    <Button
                        className="h-10 min-w-[120px] rounded-none bg-orange-600 text-[12px] font-black uppercase tracking-wider hover:bg-orange-700 shadow-sm flex items-center gap-2"
                        onClick={onCancel}
                        disabled={isSubmitting}
                    >
                        <X className="h-4 w-4" />
                        CANCEL
                    </Button>
                </div>
            </div>
        </div>
    );
}
