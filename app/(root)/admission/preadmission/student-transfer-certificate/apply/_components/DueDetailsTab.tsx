'use client';

import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Eye } from 'lucide-react';

interface DueDetailsTabProps {
    data: any;
    disabled?: boolean;
}

export const DueDetailsTab = ({ data, disabled }: DueDetailsTabProps) => {
    // Extract totals from data
    const feeDueAmount = data?.fee_Due_Amnt || 0;
    const libraryDueCount = data?.library_Due_Amnt || 0;
    const pdaDueAmount = data?.pdA_Due || 0;
    const storeDueAmount = 0; // Placeholder as not mapped yet

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
            <div className="border rounded-md bg-white shadow-sm overflow-hidden">
                <div className="bg-[#2b589f] px-4 py-2 font-bold text-white uppercase text-sm">
                    Due Details
                </div>

                <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-x-12 gap-y-6">

                    {/* Left Column */}
                    <div className="space-y-6">
                        {/* Fee Due */}
                        <div className="flex items-end gap-2">
                            <div className="grid grid-cols-[160px_1fr] items-center gap-4 flex-1">
                                <Label className="text-right text-indigo-900 font-semibold">Fee Due :</Label>
                                <Input
                                    value={feeDueAmount}
                                    readOnly
                                    className="bg-gray-50 text-right font-mono text-red-600 font-bold"
                                    disabled={disabled}
                                />
                            </div>
                            <Button variant="secondary" size="sm" className="bg-gray-200 hover:bg-gray-300 text-xs font-bold px-2 h-9 min-w-[120px]">
                                <Eye className="w-3 h-3 mr-1" /> FEE DETAILS
                            </Button>
                        </div>

                        {/* Store/Canteen Due */}
                        <div className="grid grid-cols-[160px_1fr] items-center gap-4 pr-[128px]"> {/* Padding to align with above input excluding button */}
                            <Label className="text-right text-indigo-900 font-semibold">Store/Canteen Due :</Label>
                            <Input
                                value={storeDueAmount}
                                readOnly
                                className="bg-gray-50 text-right font-mono"
                                disabled={disabled}
                            />
                        </div>
                    </div>

                    {/* Right Column */}
                    <div className="space-y-6">
                        {/* Library Due */}
                        <div className="flex items-end gap-2">
                            <div className="grid grid-cols-[160px_1fr] items-center gap-4 flex-1">
                                <Label className="text-right text-indigo-900 font-semibold">Library Due :</Label>
                                <Input
                                    value={libraryDueCount}
                                    readOnly
                                    className="bg-gray-50 text-right font-mono text-red-600 font-bold"
                                    disabled={disabled}
                                />
                            </div>
                            <Button variant="secondary" size="sm" className="bg-gray-200 hover:bg-gray-300 text-xs font-bold px-2 h-9 min-w-[160px]">
                                <Eye className="w-3 h-3 mr-1" /> LIBRARY DUE DETAILS
                            </Button>
                        </div>

                        {/* PDA Due */}
                        <div className="flex items-end gap-2">
                            <div className="grid grid-cols-[160px_1fr] items-center gap-4 flex-1">
                                <Label className="text-right text-indigo-900 font-semibold">PDA Due :</Label>
                                <Input
                                    value={pdaDueAmount}
                                    readOnly
                                    className="bg-gray-50 text-right font-mono text-red-600 font-bold"
                                    disabled={disabled}
                                />
                            </div>
                            <Button variant="secondary" size="sm" className="bg-gray-200 hover:bg-gray-300 text-xs font-bold px-2 h-9 min-w-[120px]">
                                <Eye className="w-3 h-3 mr-1" /> VIEW PDA DUE
                            </Button>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};
