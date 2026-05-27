import { useState } from 'react';
import { Controller, FormProvider, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { studentRequestConfirmSchema, StudentRequestConfirmValues } from '@/schemas/hostel/transactions/hostel-confirmations.schema';
import { FormError, Label } from '@/components/ui/extension/field';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Loader2, Save, XCircle, FileText, Minus } from 'lucide-react';
import { approveStudentRequest, rejectStudentRequest } from '@/server/hostel/hostel-management/transactions/student-request-actions';
import { DateField } from '@/components/ui/dateField';
import { Checkbox } from '@/components/ui/checkbox';
import { format } from 'date-fns';

export default function StudentConfirmForm({
    onSaveSuccess,
    processData,
    rooms
}: {
    onSaveSuccess: () => void,
    processData: any,
    rooms: any[]
}) {
    const [loading, setLoading] = useState(false);

    const methods = useForm<StudentRequestConfirmValues>({
        resolver: zodResolver(studentRequestConfirmSchema),
        defaultValues: {
            HLHSREQ_Id: processData.HLHSREQ_Id as number,
            HLHSREQC_Id: (processData.HLHSREQC_Id || 0) as number,
            HLHSREQC_Remarks: '',
            HRMRM_Id: processData.HRMRM_Id ? String(processData.HRMRM_Id) : undefined,
            HLHSREQ_RequestDate: processData.HLHSREQ_RequestDate ? new Date(processData.HLHSREQ_RequestDate) : undefined,
        },
    });

    const { control, handleSubmit, reset } = methods;

    async function handleApprove(values: StudentRequestConfirmValues) {
        if (!values.HRMRM_Id) {
            toast.error("Please select a room for approval");
            return;
        }
        setLoading(true);
        try {
            const result = await approveStudentRequest({
                ...values,
                HRMRM_Id: parseInt(values.HRMRM_Id)
            });
            if (result?.returnval === true) {
                toast.success("Request approved!");
                onSaveSuccess();
            } else {
                toast.error("Failed to approve request");
            }
        } catch (error) {
            console.error(error);
            toast.error("An error occurred");
        } finally {
            setLoading(false);
        }
    }

    async function handleReject(values: StudentRequestConfirmValues) {
        setLoading(true);
        try {
            const result = await rejectStudentRequest(values);
            if (result?.returnval === true) {
                toast.success("Request rejected!");
                onSaveSuccess();
            } else {
                toast.error("Failed to reject request");
            }
        } catch (error) {
            console.error(error);
            toast.error("An error occurred");
        } finally {
            setLoading(false);
        }
    }

    const ReadOnlyField = ({ label, value }: { label: string, value: any }) => (
        <div className="flex items-center space-x-2 py-1">
            <Label className="w-40 text-left text-gray-700 font-medium">{label}</Label>
            <span className="text-gray-500">:</span>
            <span className="flex-1 text-blue-900 font-semibold truncate pl-4">{value || '-'}</span>
        </div>
    );

    return (
        <Card className="shadow-md border-t-4 border-t-[#4255a7]">
            <CardHeader className="bg-white py-2 px-4 border-b flex flex-row items-center justify-between">
                <CardTitle className="text-[#4255a7] text-sm font-bold uppercase">STUDENT REQUEST/CONFIRM</CardTitle>
                <Minus className="h-4 w-4 text-gray-400 cursor-pointer" />
            </CardHeader>
            <CardContent className="p-6">
                <FormProvider {...methods}>
                    <form className="space-y-6">
                        {/* Status and Date Header */}
                        <div className="flex justify-between items-center border-b pb-4">
                            <div className="flex items-center">
                                <Label className="text-gray-700 font-medium min-w-[120px]">Request Status</Label>
                                <span className="text-gray-500">:</span>
                                <span className="text-blue-900 font-bold px-4">{processData.HLHSREQ_BookingStatus || 'Waiting'}</span>
                            </div>
                            <div className="flex items-center text-sm font-medium">
                                <span className="text-gray-700">Date :</span>
                                <span className="text-gray-900 ml-2">{format(new Date(), 'dd-MM-yyyy')}</span>
                            </div>
                        </div>

                        {/* Two Column Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-20 gap-y-2">
                            <div className="space-y-1">
                                <ReadOnlyField label="Student Name" value={processData.studentName} />
                                <ReadOnlyField label="Adm No" value={processData.AMCST_AdmNo} />
                                <ReadOnlyField label="Hostel Name." value={processData.HLMH_Name} />
                                
                                <div className="flex items-center py-1">
                                    <Label className="w-40 text-left text-gray-700 font-medium">Request Date:<span className="text-red-500">*</span></Label>
                                    <span className="text-gray-500 mr-4">:</span>
                                    <div className="flex-1">
                                        <Controller
                                            control={control}
                                            name="HLHSREQ_RequestDate"
                                            defaultValue={(processData.HLHSREQ_RequestDate ? new Date(processData.HLHSREQ_RequestDate) : undefined) as any}
                                            render={({ field, fieldState }) => (
                                                <DateField field={field} fieldState={fieldState} label="" placeholder="Select date" />
                                            )}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-1">
                                <ReadOnlyField label="Course" value={processData.AMCO_CourseName} />
                                <ReadOnlyField label="Reg No." value={processData.AMCST_RegistrationNo} />
                                <ReadOnlyField label="Room Category" value={processData.HLMRCA_RoomCategory} />
                                
                                <div className="flex items-center py-1">
                                    <Label className="w-40 text-left text-gray-700 font-medium">Room Name:<span className="text-red-500">*</span></Label>
                                    <span className="text-gray-500 mr-4">:</span>
                                    <div className="flex-1">
                                        <Controller
                                            control={control}
                                            name="HRMRM_Id"
                                            render={({ field, fieldState }) => (
                                                <div className="w-full">
                                                    <Select onValueChange={field.onChange} value={field.value}>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="--Select--" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {rooms.map(r => (
                                                                <SelectItem key={r.hrmrM_Id} value={String(r.hrmrM_Id)}>
                                                                    {r.hrmrM_RoomNo}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                    {fieldState.error && <FormError>{fieldState.error.message}</FormError>}
                                                </div>
                                            )}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Mess Type and AC/Single Boxes */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="flex items-center border rounded-md p-1.5 bg-white shadow-sm space-x-20">
                                <Label className="pl-4 font-medium text-gray-700 w-32">Mess Type:</Label>
                                <div className="flex items-center space-x-6">
                                    <div className="flex items-center space-x-2">
                                        <Checkbox checked={processData.HLHSREQ_MessFlag === 'Veg'} disabled />
                                        <Label className="text-sm font-medium">Veg</Label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <Checkbox checked={processData.HLHSREQ_MessFlag === 'Non-Veg'} disabled />
                                        <Label className="text-sm font-medium">Non-Veg</Label>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center justify-center border rounded-md p-1.5 bg-white shadow-sm space-x-12">
                                <div className="flex items-center space-x-2">
                                    <Checkbox checked={!!processData.HLHSREQ_ACRoomFlg} disabled />
                                    <Label className="text-sm font-medium">AC</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Checkbox checked={!!processData.HLHSREQ_SingleRoomFlg} disabled />
                                    <Label className="text-sm font-medium">Single</Label>
                                </div>
                            </div>
                        </div>

                        {/* Remarks Row */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-2">
                            <div className="flex items-start space-x-4">
                                <Label className="w-36 pt-2 text-gray-700 font-medium">Request Remarks</Label>
                                <div className="flex-1">
                                    <Textarea 
                                        value={processData.HLHSREQ_Remarks || ''} 
                                        readOnly 
                                        className="bg-gray-50 min-h-[60px] border-gray-300"
                                    />
                                </div>
                            </div>
                            <div className="flex items-start space-x-4">
                                <Label className="w-36 pt-2 text-gray-700 font-medium">Approved Remarks</Label>
                                <div className="flex-1">
                                    <Controller
                                        control={control}
                                        name="HLHSREQC_Remarks"
                                        render={({ field, fieldState }) => (
                                            <div className="w-full">
                                                <Textarea {...field} className="min-h-[60px] border-gray-300" placeholder="" />
                                                {fieldState.error && <FormError>{fieldState.error.message}</FormError>}
                                            </div>
                                        )}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center justify-center gap-4 pt-6">
                            <Button 
                                type="button" 
                                disabled={loading}
                                onClick={handleSubmit(handleApprove)}
                                className="w-32 bg-[#4255a7] hover:bg-[#354486] text-white rounded-md shadow-md uppercase font-bold text-xs"
                            >
                                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-3 w-3" />}
                                APPROVED
                            </Button>
                            <Button 
                                type="button"
                                disabled={loading}
                                onClick={handleSubmit(handleReject)}
                                className="w-32 bg-[#4255a7] hover:bg-[#354486] text-white rounded-md shadow-md uppercase font-bold text-xs"
                            >
                                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-3 w-3" />}
                                REJECTED
                            </Button>
                            <Button 
                                type="button" 
                                variant="outline" 
                                onClick={() => reset()} 
                                className="w-32 bg-[#ff5c33] hover:bg-[#e64d26] text-white border-none rounded-md shadow-md uppercase font-bold text-xs"
                            >
                                <XCircle className="mr-2 h-3 w-3" />
                                CANCEL
                            </Button>
                        </div>
                    </form>
                </FormProvider>
            </CardContent>
        </Card>
    );
}
