'use client';

import { getStatusBadge } from '@/components/extras/helpers/helper';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AlertTriangle, Check, Edit2, Eye, Plus, Trash2, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { z } from 'zod';
import type { GroupItem, SubjectRow } from './add-from';

// Zod Schema for validation
const GroupSchema = z.object({
    marks: z.number().min(0, 'Marks must be at least 0').optional(),
    percentage: z.number().min(0, 'Percentage must be at least 0').max(100, 'Percentage cannot exceed 100').optional(),
    groupName: z.string().min(1, 'Group name is required').max(100, 'Group name is too long'),
    displayName: z.string().min(1, 'Display name is required').max(100, 'Display name is too long'),
    groupOrder: z.number().int().min(1, 'Order must be at least 1'),
    maxOff: z.number().min(0, 'Max Off must be at least 0').optional(),
    bestOff: z.number().min(0, 'Best Off must be at least 0').optional(),
    roundOff: z.boolean(),
    exams: z
        .array(
            z.object({
                id: z.number(),
                name: z.string(),
                isSelected: z.boolean(),
                convertedMarks: z.number().min(1, 'Converted marks are required when exam is selected').optional(),
                conversionRequired: z.boolean()
            })
        )
        .refine((exams) => exams.filter((exam) => exam.isSelected).length > 0, { message: 'At least one exam must be selected' })
});

type GroupFormData = z.infer<typeof GroupSchema>;

interface LeftExamRow {
    id: number;
    name: string;
    isSelected: boolean;
    convertedMarks: string;
    conversionRequired: boolean;
    error?: string; // To track individual row errors
}

