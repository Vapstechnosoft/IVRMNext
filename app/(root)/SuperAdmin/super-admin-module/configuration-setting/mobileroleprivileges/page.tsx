'use client';

import { useEffect, useState, useCallback } from 'react';
import { MobileRolePrivilegesSelectionForm } from './_components/selection-form';
import { MasterPagesGrid } from './_components/master-pages-grid';
import { PrivilegesGrid } from './_components/privileges-grid';
import { MobileRolePrivilegeListGrid } from './_components/mobile-role-privilege-list-grid';
import { MasterPagesGlobalGrid } from './_components/master-pages-global-grid';
import { getOnLoadData, getPages, savePrivileges, deletePrivilege, getOnLoadGrid, getMasterPagesGlobalGrid } from '@/server/super-admin/configuration-setting/mobileroleprivileges';
import type { InstitutionDropdown, RoleDropdown, IMobileRolePrivilege, IMobilePrivilegeRecord, IMasterPageRecord } from '@/types/super-admin/configuration-setting/mobileroleprivileges';
import { toast } from 'sonner';
import { Loader2, Save, RefreshCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { parseAsInteger, parseAsString, useQueryState } from 'nuqs';
import { tableSearchVariables } from '@/lib/data-table.config';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function MobileRolePrivilegesPage() {
    const [institutions, setInstitutions] = useState<InstitutionDropdown[]>([]);
    const [roles, setRoles] = useState<RoleDropdown[]>([]);
    const [isInitLoading, setIsInitLoading] = useState(true);
    const [isSearchLoading, setIsSearchLoading] = useState(false);
    const [isActionLoading, setIsActionLoading] = useState(false);

    // Selection State
    const [selectedMI, setSelectedMI] = useState<number | null>(null);
    const [selectedRole, setSelectedRole] = useState<number | null>(null);

    // Grid State
    const [availablePages, setAvailablePages] = useState<IMobileRolePrivilege[]>([]);
    const [savedPrivileges, setSavedPrivileges] = useState<IMobileRolePrivilege[]>([]);
    const [cartPrivileges, setCartPrivileges] = useState<IMobileRolePrivilege[]>([]);

    // --- Main List Grid State (URL Synced) ---
    const [gridRecords, setGridRecords] = useState<IMobilePrivilegeRecord[]>([]);
    const [totalRecords, setTotalRecords] = useState(0);
    const [isGridLoading, setIsGridLoading] = useState(false);

    const [page] = useQueryState(tableSearchVariables.page, parseAsInteger.withDefault(1));
    const [pageSize] = useQueryState(tableSearchVariables.page_size, parseAsInteger.withDefault(10));
    const [search] = useQueryState(tableSearchVariables.search, parseAsString.withDefault(''));

    // --- Global Master Pages Grid State (URL Synced) ---
    const [masterGlobalRecords, setMasterGlobalRecords] = useState<IMasterPageRecord[]>([]);
    const [masterGlobalTotal, setMasterGlobalTotal] = useState(0);
    const [isMasterGlobalLoading, setIsMasterGlobalLoading] = useState(false);

    const [mpPage] = useQueryState('mp_page', parseAsInteger.withDefault(1));
    const [mpPageSize] = useQueryState('mp_page_size', parseAsInteger.withDefault(10));
    const [mpSearch] = useQueryState('mp_search', parseAsString.withDefault(''));

    // Deletion Confirmation State
    const [rowToDelete, setRowToDelete] = useState<any | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    // Fetch Main Grid Data
    const fetchGridData = useCallback(async (p: number, ps: number, s: string = '') => {
        setIsGridLoading(true);
        try {
            const res = await getOnLoadGrid(p, ps, s);
            if (res.success) {
                setGridRecords(res.data);
                setTotalRecords(res.total);
            }
        } catch (error) {
            console.error('Grid fetch error:', error);
        } finally {
            setIsGridLoading(false);
        }
    }, []);

    // Fetch Global Master Pages Data
    const fetchMasterGlobalData = useCallback(async (p: number, ps: number, s: string = '') => {
        setIsMasterGlobalLoading(true);
        try {
            const res = await getMasterPagesGlobalGrid(p, ps, s);
            if (res.success) {
                setMasterGlobalRecords(res.data);
                setMasterGlobalTotal(res.total);
            }
        } catch (error) {
            console.error('Global master pages fetch error:', error);
        } finally {
            setIsMasterGlobalLoading(false);
        }
    }, []);

    // Initial load & Grid refresh on state change
    useEffect(() => {
        const loadInitialData = async () => {
            if (isInitLoading) {
                try {
                    const res = await getOnLoadData();
                    if (res.success) {
                        setInstitutions(res.institutions);
                        setRoles(res.roles);
                    }
                } catch (error) {
                    console.error('Initialization error:', error);
                } finally {
                    setIsInitLoading(false);
                }
            }

            // Always fetch list grid data when its params change
            fetchGridData(page, pageSize, search);
        };

        loadInitialData();
    }, [page, pageSize, search, fetchGridData, isInitLoading]);

    // Separate effect for Global Master Pages to avoid redundant calls
    useEffect(() => {
        if (!isInitLoading) {
            fetchMasterGlobalData(mpPage, mpPageSize, mpSearch);
        }
    }, [mpPage, mpPageSize, mpSearch, fetchMasterGlobalData, isInitLoading]);

    const handleSearch = async (selection: { mI_Id: number; ivrmrT_Id: number }) => {
        setSelectedMI(selection.mI_Id);
        setSelectedRole(selection.ivrmrT_Id);
        setIsSearchLoading(true);
        try {
            const res = await getPages(selection.mI_Id, selection.ivrmrT_Id);
            if (res.success) {
                setAvailablePages(res.availablePages || []);
                setSavedPrivileges(res.savedPrivileges || []);
                setCartPrivileges([]); // Clear cart on new search
                toast.success('Pages loaded successfully');
            }
        } catch (error) {
            console.error('Search error:', error);
        } finally {
            setIsSearchLoading(false);
        }
    };

    const handlePageSelect = (item: IMobileRolePrivilege, isChecked: boolean) => {
        const updatedAvailable = availablePages.map(p =>
            p.ivrmmaP_Id === item.ivrmmaP_Id ? { ...p, checked: isChecked } : p
        );
        setAvailablePages(updatedAvailable);

        if (isChecked) {
            const exists = cartPrivileges.some(c => c.ivrmmaP_Id === item.ivrmmaP_Id);
            if (!exists) {
                setCartPrivileges([...cartPrivileges, {
                    ...item,
                    ivrmrP_Id: 0,
                    ivrmrP_AddFlag: false,
                    ivrmrP_UpdateFlag: false,
                    ivrmrP_DeleteFlag: false,
                    ivrmrP_ReportFlag: false,
                    mI_Id: selectedMI!,
                    ivrmrT_Id: selectedRole!,
                    isNew: true
                }]);
            }
        } else {
            setCartPrivileges(cartPrivileges.filter(c => c.ivrmmaP_Id !== item.ivrmmaP_Id));
        }
    };

    const handleGlobalPageSelect = (item: IMasterPageRecord, isChecked: boolean) => {
        if (!selectedMI || !selectedRole) {
            toast.warning('Please select an Institution and Role first');
            return;
        }

        if (isChecked) {
            const exists = cartPrivileges.some(c => c.ivrmmaP_Id === item.ivrmmaP_Id);
            if (!exists) {
                const newPriv: IMobileRolePrivilege = {
                    ivrmmaP_Id: item.ivrmmaP_Id,
                    ivrmmaP_AppPageName: item.ivrmmaP_AppPageName,
                    ivrmmaP_Displayname: item.ivrmmaP_Displayname,
                    ivrmrP_Id: 0,
                    ivrmrP_AddFlag: false,
                    ivrmrP_UpdateFlag: false,
                    ivrmrP_DeleteFlag: false,
                    ivrmrP_ReportFlag: false,
                    mI_Id: selectedMI,
                    ivrmrT_Id: selectedRole,
                    isNew: true,
                    checked: true
                };
                setCartPrivileges([...cartPrivileges, newPriv]);
                toast.info(`Added ${item.ivrmmaP_AppPageName} to cart`);
            }
        } else {
            setCartPrivileges(cartPrivileges.filter(c => c.ivrmmaP_Id !== item.ivrmmaP_Id));
        }
    };

    const handleRemoveFromCart = (item: IMobileRolePrivilege) => {
        setCartPrivileges(cartPrivileges.filter(c => c.ivrmmaP_Id !== item.ivrmmaP_Id));
        setAvailablePages(availablePages.map(p =>
            p.ivrmmaP_Id === item.ivrmmaP_Id ? { ...p, checked: false } : p
        ));
    };

    const handleSave = async () => {
        if (!selectedMI || !selectedRole) return;
        if (cartPrivileges.length === 0 && savedPrivileges.length === 0) {
            toast.warning('No changes to save');
            return;
        }

        setIsActionLoading(true);
        try {
            // Combine both new and existing privileges for the mapping
            const allPrivileges = [...cartPrivileges, ...savedPrivileges];

            const payload = {
                ivrmrT_Id: selectedRole,
                mI_Id: selectedMI,
                savempdata: allPrivileges.map(p => ({
                    ivrmmaP_Id: p.ivrmmaP_Id,
                    ivrmmaP_AddFlg: p.ivrmrP_AddFlag,
                    ivrmmaP_UpdateFlg: p.ivrmrP_UpdateFlag,
                    ivrmmaP_DeleteFlg: p.ivrmrP_DeleteFlag
                }))
            };

            const res = await savePrivileges(payload);
            if (res.success) {
                toast.success(res.message);
                // Refresh the whole page to reset state
                window.location.reload();
            }
        } catch (error) {
            console.error('Save error:', error);
        } finally {
            setIsActionLoading(false);
        }
    };

    const handleDeleteClick = (row: any) => {
        setRowToDelete(row);
    };

    const confirmDelete = async () => {
        if (!rowToDelete) return;

        setIsDeleting(true);
        try {
            // Determine ID field based on which grid it came from
            const id = rowToDelete.ivrmrmaP_Id || rowToDelete.ivrmrP_Id;
            const res = await deletePrivilege(id);
            if (res.success) {
                toast.success(res.message);
                window.location.reload();
            }
        } catch (error) {
            console.error('Delete error:', error);
        } finally {
            setIsDeleting(false);
            setRowToDelete(null);
        }
    };

    if (isInitLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
                <Loader2 className="w-8 h-8 animate-spin text-[#7C3AED]" />
                <p className="text-muted-foreground animate-pulse font-medium">Initializing Mobile Role Privileges...</p>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-6 space-y-10">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div className="space-y-2">
                    <h1 className="text-4xl font-black tracking-tight text-[#1E293B]">
                        Mobile Role <span className="text-[#7C3AED]">Privileges</span>
                    </h1>
                    <p className="text-slate-500 max-w-2xl font-medium">
                        Securely map institution roles to mobile application pages and define granular access levels.
                    </p>
                </div>
            </div>

            <div className="w-full">
                <MobileRolePrivilegesSelectionForm
                    institutions={institutions}
                    roles={roles}
                    onSubmit={handleSearch}
                    isLoading={isSearchLoading}
                />
            </div>

            {availablePages.length > 0 && (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <MasterPagesGrid
                        data={availablePages}
                        onSelect={handlePageSelect}
                    />
                </div>
            )}

            {savedPrivileges.length > 0 && (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <PrivilegesGrid
                        title="Registered Role Privileges"
                        data={savedPrivileges}
                        onChange={setSavedPrivileges}
                        onDelete={handleDeleteClick}
                    />
                </div>
            )}

            {cartPrivileges.length > 0 && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <PrivilegesGrid
                        title="Selected Master Pages"
                        data={cartPrivileges}
                        onChange={setCartPrivileges}
                        onDelete={handleRemoveFromCart}
                        isCart={true}
                    />
                    <div className="flex justify-center gap-6 py-4">
                        <Button
                            onClick={handleSave}
                            disabled={isActionLoading}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white px-10 h-12 rounded-full font-bold shadow-lg shadow-emerald-200 transition-all hover:scale-105"
                        >
                            {isActionLoading ? <Loader2 className="w-5 h-5 mr-3 animate-spin" /> : <Save className="w-5 h-5 mr-3" />}
                            Save
                        </Button>
                        <Button
                            variant="outline"
                            onClick={() => {
                                setCartPrivileges([]);
                                setAvailablePages(availablePages.map(p => ({ ...p, checked: false })));
                            }}
                            className="h-12 px-10 rounded-full font-bold border-2 hover:bg-slate-50 transition-all"
                        >
                            <RefreshCcw className="w-5 h-5 mr-3" />
                            Reset Selection
                        </Button>
                    </div>
                </div>
            )}


            {selectedMI && selectedRole && (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                    <MasterPagesGlobalGrid
                        data={masterGlobalRecords}
                        totalCount={masterGlobalTotal}
                        onSelect={handleGlobalPageSelect}
                        isLoading={isMasterGlobalLoading}
                    />
                </div>
            )}

            <div className="pt-10 animate-in fade-in slide-in-from-bottom-4 duration-1000">
                <MobileRolePrivilegeListGrid
                    data={gridRecords}
                    totalCount={totalRecords}
                    onDelete={handleDeleteClick}
                    isLoading={isGridLoading}
                />
            </div>

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={!!rowToDelete} onOpenChange={(open) => !open && setRowToDelete(null)}>
                <AlertDialogContent className="border-[#7C3AED]/20 shadow-2xl">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="text-[#1E293B] font-bold">Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription className="text-[#64748B]">
                            This action cannot be undone. This will permanently delete the mapping for
                            <span className="font-bold text-[#7C3AED]"> "{rowToDelete?.ivrmmaP_AppPageName || rowToDelete?.ivrmmaP_AppPageName}"</span>
                            {rowToDelete?.institutename && (
                                <> from <span className="font-semibold text-slate-700">{rowToDelete.institutename}</span></>
                            )}.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel className="border-[#7C3AED] text-[#7C3AED] hover:bg-[#F3E8FF] rounded-full px-6">Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={confirmDelete}
                            disabled={isDeleting}
                            className="bg-red-500 hover:bg-red-600 text-white rounded-full px-8 shadow-lg shadow-red-100 transition-all active:scale-95"
                        >
                            {isDeleting ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Deleting...
                                </>
                            ) : (
                                'Yes, Delete'
                            )}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
