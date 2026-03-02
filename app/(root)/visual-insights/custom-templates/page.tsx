'use client';

import { useState } from 'react';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
    CardFooter
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
    Code2,
    Layers,
    PlusCircle,
    Save,
    X,
    Maximize2,
    Edit,
    BarChart2,
    CheckCircle,
    Copy,
    ChevronDown,
    MoreHorizontal,
    Grid2X2,
    GalleryHorizontal,
    ExternalLink,
    LayoutTemplate,
    Calendar,
    Gift,
    IndianRupee,
    Trophy,
    MessageSquare,
    Users,
    UserCheck,
    FileText
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
} from '@/components/ui/dialog';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';

// --- Mock Data ---

const MOCK_PAGES = [
    { id: 1, name: "Student Admission" },
    { id: 2, name: "Fee Collection" },
    { id: 3, name: "Exam Results" },
    { id: 4, name: "Staff Payroll" },
    { id: 5, name: "Attendance Report" },
    { id: 6, name: "Transfer Certificate" },
];

const MOCK_MODULES = [
    { id: "PREADMISSION", name: "PRE ADMISSION" },
    { id: "ADMISSION", name: "ADMISSION" },
    { id: "FEES", name: "FEES" },
    { id: "EXAM", name: "EXAM" },
    { id: "HRMS", name: "HRMS" },
    { id: "COE", name: "COE" },
    { id: "BIRTHDAY", name: "BIRTHDAY" },
];

const GALLERY_SECTIONS = {
    PREADMISSION: [
        {
            title: "Pre-Admission Forms",
            images: [
                "https://dcampusstrg.blob.core.windows.net/htmltemplates/Admission_form_page-0001.jpg",
                "https://dcampusstrg.blob.core.windows.net/htmltemplates/Admission_form_page-0002.jpg",
                "https://dcampusstrg.blob.core.windows.net/htmltemplates/Admission_form_page-0003.jpg",
                "https://dcampusstrg.blob.core.windows.net/htmltemplates/Admission_form_page-0004.jpg",
                "https://dcampusstrg.blob.core.windows.net/htmltemplates/Admission_form_page-0005.jpg",
                "https://dcampusstrg.blob.core.windows.net/htmltemplates/Admission_form_page-0006.jpg",
            ]
        }
    ],
    ADMISSION: [
        {
            title: "TC Formats",
            images: [
                "https://dcampusstrg.blob.core.windows.net/htmltemplates/TC2_page-0001 (1).jpg",
                "https://dcampusstrg.blob.core.windows.net/htmltemplates/TC1_pages-to-jpg-0001.jpg",
                "https://dcampusstrg.blob.core.windows.net/htmltemplates/TC3_page-0001 (1).jpg",
                "https://dcampusstrg.blob.core.windows.net/htmltemplates/TC4_page-0001 (1).jpg",
                "https://dcampusstrg.blob.core.windows.net/htmltemplates/TC5_page-0001.jpg",
                "https://dcampusstrg.blob.core.windows.net/htmltemplates/TC6_page-0001.jpg",
                "https://dcampusstrg.blob.core.windows.net/htmltemplates/TC7_page-0001.jpg",
                "https://dcampusstrg.blob.core.windows.net/htmltemplates/St%20Thomas%20TC_page-0001.jpg",
            ]
        },
        {
            title: "Study Certificates",
            images: [
                "https://dcampusstrg.blob.core.windows.net/htmltemplates/STD1_page-0001.jpg",
                "https://dcampusstrg.blob.core.windows.net/htmltemplates/STD2_page-0001.jpg",
                "https://dcampusstrg.blob.core.windows.net/htmltemplates/STD3_page-0001.jpg",
            ]
        }
    ],
    FEES: [
        {
            title: "Fee Receipts",
            images: [
                "https://dcampusstrg.blob.core.windows.net/htmltemplates/Fee1_page-0001.jpg",
                "https://dcampusstrg.blob.core.windows.net/htmltemplates/Fee2_page-0001.jpg",
                "https://dcampusstrg.blob.core.windows.net/htmltemplates/Fee3_page-0001.jpg",
            ]
        }
    ],
    EXAM: [
        {
            title: "Exam Reports & Hall Tickets",
            images: [
                "https://dcampusstrg.blob.core.windows.net/htmltemplates/cbs_exam_report.jpg",
                "https://dcampusstrg.blob.core.windows.net/htmltemplates/SNRPS%20Progress%20card.jpg",
                "https://dcampusstrg.blob.core.windows.net/htmltemplates/NURSERY%20REPORT%20CARD.jpg",
                "https://dcampusstrg.blob.core.windows.net/htmltemplates/Hal1_page-0001.jpg",
                "https://dcampusstrg.blob.core.windows.net/htmltemplates/Hal2_page-0001.jpg",
                "https://dcampusstrg.blob.core.windows.net/htmltemplates/prog4_page-0001.jpg",
                "https://dcampusstrg.blob.core.windows.net/htmltemplates/prog4_page-0002.jpg",
            ]
        }
    ],
    HRMS: [
        {
            title: "Salary Slip & ID Cards",
            images: [
                "https://dcampusstrg.blob.core.windows.net/htmltemplates/salryslip_page-0001.jpg",
                "https://dcampusstrg.blob.core.windows.net/htmltemplates/Gatepass_page-0001.jpg",
                "https://dcampusstrg.blob.core.windows.net/htmltemplates/staff cards_page-0002.jpg",
            ]
        }
    ],
    COE: [
        {
            title: "Event Posters",
            images: [
                "https://dcampusstrg.blob.core.windows.net/htmltemplates/0 Holi.jpg",
                "https://dcampusstrg.blob.core.windows.net/htmltemplates/01 World Health Day.jpg",
                "https://dcampusstrg.blob.core.windows.net/htmltemplates/02 Ambedkar Day.jpg",
                "https://dcampusstrg.blob.core.windows.net/htmltemplates/05 World Environment Day.jpg",
                "https://dcampusstrg.blob.core.windows.net/htmltemplates/12 Children's Day.jpg",
            ]
        }
    ],
    BIRTHDAY: [
        {
            title: "Birthday Templates",
            images: [
                "https://dcampusstrg.blob.core.windows.net/htmltemplates/BDay Template-1.png",
                "https://dcampusstrg.blob.core.windows.net/htmltemplates/Happy Birthday_page-0001 (1).jpg",
            ]
        }
    ]
};

