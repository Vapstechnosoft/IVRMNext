'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    changeInstitution,
    getStaffData,
    getStaffUserCreationOnload,
    saveStaffUser
} from '@/server/super-admin/user-creation/staff-user-creation';
import type {
    CategoryDTO,
    InstitutionDTO,
    MobilePageDTO,
    ModuleDTO,
    PageDTO,
    StaffDTO
} from '@/types/super-admin/user-creation/staff-user-creation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { z } from 'zod';
import PageMappingGrids from './_components/page-mapping-grids';
import SelectionForm from './_components/selection-form';
import UserDetails from './_components/user-details';

const formSchema = z.object({
    roleType: z.string().min(1, 'Select Role Type'),
    trust: z.string().optional(),
    institution: z.string().min(1, 'Select Institution'),
    filterData: z.enum(['Single', 'Multiple']).default('Single'),
    staffId: z.string().optional(),
    userName: z.string().min(1, 'Username is required')
});

type FormValues = z.infer<typeof formSchema>;

export default function StaffUserCreationPage() {
    const methods = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            roleType: '',
            trust: '',
            institution: '',
            filterData: 'Single',
            staffId: '',
            userName: ''
        }
    });

    const [onloadData, setOnloadData] = useState<any>(null);
    const [institutions, setInstitutions] = useState<InstitutionDTO[]>([]);
    const [staffList, setStaffList] = useState<StaffDTO[]>([]);
    const [categories, setCategories] = useState<CategoryDTO[]>([]);
    const [modules, setModules] = useState<ModuleDTO[]>([]);
    const [webPages, setWebPages] = useState<PageDTO[]>([]);
    const [mobilePages, setMobilePages] = useState<MobilePageDTO[]>([]);
    const [savedGrid, setSavedGrid] = useState<PageDTO[]>([]);

    const watchRoleType = methods.watch('roleType');
    const watchTrust = methods.watch('trust');
    const watchInstitution = methods.watch('institution');
    const watchStaffId = methods.watch('staffId');
    const watchFilterData = methods.watch('filterData');

    useEffect(() => {
        const fetchOnload = async () => {
            const result = await getStaffUserCreationOnload(2); // Page ID 2 as per legacy code
            if (result.success && result.data) {
                setOnloadData(result.data);
                setInstitutions(result.data.fillinstitution);
                setStaffList(result.data.fillstaff);
                setCategories(result.data.fillcategory);
                setModules(result.data.fillmodule);
                setWebPages(result.data.showgrid1);
            }
        };
        fetchOnload();
    }, []);

    useEffect(() => {
        const handleInstitutionChange = async () => {
            if (watchInstitution) {
                const payload = {
                    MI_Id: Number(watchInstitution),
                    rolenamess: watchRoleType,
                    IVRMRT_Id: Number(watchRoleType),
                    multipleinsti: [],
                    flag: 'S' // Assuming 'S' for Staff flag
                };
                const result = await changeInstitution(payload);
                if (result.success && result.data) {
                    if (result.data.fillcategory) setCategories(result.data.fillcategory);
                    if (result.data.fillmodule) {
                        setModules(result.data.fillmodule);
                    }
                    if (result.data.fillstaff) setStaffList(result.data.fillstaff);
                }
            }
        };
        handleInstitutionChange();
    }, [watchInstitution, watchRoleType]);

    useEffect(() => {
        const handleStaffChange = async () => {
            if (watchStaffId && watchFilterData === 'Single') {
                const payload = {
                    IVRMSTAUL_Id: Number(watchStaffId),
                    MI_Id: Number(watchInstitution),
                    rolenamess: watchRoleType,
                    IVRMRT_Id: Number(watchRoleType)
                };
                const result = await getStaffData(payload);
                if (result.success && result.data) {
                    if (result.data.singleemployee && result.data.singleemployee.length > 0) {
                        methods.setValue('userName', result.data.singleemployee[0].user_Name);
                    }
                    if (result.data.showgrid1) setWebPages(result.data.showgrid1);
                    if (result.data.thirdgriddatamobile) setMobilePages(result.data.thirdgriddatamobile);
                    if (result.data.savedgrid) setSavedGrid(result.data.savedgrid);
                }
            }
        };
        handleStaffChange();
    }, [watchStaffId, watchFilterData, watchInstitution, watchRoleType, methods]);

    const onSubmit = async (data: FormValues) => {
        console.log('Form Data:', data);

        const selectedCategories = categories.filter((c) => c.catid).map((c) => ({ amC_Id: c.amC_Id }));
        const selectedModules = modules.filter((m) => m.model).map((m) => ({ ivrmM_Id: m.ivrmM_Id }));
        const selectedWebPages = webPages
            .filter((p) => p.checked)
            .map((p) => ({
                ivrmP_Id: p.ivrmP_Id,
                ivrmrP_AddFlag: p.ivrmrP_AddFlag,
                ivrmrP_UpdateFlag: p.ivrmrP_UpdateFlag,
                ivrmrP_DeleteFlag: p.ivrmrP_DeleteFlag,
                ivrmrP_ProcessFlag: p.ivrmrP_ProcessFlag,
                ivrmrP_ReportFlag: p.ivrmrP_ReportFlag
            }));
        const selectedMobilePages = mobilePages
            .filter((p) => p.checked)
            .map((p) => ({
                ivrmmaP_Id: p.ivrmmaP_Id,
                ivrmmaP_AddFlg: p.ivrmmaP_AddFlg,
                ivrmmaP_UpdateFlg: p.ivrmmaP_UpdateFlg,
                ivrmmaP_DeleteFlg: p.ivrmmaP_DeleteFlg
            }));

        const payload = {
            IVRMRT_Id: Number(data.roleType),
            MI_Id: Number(data.institution),
            filterData: data.filterData,
            User_Name: data.userName,
            Password: 'vaps@123',
            cat_list: selectedCategories,
            mod_list: selectedModules,
            grid1_list: selectedWebPages,
            third_list: selectedMobilePages,
            StaffId: data.filterData === 'Single' ? Number(data.staffId) : 0,
            staff_user_list: data.filterData === 'Multiple' ? staffList.filter((s) => s.Selected).map((s) => ({ hrmE_Id: s.hrmE_Id })) : []
        };

        const result = await saveStaffUser(payload);
        if (result.success) {
            alert(result.message);
            // Optionally refresh or reset
        } else {
            alert(result.message);
        }
    };

    return (
        <div className='container mx-auto p-6'>
            <Card className='w-full'>
                <CardHeader>
                    <CardTitle className='text-center font-bold text-2xl text-primary'>Institution Staff User Creation</CardTitle>
                </CardHeader>
                <CardContent>
                    <FormProvider {...methods}>
                        <form onSubmit={methods.handleSubmit(onSubmit)} className='space-y-8'>
                            <SelectionForm
                                roleTypes={onloadData?.fillroletype || []}
                                trusts={onloadData?.fillorganisation || []}
                                institutions={institutions}
                                staffList={staffList}
                            />

                            <UserDetails categories={categories} modules={modules} />

                            <PageMappingGrids webPages={webPages} mobilePages={mobilePages} savedGrid={savedGrid} />

                            <div className='flex justify-center gap-4'>
                                <button
                                    type='submit'
                                    className='btn btn-primary rounded-md px-8 py-2 shadow-md transition-all hover:bg-primary-dark'>
                                    Save
                                </button>
                                <button
                                    type='button'
                                    onClick={() => methods.reset()}
                                    className='btn btn-outline rounded-md border border-gray-300 px-8 py-2 transition-all hover:bg-gray-100'>
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </FormProvider>
                </CardContent>
            </Card>
        </div>
    );
}
