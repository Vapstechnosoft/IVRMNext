'use client';

import { useState, useEffect } from "react";
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent,
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
    useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
    Dialog as ShadcnDialog,
    DialogContent as ShadcnDialogContent,
    DialogHeader as ShadcnDialogHeader,
    DialogTitle as ShadcnDialogTitle,
    DialogFooter as ShadcnDialogFooter
} from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { GripVertical, Save, X, ArrowUp, ArrowDown } from "lucide-react";
import { SetOrderDTO } from "@/types/super-admin/configuration-setting/master-menu-page-mapping-institutionwise";

interface SortableRowProps {
    id: number;
    item: SetOrderDTO;
    index: number;
    onDisplayNameChange: (id: number, val: string) => void;
    onOrderChange: (id: number, val: number) => void;
}

function SortableRow({ id, item, index, onDisplayNameChange, onOrderChange }: SortableRowProps) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({ id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 1 : 0,
        position: 'relative' as const,
        backgroundColor: isDragging ? 'rgba(var(--primary), 0.05)' : undefined,
    };

    return (
        <TableRow ref={setNodeRef} style={style}>
            <TableCell className="text-center">{index + 1}</TableCell>
            <TableCell>
                <div className="flex items-center gap-2">
                    <button {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing p-1 hover:bg-slate-100 rounded">
                        <GripVertical className="h-4 w-4 text-slate-400" />
                    </button>
                    <Input
                        value={item.displayname}
                        onChange={(e) => onDisplayNameChange(item.ivrmmmpmI_Id, e.target.value)}
                        className="h-8"
                        placeholder="Enter Page Name"
                    />
                </div>
            </TableCell>
            <TableCell className="w-24">
                <Input
                    type="number"
                    value={item.pageorder}
                    onChange={(e) => onOrderChange(item.ivrmmmpmI_Id, parseInt(e.target.value) || 0)}
                    className="h-8 text-center"
                    maxLength={10}
                />
            </TableCell>
        </TableRow>
    );
}

interface SetOrderModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: SetOrderDTO[]) => void;
    data: SetOrderDTO[];
    institutionName?: string;
}

export default function SetOrderModal({
    isOpen,
    onClose,
    onSave,
    data,
    institutionName
}: SetOrderModalProps) {
    const [items, setItems] = useState<SetOrderDTO[]>([]);

    useEffect(() => {
        setItems(data);
    }, [data, isOpen]);

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    function handleDragEnd(event: DragEndEvent) {
        const { active, over } = event;

        if (over && active.id !== over.id) {
            setItems((items) => {
                const oldIndex = items.findIndex(i => i.ivrmmmpmI_Id === active.id);
                const newIndex = items.findIndex(i => i.ivrmmmpmI_Id === over.id);

                const newItems = arrayMove(items, oldIndex, newIndex);
                // After moving, update the pageorder values to match the new indexes
                return newItems.map((item, idx) => ({ ...item, pageorder: idx }));
            });
        }
    }

    const handleDisplayNameChange = (id: number, val: string) => {
        setItems(prev => prev.map(item =>
            item.ivrmmmpmI_Id === id ? { ...item, displayname: val } : item
        ));
    };

    const handleOrderChange = (id: number, val: number) => {
        setItems(prev => prev.map(item =>
            item.ivrmmmpmI_Id === id ? { ...item, pageorder: val } : item
        ));
    };

    return (
        <ShadcnDialog open={isOpen} onOpenChange={onClose}>
            <ShadcnDialogContent className="max-w-2xl">
                <ShadcnDialogHeader className="bg-primary text-white p-4 -m-6 mb-4 rounded-t-lg">
                    <ShadcnDialogTitle className="text-center text-xl">
                        {institutionName || "Set Order"}
                    </ShadcnDialogTitle>
                </ShadcnDialogHeader>

                <div className="text-center py-2 bg-slate-50 border-b mb-4">
                    <p className="flex items-center justify-center gap-2 text-sm font-medium text-slate-600">
                        Note: Drag Records <ArrowUp className="h-3 w-3" /> up or <ArrowDown className="h-3 w-3" /> down to set orders!!
                    </p>
                </div>

                <div className="max-h-[50vh] overflow-y-auto">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-16 text-center">SLNO</TableHead>
                                <TableHead>Page Name</TableHead>
                                <TableHead className="text-center">Page Order</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            <DndContext
                                sensors={sensors}
                                collisionDetection={closestCenter}
                                onDragEnd={handleDragEnd}
                            >
                                <SortableContext
                                    items={items.map(i => i.ivrmmmpmI_Id)}
                                    strategy={verticalListSortingStrategy}
                                >
                                    {items.map((item, index) => (
                                        <SortableRow
                                            key={item.ivrmmmpmI_Id}
                                            id={item.ivrmmmpmI_Id}
                                            item={item}
                                            index={index}
                                            onDisplayNameChange={handleDisplayNameChange}
                                            onOrderChange={handleOrderChange}
                                        />
                                    ))}
                                </SortableContext>
                            </DndContext>
                            {items.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={3} className="text-center h-24 text-muted-foreground italic">
                                        No records to display.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>

                <ShadcnDialogFooter className="mt-6 gap-2">
                    <Button onClick={() => onSave(items)} className="flex items-center gap-2">
                        <Save className="h-4 w-4" />
                        Save
                    </Button>
                    <Button variant="outline" onClick={onClose} className="flex items-center gap-2">
                        <X className="h-4 w-4" />
                        Close
                    </Button>
                </ShadcnDialogFooter>
            </ShadcnDialogContent>
        </ShadcnDialog>
    );
}
