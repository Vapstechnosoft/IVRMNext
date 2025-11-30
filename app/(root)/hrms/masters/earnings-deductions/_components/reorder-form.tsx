'use client';
import { Button } from '@/components/ui/button';
import { AdaptiveBody, AdaptiveDialog, AdaptiveFooter } from '@/components/ui/extension/adaptive-dialog';
import { HRMS_MI_ID } from '@/constants/hrms-config';
import { useMasterEarningsDeductions } from '@/hooks/hrms/useMasters';
import { getEarningsDeductionsSetOrder, updateEarningsDeductionsSetorder } from '@/server/hrms/hrmsConfig/master/earnings-deductions';
import type { EarningsDeductionSetOrderList } from '@/types/hrms/master-earnings-deductions';
import { GitCompareArrows, GripVertical } from 'lucide-react';
import type React from 'react';
import { useState } from 'react';
import { toast } from 'sonner';
export default function ReorderEarningsDeductionsForm() {
    const { refetchAll } = useMasterEarningsDeductions(HRMS_MI_ID);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [orderedItems, setOrderedItems] = useState<EarningsDeductionSetOrderList[]>([]);
    const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const handleOpenDialog = async () => {
        try {
            const orderResponse = await getEarningsDeductionsSetOrder(HRMS_MI_ID);
            setOrderedItems(orderResponse?.data ?? []);
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
            const payload = orderedItems.map((item, index) => ({
                id: item.HRMED_Id,
                order: index + 1
            }));
            const response = await updateEarningsDeductionsSetorder(payload as any);
            if (response?.success || (response as any)?.retrunMsg === 'Order') {
                toast.success('Order saved successfully');
                setIsDialogOpen(false);
                refetchAll();
            } else {
                toast.error((response as any)?.message || 'Failed to save order');
            }
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
