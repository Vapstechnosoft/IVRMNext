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
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter
} from '@/components/ui/dialog';
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
    Calendar,
    Clock,
    FileText,
    Trash2,
    Eye,
    Download
} from 'lucide-react';
import { 
    getRecipientsByRole, 
    getNDASectionsForInteraction, 
    getStudentsForInteraction,
    saveInteractionData
} from '@/server/staff-portal/interactions';
import { uploadDocument } from '@/server/document_upload';
import type { IInteractionsInitialData, IRecipient, ISaveInteractionDataRequest, IFILESLISTdata } from '@/types/staff-portal/interactions';

import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { Card, CardContent } from '@/components/ui/card';
import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';
// @ts-ignore
import mammoth from 'mammoth';

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
    const [currentTime, setCurrentTime] = useState(new Date());
    
    // Preview state
    const [previewFile, setPreviewFile] = useState<{ url: string; name: string; type: string } | null>(null);
    const [xlsxPreviewData, setXlsxPreviewData] = useState<any[][] | null>(null);
    const [docxPreviewHtml, setDocxPreviewHtml] = useState<string | null>(null);

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const roleFlg = 'Student';
    const isStudentRole = true;
    const config = data.configflag?.[0] || {};

    const availableUserTypes = useMemo(() => {
        if (!isStudentRole) {
            const types = [];
            if (data.chatwithstudent !== false) types.push({ id: 'Student', label: 'Student' });
            if (data.chatwithstaff !== false) types.push({ id: 'Teachers', label: 'Teachers' });
            
            if (mode === 'Individual' && data.chatwithstaff !== false) {
                if (config.ivrmgC_EnableHODIntFlg) types.push({ id: 'HOD', label: 'HOD' });
                types.push({ id: 'Principal', label: 'Principal' });
                if (config.ivrmgC_EnableASIntFlg) types.push({ id: 'AS', label: 'Academic Supervisor' });
                if (config.ivrmgC_EnableECIntFlg) types.push({ id: 'EC', label: 'Exam Coordinator' });
            }
            return types;
        } else {
            const types = [];
            // Safely default to true if the config flag is undefined or missing
            if (config.ivrmgC_EnableSTSUBTIntFlg !== false) types.push({ id: 'SubjectTeacher', label: 'Subject Teacher' });
            if (config.ivrmgC_EnableSTCTIntFlg !== false) types.push({ id: 'ClassTeacher', label: 'Class Teacher' });
            if (config.ivrmgC_EnableSTHODIntFlg) types.push({ id: 'HOD', label: 'HOD' }); // HOD usually explicit
            if (config.ivrmgC_EnableSTPrincipalIntFlg !== false) types.push({ id: 'Principal', label: 'Principal' });
            return types;
        }
    }, [isStudentRole, data, config, mode]);

    useEffect(() => {
        if (!userFlag || !selectedYear) return;
        const fetchDetails = async () => {
            setIsLoadingDetails(true);
            try {
                const res = await getRecipientsByRole(roleFlg, userFlag, Number(selectedYear));
                if (res.success && res.data) {
                    const detailList = Array.isArray(res.data) ? res.data : (res.data.getdetails || []);
                    // Deduplicate and group by HRME_Id, concatenating subject names
                    const groupedRecipients = Object.values(detailList.reduce((acc: any, curr: any) => {
                        const id = curr.HRME_Id || curr.AMST_Id; // Safe fallback for students
                        if (!id) return acc;
                        if (!acc[id]) {
                            acc[id] = { ...curr };
                        } else if (curr.ISMS_SubjectName) {
                            if (!acc[id].ISMS_SubjectName) {
                                acc[id].ISMS_SubjectName = curr.ISMS_SubjectName;
                            } else if (!acc[id].ISMS_SubjectName.includes(curr.ISMS_SubjectName)) {
                                acc[id].ISMS_SubjectName += `, ${curr.ISMS_SubjectName}`;
                            }
                        }
                        return acc;
                    }, {}));
                    setRecipients(groupedRecipients as any[]);
                } else {
                     setRecipients([]);
                }
            } catch (error) {
                toast.error('Failed to load recipients');
            } finally {
                setIsLoadingDetails(false);
            }
        };
        fetchDetails();
        
        setSelectedClass('');
        setSections([]);
        setSelectedSection('');
        setStudents([]);
        setSelectedRecipientId('');
        setSelectedGroupItems([]);
    }, [userFlag, selectedYear, roleFlg]);
    
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

    const handleClassChange = async (classId: string) => {
        setSelectedClass(classId);
        setSelectedSection('');
        setStudents([]);
        
        setIsLoadingDetails(true);
        try {
            const res = await getNDASectionsForInteraction(Number(classId), Number(selectedYear), roleFlg);
            if (res.success && res.data) {
                const sectionList = Array.isArray(res.data) ? res.data : (res.data.sectionList || []);
                setSections(sectionList);
            }
        } catch (error) {
            toast.error('Failed to load sections');
        } finally {
            setIsLoadingDetails(false);
        }
    };

    const handleSectionChange = async (sectionId: string) => {
        setSelectedSection(sectionId);
        setIsLoadingDetails(true);
        try {
            const res = await getStudentsForInteraction(Number(selectedClass), Number(sectionId));
            if (res.success && res.data) {
                const studentList = Array.isArray(res.data) ? res.data : (res.data.get_student || []);
                setStudents(studentList);
            }
        } catch (error) {
            toast.error('Failed to load students');
        } finally {
            setIsLoadingDetails(false);
        }
    };

    const handleSelectAll = (checked: boolean) => {
        const list = userFlag === 'Student' ? students : recipients;
        if (checked) {
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

    const handleViewFile = (fileObj: { name: string; file: File | null }) => {
        if (fileObj.file) {
            const url = URL.createObjectURL(fileObj.file);
            setPreviewFile({ url, name: fileObj.name, type: fileObj.file.type });
            
            // Handle XLSX Parsing
            if (fileObj.name.toLowerCase().endsWith('.xlsx') || fileObj.name.toLowerCase().endsWith('.xls')) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    const data = new Uint8Array(e.target?.result as ArrayBuffer);
                    const workbook = XLSX.read(data, { type: 'array' });
                    const firstSheetName = workbook.SheetNames[0];
                    const worksheet = workbook.Sheets[firstSheetName];
                    const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
                    setXlsxPreviewData(jsonData as any[][]);
                };
                reader.readAsArrayBuffer(fileObj.file);
            } else if (fileObj.name.toLowerCase().endsWith('.docx')) {
                const reader = new FileReader();
                reader.onload = async (e) => {
                    const arrayBuffer = e.target?.result as ArrayBuffer;
                    try {
                        const result = await mammoth.convertToHtml({ arrayBuffer });
                        setDocxPreviewHtml(result.value);
                    } catch (err) {
                        setDocxPreviewHtml('<p className="text-red-500 font-bold">Failed to load Word document. Please download to view.</p>');
                    }
                };
                reader.readAsArrayBuffer(fileObj.file);
            } else {
                setXlsxPreviewData(null);
                setDocxPreviewHtml(null);
            }
        }
    };

    const handleDownloadPreview = () => {
        if (previewFile) {
            saveAs(previewFile.url, previewFile.name);
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

        setIsSubmitting(true);
        try {
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

            const payload: any = {
                ISMINT_GroupOrIndFlg: mode,
                userflag: userFlag,
                ISMINT_Subject: subject,
                ISMINT_Interaction: message,
                images_paths: uploadedFiles.map(f => f.ISMID_Filepath),
                FILESLISTdata: uploadedFiles,
                ISMINT_MACAddress: '00-14-22-01-23-45', // Standard legacy test values
                ISMINT_ISPIPAddress: '192.168.1.1'
            };

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
                    toId = recipients[0]?.HRME_Id || 0;
                    if (selectedRecipientId) toId = Number(selectedRecipientId);
                    payload.arrayTeachers = [{ HRME_Id: toId }];
                }
                payload.ISTINT_ToId = toId;
            }

            const res = await saveInteractionData(payload);
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
        <div className="space-y-6 max-w-5xl mx-auto animate-in fade-in duration-500 pb-12">
            {/* Header Status */}
            <div className="flex items-center justify-between px-2">
                <div className="flex items-center gap-2">
                    <div className="h-4 w-4 rounded-full bg-primary animate-pulse" />
                    <h2 className="text-xl font-bold tracking-tight text-foreground/80">Compose Interaction</h2>
                </div>
                <Badge variant="outline" className="px-4 py-1.5 rounded-full bg-muted/30 border-primary/20 text-xs font-bold gap-2">
                    <Calendar className="h-3.5 w-3.5 text-primary" />
                    {format(new Date(), 'dd/MM/yyyy')} 
                    <span className="opacity-20">|</span>
                    <Clock className="h-3.5 w-3.5 text-primary" />
                    {format(currentTime, 'hh:mm a')}
                </Badge>
            </div>

            {/* Selection Form Card - Centered Labels like Legacy */}
            <Card className="border shadow-sm bg-background/50 backdrop-blur-sm overflow-hidden">
                <CardContent className="p-8 space-y-6 max-w-3xl mx-auto">
                    {/* User Type Selection */}
                    <RadioGroup 
                        value={userFlag} 
                        onValueChange={setUserFlag}
                        className="flex flex-wrap items-center justify-center gap-8 py-2"
                    >
                        {availableUserTypes.map((type) => (
                            <div key={type.id} className="flex items-center space-x-2">
                                <RadioGroupItem value={type.id} id={type.id} className="border-primary" />
                                <Label htmlFor={type.id} className="text-sm font-bold cursor-pointer hover:text-primary transition-colors">
                                    {type.label}
                                </Label>
                            </div>
                        ))}
                    </RadioGroup>

                    {/* Form Fields */}
                    <div className="space-y-4 pt-4 border-t border-dashed">
                        {/* Always show Year */}
                        <div className="flex items-center gap-4">
                            <Label className="w-24 text-sm font-bold text-right shrink-0">Academic Year :</Label>
                            <Select value={selectedYear} onValueChange={setSelectedYear}>
                                <SelectTrigger className="flex-1 h-9 bg-background border rounded-md font-medium text-sm">
                                    <SelectValue placeholder="Select Year" />
                                </SelectTrigger>
                                <SelectContent>
                                    {data.allacademicyear?.map((year) => (
                                        <SelectItem key={year.asmaY_Id} value={year.asmaY_Id.toString()}>
                                            {year.asmaY_Year}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {userFlag === 'Student' && (
                            <>
                                <div className="flex items-center gap-4">
                                    <Label className="w-24 text-sm font-bold text-right shrink-0">Class : <span className="text-red-500">*</span></Label>
                                    <Select value={selectedClass} onValueChange={handleClassChange}>
                                        <SelectTrigger className="flex-1 h-9 bg-background border rounded-md font-medium text-sm">
                                            <SelectValue placeholder="Select Class" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {classList.map((cls: any) => (
                                                <SelectItem key={cls.ASMCL_Id} value={cls.ASMCL_Id.toString()}>
                                                    {cls.ASMCL_ClassName}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="flex items-center gap-4">
                                    <Label className="w-24 text-sm font-bold text-right shrink-0">Section : <span className="text-red-500">*</span></Label>
                                    <Select value={selectedSection} onValueChange={handleSectionChange} disabled={!selectedClass}>
                                        <SelectTrigger className="flex-1 h-9 bg-background border rounded-md font-medium text-sm">
                                            <SelectValue placeholder="Select Section" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {sections.map((sec: any) => (
                                                <SelectItem key={sec.asmS_Id} value={sec.asmS_Id.toString()}>
                                                    {sec.asmC_SectionName}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="flex items-center gap-4">
                                    <Label className="w-24 text-sm font-bold text-right shrink-0">Student : <span className="text-red-500">*</span></Label>
                                    {mode === 'Individual' ? (
                                        <Select value={selectedRecipientId} onValueChange={setSelectedRecipientId} disabled={!selectedSection}>
                                            <SelectTrigger className="flex-1 h-9 bg-background border rounded-md font-medium text-sm">
                                                <SelectValue placeholder="Select Student" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {students.map((s) => (
                                                    <SelectItem key={s.AMST_Id} value={s.AMST_Id?.toString() || ''}>
                                                        {s.studentName}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    ) : (
                                        <div className="flex-1">
                                            <Badge variant="secondary" className="px-3 py-1 font-bold text-[10px] rounded-lg">
                                                {selectedGroupItems.length} selected
                                            </Badge>
                                        </div>
                                    )}
                                </div>
                            </>
                        )}

                        {userFlag && userFlag !== 'Student' && mode === 'Individual' && (
                            <div className="flex items-center gap-4">
                                <Label className="w-24 text-sm font-bold text-right shrink-0">{userFlag} : <span className="text-red-500">*</span></Label>
                                <Select value={selectedRecipientId} onValueChange={setSelectedRecipientId}>
                                    <SelectTrigger className="flex-1 h-9 bg-background border rounded-md font-medium text-sm">
                                        <SelectValue placeholder={`Select ${userFlag.toLowerCase()}`} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {recipients.map((r) => (
                                            <SelectItem key={r.HRME_Id} value={r.HRME_Id?.toString() || ''}>
                                                {r.EmpName} {r.ISMS_SubjectName ? `(${r.ISMS_SubjectName})` : ''}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Recipient Grid for Group Mode */}
            {mode === 'Group' && userFlag && (
                <Card className="border border-t-0 -mt-6 pt-6 rounded-t-none bg-muted/5">
                    <CardContent className="p-6 space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Users className="h-4 w-4 text-primary" />
                                <span className="text-xs font-bold uppercase tracking-wider">Select Group Recipients</span>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="relative w-48">
                                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                                    <Input 
                                        className="h-8 pl-8 text-xs font-medium bg-background border shadow-none" 
                                        placeholder="Filter list..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                </div>
                                <div className="flex items-center gap-2">
                                    <Checkbox 
                                        id="sel-all" 
                                        checked={(userFlag === 'Student' ? students : recipients).length > 0 && selectedGroupItems.length === (userFlag === 'Student' ? students : recipients).length}
                                        onCheckedChange={(checked) => handleSelectAll(checked === true)}
                                    />
                                    <Label htmlFor="sel-all" className="text-xs font-bold uppercase">All</Label>
                                </div>
                            </div>
                        </div>
                        <ScrollArea className="h-[250px] border rounded-lg bg-background">
                            <div className="p-3 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                                {(userFlag === 'Student' ? filteredStudentsList : filteredRecipientsList).map(item => {
                                    const id = userFlag === 'Student' ? item.AMST_Id! : item.HRME_Id!;
                                    const name = userFlag === 'Student' ? item.studentName : item.EmpName;
                                    const sub = userFlag === 'Student' ? item.AMST_AdmNo : item.HRME_EmployeeCode;
                                    return (
                                        <div 
                                            key={id} 
                                            className={cn(
                                                "flex items-center gap-3 p-2 rounded-md border text-xs font-medium cursor-pointer transition-colors",
                                                selectedGroupItems.includes(id) ? "bg-primary/5 border-primary" : "hover:bg-muted/50"
                                            )}
                                            onClick={() => toggleItemSelection(id)}
                                        >
                                            <Checkbox checked={selectedGroupItems.includes(id)} />
                                            <div className="flex flex-col min-w-0">
                                                <span className="truncate block">{name}</span>
                                                <span className="text-[10px] text-muted-foreground font-bold">{sub}</span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </ScrollArea>
                    </CardContent>
                </Card>
            )}

            {/* Message Area Card - Integrated buttons exactly like legacy */}
            <Card className="border shadow-md overflow-hidden ring-1 ring-primary/10">
                <div className="bg-primary/90 text-white px-6 py-2.5 flex items-center justify-between">
                    <h3 className="text-xs font-bold uppercase tracking-[0.1em]">New Message</h3>
                    <div className="flex items-center gap-2 opacity-80 text-[10px] font-bold">
                        {format(currentTime, 'dd/MM/yyyy hh:mm a')}
                    </div>
                </div>
                <CardContent className="p-0">
                    <div className="p-8 space-y-6">
                        <div className="flex gap-6">
                            <Label className="w-20 pt-2 text-sm font-bold text-right shrink-0">Subject : <span className="text-red-500">*</span></Label>
                            <div className="flex-1 space-y-4">
                                <Input 
                                    className="h-10 text-sm font-medium border focus-visible:ring-primary/20" 
                                    placeholder="Interaction Subject"
                                    value={subject}
                                    onChange={(e) => setSubject(e.target.value)}
                                />
                                <Textarea 
                                    className="min-h-[160px] text-sm font-medium border resize-none p-4" 
                                    placeholder="Message details..."
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                />
                            </div>
                        </div>

                        {/* Action Buttons inside the card logic */}
                        <div className="flex items-center justify-end gap-3 pt-4 border-t">
                            <Button 
                                className="bg-primary hover:bg-primary/90 rounded-md font-bold px-8" 
                                disabled={isSubmitting}
                                onClick={handleSubmit}
                            >
                                {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Send className="h-4 w-4 mr-2" />}
                                SEND
                            </Button>
                            <Button 
                                variant="outline" 
                                className="bg-orange-500 hover:bg-orange-600 text-white border-none rounded-md font-bold px-8"
                                onClick={onCancel}
                            >
                                <X className="h-4 w-4 mr-2" />
                                CANCEL
                            </Button>
                        </div>
                    </div>

                    {/* Attachment Table-Like UI */}
                    <div className="overflow-hidden border-t">
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-[#1a5f7a] text-white text-[10px] font-bold uppercase">
                                <tr>
                                    <th className="px-4 py-2 text-center border-r border-white/10 w-16">SL NO</th>
                                    <th className="px-4 py-2 border-r border-white/10 w-32">Upload File</th>
                                    <th className="px-4 py-2 border-r border-white/10">File Name</th>
                                    <th className="px-4 py-2 border-r border-white/10 w-20 text-center">View</th>
                                    <th className="px-4 py-2 text-center w-20">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {files.map((file, idx) => (
                                    <tr key={idx} className="border-b last:border-b-0 hover:bg-muted/30 transition-colors">
                                        <td className="px-4 py-2 text-center border-r font-bold text-xs">{idx + 1}</td>
                                        <td className="px-4 py-2 border-r relative">
                                            <Button size="sm" variant="outline" className="h-7 w-full text-[10px] font-bold bg-primary/90 text-white border-none shadow-sm cursor-pointer relative overflow-hidden">
                                                Browse
                                                <input 
                                                    type="file" 
                                                    className="absolute inset-0 opacity-0 cursor-pointer" 
                                                    onChange={(e) => handleFileChange(idx, e)}
                                                />
                                            </Button>
                                        </td>
                                        <td className="px-4 py-2 border-r">
                                            <div className="h-7 border rounded bg-background flex items-center px-2">
                                                <span className="text-[10px] font-medium truncate max-w-[300px]">
                                                    {file.name || ''}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-2 text-center border-r">
                                            {file.name ? (
                                                <Button 
                                                    variant="ghost" 
                                                    size="icon" 
                                                    className="h-6 w-6 text-primary hover:bg-primary/10"
                                                    onClick={() => handleViewFile(file)}
                                                >
                                                    <Eye className="h-4 w-4" />
                                                </Button>
                                            ) : null}
                                        </td>
                                        <td className="px-4 py-2 text-center">
                                            <div className="flex items-center justify-center gap-1">
                                                <Button 
                                                    variant="ghost" 
                                                    size="icon" 
                                                    className="h-6 w-6 text-primary hover:bg-primary/10 rounded-sm border"
                                                    onClick={addNewFile}
                                                >
                                                    <Plus className="h-3.5 w-3.5" />
                                                </Button>
                                                {files.length > 1 && (
                                                    <Button 
                                                        variant="ghost" 
                                                        size="icon" 
                                                        className="h-6 w-6 text-red-500 hover:bg-red-50 rounded-sm border"
                                                        onClick={() => removeFile(idx)}
                                                    >
                                                        <Trash2 className="h-3.5 w-3.5" />
                                                    </Button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>

            {/* Image Preview Modal */}
            <Dialog open={!!previewFile} onOpenChange={(open) => {
                if (!open) {
                    setPreviewFile(null);
                    setXlsxPreviewData(null);
                    setDocxPreviewHtml(null);
                }
            }}>
                <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col p-0 overflow-hidden rounded-2xl border-none shadow-2xl">
                    <DialogHeader className="p-6 bg-primary text-white flex-row items-center justify-between space-y-0">
                        <DialogTitle className="text-lg font-bold truncate pr-8">{previewFile?.name}</DialogTitle>
                        <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 text-white hover:bg-white/20 rounded-full"
                            onClick={() => setPreviewFile(null)}
                        >
                            <X className="h-5 w-5" />
                        </Button>
                    </DialogHeader>
                    <div className="flex-1 overflow-auto bg-muted/20 p-8 flex items-center justify-center min-h-[300px]">
                        {previewFile?.url && (
                            previewFile.type?.startsWith('video/') ? (
                                <video 
                                    src={previewFile.url} 
                                    controls 
                                    className="max-w-full max-h-full rounded-lg shadow-xl"
                                    autoPlay
                                />
                            ) : previewFile.type?.startsWith('audio/') ? (
                                <div className="flex flex-col items-center gap-6 w-full max-w-md bg-background p-10 rounded-2xl shadow-xl border">
                                    <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center">
                                        <FileText className="h-10 w-10 text-primary" />
                                    </div>
                                    <audio 
                                        src={previewFile.url} 
                                        controls 
                                        className="w-full"
                                        autoPlay
                                    />
                                    <p className="text-sm font-bold text-muted-foreground">{previewFile.name}</p>
                                </div>
                            ) : previewFile.type === 'application/pdf' ? (
                                <iframe 
                                    src={previewFile.url} 
                                    className="w-full h-full min-h-[600px] border-none rounded-lg"
                                    title={previewFile.name}
                                />
                            ) : xlsxPreviewData ? (
                                <div className="w-full h-full min-h-[500px] bg-background rounded-lg border overflow-hidden flex flex-col shadow-inner">
                                    <div className="bg-muted/50 px-4 py-2 border-b flex items-center justify-between">
                                        <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Excel Preview (First 50 Rows)</span>
                                        <Badge variant="outline" className="text-[9px] bg-green-50 text-green-700 border-green-200">XLSX DATA</Badge>
                                    </div>
                                    <ScrollArea className="flex-1 w-full overflow-auto">
                                        <div className="p-4">
                                            <table className="w-full border-collapse text-[11px] font-medium">
                                                <tbody>
                                                    {xlsxPreviewData.slice(0, 50).map((row, rIdx) => (
                                                        <tr key={rIdx} className={cn("hover:bg-muted/30 transition-colors", rIdx === 0 && "bg-muted/80 font-bold border-b-2")}>
                                                            {row.map((cell: any, cIdx: number) => (
                                                                <td key={cIdx} className="border p-2 min-w-[120px] whitespace-nowrap">
                                                                    {cell?.toString() || ''}
                                                                </td>
                                                            ))}
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                            {xlsxPreviewData.length > 50 && (
                                                <div className="p-4 text-center text-muted-foreground text-xs font-bold bg-muted/10 mt-2 border-t border-dashed">
                                                    Showing first 50 rows. Download to see all {xlsxPreviewData.length} rows.
                                                </div>
                                            )}
                                        </div>
                                    </ScrollArea>
                                </div>
                            ) : docxPreviewHtml ? (
                                <div className="w-full h-full min-h-[500px] bg-background rounded-lg border overflow-hidden flex flex-col shadow-inner">
                                    <div className="bg-muted/50 px-4 py-2 border-b flex items-center justify-between">
                                        <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Word Document Preview</span>
                                        <Badge variant="outline" className="text-[9px] bg-blue-50 text-blue-700 border-blue-200">DOCX CONTENT</Badge>
                                    </div>
                                    <ScrollArea className="flex-1 w-full overflow-auto bg-white">
                                        <div 
                                            className="p-10 prose prose-sm max-w-none prose-slate"
                                            dangerouslySetInnerHTML={{ __html: docxPreviewHtml }}
                                        />
                                    </ScrollArea>
                                </div>
                            ) : previewFile.type?.startsWith('image/') ? (
                                <img 
                                    src={previewFile.url} 
                                    alt={previewFile.name} 
                                    className="max-w-full max-h-full object-contain rounded-lg shadow-xl" 
                                />
                            ) : (
                                <div className="flex flex-col items-center gap-6 w-full max-w-md bg-background p-10 rounded-2xl shadow-xl border">
                                    <div className="h-20 w-20 rounded-full bg-slate-100 flex items-center justify-center">
                                        <FileText className="h-10 w-10 text-slate-400" />
                                    </div>
                                    <div className="text-center space-y-2">
                                        <h4 className="font-bold">Document Preview Unavailable</h4>
                                        <p className="text-xs text-muted-foreground">This file type ({previewFile.name.split('.').pop()?.toUpperCase()}) cannot be viewed directly in the browser.</p>
                                    </div>
                                    <Button 
                                        className="w-full h-12 bg-primary hover:bg-primary/90 font-bold gap-2"
                                        onClick={handleDownloadPreview}
                                    >
                                        <Download className="h-4 w-4" />
                                        Download to View
                                    </Button>
                                </div>
                            )
                        )}
                    </div>
                    <DialogFooter className="p-6 bg-background border-t gap-3">
                        <Button 
                            variant="outline" 
                            className="rounded-full px-6 font-bold"
                            onClick={() => setPreviewFile(null)}
                        >
                            Close
                        </Button>
                        <Button 
                            className="rounded-full px-8 bg-primary hover:bg-primary/90 font-black gap-2 shadow-lg shadow-primary/20"
                            onClick={handleDownloadPreview}
                        >
                            <Download className="h-4 w-4" />
                            {previewFile?.type?.startsWith('video/') ? 'Download Video' : 
                             previewFile?.type?.startsWith('audio/') ? 'Download Audio' : 
                             previewFile?.type?.startsWith('image/') ? 'Download Image' :
                             previewFile?.type === 'application/pdf' ? 'Download PDF' : 'Download File'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
