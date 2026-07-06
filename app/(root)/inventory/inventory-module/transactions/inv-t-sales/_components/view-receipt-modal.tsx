'use client';

import { AdaptiveBody, AdaptiveDialog, AdaptiveFooter } from '@/components/ui/extension/adaptive-dialog';
import { Button } from '@/components/ui/button';
import { useInvTSales } from '@/hooks/inventory/transactions/use-inv-t-sales';
import type { IInvTSales } from '@/types/inventory/transactions/inv-t-sales';
import { useEffect, useState, useRef } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { numberToWords } from '@/lib/utils';
import { format } from 'date-fns';
import { useReactToPrint } from 'react-to-print';
import { createPortal } from 'react-dom';
import { Printer } from 'lucide-react';
import Image from 'next/image';

interface ViewReceiptModalProps {
    rowData: IInvTSales;
    onClose: () => void;
}

interface ReceiptHeader {
    studentname?: string;
    ASMCL_ClassName?: string;
    ASMC_SectionName?: string;
    AMST_AdmNo?: string;
    AMST_FatherName?: string;
    invmsL_SalesDate?: string;
    [key: string]: any;
}

interface ReceiptItem {
    invmI_ItemName: string;
    invtsL_SalesQty: number;
    invtsL_SalesPrice: number;
    invtsL_Amount: number;
    [key: string]: any;
}

