'use client';

import { DataTable } from '@/components/ui/data-table';
import { studentRequestConfirmColumns } from './columns';
import { GenericDataTable } from '@/components/ui/view-data-table/view-generic-data-table';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

interface StudentRequestConfirmListProps {
    data: any[];
    onProcess: (data: any) => void;
}

export default function StudentRequestConfirmList({ data, onProcess }: StudentRequestConfirmListProps) {
    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between py-2 border-b border-gray-100">
                <div className="flex items-center space-x-2">
                    <span className="text-sm font-bold text-gray-700">Total Grid Records :</span>
                    <span className="bg-gray-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">{data.length}</span>
                    {data.length === 0 && (
                        <span className="text-red-500 text-sm ml-4 font-medium">Record Not Found!</span>
                    )}
                </div>
                <div className="relative w-72">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                        <Search className="h-3.5 w-3.5 text-gray-400" />
                    </div>
                    <Input 
                        placeholder="search here..." 
                        className="h-9 pl-10 text-xs border-gray-200 rounded-full focus-visible:ring-[#4255a7] bg-white shadow-sm"
                    />
                </div>
            </div>
            <GenericDataTable
                columns={studentRequestConfirmColumns(onProcess)}
                data={data}
                isLoading={false}
            />
        </div>
    );
}
