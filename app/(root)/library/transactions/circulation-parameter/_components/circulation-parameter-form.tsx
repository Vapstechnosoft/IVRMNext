'use client';

import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { circulationParameterSchema, CirculationParameterFormType } from '@/schemas/library/transactions/circulation-parameter.schema';
import type { ICirculationParameterInitialData } from '@/types/library/transactions/circulation-parameter';
import { useEffect } from 'react';
import { Loader2 } from 'lucide-react';

interface CirculationParameterFormProps {
    initialData: ICirculationParameterInitialData | undefined;
    onSave: (data: CirculationParameterFormType) => void;
    isLoading: boolean;
    isSaving: boolean;
    bookFlag: 'BP' | 'NBP';
    setBookFlag: (val: 'BP' | 'NBP') => void;
    issuerType: 'STUDENT' | 'STAFF' | 'DEPARTMENT' | 'GUEST';
    setIssuerType: (val: 'STUDENT' | 'STAFF' | 'DEPARTMENT' | 'GUEST') => void;
    selectedRow: any; // For editing
    onCancel: () => void;
}

export const CirculationParameterForm = ({
    initialData,
    onSave,
    isLoading,
    isSaving,
    bookFlag,
    setBookFlag,
    issuerType,
    setIssuerType,
    selectedRow,
    onCancel
}: CirculationParameterFormProps) => {
    const form = useForm<CirculationParameterFormType>({
        resolver: zodResolver(circulationParameterSchema),
        defaultValues: {
            book_Flag: 'BP',
            issuertype1: 'STUDENT',
            Max_Issue_Items: 0,
            Max_No_Renewals: 0,
            Max_Issue_Days: 0,
            LMB_BookType: '',
            LMC_Id: undefined,
            ASMCL_Id: undefined,
            HRMGT_Id: undefined,
        },
    });

    const { reset, setValue, watch, control } = form;

    // Watchers to update parent state (for refetching data if needed, or just UI toggle)
    // Actually parent state drives the query. So if user clicks radio in form, we update parent.
    // The form default values should sync with parent state.

    useEffect(() => {
        setValue('book_Flag', bookFlag);
        setValue('issuertype1', issuerType);
    }, [bookFlag, issuerType, setValue]);

    useEffect(() => {
        if (selectedRow) {
            // Map selectedRow to form fields
            // The field names in selectedRow vary (LBCPAS_NoOfItems vs LBCPAST_NoOfItems etc)
            // We need a helper or just check what's present

            // Common logic:
            let items = 0, days = 0, renewals = 0, bookType = '', classId = 0, empId = 0, catId = 0;
            let pkId = 0;
            let nbpPkId = 0;

            if (bookFlag === 'BP') {
                pkId = selectedRow.LBCPA_Id || 0;
                bookType = selectedRow.LBCPA_IssueRefFlg || '';

                if (issuerType === 'STUDENT') {
                    items = selectedRow.LBCPAS_NoOfItems || selectedRow.LBCPASC_NoOfItems || 0;
                    days = selectedRow.LBCPAS_IssueDays || selectedRow.LBCPASC_IssueDays || 0;
                    renewals = selectedRow.LBCPAS_NoOfRenewals || selectedRow.LBCPASC_NoOfRenewals || 0;
                    classId = selectedRow.ASMCL_Id || 0; // Might not be in grid row? Need to check legacy Grid columns.
                    // Legacy code assigns ASMCL_Id from user.ASMCL_Id
                } else if (issuerType === 'STAFF') {
                    items = selectedRow.LBCPAST_NoOfItems || 0;
                    days = selectedRow.LBCPAST_IssueDays || 0;
                    renewals = selectedRow.LBCPAST_NoOfRenewals || 0;
                    empId = selectedRow.HRMGT_Id || 0;
                } else {
                    items = selectedRow.LBCPAO_NoOfItems || 0;
                    days = selectedRow.LBCPAO_IssueDays || 0;
                    renewals = selectedRow.LBCPAO_NoOfRenewals || 0;
                }
            } else {
                nbpPkId = selectedRow.LNBCPA_Id || 0;
                catId = selectedRow.LMC_Id || 0;

                if (issuerType === 'STUDENT') {
                    items = selectedRow.LNBCPAS_NoOfItems || selectedRow.LNBCPASC_NoOfItems || 0;
                    days = selectedRow.LNBCPAS_IssueDays || selectedRow.LNBCPASC_IssueDays || 0;
                    renewals = selectedRow.LNBCPAS_NoOfRenewals || selectedRow.LNBCPASC_NoOfRenewals || 0;
                    classId = selectedRow.ASMCL_Id || 0;
                } else if (issuerType === 'STAFF') {
                    items = selectedRow.LNBCPAST_NoOfItems || 0;
                    days = selectedRow.LNBCPAST_IssueDays || 0;
                    renewals = selectedRow.LNBCPAST_NoOfRenewals || 0;
                    empId = selectedRow.HRMGT_Id || 0;
                } else {
                    items = selectedRow.LNBCPAO_NoOfItems || 0;
                    days = selectedRow.LNBCPAO_IssueDays || 0;
                    renewals = selectedRow.LNBCPAO_NoOfRenewals || 0;
                }
            }

            reset({
                book_Flag: bookFlag,
                issuertype1: issuerType,
                Max_Issue_Items: items,
                Max_Issue_Days: days,
                Max_No_Renewals: renewals,
                LMB_BookType: bookType,
                LMC_Id: catId,
                ASMCL_Id: classId,
                HRMGT_Id: empId,
                LBCPA_Id: pkId,
                LNBCPA_Id: nbpPkId,
            });
        }
    }, [selectedRow, bookFlag, issuerType, reset]);

    const onSubmit = (data: CirculationParameterFormType) => {
        onSave(data);
    };

    const schoolCollegeFlag = initialData?.mI_SchoolCollegeFlag || 'S'; // Default to School if unknown?

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

                {/* Book Parameter Toggle */}
                <div className="flex justify-center p-4 bg-muted/20 rounded-md">
                    <FormField
                        control={control}
                        name="book_Flag"
                        render={({ field }) => (
                            <FormItem className="space-y-3">
                                <FormControl>
                                    <RadioGroup
                                        onValueChange={(val) => {
                                            field.onChange(val);
                                            setBookFlag(val as any);
                                            reset({ ...form.getValues(), book_Flag: val as any }); // Reset other fields if needed or keep?
                                        }}
                                        defaultValue={field.value}
                                        className="flex flex-col space-y-1 sm:flex-row sm:space-x-8 sm:space-y-0"
                                    >
                                        <FormItem className="flex items-center space-x-3 space-y-0">
                                            <FormControl>
                                                <RadioGroupItem value="BP" />
                                            </FormControl>
                                            <FormLabel className="font-normal cursor-pointer">
                                                Book Parameter
                                            </FormLabel>
                                        </FormItem>
                                        <FormItem className="flex items-center space-x-3 space-y-0">
                                            <FormControl>
                                                <RadioGroupItem value="NBP" />
                                            </FormControl>
                                            <FormLabel className="font-normal cursor-pointer">
                                                Non Book Parameter
                                            </FormLabel>
                                        </FormItem>
                                    </RadioGroup>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                {/* Borrower Type Toggle */}
                <div className="flex justify-center p-4 bg-muted/20 rounded-md">
                    <FormField
                        control={control}
                        name="issuertype1"
                        render={({ field }) => (
                            <FormItem className="space-y-3">
                                <FormControl>
                                    <RadioGroup
                                        onValueChange={(val) => {
                                            field.onChange(val);
                                            setIssuerType(val as any);
                                        }}
                                        defaultValue={field.value}
                                        className="flex flex-col space-y-1 sm:flex-row sm:space-x-8 sm:space-y-0 flex-wrap justify-center"
                                    >
                                        {['STUDENT', 'STAFF', 'DEPARTMENT', 'GUEST'].map((type) => (
                                            <FormItem key={type} className="flex items-center space-x-3 space-y-0">
                                                <FormControl>
                                                    <RadioGroupItem value={type} />
                                                </FormControl>
                                                <FormLabel className="font-normal cursor-pointer">
                                                    {type}
                                                </FormLabel>
                                            </FormItem>
                                        ))}
                                    </RadioGroup>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                {/* Inputs Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

                    {/* Category (NBP Only) */}
                    {bookFlag === 'NBP' && (
                        <FormField
                            control={control}
                            name="LMC_Id"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Book Category <span className="text-red-500">*</span></FormLabel>
                                    <Select
                                        onValueChange={(val) => field.onChange(Number(val))}
                                        value={field.value ? field.value.toString() : ''}
                                    >
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="--Select--" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {initialData?.categorylist.map((item) => (
                                                <SelectItem key={item.lmC_Id} value={item.lmC_Id.toString()}>
                                                    {item.lmC_CategoryName}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    )}

                    {/* Book Type (BP Only) */}
                    {bookFlag === 'BP' && (
                        <FormField
                            control={control}
                            name="LMB_BookType"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Book Type <span className="text-red-500">*</span></FormLabel>
                                    <Select onValueChange={field.onChange} value={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="--Select Field--" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="Issue">Issue</SelectItem>
                                            <SelectItem value="Reference">Reference</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    )}

                    {/* Class (Student Only, and School Check?) */}
                    {issuerType === 'STUDENT' && schoolCollegeFlag === 'S' && (
                        <FormField
                            control={control}
                            name="ASMCL_Id"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Class <span className="text-red-500">*</span></FormLabel>
                                    <Select
                                        onValueChange={(val) => field.onChange(Number(val))}
                                        value={field.value ? field.value.toString() : ''}
                                    >
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="--Select--" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {initialData?.fillclass.map((item) => (
                                                <SelectItem key={item.asmcL_Id} value={item.asmcL_Id.toString()}>
                                                    {item.asmcL_ClassName}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    )}

                    {/* Employee Group (Staff Only) */}
                    {issuerType === 'STAFF' && (
                        <FormField
                            control={control}
                            name="HRMGT_Id"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Employee Group <span className="text-red-500">*</span></FormLabel>
                                    <Select
                                        onValueChange={(val) => field.onChange(Number(val))}
                                        value={field.value ? field.value.toString() : ''}
                                    >
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="--Select--" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {initialData?.fillemp.map((item) => (
                                                <SelectItem key={item.hrmgT_Id} value={item.hrmgT_Id.toString()}>
                                                    {item.hrmgT_EmployeeGroupType}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    )}

                    {/* No Of Items */}
                    <FormField
                        control={control}
                        name="Max_Issue_Items"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>No. Of Item <span className="text-red-500">*</span></FormLabel>
                                <FormControl>
                                    <Input type="number" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {/* Max Renewals */}
                    <FormField
                        control={control}
                        name="Max_No_Renewals"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Max Renewals <span className="text-red-500">*</span></FormLabel>
                                <FormControl>
                                    <Input type="number" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {/* Issue Days */}
                    <FormField
                        control={control}
                        name="Max_Issue_Days"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Issue Days <span className="text-red-500">*</span></FormLabel>
                                <FormControl>
                                    <Input type="number" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                </div>

                <div className="flex justify-center gap-4">
                    <Button type="submit" disabled={isSaving}>
                        {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Save
                    </Button>
                    <Button type="button" variant="destructive" onClick={onCancel}>
                        Cancel
                    </Button>
                </div>

            </form>
        </Form>
    );
};
