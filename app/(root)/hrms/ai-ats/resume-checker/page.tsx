'use client';

import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Card, 
    CardContent, 
    CardDescription, 
    CardHeader, 
    CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
    BrainCircuit, 
    UploadCloud, 
    CheckCircle2, 
    AlertCircle, 
    Zap, 
    Search,
    ShieldCheck,
    Star,
    Sparkles,
    BarChart3,
    Trophy,
    Target,
    Users,
    Download,
    Printer,
    ArrowRight,
    MessageSquare,
    ChevronRight,
    FileType,
    Microscope,
    Lightbulb
} from 'lucide-react';

export default function AIResumeCheckerPage() {
    const [isUploading, setIsUploading] = React.useState(false);
    const [isAnalyzed, setIsAnalyzed] = React.useState(false);
    const [activeTab, setActiveTab] = React.useState('overview');
    const [uploadProgress, setUploadProgress] = React.useState(0);

    const handleUpload = () => {
        setIsUploading(true);
        setUploadProgress(0);
        
        const interval = setInterval(() => {
            setUploadProgress(prev => {
                if (prev >= 100) {
                    clearInterval(interval);
                    return 100;
                }
                return prev + 5;
            });
        }, 100);

        setTimeout(() => {
            setIsUploading(false);
            setIsAnalyzed(true);
        }, 3000);
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-8 space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-black">AI Resume Checker</h1>
                    <p className="text-slate-500">Advanced ATS Compatibility Engine</p>
                </div>
                <Button onClick={handleUpload}>Run Scan</Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Upload</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="border-2 border-dashed p-12 text-center rounded-xl cursor-pointer hover:bg-slate-50" onClick={handleUpload}>
                            <UploadCloud className="mx-auto h-12 w-12 text-slate-400" />
                            <p className="mt-2 text-sm font-medium">Click to upload resume</p>
                        </div>
                    </CardContent>
                </Card>

                <Card className="md:col-span-2">
                    <CardHeader>
                        <CardTitle>Analysis Results</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {isUploading ? (
                            <div className="space-y-4">
                                <p className="text-sm animate-pulse">AI Engine is processing...</p>
                                <Progress value={uploadProgress} />
                            </div>
                        ) : isAnalyzed ? (
                            <div className="space-y-6">
                                <div className="flex gap-4">
                                    <Badge className="bg-emerald-500">88/100 ATS Score</Badge>
                                    <Badge className="bg-indigo-500">Top 5% Match</Badge>
                                </div>
                                <Tabs defaultValue="overview">
                                    <TabsList>
                                        <TabsTrigger value="overview">Overview</TabsTrigger>
                                        <TabsTrigger value="skills">Skills</TabsTrigger>
                                    </TabsList>
                                    <TabsContent value="overview" className="p-4 bg-slate-50 rounded-xl mt-2">
                                        <p className="text-sm leading-relaxed">
                                            Candidate shows strong expertise in React and System Design.
                                        </p>
                                    </TabsContent>
                                    <TabsContent value="skills" className="p-4 bg-slate-50 rounded-xl mt-2">
                                        <div className="flex flex-wrap gap-2">
                                            {['React', 'Next.js', 'TypeScript'].map(s => <Badge key={s} variant="secondary">{s}</Badge>)}
                                        </div>
                                    </TabsContent>
                                </Tabs>
                            </div>
                        ) : (
                            <div className="text-center py-20 text-slate-400">
                                <Search className="mx-auto h-12 w-12 opacity-20" />
                                <p className="mt-2">Upload a resume to start analysis</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
