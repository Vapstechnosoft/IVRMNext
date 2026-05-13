'use client';

import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import {
    getBirthdayInitialData,
    getFeedbackQuestions,
    getParticipantList,
    sendBirthdayMessages
} from '@/server/alumni/alumni-student-birthday';
import html2canvas from 'html2canvas';
import { Loader2, Cake, Search, Download, Printer, PartyPopper } from 'lucide-react';
import { useEffect, useState, useMemo } from 'react';
import { toast } from 'sonner';
import Swal from 'sweetalert2';
import BirthdayForm from './_components/birthday-form';
import BirthdayTemplate from './_components/birthday-template';
import FeedbackDialog from './_components/feedback-dialog';
import ParticipantTable from './_components/participant-table';
import type { IBirthdayFormValues } from './_components/schema';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function AlumniStudentBirthdayPage() {
    const [initialData, setInitialData] = useState<any>(null);
    const [participants, setParticipants] = useState<any[]>([]);
    const [selectedRows, setSelectedRows] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searching, setSearching] = useState(false);
    const [sending, setSending] = useState(false);

    // Category Type
    const [category, setCategory] = useState('student');

    // Feedback State
    const [feedbackOpen, setFeedbackOpen] = useState(false);
    const [feedbackQuestions, setFeedbackQuestions] = useState<any[]>([]);

    const fetchData = async () => {
        try {
            const [initRes, feedbackRes] = await Promise.all([
                getBirthdayInitialData(),
                getFeedbackQuestions({ Flag: 'BirthDay' })
            ]);

            const data = (initRes as any)?.data || initRes;
            setInitialData(data);

            const feedbackData = (feedbackRes as any)?.data || feedbackRes;
            if (feedbackData?.feedbackquestion?.length > 0) {
                const enriched = feedbackData.feedbackquestion.map((fq: any) => ({
                    ...fq,
                    feedbackoptiondata: feedbackData.feedbackoption.filter(
                        (fo: any) => fo.fmtY_Id === fq.fmtY_Id && fo.fmqE_Id === fq.fmqE_Id
                    )
                }));
                setFeedbackQuestions(enriched);
                setFeedbackOpen(true);
            }

            // No default category selection to avoid automatic fetch
            // handleCategoryChange('student', { asmaY_Id: activeYear?.asmaY_Id });
        } catch (error) {
            console.error('Initial fetch failed:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleCategoryChange = async (type: string, values?: any) => {
        setCategory(type);
        setSearching(true);
        setSelectedRows([]);
        try {
            const res = await getParticipantList({
                rdbbutton: type,
                asmaY_Id: values?.asmaY_Id,
                asmcL_Id: values?.asmcL_Id,
                asmS_Id: values?.asmS_Id,
                ...(type === 'student' ? { Logintype: 'KIOSK', MO_Id: 1 } : {})
            });
            const result = (res as any)?.data || res;
            if (type === 'Staff') {
                setParticipants(result.staffList?.length > 0 ? result.staffList : (result.staffData || []));
            } else {
                setParticipants(result.studentlist?.length > 0 ? result.studentlist : (result.studentData || []));
            }
        } catch (error) {
            toast.error('Failed to fetch participants');
        } finally {
            setSearching(false);
        }
    };

    const handleSendWishes = async (values: IBirthdayFormValues) => {
        if (selectedRows.length === 0) {
            toast.error('Please select at least one recipient');
            return;
        }

        const confirmResult = await Swal.fire({
            title: 'Send Birthday Wishes?',
            text: `This will send wishes via ${[values.sms && 'SMS', values.email && 'Email', values.Whatsapp && 'WhatsApp'].filter(Boolean).join(', ')}`,
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Yes, Send it!',
            confirmButtonColor: '#4f46e5',
            cancelButtonColor: '#ef4444'
        });

        if (!confirmResult.isConfirmed) return;

        setSending(true);
        try {
            const wishesPayload = [];

            for (const person of selectedRows) {
                const id = category === 'Staff' ? person.hrmE_Id : person.amsT_Id;

                // Capture both classic and premium if needed, but legacy logic mostly sent one image.
                // We'll capture the classic template as the default payload image.
                const element = document.getElementById(`birthday-card-classic-${id}`);

                let imageBase64 = null;
                if (element && (values.Whatsapp || values.email)) {
                    const canvas = await html2canvas(element, {
                        useCORS: true,
                        allowTaint: false,
                        scale: 2,
                        backgroundColor: '#ffffff'
                    });
                    imageBase64 = canvas.toDataURL('image/jpeg', 0.8).replace(/^data:image\/jpeg;base64,/, "");
                }

                wishesPayload.push({
                    ...person,
                    image_base_64: imageBase64
                });
            }

            const res = await sendBirthdayMessages({
                selectedStudent: category !== 'Staff' ? wishesPayload : [],
                selectedEmployees: category === 'Staff' ? wishesPayload : [],
                rdbbutton: category,
                smsflag: String(values.sms),
                emailflag: String(values.email),
                whatsappFlag: String(values.Whatsapp)
            });

            if (res.smsStatus || res.emailStatus || res.whatsappstatus) {
                Swal.fire('Success', 'Birthday wishes sent successfully!', 'success');
                setSelectedRows([]);
            } else {
                toast.error('Failed to send wishes');
            }
        } catch (error) {
            console.error('Send failed:', error);
            toast.error('An error occurred while sending');
        } finally {
            setSending(false);
        }
    };

    const handlePrint = () => {
        if (selectedRows.length === 0) {
            toast.error('Please select participants to print');
            return;
        }
        window.print();
    };

    if (loading) {
        return (
            <div className='flex h-screen flex-col items-center justify-center gap-4 bg-slate-50'>
                <div className="relative">
                    <Loader2 className='h-16 w-16 animate-spin text-primary opacity-20' />
                    <Cake className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-8 w-8 text-primary animate-pulse" />
                </div>
                <p className="text-slate-500 font-bold tracking-widest text-xs uppercase animate-pulse">Initializing Birthday Portal...</p>
            </div>
        );
    }

    return (
        <div className='p-8 space-y-8 min-h-screen bg-[#f8fafc] print:bg-white print:p-0'>
            {/* Legacy Dashboard Header */}
            <div className='space-y-4 print:hidden'>
                <h1 className='text-xl font-bold text-slate-800 uppercase tracking-tight'>
                    Dashboard
                </h1>
                <div className='h-[1px] w-full bg-orange-400' />
            </div>

            <div className='flex flex-col md:flex-row md:items-center justify-between gap-6 print:hidden'>
                <div className='flex items-center gap-3 text-slate-500'>
                    <Cake className="h-5 w-5 text-orange-400" />
                    <span className='text-sm font-bold uppercase tracking-wider'>Birthday Module Management</span>
                </div>
                <div className='flex items-center gap-4'>
                    <Badge variant="outline" className="h-10 px-6 rounded-xl border-slate-200 text-slate-500 bg-white text-[10px] font-black tracking-widest">
                        {participants.length} TOTAL RECORDS
                    </Badge>
                    <Button
                        variant="secondary"
                        size="icon"
                        onClick={handlePrint}
                        className="h-10 w-10 rounded-xl shadow-sm bg-white hover:bg-slate-50 border border-slate-200"
                    >
                        <Printer className="h-4 w-4 text-slate-600" />
                    </Button>
                </div>
            </div>

            <BirthdayForm
                initialData={initialData}
                onTypeChange={handleCategoryChange}
                onSubmit={handleSendWishes}
                onCancel={() => window.location.reload()}
                isLoading={sending}
            />

            <div className='grid grid-cols-1 gap-12 lg:grid-cols-12 print:block'>
                <div className='lg:col-span-12 space-y-12'>

                    {/* List Section */}
                    <div className="print:hidden">
                        <ParticipantTable
                            data={participants}
                            type={category}
                            selectedRows={selectedRows}
                            onRowSelectionChange={setSelectedRows}
                            isLoading={searching}
                        />
                    </div>

                    {/* Preview Section - Modern Grid */}
                    <div className="space-y-8">
                        <div className="flex items-center justify-between border-b border-slate-200 pb-6 print:hidden">
                            <div className="flex items-center gap-4">
                                <div className="p-2 bg-amber-500 rounded-xl">
                                    <Search className="h-5 w-5 text-white" />
                                </div>
                                <h2 className="text-2xl font-black text-slate-800 tracking-tight uppercase">Wish Preview Gallery</h2>
                            </div>
                            <div className="flex gap-2">
                                <Badge className="bg-slate-100 text-slate-500 rounded-lg px-4 h-8 font-black text-[10px] tracking-widest border-none">
                                    {selectedRows.length} SELECTED
                                </Badge>
                            </div>
                        </div>

                        {selectedRows.length > 0 ? (
                            <Tabs defaultValue="classic" className="w-full print:hidden">
                                <div className="flex justify-center mb-8">
                                    <TabsList className="bg-slate-100 p-1.5 rounded-2xl h-14 border shadow-inner">
                                        <TabsTrigger value="classic" className="rounded-xl h-11 px-8 font-black text-[10px] tracking-widest data-[state=active]:bg-white data-[state=active]:shadow-lg">CLASSIC CARDS</TabsTrigger>
                                        <TabsTrigger value="premium" className="rounded-xl h-11 px-8 font-black text-[10px] tracking-widest data-[state=active]:bg-white data-[state=active]:shadow-lg text-primary">PREMIUM TEMPLATE</TabsTrigger>
                                    </TabsList>
                                </div>

                                <TabsContent value="classic" className="mt-0">
                                    <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-8 items-center justify-items-center animate-in fade-in duration-700'>
                                        {selectedRows.map((person) => (
                                            <BirthdayTemplate
                                                key={`classic-${category === 'Staff' ? person.hrmE_Id : person.amsT_Id}`}
                                                participant={person}
                                                type={category}
                                                variant="classic"
                                            />
                                        ))}
                                    </div>
                                </TabsContent>

                                <TabsContent value="premium" className="mt-0">
                                    <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-12 items-center justify-items-center animate-in fade-in duration-700'>
                                        {selectedRows.map((person) => (
                                            <BirthdayTemplate
                                                key={`premium-${category === 'Staff' ? person.hrmE_Id : person.amsT_Id}`}
                                                participant={person}
                                                type={category}
                                                variant="premium"
                                            />
                                        ))}
                                    </div>
                                </TabsContent>
                            </Tabs>
                        ) : (
                            <div className='flex h-96 w-full flex-col items-center justify-center rounded-[40px] border-4 border-dashed border-slate-200 bg-slate-50/50 print:hidden group'>
                                <div className="p-6 bg-white rounded-3xl shadow-xl border border-slate-100 group-hover:scale-110 transition-transform duration-500">
                                    <Cake className="h-16 w-16 text-slate-200 group-hover:text-primary transition-colors" />
                                </div>
                                <p className="mt-6 font-black text-slate-300 tracking-[4px] uppercase text-xs">Select participants to see card previews</p>
                            </div>
                        )}

                        {/* Print Layout - Only visible when printing */}
                        <div className="hidden print:block">
                            <div className='grid grid-cols-2 gap-12 items-center justify-items-center'>
                                {selectedRows.map((person) => (
                                    <BirthdayTemplate
                                        key={`print-${category === 'Staff' ? person.hrmE_Id : person.amsT_Id}`}
                                        participant={person}
                                        type={category}
                                        variant="premium"
                                    />
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <FeedbackDialog open={feedbackOpen} onOpenChange={setFeedbackOpen} questions={feedbackQuestions} />

            {/* Loading Overlay for Sending */}
            {sending && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[100] flex flex-col items-center justify-center gap-6 animate-in fade-in duration-300">
                    <div className="relative">
                        <div className="h-24 w-24 border-8 border-primary/20 border-t-primary rounded-full animate-spin" />
                        <PartyPopper className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-10 w-10 text-primary animate-bounce" />
                    </div>
                    <div className="text-center space-y-2">
                        <h2 className="text-2xl font-black text-white tracking-[2px] uppercase">Spreading the Joy...</h2>
                        <p className="text-primary-foreground/60 font-medium tracking-wide">Capturing and sending birthday cards</p>
                    </div>
                </div>
            )}
        </div>
    );
}
