'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    getAdminUserList,
    getCategoryDropdownByInstitution,
    getInstitutionDropdown,
    getMasterPageListGridOnChangeOfStaff,
    getMobileAppMasterPageListOnChangeOfStaff,
    getModuleDropdownByInstitution,
    getMultipleStaffUsers,
    getRoleTypeDropdown,
    getSavedListGridOnChangeOfStaff,
    getSavedMobileAppPageListOnChangeOfStaff,
    getStaffData,
    getStaffDropdownByInstitution,
    getStaffUserCreationOnload,
    getTrustDropdown,
    getUsernameOnStaffSelection,
    saveStaffUser,
    sendOTPSms,
    updateUsername,
    verifyOTP,
    getMasterPageListGridOnChangeOfModule
} from '@/server/super-admin/user-creation/staff-user-creation';
import type { ApiSearchparams } from '@/types';
import type {
    CategoryDTO,
    EmployeeListDTO,
    InstitutionDTO,
    MobilePageDTO,
    ModuleDTO,
    PageDTO,
    RoleTypeDTO,
    SavedMobilePageDTO,
    SavedPageDTO,
    StaffDTO,
    TrustDTO
} from '@/types/super-admin/user-creation/staff-user-creation';
import { zodResolver } from '@hookform/resolvers/zod';
import { RotateCcw, Save, X, Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';
import ChangeUsernameModal from './_components/change-username-modal';
import PageMappingGrids from './_components/page-mapping-grids';
import SelectionForm from './_components/selection-form';
import UserDetails from './_components/user-details';
import ViewUsernamesModal from './_components/view-usernames-modal';

const formSchema = z.object({
    roleType: z.string().min(1, 'Select Role Type'),
    trust: z.string().optional(),
    institution: z.string().min(1, 'Select Institution'),
    filterData: z.enum(['Single', 'Multiple']).default('Single'),
    adddelte: z.enum(['Add', 'Del']).default('Add'),
    staffId: z.string().optional(),
    userName: z.string().optional()
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
            adddelte: 'Add',
            staffId: '',
            userName: ''
        }
    });

    const [onloadData, setOnloadData] = useState<any>(null);
    const [institutions, setInstitutions] = useState<InstitutionDTO[]>([]);
    const [roleTypes, setRoleTypes] = useState<RoleTypeDTO[]>([]);
    const [trusts, setTrusts] = useState<TrustDTO[]>([]);
    const [staffList, setStaffList] = useState<StaffDTO[]>([]);
    const [categories, setCategories] = useState<CategoryDTO[]>([]);
    const [modules, setModules] = useState<ModuleDTO[]>([]);
    const [existingUsers, setExistingUsers] = useState<EmployeeListDTO[]>([]);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [isUserNameDisabled, setIsUserNameDisabled] = useState(false);

    // Grid states
    const [webPages, setWebPages] = useState<PageDTO[]>([]);
    const [stagedWebPages, setStagedWebPages] = useState<PageDTO[]>([]);
    const [mobilePages, setMobilePages] = useState<MobilePageDTO[]>([]);
    const [savedGrid, setSavedGrid] = useState<SavedPageDTO[]>([]);
    const [savedMobilePages, setSavedMobilePages] = useState<SavedMobilePageDTO[]>([]);
    const [userId, setUserId] = useState<number | null>(null);
    const [machineIp] = useState<string>('127.0.0.1');
    const [isChangeModalOpen, setIsChangeModalOpen] = useState(false);
    const [staffMobileNo, setStaffMobileNo] = useState<string>('');
    const [isSaving, setIsSaving] = useState(false);
    const [isOnloadLoading, setIsOnloadLoading] = useState(false);
    const [isCategoriesLoading, setIsCategoriesLoading] = useState(false);
    const [isModulesLoading, setIsModulesLoading] = useState(false);
    const [isStaffListLoading, setIsStaffListLoading] = useState(false);
    const [isStaffDataLoading, setIsStaffDataLoading] = useState(false);

    // Pagination states for Master Page List
    const [webPageTotal, setWebPageTotal] = useState(0);
    const [webPageParams, setWebPageParams] = useState<ApiSearchparams>({
        page: 1,
        page_size: 10,
        search_query: '',
        sort_column: '',
        sort_direction: ''
    });
    const [isWebPageLoading, setIsWebPageLoading] = useState(false);
    const [savedGridTotal, setSavedGridTotal] = useState(0);
    const [savedGridParams, setSavedGridParams] = useState<ApiSearchparams>({
        page: 1,
        page_size: 10,
        search_query: '',
        sort_column: '',
        sort_direction: ''
    });
    const [isSavedGridLoading, setIsSavedGridLoading] = useState(false);

    const [mobilePageTotal, setMobilePageTotal] = useState(0);
    const [mobilePageParams, setMobilePageParams] = useState<ApiSearchparams>({
        page: 1,
        page_size: 10,
        search_query: '',
        sort_column: '',
        sort_direction: ''
    });
    const [isMobilePageLoading, setIsMobilePageLoading] = useState(false);

    const [savedMobilePageTotal, setSavedMobilePageTotal] = useState(0);
    const [savedMobilePageParams, setSavedMobilePageParams] = useState<ApiSearchparams>({
        page: 1,
        page_size: 10,
        search_query: '',
        sort_column: '',
        sort_direction: ''
    });
    const [isSavedMobilePageLoading, setIsSavedMobilePageLoading] = useState(false);

    const watchRoleType = methods.watch('roleType');
    const watchTrust = methods.watch('trust');
    const watchInstitution = methods.watch('institution');
    const watchStaffId = methods.watch('staffId');
    const watchFilterData = methods.watch('filterData');
    const watchUserName = methods.watch('userName');

    const clearGrids = () => {
        setWebPages([]);
        setStagedWebPages([]);
        setMobilePages([]);
        setSavedGrid([]);
        setSavedMobilePages([]);
        setUserId(null);
        setWebPageTotal(0);
        setSavedGridTotal(0);
        setMobilePageTotal(0);
        setSavedMobilePageTotal(0);
        setIsUserNameDisabled(false);
    };

    const handleReload = () => {
        window.location.reload();
    };

    useEffect(() => {
        const fetchOnload = async () => {
            try {
                setIsOnloadLoading(true);
                console.info('🚀 [CLIENT] Initiating fetchOnload...');
                const roleTypeResult = await getRoleTypeDropdown();
                console.info('📦 [CLIENT] Role Type Result:', roleTypeResult);
                if (roleTypeResult.success && roleTypeResult.data) {
                    setRoleTypes(roleTypeResult.data);
                }

                const trustResult = await getTrustDropdown();
                console.info('📦 [CLIENT] Trust Result:', trustResult);
                if (trustResult.success && trustResult.data) {
                    setTrusts(trustResult.data);
                }

                const instResult = await getInstitutionDropdown();
                console.info('📦 [CLIENT] Institution Result:', instResult);
                if (instResult.success && instResult.data) {
                    setInstitutions(instResult.data);
                }

                const result = await getStaffUserCreationOnload(2); // Page ID 2 as per legacy code
                console.info('📦 [CLIENT] Onload Result:', result.success ? 'Success' : 'Failed');
                if (result.success && result.data) {
                    setOnloadData(result.data);
                    // Institutions are now handled by dedicated API above
                    if (result.data.fillstaff) setStaffList(result.data.fillstaff);
                    if (result.data.fillcategory) setCategories(result.data.fillcategory);
                    if (result.data.fillmodule) setModules(result.data.fillmodule);
                }
            } catch (error) {
                console.error('❌ [CLIENT] fetchOnload error:', error);
            } finally {
                setIsOnloadLoading(false);
            }
        };
        fetchOnload();
    }, []);

    useEffect(() => {
        const handleInstitutionChange = async () => {
            if (watchInstitution) {
                // Clear dependent states
                methods.setValue('staffId', '');
                methods.setValue('userName', '');

                const selectedRole = roleTypes.find((r) => String(r.ivrmrT_Id) === watchRoleType);
                const roleName = selectedRole?.ivrmrT_Role || '';
                const isStaff = !(roleName.toUpperCase() === 'ADMIN' || roleName.toUpperCase() === 'SUPER ADMIN');

                const payload = {
                    MI_Id: Number(watchInstitution),
                    rolenamess: roleName,
                    IVRMRT_Id: Number(watchRoleType),
                    multipleinsti: [],
                    flag: isStaff ? 'S' : 'A'
                };

                // Specifically for Category Dropdown API as requested
                console.info(`📡 [CLIENT] Fetching categories for MI_Id: ${watchInstitution}`);
                setIsCategoriesLoading(true);
                const categoryResult = await getCategoryDropdownByInstitution(Number(watchInstitution));
                if (categoryResult.success && categoryResult.data) {
                    setCategories(categoryResult.data);
                }
                setIsCategoriesLoading(false);

                // Specifically for Module Dropdown API as requested
                console.info(`📡 [CLIENT] Fetching modules for MI_Id: ${watchInstitution}`);
                setIsModulesLoading(true);
                const moduleResult = await getModuleDropdownByInstitution(Number(watchInstitution));
                if (moduleResult.success && moduleResult.data) {
                    setModules(moduleResult.data);
                }
                setIsModulesLoading(false);

                // Specifically for Individual mode, use the dedicated Staff Dropdown API as requested
                if (watchFilterData === 'Single') {
                    console.info(`📡 [CLIENT] Fetching individual staff for MI_Id: ${watchInstitution}`);
                    setIsStaffListLoading(true);
                    const staffResult = await getStaffDropdownByInstitution(Number(watchInstitution));
                    if (staffResult.success && staffResult.data) {
                        setStaffList(staffResult.data);
                    }
                    setIsStaffListLoading(false);
                }

                // Specifically for Multiple mode, use the dedicated Multiple Staff Users API as requested
                else if (watchFilterData === 'Multiple') {
                    console.info(`📡 [CLIENT] Fetching multiple staff users for MI_Id: ${watchInstitution}`);
                    setIsStaffListLoading(true);
                    const staffResult = await getMultipleStaffUsers(Number(watchInstitution));
                    if (staffResult.success && staffResult.data) {
                        setStaffList(staffResult.data);
                    }
                    setIsStaffListLoading(false);
                }
            } else {
                setStaffList([]);
                setCategories([]);
                setModules([]);
                setExistingUsers([]);
            }
        };
        handleInstitutionChange();
    }, [watchInstitution, watchRoleType, watchFilterData, methods, roleTypes]);

    const handleViewAdminUsernames = async () => {
        if (!watchInstitution || !watchRoleType) return;

        const selectedRole = roleTypes.find((r) => String(r.ivrmrT_Id) === watchRoleType);
        const roleName = selectedRole?.ivrmrT_Role || '';
        const roleFlag = selectedRole?.flag || '';

        try {
            console.info(`📡 [CLIENT] Fetching Admin Usernames for MI_Id: ${watchInstitution}`);
            const result = await getAdminUserList(
                Number(watchInstitution),
                roleFlag || 'A', // Fallback to 'A' if flag missing
                Number(watchRoleType),
                roleName
            );

            if (result.success && result.data) {
                setExistingUsers(result.data);
                setIsViewModalOpen(true);
            } else {
                toast.error(result.message || 'No users found.');
            }
        } catch (error) {
            console.error('handleViewAdminUsernames error:', error);
            toast.error('Failed to fetch admin usernames.');
        }
    };

    useEffect(() => {
        const handleStaffChange = async () => {
            if (watchStaffId && watchFilterData === 'Single') {
                try {
                    setIsStaffDataLoading(true);
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
                    }

                    // Call the new API to fetch username and handle field state
                    console.info(`📡 [CLIENT] Fetching staff username for StaffId: ${watchStaffId}, MI_Id: ${watchInstitution}. role_id: ${watchRoleType}`);
                    const usernameResult = await getUsernameOnStaffSelection(Number(watchStaffId), Number(watchInstitution), Number(watchRoleType));
                    console.log(' Username Result:', usernameResult);
                    if (usernameResult.success && usernameResult.data && usernameResult.data.length > 0) {
                        const userData = usernameResult.data[0];
                        const staffUsername = userData.user_Name || userData.userName;
                        if (staffUsername) {
                            methods.setValue('userName', staffUsername);
                            setUserId(userData.userId || userData.ivrmu_Id || null);
                            setStaffMobileNo(userData.hrmE_MobileNo || '');
                            setIsUserNameDisabled(true);

                            // Fetch mapping data for the grids (except Master Page List which is now handled by dedicated API)
                            console.info(`📡 [CLIENT] Fetching mapping data for StaffId: ${watchStaffId}`);
                            const mappingResult = await getStaffData({
                                HRME_Id: Number(watchStaffId),
                                MI_Id: Number(watchInstitution),
                                IVRMRT_Id: Number(watchRoleType)
                            });

                            if (mappingResult.success && mappingResult.data) {
                                // setMobilePages(mappingResult.data.gridview1 || []); // Now handled by fetchMobileMasterPages
                                // setSavedGrid(mappingResult.data.savedgridd || []); // Now handled by fetchSavedListPages
                                // setSavedMobilePages(mappingResult.data.previousgrid || []); // Now handled by fetchSavedMobilePages
                            }

                            // Grid fetch calls removed from here to separate useEffect hooks
                        } else {
                            methods.setValue('userName', '');
                            setIsUserNameDisabled(false);
                            clearGrids();
                        }
                    } else {
                        methods.setValue('userName', '');
                        setIsUserNameDisabled(false);
                        clearGrids();
                    }
                } catch (error) {
                    console.error('handleStaffChange error:', error);
                } finally {
                    setIsStaffDataLoading(false);
                }
            } else {
                setIsUserNameDisabled(false);
            }
        };
        handleStaffChange();
    }, [
        watchStaffId,
        watchFilterData,
        watchInstitution,
        watchRoleType,
        methods
    ]);

    useEffect(() => {
        if (watchStaffId && watchInstitution && watchRoleType && watchFilterData === 'Single') {
            fetchMasterPages(webPageParams);
        }
    }, [webPageParams, watchStaffId, watchInstitution, watchRoleType, watchFilterData]);

    useEffect(() => {
        if (watchStaffId && watchInstitution && watchRoleType && watchFilterData === 'Single') {
            fetchMobileMasterPages(mobilePageParams);
        }
    }, [mobilePageParams, watchStaffId, watchInstitution, watchRoleType, watchFilterData]);

    useEffect(() => {
        if (watchStaffId && watchInstitution && watchRoleType && watchFilterData === 'Single') {
            fetchSavedMobilePages(savedMobilePageParams);
        }
    }, [savedMobilePageParams, watchStaffId, watchInstitution, watchRoleType, watchFilterData]);

    useEffect(() => {
        if (watchStaffId && watchInstitution && watchRoleType && watchFilterData === 'Single') {
            fetchSavedListPages(savedGridParams);
        }
    }, [savedGridParams, watchStaffId, watchInstitution, watchRoleType, watchFilterData]);

    const fetchMasterPages = async (params: ApiSearchparams) => {
        if (!watchStaffId || !watchInstitution || !watchRoleType) return;
        try {
            setIsWebPageLoading(true);
            console.info(
                `📡 [CLIENT] Fetching Master Page List for StaffId: ${watchStaffId}, MI_Id: ${watchInstitution}, RoleId: ${watchRoleType}`
            );
            const result = await getMasterPageListGridOnChangeOfStaff(
                Number(watchStaffId),
                Number(watchInstitution),
                Number(watchRoleType),
                params
            );

            console.log("master web pages list",result)

            if (result.success && result.data) {
                const mappedPages = Array.isArray(result.data)
                    ? result.data.map((item: any) => ({
                        pageMappingId: item.pageMappingId || item.ivrmimP_Id || item.ivrmmP_Id || item.ivrmP_Id,
                        pageName: item.pageName || item.pageName,
                        moduleName: item.moduleName || item.ivrmM_ModuleName || item.moduleName || '',
                        institutionName: item.institutionName || item.instituteName || item.institutionName || '',
                        addFlag: Boolean(item.ivrmrP_AddFlag ?? item.addFlag),
                        deleteFlag: Boolean(item.ivrmrP_DeleteFlag ?? item.deleteFlag),
                        updateFlag: Boolean(item.ivrmrP_UpdateFlag ?? item.updateFlag),
                        processFlag: Boolean(item.ivrmrP_ProcessFlag ?? item.processFlag),
                        reportFlag: Boolean(item.ivrmrP_ReportFlag ?? item.reportFlag),
                        checked: stagedWebPages.some((s) => s.pageMappingId === (item.ivrmmP_Id || item.pageMappingId))
                    }))
                    : [];

                setWebPages(mappedPages);
                setWebPageTotal(result.total);
            }
        } catch (error) {
            console.error('fetchMasterPages error:', error);
            toast.error('Failed to fetch web pages.');
        } finally {
            setIsWebPageLoading(false);
        }
    };

    const fetchMobileMasterPages = async (params: ApiSearchparams) => {
        if (!watchStaffId || !watchInstitution || !watchRoleType) return;
        try {
            setIsMobilePageLoading(true);
            console.info(
                `📡 [CLIENT] Fetching Mobile App Master Page List for StaffId: ${watchStaffId}, MI_Id: ${watchInstitution}, RoleId: ${watchRoleType}`
            );
            const result = await getMobileAppMasterPageListOnChangeOfStaff(
                Number(watchStaffId),
                Number(watchInstitution),
                Number(watchRoleType),
                params
            );

            if (result.success && result.data) {
                setMobilePages(result.data.map((p: any) => ({ ...p, checked: false })));
                setMobilePageTotal(result.total);
            }
            console.log(' Mobile Master Pages Result:', result);
        } catch (error) {
            console.error('fetchMobileMasterPages error:', error);
            toast.error('Failed to fetch mobile master pages.');
        } finally {
            setIsMobilePageLoading(false);
        }
    };

    const fetchSavedMobilePages = async (params: ApiSearchparams) => {
        if (!watchStaffId || !watchInstitution || !watchRoleType) return;
        try {
            setIsSavedMobilePageLoading(true);
            console.info(
                `📡 [CLIENT] Fetching Saved Mobile App Page List for StaffId: ${watchStaffId}, MI_Id: ${watchInstitution}, RoleId: ${watchRoleType}`
            );
            const result = await getSavedMobileAppPageListOnChangeOfStaff(
                Number(watchStaffId),
                Number(watchInstitution),
                Number(watchRoleType),
                params
            );

            if (result.success && result.data) {
                setSavedMobilePages(result.data.map((p: any) => ({ ...p, checked: false })));
                setSavedMobilePageTotal(result.total);
            }
        } catch (error) {
            console.error('fetchSavedMobilePages error:', error);
            toast.error('Failed to fetch saved mobile pages.');
        } finally {
            setIsSavedMobilePageLoading(false);
        }
    };

    const fetchSavedListPages = async (params: ApiSearchparams) => {
        if (!watchStaffId || !watchInstitution || !watchRoleType) return;
        try {
            setIsSavedGridLoading(true);
            console.info(
                `📡 [CLIENT] Fetching Saved List for StaffId: ${watchStaffId}, MI_Id: ${watchInstitution}, RoleId: ${watchRoleType}`
            );
            const result = await getSavedListGridOnChangeOfStaff(
                Number(watchStaffId),
                Number(watchInstitution),
                Number(watchRoleType),
                params
            );

            if (result.success && result.data) {
                setSavedGrid(result.data.map((p: any) => ({ ...p, checked: false })));
                setSavedGridTotal(result.total);
            }
        } catch (error) {
            console.error('fetchSavedListPages error:', error);
            toast.error('Failed to fetch saved list pages.');
        } finally {
            setIsSavedGridLoading(false);
        }
    };

    const handleSelectAllCategories = () => {
        const allChecked = categories.every((cat) => cat.catid);
        const updated = categories.map((cat) => ({ ...cat, catid: !allChecked }));
        setCategories(updated);
    };

    const handleSelectAllModules = () => {
        const allChecked = modules.every((mod) => mod.model);
        const updated = modules.map((mod) => ({ ...mod, model: !allChecked }));
        setModules(updated);
    };

    const handleSelectAllStaff = () => {
        const allSelected = staffList.every((s) => s.Selected);
        const updated = staffList.map((s) => ({ ...s, Selected: !allSelected }));
        setStaffList(updated);
    };

    const handleStaffCheckboxChange = (id: number, checked: boolean) => {
        const updated = staffList.map((s) => (s.hrmE_Id === id ? { ...s, Selected: checked } : s));
        setStaffList(updated);
    };

    const handleSelectAllInstitutions = () => {
        const allSelected = institutions.length > 0 && institutions.every((i) => i.Selected);
        const updated = institutions.map((i) => ({ ...i, Selected: !allSelected }));
        setInstitutions(updated);
    };

    const handleInstitutionCheckboxChange = (id: number, checked: boolean) => {
        const updated = institutions.map((i) => (i.mI_Id === id ? { ...i, Selected: checked } : i));
        setInstitutions(updated);
    };

    const handleSendOTP = async () => {
        if (!staffMobileNo) {
            // Fallback or alert if mobile missing
            toast.error('Staff mobile number not found for OTP');
            return false;
        }
        const result = await sendOTPSms(staffMobileNo);
        if (!result.success) {
            toast.error(result.message || 'Failed to send OTP');
        }
        return result.success;
    };

    const handleVerifyOTP = async (otp: string) => {
        const result = await verifyOTP(otp);
        if (!result.success) {
            toast.error(result.message || 'OTP verification failed');
        }
        return result.success;
    };

    const handleUsernameChange = async (newUsername: string) => {
        const payload = {
            curuser: methods.getValues('userName'),
            newuser: newUsername
        };
        const result = await updateUsername(payload);
        if (result.success) {
            methods.setValue('userName', newUsername);
            toast.success(result.message || 'Username updated successfully');
            return true;
        }
        toast.error(result.message || 'Failed to update username');
        return false;
    };

    const onSubmit = async (data: FormValues) => {
        console.log('Form Data:', data);

        const selectedCategories = categories.filter((c) => c.catid).map((c) => ({ amC_Id: c.amC_Id }));
        const selectedModules = modules.filter((m) => m.model).map((m) => ({ ivrmM_Id: m.ivrmM_Id }));

        const selectedRole = roleTypes.find((r) => String(r.ivrmrT_Id) === data.roleType);
        const isAdmin = selectedRole?.ivrmrT_Role.toUpperCase() === 'ADMIN' || selectedRole?.ivrmrT_Role.toUpperCase() === 'SUPER ADMIN';

        let selectedInstitutes = [];
        if (isAdmin && data.filterData === 'Multiple') {
            selectedInstitutes = institutions.filter((i) => i.Selected).map((i) => ({ mi_id: i.mI_Id }));
        } else {
            selectedInstitutes = [{ mi_id: Number(data.institution) }];
        }

        if (selectedInstitutes.length === 0) {
            toast.error('Please select at least one institution');
            return;
        }

        console.log("stagedWebPages:", stagedWebPages);
        console.log("savedGrid:", savedGrid);
        console.log("mobilePages:", mobilePages);
        console.log("savedMobilePages:", savedMobilePages);

        console.log("stagedWebPages in submit:", stagedWebPages);

        const payload = {
            mI_Id: Number(data.institution) || selectedInstitutes[0].mi_id,
            staffId: data.filterData === 'Single' ? Number(data.staffId) : 0,
            userName: data.userName || '',
            mode: data.filterData,
            machineIp: machineIp || '127.0.0.1',
            roleTypeId: Number(data.roleType),
            userId: userId || 0,
            multipleInstitutes: selectedInstitutes,
            tempararyArrayList: selectedModules,
            datasaved: savedGrid
                .filter((p) => !p.checked)
                .map((p) => ({
                    ivrmrP_AddFlag: p.ivrmrP_AddFlag,
                    ivrmrP_DeleteFlag: p.ivrmrP_DeleteFlag,
                    ivrmrP_UpdateFlag: p.ivrmrP_UpdateFlag,
                    ivrmrP_ProcessFlag: p.ivrmrP_ProcessFlag,
                    ivrmrP_ReportFlag: p.ivrmrP_ReportFlag,
                    ivrmstauP_Id: p.ivrmstauP_Id
                })),
            savetmpdata: stagedWebPages.map((p) => ({
                ivrmrP_AddFlag: p.addFlag,
                ivrmrP_DeleteFlag: p.deleteFlag,
                ivrmrP_UpdateFlag: p.updateFlag,
                ivrmrP_ProcessFlag: p.processFlag,
                ivrmrP_ReportFlag: p.reportFlag,
                ivrmimP_Id: p.pageMappingId,
                ivrmP_Id: 0 // Default or if available
            })),
            deletesaved: savedGrid
                .filter((p) => p.checked)
                .map((p) => ({
                    ivrmstauP_Id: p.ivrmstauP_Id
                })),
            savetmpdatamobile: mobilePages
                .filter((p) => p.checked)
                .map((p) => ({
                    ivrmmaP_Id: p.ivrmmaP_Id,
                    ivrmmaP_AddFlg: p.ivrmmaP_AddFlg,
                    ivrmmaP_UpdateFlg: p.ivrmmaP_UpdateFlg,
                    ivrmmaP_DeleteFlg: p.ivrmmaP_DeleteFlg
                })),
            updatemobilepagespre: savedMobilePages
                .filter((p) => !p.checked)
                .map((p) => ({
                    ivrmumalP_Id: p.ivrmumalP_Id,
                    ivrmumalP_AddFlg: p.ivrmumalP_AddFlg,
                    ivrmumalP_UpdateFlg: p.ivrmumalP_UpdateFlg,
                    ivrmumalP_DeleteFlg: p.ivrmumalP_DeleteFlg
                })),
            deletmobile: savedMobilePages
                .filter((p) => p.checked)
                .map((p) => ({
                    ivrmumalP_Id: p.ivrmumalP_Id,
                    ivrmumalP_AddFlg: p.ivrmumalP_AddFlg,
                    ivrmumalP_UpdateFlg: p.ivrmumalP_UpdateFlg,
                    ivrmumalP_DeleteFlg: p.ivrmumalP_DeleteFlg
                }))
        };

        console.log("payload",payload)

        setIsSaving(true);
        try {
            const result = await saveStaffUser(payload);
            if (result.success) {
                toast.success(result.message || 'Saved successfully');
                // Optionally refresh or reset
            } else {
                toast.error(result.message || 'Failed to save staff user privileges');
            }
        } catch (error) {
            console.error('Submit error:', error);
            toast.error('An unexpected error occurred while saving');
        } finally {
            setIsSaving(false);
        }
    };


    const handleModulesChange = (updatedModules: ModuleDTO[]) => {
        setModules(updatedModules);

        const checkedModuleIds = updatedModules
            .filter((mod) => mod.model)
            .map((mod) => mod.ivrmM_Id);

        const uncheckedModuleIds = updatedModules
            .filter((mod) => !mod.model)
            .map((mod) => mod.ivrmM_Id);

        console.log('Checked module IDs:', checkedModuleIds);
        console.log('Unchecked module IDs:', uncheckedModuleIds);

        getPagesBasedOnModules(checkedModuleIds);
    };

    const getPagesBasedOnModules = async (moduleIds: number[]) => {
        if (!watchInstitution || !watchRoleType) return;

        if (moduleIds.length === 0) {
            fetchMasterPages(webPageParams);
            return;
        }

        const selectedInstitutions =
            watchFilterData === 'Multiple'
                ? institutions.filter((i) => i.Selected).map((i) => i.mI_Id)
                : [Number(watchInstitution)];

        const payloadUserName = watchUserName || methods.getValues('userName') || '';
        console.info(`📡 [CLIENT] Fetching pages based on modules: ${moduleIds}`);
        try {
            setIsWebPageLoading(true);
            const result = await getMasterPageListGridOnChangeOfModule(
                payloadUserName,
                Number(watchInstitution),
                Number(watchRoleType),
                moduleIds,
                selectedInstitutions.length > 0 ? selectedInstitutions : [Number(watchInstitution)]
            );

            console.log("onchange result",result)

            if (result.success) {
                const mappedPages = Array.isArray(result.data)
                    ? result.data.map((item: any) => ({
                        pageMappingId: item.ivrmimP_Id || item.ivrmmP_Id || item.ivrmP_Id,
                        pageName: item.ivrmmP_PageName,
                        moduleName: item.ivrmm_ModuleName || item.ivrmM_ModuleName || '',
                        institutionName: item.intname || item.instituteName || '',
                        addFlag: Boolean(item.ivrmrP_AddFlag),
                        deleteFlag: Boolean(item.ivrmrP_DeleteFlag),
                        updateFlag: Boolean(item.ivrmrP_UpdateFlag),
                        processFlag: Boolean(item.ivrmrP_ProcessFlag),
                        reportFlag: Boolean(item.ivrmrP_ReportFlag),
                        checked: false
                    }))
                    : [];

                setWebPages(mappedPages);
                setWebPageTotal(typeof result.total === 'number' ? result.total : mappedPages.length);
            } else {
                setWebPages([]);
                setWebPageTotal(0);
            }
        } catch (error) {
            console.error('getPagesBasedOnModules error:', error);
            setWebPages([]);
            setWebPageTotal(0);
        } finally {
            setIsWebPageLoading(false);
        }
    };

    return (
        <div className='container mx-auto p-6'>
            <Card className='w-full'>
                <CardHeader>
                    <div className='relative flex min-h-[40px] items-center justify-center'>
                        <CardTitle className='text-center font-bold text-2xl text-primary'>Institution Staff User Creation</CardTitle>
                        <div className='absolute right-0'>
                            <Button
                                type='button'
                                variant='outline'
                                size='sm'
                                onClick={handleReload}
                                className='rounded-full border-[#2669bc] text-[#2669bc] hover:bg-blue-50'
                                title='Reload Settings'>
                                <RotateCcw className='mr-2 h-3.5 w-3.5' />
                                Reload
                            </Button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <FormProvider {...methods}>
                        <form onSubmit={methods.handleSubmit(onSubmit)} className='space-y-8'>
                            <SelectionForm
                                roleTypes={roleTypes}
                                trusts={trusts}
                                institutions={institutions}
                                staffList={staffList}
                                isOnloadLoading={isOnloadLoading}
                                isStaffListLoading={isStaffListLoading}
                                isStaffDataLoading={isStaffDataLoading}
                                onStaffCheckboxChange={handleStaffCheckboxChange}
                                onSelectAllStaff={handleSelectAllStaff}
                                onInstitutionCheckboxChange={handleInstitutionCheckboxChange}
                                onSelectAllInstitutions={handleSelectAllInstitutions}
                                onViewUsernames={handleViewAdminUsernames}
                                showViewUsernames={true} // Visibility now handled inside SelectionForm based on isAdmin
                            />

                            <UserDetails
                                categories={categories}
                                onCategoryChange={setCategories}
                                modules={modules}
                                onModuleChange={handleModulesChange}
                                onSelectAllCategories={handleSelectAllCategories}
                                onSelectAllModules={handleSelectAllModules}
                                isUserNameDisabled={isUserNameDisabled}
                                onChangeUsernameToggle={() => setIsChangeModalOpen(true)}
                            />

                            {/* Conditional Rendering of Mapping Grids */}
                            {isUserNameDisabled && watchFilterData === 'Single' && (
                                <PageMappingGrids
                                    webPages={webPages}
                                    onWebPageUpdate={setWebPages}
                                    stagedWebPages={stagedWebPages}
                                    onStagedWebPageUpdate={setStagedWebPages}
                                    webPageTotal={webPageTotal}
                                    onWebPageParamsChange={setWebPageParams}
                                    currentWebPageParams={webPageParams}
                                    isWebPageLoading={isWebPageLoading}
                                    savedGridTotal={savedGridTotal}
                                    onSavedGridParamsChange={setSavedGridParams}
                                    currentSavedGridParams={savedGridParams}
                                    isSavedGridLoading={isSavedGridLoading}
                                    mobilePageTotal={mobilePageTotal}
                                    onMobilePageParamsChange={setMobilePageParams}
                                    currentMobilePageParams={mobilePageParams}
                                    isMobilePageLoading={isMobilePageLoading}
                                    savedMobilePageTotal={savedMobilePageTotal}
                                    onSavedMobilePageParamsChange={setSavedMobilePageParams}
                                    currentSavedMobilePageParams={savedMobilePageParams}
                                    isSavedMobilePageLoading={isSavedMobilePageLoading}
                                    mobilePages={mobilePages}
                                    onMobilePageUpdate={setMobilePages}
                                    savedGrid={savedGrid}
                                    onSavedGridUpdate={setSavedGrid}
                                    savedMobilePages={savedMobilePages}
                                    onSavedMobileUpdate={setSavedMobilePages}
                                    showInstitution={!!watchTrust}
                                />
                            )}

                            <div className='flex justify-center gap-4'>
                                <Button type='submit' className='px-8 shadow-md' size='lg' disabled={isSaving}>
                                    {isSaving ? (
                                        <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                                    ) : (
                                        <Save className='mr-2 h-4 w-4' />
                                    )}
                                    {isSaving ? "Saving..." : "Save"}
                                </Button>
                                <Button type='button' variant='outline' onClick={() => methods.reset()} className='px-8' size='lg'>
                                    <X className='mr-2 h-4 w-4' />
                                    Cancel
                                </Button>
                            </div>
                        </form>
                    </FormProvider>
                </CardContent>
            </Card>

            <ViewUsernamesModal
                isOpen={isViewModalOpen}
                onClose={() => setIsViewModalOpen(false)}
                users={existingUsers}
                roleName={roleTypes.find((r) => String(r.ivrmrT_Id) === watchRoleType)?.ivrmrT_Role}
            />

            <ChangeUsernameModal
                isOpen={isChangeModalOpen}
                onClose={() => setIsChangeModalOpen(false)}
                currentUsername={methods.getValues('userName') || ''}
                onUsernameChange={handleUsernameChange}
                onSendOTP={handleSendOTP}
                onVerifyOTP={handleVerifyOTP}
            />
        </div>
    );
}
