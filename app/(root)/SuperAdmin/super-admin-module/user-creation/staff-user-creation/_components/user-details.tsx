'use client';

import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { CategoryDTO, ModuleDTO } from '@/types/super-admin/user-creation/staff-user-creation';
import { useFormContext } from 'react-hook-form';

interface UserDetailsProps {
    categories: CategoryDTO[];
    onCategoryChange: (categories: CategoryDTO[]) => void;
    modules: ModuleDTO[];
    onModuleChange: (modules: ModuleDTO[]) => void;
    onSelectAllCategories: () => void;
    onSelectAllModules: () => void;
    isUserNameDisabled?: boolean;
    onChangeUsernameToggle?: () => void;
}

export default function UserDetails({
    categories,
    onCategoryChange,
    modules,
    onModuleChange,
    onSelectAllCategories,
    onSelectAllModules,
    isUserNameDisabled = false,
    onChangeUsernameToggle
}: UserDetailsProps) {
    const { register, watch } = useFormContext();
    const filterData = watch('filterData');

    const handleCategoryCheck = (catId: number, checked: boolean) => {
        const updatedCategories = categories.map((cat) => (cat.amC_Id === catId ? { ...cat, catid: checked } : cat));
        onCategoryChange(updatedCategories);
    };

    const handleModuleCheck = (modId: number, checked: boolean) => {
        const updatedModules = modules.map((mod) => (mod.ivrmM_Id === modId ? { ...mod, model: checked } : mod));
        onModuleChange(updatedModules);
    };

    return (
        <div className='grid grid-cols-1 gap-8 md:grid-cols-3'>
            {/* User Credentials Module */}
            <div className={`card-bento p-8 space-y-6 relative flex flex-col justify-center ${filterData === 'Multiple' ? 'opacity-30 grayscale pointer-events-none' : ''}`}>
                <div className="neon-glow-blue" />
                <div className="relative z-10 space-y-6">
                    <Label className='text-xs font-black uppercase text-slate-500 tracking-wider'>05. Access Credentials</Label>

                    <div className='space-y-4'>
                        <Label className='text-[10px] font-bold uppercase text-slate-400'>Authentication Identifier (Username)</Label>
                        <div className='flex flex-col gap-3'>
                            <Input
                                {...register('userName')}
                                className='h-12 bg-slate-50 border-slate-200 rounded-2xl uppercase font-bold tracking-widest text-sm focus:ring-blue-500/20'
                                placeholder={filterData === 'Multiple' ? 'SYSTEM MANAGED' : 'ENTER USERNAME'}
                                readOnly={isUserNameDisabled}
                                disabled={filterData === 'Multiple'}
                            />
                            <button
                                type='button'
                                onClick={onChangeUsernameToggle}
                                disabled={filterData === 'Multiple' || !isUserNameDisabled}
                                className='h-10 w-full rounded-xl bg-blue-600 font-bold text-[10px] uppercase tracking-widest text-white transition-all hover:bg-blue-700 hover:shadow-lg hover:-translate-y-0.5 disabled:bg-slate-200 disabled:text-slate-400 disabled:translate-y-0 disabled:shadow-none'>
                                Modify Credentials
                            </button>
                        </div>
                    </div>

                    <div className='glass-pane p-5 bg-orange-50/20 border-orange-200/40 relative overflow-hidden group'>
                        <div className="absolute top-0 right-0 w-16 h-16 bg-orange-500/5 rounded-bl-full -mr-4 -mt-4 transition-all group-hover:scale-110" />
                        <p className='font-bold text-orange-700 text-[10px] leading-relaxed uppercase relative z-10'>
                            {filterData === 'Multiple'
                                ? "Policy: Passwords are auto-generated for multi-staff batches."
                                : <>Default Token: <span className="bg-orange-100 px-1.5 py-0.5 rounded ml-1 tracking-widest">vaps@123</span></>
                            }
                        </p>
                    </div>
                </div>
            </div>

            {/* Selection Lists Module */}
            <div className='md:col-span-2 card-bento p-8 relative'>
                <div className="neon-glow-purple" />
                <div className="relative z-10">
                    <Label className='text-xs font-black uppercase text-slate-500 tracking-wider mb-8 block'>06. Navigation & Logic Privileges</Label>

                    <div className='grid grid-cols-1 gap-8 sm:grid-cols-2'>
                        {/* Categories */}
                        <div className='space-y-4'>
                            <Label className='flex items-center justify-between font-bold text-[10px] uppercase text-slate-400'>
                                Resource Categories
                                <button type="button" onClick={onSelectAllCategories} className='px-2 py-1 rounded-md bg-slate-100 hover:bg-slate-200 text-primary transition-colors lowercase'>
                                    select all
                                </button>
                            </Label>
                            <div className='glass-pane overflow-hidden p-2 bg-slate-50/10'>
                                <ScrollArea className='h-48'>
                                    <div className="space-y-1 px-1">
                                        {categories.map((cat) => (
                                            <div key={cat.amC_Id} className='flex items-center space-x-3 rounded-xl p-3 bg-white/5 hover:bg-white/40 border border-white/0 hover:border-white/60 transition-all group cursor-pointer'>
                                                <Checkbox
                                                    id={`cat-${cat.amC_Id}`}
                                                    className="rounded-md border-slate-300 data-[state=checked]:bg-purple-600"
                                                    checked={cat.catid}
                                                    onCheckedChange={(checked) => handleCategoryCheck(cat.amC_Id, !!checked)}
                                                />
                                                <label htmlFor={`cat-${cat.amC_Id}`} className='cursor-pointer select-none text-xs font-medium text-slate-600 group-hover:text-purple-700 transition-colors'>
                                                    {cat.amC_Name}
                                                </label>
                                            </div>
                                        ))}
                                    </div>
                                </ScrollArea>
                            </div>
                        </div>

                        {/* Modules */}
                        <div className='space-y-4'>
                            <Label className='flex items-center justify-between font-bold text-[10px] uppercase text-slate-400'>
                                System Modules
                                <button type="button" onClick={onSelectAllModules} className='px-2 py-1 rounded-md bg-slate-100 hover:bg-slate-200 text-primary transition-colors lowercase'>
                                    select all
                                </button>
                            </Label>
                            <div className='glass-pane overflow-hidden p-2 bg-slate-50/10'>
                                <ScrollArea className='h-48'>
                                    <div className="space-y-1 px-1">
                                        {modules.map((mod) => (
                                            <div
                                                key={mod.ivrmM_Id}
                                                className='flex items-center space-x-3 rounded-xl p-3 bg-white/5 hover:bg-white/40 border border-white/0 hover:border-white/60 transition-all group cursor-pointer'>
                                                <Checkbox
                                                    id={`mod-${mod.ivrmM_Id}`}
                                                    className="rounded-md border-slate-300 data-[state=checked]:bg-purple-600"
                                                    checked={mod.model}
                                                    onCheckedChange={(checked) => handleModuleCheck(mod.ivrmM_Id, !!checked)}
                                                />
                                                <label htmlFor={`mod-${mod.ivrmM_Id}`} className='cursor-pointer select-none text-xs font-medium text-slate-600 group-hover:text-purple-700 transition-colors'>
                                                    {mod.ivrmM_ModuleName}
                                                </label>
                                            </div>
                                        ))}
                                    </div>
                                </ScrollArea>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
