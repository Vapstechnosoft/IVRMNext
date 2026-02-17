'use client';

import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

interface TCDetailsTabProps {
    formData: any;
    setFormData: (data: any) => void;
    initialData: any;
}

export const TCDetailsTab = ({ formData, setFormData, initialData }: TCDetailsTabProps) => {
    const handleChange = (field: string, value: any) => {
        setFormData({ ...formData, [field]: value });
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* TC Number */}
                <div className="space-y-2">
                    <Label htmlFor="tc_no">TC Number <span className="text-red-500">*</span></Label>
                    <Input
                        id="tc_no"
                        value={formData.tc_no || ''}
                        onChange={(e) => handleChange('tc_no', e.target.value)}
                        placeholder="Enter TC Number"
                    />
                </div>

                {/* Date of Application */}
                <div className="space-y-2">
                    <Label htmlFor="app_date">Date of Application <span className="text-red-500">*</span></Label>
                    <Input
                        id="app_date"
                        type="date"
                        value={formData.app_date || ''}
                        onChange={(e) => handleChange('app_date', e.target.value)}
                    />
                </div>

                {/* Date of TC Issue */}
                <div className="space-y-2">
                    <Label htmlFor="tc_date">Date of TC Issue <span className="text-red-500">*</span></Label>
                    <Input
                        id="tc_date"
                        type="date"
                        value={formData.tc_date || ''}
                        onChange={(e) => handleChange('tc_date', e.target.value)}
                    />
                </div>

                {/* Reason for Leaving */}
                <div className="space-y-2 col-span-full">
                    <Label htmlFor="reason">Reason for Leaving <span className="text-red-500">*</span></Label>
                    <Textarea
                        id="reason"
                        value={formData.reason || ''}
                        onChange={(e) => handleChange('reason', e.target.value)}
                        placeholder="Mention the reason for transition/leaving"
                    />
                </div>

                {/* Promotion Status */}
                <div className="space-y-3 p-4 border rounded-lg bg-indigo-50/30 border-indigo-100">
                    <Label className="font-bold text-indigo-900">Qualified for Promotion?</Label>
                    <RadioGroup
                        value={formData.Promotion_Flag || 'qualified'}
                        onValueChange={(val) => handleChange('Promotion_Flag', val)}
                        className="flex gap-4"
                    >
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="qualified" id="promo-yes" />
                            <Label htmlFor="promo-yes">Yes</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="notqualified" id="promo-no" />
                            <Label htmlFor="promo-no">No</Label>
                        </div>
                    </RadioGroup>
                </div>

                {/* Fee Status */}
                <div className="space-y-3 p-4 border rounded-lg bg-orange-50/30 border-orange-100">
                    <Label className="font-bold text-orange-900">Whether all dues are paid?</Label>
                    <RadioGroup
                        value={formData.Fee_Due_Flag || 'yes'}
                        onValueChange={(val) => handleChange('Fee_Due_Flag', val)}
                        className="flex gap-4"
                    >
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="yes" id="fee-yes" />
                            <Label htmlFor="fee-yes">Yes</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="no" id="fee-no" />
                            <Label htmlFor="fee-no">No</Label>
                        </div>
                    </RadioGroup>
                </div>

                {/* Medical Exam */}
                <div className="space-y-3 p-4 border rounded-lg bg-green-50/30 border-green-100">
                    <Label className="font-bold text-green-900">Whether Medically Examined?</Label>
                    <RadioGroup
                        value={formData.Medically_Exam_Flag || 'no'}
                        onValueChange={(val) => handleChange('Medically_Exam_Flag', val)}
                        className="flex gap-4"
                    >
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="yes" id="med-yes" />
                            <Label htmlFor="med-yes">Yes</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="no" id="med-no" />
                            <Label htmlFor="med-no">No</Label>
                        </div>
                    </RadioGroup>
                </div>

                {/* Qualified for Class selection */}
                {formData.Promotion_Flag === 'qualified' && (
                    <div className="space-y-2 animate-in slide-in-from-left-2 duration-300">
                        <Label htmlFor="qual_class">Qualified for Class <span className="text-red-500">*</span></Label>
                        <Select
                            value={formData.qual_class || ''}
                            onValueChange={(val) => handleChange('qual_class', val)}
                        >
                            <SelectTrigger id="qual_class" className="border-indigo-200 focus:ring-indigo-500">
                                <SelectValue placeholder="Select Promotion Class" />
                            </SelectTrigger>
                            <SelectContent>
                                {initialData?.qualified_class?.map((cls: any) => (
                                    <SelectItem key={cls.asmcL_Id} value={cls.asmcL_ClassName}>
                                        {cls.asmcL_ClassName}
                                    </SelectItem>
                                ))}
                                {(!initialData?.qualified_class || initialData.qualified_class.length === 0) && (
                                    <SelectItem value="none" disabled>No classes found</SelectItem>
                                )}
                            </SelectContent>
                        </Select>
                    </div>
                )}

                {/* Conduct */}
                <div className="space-y-2">
                    <Label htmlFor="conduct">Conduct and Character</Label>
                    <Input
                        id="conduct"
                        value={formData.conduct || ''}
                        onChange={(e) => handleChange('conduct', e.target.value)}
                        placeholder="e.g. Good"
                    />
                </div>

                {/* Working Days */}
                <div className="space-y-2">
                    <Label htmlFor="working_days">No. of Working Days</Label>
                    <Input
                        id="working_days"
                        type="number"
                        value={formData.working_days || ''}
                        onChange={(e) => handleChange('working_days', e.target.value)}
                    />
                </div>

                {/* Present Days */}
                <div className="space-y-2">
                    <Label htmlFor="present_days">No. of Days Present</Label>
                    <Input
                        id="present_days"
                        type="number"
                        value={formData.present_days || ''}
                        onChange={(e) => handleChange('present_days', e.target.value)}
                    />
                </div>
            </div>
        </div>
    );
};