export function ViewGroupsModal({
    subject,
    onClose,
    onAddGroup,
    groups,
    onOpenExams
}: {
    subject: SubjectRow;
    onClose: () => void;
    onAddGroup: (g: GroupItem) => void;
    groups: GroupItem[];
    onOpenExams: (g: GroupItem) => void;
}) {
    const [formData, setFormData] = useState<GroupFormData>({
        marks: 0,
        percentage: 0,
        groupName: '',
        displayName: '',
        groupOrder: 1,
        maxOff: 0,
        bestOff: 0,
        roundOff: false,
        exams: []
    });

    const [errors, setErrors] = useState<Record<string, string>>({});
    const [editingGroupId, setEditingGroupId] = useState<number | null>(null);
    const [groupToDelete, setGroupToDelete] = useState<GroupItem | null>(null);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [leftExams, setLeftExams] = useState<LeftExamRow[]>([]);

    // Initialize left exams
    useEffect(() => {
        setLeftExams([
            { id: 101, name: 'Formative Assessment -04', isSelected: false, convertedMarks: '', conversionRequired: false },
            { id: 102, name: 'Summative Assessment-02', isSelected: false, convertedMarks: '', conversionRequired: false },
            { id: 103, name: 'Unit Test 1', isSelected: false, convertedMarks: '', conversionRequired: false }
        ]);
    }, []);

    // Validate form
    const validateForm = (): boolean => {
        const newErrors: Record<string, string> = {};

        // Check if at least one exam is selected
        const selectedExams = leftExams.filter((exam) => exam.isSelected);
        if (selectedExams.length === 0) {
            newErrors.exams = 'At least one exam must be selected';
        }

        // Validate each selected exam for converted marks
        selectedExams.forEach((exam) => {
            if (!exam.convertedMarks || exam.convertedMarks.trim() === '') {
                newErrors[`exam-${exam.id}-marks`] = 'Converted marks are required for selected exams';
            } else if (Number.isNaN(Number.parseInt(exam.convertedMarks)) || Number.parseInt(exam.convertedMarks) <= 0) {
                newErrors[`exam-${exam.id}-marks`] = 'Converted marks must be a positive number';
            }
        });

        // Validate other form fields
        if (!formData.groupName.trim()) {
            newErrors.groupName = 'Group name is required';
        }
        if (!formData.displayName.trim()) {
            newErrors.displayName = 'Display name is required';
        }
        if (formData.groupOrder < 1) {
            newErrors.groupOrder = 'Order must be at least 1';
        }
        if (formData.percentage !== undefined && (formData.percentage < 0 || formData.percentage > 100)) {
            newErrors.percentage = 'Percentage must be between 0 and 100';
        }

        // Set errors for left exams with individual row errors
        const updatedLeftExams = leftExams.map((exam) => {
            const examError = newErrors[`exam-${exam.id}-marks`];
            return {
                ...exam,
                error: examError
            };
        });

        setLeftExams(updatedLeftExams);
        setErrors(newErrors);

        return Object.keys(newErrors).length === 0;
    };

    // Handle form field changes
    const handleInputChange = (field: keyof GroupFormData, value: any) => {
        setFormData((prev) => ({ ...prev, [field]: value }));

        // Clear error for this field when user starts typing
        if (errors[field]) {
            setErrors((prev) => {
                const newErrors = { ...prev };
                delete newErrors[field];
                return newErrors;
            });
        }
    };

    // Handle left exam checkbox change
    const handleExamSelect = (id: number, isSelected: boolean) => {
        setLeftExams((prev) =>
            prev.map((exam) => {
                if (exam.id === id) {
                    const updatedExam = {
                        ...exam,
                        isSelected,
                        error: undefined, // Clear error when toggling
                        convertedMarks: isSelected ? exam.convertedMarks : '' // Clear marks if deselected
                    };

                    // If deselecting, clear any validation errors for this exam
                    if (!isSelected) {
                        setErrors((prevErrors) => {
                            const newErrors = { ...prevErrors };
                            delete newErrors[`exam-${id}-marks`];
                            return newErrors;
                        });
                    }

                    return updatedExam;
                }
                return exam;
            })
        );

        // Clear general exams error when at least one exam is selected
        const updatedExams = leftExams.map((exam) => (exam.id === id ? { ...exam, isSelected } : exam));
        if (updatedExams.some((exam) => exam.isSelected) && errors.exams) {
            setErrors((prev) => {
                const newErrors = { ...prev };
                // biome-ignore lint/performance/noDelete: <explanation>
                delete newErrors.exams;
                return newErrors;
            });
        }
    };

    // Handle converted marks change with validation
    const handleConvertedMarksChange = (id: number, value: string) => {
        // Allow only numbers
        const numericValue = value.replace(/[^0-9]/g, '');

        setLeftExams((prev) =>
            prev.map((exam) => {
                if (exam.id === id) {
                    const updatedExam = {
                        ...exam,
                        convertedMarks: numericValue,
                        error: undefined // Clear error when user starts typing
                    };

                    // Clear the error for this exam in the errors state
                    setErrors((prevErrors) => {
                        const newErrors = { ...prevErrors };
                        delete newErrors[`exam-${id}-marks`];
                        return newErrors;
                    });

                    return updatedExam;
                }
                return exam;
            })
        );
    };

    // Handle conversion required checkbox
    const handleConversionRequiredChange = (id: number, value: boolean) => {
        setLeftExams((prev) => prev.map((exam) => (exam.id === id ? { ...exam, conversionRequired: value } : exam)));
    };

    // Reset form
    const resetForm = () => {
        setFormData({
            marks: 0,
            percentage: 0,
            groupName: '',
            displayName: '',
            groupOrder: groups.length > 0 ? Math.max(...groups.map((g) => g.order)) + 1 : 1,
            maxOff: 0,
            bestOff: 0,
            roundOff: false,
            exams: []
        });
        setLeftExams([
            { id: 101, name: 'Formative Assessment -04', isSelected: false, convertedMarks: '', conversionRequired: false },
            { id: 102, name: 'Summative Assessment-02', isSelected: false, convertedMarks: '', conversionRequired: false },
            { id: 103, name: 'Unit Test 1', isSelected: false, convertedMarks: '', conversionRequired: false }
        ]);
        setErrors({});
        setEditingGroupId(null);
    };

    // Add or Update group
    const handleAddOrUpdate = () => {
        if (!validateForm()) {
            toast.error('Please fix validation errors');
            return;
        }

        const selectedExams = leftExams
            .filter((exam) => exam.isSelected)
            .map((exam) => ({
                id: exam.id,
                name: exam.name,
                marks: Number.parseInt(exam.convertedMarks) || 0,
                conversionRequired: exam.conversionRequired
            }));

        const newGroup: GroupItem = {
            id: editingGroupId || Date.now(),
            groupName: formData.groupName,
            displayName: formData.displayName,
            percentage: formData.percentage || 0,
            marks: formData.marks || 0,
            maxOff: formData.maxOff || 0,
            bestOff: formData.bestOff || 0,
            order: formData.groupOrder,
            roundOffFlag: formData.roundOff,
            exams: selectedExams
        };

        onAddGroup(newGroup);
        resetForm();
        toast.success(editingGroupId ? 'Group updated successfully' : 'Group added successfully');
    };

    // Edit group
    const handleEditGroup = (group: GroupItem) => {
        setEditingGroupId(group.id);

        // Set form data
        setFormData({
            marks: group.marks,
            percentage: group.percentage,
            groupName: group.groupName,
            displayName: group.displayName,
            groupOrder: group.order,
            maxOff: group.maxOff,
            bestOff: group.bestOff,
            roundOff: group.roundOffFlag || false,
            exams: []
        });

        // Set left exams with selected exams from the group
        const updatedLeftExams = leftExams.map((exam) => {
            const groupExam = group.exams.find((g) => g.id === exam.id);
            return groupExam
                ? {
                      ...exam,
                      isSelected: true,
                      convertedMarks: groupExam.marks.toString(),
                      conversionRequired: groupExam.conversionRequired || false,
                      error: undefined
                  }
                : {
                      ...exam,
                      isSelected: false,
                      convertedMarks: '',
                      conversionRequired: false,
                      error: undefined
                  };
        });

        setLeftExams(updatedLeftExams);
        setErrors({});

        // Scroll to form
        setTimeout(() => {
            const formSection = document.querySelector('.right-form-section');
            if (formSection) {
                formSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        }, 100);
    };

    // Delete group
    const handleDeleteClick = (group: GroupItem) => {
        setGroupToDelete(group);
        setIsDeleteDialogOpen(true);
    };

    const confirmDelete = () => {
        if (groupToDelete) {
            // You would typically call a prop function here to update the parent state
            // For now, we'll show a toast and close the dialog
            toast.success(`Group "${groupToDelete.groupName}" deleted successfully`);
            setIsDeleteDialogOpen(false);
            setGroupToDelete(null);
        }
    };

    const cancelDelete = () => {
        setIsDeleteDialogOpen(false);
        setGroupToDelete(null);
    };

    // Auto-update groupOrder when groups change
    useEffect(() => {
        if (!editingGroupId && groups.length > 0) {
            const maxOrder = Math.max(...groups.map((g) => g.order));
            setFormData((prev) => ({
                ...prev,
                groupOrder: maxOrder + 1
            }));
        }
    }, [groups, editingGroupId]);

    return (
        <>
            <div className='fixed inset-0 z-[9990] flex items-start justify-center p-6'>
                <div className='absolute inset-0 bg-black/50' onClick={onClose} />

                <div className='relative z-[9991] w-[95%] max-w-6xl overflow-hidden rounded-xl border bg-white shadow-xl md:w-[90%]'>
                    {/* HEADER */}
                    <div className='flex items-center justify-between bg-gray-100 px-4 py-2 font-semibold text-lg'>
                        <span>{subject.name.toUpperCase()} - GROUP MAPPING</span>
                        <Button
                            type='button'
                            onClick={onClose}
                            variant='ghost'
                            size='sm'
                            className='right-12 w-fit border p-2 shadow-md hover:bg-destructive/10'>
                            <X className='h-4 w-4 text-destructive' /> Close
                        </Button>
                    </div>

                    <div className='grid grid-cols-1 gap-6 p-5 md:grid-cols-2'>
                        {/* LEFT EXAM TABLE */}
                        <div className='overflow-hidden rounded border shadow-sm'>
                            <table className='min-w-full border-collapse'>
                                <thead className='bg-gray-100 text-sm'>
                                    <tr>
                                        <th className='w-12 p-2'>Select</th>
                                        <th className='p-2'>Exam Name</th>
                                        <th className='w-40 p-2'>Converted Marks</th>
                                        <th className='w-36 p-2'>Required?</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {leftExams.map((exam, i) => (
                                        <tr key={exam.id} className={`${i % 2 ? 'bg-gray-50' : 'bg-white'} text-sm`}>
                                            <td className='p-2 text-center'>
                                                <Checkbox
                                                    checked={exam.isSelected}
                                                    onCheckedChange={(checked) => handleExamSelect(exam.id, checked as boolean)}
                                                />
                                            </td>
                                            <td className='p-2'>{exam.name}</td>
                                            <td className='p-2'>
                                                <div className='space-y-1'>
                                                    <Input
                                                        placeholder='Enter marks'
                                                        value={exam.convertedMarks}
                                                        onChange={(e) => handleConvertedMarksChange(exam.id, e.target.value)}
                                                        disabled={!exam.isSelected}
                                                        className={`${!exam.isSelected ? 'bg-gray-100 text-gray-400' : ''} ${exam.error ? 'border-red-500' : ''}`}
                                                    />
                                                    {exam.error && <p className='text-red-500 text-xs'>{exam.error}</p>}
                                                </div>
                                            </td>
                                            <td className='p-2 text-center'>
                                                <Checkbox
                                                    checked={exam.conversionRequired}
                                                    onCheckedChange={(checked) =>
                                                        handleConversionRequiredChange(exam.id, checked as boolean)
                                                    }
                                                    disabled={!exam.isSelected}
                                                />
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {/* General validation error for exams */}
                            {errors.exams && (
                                <div className='border-red-200 border-t bg-red-50 p-2 text-red-500 text-sm'>{errors.exams}</div>
                            )}
                        </div>

                        {/* RIGHT FORM */}
                        <div className='right-form-section space-y-3'>
                            <div className='grid grid-cols-2 gap-3'>
                                <div>
                                    <Label>Marks *</Label>
                                    <Input
                                        placeholder='Enter Marks'
                                        type='number'
                                        value={formData.marks}
                                        onChange={(e) => handleInputChange('marks', Number.parseInt(e.target.value) || 0)}
                                    />
                                    {errors.marks && <p className='mt-1 text-red-500 text-sm'>{errors.marks}</p>}
                                </div>
                                <div>
                                    <Label>Max Off</Label>
                                    <Input
                                        placeholder='Enter Max Off'
                                        type='number'
                                        value={formData.maxOff}
                                        onChange={(e) => handleInputChange('maxOff', Number.parseInt(e.target.value) || 0)}
                                    />
                                    {errors.maxOff && <p className='mt-1 text-red-500 text-sm'>{errors.maxOff}</p>}
                                </div>
                                <div>
                                    <Label>Percentage *</Label>
                                    <Input
                                        placeholder='Enter Percentage'
                                        type='number'
                                        value={formData.percentage}
                                        onChange={(e) => handleInputChange('percentage', Number.parseInt(e.target.value) || 0)}
                                    />
                                    {errors.percentage && <p className='mt-1 text-red-500 text-sm'>{errors.percentage}</p>}
                                </div>
                                <div>
                                    <Label>Best Off</Label>
                                    <Input
                                        placeholder='Enter Best Off'
                                        type='number'
                                        value={formData.bestOff}
                                        onChange={(e) => handleInputChange('bestOff', Number.parseInt(e.target.value) || 0)}
                                    />
                                    {errors.bestOff && <p className='mt-1 text-red-500 text-sm'>{errors.bestOff}</p>}
                                </div>
                                <div>
                                    <Label>Group Name *</Label>
                                    <Input
                                        placeholder='Enter Group Name'
                                        value={formData.groupName}
                                        onChange={(e) => handleInputChange('groupName', e.target.value)}
                                    />
                                    {errors.groupName && <p className='mt-1 text-red-500 text-sm'>{errors.groupName}</p>}
                                </div>
                                <div>
                                    <Label>Display Name *</Label>
                                    <Input
                                        placeholder='Enter Display Name'
                                        value={formData.displayName}
                                        onChange={(e) => handleInputChange('displayName', e.target.value)}
                                    />
                                    {errors.displayName && <p className='mt-1 text-red-500 text-sm'>{errors.displayName}</p>}
                                </div>
                                <div>
                                    <Label>Order *</Label>
                                    <Input
                                        placeholder='Enter Order'
                                        type='number'
                                        value={formData.groupOrder}
                                        onChange={(e) => handleInputChange('groupOrder', Number.parseInt(e.target.value) || 1)}
                                    />
                                    {errors.groupOrder && <p className='mt-1 text-red-500 text-sm'>{errors.groupOrder}</p>}
                                </div>

                                <div className='mt-7 flex items-center gap-2'>
                                    <Checkbox
                                        checked={formData.roundOff}
                                        onCheckedChange={(checked) => handleInputChange('roundOff', checked as boolean)}
                                    />
                                    <Label>Round Off Required</Label>
                                </div>
                            </div>

                            <div className='flex w-fit justify-end gap-3'>
                                <Button onClick={handleAddOrUpdate}>
                                    {editingGroupId ? (
                                        <>
                                            <Check className='mr-2 h-4 w-4' />
                                            Update
                                        </>
                                    ) : (
                                        <>
                                            <Plus className='mr-2 h-4 w-4' />
                                            Add
                                        </>
                                    )}
                                </Button>
                                {editingGroupId && (
                                    <Button variant='outline' onClick={resetForm}>
                                        Cancel Edit
                                    </Button>
                                )}
                                <Button
                                    variant='outline'
                                    onClick={() => {
                                        resetForm();
                                        setLeftExams([
                                            {
                                                id: 101,
                                                name: 'Formative Assessment -04',
                                                isSelected: false,
                                                convertedMarks: '',
                                                conversionRequired: false
                                            },
                                            {
                                                id: 102,
                                                name: 'Summative Assessment-02',
                                                isSelected: false,
                                                convertedMarks: '',
                                                conversionRequired: false
                                            },
                                            {
                                                id: 103,
                                                name: 'Unit Test 1',
                                                isSelected: false,
                                                convertedMarks: '',
                                                conversionRequired: false
                                            }
                                        ]);
                                    }}>
                                    Reset
                                </Button>
                            </div>
                        </div>
                    </div>

                    {groups.length > 0 && (
                        <div className='border-t p-4'>
                            <table className='min-w-full border-collapse border'>
                                <thead className='bg-gray-100 text-sm'>
                                    <tr>
                                        <th className='p-2'>Sl.No</th>
                                        <th className='p-2'>Group</th>
                                        <th className='p-2'>Display</th>
                                        <th className='p-2'>%</th>
                                        <th className='p-2'>Marks</th>
                                        <th className='p-2'>Max</th>
                                        <th className='p-2'>Best</th>
                                        <th className='p-2'>Order</th>
                                        <th className='p-2'>Exams</th>
                                        <th className='p-2'>Round</th>
                                        <th className='p-2'>Actions</th>
                                    </tr>
                                </thead>

                                <tbody className='[&>tr:hover>td]:!bg-accent/90'>
                                    {groups.map((g, i) => (
                                        <tr
                                            key={g.id}
                                            className={`${i % 2 ? 'bg-gray-50' : 'bg-white'}hover:[&>td]:!bg-accent/90 text-sm transition-colors`}>
                                            <td className='p-2 text-center'>{i + 1}</td>
                                            <td className='p-2'>{g.groupName}</td>
                                            <td className='p-2'>{g.displayName}</td>
                                            <td className='p-2 text-center'>{g.percentage}</td>
                                            <td className='p-2 text-center'>{g.marks}</td>
                                            <td className='p-2 text-center'>{g.maxOff}</td>
                                            <td className='p-2 text-center'>{g.bestOff}</td>
                                            <td className='p-2 text-center'>{g.order}</td>
                                            <td className='p-2 text-center'>
                                                <Button size='sm' variant='ghost' onClick={() => onOpenExams(g)}>
                                                    <Eye className='h-4 w-4 text-blue-600' />
                                                </Button>
                                            </td>
                                            <td className='p-2 text-center'>{getStatusBadge(g.roundOffFlag ? 'yes' : 'no')}</td>
                                            <td className='p-2 text-center'>
                                                <div className='flex items-center justify-center gap-2'>
                                                    <Button
                                                        type='button'
                                                        onClick={() => handleEditGroup(g)}
                                                        variant='ghost'
                                                        size='sm'
                                                        className='w-fit border p-2 shadow-md hover:bg-blue-50'>
                                                        <Edit2 className='h-4 w-4 text-blue-600' />
                                                    </Button>
                                                    <Button
                                                        type='button'
                                                        onClick={() => handleDeleteClick(g)}
                                                        variant='ghost'
                                                        size='sm'
                                                        className='w-fit border p-2 shadow-md hover:bg-destructive/10'>
                                                        <Trash2 className='h-4 w-4 text-destructive' />
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>

                            <div className='mt-4 flex w-fit justify-center'>
                                <Button onClick={onClose}>Submit & Close</Button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Delete Confirmation Popup */}
            {isDeleteDialogOpen && groupToDelete && (
                <div className='fixed inset-0 z-[9999] flex items-center justify-center p-6'>
                    {/* Backdrop with higher z-index */}
                    <div className='absolute inset-0 bg-black/60' onClick={cancelDelete} />
                    {/* Confirmation Popup */}
                    <div className='relative z-[10000] w-[90%] max-w-md overflow-hidden rounded-xl border bg-white shadow-2xl'>
                        <div className='p-6'>
                            <div className='mb-4 flex items-center gap-3'>
                                <div className='rounded-full bg-destructive/20 p-2'>
                                    <AlertTriangle className='h-6 w-6 text-destructive' />
                                </div>
                                <div>
                                    <h3 className='font-semibold text-lg'>Delete Group</h3>
                                    <p className='text-muted-foreground text-sm'>This action cannot be undone</p>
                                </div>
                            </div>
                            <p className='mb-4'>
                                Are you sure you want to delete the group{' '}
                                <strong className='text-destructive'>"{groupToDelete.groupName}"</strong>?
                            </p>
                        </div>

                        <div className='flex justify-end gap-3 border-t p-4'>
                            <Button type='button' variant='outline' onClick={cancelDelete} className='min-w-[100px]'>
                                Cancel
                            </Button>
                            <Button type='button' variant='destructive' onClick={confirmDelete} className='min-w-[100px]'>
                                <Trash2 className='mr-2 h-4 w-4' />
                                Delete
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
