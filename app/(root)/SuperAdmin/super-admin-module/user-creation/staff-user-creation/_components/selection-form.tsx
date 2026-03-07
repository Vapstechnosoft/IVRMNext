'use client';

import { useFormContext, Controller } from 'react-hook-form';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { useState } from 'react';
import type { RoleTypeDTO, TrustDTO, InstitutionDTO, StaffDTO } from '@/types/super-admin/user-creation/staff-user-creation';

interface SelectionFormProps {
    roleTypes: RoleTypeDTO[];
    trusts: TrustDTO[];
    institutions: InstitutionDTO[];
    staffList: StaffDTO[];
    onStaffCheckboxChange?: (id: number, checked: boolean) => void;
    onSelectAllStaff?: () => void;
    onViewUsernames?: () => void;
    showViewUsernames?: boolean;
    onInstitutionCheckboxChange?: (id: number, checked: boolean) => void;
    onSelectAllInstitutions?: () => void;
}

export default function SelectionForm({
    roleTypes,
    trusts,
    institutions,
    staffList,
    onStaffCheckboxChange,
    onSelectAllStaff,
    onViewUsernames,
    showViewUsernames,
    onInstitutionCheckboxChange,
    onSelectAllInstitutions
}: SelectionFormProps) {
    const { control, watch, formState: { errors } } = useFormContext();
    const [staffSearch, setStaffSearch] = useState('');

    const filterData = watch('filterData');
    const roleType = watch('roleType');
    console.log('filterData', filterData);
    const selectedRole = roleTypes.find(r => String(r.ivrmrT_Id) === roleType);
    const roleName = selectedRole?.ivrmrT_Role || '';
    const roleFlag = selectedRole?.flag || '';
    const isAdmin = roleName.toUpperCase() === 'ADMIN' || roleName.toUpperCase() === 'SUPER ADMIN';
    const showStaffSelection = roleFlag ? roleFlag.toUpperCase() === 'S' : true;


    const filteredStaff = staffList.filter(s =>
        s.stafname.toLowerCase().includes(staffSearch.toLowerCase()) ||
        s.hrmE_EmployeeCode?.toLowerCase().includes(staffSearch.toLowerCase())
    );

    const allSelected = staffList.length > 0 && staffList.every(s => s.Selected);

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Role & Selection Mode Module */}
            <div className="card-bento p-8 space-y-8 relative">
                <div className="neon-glow-blue" />
                <div className="relative z-10 space-y-8">
                    {/* Role Type */}
                    <div className="space-y-3">
                        <Label className="text-xs font-black uppercase text-slate-500 tracking-wider">01. Select Role Type</Label>
                        <Controller
                            control={control}
                            name="roleType"
                            render={({ field }) => (
                                <Select onValueChange={field.onChange} value={field.value}>
                                    <SelectTrigger className="h-12 bg-slate-50/50 border-slate-200/60 rounded-2xl focus:ring-blue-500/20 transition-all">
                                        <SelectValue placeholder="-- SELECT ROLE --" />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-2xl border-slate-200/60 shadow-xl">
                                        {roleTypes.map((role) => (
                                            <SelectItem key={role.ivrmrT_Id} value={String(role.ivrmrT_Id)} className="rounded-lg my-1">
                                                {role.ivrmrT_Role}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            )}
                        />
                        {errors.roleType && <p className="text-[10px] text-red-500 font-bold uppercase">{errors.roleType.message as string}</p>}
                    </div>

                    {/* Selection Mode */}
                    <div className="space-y-4">
                        <Label className="text-xs font-black uppercase text-slate-500 tracking-wider">02. Mapping Strategy</Label>
                        <Controller
                            control={control}
                            name="filterData"
                            render={({ field }) => (
                                <RadioGroup onValueChange={field.onChange} value={field.value} className="flex gap-4 pt-1">
                                    <div className="flex-1">
                                        <RadioGroupItem value="Single" id="r1" className="peer sr-only" />
                                        <Label htmlFor="r1" className="flex items-center justify-center h-12 rounded-2xl border-2 border-slate-100 bg-slate-50/50 cursor-pointer transition-all peer-data-[state=checked]:border-blue-500 peer-data-[state=checked]:bg-blue-50 peer-data-[state=checked]:text-blue-700 hover:bg-slate-100 font-bold text-xs uppercase text-center px-2">
                                            Individual
                                        </Label>
                                    </div>
                                    <div className="flex-1">
                                        <RadioGroupItem value="Multiple" id="r2" className="peer sr-only" />
                                        <Label htmlFor="r2" className="flex items-center justify-center h-12 rounded-2xl border-2 border-slate-100 bg-slate-50/50 cursor-pointer transition-all peer-data-[state=checked]:border-blue-500 peer-data-[state=checked]:bg-blue-50 peer-data-[state=checked]:text-blue-700 hover:bg-slate-100 font-bold text-xs uppercase text-center px-2">
                                            Multiple
                                        </Label>
                                    </div>
                                </RadioGroup>
                            )}
                        />
                    </div>
                </div>
            </div>

            {/* Permissions Action (Only for Multiple) - Floating Accessory */}
            {filterData === 'Multiple' && (
                <div className="card-bento p-8 bg-indigo-50/30 border-indigo-100/50 flex flex-col justify-center">
                    <div className="neon-glow-blue bg-indigo-500" />
                    <Label className="text-xs font-black uppercase text-indigo-600 tracking-wider mb-4">Permission Action</Label>
                    <Controller
                        control={control}
                        name="adddelte"
                        render={({ field }) => (
                            <RadioGroup onValueChange={field.onChange} value={field.value} className="flex gap-4">
                                <div className="flex-1">
                                    <RadioGroupItem value="Add" id="a1" className="peer sr-only" />
                                    <Label htmlFor="a1" className="flex items-center justify-center h-12 rounded-2xl border-2 border-slate-100 bg-white cursor-pointer transition-all peer-data-[state=checked]:border-indigo-500 peer-data-[state=checked]:bg-indigo-500 peer-data-[state=checked]:text-white hover:bg-slate-50 font-bold text-xs uppercase">
                                        Add Pages
                                    </Label>
                                </div>
                                <div className="flex-1">
                                    <RadioGroupItem value="Del" id="a2" className="peer sr-only" />
                                    <Label htmlFor="a2" className="flex items-center justify-center h-12 rounded-2xl border-2 border-slate-100 bg-white cursor-pointer transition-all peer-data-[state=checked]:border-red-500 peer-data-[state=checked]:bg-red-500 peer-data-[state=checked]:text-white hover:bg-slate-50 font-bold text-xs uppercase">
                                        Remove
                                    </Label>
                                </div>
                            </RadioGroup>
                        )}
                    />
                </div>
            )}

            {/* Institution Selection Module */}
            <div className={`card-bento p-8 space-y-8 relative ${isAdmin && filterData === 'Multiple' ? 'md:col-span-2' : ''}`}>
                <div className="neon-glow-purple" />
                <div className="relative z-10">
                    <div className="flex items-center justify-between mb-6">
                        <Label className="text-xs font-black uppercase text-slate-500 tracking-wider">03. Institution Infrastructure</Label>
                        {isAdmin && watch('institution') && (
                            <button
                                type="button"
                                onClick={onViewUsernames}
                                className="text-[10px] font-black text-rose-500 uppercase tracking-widest hover:text-rose-600 transition-colors"
                            >
                                [ View Usernames ]
                            </button>
                        )}
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Trust Selection */}
                        <div className="space-y-3">
                            <Label className="text-[10px] font-bold uppercase text-slate-400">Select Trust</Label>
                            <Controller
                                control={control}
                                name="trust"
                                render={({ field }) => (
                                    <Select onValueChange={field.onChange} value={field.value}>
                                        <SelectTrigger className="h-11 bg-slate-50/50 border-slate-200/60 rounded-2xl">
                                            <SelectValue placeholder="-- SELECT TRUST --" />
                                        </SelectTrigger>
                                        <SelectContent className="rounded-2xl shadow-xl">
                                            {trusts.map((trust) => (
                                                <SelectItem key={trust.mO_Id} value={String(trust.mO_Id)} className="rounded-lg my-1">
                                                    {trust.mO_Name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                )}
                            />
                        </div>

                        {/* Institution Selection */}
                        <div className="space-y-3">
                            <Label className="text-[10px] font-bold uppercase text-slate-400">Target Institution</Label>
                            {isAdmin && filterData === 'Multiple' ? (
                                <div className="glass-pane overflow-hidden">
                                    <div className="p-4 border-b border-white/40 flex items-center justify-between bg-white/20">
                                        <span className="text-[10px] font-black uppercase text-slate-600">Institutions List</span>
                                        <div className="flex items-center space-x-2">
                                            <Checkbox
                                                id="all-inst"
                                                className="rounded-md border-slate-300 data-[state=checked]:bg-purple-600"
                                                checked={institutions.length > 0 && institutions.every(i => i.Selected)}
                                                onCheckedChange={onSelectAllInstitutions}
                                            />
                                            <Label htmlFor="all-inst" className="text-[10px] font-black cursor-pointer uppercase">All</Label>
                                        </div>
                                    </div>
                                    <ScrollArea className="h-40">
                                        <div className="p-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
                                            {institutions.map((inst) => (
                                                <div key={inst.mI_Id} className="flex items-center space-x-3 p-3 glass-pane bg-white/10 hover:bg-white/40 border-none transition-all cursor-pointer group">
                                                    <Checkbox
                                                        id={`inst-${inst.mI_Id}`}
                                                        className="rounded-md border-slate-300 data-[state=checked]:bg-purple-600"
                                                        checked={inst.Selected}
                                                        onCheckedChange={(checked) => onInstitutionCheckboxChange?.(inst.mI_Id, !!checked)}
                                                    />
                                                    <Label htmlFor={`inst-${inst.mI_Id}`} className="text-xs font-medium cursor-pointer select-none leading-tight py-1 group-hover:text-purple-700 transition-colors">
                                                        {inst.mI_Name}
                                                    </Label>
                                                </div>
                                            ))}
                                        </div>
                                    </ScrollArea>
                                </div>
                            ) : (
                                <Controller
                                    control={control}
                                    name="institution"
                                    render={({ field }) => (
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <SelectTrigger className="h-11 bg-slate-50/50 border-slate-200/60 rounded-2xl">
                                                <SelectValue placeholder="-- SELECT INSTITUTION --" />
                                            </SelectTrigger>
                                            <SelectContent className="rounded-2xl shadow-xl">
                                                {institutions.map((inst) => (
                                                    <SelectItem key={inst.mI_Id} value={String(inst.mI_Id)} className="rounded-lg my-1">
                                                        {inst.mI_Name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    )}
                                />
                            )}
                            {errors.institution && <p className="text-[10px] text-red-500 font-bold uppercase">{errors.institution.message as string}</p>}
                        </div>
                    </div>
                </div>
            </div>

            {/* Staff Selection Module */}
            <div className="card-bento p-8 space-y-6 md:col-span-2 relative">
                <div className="neon-glow-green" />
                <div className="relative z-10">
                    <Label className="text-xs font-black uppercase text-slate-500 tracking-wider mb-6 block">04. Staff Personnel Selection</Label>

                    {filterData === 'Single' ? (
                        <div className="max-w-xl">
                            <Controller
                                control={control}
                                name="staffId"
                                render={({ field }) => (
                                    <Select onValueChange={field.onChange} value={field.value}>
                                        <SelectTrigger className="h-14 bg-slate-50/50 border-slate-200/60 rounded-2xl text-base font-medium">
                                            <SelectValue placeholder="-- SELECT STAFF EMPLOYEE --" />
                                        </SelectTrigger>
                                        <SelectContent className="rounded-2xl shadow-2xl border-slate-200/60">
                                            {staffList.map((staff) => (
                                                <SelectItem key={staff.hrmE_Id} value={String(staff.hrmE_Id)} textValue={`${staff.stafname} ${staff.hrmE_EmployeeCode}`} className="rounded-xl my-1 p-3">
                                                    <div className="flex flex-col">
                                                        <span className="font-bold text-slate-700">{staff.stafname}</span>
                                                        <span className="text-[10px] text-slate-400 uppercase tracking-tighter">{staff.hrmE_EmployeeCode}</span>
                                                    </div>
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                )}
                            />
                        </div>
                    ) : (
                        <div className="glass-pane overflow-hidden bg-emerald-50/10">
                            <div className="p-5 border-b border-white/40 flex items-center justify-between bg-white/30 backdrop-blur-md">
                                <div className="relative flex-1 max-w-md">
                                    <Input
                                        placeholder="Search personnel by name or code..."
                                        className="h-11 pl-10 text-xs bg-white/60 border-slate-200 rounded-full focus:ring-emerald-500/20 transition-all font-medium"
                                        value={staffSearch}
                                        onChange={(e) => setStaffSearch(e.target.value)}
                                    />
                                    <div className="absolute left-3.5 top-3.5">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-500"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-3 ml-6">
                                    <Checkbox
                                        id="all-staff"
                                        className="h-5 w-5 rounded-md border-slate-300 data-[state=checked]:bg-emerald-600"
                                        checked={allSelected}
                                        onCheckedChange={onSelectAllStaff}
                                    />
                                    <Label htmlFor="all-staff" className="text-xs font-black cursor-pointer uppercase text-emerald-700">Select All</Label>
                                </div>
                            </div>
                            <ScrollArea className="h-64">
                                <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                    {filteredStaff.map((staff) => (
                                        <div key={staff.hrmE_Id} className="flex items-center space-x-3 p-4 glass-pane bg-white/20 hover:bg-white/60 hover:shadow-md border-none transition-all cursor-pointer group">
                                            <Checkbox
                                                id={`staff-${staff.hrmE_Id}`}
                                                className="h-5 w-5 rounded-md border-slate-300 data-[state=checked]:bg-emerald-600"
                                                checked={staff.Selected}
                                                onCheckedChange={(checked) => onStaffCheckboxChange?.(staff.hrmE_Id, !!checked)}
                                            />
                                            <div className="flex flex-col min-w-0">
                                                <Label htmlFor={`staff-${staff.hrmE_Id}`} className="text-xs font-bold cursor-pointer select-none leading-tight truncate group-hover:text-emerald-700">
                                                    {staff.stafname}
                                                </Label>
                                                <span className="text-[9px] text-slate-400 font-black uppercase tracking-widest">{staff.hrmE_EmployeeCode}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </ScrollArea>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
