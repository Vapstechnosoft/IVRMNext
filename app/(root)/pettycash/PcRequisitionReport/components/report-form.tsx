'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { DatePicker } from '@/components/ui/date-picker';
import { Label } from '@/components/ui/extension/field';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Search, RotateCcw } from 'lucide-react';
import { UsePcRequisitionReportOrganization } from '@/hooks/pettycash/PcRequisitionReport';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { UsePcRequisitionReportSchemas, UsePcRequisitionReport } from '@/schemas/pettycash/PcRequisitionReport';

interface SimpleRequisitionReportProps {
  onSearch?: (params: any) => void;
}



// RequisitionReport

export default function SimpleRequisitionReport({ onSearch }: SimpleRequisitionReportProps) {
  const [organization, setOrganization] = useState('');
  const [fromDate, setFromDate] = useState<Date | undefined>();
  const [toDate, setToDate] = useState<Date | undefined>();
  const [reportType, setReportType] = useState<'Overall' | 'Particular'>('Overall');

  const {
    handleSubmit,
    reset,
    control,
    setValue,
    watch,
    formState: { errors, isSubmitting }
  } = useForm<UsePcRequisitionReport>({
    resolver: zodResolver(UsePcRequisitionReportSchemas.addOrUpdate),
    mode: 'onChange',
    defaultValues: {
      mI_Id: undefined
    }
  });
  const handleReport = (data: UsePcRequisitionReport) => {
    const payload = {
      mI_Id: data.mI_Id,
      fromDate: fromDate ? format(fromDate, 'yyyy-MM-dd') : null,
      toDate: toDate ? format(toDate, 'yyyy-MM-dd') : null,
      reportType: reportType
    };

    console.log('Clean Payload:', payload);

    onSearch?.(payload);
  };
  const {
    data: ReportOrganizationDropDown,
    isLoading: ReportOrganizationdropdownloading,
    error: ReportOrganizationdropdownerror,
    refetchAll: refetchAllReportOrganization
  } = UsePcRequisitionReportOrganization();

 const handleCancel = () => {
  reset({
    mI_Id: undefined
  });

  setFromDate(undefined);
  setToDate(undefined);
  setReportType('Overall');
};

  return (
    <div className="mx-auto w-full bg-white rounded-xl shadow-sm border border-purple-100 p-8 space-y-8 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Organization */}
        <div className="space-y-3">
          <Label>
            Organization: <span className='text-red-500'>*</span>
          </Label>
          <Controller
            name='mI_Id'
            control={control}
            render={({ field }) => (
              <Select
                key={field.value?.toString() || 'empty'}
                onValueChange={(value) => {
                  field.onChange(value ? Number(value) : null);
                }}
                value={field.value ? field.value.toString() : ''}
                disabled={ReportOrganizationdropdownloading || !!ReportOrganizationdropdownerror}
              >
                <SelectTrigger className='w-full'>
                  <SelectValue
                    placeholder='Select Organization'
                    className='text-gray-400'   // only placeholder is grey
                  />
                </SelectTrigger>
                <SelectContent>
                  {ReportOrganizationdropdownloading ? (
                    <SelectItem value='loading' disabled>
                      Loading Organizations
                    </SelectItem>
                  ) : ReportOrganizationdropdownerror ? (
                    <SelectItem value='error' disabled>
                      Error loading Organizations
                    </SelectItem>
                  ) : (
                    (ReportOrganizationDropDown?.data?.getuserinstitution || ReportOrganizationDropDown?.data || [])?.map((item: any) => (
                      <SelectItem key={item.mI_Id} value={item.mI_Id.toString()}>
                        {item.mI_Name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            )}
          />
          {errors.mI_Id && <span className='text-red-500 text-sm'>{errors.mI_Id.message}</span>}
        </div>



        {/* From Date */}
        <div className="space-y-3">
          <Label className="text-purple-900 font-semibold">Requisition From Date: <span className='text-red-500'>*</span></Label>
          <DatePicker
            date={fromDate}
            setDate={setFromDate}
          />
        </div>

        {/* To Date */}
        <div className="space-y-3">
          <Label className="text-purple-900 font-semibold">Requisition To Date: <span className='text-red-500'>*</span></Label>
          <DatePicker
            date={toDate}
            setDate={setToDate}
          />
        </div>
      </div>

      {/* Radio Buttons & Actions */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-6 pt-4 border-t border-purple-50">
        <div className="space-y-3">
          <Label className="text-purple-900 font-semibold">Report Type</Label>
          <div className="flex items-center gap-8 bg-purple-50/50 p-2 rounded-lg px-4 border border-purple-100/50">
            <label className="flex items-center gap-3 cursor-pointer group text-sm font-medium text-purple-700">
              <input
                type="radio"
                className="w-4 h-4 accent-purple-600 cursor-pointer"
                value="Overall"
                checked={reportType === 'Overall'}
                onChange={() => setReportType('Overall')}
              />
              Overall
            </label>

            <label className="flex items-center gap-3 cursor-pointer group text-sm font-medium text-purple-700">
              <input
                type="radio"
                className="w-4 h-4 accent-purple-600 cursor-pointer"
                value="Particular"
                checked={reportType === 'Particular'}
                onChange={() => setReportType('Particular')}
              />
              Particular
            </label>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex items-center gap-4 w-full md:w-auto">
          <Button
            onClick={handleSubmit(handleReport)}
            className="bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800 text-white px-6 h-10 rounded-md"
          >
            <Search className="mr-2 h-4 w-4" />
            Report
          </Button>

          <Button
            variant="outline"
            onClick={handleCancel}
            className="border-orange-200 text-orange-700 hover:bg-orange-50 h-10 px-6 rounded-md"
          >
            <RotateCcw className="mr-2 h-4 w-4" />
            Reset
          </Button>
        </div>
      </div>
    </div>
  );
}
