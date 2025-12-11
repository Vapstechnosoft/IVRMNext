'use client';
import { Button } from '@/components/ui/button';
import { AdaptiveBody, AdaptiveDialog, AdaptiveFooter } from '@/components/ui/extension/adaptive-dialog';
import { HRMS_MI_ID } from '@/constants/hrms-config';
import { useMasterEarningsDeductions } from '@/hooks/hrms/useMasters';
import { getMasterEarningsDeductionsList, saveMasterEarningsDeductions } from '@/server/hrms/hrmsConfig/master/earnings-deductions';
import type { EarningsDeductionSetOrderList } from '@/types/hrms/master-earnings-deductions';
import { GitCompareArrows, GripVertical } from 'lucide-react';
import type React from 'react';
import { useState } from 'react';
import { toast } from 'sonner';
export default function ReorderEarningsDeductionsForm() {
    const { refetchAll } = useMasterEarningsDeductions();
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [orderedItems, setOrderedItems] = useState<EarningsDeductionSetOrderList[]>([]);
    const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const handleOpenDialog = async () => {
        try {
            const orderResponse = await getMasterEarningsDeductionsList({
                page: 1,
                page_size: 1000,
                sort_column: 'HRMED_Order',
                sort_direction: 'asc'
            });
            // API returns { success, message, data, total, page, page_size }
            // Extract the data array from the response
            const earningsDeductionsList = Array.isArray(orderResponse?.data) ? orderResponse.data : [];
            setOrderedItems(earningsDeductionsList.map((ed) => ({
                HRMED_Id: ed.hrmeD_Id,
                HRMED_Name: ed.hrmeD_Name,
                HRMED_Order: ed.hrmeD_Order
            })));
            setIsDialogOpen(true);
        } catch (error: any) {
            toast.error(error?.message || 'Failed to load earnings/deductions for reordering');
        }
    };
    const handleDragStart = (index: number) => {
        setDraggedIndex(index);
    };
    const handleDragOver = (e: React.DragEvent, index: number) => {
        e.preventDefault();
        if (draggedIndex === null || draggedIndex === index) return;
        const newItems = [...orderedItems];
        const draggedItem = newItems[draggedIndex];
        newItems.splice(draggedIndex, 1);
        newItems.splice(index, 0, draggedItem);
        setOrderedItems(newItems);
        setDraggedIndex(index);
    };
    const handleDragEnd = () => {
        setDraggedIndex(null);
    };
    const onSubmit = async (e?: React.FormEvent) => {
        e?.preventDefault();
        setIsSaving(true);
        try {
            // Get all earnings deductions and update their order
            const allEarningsDeductions = await getMasterEarningsDeductionsList({
                page: 1,
                page_size: 1000
            });
            // API returns { success, message, data, total, page, page_size }
            // Extract the data array from the response
            const earningdetectionList = Array.isArray(allEarningsDeductions?.data) ? allEarningsDeductions.data : [];
            
            // Update order for each item
            const updatePromises = orderedItems.map(async (item, index) => {
                const existingItem = earningdetectionList.find((ed) => ed.hrmeD_Id === item.HRMED_Id);
                if (existingItem) {
                    const payload = {
                        hrmeD_Id: existingItem.hrmeD_Id,
                        hrmeD_Name: existingItem.hrmeD_Name,
                        hrmeD_EDTypeFlag: existingItem.hrmeD_EDTypeFlag,
                        hrmeD_EarnDedFlag: existingItem.hrmeD_EarnDedFlag,
                        hrmeD_AmountPercentFlag: existingItem.hrmeD_AmountPercentFlag,
                        hrmeD_AmountPercent: existingItem.hrmeD_AmountPercent,
                        hrmeD_RoundOffFlag: existingItem.hrmeD_RoundOffFlag,
                        hrmeD_ReviseFlg: existingItem.hrmeD_ReviseFlg ?? true,
                        hrmeD_Order: index + 1
                    };
                    return saveMasterEarningsDeductions(payload);
                }
                return null;
            });
            
            await Promise.all(updatePromises.filter(Boolean));
            toast.success('Order saved successfully');
            setIsDialogOpen(false);
            refetchAll();
        } catch (error: any) {
            toast.error(error?.message ?? 'An error occurred');
        } finally {
            setIsSaving(false);
        }
    };
    return (
        <>
            <Button type='button' onClick={handleOpenDialog} className='w-fit transition-all duration-200 hover:scale-90'>
                <GitCompareArrows className='h-4 w-4 transition-transform duration-200 group-hover:rotate-90' />
                Set Order
            </Button>
            {orderedItems && (
                <AdaptiveDialog title='Reorder Master Earnings & Deductions' isOpen={isDialogOpen} onClose={() => setIsDialogOpen(false)}>
                    <form onSubmit={onSubmit} className='flex flex-col gap-4'>
                        <AdaptiveBody className='flex flex-col gap-5'>
                            <div className='my-6 max-h-96 space-y-3 overflow-y-auto'>
                                {orderedItems.map((item, index) => (
                                    <div
                                        key={`${item.HRMED_Id}-${index}`}
                                        draggable
                                        onDragStart={() => handleDragStart(index)}
                                        onDragOver={(e) => handleDragOver(e, index)}
                                        onDragEnd={handleDragEnd}
                                        className={`flex cursor-move items-center gap-3 rounded-md bg-muted/50 p-3 transition-all ${
                                            draggedIndex === index ? 'opacity-50' : 'hover:bg-muted'
                                        }`}>
                                        <GripVertical className='size-4' />
                                        <div className='flex-1 font-medium text-sm'>{item.HRMED_Name}</div>
                                    </div>
                                ))}
                            </div>
                        </AdaptiveBody>
                        <AdaptiveFooter>
                            <Button variant='secondary' onClick={() => setIsDialogOpen(false)} type='button'>
                                Cancel
                            </Button>
                            <Button type='submit' isLoading={isSaving}>
                                Save
                            </Button>
                        </AdaptiveFooter>
                    </form>
                </AdaptiveDialog>
            )}
        </>
    );
}