export function ViewReceiptModal({ rowData, onClose }: ViewReceiptModalProps) {
    const { getSaleItemDetailsMutation, getSaletypesMutation } = useInvTSales();
    const [headerData, setHeaderData] = useState<ReceiptHeader | null>(null);
    const [items, setItems] = useState<ReceiptItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const contentRef = useRef<HTMLDivElement>(null);

    const handlePrint = useReactToPrint({
        contentRef: contentRef,
        documentTitle: `Receipt-${rowData.invmsL_SalesNo}`,
    });

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                const [headerResponse, itemsResponse]: [any, any] = await Promise.all([
                    getSaletypesMutation.mutateAsync({
                        invmsL_Id: rowData.invmsL_Id,
                        saletype: rowData.invmsL_StuOtherFlg
                    }),
                    getSaleItemDetailsMutation.mutateAsync(rowData.invmsL_Id)
                ]);

                if (headerResponse) {
                    const dataObj = headerResponse.data || headerResponse;
                    const dataArray = Array.isArray(dataObj) 
                        ? dataObj 
                        : (dataObj?.get_Saletypes || dataObj?.data?.get_Saletypes || (Array.isArray(dataObj?.data) ? dataObj.data : []));
                        
                    if (Array.isArray(dataArray) && dataArray.length > 0) {
                        setHeaderData(dataArray[0]);
                    }
                }

                if (itemsResponse) {
                    const dataObj = itemsResponse.data || itemsResponse;
                    const dataArray = Array.isArray(dataObj) 
                        ? dataObj 
                        : (dataObj?.get_SaleItemDetails || dataObj?.data?.get_SaleItemDetails || (Array.isArray(dataObj?.data) ? dataObj.data : []));
                        
                    if (Array.isArray(dataArray)) {
                        setItems(dataArray);
                    }
                }
            } catch (error) {
                console.error('Error fetching receipt details:', error);
            } finally {
                setIsLoading(false);
            }
        };

        if (rowData.invmsL_Id) {
            fetchData();
        } else {
            setIsLoading(false);
        }
    }, [rowData.invmsL_Id, rowData.invmsL_StuOtherFlg, getSaleItemDetailsMutation.mutateAsync, getSaletypesMutation.mutateAsync]);

    const totalAmount = items.reduce((sum, item) => sum + (item.invtsL_Amount || 0), 0);
    const totalWords = numberToWords(totalAmount);

    // Fallback date from first item if not in header or rowData, often date matches
    const displayDate = headerData?.invmsL_SalesDate || items[0]?.invmsL_SalesDate || rowData.invmsL_SalesDate;

    const renderReceipt = (isPrint: boolean) => (
        <div className={`p-8 bg-white text-black ${isPrint ? 'print:p-0' : ''}`}>
            {/* Header Section with Logo and Title */}
            <div className="flex flex-col items-center mb-6">
                <h2 className="text-xl font-bold uppercase border-b-2 border-black pb-1 mb-4">Receipt</h2>
            </div>

            {/* Info Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2 mb-6 text-sm">
                <div className="grid grid-cols-[100px_auto] gap-2">
                    <span className="font-semibold">Adm No.</span>
                    <span>: {headerData?.amsT_AdmNo || 'N/A'}</span>
                </div>
                <div className="grid grid-cols-[100px_auto] gap-2">
                    <span className="font-semibold">Date</span>
                    <span>: {displayDate ? format(new Date(displayDate), 'dd/MM/yyyy') : 'N/A'}</span>
                </div>
                <div className="grid grid-cols-[100px_auto] gap-2">
                    <span className="font-semibold">Name</span>
                    <span>: {headerData?.studentName || 'N/A'}</span>
                </div>
                <div className="grid grid-cols-[100px_auto] gap-2">
                    <span className="font-semibold">Class</span>
                    <span>: {headerData?.asmcL_ClassName || ''}</span>
                </div>
                <div className="grid grid-cols-[100px_auto] gap-2">
                    <span className="font-semibold">Father</span>
                    <span>: {headerData?.amsT_FatherName || 'N/A'}</span>
                </div>
            </div>

            {/* Items Table */}
            <div className="mb-6">
                <table className="w-full border-collapse border border-black text-sm">
                    <thead>
                        <tr className="bg-gray-100">
                            <th className="border border-black p-2 text-center w-12">SL.No</th>
                            <th className="border border-black p-2 text-left">Item</th>
                            <th className="border border-black p-2 text-center w-24">Quantity</th>
                            <th className="border border-black p-2 text-right w-32">Sale Price</th>
                            <th className="border border-black p-2 text-right w-32">Amount</th>
                        </tr>
                    </thead>
                    <tbody>
                        {items.map((item, index) => (
                            <tr key={index}>
                                <td className="border border-black p-2 text-center">{index + 1}</td>
                                <td className="border border-black p-2">{item.invmI_ItemName}</td>
                                <td className="border border-black p-2 text-center">{item.invtsL_SalesQty}</td>
                                <td className="border border-black p-2 text-right">{item.invtsL_SalesPrice?.toFixed(2)}</td>
                                <td className="border border-black p-2 text-right">{item.invtsL_Amount?.toFixed(2)}</td>
                            </tr>
                        ))}
                        {/* Total Row */}
                        <tr className="font-bold bg-gray-50">
                            <td colSpan={4} className="border border-black p-2 text-right">Total</td>
                            <td className="border border-black p-2 text-right">{totalAmount.toFixed(2)}</td>
                        </tr>
                    </tbody>
                </table>
            </div>

            {/* Footer Section */}
            <div className="space-y-6">
                <div className="flex gap-2 text-sm">
                    <span className="font-bold whitespace-nowrap">Amount Received (in Words):</span>
                    <span className="border-b border-dotted border-black flex-grow">
                        {totalWords}
                    </span>
                </div>

                <div className="flex justify-end mt-12 pt-8">
                    <div className="text-center">
                        <div className="h-12"></div> {/* Space for signature */}
                        <p className="font-semibold border-t border-black px-8 pt-1 inline-block">Authorised Signatory</p>
                    </div>
                </div>
            </div>
        </div>
    );

    return (
        <AdaptiveDialog title={`Receipt Details: ${rowData.invmsL_SalesNo}`} isOpen={true} onClose={onClose} size="2xl">
            <AdaptiveBody className="flex flex-col gap-4">
                {isLoading && (
                    <div className="flex h-64 items-center justify-center">
                        <div className="text-lg text-muted-foreground">Loading receipt details...</div>
                    </div>
                )}
                <div className={isLoading ? 'hidden' : 'block'}>
                    <ScrollArea className="max-h-[80vh]">
                        {renderReceipt(false)}
                    </ScrollArea>
                </div>
            </AdaptiveBody>
            <AdaptiveFooter>
                <Button onClick={() => handlePrint()} variant="default">
                    <Printer className="w-4 h-4 mr-2" />
                    Print
                </Button>
                <Button onClick={onClose} variant="outline">Close</Button>
            </AdaptiveFooter>

            {typeof document !== 'undefined' && createPortal(
                <div
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        width: 0,
                        height: 0,
                        overflow: 'visible',
                        opacity: 0,
                        pointerEvents: 'none',
                        zIndex: -1
                    }}
                >
                    <div ref={contentRef}>
                        {renderReceipt(true)}
                    </div>
                </div>,
                document.body
            )}
        </AdaptiveDialog>
    );
}