const INITIAL_PARAMETERS = [
    { id: 1, name: "STUDENT_NAME", description: "Full Name of Student" },
    { id: 2, name: "ADMISSION_NO", description: "Unique Admission Number" },
    { id: 3, name: "ACADEMIC_YEAR", description: "Current Session Year" },
    { id: 4, name: "FEE_AMOUNT", description: "Total Payable Amount" },
    { id: 5, name: "DATE", description: "Current System Date" },
    { id: 6, name: "FATHER_NAME", description: "Father's/Guardian Name" },
    { id: 7, name: "DOB", description: "Date of Birth" },
    { id: 8, name: "CLASS_NAME", description: "Current Grade/Section" },
];

const INITIAL_DESIGN_TEMPLATES = [
    {
        id: 1,
        name: "Standard TC Layout 2024",
        module: "tc",
        template: "<h1>Transfer Certificate</h1><p>This is to certify that {STUDENT_NAME}...</p>",
        active: true,
        image: "https://images.unsplash.com/photo-1586281380349-632531db7ed4?q=80&w=800&auto=format&fit=crop"
    },
    {
        id: 2,
        name: "Premium Admission Form",
        module: "admission",
        template: "<h1>Admission Form</h1><p>Welcome to our institution.</p>",
        active: true,
        image: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?q=80&w=800&auto=format&fit=crop"
    },
    {
        id: 3,
        name: "Modern Fee Receipt",
        module: "fees",
        template: "<h1>Fee Receipt</h1><p>Amount: {FEE_AMOUNT}</p>",
        active: true,
        image: "https://images.unsplash.com/photo-1554224155-6726b3f8981c?q=80&w=800&auto=format&fit=crop"
    },
    {
        id: 4,
        name: "Simplified TC Layout",
        module: "tc",
        template: "<h1>TC v2</h1><p>Certification of student progress.</p>",
        active: true,
        image: "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?q=80&w=800&auto=format&fit=crop"
    },
    {
        id: 5,
        name: "Official School TC - Style A",
        module: "tc",
        template: "<h1>Official TC</h1><p>Valid for university entrance.</p>",
        active: true,
        image: "https://images.unsplash.com/photo-1606326666333-b125d9b99df1?q=80&w=800&auto=format&fit=crop"
    },
    {
        id: 6,
        name: "Entrance Admission Format",
        module: "admission",
        template: "<h1>Entrance Form</h1><p>Applying for session 2024-25.</p>",
        active: true,
        image: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?q=80&w=800&auto=format&fit=crop"
    },
];

