'use client';

import React, { useState, useMemo, useEffect, useRef } from 'react';
import { toast } from 'sonner';
import { 
    Eye, 
    Search, 
    Trash2, 
    X, 
    Loader2, 
    Download, 
    RotateCcw, 
    Upload, 
    FileText, 
    ArrowRight,
    ChevronLeft,
    ChevronRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/extension/field';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { uploadDocument } from '@/server/document_upload';
import {
    useMasterQuestionBankLoadData,
    useMasterQuestionBankSubjects,
    useMasterQuestionBankSave,
    useMasterQuestionBankDelete,
    useMasterQuestionBankSearch
} from '@/hooks/admission/preadmission/transactions/useMasterQuestionBank';

export default function MasterQuestionBankPage() {
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Queries & Mutations
    const { data: loadData, isLoading: isLoadDataLoading, refetch: refetchLoadData } = useMasterQuestionBankLoadData();
    const getSubjectsMutation = useMasterQuestionBankSubjects();
    const saveMutation = useMasterQuestionBankSave();
    const deleteMutation = useMasterQuestionBankDelete();
    const searchMutation = useMasterQuestionBankSearch();

    // Normalized Data
    const normalizedLoadData = useMemo(() => {
        if (!loadData) return null;
        return (loadData as any).data || loadData;
    }, [loadData]);

    const years = useMemo(() => {
        return normalizedLoadData?.yearlist || normalizedLoadData?.year_list || [];
    }, [normalizedLoadData]);

    const classes = useMemo(() => {
        return normalizedLoadData?.classlist || [];
    }, [normalizedLoadData]);

    const questionPapers = useMemo(() => {
        return normalizedLoadData?.questionpapergrid || [];
    }, [normalizedLoadData]);

    // Form State
    const [academicYearId, setAcademicYearId] = useState<number | null>(null);
    const [classId, setClassId] = useState<number | null>(null);
    const [subjectId, setSubjectId] = useState<number | null>(null);
    const [examName, setExamName] = useState('');
    const [questionPaperName, setQuestionPaperName] = useState('');
    
    // File State
    const [uploadedFilePath, setUploadedFilePath] = useState('');
    const [originalFileName, setOriginalFileName] = useState('');
    const [isUploading, setIsUploading] = useState(false);

    // Dynamic cascaded state
    const [subjectList, setSubjectList] = useState<any[]>([]);

    // Grid states
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;

    // Search Modal States
    const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<any[]>([]);
    
    // Preview Modal States
    const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
    const [previewUrl, setPreviewUrl] = useState('');
    const [previewFileName, setPreviewFileName] = useState('');

    // Fetch subjects when Class or Academic Year changes
    useEffect(() => {
        if (academicYearId && classId) {
            getSubjectsMutation.mutate(
                { ASMAY_Id: academicYearId, ASMCL_Id: classId },
                {
                    onSuccess: (res: any) => {
                        const list = res?.subjectlist1 || res?.subjectlist || [];
                        setSubjectList(list);
                        // Reset subject selected if it's no longer in the list
                        setSubjectId(null);
                    },
                    onError: () => {
                        toast.error('Failed to load subjects for selection');
                        setSubjectList([]);
                    }
                }
            );
        } else {
            setSubjectList([]);
            setSubjectId(null);
        }
    }, [academicYearId, classId]);

    // Handle File Upload
    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Size check (5MB limit)
        if (file.size > 5242880) {
            toast.warning('File size must be less than 5 MB');
            if (fileInputRef.current) fileInputRef.current.value = '';
            return;
        }

        // Format check (PDF only)
        if (file.type !== 'application/pdf') {
            toast.warning('Only PDF files are allowed');
            if (fileInputRef.current) fileInputRef.current.value = '';
            return;
        }

        try {
            setIsUploading(true);
            const formData = new FormData();
            formData.append('file', file);
            formData.append('FileName', file.name);
            formData.append('ContentType', file.type);
            formData.append('subContainerName', 'master_question_bank');

            const response = await uploadDocument(formData);

            if (response.success && response.data) {
                setUploadedFilePath(response.data);
                setOriginalFileName(file.name);
                toast.success('Question paper uploaded successfully');
            } else {
                throw new Error(response.message || 'Upload failed');
            }
        } catch (error: any) {
            toast.error(error.message || 'File upload failed');
            setUploadedFilePath('');
            setOriginalFileName('');
            if (fileInputRef.current) fileInputRef.current.value = '';
        } finally {
            setIsUploading(false);
        }
    };

    // Save Data
    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!academicYearId) {
            toast.error('Please select Academic Year');
            return;
        }
        if (!classId) {
            toast.error('Please select Class');
            return;
        }
        if (!subjectId) {
            toast.error('Please select Subject');
            return;
        }
        if (!examName.trim()) {
            toast.error('Please enter Exam Name');
            return;
        }
        if (!questionPaperName.trim()) {
            toast.error('Please enter Question Paper Name');
            return;
        }
        if (!uploadedFilePath) {
            toast.error('Please upload a Question Paper PDF');
            return;
        }

        const payload = {
            ASMAY_Id: academicYearId,
            ASMCL_Id: classId,
            ISMS_Id: subjectId,
            LPPRQP_ExamName: examName.trim(),
            LPPRQPF_FilePath: uploadedFilePath,
            LPPRQPF_FileName: questionPaperName.trim(),
            filename_orignal: originalFileName
        };

        saveMutation.mutate(payload, {
            onSuccess: (res: any) => {
                if (res?.returnval === true || res?.success === true || res) {
                    toast.success('Question paper saved successfully');
                    handleReset();
                    refetchLoadData();
                } else {
                    toast.error(res?.message || 'Failed to save question paper');
                }
            },
            onError: (err: any) => {
                toast.error(err?.message || 'An error occurred while saving');
            }
        });
    };

    // Reset Form
    const handleReset = () => {
        setAcademicYearId(null);
        setClassId(null);
        setSubjectId(null);
        setExamName('');
        setQuestionPaperName('');
        setUploadedFilePath('');
        setOriginalFileName('');
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    // Delete Record
    const handleDelete = (record: any) => {
        if (!window.confirm('Are you sure you want to delete this question paper?')) {
            return;
        }

        deleteMutation.mutate(record, {
            onSuccess: (res: any) => {
                if (res?.returnval === true || res?.success === true || res) {
                    toast.success('Record deleted successfully');
                    refetchLoadData();
                } else {
                    toast.error(res?.message || 'Failed to delete record');
                }
            },
            onError: (err: any) => {
                toast.error(err?.message || 'An error occurred while deleting');
            }
        });
    };

    // AI PDF Search
    const handleAISearch = () => {
        if (!searchQuery.trim()) {
            toast.warning('Please enter a search query');
            return;
        }

        searchMutation.mutate(
            { searchparameter: searchQuery.trim() },
            {
                onSuccess: (res: any) => {
                    const results = res?.results || res?.Results || [];
                    setSearchResults(results);
                    if (results.length === 0) {
                        toast.info('No matches found for your search query');
                    } else {
                        toast.success(`Found ${results.length} matches!`);
                    }
                },
                onError: (err: any) => {
                    toast.error(err?.message || 'AI document search failed');
                }
            }
        );
    };

    // Filtered grid records
    const filteredQuestionPapers = useMemo(() => {
        if (!searchTerm.trim()) return questionPapers;
        const term = searchTerm.toLowerCase();
        return questionPapers.filter((x: any) => {
            const className = (x.asmcL_ClassName || '').toLowerCase();
            const exam = (x.lpprqP_ExamName || '').toLowerCase();
            const subject = (x.ismS_SubjectName || '').toLowerCase();
            const fileName = (x.lpprqpF_FileName || '').toLowerCase();
            const yearName = (x.asmaY_Year || '').toLowerCase();
            return className.includes(term) || exam.includes(term) || subject.includes(term) || fileName.includes(term) || yearName.includes(term);
        });
    }, [questionPapers, searchTerm]);

    // Paginated grid records
    const paginatedQuestionPapers = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        return filteredQuestionPapers.slice(startIndex, startIndex + itemsPerPage);
    }, [filteredQuestionPapers, currentPage]);

    const totalPages = Math.max(1, Math.ceil(filteredQuestionPapers.length / itemsPerPage));

    // Reset pagination page on search change
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm]);

    // Download File Helper
    const handleDownload = async (url: string, name: string) => {
        try {
            const response = await fetch(url);
            const blob = await response.blob();
            const blobUrl = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = blobUrl;
            a.download = name || 'document.pdf';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(blobUrl);
        } catch {
            // Fallback to opening in new window
            window.open(url, '_blank');
        }
    };

    // Open File Preview
    const openPreview = (url: string, fileName: string) => {
        setPreviewUrl(url);
        setPreviewFileName(fileName);
        setIsPreviewModalOpen(true);
    };

    if (isLoadDataLoading) {
        return (
            <div className="flex h-[80vh] flex-col items-center justify-center gap-4">
                <Loader2 className="h-12 w-12 animate-spin text-indigo-600" />
                <span className="text-lg font-medium text-gray-600 animate-pulse">
                    Loading Master Question Bank Details...
                </span>
            </div>
        );
    }

    return (
        <div className="container mx-auto space-y-8 p-6 max-w-7xl animate-in fade-in duration-300">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b pb-5">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900">Master Question Bank</h1>
                    <p className="text-muted-foreground mt-1">Manage and perform AI-powered search across class exam question papers.</p>
                </div>
                <div className="flex gap-3">
                    <Button 
                        onClick={() => {
                            setSearchQuery('');
                            setSearchResults([]);
                            setIsSearchModalOpen(true);
                        }}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-md hover:shadow-lg transition-all"
                    >
                        <Search className="mr-2 h-4 w-4" />
                        AI PDF Search
                    </Button>
                </div>
            </div>

            {/* Form & Upload Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Form inputs card */}
                <div className="lg:col-span-2 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                    <h2 className="text-xl font-semibold text-slate-800 mb-6 flex items-center gap-2">
                        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-indigo-50 text-indigo-600 text-sm font-bold">1</span>
                        Enter Question Paper Information
                    </h2>
                    
                    <form onSubmit={handleSave} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Academic Year */}
                            <div className="space-y-2">
                                <Label className="text-sm font-semibold text-slate-700">
                                    Academic Year <span className="text-red-500">*</span>
                                </Label>
                                <Select 
                                    value={academicYearId ? String(academicYearId) : undefined} 
                                    onValueChange={(val) => setAcademicYearId(Number(val))}
                                >
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Select Academic Year" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {years.map((year: any) => (
                                            <SelectItem key={year.asmaY_Id} value={String(year.asmaY_Id)}>
                                                {year.asmaY_Year}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Class */}
                            <div className="space-y-2">
                                <Label className="text-sm font-semibold text-slate-700">
                                    Class <span className="text-red-500">*</span>
                                </Label>
                                <Select 
                                    value={classId ? String(classId) : undefined} 
                                    onValueChange={(val) => setClassId(Number(val))}
                                >
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Select Class" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {classes.map((cls: any) => (
                                            <SelectItem key={cls.asmcL_Id} value={String(cls.asmcL_Id)}>
                                                {cls.asmcL_ClassName}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Subject */}
                            <div className="space-y-2">
                                <Label className="text-sm font-semibold text-slate-700">
                                    Subject <span className="text-red-500">*</span>
                                </Label>
                                <Select 
                                    value={subjectId ? String(subjectId) : undefined} 
                                    onValueChange={(val) => setSubjectId(Number(val))}
                                    disabled={!classId || !academicYearId || getSubjectsMutation.isPending}
                                >
                                    <SelectTrigger className="w-full">
                                        {getSubjectsMutation.isPending ? (
                                            <div className="flex items-center gap-2">
                                                <Loader2 className="h-4 w-4 animate-spin text-indigo-600" />
                                                <span>Loading Subjects...</span>
                                            </div>
                                        ) : (
                                            <SelectValue placeholder={classId ? "Select Subject" : "First choose academic year & class"} />
                                        )}
                                    </SelectTrigger>
                                    <SelectContent>
                                        {subjectList.map((sub: any) => (
                                            <SelectItem key={sub.ismS_Id} value={String(sub.ismS_Id)}>
                                                {sub.ismS_IVRSSubjectName || sub.ismS_SubjectName}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Exam Name */}
                            <div className="space-y-2">
                                <Label className="text-sm font-semibold text-slate-700">
                                    Exam Name <span className="text-red-500">*</span>
                                </Label>
                                <Input 
                                    placeholder="Enter Exam Name (e.g. Mid Term, Final)" 
                                    value={examName}
                                    onChange={(e) => setExamName(e.target.value)}
                                    maxLength={200}
                                />
                            </div>

                            {/* Question Paper Name */}
                            <div className="md:col-span-2 space-y-2">
                                <Label className="text-sm font-semibold text-slate-700">
                                    Question Paper Name <span className="text-red-500">*</span>
                                </Label>
                                <Input 
                                    placeholder="Enter Question Paper Title" 
                                    value={questionPaperName}
                                    onChange={(e) => setQuestionPaperName(e.target.value)}
                                    maxLength={200}
                                />
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 pt-4 border-t">
                            <Button 
                                type="button" 
                                variant="outline" 
                                onClick={handleReset}
                                disabled={saveMutation.isPending}
                            >
                                <RotateCcw className="mr-2 h-4 w-4" /> Reset
                            </Button>
                            <Button 
                                type="submit" 
                                className="bg-indigo-600 hover:bg-indigo-700 text-white"
                                disabled={saveMutation.isPending || isUploading}
                            >
                                {saveMutation.isPending ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...
                                    </>
                                ) : (
                                    'Save Question Paper'
                                )}
                            </Button>
                        </div>
                    </form>
                </div>

                {/* PDF File Upload Card */}
                <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm flex flex-col justify-between">
                    <div>
                        <h2 className="text-xl font-semibold text-slate-800 mb-6 flex items-center gap-2">
                            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-indigo-50 text-indigo-600 text-sm font-bold">2</span>
                            Upload PDF Document
                        </h2>

                        <div className="space-y-4">
                            {!uploadedFilePath ? (
                                <div 
                                    className={`border-2 border-dashed rounded-xl p-8 text-center flex flex-col items-center justify-center gap-3 transition-colors ${
                                        isUploading ? 'border-indigo-300 bg-indigo-50/20' : 'border-slate-300 hover:border-indigo-400 bg-slate-50/50'
                                    }`}
                                >
                                    <div className="rounded-full bg-indigo-50 p-4 text-indigo-600">
                                        {isUploading ? (
                                            <Loader2 className="h-8 w-8 animate-spin" />
                                        ) : (
                                            <Upload className="h-8 w-8" />
                                        )}
                                    </div>
                                    <div>
                                        <p className="font-medium text-slate-700">
                                            {isUploading ? 'Uploading document...' : 'Upload Question Paper'}
                                        </p>
                                        <p className="text-xs text-slate-500 mt-1">PDF format only (Max 5MB)</p>
                                    </div>
                                    
                                    <input 
                                        type="file" 
                                        ref={fileInputRef} 
                                        onChange={handleFileChange} 
                                        accept=".pdf,application/pdf"
                                        className="hidden" 
                                        disabled={isUploading}
                                    />
                                    <Button 
                                        type="button" 
                                        variant="outline" 
                                        size="sm"
                                        onClick={() => fileInputRef.current?.click()}
                                        disabled={isUploading}
                                        className="mt-2 border-indigo-200 text-indigo-700 hover:bg-indigo-50"
                                    >
                                        Choose File
                                    </Button>
                                </div>
                            ) : (
                                <div className="rounded-xl border border-emerald-100 bg-emerald-50/20 p-6 flex flex-col gap-4">
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="flex items-center gap-3">
                                            <div className="rounded-lg bg-emerald-100 p-2.5 text-emerald-700">
                                                <FileText className="h-6 w-6" />
                                            </div>
                                            <div className="min-w-0">
                                                <p className="font-semibold text-slate-800 text-sm truncate max-w-[180px]">
                                                    {originalFileName || 'Uploaded Paper'}
                                                </p>
                                                <p className="text-xs text-emerald-600 font-medium">Successfully Uploaded</p>
                                            </div>
                                        </div>
                                        <Button 
                                            variant="ghost" 
                                            size="icon" 
                                            className="h-8 w-8 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full"
                                            onClick={() => {
                                                setUploadedFilePath('');
                                                setOriginalFileName('');
                                                if (fileInputRef.current) fileInputRef.current.value = '';
                                            }}
                                        >
                                            <X className="h-4 w-4" />
                                        </Button>
                                    </div>

                                    <div className="flex gap-2">
                                        <Button 
                                            type="button" 
                                            variant="outline" 
                                            size="sm" 
                                            className="flex-1 text-slate-700 border-slate-200"
                                            onClick={() => openPreview(uploadedFilePath, originalFileName)}
                                        >
                                            <Eye className="mr-1.5 h-3.5 w-3.5" /> Preview
                                        </Button>
                                        <Button 
                                            type="button" 
                                            variant="outline" 
                                            size="sm"
                                            className="flex-1 text-indigo-700 border-indigo-100 hover:bg-indigo-50"
                                            onClick={() => handleDownload(uploadedFilePath, originalFileName)}
                                        >
                                            <Download className="mr-1.5 h-3.5 w-3.5" /> Download
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="mt-8 rounded-xl bg-slate-50 p-4 border border-slate-100">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Instructions</h4>
                        <ul className="text-xs text-slate-600 space-y-1 list-disc pl-4">
                            <li>All fields marked with an asterisk (<span className="text-red-500">*</span>) are mandatory.</li>
                            <li>Ensure the PDF size is smaller than 5MB before upload.</li>
                            <li>Use clean naming conventions for Exam Name and Paper Name to assist AI search indexing.</li>
                        </ul>
                    </div>
                </div>
            </div>

            {/* Question Papers Grid */}
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
                    <div className="flex items-center gap-3">
                        <h2 className="text-xl font-bold text-slate-800">Uploaded Question Papers</h2>
                        <Badge variant="secondary" className="bg-indigo-50 text-indigo-700 hover:bg-indigo-50 text-xs py-0.5 px-2.5">
                            Total: {filteredQuestionPapers.length}
                        </Badge>
                    </div>
                    
                    {/* Search Grid Input */}
                    <div className="relative w-full md:w-80">
                        <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                        <Input
                            placeholder="Search papers, classes, subjects..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-9 h-9"
                        />
                        {searchTerm && (
                            <button 
                                onClick={() => setSearchTerm('')} 
                                className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        )}
                    </div>
                </div>

                <div className="rounded-lg border overflow-hidden">
                    <Table>
                        <TableHeader className="bg-slate-50/70">
                            <TableRow>
                                <TableHead className="w-16 text-center font-semibold text-slate-700">Sl.No</TableHead>
                                <TableHead className="font-semibold text-slate-700">Academic Year</TableHead>
                                <TableHead className="font-semibold text-slate-700">Class</TableHead>
                                <TableHead className="font-semibold text-slate-700">Exam Name</TableHead>
                                <TableHead className="font-semibold text-slate-700">Subject Name</TableHead>
                                <TableHead className="font-semibold text-slate-700">Question Paper Name</TableHead>
                                <TableHead className="w-32 text-center font-semibold text-slate-700">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {paginatedQuestionPapers.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="h-32 text-center text-slate-500">
                                        No question papers found.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                paginatedQuestionPapers.map((x: any, index: number) => {
                                    const slNo = (currentPage - 1) * itemsPerPage + index + 1;
                                    return (
                                        <TableRow key={x.lpprqP_Id || index} className="hover:bg-slate-50/50 transition-colors">
                                            <TableCell className="text-center font-medium text-slate-500">{slNo}</TableCell>
                                            <TableCell className="font-medium text-slate-800">{x.asmaY_Year || '-'}</TableCell>
                                            <TableCell className="text-slate-600">{x.asmcL_ClassName}</TableCell>
                                            <TableCell className="text-slate-600">{x.lpprqP_ExamName}</TableCell>
                                            <TableCell className="text-slate-600">{x.ismS_SubjectName}</TableCell>
                                            <TableCell className="text-slate-600 max-w-[200px] truncate" title={x.lpprqpF_FileName}>
                                                {x.lpprqpF_FileName}
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <div className="flex items-center justify-center gap-1.5">
                                                    {x.lpprqpF_FilePath && (
                                                        <>
                                                            <Button 
                                                                variant="ghost" 
                                                                size="icon" 
                                                                className="h-8 w-8 text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50"
                                                                onClick={() => openPreview(x.lpprqpF_FilePath, x.lpprqpF_FileName)}
                                                                title="Preview PDF"
                                                            >
                                                                <Eye className="h-4 w-4" />
                                                            </Button>
                                                            <Button 
                                                                variant="ghost" 
                                                                size="icon" 
                                                                className="h-8 w-8 text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50"
                                                                onClick={() => handleDownload(x.lpprqpF_FilePath, x.lpprqpF_FileName)}
                                                                title="Download PDF"
                                                            >
                                                                <Download className="h-4 w-4" />
                                                            </Button>
                                                        </>
                                                    )}
                                                    <Button 
                                                        variant="ghost" 
                                                        size="icon" 
                                                        className="h-8 w-8 text-red-600 hover:text-red-800 hover:bg-red-50"
                                                        onClick={() => handleDelete(x)}
                                                        title="Delete Record"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })
                            )}
                        </TableBody>
                    </Table>
                </div>

                {/* Local Grid Pagination */}
                {filteredQuestionPapers.length > itemsPerPage && (
                    <div className="flex items-center justify-between mt-5 pt-4 border-t border-slate-100">
                        <span className="text-sm text-slate-500">
                            Showing <span className="font-semibold text-slate-800">{((currentPage - 1) * itemsPerPage) + 1}</span> to{' '}
                            <span className="font-semibold text-slate-800">
                                {Math.min(currentPage * itemsPerPage, filteredQuestionPapers.length)}
                            </span>{' '}
                            of <span className="font-semibold text-slate-800">{filteredQuestionPapers.length}</span> question papers
                        </span>
                        
                        <div className="flex items-center gap-1.5">
                            <Button
                                variant="outline"
                                size="icon"
                                className="h-8 w-8 rounded-md"
                                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                disabled={currentPage === 1}
                            >
                                <ChevronLeft className="h-4 w-4" />
                            </Button>
                            
                            <div className="flex items-center gap-1">
                                {Array.from({ length: totalPages }).map((_, i) => (
                                    <Button
                                        key={i}
                                        variant={currentPage === i + 1 ? 'default' : 'outline'}
                                        className={`h-8 w-8 p-0 text-xs rounded-md ${
                                            currentPage === i + 1 ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:bg-slate-50'
                                        }`}
                                        onClick={() => setCurrentPage(i + 1)}
                                    >
                                        {i + 1}
                                    </Button>
                                ))}
                            </div>

                            <Button
                                variant="outline"
                                size="icon"
                                className="h-8 w-8 rounded-md"
                                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                disabled={currentPage === totalPages}
                            >
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                )}
            </div>

            {/* AI Search Dialog */}
            <Dialog open={isSearchModalOpen} onOpenChange={setIsSearchModalOpen}>
                <DialogContent className="max-w-4xl p-6 rounded-2xl">
                    <DialogHeader className="border-b pb-4">
                        <DialogTitle className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                            <Search className="h-6 w-6 text-indigo-600" />
                            Search Inside PDF Question Papers
                        </DialogTitle>
                    </DialogHeader>

                    <div className="space-y-6 py-4">
                        {/* Search Input Control */}
                        <div className="flex gap-2">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                                <Input 
                                    placeholder="Type any phrase or keyword to search inside PDFs (e.g. 'Algebra', 'Newtons Laws')..." 
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleAISearch()}
                                    className="pl-9 h-10 text-sm"
                                />
                                {searchQuery && (
                                    <button 
                                        onClick={() => setSearchQuery('')} 
                                        className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
                                    >
                                        <X className="h-4 w-4" />
                                    </button>
                                )}
                            </div>
                            <Button 
                                onClick={handleAISearch} 
                                className="bg-indigo-600 hover:bg-indigo-700 text-white h-10 px-6 font-semibold"
                                disabled={searchMutation.isPending}
                            >
                                {searchMutation.isPending ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                    'Search'
                                )}
                            </Button>
                        </div>

                        {/* Search Results Display */}
                        <div className="max-h-[50vh] overflow-y-auto space-y-4 pr-1">
                            {searchMutation.isPending ? (
                                <div className="flex flex-col items-center justify-center py-20 gap-3">
                                    <Loader2 className="h-10 w-10 animate-spin text-indigo-600" />
                                    <p className="text-sm font-medium text-slate-600">Searching and parsing documents, please wait...</p>
                                </div>
                            ) : searchResults.length === 0 ? (
                                <div className="text-center py-16 border-2 border-dashed rounded-xl border-slate-200">
                                    <FileText className="mx-auto h-12 w-12 text-slate-300" />
                                    <p className="mt-3 text-sm font-semibold text-slate-700">No search results</p>
                                    <p className="text-xs text-slate-500 mt-1">Enter a query above to start deep searching inside document text.</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {searchResults.map((result: any, idx: number) => (
                                        <div 
                                            key={idx} 
                                            className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col md:flex-row justify-between gap-4 items-start"
                                        >
                                            <div className="space-y-3 flex-1 min-w-0">
                                                <div className="flex flex-wrap items-center gap-2">
                                                    <span className="font-bold text-slate-900 text-sm truncate max-w-[280px]" title={result.pdf_filename}>
                                                        {result.pdf_filename}
                                                    </span>
                                                    <Badge variant="outline" className="bg-slate-50 text-slate-700 font-medium text-xs">
                                                        Page: {result.page_num || result.page_no || '-'}
                                                    </Badge>
                                                    {result.ref_no && (
                                                        <Badge variant="outline" className="bg-indigo-50/50 text-indigo-700 border-indigo-100 text-xs">
                                                            Ref: {result.ref_no}
                                                        </Badge>
                                                    )}
                                                </div>

                                                {/* Text context snippet */}
                                                {(result.text || result.Text) && (
                                                    <div 
                                                        className="text-xs text-slate-600 bg-slate-50/80 p-3 rounded-lg border border-slate-100 font-mono leading-relaxed max-h-32 overflow-y-auto"
                                                        dangerouslySetInnerHTML={{ __html: result.text || result.Text }}
                                                    />
                                                )}
                                            </div>

                                            <div className="flex gap-2 w-full md:w-auto shrink-0 justify-end">
                                                {result.file_path && (
                                                    <>
                                                        <Button 
                                                            variant="outline" 
                                                            size="sm"
                                                            className="text-slate-700 border-slate-200"
                                                            onClick={() => openPreview(result.file_path, result.pdf_filename)}
                                                        >
                                                            <Eye className="mr-1 h-3.5 w-3.5" /> View
                                                        </Button>
                                                        <Button 
                                                            variant="outline" 
                                                            size="sm"
                                                            className="text-indigo-700 border-indigo-100 hover:bg-indigo-50"
                                                            onClick={() => handleDownload(result.file_path, result.pdf_filename)}
                                                        >
                                                            <Download className="mr-1 h-3.5 w-3.5" /> Download
                                                        </Button>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {/* General PDF Preview Dialog */}
            <Dialog open={isPreviewModalOpen} onOpenChange={setIsPreviewModalOpen}>
                <DialogContent className="max-w-5xl p-4 rounded-2xl">
                    <DialogHeader className="border-b pb-2 mb-2 flex flex-row items-center justify-between">
                        <DialogTitle className="text-lg font-bold text-slate-900 truncate pr-8">
                            Preview: {previewFileName}
                        </DialogTitle>
                    </DialogHeader>
                    <div className="w-full rounded-lg overflow-hidden border border-slate-200 bg-slate-100">
                        {previewUrl ? (
                            <iframe 
                                src={`${previewUrl}#toolbar=0`} 
                                className="w-full h-[75vh]" 
                                title={previewFileName}
                            />
                        ) : (
                            <div className="flex h-[50vh] items-center justify-center text-slate-500">
                                PDF content cannot be previewed.
                            </div>
                        )}
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
