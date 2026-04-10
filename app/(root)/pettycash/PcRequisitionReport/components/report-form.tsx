'use client';

import { useState } from 'react';
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

interface SimpleRequisitionReportProps {
  onSearch?: (params: any) => void;
}

export default function SimpleRequisitionReport({ onSearch }: SimpleRequisitionReportProps) {
  const [organization, setOrganization] = useState('');
  const [fromDate, setFromDate] = useState<Date | undefined>();
  const [toDate, setToDate] = useState<Date | undefined>();
  const [reportType, setReportType] = useState<'overall' | 'particular'>('overall');

  const handleReport = () => {
    const payload = {
      mi_id: organization,
      fromDate: fromDate?.toISOString(),
      toDate: toDate?.toISOString(),
      reportType
    };

    onSearch?.(payload);
  };

  const handleCancel = () => {
    setOrganization('');
    setFromDate(undefined);
    setToDate(undefined);
    setReportType('overall');
  };

  return (
    <div className="mx-auto w-full bg-white rounded-xl shadow-sm border border-purple-100 p-8 space-y-8 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Organization */}
        <div className="space-y-3">
          <Label className="text-purple-900 font-semibold flex items-center gap-2">
            Organization <span className="text-red-500">*</span>
          </Label>
          <Select value={organization} onValueChange={setOrganization}>
            <SelectTrigger className="border-purple-200 focus:ring-purple-500 h-11">
              <SelectValue placeholder="Select Organization" />
            </SelectTrigger>
          </Select>
        </div>

        {/* From Date */}
        <div className="space-y-3">
          <Label className="text-purple-900 font-semibold">From Date</Label>
          <DatePicker
            date={fromDate}
            setDate={setFromDate}
          />
        </div>

        {/* To Date */}
        <div className="space-y-3">
          <Label className="text-purple-900 font-semibold">To Date</Label>
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
                value="overall"
                checked={reportType === 'overall'}
                onChange={() => setReportType('overall')}
              />
              Overall
            </label>

            <label className="flex items-center gap-3 cursor-pointer group text-sm font-medium text-purple-700">
              <input
                type="radio"
                className="w-4 h-4 accent-purple-600 cursor-pointer"
                value="particular"
                checked={reportType === 'particular'}
                onChange={() => setReportType('particular')}
              />
              Particular
            </label>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex items-center gap-4 w-full md:w-auto">
          <Button
            onClick={handleReport}
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
