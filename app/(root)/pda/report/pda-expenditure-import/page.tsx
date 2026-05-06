'use client';

import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import {
    getPDAExpenditureImportLoadData,
    checkPDAExpenditureValidation,
    savePDAExpenditureImport
} from '@/server/pda/report/pda-expenditure-import';
import type {
    IPDAExpenditureImportLoadData,
    IPDAExpenditureImportRow
} from '@/types/pda/report/pda-expenditure-import';
import PDAExpenditureImportForm from '@/app/(root)/pda/report/pda-expenditure-import/_components/PDAExpenditureImportForm';
import PDAExpenditureImportGrid from '@/app/(root)/pda/report/pda-expenditure-import/_components/PDAExpenditureImportGrid';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

export default function PDAExpenditureImportPage() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [loadData, setLoadData] = useState<IPDAExpenditureImportLoadData | null>(null);
    const [importedData, setImportedData] = useState<IPDAExpenditureImportRow[]>([]);
    const [selectedAsmayId, setSelectedAsmayId] = useState<number | null>(null);
    const [trnType, setTrnType] = useState<'Debit' | 'Credit'>('Debit');
    const [totalAmount, setTotalAmount] = useState(0);

    useEffect(() => {
        const fetchLoadData = async () => {
            try {
                const response = await getPDAExpenditureImportLoadData();
                if (response.success && response.data) {
                    setLoadData(response.data);
                    // Set default year if available
                    const defaultYear = response.data.academicyearlist?.find((y: any) => y.Selected);
                    if (defaultYear) {
                        setSelectedAsmayId(defaultYear.asmaY_Id);
                    } else if (response.data.academicyearlist?.length > 0) {
                        setSelectedAsmayId(response.data.academicyearlist[0].asmaY_Id);
                    }
                }
            } catch (error) {
                console.error('Error fetching load data:', error);
                toast.error('Failed to load initial data');
            } finally {
                setLoading(false);
            }
        };

        fetchLoadData();
    }, []);

    const handleImport = async (data: IPDAExpenditureImportRow[]) => {
        try {
            const validationResponse = await checkPDAExpenditureValidation({ newlstget1: data });
            if (validationResponse.data?.stuStatus) {
                toast.error(validationResponse.data.stuStatus);
                setImportedData([]);
                setTotalAmount(0);
                return;
            }

            setImportedData(data);
            const total = data.reduce((sum, row) => sum + (Number(row.Amount) || 0), 0);
            setTotalAmount(total);
            toast.success(`${data.length} records imported successfully`);
        } catch (error) {
            console.error('Validation error:', error);
            toast.error('Error validating imported data');
        }
    };

    const handleSave = async () => {
        if (!selectedAsmayId) {
            toast.error('Please select an Academic Year');
            return;
        }

        if (importedData.length === 0) {
            toast.error('No data to save. Please import an Excel file first.');
            return;
        }

        setSaving(true);
        try {
            const formattedData = importedData.map(row => {
                // Convert DD/MM/YYYY to YYYY/MM/DD
                const dateParts = row.Date.split('/');
                const formattedDate = dateParts.length === 3
                    ? `${dateParts[2]}/${dateParts[1]}/${dateParts[0]}`
                    : row.Date;

                return {
                    AMST_AdmNo: row.RollNumber,
                    PDAE_Date: formattedDate,
                    PDAE_TotAmount: Number(row.Amount),
                    AMST_FirstName: row.StudentName,
                    Particular: row.Particulars,
                    VoucherNo: row.VoucherNo,
                    remarks: ""
                };
            });

            const payload = {
                FeeReceiptimport: formattedData,
                ASMAY_Id: selectedAsmayId,
                PDAR_ModeOfPayment: trnType
            };

            const response = await savePDAExpenditureImport(payload);
            if (response.data?.returnval) {
                toast.success(`Records Saved -- ${response.data.studentdata}`);
                // Reload page or reset state
                setTimeout(() => {
                    window.location.reload();
                }, 2000);
            } else {
                toast.error('Please Select Correct File Format');
            }
        } catch (error) {
            console.error('Save error:', error);
            toast.error('Error saving data');
        } finally {
            setSaving(false);
        }
    };

    const handleCancel = () => {
        window.location.reload();
    };

    if (loading) {
        return (
            <div className="flex h-[400px] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="container space-y-8 p-6 animate-in fade-in duration-500">
            <div className="flex items-center justify-between">
                <div>
                </div>
            </div>

            <Card className="border-none shadow-xl bg-white/50 backdrop-blur-sm">
                <CardHeader className="border-b bg-gray-50/50">
                    <CardTitle className="text-xl font-semibold text-gray-800">Import Configuration</CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                    <PDAExpenditureImportForm
                        academicYears={loadData?.academicyearlist || []}
                        selectedAsmayId={selectedAsmayId}
                        setSelectedAsmayId={setSelectedAsmayId}
                        trnType={trnType}
                        setTrnType={setTrnType}
                        onImport={handleImport}
                    />
                </CardContent>
            </Card>

            {importedData.length > 0 && (
                <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
                    <Card className="border-none shadow-xl">
                        <CardHeader className="border-b bg-gray-50/50 flex flex-row items-center justify-between">
                            <CardTitle className="text-xl font-semibold text-gray-800">Imported Data Preview</CardTitle>
                            <div className="text-sm font-medium px-4 py-2 bg-primary/10 text-primary rounded-full">
                                Total Amount: {totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </div>
                        </CardHeader>
                        <CardContent className="p-0">
                            <PDAExpenditureImportGrid data={importedData} />
                        </CardContent>
                    </Card>

                    <div className="flex justify-center gap-4 py-4">
                        <button
                            onClick={handleSave}
                            disabled={saving}
                            className="inline-flex items-center justify-center rounded-md bg-primary px-8 py-3 text-sm font-semibold text-white shadow-lg transition-all hover:bg-primary/90 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:hover:scale-100"
                        >
                            {saving ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Saving...
                                </>
                            ) : (
                                'Save Records'
                            )}
                        </button>
                        <button
                            onClick={handleCancel}
                            disabled={saving}
                            className="inline-flex items-center justify-center rounded-md border border-gray-300 bg-white px-8 py-3 text-sm font-semibold text-gray-700 shadow-sm transition-all hover:bg-gray-50 hover:scale-105 active:scale-95 disabled:opacity-50"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
