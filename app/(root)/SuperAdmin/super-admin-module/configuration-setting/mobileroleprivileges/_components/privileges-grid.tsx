'use client';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { IMobileRolePrivilege } from '@/types/super-admin/configuration-setting/mobileroleprivileges';
import { Trash2, ShieldCheck, Filter } from 'lucide-react';
import { InputText } from '@/components/ui/extension/input-text';
import { useState } from 'react';

interface PrivilegesGridProps {
    data: IMobileRolePrivilege[];
    onChange: (data: IMobileRolePrivilege[]) => void;
    onDelete?: (item: IMobileRolePrivilege) => void;
    title: string;
    isCart?: boolean;
}

export function PrivilegesGrid({ data, onChange, onDelete, title, isCart }: PrivilegesGridProps) {
    if (!data || data.length === 0) return null;

    const [searchTerm, setSearchTerm] = useState('');

    const handleCheckChange = (index: number, field: keyof IMobileRolePrivilege, checked: boolean) => {
        const newData = [...data];
        newData[index] = { ...newData[index], [field]: checked };
        onChange(newData);
    };

    const toggleAll = (field: keyof IMobileRolePrivilege, checked: boolean) => {
        const newData = data.map(item => ({ ...item, [field]: checked }));
        onChange(newData);
    };

    const filteredData = data.filter(item =>
        item.ivrmmaP_AppPageName.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="border rounded-xl shadow-lg bg-white overflow-hidden border-slate-200">
            <div className="p-4 border-b bg-slate-50/80 flex flex-wrap justify-between items-center gap-4 bg-gradient-to-r from-slate-50 to-white">
                <div className="flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-[#7C3AED]" />
                    <h3 className="font-bold text-slate-800 text-lg">{title}</h3>
                    <span className="ml-2 px-2 py-0.5 bg-slate-200 text-slate-600 rounded-full text-xs font-semibold">
                        {data.length} {data.length === 1 ? 'Page' : 'Pages'}
                    </span>
                </div>
                <div className="flex items-center gap-3">
                    <div className="relative w-64">
                        <InputText
                            placeholder="Filter mapping..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-8 bg-white border-slate-200"
                        />
                        <Filter className="w-4 h-4 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                    </div>
                </div>
            </div>
            <div className="overflow-x-auto max-h-[500px] overflow-y-auto">
                <table className="w-full text-sm text-left border-collapse">
                    <thead className="text-xs text-slate-500 uppercase bg-slate-50/50 sticky top-0 z-10 backdrop-blur-sm border-b">
                        <tr>
                            <th className="px-6 py-4 font-semibold">SL.NO</th>
                            <th className="px-6 py-4 font-semibold">Page Name</th>
                            <th className="px-6 py-4 font-semibold text-center group cursor-pointer hover:text-[#7C3AED] transition-colors" onClick={() => toggleAll('ivrmrP_AddFlag', !data.every(d => d.ivrmrP_AddFlag))}>
                                Add
                            </th>
                            <th className="px-6 py-4 font-semibold text-center group cursor-pointer hover:text-red-500 transition-colors" onClick={() => toggleAll('ivrmrP_DeleteFlag', !data.every(d => d.ivrmrP_DeleteFlag))}>
                                Delete
                            </th>
                            <th className="px-6 py-4 font-semibold text-center group cursor-pointer hover:text-blue-500 transition-colors" onClick={() => toggleAll('ivrmrP_UpdateFlag', !data.every(d => d.ivrmrP_UpdateFlag))}>
                                Update
                            </th>
                            <th className="px-6 py-4 font-semibold text-center group cursor-pointer hover:text-green-500 transition-colors" onClick={() => toggleAll('ivrmrP_ReportFlag', !data.every(d => d.ivrmrP_ReportFlag))}>
                                Report
                            </th>
                            {isCart && <th className="px-6 py-4 font-semibold text-center">Action</th>}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {filteredData.map((item, index) => (
                            <tr key={index} className="hover:bg-slate-50/50 transition-colors group">
                                <td className="px-6 py-4 text-slate-500 font-medium">{index + 1}</td>
                                <td className="px-6 py-4 font-semibold text-slate-800">{item.ivrmmaP_AppPageName}</td>
                                <td className="px-6 py-4 text-center">
                                    <Checkbox
                                        checked={item.ivrmrP_AddFlag}
                                        onCheckedChange={(c) => handleCheckChange(index, 'ivrmrP_AddFlag', c as boolean)}
                                        className="border-slate-300 data-[state=checked]:bg-[#7C3AED] data-[state=checked]:border-[#7C3AED]"
                                    />
                                </td>
                                <td className="px-6 py-4 text-center">
                                    <Checkbox
                                        checked={item.ivrmrP_DeleteFlag}
                                        onCheckedChange={(c) => handleCheckChange(index, 'ivrmrP_DeleteFlag', c as boolean)}
                                        className="border-slate-300 data-[state=checked]:bg-red-500 data-[state=checked]:border-red-500"
                                    />
                                </td>
                                <td className="px-6 py-4 text-center">
                                    <Checkbox
                                        checked={item.ivrmrP_UpdateFlag}
                                        onCheckedChange={(c) => handleCheckChange(index, 'ivrmrP_UpdateFlag', c as boolean)}
                                        className="border-slate-300 data-[state=checked]:bg-blue-500 data-[state=checked]:border-blue-500"
                                    />
                                </td>
                                <td className="px-6 py-4 text-center">
                                    <Checkbox
                                        checked={item.ivrmrP_ReportFlag}
                                        onCheckedChange={(c) => handleCheckChange(index, 'ivrmrP_ReportFlag', c as boolean)}
                                        className="border-slate-300 data-[state=checked]:bg-green-500 data-[state=checked]:border-green-500"
                                    />
                                </td>
                                {isCart && onDelete && (
                                    <td className="px-6 py-4 text-center">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-all"
                                            onClick={() => onDelete(item)}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </td>
                                )}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            {!filteredData.length && (
                <div className="p-12 text-center">
                    <p className="text-slate-400 font-medium italic">No mappings found matching your search</p>
                </div>
            )}
        </div>
    );
}
