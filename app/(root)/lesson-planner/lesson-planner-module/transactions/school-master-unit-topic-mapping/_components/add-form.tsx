'use client';

import { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Save, X, Search } from 'lucide-react';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';

import type { IUnit, ITopic } from '@/types/lesson-planner/transactions/school-master-unit-topic-mapping';

const formSchema = z.object({
    LPMU_Id: z.string().min(1, 'Unit is required'),
});

interface AddFormProps {
    units: IUnit[];
    onUnitChange: (unitId: string) => Promise<ITopic[]>;
    onSave: (data: any) => Promise<void>;
    onCancel: () => void;
    isLoading?: boolean;
}

export default function AddForm({ units, onUnitChange, onSave, onCancel, isLoading }: AddFormProps) {
    const [topics, setTopics] = useState<ITopic[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedTopics, setSelectedTopics] = useState<Set<number>>(new Set());
    const [isFetchingTopics, setIsFetchingTopics] = useState(false);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            LPMU_Id: '',
        },
    });

    const findValue = (obj: any, keys: string[]) => {
        if (!obj) return null;
        for (const key of keys) {
            if (obj[key] !== undefined && obj[key] !== null && obj[key] !== "") return obj[key];
        }
        return null;
    };

    const handleUnitChange = async (unitId: string) => {
        form.setValue('LPMU_Id', unitId);
        setIsFetchingTopics(true);
        setSelectedTopics(new Set()); // Reset selections on unit change
        try {
            const fetchedTopics = await onUnitChange(unitId);
            setTopics(fetchedTopics || []);
            if (fetchedTopics && fetchedTopics.length === 0) {
                toast.info("All Topics Is Mapped For This Unit");
            }
        } catch (error) {
            console.error("Error fetching topics", error);
            toast.error("Failed to fetch topics");
        } finally {
            setIsFetchingTopics(false);
        }
    };

    const toggleTopic = (topicId: number) => {
        const newSelected = new Set(selectedTopics);
        if (newSelected.has(topicId)) {
            newSelected.delete(topicId);
        } else {
            newSelected.add(topicId);
        }
        setSelectedTopics(newSelected);
    };

    const filteredTopics = topics.filter(t => {
        const name = findValue(t, ['lpmT_TopicName', 'LPMT_TopicName', 'topicName']) || '';
        return name.toLowerCase().includes(searchTerm.toLowerCase());
    });

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        if (selectedTopics.size === 0) {
            toast.error('Select Atleast One Topic');
            return;
        }

        const topicList = Array.from(selectedTopics).map(id => ({
            lpmT_Id: id
        }));

        const payload = {
            lpmU_Id: Number(values.LPMU_Id),
            schoolMasterUnitTopicMappingTempDTO: topicList
        };

        await onSave(payload);

        // Reset Logic handled by parent or manual here?
        // Usually reset form but keep unit selected? Legacy clears everything on save.
        // Let's implement reset in parent or here if needed.
        form.reset();
        setSelectedTopics(new Set());
        setTopics([]);
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 border rounded-lg bg-card">

                    {/* Unit Selection */}
                    <FormField
                        control={form.control}
                        name="LPMU_Id"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Unit Name <span className="text-destructive">*</span></FormLabel>
                                <Select onValueChange={handleUnitChange} value={field.value}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="-- Select Unit --" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {units.map((unit) => {
                                            const id = findValue(unit, ['lpmU_Id', 'LPMU_Id', 'unitId']);
                                            const name = findValue(unit, ['lpmU_UnitName', 'LPMU_UnitName', 'unitName']);
                                            return (
                                                <SelectItem key={id} value={id?.toString() || ''}>
                                                    {name}
                                                </SelectItem>
                                            );
                                        })}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {/* Topic Selection */}
                    <div className="space-y-2">
                        <FormLabel>Topic Name <span className="text-destructive">*</span></FormLabel>
                        <div className="border rounded-md p-2 space-y-2">
                            <div className="flex items-center space-x-2 border-b pb-2">
                                <Search className="h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search here..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="border-none shadow-none focus-visible:ring-0 h-8"
                                />
                            </div>

                            <ScrollArea className="h-[200px]">
                                {isFetchingTopics ? (
                                    <div className="flex justify-center items-center h-full">
                                        <Loader2 className="h-6 w-6 animate-spin text-primary" />
                                    </div>
                                ) : filteredTopics.length > 0 ? (
                                    <div className="space-y-2 p-1">
                                        {filteredTopics.map((topic) => {
                                            const tId = findValue(topic, ['lpmT_Id', 'LPMT_Id', 'topicId']);
                                            const tName = findValue(topic, ['lpmT_TopicName', 'LPMT_TopicName', 'topicName']);
                                            return (
                                                <div key={tId} className="flex items-center space-x-2 hover:bg-muted/50 p-1 rounded">
                                                    <Checkbox
                                                        checked={selectedTopics.has(tId)}
                                                        onCheckedChange={() => toggleTopic(tId)}
                                                    />
                                                    <span className="text-sm">{tName}</span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <div className="text-center text-muted-foreground text-sm py-4">
                                        {topics.length === 0 && form.getValues('LPMU_Id') ? "No topics found" : "Select a unit to view topics"}
                                    </div>
                                )}
                            </ScrollArea>
                        </div>
                        {/* Manual Error Message for Topics if needed */}
                    </div>
                </div>

                <div className="flex justify-center gap-4">
                    <Button type="submit" disabled={isLoading || selectedTopics.size === 0}>
                        {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                        Save
                    </Button>
                    <Button type="button" variant="destructive" onClick={onCancel} disabled={isLoading}>
                        <X className="mr-2 h-4 w-4" /> Cancel
                    </Button>
                </div>
            </form>
        </Form>
    );
}
