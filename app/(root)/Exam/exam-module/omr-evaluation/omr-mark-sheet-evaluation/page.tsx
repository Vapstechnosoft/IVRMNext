'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Upload, FileCheck, AlertCircle, PlayCircle, ClipboardCheck, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

export default function OmrMarkSheetEvaluationPage() {
    const [files, setFiles] = useState<{ name: string; size: string; status: string }[]>([]);
    const [isEvaluating, setIsEvaluating] = useState(false);
    const [results, setResults] = useState<any[]>([]);

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const newFiles = Array.from(e.target.files).map(file => ({
                name: file.name,
                size: (file.size / 1024).toFixed(1) + ' KB',
                status: 'Ready'
            }));
            setFiles(prev => [...prev, ...newFiles]);
            toast.success(`${newFiles.length} files uploaded successfully`);
        }
    };

    const startEvaluation = () => {
        if (files.length === 0) {
            toast.error('Please upload OMR sheets first');
            return;
        }
        setIsEvaluating(true);
        toast.info('Starting OMR evaluation process...');

        // Simulate evaluation process
        setTimeout(() => {
            const mockResults = files.map((file, index) => ({
                id: index + 1,
                studentName: `Student ${String.fromCharCode(65 + index)}`,
                regNo: `REG-2026-00${index + 1}`,
                score: Math.floor(Math.random() * 50) + 50,
                total: 100,
                status: 'Success'
            }));
            setResults(mockResults);
            setIsEvaluating(false);
            setFiles(prev => prev.map(f => ({ ...f, status: 'Processed' })));
            toast.success('Evaluation completed successfully!');
        }, 3000);
    };

    const clearFiles = () => {
        setFiles([]);
        setResults([]);
        toast.info('Cleared all files and results');
    };

    return (
        <div className="min-h-screen bg-[#f8fafc] p-6 lg:p-10">
            <div className="max-w-6xl mx-auto space-y-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">OMR Mark Sheet Evaluation</h1>
                        <p className="text-slate-500 mt-1">Upload and evaluate optical mark recognition sheets for automated grading.</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <Button variant="outline" onClick={clearFiles} disabled={files.length === 0 || isEvaluating}>
                            <Trash2 className="w-4 h-4 mr-2" />
                            Clear All
                        </Button>
                        <Button
                            className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-200 transition-all active:scale-95"
                            onClick={startEvaluation}
                            disabled={files.length === 0 || isEvaluating}
                        >
                            {isEvaluating ? (
                                <>
                                    <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                                    Evaluating...
                                </>
                            ) : (
                                <>
                                    <PlayCircle className="w-4 h-4 mr-2" />
                                    Start Evaluation
                                </>
                            )}
                        </Button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Upload Section */}
                    <Card className="lg:col-span-1 border-none shadow-xl bg-white/80 backdrop-blur-sm overflow-hidden">
                        <div className="h-2 bg-indigo-600" />
                        <CardHeader>
                            <CardTitle className="text-lg flex items-center">
                                <Upload className="w-5 h-5 mr-2 text-indigo-600" />
                                Upload Sheets
                            </CardTitle>
                            <CardDescription>Drag and drop or browse OMR scan files.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-slate-200 rounded-xl cursor-pointer bg-slate-50 hover:bg-indigo-50/50 hover:border-indigo-300 transition-all group">
                                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                    <div className="p-4 bg-white rounded-full shadow-sm mb-3 group-hover:scale-110 transition-transform">
                                        <Upload className="w-6 h-6 text-indigo-600" />
                                    </div>
                                    <p className="mb-2 text-sm text-slate-700 font-medium">Click to upload or drag and drop</p>
                                    <p className="text-xs text-slate-500">JPG, PNG or PDF (Max 20MB)</p>
                                </div>
                                <input type="file" className="hidden" multiple onChange={handleFileUpload} accept="image/*,application/pdf" />
                            </label>

                            <div className="space-y-2">
                                <h3 className="text-sm font-semibold text-slate-700 flex items-center">
                                    <FileCheck className="w-4 h-4 mr-1.5 text-emerald-500" />
                                    Queue ({files.length} files)
                                </h3>
                                <div className="max-h-[300px] overflow-y-auto pr-1 space-y-2 custom-scrollbar">
                                    {files.length === 0 ? (
                                        <div className="text-center py-8 bg-slate-50/50 rounded-lg border border-slate-100">
                                            <p className="text-xs text-slate-400">No files in queue</p>
                                        </div>
                                    ) : (
                                        files.map((file, i) => (
                                            <div key={i} className="flex items-center justify-between p-3 bg-white rounded-lg border border-slate-100 shadow-sm animate-in fade-in slide-in-from-bottom-2 duration-300">
                                                <div className="min-w-0">
                                                    <p className="text-xs font-medium text-slate-700 truncate">{file.name}</p>
                                                    <p className="text-[10px] text-slate-400">{file.size}</p>
                                                </div>
                                                <Badge variant={file.status === 'Processed' ? 'default' : 'secondary'} className={file.status === 'Processed' ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-none' : 'bg-slate-100 text-slate-600 border-none'}>
                                                    {file.status}
                                                </Badge>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Results Table Section */}
                    <Card className="lg:col-span-2 border-none shadow-xl bg-white/80 backdrop-blur-sm overflow-hidden">
                        <div className="h-2 bg-emerald-500" />
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle className="text-lg flex items-center">
                                    <ClipboardCheck className="w-5 h-5 mr-2 text-emerald-500" />
                                    Evaluation Results
                                </CardTitle>
                                <CardDescription>Review extracted marks before final submission.</CardDescription>
                            </div>
                            {results.length > 0 && (
                                <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white">
                                    Save to ERP
                                </Button>
                            )}
                        </CardHeader>
                        <CardContent>
                            {results.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-24 text-center">
                                    <div className="p-4 bg-slate-50 rounded-full mb-4">
                                        <AlertCircle className="w-8 h-8 text-slate-300" />
                                    </div>
                                    <h3 className="text-slate-600 font-medium font-outfit">No results yet</h3>
                                    <p className="text-slate-400 text-sm max-w-xs mx-auto">Results will appear here once you upload and start the evaluation process.</p>
                                </div>
                            ) : (
                                <div className="rounded-xl border border-slate-100 overflow-hidden">
                                    <Table>
                                        <TableHeader className="bg-slate-50/80">
                                            <TableRow>
                                                <TableHead className="w-[100px]">Reg No</TableHead>
                                                <TableHead>Student Name</TableHead>
                                                <TableHead className="text-center">Marks Obtained</TableHead>
                                                <TableHead className="text-center">Total Marks</TableHead>
                                                <TableHead className="text-right">Action</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {results.map((res) => (
                                                <TableRow key={res.id} className="hover:bg-slate-50/50 transition-colors">
                                                    <TableCell className="font-mono text-xs font-semibold text-indigo-600">{res.regNo}</TableCell>
                                                    <TableCell className="font-medium text-slate-700">{res.studentName}</TableCell>
                                                    <TableCell className="text-center">
                                                        <span className="inline-block px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-md font-bold text-sm">
                                                            {res.score}
                                                        </span>
                                                    </TableCell>
                                                    <TableCell className="text-center text-slate-600">{res.total}</TableCell>
                                                    <TableCell className="text-right">
                                                        <Button variant="ghost" size="sm" className="text-xs text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50">View Details</Button>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                            )}
                        </CardContent>
                        <CardFooter className="bg-slate-50/50 border-t border-slate-100 py-4">
                            <div className="flex items-center justify-between w-full text-xs text-slate-500">
                                <div className="flex items-center gap-4">
                                    <span className="flex items-center">
                                        <span className="w-2 h-2 rounded-full bg-emerald-500 mr-2" />
                                        Success: {results.filter(r => r.status === 'Success').length}
                                    </span>
                                    <span className="flex items-center">
                                        <span className="w-2 h-2 rounded-full bg-red-400 mr-2" />
                                        Mismatched: 0
                                    </span>
                                </div>
                                <span>Powered by AI-VRM OMR Engine v2.0</span>
                            </div>
                        </CardFooter>
                    </Card>
                </div>
            </div>

            <style jsx global>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 4px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: #e2e8f0;
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: #cbd5e1;
                }
            `}</style>
        </div>
    );
}
