'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useState } from 'react';
import { toast } from 'sonner';
import { onChangeClassSingular, onChangeSubject, onChangeUnit, onSelectTopic, validateOrder } from '@/server/lesson-planner/transactions/school-subject-master-topic-mapping';
import { onChangeYear } from '@/server/lesson-planner/transactions/school-subject-master-topic-mapping';
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
    useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical } from 'lucide-react';

const orderSchema = z.object({
    ASMAY_Id: z.number(),
    ASMCL_Id: z.number(),
    ISMS_Id: z.number(),
    LPMU_Id: z.number(),
    LPMMT_Id: z.number(),
});

function SortableItem(props: { id: string; name: string; index: number }) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
    } = useSortable({ id: props.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    return (
        <div ref={setNodeRef} style={style} className="flex items-center gap-2 border p-2 rounded mb-2 bg-card">
            <button type="button" {...attributes} {...listeners} className="cursor-move p-1 text-muted-foreground hover:text-foreground">
                <GripVertical className="h-4 w-4" />
            </button>
            <div className="flex-1">
                <span className="font-medium mr-2">{props.index + 1}.</span>
                {props.name}
            </div>
        </div>
    );
}

export default function OrderSchoolSubjectTopicMappingForm({
    isOpen,
    onClose,
    masterYear,
    onSuccess
}: {
    isOpen: boolean;
    onClose: () => void;
    masterYear: any[];
    onSuccess: () => void;
}) {
    const [classes, setClasses] = useState<any[]>([]);
    const [subjects, setSubjects] = useState<any[]>([]);
    const [units, setUnits] = useState<any[]>([]);
    const [topics, setTopics] = useState<any[]>([]); // These are MAIN topics
    const [orderingList, setOrderingList] = useState<any[]>([]); // These are the topics to reorder
    const [isSaving, setIsSaving] = useState(false);

    const form = useForm<z.infer<typeof orderSchema>>({
        resolver: zodResolver(orderSchema),
    });

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const handleYearChange = async (yearId: string) => {
        const id = Number(yearId);
        form.setValue('ASMAY_Id', id);
        const res: any = await onChangeYear(id);
        const classList = res.getclass || (Array.isArray(res.data) ? res.data : res.data?.getclass) || [];
        setClasses(classList);
        setSubjects([]); setUnits([]); setTopics([]); setOrderingList([]);
    };

    const handleClassChange = async (classId: string) => {
        const id = Number(classId);
        form.setValue('ASMCL_Id', id);
        // Use the new Singular action with Flag=1
        const res: any = await onChangeClassSingular(form.getValues('ASMAY_Id'), id);
        const subjectList = res.getsubjectlist || (Array.isArray(res.data) ? res.data : res.data?.getsubjectlist) || [];
        setSubjects(subjectList);
        setUnits([]); setTopics([]); setOrderingList([]);
    };

    // Legacy `onchangesubjectnew` -> gets units
    const handleSubjectChange = async (subjId: string) => {
        const id = Number(subjId);
        form.setValue('ISMS_Id', id);
        const res: any = await onChangeSubject(form.getValues('ASMAY_Id'), form.getValues('ASMCL_Id'), id);
        const unitList = res.unitdetails || (Array.isArray(res.data) ? res.data : res.data?.unitdetails) || [];
        setUnits(unitList);
        setTopics([]); setOrderingList([]);
    };

    const handleUnitChange = async (unitId: string) => {
        const id = Number(unitId);
        form.setValue('LPMU_Id', id);
        const res: any = await onChangeUnit(form.getValues('ASMAY_Id'), form.getValues('ASMCL_Id'), form.getValues('ISMS_Id'), id);
        const topicList = res.topicdetails || (Array.isArray(res.data) ? res.data : res.data?.topicdetails) || [];
        setTopics(topicList); // Get Main Topics
        setOrderingList([]);
    };

    const handleTopicChange = async (topicId: string) => {
        const id = Number(topicId);
        form.setValue('LPMMT_Id', id);
        // Fetch topics to order
        const res = await onSelectTopic(id);

        // The API returns topic details in the data array
        // Extract from data array or fallback to gettopicdetailsorder for legacy compatibility
        const dataObj = (res as any).data || res;
        let list: any[] = [];

        if (Array.isArray(dataObj)) {
            list = dataObj;
        } else if (dataObj.gettopicdetailsorder && Array.isArray(dataObj.gettopicdetailsorder)) {
            list = dataObj.gettopicdetailsorder;
        } else if ((res as any).gettopicdetailsorder && Array.isArray((res as any).gettopicdetailsorder)) {
            list = (res as any).gettopicdetailsorder;
        }

        setOrderingList(list);
    };

    const handleDragEnd = (event: any) => {
        const { active, over } = event;
        if (active.id !== over.id) {
            setOrderingList((items) => {
                const oldIndex = items.findIndex(i => i.lpmT_Id?.toString() === active.id);
                const newIndex = items.findIndex(i => i.lpmT_Id?.toString() === over.id);
                if (oldIndex === -1 || newIndex === -1) return items;
                const newOrder = arrayMove(items, oldIndex, newIndex);
                // Update order numbers sequentially
                return newOrder.map((item, idx) => ({ ...item, lpmT_TopicOrder: idx + 1 }));
            });
        }
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const payload = orderingList.map(item => ({
                lpmmT_Id: form.getValues('LPMMT_Id'),
                lpmT_Id: item.lpmT_Id
            }));
            await validateOrder(payload);
            toast.success('Order updated successfully');
            onSuccess();
            onClose();
        } catch (e) {
            toast.error('Failed to save order');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-4xl h-[80vh] flex flex-col">
                <DialogHeader>
                    <DialogTitle>Set Topic Order</DialogTitle>
                </DialogHeader>

                <Form {...form}>
                    <form className="space-y-4">
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            <FormField control={form.control} name="ASMAY_Id" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Academic Year</FormLabel>
                                    <Select onValueChange={handleYearChange} value={field.value?.toString() || ''}>
                                        <FormControl><SelectTrigger><SelectValue placeholder="Select Year" /></SelectTrigger></FormControl>
                                        <SelectContent>{masterYear.map((y: any) => <SelectItem key={y.asmaY_Id} value={y.asmaY_Id?.toString() || ''}>{y.asmaY_Year}</SelectItem>)}</SelectContent>
                                    </Select>
                                </FormItem>
                            )} />
                            <FormField control={form.control} name="ASMCL_Id" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Class</FormLabel>
                                    <Select onValueChange={handleClassChange} value={field.value?.toString() || ''}>
                                        <FormControl><SelectTrigger><SelectValue placeholder="Select Class" /></SelectTrigger></FormControl>
                                        <SelectContent>{classes.map((c: any) => <SelectItem key={c.asmcL_Id} value={c.asmcL_Id?.toString() || ''}>{c.asmcL_ClassName}</SelectItem>)}</SelectContent>
                                    </Select>
                                </FormItem>
                            )} />
                            <FormField control={form.control} name="ISMS_Id" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Subject</FormLabel>
                                    <Select onValueChange={handleSubjectChange} value={field.value?.toString() || ''}>
                                        <FormControl><SelectTrigger><SelectValue placeholder="Select Subject" /></SelectTrigger></FormControl>
                                        <SelectContent>{subjects.map((c: any) => <SelectItem key={c.ismS_Id} value={c.ismS_Id?.toString() || ''}>{c.ismS_SubjectName}</SelectItem>)}</SelectContent>
                                    </Select>
                                </FormItem>
                            )} />
                            <FormField control={form.control} name="LPMU_Id" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Unit</FormLabel>
                                    <Select onValueChange={handleUnitChange} value={field.value?.toString() || ''}>
                                        <FormControl><SelectTrigger><SelectValue placeholder="Select Unit" /></SelectTrigger></FormControl>
                                        <SelectContent>{units.map((c: any) => <SelectItem key={c.lpmU_Id} value={c.lpmU_Id?.toString() || ''}>{c.lpmU_UnitName}</SelectItem>)}</SelectContent>
                                    </Select>
                                </FormItem>
                            )} />
                            <FormField control={form.control} name="LPMMT_Id" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Main Topic</FormLabel>
                                    <Select onValueChange={handleTopicChange} value={field.value?.toString() || ''}>
                                        <FormControl><SelectTrigger><SelectValue placeholder="Select Topic" /></SelectTrigger></FormControl>
                                        <SelectContent>{topics.map((c: any) => <SelectItem key={c.lpmmT_Id} value={c.lpmmT_Id?.toString() || ''}>{c.lpmmT_TopicName}</SelectItem>)}</SelectContent>
                                    </Select>
                                </FormItem>
                            )} />
                        </div>

                        <div className="flex-1 overflow-y-auto min-h-[300px] border rounded-md p-4 bg-muted/20">
                            {orderingList.length > 0 ? (
                                <DndContext
                                    sensors={sensors}
                                    collisionDetection={closestCenter}
                                    onDragEnd={handleDragEnd}
                                >
                                    <SortableContext
                                        items={orderingList.map(item => item.lpmT_Id?.toString() || '')}
                                        strategy={verticalListSortingStrategy}
                                    >
                                        {orderingList.map((item, index) => (
                                            <SortableItem key={item.lpmT_Id} id={item.lpmT_Id?.toString() || ''} name={item.lpmT_TopicName} index={index} />
                                        ))}
                                    </SortableContext>
                                </DndContext>
                            ) : (
                                <div className="flex items-center justify-center h-full text-muted-foreground">
                                    Select filters to view and reorder topics
                                </div>
                            )}
                        </div>

                        <div className="flex justify-end gap-2 mt-4">
                            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
                            <Button type="button" onClick={handleSave} disabled={orderingList.length === 0 || isSaving}>
                                {isSaving ? 'Saving...' : 'Save Order'}
                            </Button>
                        </div>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