const INITIAL_MASTER_TEMPLATES = [
    { id: 1, pageId: 1, name: "Admission Standard v1", description: "Default admission template for all classes.", active: true },
    { id: 2, pageId: 2, name: "Fee collection v2", description: "Updated fee collection template.", active: true },
];

const INITIAL_INST_MAPPINGS = [
    { id: 1, instId: 1, templateId: 1, active: true },
];

export default function CustomTemplatesPage() {
    const [selectedModule, setSelectedModule] = useState("ADMISSION");
    const [designView, setDesignView] = useState<'gallery' | 'editor'>('gallery');
    const [editDesignId, setEditDesignId] = useState<number | null>(null);
    const [designName, setDesignName] = useState("");
    const [designHtml, setDesignHtml] = useState("");
    const [viewingDesign, setViewingDesign] = useState<any>(null);
    const [viewingImage, setViewingImage] = useState<string | null>(null);

    const handleNew = () => {
        setEditDesignId(null);
        setDesignName("");
        setDesignHtml("");
        setDesignView('editor');
    };

    const handleSaveDesign = () => {
        if (!designName || !designHtml) return toast.error("Missing fields");
        setDesignView('gallery');
        toast.success("Design saved successfully");
    };

    return (
        <div className="min-h-screen bg-[#f4f7f9] font-sans selection:bg-purple-100 animate-in fade-in duration-500 overflow-x-hidden">
            <div className="p-4 lg:p-10 space-y-6">
                {/* --- PAGE THEME TITLE --- */}
                <div className="space-y-4 px-2">
                    <div className="flex items-center gap-3">
                        <div className="h-6 w-1.5 bg-[#a133f1]" />
                        <h2 className="text-2xl font-black text-[#1e293b] tracking-tight flex items-center gap-3">
                            <BarChart2 className="h-6 w-6 text-[#a133f1]" />
                            Visual Insights: Custom Templates
                        </h2>
                    </div>
                    <p className="text-slate-500 text-[14px] font-medium max-w-5xl leading-relaxed">
                        Explore comprehensive institutional layout reports and analytics. Select a category from the selection below to view
                        detailed insights on Admissions, Transfers, Exams, and Birthday Templates.
                    </p>
                </div>

                {/* --- STANDARD MODULE TABS --- */}
                <div className="bg-[#f8f9fa] border border-slate-200 rounded-lg p-1.5 flex items-center gap-1 shadow-sm overflow-x-auto no-scrollbar">
                    {[
                        { id: "PREADMISSION", name: "PRE ADMISSION", icon: LayoutTemplate },
                        { id: "ADMISSION", name: "ADMISSION", icon: Calendar },
                        { id: "FEES", name: "FEES", icon: IndianRupee },
                        { id: "EXAM", name: "EXAM", icon: FileText },
                        { id: "HRMS", name: "HRMS", icon: Users },
                        { id: "COE", name: "COE", icon: Grid2X2 },
                        { id: "BIRTHDAY", name: "BIRTHDAY", icon: Gift },
                    ].map((tab) => {
                        const Icon = tab.icon;
                        const isActive = selectedModule === tab.id;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setSelectedModule(tab.id)}
                                className={cn(
                                    "flex items-center gap-2 px-4 py-2 rounded-md transition-all duration-200 whitespace-nowrap text-[13px] font-bold",
                                    isActive
                                        ? "bg-white text-[#a133f1] shadow-md border border-slate-100 transform scale-105"
                                        : "text-slate-500 hover:bg-white/50 hover:text-slate-800"
                                )}
                            >
                                <Icon className={cn("h-4 w-4", isActive ? "text-[#a133f1]" : "text-slate-400")} />
                                {tab.name}
                                {isActive && <div className="w-1.5 h-1.5 bg-[#a133f1] rounded-full ml-1" />}
                            </button>
                        );
                    })}
                </div>

                {/* --- PRIMARY CONTENT CARD --- */}
                <div className="bg-white rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-slate-100 overflow-hidden">
                    {/* Header Banner - Standardized to Purple Palette */}
                    <div className="bg-[#a133f1] h-12 flex items-center justify-between px-6">
                        <div className="flex items-center gap-3">
                            <CheckCircle className="h-4 w-4 text-white" />
                            <span className="text-white font-black text-[14px] tracking-widest uppercase">
                                {MOCK_MODULES.find(m => m.id === selectedModule)?.name || selectedModule} TEMPLATES GALLERY
                            </span>
                        </div>
                        <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-white/90 hover:bg-black/20 hover:text-white">
                            <span className="text-xl font-bold leading-none">—</span>
                        </Button>
                    </div>

                    {/* --- VISUAL GALLERY --- */}
                    <div className="pt-2 animate-in fade-in slide-in-from-top-2 duration-700">
                        {designView === 'gallery' ? (
                            <div className="space-y-8">
                                {(GALLERY_SECTIONS[selectedModule as keyof typeof GALLERY_SECTIONS] || []).map((section, sIdx) => (
                                    <div key={sIdx} className="space-y-6">
                                        <h3 className="flex items-center gap-2 text-[#a133f1] text-[13px] font-black uppercase tracking-wider px-1">
                                            <div className="w-[3px] h-4 bg-[#ff9800]"></div>
                                            {section.title}
                                        </h3>

                                        <div className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 gap-6 px-1 space-y-6">
                                            {section.images.map((imgUrl, iIdx) => (
                                                <div key={iIdx} className="break-inside-avoid">
                                                    <div className="group relative bg-white transition-all duration-300">
                                                        <img
                                                            src={imgUrl}
                                                            alt={`Template ${iIdx}`}
                                                            className="w-full h-auto shadow-[0_4px_8px_rgba(0,0,0,0.15)] group-hover:shadow-[0_12px_24px_rgba(0,0,0,0.25)] border-[5px] border-white cursor-pointer group-hover:scale-[1.02] transition-all duration-300"
                                                            onClick={() => setViewingImage(imgUrl)}
                                                        />
                                                        <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                            <Button
                                                                variant="secondary"
                                                                size="icon"
                                                                className="h-8 w-8 rounded-full bg-white/90 backdrop-blur shadow-lg"
                                                                onClick={handleNew}
                                                            >
                                                                <Edit className="h-4 w-4 text-[#a133f1]" />
                                                            </Button>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            /* Editor Design Logic - Keeping it consistent with institutional style */
                            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 animate-in slide-in-from-bottom-5 duration-500">
                                <div className="lg:col-span-3">
                                    <Card className="rounded-none border-t-[2.5px] border-t-[#a133f1] border-x border-b border-slate-200 shadow-sm overflow-hidden bg-white">
                                        <div className="bg-[#a133f1] text-white h-11 px-4 flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <Code2 className="h-4 w-4" />
                                                <span className="font-black text-[12px] uppercase tracking-widest">{editDesignId ? 'MODIFY TEMPLATE' : 'DESIGN STUDIO'}</span>
                                            </div>
                                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-white hover:bg-white/10" onClick={() => setDesignView('gallery')}><X className="h-4 w-4" /></Button>
                                        </div>
                                        <CardContent className="p-6 space-y-6">
                                            <div className="grid grid-cols-2 gap-6">
                                                <div className="space-y-1.5">
                                                    <Label className="text-[11px] font-black uppercase text-slate-500">Template Name</Label>
                                                    <Input className="h-10 rounded-sm border-slate-200 focus:border-[#a133f1] focus:ring-0 text-[13px] font-semibold" value={designName} onChange={e => setDesignName(e.target.value)} />
                                                </div>
                                                <div className="space-y-1.5">
                                                    <Label className="text-[11px] font-black uppercase text-slate-500">Target Module</Label>
                                                    <Select value={selectedModule} onValueChange={setSelectedModule}>
                                                        <SelectTrigger className="h-10 rounded-sm border-slate-200 focus:border-[#a133f1] focus:ring-0 text-[13px] font-semibold">
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                        <SelectContent className="rounded-none">
                                                            {MOCK_MODULES.map(m => <SelectItem key={m.id} value={m.id} className="font-bold text-[12px]">{m.name}</SelectItem>)}
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                            </div>
                                            <div className="space-y-1.5">
                                                <Label className="text-[11px] font-black uppercase text-slate-500">HTML Source (Canvas)</Label>
                                                <textarea
                                                    className="w-full min-h-[550px] p-6 font-mono text-[13px] bg-slate-50 border border-slate-200 focus:border-[#a133f1] outline-none text-slate-800 leading-relaxed rounded-sm selection:bg-purple-100"
                                                    value={designHtml}
                                                    onChange={e => setDesignHtml(e.target.value)}
                                                />
                                            </div>
                                        </CardContent>
                                        <div className="bg-slate-50 p-4 flex justify-end gap-3 border-t">
                                            <Button variant="outline" className="rounded-sm font-bold text-[12px] uppercase px-6 h-9 border-slate-300" onClick={() => setDesignView('gallery')}>Discard</Button>
                                            <Button onClick={handleSaveDesign} className="rounded-sm font-bold text-[12px] uppercase px-8 h-9 bg-[#a133f1] hover:bg-slate-800 shadow-sm transition-all">
                                                <Save className="mr-2 h-4 w-4" /> Finalize Template
                                            </Button>
                                        </div>
                                    </Card>
                                </div>
                                <div className="lg:col-span-1">
                                    <Card className="rounded-none border-t-[2.5px] border-t-[#a133f1] border-x border-b border-slate-200 shadow-sm overflow-hidden sticky top-6 bg-white">
                                        <div className="bg-slate-900 text-white h-11 px-4 flex items-center gap-3">
                                            <Layers className="h-4 w-4 text-purple-400" />
                                            <span className="font-black text-[12px] uppercase tracking-widest">System Parameters</span>
                                        </div>
                                        <CardContent className="p-4">
                                            <ScrollArea className="h-[600px] pr-2">
                                                <div className="space-y-2">
                                                    {INITIAL_PARAMETERS.map(p => (
                                                        <button
                                                            key={p.id}
                                                            onClick={() => setDesignHtml(prev => prev + `{${p.name}}`)}
                                                            className="w-full flex items-center justify-between p-3 border border-slate-100 bg-slate-50/50 hover:bg-[#a133f1] hover:text-white transition-all group font-mono text-[10px] font-bold rounded-sm"
                                                        >
                                                            {`{${p.name}}`}
                                                            <PlusCircle className="h-3 w-3 opacity-30 group-hover:opacity-100" />
                                                        </button>
                                                    ))}
                                                </div>
                                            </ScrollArea>
                                        </CardContent>
                                    </Card>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* --- SYSTEM OVERLAYS: IMAGE & LIVE RENDER --- */}
                <Dialog open={!!viewingDesign} onOpenChange={() => setViewingDesign(null)}>
                    <DialogContent className="max-w-[21cm] h-[95vh] flex flex-col p-0 overflow-hidden border-none shadow-2xl rounded-none">
                        <div className="bg-[#a133f1] text-white p-4 flex items-center justify-between shrink-0">
                            <span className="font-black text-xs uppercase tracking-widest">V-Insights Live Render Engine</span>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-white hover:bg-white/10" onClick={() => setViewingDesign(null)}><X className="h-5 w-5" /></Button>
                        </div>
                        <ScrollArea className="flex-1 bg-slate-200 p-8">
                            <div className="max-w-[19cm] mx-auto bg-white shadow-2xl p-[1cm] min-h-[27cm]">
                                {viewingDesign && <div dangerouslySetInnerHTML={{ __html: viewingDesign.template }} />}
                            </div>
                        </ScrollArea>
                    </DialogContent>
                </Dialog>

                <Dialog open={!!viewingImage} onOpenChange={() => setViewingImage(null)}>
                    <DialogContent className="max-w-7xl p-0 overflow-hidden bg-black/85 border-none rounded-none backdrop-blur-md flex items-center justify-center h-[100vh]">
                        <div className="relative w-full h-full flex items-center justify-center p-4">
                            <Button variant="ghost" size="icon" className="absolute top-4 right-4 text-white hover:bg-white/10 rounded-full h-12 w-12 z-50" onClick={() => setViewingImage(null)}>
                                <X className="h-8 w-8" />
                            </Button>
                            <img src={viewingImage || ''} alt="Preview" className="max-w-[90%] max-h-[90%] object-contain border-[5px] border-white shadow-2xl animate-in zoom-in-95" />
                        </div>
                    </DialogContent>
                </Dialog>
            </div>
        </div>
    );
}
