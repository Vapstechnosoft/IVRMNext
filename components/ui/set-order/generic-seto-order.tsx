'use client';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableRow } from '@/components/ui/table';
import { cn } from '@/lib/utils';
import { DndContext, PointerSensor, closestCenter, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, arrayMove, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Loader2 } from 'lucide-react';
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
    title: string;
    isLoading?: boolean; // for page-level loader
    isSaving?: boolean; // for button-level loader
}

export function MasterViewDetails<T extends { id: number }>({
    isOpen,
    onClose,
    data,
    columns,
    onSave,
    tableHeight = '50vh',
    title,
    isLoading = false,
    isSaving = false
}: MasterOrderViewProps<T>) {
    const [items, setItems] = useState<T[]>([]);

    useEffect(() => {
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

    const renderSkeletonTable = () => (
        <div className='w-full rounded-md'>
            <ScrollArea className={cn('h-[calc(40dvh-110px)] rounded-md border md:h-[calc(45dvh-110px)]')}>
                <Table>
                    {/* <TableHeader>
                        <TableRow className='hover:bg-transparent'>
                            {columns.map((_, i) => (
                                <TableHead key={i}>
                                    <Skeleton className='h-8 w-full' />
                                </TableHead>
                            ))}
                        </TableRow>
                    </TableHeader> */}
                    <TableBody>
                        {Array.from({ length: 6 }).map((_, i) => (
                            <TableRow key={i} className='hover:bg-transparent'>
                                {columns.map((_, j) => (
                                    <TableCell key={j}>
                                        <Skeleton className='h-8 w-full' />
                                    </TableCell>
                                ))}
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
                <ScrollBar orientation='horizontal' />
            </ScrollArea>
        </div>
    );

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className='w-full max-w-6xl'>
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                    <DialogDescription>Drag and drop to reorder</DialogDescription>
                </DialogHeader>

                <div className='overflow-hidden'>
                    {isLoading ? (
                        <div className='flex flex-col items-center justify-center space-y-3 py-12'>
                            <Loader2 className='h-8 w-8 animate-spin text-muted-foreground' />
                            <p className='text-muted-foreground text-sm'>Loading data...</p>
                            {renderSkeletonTable()}
                        </div>
                    ) : items.length === 0 ? (
                        <div className='flex flex-col items-center justify-center space-y-3 py-12'>
                            <p className='text-muted-foreground text-sm'>No records found.</p>
                        </div>
                    ) : (
                        <ScrollArea className={cn('rounded-md border', tableHeight)}>
                            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                                <SortableContext items={items.map((i) => i.id)} strategy={verticalListSortingStrategy}>
                                    <table className='w-full table-auto border-collapse border border-gray-200'>
                                        <thead className='sticky top-0 z-10 bg-gray-100'>
                                            <tr>
                                                {columns.map((col) => (
                                                    <th key={col.key} className={`border px-4 py-2 text-left ${col.className || ''}`}>
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
                            <ScrollBar orientation='horizontal' />
                        </ScrollArea>
                    )}
                </div>

                <DialogFooter className='mt-4 flex w-fit justify-end gap-2'>
                    <Button variant='outline' onClick={onClose} disabled={isSaving}>
                        Cancel
                    </Button>
                    <Button onClick={handleSave} disabled={isSaving || isLoading}>
                        {isSaving ? (
                            <>
                                <Loader2 className='mr-2 h-4 w-4 animate-spin' /> Saving...
                            </>
                        ) : (
                            'Save'
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
