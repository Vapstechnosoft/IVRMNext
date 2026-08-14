'use client';

import { useState, useEffect } from 'react';
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
    Search
} from 'lucide-react';
import {
    getRecipientsByRole,
    getSectionsForInteraction,
    getStudentsForInteraction,
    saveInteraction
} from '@/server/staff-portal/interactions';
import type { IInteractionsInitialData, IRecipient, ISaveInteractionRequest } from '@/types/staff-portal/interactions';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface ComposeTabProps {
    data: IInteractionsInitialData;
    mode: 'Group' | 'Individual';
    onCancel: () => void;
    onSuccess: () => void;
}
export const dynamic = 'force-dynamic';
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
    const [selectedYear, setSelectedYear] = useState<string>('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoadingDetails, setIsLoadingDetails] = useState(false);

    const [files, setFiles] = useState<{ name: string; file: File | null; path?: string }[]>([{ name: '', file: null }]);
    const [searchTerm, setSearchTerm] = useState('');

    const roleFlg = data.roletype?.[0]?.ivrmrT_Role || 'Staff';

    // Recipient selection logic
    useEffect(() => {
        if (!userFlag || !selectedYear) return;
        const fetchDetails = async () => {
            setIsLoadingDetails(true);
            try {
                const res = await getRecipientsByRole(roleFlg, userFlag, Number(selectedYear));
                if (res.success && res.data) {
                    setRecipients(res.data.getdetails || []);
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

    // Fetch sections when class changes
    const handleClassChange = async (classId: string) => {
        setSelectedClass(classId);
        setSelectedSection('');
        setStudents([]);

        setIsLoadingDetails(true);
        try {
            const res = await getSectionsForInteraction(Number(classId), 0, roleFlg);
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
            const allIds = userFlag === 'student'
                ? students.map(s => s.AMST_Id!).filter(Boolean)
                : recipients.map(r => r.HRME_Id!).filter(Boolean);
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

        setIsSubmitting(true);
        try {
            const payload: ISaveInteractionRequest = {
                roleflg: roleFlg,
                userflag: userFlag,
                ismint_ComposedByFlg: roleFlg,
                ismint_GroupOrIndFlg: mode,
                ismint_Subject: subject,
                ismint_Interaction: message,
                ASMAY_Id: Number(selectedYear),
            };

            // Map recipients based on mode and flag
            if (mode === 'Group') {
                if (userFlag === 'student') {
                    payload.arrayStudent = students.filter(s => selectedGroupItems.includes(s.AMST_Id!));
                } else if (userFlag === 'staff') {
                    payload.arrayTeachers = recipients.filter(r => selectedGroupItems.includes(r.HRME_Id!));
                }
            } else {
                if (userFlag === 'student') {
                    payload.student_Id = Number(selectedRecipientId);
                } else if (userFlag === 'staff') {
                    payload.employee_Id = Number(selectedRecipientId);
                } else {
                    // principal / hod / as / ec
                    payload.istint_ToId = recipients[0]?.HRME_Id;
                }
            }

            const res = await saveInteraction(payload);
            if (res.success && res.data?.returnval) {
                toast.success('Message sent successfully');
                onSuccess();
            } else {
                toast.error(res.message || 'Failed to send message');
            }
        } catch (error) {
            toast.error('An error occurred while sending');
        } finally {
            setIsSubmitting(false);
        }
    };

    const filteredRecipients = recipients.filter(r =>
        (r.EmpName || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    const filteredStudents = students.filter(s =>
        (s.studentName || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="flex flex-col gap-8">
            <div className="grid gap-6 md:grid-cols-2">
                <div className="flex flex-col gap-6 rounded-lg border bg-card/10 p-6">
                    <div className="space-y-4">
                        <div className="space-y-4">
                            <Label className="text-base font-semibold">Academic Year</Label>
                            <Select value={selectedYear} onValueChange={setSelectedYear}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select Academic Year" />
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

                        <Label className="text-base font-semibold mt-4">User Type</Label>
                        <RadioGroup
                            value={userFlag}
                            onValueChange={setUserFlag}
                            className="grid grid-cols-2 gap-4"
                        >
                            <Label className="flex cursor-pointer items-center gap-2 rounded-md border p-3 hover:bg-accent has-[:checked]:border-primary has-[:checked]:bg-primary/5">
                                <RadioGroupItem value="student" />
                                <span>Student</span>
                            </Label>
                            <Label className="flex cursor-pointer items-center gap-2 rounded-md border p-3 hover:bg-accent has-[:checked]:border-primary has-[:checked]:bg-primary/5">
                                <RadioGroupItem value="staff" />
                                <span>Staff</span>
                            </Label>
                            <Label className="flex cursor-pointer items-center gap-2 rounded-md border p-3 hover:bg-accent has-[:checked]:border-primary has-[:checked]:bg-primary/5">
                                <RadioGroupItem value="hod" />
                                <span>HOD</span>
                            </Label>
                            <Label className="flex cursor-pointer items-center gap-2 rounded-md border p-3 hover:bg-accent has-[:checked]:border-primary has-[:checked]:bg-primary/5">
                                <RadioGroupItem value="principal" />
                                <span>Principal</span>
                            </Label>
                            <Label className="flex cursor-pointer items-center gap-2 rounded-md border p-3 hover:bg-accent has-[:checked]:border-primary has-[:checked]:bg-primary/5">
                                <RadioGroupItem value="as" />
                                <span className="text-xs">Academic Supervisor</span>
                            </Label>
                            <Label className="flex cursor-pointer items-center gap-2 rounded-md border p-3 hover:bg-accent has-[:checked]:border-primary has-[:checked]:bg-primary/5">
                                <RadioGroupItem value="ec" />
                                <span>EC</span>
                            </Label>
                        </RadioGroup>
                    </div>

                    {userFlag === 'student' && (
                        <div className="space-y-4 animate-in fade-in slide-in-from-top-1">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Class</Label>
                                    <Select value={selectedClass} onValueChange={handleClassChange}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select Class" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {recipients.map((cls: any) => (
                                                <SelectItem key={cls.ASMCL_Id} value={cls.ASMCL_Id.toString()}>
                                                    {cls.ASMCL_ClassName}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label>Section</Label>
                                    <Select
                                        value={selectedSection}
                                        onValueChange={handleSectionChange}
                                        disabled={!selectedClass}
                                    >
                                        <SelectTrigger>
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
                            </div>
                        </div>
                    )}

                    <div className="relative mt-2 min-h-[100px] space-y-4 rounded-md border border-dashed p-4">
                        {isLoadingDetails ? (
                            <div className="flex items-center justify-center py-10">
                                <Loader2 className="h-6 w-6 animate-spin text-primary" />
                            </div>
                        ) : !userFlag ? (
                            <div className="flex flex-col items-center justify-center text-muted-foreground opacity-50">
                                <Users className="mb-2 h-8 w-8" />
                                <p className="text-sm">Select user type to start</p>
                            </div>
                        ) : mode === 'Group' ? (
                            <div className="space-y-3">
                                <div className="flex items-center justify-between gap-4">
                                    <div className="relative flex-1">
                                        <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                                        <Input
                                            placeholder="Search..."
                                            className="h-8 pl-8 text-xs"
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                        />
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Checkbox
                                            id="select-all-scs"
                                            onCheckedChange={handleSelectAll}
                                            checked={
                                                (userFlag === 'student' ? students : recipients).length > 0 &&
                                                selectedGroupItems.length === (userFlag === 'student' ? students : recipients).length
                                            }
                                        />
                                        <Label htmlFor="select-all-scs" className="text-xs">All</Label>
                                    </div>
                                </div>

                                <ScrollArea className="h-[250px] pr-4">
                                    <div className="grid gap-2">
                                        {(userFlag === 'student' ? filteredStudents : filteredRecipients).map((item) => {
                                            const id = userFlag === 'student' ? item.AMST_Id! : item.HRME_Id!;
                                            const name = userFlag === 'student' ? item.studentName : item.EmpName;
                                            return (
                                                <div
                                                    key={id}
                                                    className={cn(
                                                        "flex items-center gap-3 rounded-md border p-2 transition-colors hover:bg-accent/50",
                                                        selectedGroupItems.includes(id) && "bg-primary/5 border-primary"
                                                    )}
                                                    onClick={() => toggleItemSelection(id)}
                                                >
                                                    <Checkbox checked={selectedGroupItems.includes(id)} />
                                                    <div className="flex flex-col">
                                                        <span className="text-xs font-medium">{name}</span>
                                                        {item.AMST_AdmNo && (
                                                            <span className="text-[10px] text-muted-foreground">Adm: {item.AMST_AdmNo}</span>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </ScrollArea>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {['principal', 'hod', 'as', 'ec'].includes(userFlag) ? (
                                    <div className="rounded-md bg-muted p-3 text-sm font-medium border border-primary/20 flex items-center gap-3">
                                        <div className="bg-primary/10 p-2 rounded-full text-primary">
                                            <User className="h-4 w-4" />
                                        </div>
                                        {recipients[0]?.EmpName || `${userFlag} Selected`}
                                    </div>
                                ) : (
                                    <div className="space-y-2">
                                        <Label>Recipient</Label>
                                        <Select value={selectedRecipientId} onValueChange={setSelectedRecipientId}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select Individual" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {(userFlag === 'student' ? students : recipients).map((item) => {
                                                    const id = userFlag === 'student' ? item.AMST_Id! : item.HRME_Id!;
                                                    const name = userFlag === 'student' ? item.studentName : item.EmpName;
                                                    return (
                                                        <SelectItem key={id} value={id.toString()}>
                                                            {name} {item.AMST_AdmNo ? `(${item.AMST_AdmNo})` : ''}
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

                <div className="flex flex-col gap-6">
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label>Subject <span className="text-destructive">*</span></Label>
                            <Input
                                placeholder="Message Subject"
                                value={subject}
                                onChange={(e) => setSubject(e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Message <span className="text-destructive">*</span></Label>
                            <Textarea
                                placeholder="Write your message here..."
                                className="min-h-[150px] resize-none"
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="space-y-3">
                        <Label className="flex items-center gap-2">
                            <Paperclip className="h-4 w-4" />
                            Attachments
                        </Label>
                        <div className="grid gap-3">
                            {files.map((file, idx) => (
                                <div key={idx} className="flex items-center gap-2">
                                    <div className="relative flex-1 group">
                                        <div className="flex h-10 w-full items-center justify-between rounded-md border bg-muted/50 px-3 py-2 text-sm">
                                            <span className="truncate max-w-[200px]">
                                                {file.name || 'No file selected'}
                                            </span>
                                            <Input
                                                type="file"
                                                className="absolute inset-0 opacity-0 cursor-pointer"
                                                onChange={(e) => handleFileChange(idx, e)}
                                            />
                                            {!file.name && <Plus className="h-4 w-4 opacity-40" />}
                                        </div>
                                    </div>
                                    {files.length > 1 && (
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-10 w-10 text-destructive"
                                            onClick={() => removeFile(idx)}
                                        >
                                            <X className="h-4 w-4" />
                                        </Button>
                                    )}
                                    {idx === files.length - 1 && (
                                        <Button
                                            variant="outline"
                                            size="icon"
                                            className="h-10 w-10"
                                            onClick={addNewFile}
                                        >
                                            <Plus className="h-4 w-4" />
                                        </Button>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex items-center justify-end gap-3 border-t pt-6">
                <Button variant="ghost" onClick={onCancel} disabled={isSubmitting}>
                    Cancel
                </Button>
                <Button
                    className="min-w-[150px]"
                    onClick={handleSubmit}
                    disabled={isSubmitting || !userFlag}
                >
                    {isSubmitting ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Sending...
                        </>
                    ) : (
                        <>
                            <Send className="mr-2 h-4 w-4" />
                            Send Message
                        </>
                    )}
                </Button>
            </div>
        </div>
    );
}
