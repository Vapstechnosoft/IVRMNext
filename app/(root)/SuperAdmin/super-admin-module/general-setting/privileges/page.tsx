'use client';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import {
    getRolePrivilegesList,
    savePrivileges,
    searchPages,
    deletePrivilege,
    getRoleDropdown,
    getModuleDropdown
} from '@/server/super-admin/super-admin-module/general-setting/privileges';
import { IPrivilegeData, IPrivilegeModule, IPrivilegePage, IPrivilegeRole, IRolePrivilegeMapping } from '@/types/super-admin/super-admin-module/general-setting/privileges';
import { Search, Save, X, RefreshCcw } from 'lucide-react';
import React, { useEffect, useState, useCallback } from 'react';
import { toast } from 'sonner';
import { MasterPagesGrid } from './_components/master-pages-grid';
import { PrivilegesGrid } from './_components/privileges-grid';
import { RolePrivilegesList } from './_components/role-privileges-list';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { parseAsInteger, parseAsString, useQueryState } from 'nuqs';
import { tableSearchVariables } from '@/lib/data-table.config';

export default function PrivilegesPage() {
    const [roles, setRoles] = useState<IPrivilegeRole[]>([]);
    const [modules, setModules] = useState<IPrivilegeModule[]>([]);

    // Selection State
    const [selectedRoleId, setSelectedRoleId] = useState<string>('');
    const [selectedModuleIds, setSelectedModuleIds] = useState<number[]>([]);

    // Grids State
    const [masterPages, setMasterPages] = useState<IPrivilegePage[]>([]); // Grid 1 (Available)
    const [savedPrivileges, setSavedPrivileges] = useState<IPrivilegeData[]>([]); // Grid 2 (Saved)
    const [cartPrivileges, setCartPrivileges] = useState<IPrivilegeData[]>([]); // Grid 3 (Selected Cart)

    const [rolePrivilegesList, setRolePrivilegesList] = useState<IRolePrivilegeMapping[]>([]); // Grid 4 (OnLoad)
    const [totalPrivilegesList, setTotalPrivilegesList] = useState(0);

    const [isLoading, setIsLoading] = useState(false);
    const [isListLoading, setIsListLoading] = useState(false);

    // Pagination for Grid 4
    const [page, setPage] = useQueryState(
        tableSearchVariables.page,
        parseAsInteger.withOptions({ shallow: false }).withDefault(1)
    );
    const [pageSize, setPageSize] = useQueryState(
        tableSearchVariables.page_size,
        parseAsInteger.withOptions({ shallow: false }).withDefault(10)
    );
    const [searchQuery, setSearchQuery] = useQueryState(
        tableSearchVariables.search,
        parseAsString.withOptions({ shallow: false }).withDefault('')
    );

    const fetchRolePrivilegesList = useCallback(async () => {
        setIsListLoading(true);
        const searchParams: Record<string, any> = {
            page: page,
            page_size: pageSize
        };
        if (searchQuery) {
            searchParams.search_query = searchQuery;
        }
        try {
            const res = await getRolePrivilegesList(searchParams);
            if (res.success) {
                setRolePrivilegesList(res.data || []);
                setTotalPrivilegesList(res.total || 0);
            } else {
                setRolePrivilegesList([]);
                setTotalPrivilegesList(0);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setIsListLoading(false);
        }
    }, [page, pageSize, searchQuery]);

    useEffect(() => {
        const loadInitData = async () => {
            const rolesRes = await getRoleDropdown();
            if (rolesRes.success) {
                setRoles(rolesRes.roles || []);
            }

            const modRes = await getModuleDropdown();
            if (modRes.success) {
                setModules(modRes.modules || []);
            }
        };
        loadInitData();
    }, []);

    useEffect(() => {
        fetchRolePrivilegesList();
    }, [fetchRolePrivilegesList]);

    const handleRoleChange = (roleId: string) => {
        setSelectedRoleId(roleId);
        setMasterPages([]);
        setSavedPrivileges([]);
        setCartPrivileges([]);
    };

    const handleSearch = async () => {
        if (!selectedRoleId || selectedModuleIds.length === 0) {
            toast.error('Please select a Role and at least one Module');
            return;
        }

        setIsLoading(true);
        try {
            const payload = {
                ivrmrT_Id: parseInt(selectedRoleId),
                ivrmM_Id: selectedModuleIds
            };
            const res = await searchPages(payload);
            if (res.success) {
                setMasterPages(res.pages || []);
                setSavedPrivileges(res.savedPrivileges || []);
                setCartPrivileges([]); // Clear cart on new search
                if ((res.pages?.length || 0) === 0 && (res.savedPrivileges?.length || 0) === 0) {
                    toast.info('No records found for selected criteria');
                }
            } else {
                toast.error(res.message || 'Search failed');
            }
        } catch (error: any) {
            console.error(error);
            toast.error(error?.message || 'Search failed');
        } finally {
            setIsLoading(false);
        }
    };

    const handleMasterPageSelect = (item: IPrivilegePage, isChecked: boolean) => {
        // Check if page already exists in savedPrivileges
        const isAlreadySaved = savedPrivileges.some(sp => sp.ivrmmP_Id === item.ivrmmP_Id);
        if (isAlreadySaved) {
            toast.warning('Already this page is saved with Current role and Module..Kindly select other pages');
            return;
        }

        // Update check state in Master Grid
        const updatedMasterPages = masterPages.map(p =>
            p.ivrmmP_Id === item.ivrmmP_Id ? { ...p, checked: isChecked } : p
        );
        setMasterPages(updatedMasterPages);

        if (isChecked) {
            const exists = cartPrivileges.some(c => c.ivrmmP_Id === item.ivrmmP_Id);
            if (!exists) {
                const newPrivilege: IPrivilegeData = {
                    ivrmmP_Id: item.ivrmmP_Id,
                    ivrmmP_PageName: item.ivrmmP_PageName,
                    ivrmrP_AddFlag: false,
                    ivrmrP_DeleteFlag: false,
                    ivrmrP_UpdateFlag: false,
                    ivrmrP_ProcessFlag: false,
                    ivrmrP_ReportFlag: false,
                    isNew: true
                };
                setCartPrivileges([...cartPrivileges, newPrivilege]);
            }
        } else {
            setCartPrivileges(cartPrivileges.filter(c => c.ivrmmP_Id !== item.ivrmmP_Id));
        }
    };

    const handleDeleteFromCart = (item: IPrivilegeData) => {
        setCartPrivileges(cartPrivileges.filter(c => c.ivrmmP_Id !== item.ivrmmP_Id));
        setMasterPages(masterPages.map(p =>
            p.ivrmmP_Id === item.ivrmmP_Id ? { ...p, checked: false } : p
        ));
    };

    const handleSave = async () => {
        if (cartPrivileges.length === 0 && savedPrivileges.length === 0) {
            toast.warning('Nothing to save');
            return;
        }

        setIsLoading(true);
        try {
            const payload = {
                roleId: parseInt(selectedRoleId),
                secondgrid: cartPrivileges,
                previousgrid: savedPrivileges
            };

            const res = await savePrivileges(payload);
            if (res.success) {
                toast.success(res.message);
                setCartPrivileges([]);
                handleSearch();
                fetchRolePrivilegesList(); // Refresh bottom grid
            } else {
                toast.error(res.message);
            }
        } catch (error) {
            toast.error('Save failed');
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeletePrivilege = async (item: IRolePrivilegeMapping) => {
        if (!confirm('Are you sure you want to delete this privilege?')) return;

        try {
            const res = await deletePrivilege(item.ivrmrP_Id);
            if (res.success) {
                toast.success(res.message);
                fetchRolePrivilegesList();
                if (selectedRoleId && selectedModuleIds.length > 0) {
                    handleSearch();
                }
            } else {
                toast.error(res.message);
            }
        } catch (error) {
            toast.error('Delete failed');
        }
    };

    const handleModuleCheck = (id: number, checked: boolean) => {
        if (checked) {
            setSelectedModuleIds([...selectedModuleIds, id]);
        } else {
            setSelectedModuleIds(selectedModuleIds.filter(mId => mId !== id));
        }
    };

    const handleCancel = () => {
        setSelectedRoleId('');
        setSelectedModuleIds([]);
        setMasterPages([]);
        setSavedPrivileges([]);
        setCartPrivileges([]);
    };

    return (
        <div className='container p-4 space-y-6'>
            <div className='p-4 border rounded-md shadow-sm bg-white'>
                <h2 className="text-xl font-semibold mb-4 border-b pb-2">Master Role Privileges</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Role Selection */}
                    <div className="space-y-2">
                        <Label>Role Name <span className="text-red-500">*</span></Label>
                        <Select value={selectedRoleId} onValueChange={handleRoleChange}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select Role" />
                            </SelectTrigger>
                            <SelectContent>
                                {roles.map(role => (
                                    <SelectItem key={role.ivrmrT_Id} value={role.ivrmrT_Id.toString()}>
                                        {role.ivrmrT_Role}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Module Selection */}
                    <div className="space-y-2">
                        <Label>Module Pages <span className="text-red-500">*</span></Label>
                        <div className="border rounded-md p-2 h-40 overflow-y-auto bg-gray-50">
                            {modules.map(mod => (
                                <div key={mod.ivrmM_Id} className="flex items-center space-x-2 mb-2">
                                    <Checkbox
                                        id={`mod-${mod.ivrmM_Id}`}
                                        checked={selectedModuleIds.includes(mod.ivrmM_Id)}
                                        onCheckedChange={(c) => handleModuleCheck(mod.ivrmM_Id, c as boolean)}
                                    />
                                    <Label htmlFor={`mod-${mod.ivrmM_Id}`} className="font-normal cursor-pointer">
                                        {mod.ivrmM_ModuleName}
                                    </Label>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="flex justify-center gap-4 mt-6">
                    <Button onClick={handleSearch} disabled={isLoading} className="bg-blue-600 hover:bg-blue-700">
                        <Search className="w-4 h-4 mr-2" /> Search
                    </Button>
                    <Button variant="destructive" onClick={handleCancel}>
                        <X className="w-4 h-4 mr-2" /> Cancel
                    </Button>
                </div>
            </div>

            {/* Grid 1: Master Pages (Available) */}
            <MasterPagesGrid data={masterPages} onSelect={handleMasterPageSelect} />

            {/* Grid 2: Saved Privileges */}
            {savedPrivileges.length > 0 && (
                <PrivilegesGrid
                    title="Saved Role Privileges"
                    data={savedPrivileges}
                    onChange={setSavedPrivileges}
                />
            )}

            {/* Grid 3: Selected Privileges (Cart) */}
            {cartPrivileges.length > 0 && (
                <div className="animate-in slide-in-from-bottom-2">
                    <PrivilegesGrid
                        title="Selected Master Pages"
                        data={cartPrivileges}
                        onChange={setCartPrivileges}
                        onDelete={handleDeleteFromCart}
                        isCart={true}
                    />
                    <div className="flex justify-center gap-4 mt-4">
                        <Button onClick={handleSave} disabled={isLoading} className="bg-green-600 hover:bg-green-700 w-32">
                            <Save className="w-4 h-4 mr-2" /> Save
                        </Button>
                        <Button variant="outline" onClick={() => setCartPrivileges([])} className="w-32">
                            <RefreshCcw className="w-4 h-4 mr-2" /> Clear
                        </Button>
                    </div>
                </div>
            )}

            {/* Grid 4: Role Privileges List (OnLoad Grid) */}
            <RolePrivilegesList
                data={rolePrivilegesList}
                onDelete={handleDeletePrivilege}
                isLoading={isListLoading}
                totalItems={totalPrivilegesList}
                pagination={{
                    pageIndex: page,
                    pageSize: pageSize || 10,
                    onPageChange: (p) => setPage(p),
                    onPageSizeChange: (s) => setPageSize(s)
                }}
                onSearch={(term) => setSearchQuery(term)}
            />
        </div>
    );
}
