'use client';

import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import {
    getPDATransactionLoadData,
    editPDATransaction
} from '@/server/pda/transaction/pdatransactionsrs';
import type {
    IPDATransactionLoadData
} from '@/types/pda/transaction/pdatransactionsrs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, PlusCircle, ListTodo } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PDATransactionForm from './_components/PDATransactionForm';
import PDATransactionList from './_components/PDATransactionList';

export default function PDATransactionSRSPage() {
    const [loading, setLoading] = useState(true);
    const [loadData, setLoadData] = useState<IPDATransactionLoadData | null>(null);
    const [activeTab, setActiveTab] = useState('entry');
    const [editModeData, setEditModeData] = useState<any>(null);

    const fetchInitialData = async () => {
        setLoading(true);
        try {
            const response = await getPDATransactionLoadData();
            if (response.success && response.data) {
                setLoadData(response.data);
            } else {
                toast.error('Failed to load initial data');
            }
        } catch (error) {
            console.error('Error fetching load data:', error);
            toast.error('Failed to load configurations');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchInitialData();
    }, []);

    const handleEdit = async (pdaeId: number, amstId: number) => {
        try {
            const response = await editPDATransaction({
                ASMAY_Id: loadData?.fillyear?.$values?.[0]?.asmaY_Id || 0,
                PDAE_ID: pdaeId,
                Amst_Id: amstId
            });
            if (response.success && response.data) {
                const data = response.data;
                const mappedEditData = {
                    pdae_id: pdaeId,
                    amst_Id: amstId,
                    asmay_Id: loadData?.fillyear?.$values?.[0]?.asmaY_Id,
                    voucher_No: data.pdadetails?.$values?.[0]?.voucherno,
                    pdaE_Date: data.pdadetails?.$values?.[0]?.pdaE_Date,
                    pdaR_ModeOfPayment: data.pdadetails?.$values?.[0]?.pdaR_ModeOfPayment,
                    studentInfo: data.fillstudent?.$values?.[0],
                    rows: data.pdadetails?.$values.map((h: any) => ({
                        pdaeH_Id: h.pdaeH_Id,
                        PDAE_ID: h.pdaE_ID,
                        pdamH_Id: h.pdamH_Id.toString(),
                        pdamH_HeadName: h.pdamH_HeadName,
                        PDAEH_Amount: h.pdaeH_Amount,
                        PDAE_Remarks: h.pdaE_Remarks
                    }))
                };
                setEditModeData(mappedEditData);
                setActiveTab('entry');
                toast.info('Editing transaction');
            }
        } catch (error) {
            toast.error('Failed to load record for editing');
        }
    };

    if (loading) {
        return (
            <div className="flex h-[600px] flex-col items-center justify-center gap-6 animate-in fade-in duration-500">
                <div className="relative">
                    <Loader2 className="h-16 w-16 animate-spin text-primary opacity-20" />
                    <Loader2 className="h-16 w-16 animate-spin text-primary absolute top-0 left-0" style={{ animationDirection: 'reverse', animationDuration: '2s' }} />
                </div>
                <div className="space-y-2 text-center">
                    <p className="text-xl font-black text-gray-800 tracking-tight">Initializing PDA Module</p>
                    <p className="text-sm text-gray-400 font-medium italic">Fetching latest financial configurations...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="container max-w-7xl mx-auto space-y-10 p-6 pb-20">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-2 animate-in slide-in-from-left-4 duration-500">
                </div>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
                <div className="flex justify-center">
                    <TabsList className="h-16 p-2 rounded-3xl bg-gray-100/80 backdrop-blur-md border border-gray-200/50 shadow-inner">
                        <TabsTrigger
                            value="entry"
                            className="h-full rounded-2xl px-10 data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-xl transition-all font-bold flex gap-3"
                        >
                            <PlusCircle size={20} />
                            {editModeData ? 'Edit Transaction' : 'Transaction Entry'}
                        </TabsTrigger>
                        <TabsTrigger
                            value="list"
                            className="h-full rounded-2xl px-10 data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-xl transition-all font-bold flex gap-3"
                        >
                            <ListTodo size={20} />
                            Transaction List
                        </TabsTrigger>
                    </TabsList>
                </div>

                <TabsContent value="entry" className="mt-0 focus-visible:outline-none">
                    <Card className="border-none shadow-2xl bg-white/40 backdrop-blur-xl overflow-hidden rounded-[2.5rem] border border-white/20 animate-in zoom-in-95 duration-700">
                        <CardHeader className="border-b bg-gray-50/50 px-10 py-8">
                            <CardTitle className="text-2xl font-black text-gray-800 flex items-center gap-3">
                                <div className="h-3 w-3 rounded-full bg-primary animate-pulse" />
                                {editModeData ? 'Update Record' : 'Create New Transaction'}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-10">
                            <PDATransactionForm
                                academicYears={loadData?.fillyear?.$values || []}
                                classes={loadData?.classlist?.$values || []}
                                heads={loadData?.pdadata?.$values || []}
                                initialStudents={loadData?.fillstudent?.$values || []}
                                editData={editModeData}
                                onSuccess={() => {
                                    setEditModeData(null);
                                    fetchInitialData();
                                    setActiveTab('list');
                                }}
                            />
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="list" className="mt-0 focus-visible:outline-none">
                    <PDATransactionList
                        transactions={loadData?.receiparraydelete?.$values || []}
                        academicYearId={loadData?.fillyear?.$values?.[0]?.asmaY_Id || 0}
                        onEdit={handleEdit}
                        onRefresh={fetchInitialData}
                        roleName={loadData?.rolename}
                    />
                </TabsContent>
            </Tabs>
        </div>
    );
}
