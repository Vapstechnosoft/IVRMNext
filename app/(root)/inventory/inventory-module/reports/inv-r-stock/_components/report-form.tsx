'use client';
 
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { invRStockSchema, type InvRStockSchema } from '@/schemas/inventory/reports/inv-r-stock';
import { useInvRStockDetails, useInvRStockReport } from '@/hooks/inventory/reports/use-inv-r-stock';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { FileText, RefreshCcw, Check, ChevronsUpDown } from 'lucide-react';
import { FormError } from '@/components/ui/extension/field';
import { format } from 'date-fns';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from '@/components/ui/command';
import { cn } from '@/lib/utils';
import { useMemo, useState, useEffect } from 'react';
 
interface ReportFormProps {
    onReportGenerated: (data: any, payload: any, total: number) => void;
}
 
export default function ReportForm({ onReportGenerated }: ReportFormProps) {
    const form = useForm<InvRStockSchema>({
        resolver: zodResolver(invRStockSchema),
        defaultValues: {
            optionflag: 'All',
            overallflag: false,
            bw_dates: false,
            startdate: undefined,
            enddate: undefined,
            invmI_Id: undefined,
            invmsT_Id: undefined,
            invmG_Id: undefined
        }
    });
 
    const { control, handleSubmit, watch, setValue, reset, formState: { errors } } = form;
 
    const optionflag = watch('optionflag');
    const bw_dates = watch('bw_dates');
 
    // Fetch Details based on Option Flag
    const { data: detailsData, refetch: refetchDetails } = useInvRStockDetails(optionflag);
    const generateReportMutation = useInvRStockReport();
 
    useEffect(() => {
        if (optionflag !== 'All') {
            refetchDetails();
            setValue('invmI_Id', undefined);
            setValue('invmsT_Id', undefined);
            setValue('invmG_Id', undefined);
        } else {
             // When 'All' is selected, clear filters
             setValue('invmI_Id', undefined);
             setValue('invmsT_Id', undefined);
             setValue('invmG_Id', undefined);
        }
    }, [optionflag, refetchDetails, setValue]);
 
    const itemOptions = useMemo(() => detailsData?.data?.get_stockdetails?.map((item: any) => ({
        label: `${item.invmI_ItemName} : ${item.invmI_ItemCode || ''}`,
        value: item.invmI_Id
    })) || [], [detailsData]);
 
    const storeOptions = useMemo(() => detailsData?.data?.get_stockdetails?.map((item: any) => ({
        label: item.invmS_StoreName,
        value: item.invmsT_Id
    })) || [], [detailsData]);
 
    const groupOptions = useMemo(() => detailsData?.data?.get_stockdetails?.map((item: any) => ({
        label: item.invmG_GroupName,
        value: item.invmG_Id
    })) || [], [detailsData]);
 
    const onSubmit = (data: InvRStockSchema) => {
        generateReportMutation.mutate(data as any, {
            onSuccess: (res) => {
                if (res.success) {
                    onReportGenerated(res.data.get_StockReport, data, res.total || 0);
                } else {
                    onReportGenerated([], null, 0);
                }
            },
            onError: () => {
                onReportGenerated([], null, 0);
            }
        });
    };
 
    const handleCancel = () => {
        reset();
        onReportGenerated([], null, 0);
    };
 
    const GenericCombobox = ({ options, value, onChange, placeholder }: any) => {
        const [open, setOpen] = useState(false);
        return (
            <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                    <Button variant="outline" role="combobox" aria-expanded={open} className="w-full justify-between">
                        {value
                            ? options.find((option: any) => option.value === value)?.label
                            : placeholder}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                    <Command>
                        <CommandInput placeholder={`Search ${placeholder}...`} />
                        <CommandEmpty>No item found.</CommandEmpty>
                        <CommandGroup>
                            {options.map((option: any) => (
                                <CommandItem
                                    key={option.value}
                                    value={option.label}
                                    onSelect={() => {
                                        onChange(option.value);
                                        setOpen(false);
                                    }}
                                >
                                    <Check
                                        className={cn(
                                            "mr-2 h-4 w-4",
                                            value === option.value ? "opacity-100" : "opacity-0"
                                        )}
                                    />
                                    {option.label}
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </Command>
                </PopoverContent>
            </Popover>
        )
    };
 
    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <CollapsibleSection title="Stock Report Configuration" defaultOpen={true}>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-4">
 
                    {/* Report Type */}
                    <div className="space-y-3 bg-muted/20 p-4 rounded-md border">
                        <Label className="font-semibold text-primary">Report Type</Label>
                        <Controller
                            name="optionflag"
                            control={control}
                            render={({ field }) => (
                                <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex flex-col space-y-1">
                                    <div className="flex items-center space-x-2"><RadioGroupItem value="All" id="r1" /><Label htmlFor="r1" className="cursor-pointer">All</Label></div>
                                    <div className="flex items-center space-x-2"><RadioGroupItem value="Item" id="r2" /><Label htmlFor="r2" className="cursor-pointer">Item</Label></div>
                                    <div className="flex items-center space-x-2"><RadioGroupItem value="Store" id="r3" /><Label htmlFor="r3" className="cursor-pointer">Store</Label></div>
                                    <div className="flex items-center space-x-2"><RadioGroupItem value="Group" id="r4" /><Label htmlFor="r4" className="cursor-pointer">Group</Label></div>
                                </RadioGroup>
                            )}
                        />
                        <div className="mt-2 flex items-center space-x-2">
                            <Controller name="overallflag" control={control} render={({ field }) => (
                                <div className="flex items-center space-x-2">
                                    <Checkbox id="overall" checked={field.value} onCheckedChange={field.onChange} disabled={optionflag !== 'All'} />
                                    <Label htmlFor="overall" className="cursor-pointer">Overall</Label>
                                </div>
                            )} />
                        </div>
                    </div>
 
                    {/* Date Filters */}
                    <div className="space-y-3 bg-muted/20 p-4 rounded-md border">
                        <div className="flex items-center space-x-2 mb-4">
                            <Controller name="bw_dates" control={control} render={({ field }) => <Checkbox id="bw_dates" checked={field.value} onCheckedChange={field.onChange} />} />
                            <Label htmlFor="bw_dates" className="font-semibold cursor-pointer">Between Dates</Label>
                        </div>
                        {bw_dates && (
                            <div className="space-y-3">
                                <div className="flex flex-col gap-1.5">
                                    <Label>Start Date</Label>
                                    <Controller name="startdate" control={control} render={({ field }) => <input type='date' className='flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm' value={field.value ? format(new Date(field.value), 'yyyy-MM-dd') : ''} onChange={(e) => field.onChange(new Date(e.target.value))} />} />
                                    {errors.startdate && <FormError>{errors.startdate.message}</FormError>}
                                </div>
                                <div className="flex flex-col gap-1.5">
                                    <Label>End Date</Label>
                                    <Controller name="enddate" control={control} render={({ field }) => <input type='date' className='flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm' value={field.value ? format(new Date(field.value), 'yyyy-MM-dd') : ''} onChange={(e) => field.onChange(new Date(e.target.value))} />} />
                                    {errors.enddate && <FormError>{errors.enddate.message}</FormError>}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
 
                {/* Filters Content */}
                {(optionflag === 'Item' || optionflag === 'Store' || optionflag === 'Group') && (
                    <div className="p-4 pt-0">
                        <div className="bg-background rounded-md border border-dashed p-4 space-y-4">
                            {optionflag === 'Item' && (
                                <div className="space-y-2 max-w-xl">
                                    <Label>Select Item <span className="text-destructive">*</span></Label>
                                    <Controller name="invmI_Id" control={control} render={({ field }) => (
                                        <GenericCombobox options={itemOptions} value={field.value} onChange={field.onChange} placeholder="Item" />
                                    )} />
                                    {errors.invmI_Id && <FormError>{errors.invmI_Id.message}</FormError>}
                                </div>
                            )}
                            {optionflag === 'Store' && (
                                <div className="space-y-2 max-w-xl">
                                    <Label>Select Store <span className="text-destructive">*</span></Label>
                                    <Controller name="invmsT_Id" control={control} render={({ field }) => (
                                        <GenericCombobox options={storeOptions} value={field.value} onChange={field.onChange} placeholder="Store" />
                                    )} />
                                    {errors.invmsT_Id && <FormError>{errors.invmsT_Id.message}</FormError>}
                                </div>
                            )}
                            {optionflag === 'Group' && (
                                <div className="space-y-2 max-w-xl">
                                    <Label>Select Group <span className="text-destructive">*</span></Label>
                                    <Controller name="invmG_Id" control={control} render={({ field }) => (
                                        <GenericCombobox options={groupOptions} value={field.value} onChange={field.onChange} placeholder="Group" />
                                    )} />
                                    {errors.invmG_Id && <FormError>{errors.invmG_Id.message}</FormError>}
                                </div>
                            )}
                        </div>
                    </div>
                )}
 
                <div className="flex justify-center gap-4 p-4 border-t bg-muted/10">
                    <Button
                        type="submit"
                        variant="secondary"
                        className="w-fit shadow-md transition-all duration-200 hover:scale-105 hover:shadow-lg"
                        isLoading={generateReportMutation.isPending}
                    >
                        <FileText className="mr-2 h-4 w-4" /> Report
                    </Button>
                    <Button
                        type="button"
                        variant="outline"
                        className="w-fit shadow-md transition-all duration-200 hover:scale-105 hover:shadow-lg"
                        onClick={handleCancel}
                    >
                        <RefreshCcw className="mr-2 h-4 w-4" /> Reset
                    </Button>
                </div>
            </CollapsibleSection>
        </form>
    );
}
