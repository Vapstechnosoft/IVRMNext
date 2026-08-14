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
import React, { useEffect, useState, useMemo, useCallback } from 'react';
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

    // Communication Channels
    const [sms, setSms] = useState(false);
    const [email, setEmail] = useState(false);
    const [whatsapp, setWhatsapp] = useState(false);

    const isAnySelected = sms || email || whatsapp;

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

    const handleCategoryChange = React.useCallback(async (type: string, values?: any) => {
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
    }, []);

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

                // Try to find any available template for this person
                const element =
                    document.getElementById(`birthday-card-premium-${id}`) ||
                    document.getElementById(`birthday-card-classic-${id}`);

                let imageBase64 = null;
                if (element && (values.Whatsapp || values.email)) {
                    const canvas = await html2canvas(element, {
                        useCORS: true,
                        allowTaint: false,
                        scale: 2,
                        backgroundColor: '#ffffff',
                        logging: false
                    });
                    imageBase64 = canvas.toDataURL('image/jpeg', 0.9).replace(/^data:image\/jpeg;base64,/, "");
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

            if (res.success) {
                await Swal.fire('Success', res.message || 'Birthday wishes sent successfully!', 'success');
                window.location.reload();
            } else {
                Swal.fire('Error', res.message || 'Failed to send wishes', 'error');
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
            <div className='flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 bg-white border border-b-0 rounded-t-3xl shadow-sm print:hidden'>
                <div className='flex items-center gap-3'>
                    <div className='p-2 bg-orange-100 rounded-xl'>
                        <Cake className="h-5 w-5 text-orange-600" />
                    </div>
                    <span className='text-sm font-black uppercase tracking-[2px] text-slate-400'>Birthday Module Management</span>
                </div>
                <div className='flex items-center gap-4'>
                    <Badge variant="outline" className="h-11 px-6 rounded-2xl border-slate-200 text-slate-400 bg-slate-50/50 text-[10px] font-black tracking-widest border-none">
                        {participants.length} TOTAL RECORDS
                    </Badge>
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={handlePrint}
                        className="h-11 w-11 rounded-2xl shadow-sm bg-white hover:bg-slate-50 border-slate-200"
                    >
                        <Printer className="h-4 w-4 text-slate-400" />
                    </Button>
                </div>
            </div>

            <BirthdayForm
                initialData={initialData}
                totalRecords={participants.length}
                onTypeChange={handleCategoryChange}
                onChannelChange={(channels) => {
                    setSms(channels.sms);
                    setEmail(channels.email);
                    setWhatsapp(channels.Whatsapp);
                }}
                onSubmit={handleSendWishes}
                onCancel={() => window.location.reload()}
                isLoading={sending}
            />

            <div className='grid grid-cols-1 gap-12 lg:grid-cols-12 print:block'>
                <div className='lg:col-span-12 space-y-12'>

                    {/* List Section */}
                    {participants.length > 0 && (
                        <div className="print:hidden space-y-4 animate-in fade-in slide-in-from-top-4 duration-700">
                            <div className='flex items-center justify-between p-6 bg-gradient-to-r from-[#1e40af] to-[#3b82f6] border rounded-t-3xl shadow-lg'>
                                <div className='flex items-center gap-4'>
                                    <div className='p-2 bg-white/20 rounded-xl backdrop-blur-sm'>
                                        <Search className="h-5 w-5 text-white" />
                                    </div>
                                    <span className='text-sm font-black uppercase tracking-[3px] text-white'>Birthday List Management</span>
                                </div>
                            </div>

                            <div className='relative group'>
                                <ParticipantTable
                                    data={participants}
                                    type={category}
                                    selectedRows={selectedRows}
                                    onRowSelectionChange={setSelectedRows}
                                    isLoading={searching}
                                />
                            </div>
                        </div>
                    )}

                    {/* Preview Section - Modern Grid */}
                    {/* <div className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-300">
                        <div className="flex items-center justify-between border-b border-slate-200 pb-6 print:hidden">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-gradient-to-br from-amber-400 to-orange-600 rounded-2xl shadow-lg shadow-orange-200">
                                    <Search className="h-6 w-6 text-white" />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-black text-slate-800 tracking-tight uppercase">Wish Preview Gallery</h2>
                                    <p className="text-slate-400 text-[10px] font-bold tracking-[2px] uppercase mt-1">Live visualization of outgoing wishes</p>
                                </div>
                            </div>
                            <div className="flex gap-3">
                                {selectedRows.length > 0 && (
                                    <Badge className="bg-primary/10 text-primary rounded-full px-6 h-10 font-black text-[10px] tracking-widest border-none flex items-center gap-2">
                                        <div className="h-2 w-2 bg-primary rounded-full animate-pulse" />
                                        {selectedRows.length} RECIPIENTS SELECTED
                                    </Badge>
                                )}
                            </div>
                        </div>

                        {selectedRows.length > 0 ? (
                            <Tabs defaultValue="classic" className="w-full print:hidden">
                                <div className="flex justify-center mb-10">
                                    <TabsList className="bg-slate-100/80 backdrop-blur-sm p-1.5 rounded-[2rem] h-16 border shadow-inner">
                                        <TabsTrigger value="classic" className="rounded-[1.5rem] h-12 px-10 font-black text-[10px] tracking-widest data-[state=active]:bg-white data-[state=active]:shadow-xl data-[state=active]:text-primary transition-all duration-300">
                                            CLASSIC THEME
                                        </TabsTrigger>
                                        <TabsTrigger value="premium" className="rounded-[1.5rem] h-12 px-10 font-black text-[10px] tracking-widest data-[state=active]:bg-white data-[state=active]:shadow-xl data-[state=active]:text-orange-600 transition-all duration-300">
                                            PREMIUM TEMPLATE
                                        </TabsTrigger>
                                    </TabsList>
                                </div>

                                <TabsContent value="classic" className="mt-0 focus-visible:outline-none">
                                    <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-10 items-center justify-items-center animate-in zoom-in-95 fade-in duration-700'>
                                        {selectedRows.map((person) => (
                                            <div key={`classic-container-${category === 'Staff' ? person.hrmE_Id : person.amsT_Id}`} className="hover:scale-105 transition-transform duration-500">
                                                <BirthdayTemplate
                                                    participant={person}
                                                    type={category}
                                                    variant="classic"
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </TabsContent>

                                <TabsContent value="premium" className="mt-0 focus-visible:outline-none">
                                    <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-12 items-center justify-items-center animate-in zoom-in-95 fade-in duration-700'>
                                        {selectedRows.map((person) => (
                                            <div key={`premium-container-${category === 'Staff' ? person.hrmE_Id : person.amsT_Id}`} className="hover:scale-105 transition-transform duration-500">
                                                <BirthdayTemplate
                                                    participant={person}
                                                    type={category}
                                                    variant="premium"
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </TabsContent>
                            </Tabs>
                        ) : (
                            <div className='flex h-96 w-full flex-col items-center justify-center rounded-[3rem] border-4 border-dashed border-slate-200 bg-white/50 print:hidden group hover:border-primary/20 transition-colors duration-500'>
                                <div className="p-8 bg-white rounded-3xl shadow-2xl border border-slate-100 group-hover:scale-110 group-hover:rotate-6 transition-all duration-700">
                                    <Cake className="h-20 w-20 text-slate-200 group-hover:text-primary transition-colors duration-500" />
                                </div>
                                <p className="mt-8 font-black text-slate-300 tracking-[6px] uppercase text-[10px] group-hover:text-slate-400 transition-colors">Select participants to generate previews</p>
                            </div>
                        )}

                        <div className="hidden print:block">
                            <div className='grid grid-cols-2 gap-16 items-center justify-items-center'>
                                {selectedRows.map((person) => (
                                    <BirthdayTemplate
                                        key={`print-${category === 'Staff' ? person.hrmE_Id : person.amsT_Id}`}
                                        participant={person}
                                        type={category}
                                        variant={initialData?.mI_Id === 30 ? "premium" : "classic"}
                                    />
                                ))}
                            </div>
                        </div>
                    </div> */}
                </div>
            </div>

            <FeedbackDialog
                open={feedbackOpen}
                onOpenChange={setFeedbackOpen}
                questions={feedbackQuestions}
                mI_Id={initialData?.mI_Id}
                hrmE_Id={initialData?.hrmE_Id}
            />

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
