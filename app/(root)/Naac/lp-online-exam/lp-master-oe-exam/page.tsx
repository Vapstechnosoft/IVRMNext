'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
    deleteMasterExam,
    getMasterExamList,
    getMasterOEExamInitialLoad,
    saveMasterExam,
    toggleMasterExam
} from '@/server/naac/lp-online-exam/master-oe-exam';
import { Edit, Trash2 } from 'lucide-react';
import type React from 'react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

export default function MasterOEExamPage() {
    const [exams, setExams] = useState([]);
    const [loading, setLoading] = useState(true);

    // Dropdown options
    const [years, setYears] = useState<any[]>([]);
    const [classes, setClasses] = useState<any[]>([]);
    const [subjects, setSubjects] = useState<any[]>([]);

    // Form state
    const [formData, setFormData] = useState({
        LPMOEEX_Id: 0,
        ASMAY_Id: '',
        ASMCL_Id: '',
        ISMS_Id: '',
        LPMOEEX_ExamName: '',
        LPMOEEX_TotalMarks: '',
        LPMOEEX_NoOfQuestion: ''
    });

    const fetchExams = async () => {
        setLoading(true);
        try {
            const listRes = await getMasterExamList({});
            if (listRes.success) {
                setExams(listRes.data?.$values || listRes.data || []);
            } else {
                toast.error(`API Error: ${listRes.message}`);
            }
        } catch (error: any) {
            toast.error(error?.message || 'Failed to load exams');
        } finally {
            setLoading(false);
        }
    };

    const loadData = async () => {
        setLoading(true);
        try {
            const [initRes, listRes] = await Promise.all([getMasterOEExamInitialLoad(), getMasterExamList({})]);

            if (initRes.success) {
                setYears(initRes.data?.getyear?.$values || initRes.data?.getyear || []);
                setClasses(initRes.data?.getclass?.$values || initRes.data?.getclass || []);
                setSubjects(initRes.data?.getsubjects?.$values || initRes.data?.getsubjects || []);
            }

            if (listRes.success) {
                setExams(listRes.data?.$values || listRes.data || []);
            } else {
                toast.error(`API Error: ${listRes.message}`);
            }
        } catch (error: any) {
            toast.error(error?.message || 'Failed to load exams');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSelectChange = (name: string, value: string) => {
        setFormData({ ...formData, [name]: value });
    };

    const handleSave = async () => {
        if (!formData.ASMAY_Id || !formData.ASMCL_Id || !formData.ISMS_Id || !formData.LPMOEEX_ExamName) {
            toast.error('Please fill all required fields');
            return;
        }

        try {
            const payload = {
                LPMOEEX_Id: formData.LPMOEEX_Id,
                ASMAY_Id: Number(formData.ASMAY_Id),
                ASMCL_Id: Number(formData.ASMCL_Id),
                ISMS_Id: Number(formData.ISMS_Id),
                LPMOEEX_ExamName: formData.LPMOEEX_ExamName,
                LPMOEEX_TotalMarks: formData.LPMOEEX_TotalMarks ? Number(formData.LPMOEEX_TotalMarks) : 0,
                LPMOEEX_NoOfQuestion: formData.LPMOEEX_NoOfQuestion ? Number(formData.LPMOEEX_NoOfQuestion) : 0
            };

            const res = await saveMasterExam(payload);
            if (res?.success) {
                toast.success(res.message || 'Exam saved successfully');
                setFormData({
                    LPMOEEX_Id: 0,
                    ASMAY_Id: '',
                    ASMCL_Id: '',
                    ISMS_Id: '',
                    LPMOEEX_ExamName: '',
                    LPMOEEX_TotalMarks: '',
                    LPMOEEX_NoOfQuestion: ''
                });
                fetchExams();
            } else {
                toast.error(res?.message || 'Failed to save exam');
            }
        } catch (error: any) {
            toast.error(`Error: ${error?.message || 'unknown error'}`);
        }
    };

    const handleEdit = (exam: any) => {
        setFormData({
            LPMOEEX_Id: exam.lpmoeeX_Id,
            ASMAY_Id: exam.asmaY_Id.toString(),
            ASMCL_Id: exam.asmcL_Id.toString(),
            ISMS_Id: exam.ismS_Id.toString(),
            LPMOEEX_ExamName: exam.lpmoeeX_ExamName,
            LPMOEEX_TotalMarks: exam.lpmoeeX_TotalMarks?.toString() || '',
            LPMOEEX_NoOfQuestion: exam.lpmoeeX_NoOfQuestion?.toString() || ''
        });
    };

    const handleToggle = async (id: number) => {
        try {
            const res = await toggleMasterExam(id);
            if (res.success) {
                toast.success(res.message);
                fetchExams();
            } else {
                toast.error(res.message);
            }
        } catch (_error) {
            toast.error('Error toggling exam');
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Are you sure you want to delete this exam?')) return;
        try {
            const res = await deleteMasterExam(id);
            if (res.success) {
                toast.success(res.message);
                fetchExams();
            } else {
                toast.error(res.message);
            }
        } catch (_error) {
            toast.error('Error deleting exam');
        }
    };

    return (
        <div className='container mx-auto space-y-6 p-6'>
            <Card>
                <CardHeader>
                    <CardTitle>Master OE Exam</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className='mb-6 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3'>
                        <div className='space-y-2'>
                            <Label>Academic Year</Label>
                            <Select value={formData.ASMAY_Id} onValueChange={(val) => handleSelectChange('ASMAY_Id', val)}>
                                <SelectTrigger>
                                    <SelectValue placeholder='Select Year' />
                                </SelectTrigger>
                                <SelectContent>
                                    {years.map((y) => (
                                        <SelectItem key={y.asmaY_Id} value={y.asmaY_Id.toString()}>
                                            {y.asmaY_Year}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className='space-y-2'>
                            <Label>Class</Label>
                            <Select value={formData.ASMCL_Id} onValueChange={(val) => handleSelectChange('ASMCL_Id', val)}>
                                <SelectTrigger>
                                    <SelectValue placeholder='Select Class' />
                                </SelectTrigger>
                                <SelectContent>
                                    {classes.map((c) => (
                                        <SelectItem key={c.asmcL_Id} value={c.asmcL_Id.toString()}>
                                            {c.asmcL_ClassName}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className='space-y-2'>
                            <Label>Subject</Label>
                            <Select value={formData.ISMS_Id} onValueChange={(val) => handleSelectChange('ISMS_Id', val)}>
                                <SelectTrigger>
                                    <SelectValue placeholder='Select Subject' />
                                </SelectTrigger>
                                <SelectContent>
                                    {subjects.map((s) => (
                                        <SelectItem key={s.ismS_Id} value={s.ismS_Id.toString()}>
                                            {s.ismS_SubjectName}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className='space-y-2'>
                            <Label>Exam Name</Label>
                            <Input
                                name='LPMOEEX_ExamName'
                                value={formData.LPMOEEX_ExamName}
                                onChange={handleChange}
                                placeholder='Exam Name'
                            />
                        </div>
                        <div className='space-y-2'>
                            <Label>Total Marks</Label>
                            <Input
                                name='LPMOEEX_TotalMarks'
                                type='number'
                                value={formData.LPMOEEX_TotalMarks}
                                onChange={handleChange}
                                placeholder='Total Marks'
                            />
                        </div>
                        <div className='space-y-2'>
                            <Label>No. of Questions</Label>
                            <Input
                                name='LPMOEEX_NoOfQuestion'
                                type='number'
                                value={formData.LPMOEEX_NoOfQuestion}
                                onChange={handleChange}
                                placeholder='No. of Questions'
                            />
                        </div>
                    </div>
                    <div className='mb-8 flex justify-center gap-4'>
                        <Button onClick={handleSave}>{formData.LPMOEEX_Id > 0 ? 'Update Exam' : 'Save Exam'}</Button>
                        <Button
                            variant='outline'
                            onClick={() =>
                                setFormData({
                                    LPMOEEX_Id: 0,
                                    ASMAY_Id: '',
                                    ASMCL_Id: '',
                                    ISMS_Id: '',
                                    LPMOEEX_ExamName: '',
                                    LPMOEEX_TotalMarks: '',
                                    LPMOEEX_NoOfQuestion: ''
                                })
                            }>
                            Clear
                        </Button>
                    </div>

                    {loading ? (
                        <p className='py-4 text-center'>Loading data...</p>
                    ) : (
                        <div className='overflow-x-auto'>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Sl. No</TableHead>
                                        <TableHead>Exam Name</TableHead>
                                        <TableHead>Total Marks</TableHead>
                                        <TableHead>No. of Questions</TableHead>
                                        <TableHead className='text-center'>Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {exams.length > 0 ? (
                                        exams.map((exam: any, index: number) => (
                                            <TableRow key={exam.lpmoeeX_Id}>
                                                <TableCell>{index + 1}</TableCell>
                                                <TableCell>{exam.lpmoeeX_ExamName}</TableCell>
                                                <TableCell>{exam.lpmoeeX_TotalMarks}</TableCell>
                                                <TableCell>{exam.lpmoeeX_NoOfQuestion}</TableCell>
                                                <TableCell>
                                                    <div className='flex items-center justify-center gap-6'>
                                                        <button
                                                            type='button'
                                                            onClick={() => handleEdit(exam)}
                                                            className='text-purple-600 transition-colors hover:text-purple-800'>
                                                            <Edit className='h-4 w-4' />
                                                        </button>
                                                        <div className='flex items-center gap-2'>
                                                            <span
                                                                className={`font-semibold text-sm ${exam.lpmoeeX_ActiveFlg ? 'text-green-600' : 'text-red-600'}`}>
                                                                {exam.lpmoeeX_ActiveFlg ? 'Active' : 'Deactive'}
                                                            </span>
                                                            <Switch
                                                                checked={exam.lpmoeeX_ActiveFlg}
                                                                onCheckedChange={() => handleToggle(exam.lpmoeeX_Id)}
                                                            />
                                                        </div>
                                                        <button
                                                            type='button'
                                                            onClick={() => handleDelete(exam.lpmoeeX_Id)}
                                                            className='text-red-500 transition-colors hover:text-red-700'>
                                                            <Trash2 className='h-4 w-4' />
                                                        </button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={5} className='py-6 text-center text-gray-500'>
                                                No exams found.
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
