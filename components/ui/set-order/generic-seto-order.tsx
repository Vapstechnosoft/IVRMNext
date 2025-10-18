'use client';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { DndContext, PointerSensor, closestCenter, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, arrayMove, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useEffect, useState } from 'react';
import { SortableItem } from './sort-table-item';

interface Column {
    key: string;
    label: string;
    className?: string;
}

interface MasterOrderViewProps<T extends { id: number }> {
    isOpen: boolean;
    onClose: () => void;
    data: T[];
    columns: Column[];
    onSave: (updatedData: T[]) => void;
    tableHeight?: string;
    isLoading?: boolean;
}

export function MasterViewDetails<T extends { id: number }>({
    isOpen,
    onClose,
    data,
    columns,
    onSave,
    isLoading,
    tableHeight = '800px'
}: MasterOrderViewProps<T>) {
    const [items, setItems] = useState<T[]>([]);

    useEffect(() => {
        // Map id from your ex_Id field
        setItems(data.map((d) => ({ ...d })));
    }, [data]);

    const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

    const handleDragEnd = (event: any) => {
        const { active, over } = event;
        if (over && active.id !== over.id) {
            const oldIndex = items.findIndex((i) => i.id === active.id);
            const newIndex = items.findIndex((i) => i.id === over.id);
            setItems(arrayMove(items, oldIndex, newIndex));
        }
    };

    const handleSave = () => {
        onSave(items);
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className='w-full max-w-6xl'>
                <DialogHeader>
                    <DialogTitle>Set Sub-Subject Order</DialogTitle>
                    <DialogDescription>Drag and drop to reorder</DialogDescription>
                </DialogHeader>

                <div className='overflow-auto' style={{ maxHeight: tableHeight }}>
                    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                        <SortableContext items={items.map((i) => i.id)} strategy={verticalListSortingStrategy}>
                            <table className='w-full table-auto border border-gray-200'>
                                <thead className='sticky top-0 z-10 bg-gray-100'>
                                    <tr>
                                        {columns.map((col) => (
                                            <th key={col.key} className={`border px-4 py-2 ${col.className || ''}`}>
                                                {col.label}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {items.map((row, index) => (
                                        <SortableItem key={row.id} id={row.id} row={row} columns={columns} index={index} />
                                    ))}
                                </tbody>
                            </table>
                        </SortableContext>
                    </DndContext>
                </div>

                <DialogFooter className='mt-4 flex justify-end gap-2'>
                    <Button variant='outline' className='w-fit' onClick={onClose}>
                        Cancel
                    </Button>
                    <Button onClick={handleSave} className='w-fit' isLoading={isLoading}>
                        {isLoading ? 'Saving...' : 'Save'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
