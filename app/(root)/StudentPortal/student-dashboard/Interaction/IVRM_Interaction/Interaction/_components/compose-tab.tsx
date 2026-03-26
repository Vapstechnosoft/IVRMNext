'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Send } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { getInteractionDetails, getSection, getStudent, saveInteraction } from '../actions';

interface ComposeTabProps {
    roleFlg: string;
    configFlag: string;
    userHrmIds: number;
    onSuccess: () => void;
    isGroup: boolean;
    initialData: any;
}

export function ComposeTab({ roleFlg, configFlag, userHrmIds, onSuccess, isGroup, initialData }: ComposeTabProps) {
    const isStudent = roleFlg === 'Student';

    // User Flag (Who we are messaging)
    // For Student: SubjectTeacher, ClassTeacher, HOD, Principal
    // For Staff: Student, Teachers, HOD, Principal
    const [userFlag, setUserFlag] = useState<string>(isStudent ? 'SubjectTeacher' : 'Student');

    const [selectedRecipient, setSelectedRecipient] = useState<string>(''); // For single select
    const [selectedRecipients, setSelectedRecipients] = useState<string[]>([]); // For group select

    // Staff Dropdown States (For Student Selection)
    const [academicYears, setAcademicYears] = useState<any[]>([]);
    const [selectedYear, setSelectedYear] = useState<string>('');

    const [classList, setClassList] = useState<any[]>([]);
    const [selectedClass, setSelectedClass] = useState<string>('');

    const [sectionList, setSectionList] = useState<any[]>([]);
    const [selectedSection, setSelectedSection] = useState<string>('');

    const [studentList, setStudentList] = useState<any[]>([]);

    // Generic Recipients (For Staff->Teacher or Student->Teacher)
    const [recipients, setRecipients] = useState<any[]>([]);

    const [subject, setSubject] = useState('');
    const [message, setMessage] = useState('');
    const [isSending, setIsSending] = useState(false);

    // Initial Data Loading
    useEffect(() => {
        if (initialData) {
            // Log initialData keys to debug year resolution
            console.log('ComposeTab initialData keys:', Object.keys(initialData));
            console.log(
                'ComposeTab initialData (year fields):',
                JSON.stringify({
                    asmaY_Id: initialData.asmaY_Id,
                    academicList: initialData.academicList,
                    AcademicList: initialData.AcademicList,
                    academic_list: initialData.academic_list,
                    yearList: initialData.yearList
                })
            );

            // Support different casing variants the API might return
            const acadList =
                initialData.academicList || initialData.AcademicList || initialData.academic_list || initialData.yearList || [];

            if (acadList.length > 0) setAcademicYears(acadList);
            if (initialData.courselist) setClassList(initialData.courselist);

            // Auto-set year for student (no year dropdown visible)
            if (acadList.length > 0) {
                // Try to match the current year from initialData, else use first/current-flagged item
                const currentYear =
                    acadList.find((y: any) => y.asmaY_Id === initialData.asmaY_Id) ||
                    acadList.find((y: any) => y.selected === true || y.Selected === true || y.isCurrent === true) ||
                    acadList[0];
                if (currentYear) setSelectedYear(currentYear.asmaY_Id.toString());
            }
        }
    }, [initialData]);

    // Fetch Recipients when UserFlag changes (For everyone EXCEPT Staff->Student)
    useEffect(() => {
        // If Staff selecting Student, we use Class/Section dropdowns instead of generic fetch
        if (!isStudent && userFlag === 'Student') {
            setRecipients([]); // Clear recipients if we're going to use studentList
            return;
        }

        // For all other cases (Student messaging staff, or Staff messaging staff)
        if (userFlag) {
            fetchRecipients();
        }
    }, [userFlag, isStudent]);

    const fetchRecipients = async () => {
        try {
            const data = {
                roleflg: roleFlg,
                userflag: userFlag
            };
            const response = await getInteractionDetails(data);

            let dataList = [];
            if (response?.getdetails) {
                dataList = response.getdetails;
            } else if (response?.filterData) {
                dataList = response.filterData;
            } else if (response?.studentList) {
                dataList = response.studentList;
            } else if (response?.staffList) {
                dataList = response.staffList;
            } else if (Array.isArray(response)) {
                dataList = response;
            }

            setRecipients(dataList);
        } catch (error) {
            console.error('Error fetching details', error);
            setRecipients([]);
        }
    };

    // Staff Logic: Fetch Section when Class/Year changes (Only for Student selection)
    useEffect(() => {
        if (!isStudent && userFlag === 'Student' && selectedClass && selectedYear) {
            fetchSections();
        }
    }, [selectedClass, selectedYear, isStudent, userFlag]);

    // Staff Logic: Fetch Students when Section changes (Only for Student selection)
    useEffect(() => {
        if (!isStudent && userFlag === 'Student' && selectedSection && selectedClass && selectedYear) {
            fetchStudents();
        }
    }, [selectedSection, isStudent, userFlag]);

    const fetchSections = async () => {
        try {
            const payload = {
                ASMAY_Id: Number.parseInt(selectedYear),
                ASMCL_Id: Number.parseInt(selectedClass),
                roleflg: roleFlg
            };
            const response = await getSection(payload);
            if (response?.sectionList) {
                setSectionList(response.sectionList);
            } else {
                setSectionList([]);
            }
        } catch (err) {
            console.error('Error fetching sections', err);
            setSectionList([]);
        }
    };

    const fetchStudents = async () => {
        try {
            const payload = {
                ASMAY_Id: Number.parseInt(selectedYear),
                ASMCL_Id: Number.parseInt(selectedClass),
                ASMS_Id: Number.parseInt(selectedSection),
                roleflg: roleFlg
            };
            const response = await getStudent(payload);
            if (response?.studentList) {
                setStudentList(response.studentList);
            } else if (response?.get_student) {
                setStudentList(response.get_student);
            } else {
                setStudentList([]);
            }
        } catch (err) {
            console.error('Error fetching students', err);
            setStudentList([]);
        }
    };

    const handleSend = async () => {
        if (!subject.trim() || !message.trim()) {
            toast.error('Validation Error', { description: 'Please enter subject and message.' });
            return;
        }

        setIsSending(true);
        try {
            let arrayStudent: any[] = [];
            const arrayTeachers: any[] = [];
            let istintToId = 0;

            // Recipient Logic
            if (isStudent || (!isStudent && userFlag !== 'Student')) {
                // Using Generic Recipient List (Staff->Teacher/HOD/Principal or Student->Staff)
                if (!selectedRecipient) {
                    toast.error('Validation Error', { description: 'Please select a recipient.' });
                    setIsSending(false);
                    return;
                }

                // Determine if we are sending to a student or a staff based on the selected object
                const selectedBaseId = Number.parseInt(selectedRecipient.split('_')[0]);
                const selectedRec = recipients.find(
                    (r) => (r.HRME_Id || r.hrMe_Id || r.amsT_Id || r.AMST_Id || r.out_hrme_id)?.toString() === selectedBaseId.toString()
                );

                if (selectedRec && (selectedRec.amsT_Id || selectedRec.AMST_Id)) {
                    arrayStudent.push({ amst_Id: selectedBaseId });
                    istintToId = selectedBaseId;
                } else {
                    arrayTeachers.push({ hrme_Id: selectedBaseId });
                    istintToId = selectedBaseId;
                }
            } else {
                // Staff -> Student Logic
                if (isGroup) {
                    arrayStudent = selectedRecipients.map((id) => ({ amst_Id: Number.parseInt(id) }));
                } else {
                    if (selectedRecipient) {
                        arrayStudent.push({ amst_Id: Number.parseInt(selectedRecipient) });
                        istintToId = Number.parseInt(selectedRecipient);
                    }
                }

                if (arrayStudent.length === 0) {
                    toast.error('Validation Error', { description: 'Please select at least one recipient.' });
                    setIsSending(false);
                    return;
                }
            }

            // Resolve academic year: prefer selectedYear (set from academicList),
            // then initialData.asmaY_Id, then first item in academicList
            const resolvedYear =
                (selectedYear ? Number.parseInt(selectedYear) : 0) ||
                (initialData?.asmaY_Id ? Number(initialData.asmaY_Id) : 0) ||
                (initialData?.academicList?.[0]?.asmaY_Id ?? 0);

            const payload: any = {
                ASMAY_Id: resolvedYear,
                roleflg: roleFlg.toLowerCase(),
                userflag: userFlag,
                ISMINT_GroupOrIndFlg: isGroup ? 'Group' : 'Individual',
                ISMINT_Subject: subject,
                ISMINT_Interaction: message,
                UserId: initialData?.userId || 0,
                AMST_Id: isStudent ? userHrmIds : 0,
                ISTINT_ToId: isGroup ? 0 : istintToId,
                employee_Id: !isStudent ? userHrmIds : 0,
                ISMINT_MACAddress: '',
                ISMINT_ISPIPAddress: '',
                images_paths: [],
                arrayStudent: arrayStudent,
                arrayTeachers: arrayTeachers
            };

            const response = await saveInteraction(payload);

            if (response && (response.returnval === true || response.success === true)) {
                toast.success('Success', { description: 'Interaction saved successfully!' });
                setSubject('');
                setMessage('');
                setSelectedRecipients([]);
                setSelectedRecipient('');
                onSuccess();
            } else {
                toast.error('Error', { description: response?.message || response?.returnMessage || 'Failed to send message.' });
            }
        } catch (error) {
            console.error('Error sending message:', error);
            toast.error('Error', { description: 'Failed to send message.' });
        } finally {
            setIsSending(false);
        }
    };

    return (
        <Card className='border-t-4 border-t-primary shadow-md'>
            <CardContent className='space-y-6 pt-6'>
                {/* Role Selection Radio Group */}
                <div className='rounded-md border bg-slate-50 p-4'>
                    <Label className='mb-3 block font-semibold text-base'>Select Recipient Type:</Label>
                    <RadioGroup value={userFlag} onValueChange={setUserFlag} className='flex flex-wrap gap-6'>
                        {isStudent ? (
                            <>
                                <div className='flex items-center space-x-2'>
                                    <RadioGroupItem value='SubjectTeacher' id='r-st' />
                                    <Label htmlFor='r-st' className='cursor-pointer'>
                                        Subject Teacher
                                    </Label>
                                </div>
                                <div className='flex items-center space-x-2'>
                                    <RadioGroupItem value='ClassTeacher' id='r-ct' />
                                    <Label htmlFor='r-ct' className='cursor-pointer'>
                                        Class Teacher
                                    </Label>
                                </div>
                                <div className='flex items-center space-x-2'>
                                    <RadioGroupItem value='HOD' id='r-hod' />
                                    <Label htmlFor='r-hod' className='cursor-pointer'>
                                        HOD
                                    </Label>
                                </div>
                                <div className='flex items-center space-x-2'>
                                    <RadioGroupItem value='Principal' id='r-pri' />
                                    <Label htmlFor='r-pri' className='cursor-pointer'>
                                        Principal
                                    </Label>
                                </div>
                            </>
                        ) : (
                            <>
                                <div className='flex items-center space-x-2'>
                                    <RadioGroupItem value='Student' id='r-std' />
                                    <Label htmlFor='r-std' className='cursor-pointer'>
                                        Student
                                    </Label>
                                </div>
                                <div className='flex items-center space-x-2'>
                                    <RadioGroupItem value='Teachers' id='r-tch' />
                                    <Label htmlFor='r-tch' className='cursor-pointer'>
                                        Teachers
                                    </Label>
                                </div>
                                <div className='flex items-center space-x-2'>
                                    <RadioGroupItem value='HOD' id='r-hod-s' />
                                    <Label htmlFor='r-hod-s' className='cursor-pointer'>
                                        HOD
                                    </Label>
                                </div>
                                <div className='flex items-center space-x-2'>
                                    <RadioGroupItem value='Principal' id='r-pri-s' />
                                    <Label htmlFor='r-pri-s' className='cursor-pointer'>
                                        Principal
                                    </Label>
                                </div>
                            </>
                        )}
                    </RadioGroup>
                </div>

                {/* Staff -> Student Dropdowns (Only when Staff selects Student) */}
                {!isStudent && userFlag === 'Student' && (
                    <div className='grid grid-cols-1 gap-4 rounded-md border bg-white p-4 md:grid-cols-3'>
                        <div className='space-y-2'>
                            <Label>
                                Academic Year <span className='text-red-500'>*</span>
                            </Label>
                            <Select value={selectedYear} onValueChange={setSelectedYear}>
                                <SelectTrigger>
                                    <SelectValue placeholder='Select Year' />
                                </SelectTrigger>
                                <SelectContent>
                                    {academicYears.map((year: any) => (
                                        <SelectItem key={year.asmaY_Id} value={year.asmaY_Id.toString()}>
                                            {year.asmaY_Year}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className='space-y-2'>
                            <Label>
                                Class <span className='text-red-500'>*</span>
                            </Label>
                            <Select value={selectedClass} onValueChange={setSelectedClass}>
                                <SelectTrigger>
                                    <SelectValue placeholder='Select Class' />
                                </SelectTrigger>
                                <SelectContent>
                                    {classList.map((cls: any) => (
                                        <SelectItem key={cls.asmcL_Id} value={cls.asmcL_Id.toString()}>
                                            {cls.asmcL_ClassName}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className='space-y-2'>
                            <Label>
                                Section <span className='text-red-500'>*</span>
                            </Label>
                            <Select value={selectedSection} onValueChange={setSelectedSection}>
                                <SelectTrigger>
                                    <SelectValue placeholder='Select Section' />
                                </SelectTrigger>
                                <SelectContent>
                                    {sectionList.map((sec: any) => (
                                        <SelectItem key={sec.asmS_Id} value={sec.asmS_Id.toString()}>
                                            {sec.asmC_SectionName}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                )}

                {/* Recipient Selection */}
                <div className='space-y-2'>
                    <Label className='font-semibold text-lg'>
                        {isStudent
                            ? 'Select Recipient'
                            : userFlag === 'Student'
                              ? isGroup
                                  ? 'Select Students (Group)'
                                  : 'Select Student'
                              : `Select ${userFlag}`}{' '}
                        <span className='text-red-500'>*</span>
                    </Label>

                    {/* If Logic: 
                        1. Staff -> Student -> Group: Show Checkbox List 
                        2. Staff -> Student -> Individual: Show Dropdown 
                        3. Everyone Else: Show Dropdown from 'recipients' list 
                    */}

                    {!isStudent && userFlag === 'Student' && isGroup ? (
                        // Multi-select for Group (Staff -> Student)
                        <div className='h-48 overflow-y-auto rounded-md border bg-white p-2'>
                            {studentList.length > 0 ? (
                                studentList.map((student: any) => (
                                    <div key={student.amsT_Id} className='mb-2 flex items-center space-x-2 rounded p-1 hover:bg-slate-50'>
                                        <input
                                            type='checkbox'
                                            id={`st-${student.amsT_Id}`}
                                            checked={selectedRecipients.includes(student.amsT_Id.toString())}
                                            onChange={(e) => {
                                                if (e.target.checked) {
                                                    setSelectedRecipients([...selectedRecipients, student.amsT_Id.toString()]);
                                                } else {
                                                    setSelectedRecipients(
                                                        selectedRecipients.filter((id) => id !== student.amsT_Id.toString())
                                                    );
                                                }
                                            }}
                                            className='h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary'
                                        />
                                        <label htmlFor={`st-${student.amsT_Id}`} className='flex-1 cursor-pointer text-sm'>
                                            {student.studentName}{' '}
                                            <span className='text-muted-foreground text-xs'>({student.amsT_AdmNo || ''})</span>
                                        </label>
                                    </div>
                                ))
                            ) : (
                                <div className='flex flex-col items-center py-10 text-center text-muted-foreground text-sm'>
                                    <span className='mb-2'>No students found.</span>
                                    {(!selectedClass || !selectedSection) && (
                                        <span className='text-xs'>Please select Class & Section first.</span>
                                    )}
                                </div>
                            )}
                        </div>
                    ) : isStudent || userFlag !== 'Student' || (!isGroup && !isStudent) ? (
                        // Dropdown for Individual (Student or Staff->User)
                        <Select value={selectedRecipient} onValueChange={setSelectedRecipient}>
                            <SelectTrigger>
                                <SelectValue placeholder={`Select ${userFlag}`} />
                            </SelectTrigger>
                            <SelectContent>
                                {!isStudent && userFlag === 'Student'
                                    ? // Staff -> Student Individual List
                                      studentList.map((student: any) => (
                                          <SelectItem key={student.amsT_Id} value={student.amsT_Id.toString()}>
                                              {student.studentName}
                                          </SelectItem>
                                      ))
                                    : // Generic Recipients List
                                      recipients.map((rec: any, index: number) => {
                                          const baseId = rec.HRME_Id || rec.hrMe_Id || rec.amsT_Id || rec.AMST_Id || rec.out_hrme_id;
                                          const uniqueId = `${baseId}_${index}`;
                                          const name =
                                              rec.EmpName || rec.empName || rec.studentName || rec.AMST_FirstName || rec.out_empname;
                                          const subjectName = rec.ISMS_SubjectName || rec.out_isms_subjectname;
                                          return (
                                              <SelectItem key={uniqueId} value={uniqueId}>
                                                  {name}
                                                  {subjectName ? ` - ${subjectName}` : ''}
                                              </SelectItem>
                                          );
                                      })}
                            </SelectContent>
                        </Select>
                    ) : null}
                </div>

                <div className='space-y-2'>
                    <Label className='font-bold'>
                        Subject <span className='text-red-500'>*</span>
                    </Label>
                    <Input placeholder='Enter subject' value={subject} onChange={(e) => setSubject(e.target.value)} className='bg-white' />
                </div>

                <div className='space-y-2'>
                    <Label className='font-bold'>
                        Message <span className='text-red-500'>*</span>
                    </Label>
                    <Textarea
                        placeholder='Type your message here...'
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        className='min-h-[150px] resize-y bg-white'
                    />
                </div>

                <div className='flex justify-center gap-3 border-t pt-4 md:justify-end'>
                    <Button variant='destructive' onClick={onSuccess}>
                        <i className='fa fa-times mr-2' /> Cancel
                    </Button>
                    <Button onClick={handleSend} disabled={isSending} className='min-w-[120px]'>
                        {isSending ? <Loader2 className='mr-2 h-4 w-4 animate-spin' /> : <Send className='mr-2 h-4 w-4' />}
                        Send
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
