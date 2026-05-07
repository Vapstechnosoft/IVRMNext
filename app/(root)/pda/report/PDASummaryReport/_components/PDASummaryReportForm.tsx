'use client';

import React, { useState, useEffect } from 'react';
import { Label } from '@/components/ui/label';
import { 
    Select, 
    SelectContent, 
    SelectItem, 
    SelectTrigger, 
    SelectValue 
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Search, RotateCcw, FileBarChart } from 'lucide-react';
import { getPDASummaryReportSections } from '@/server/pda/report/pda-summary-report';
import { toast } from 'sonner';

interface PDASummaryReportFormProps {
    academicYears: { asmaY_Id: number; asmaY_Year: string }[];
    classes: { asmcL_Id: number; asmcL_ClassName: string }[];
    onSubmit: (data: any) => void;
    onReset: () => void;
}

export default function PDASummaryReportForm({
    academicYears,
    classes,
    onSubmit,
    onReset
}: PDASummaryReportFormProps) {
    const [selectedAsmayId, setSelectedAsmayId] = useState<string>('');
    const [selectedAsmcLId, setSelectedAsmcLId] = useState<string>('');
    const [selectedAmscId, setSelectedAmscId] = useState<string>('');
    
    const [sections, setSections] = useState<{ amsC_Id: number; asmc_sectionname: string }[]>([]);
    const [loadingSections, setLoadingSections] = useState(false);

    useEffect(() => {
        const fetchSections = async () => {
            if (selectedAsmayId && selectedAsmcLId) {
                setLoadingSections(true);
                try {
                    const response = await getPDASummaryReportSections({
                        ASMAY_Id: Number(selectedAsmayId),
                        ASMCL_Id: Number(selectedAsmcLId)
                    });
                    if (response.success && response.data?.fillsection?.$values) {
                        setSections(response.data.fillsection.$values);
                    } else {
                        setSections([]);
                    }
                } catch (error) {
                    console.error('Error fetching sections:', error);
                    setSections([]);
                } finally {
                    setLoadingSections(false);
                }
            } else {
                setSections([]);
            }
        };
        fetchSections();
    }, [selectedAsmayId, selectedAsmcLId]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!selectedAsmayId || !selectedAsmcLId || !selectedAmscId) {
            toast.error('Please select Year, Class and Section');
            return;
        }

        onSubmit({
            ASMAY_Id: Number(selectedAsmayId),
            ASMCL_Id: Number(selectedAsmcLId),
            ASMS_Id: Number(selectedAmscId),
            AMST_Id: 0,
            type: 'All', // Defaulting to All as per the consolidated nature
            studentdata: 0,
            refundamt: 0
        });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-8 animate-in fade-in duration-500">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                    <Label className="text-sm font-semibold text-gray-700">Academic Year <span className="text-red-500">*</span></Label>
                    <Select value={selectedAsmayId} onValueChange={setSelectedAsmayId}>
                        <SelectTrigger className="h-11 rounded-xl border-gray-200 bg-white/50 backdrop-blur-sm transition-all hover:border-primary">
                            <SelectValue placeholder="Select Year" />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl border-gray-100">
                            {academicYears.map((year) => (
                                <SelectItem key={year.asmaY_Id} value={year.asmaY_Id.toString()}>{year.asmaY_Year}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className="space-y-2">
                    <Label className="text-sm font-semibold text-gray-700">Class <span className="text-red-500">*</span></Label>
                    <Select value={selectedAsmcLId} onValueChange={setSelectedAsmcLId}>
                        <SelectTrigger className="h-11 rounded-xl border-gray-200 bg-white/50 backdrop-blur-sm transition-all hover:border-primary">
                            <SelectValue placeholder="Select Class" />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl border-gray-100">
                            {classes.map((cls) => (
                                <SelectItem key={cls.asmcL_Id} value={cls.asmcL_Id.toString()}>{cls.asmcL_ClassName}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className="space-y-2">
                    <Label className="text-sm font-semibold text-gray-700">Section <span className="text-red-500">*</span></Label>
                    <Select 
                        value={selectedAmscId} 
                        onValueChange={setSelectedAmscId}
                        disabled={loadingSections || !selectedAsmcLId}
                    >
                        <SelectTrigger className="h-11 rounded-xl border-gray-200 bg-white/50 backdrop-blur-sm transition-all hover:border-primary">
                            <SelectValue placeholder={loadingSections ? 'Loading...' : 'Select Section'} />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl border-gray-100">
                            <SelectItem value="0">--All--</SelectItem>
                            {sections.map((section) => (
                                <SelectItem key={section.amsC_Id} value={section.amsC_Id.toString()}>{section.asmc_sectionname}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div className="flex justify-center gap-4">
                <Button 
                    type="submit" 
                    className="h-12 px-10 rounded-xl bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20 transition-all hover:scale-105 active:scale-95"
                >
                    <Search className="mr-2 h-5 w-5" />
                    Generate Summary
                </Button>
                <Button 
                    type="button" 
                    variant="outline" 
                    onClick={onReset}
                    className="h-12 px-10 rounded-xl border-gray-200 hover:bg-gray-50 transition-all hover:scale-105 active:scale-95"
                >
                    <RotateCcw className="mr-2 h-5 w-5 text-gray-500" />
                    Reset
                </Button>
            </div>
        </form>
    );
}
