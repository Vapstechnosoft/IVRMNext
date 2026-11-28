'use client';

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle
} from '@/components/ui/alert-dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    deleteMainMenuINS,
    getMainMenuListINS,
    getModuleMenuList,
    saveMainMenuINS
} from '@/server/super-admin/configuration-setting/master-main-menu-ins';
import type { MainMenuModuleDTO, MasterMainMenuINSDTO } from '@/types/super-admin/configuration-setting/master-main-menu-ins';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { FormProvider, useForm, useWatch } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';
import MainMenuGrid from './_components/main-menu-grid';
import ModuleMenuGrid from './_components/module-menu-grid';
import SelectionForm from './_components/selection-form';
const formSchema = z.object({
    institution: z.string().min(1, 'Institution is required'),
    module: z.string().min(1, 'Module is required'),
    roleid: z.string().optional()
});

type FormValues = z.infer<typeof formSchema>;

export default function MasterMainMenuINSPage() {
    const methods = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            institution: '',
            module: ''
        }
    });

    const [gridData, setGridData] = useState<MasterMainMenuINSDTO[]>([]);
    const [moduleMenuData, setModuleMenuData] = useState<MainMenuModuleDTO[]>([]);
    const [activeRequests, setActiveRequests] = useState(0);

    const withLoading = useCallback(async <T,>(request: () => Promise<T>): Promise<T> => {
        setActiveRequests((count) => count + 1);
        try {
            return await request();
        } finally {
            setActiveRequests((count) => count - 1);
        }
    }, []);

    const institutionId = useWatch({
        control: methods.control,
        name: 'institution'
    });

    const moduleId = useWatch({
        control: methods.control,
        name: 'module'
    })

    useEffect(() => {
        const fetchGridData = async () => {
            // Fetch Existing Grid Data
            try {
                const response = await withLoading(() => getMainMenuListINS());
                if (response.success && response.data?.gridDetails) {
                    // Strict deduplication using String(id) to handle mixed types (3 vs "3")
                    const uniqueData = Array.from(
                        new Map(
                            response.data.gridDetails
                                .filter((item) => item && item.ivrmmmI_Id != null)
                                .map((item) => [String(item.ivrmmmI_Id), item])
                        ).values()
                    );

                    if (uniqueData.length !== response.data.gridDetails.length) {
                        console.warn(
                            `Removed ${response.data.gridDetails.length - uniqueData.length} duplicate records from Main Menu Grid`
                        );
                    }
                    setGridData(uniqueData);
                } else {
                    toast.error(response.message || 'Failed to load main menu list');
                }
            } catch (error) {
                console.error('Error in fetchGridData:', error);
                toast.error('Failed to load main menu list');
            }

           
        };
        fetchGridData();
    }, [withLoading]);

    useEffect(() => {
    const fetchModuleMenuList = async () => {
        if (!institutionId || !moduleId) {
            setModuleMenuData([]);
            return;
        }

        try {
            const response = await withLoading(() =>
                getModuleMenuList(Number(institutionId), Number(moduleId))
            );

            if (response.success && response.data?.moduleList) {
                const uniqueData = Array.from(
                    new Map(
                        response.data.moduleList
                            .filter(
                                (item) =>
                                    item &&
                                    item.ivrmmM_Id != null
                            )
                            .map((item) => [
                                String(item.ivrmmM_Id),
                                item
                            ])
                    ).values()
                );

                setModuleMenuData(uniqueData);
            } else {
                setModuleMenuData([]);
                toast.error(response.message || 'Failed to load module menu list');
            }
        } catch (error) {
            console.error(
                'Error fetching Module Menu List:',
                error
            );

            setModuleMenuData([]);
        }
    };

    fetchModuleMenuList();
}, [institutionId, moduleId, withLoading]);
const [deleteTarget, setDeleteTarget] = useState<MasterMainMenuINSDTO | null>(null);
const [isDeleting, setIsDeleting] = useState(false);

    // const handleDelete = async (item: MasterMainMenuINSDTO) => {
    //     if (confirm(`Are you sure you want to delete ${item.ivrmmmI_MenuName}?`)) {
    //         const res = await deleteMainMenuINS(item);
    //         if (res.success) {
    //             toast.success('Deleted successfully');
    //             // Refresh grid
    //             const response = await getMainMenuListINS();
    //             if (response.success && response.data?.gridDetails) {
    //                 setGridData(response.data.gridDetails);
    //             }
    //         } else {
    //             toast.error('Failed to delete: ' + res.message);
    //         }
    //     }
    // };
    // Opens the popup
const handleDelete = (item: MasterMainMenuINSDTO) => {
    setDeleteTarget(item);
};

// Runs when the user confirms in the popup
const confirmDelete = async () => {
    if (!deleteTarget) return;

    setIsDeleting(true);
    try {
        await withLoading(async () => {
            const res = await deleteMainMenuINS(deleteTarget);

            if (res.success) {
                toast.success('Deleted successfully');

                const response = await getMainMenuListINS();
                if (response.success && response.data?.gridDetails) {
                    setGridData(response.data.gridDetails);
                } else {
                    toast.error(response.message || 'Failed to refresh main menu list');
                }
            } else {
                toast.error('Failed to delete: ' + res.message);
            }
        });
    } catch {
        toast.error('Something went wrong while deleting');
    } finally {
        setIsDeleting(false);
        setDeleteTarget(null);
    }
};

    const handleSaveModules = async (items: MainMenuModuleDTO[]) => {
        const institutionId = methods.getValues('institution');
        const moduleId = methods.getValues('module');

        if (!institutionId || !moduleId) {
            toast.error('Please select Institution and Module first.');
            return;
        }

        let successCount = 0;
        let failCount = 0;

        await withLoading(async () => {
            // Save each item individually because the API expects one menu mapping per request.
            for (const item of items) {
                const payload = {
                    ivrmmmI_Id: 0,
                    ivrmM_Id: Number.parseInt(moduleId),
                    mI_Id: Number.parseInt(institutionId),
                    ivrmmmI_MenuName: item.customMenuName || item.modulename,
                    ivrmmmI_Icon: item.selectedIcon || '',
                    ivrmmmI_Color: item.selectedColor || '',
                    selectedMasterMenuDetails: [
                        {
                            ivrmmM_Id: item.ivrmmM_Id,
                            ivrmmmI_MenuName: item.customMenuName || item.modulename
                        }
                    ]
                };

                const res = await saveMainMenuINS(payload);
                if (res.success) {
                    successCount++;
                } else {
                    failCount++;
                    console.error(`Failed to save ${item.modulename}:`, res.message);
                }
            }

            if (successCount > 0) {
                const response = await getMainMenuListINS();
                if (response.success && response.data?.gridDetails) {
                    setGridData(response.data.gridDetails);
                } else {
                    toast.error(response.message || 'Failed to refresh main menu list');
                }
            }
        });

        if (successCount > 0) {
            toast.success(`Saved ${successCount} items successfully.${failCount > 0 ? ` Failed: ${failCount}` : ''}`);
        } else if (failCount > 0) {
            toast.error('Failed to save selected items.');
        }
    };

    const handleClear = () => {
        window.location.reload();
    };

    const handleOrder = () => {
        alert('Set Order functionality coming soon');
    };

    const onSubmit = (data: FormValues) => {
        console.log('Form Request:', data);
        // Implement save or add logic here if required by user later (HTML didn't explicitly show 'Add' button for form, just grid loaded on load?)
        // User request: "on load two dropdown ... and need onload grid also".
        // HTML has no 'Save' button for the form, only 'Set Order' and 'Clear' at bottom of grid.
        // It seems this page might be for viewing/deleting/ordering existing mappings.
    };

    return (
        <div className='container mx-auto p-6'>
            <Card className='w-full'>
                <CardHeader>
                    <CardTitle className='text-center font-bold text-2xl'>Master Main Menu INS</CardTitle>
                </CardHeader>
                <CardContent>
                    <FormProvider {...methods}>
                        <form onSubmit={methods.handleSubmit(onSubmit)} className='space-y-6'>
                            <SelectionForm withLoading={withLoading} />

                            {/* New Module Menu Grid (Selection) */}
                            <ModuleMenuGrid data={moduleMenuData} onSave={handleSaveModules} onCancel={handleClear} />

                            {/* Existing Saved Grid */}
                            {gridData.length > 0 && (
                                <MainMenuGrid data={gridData} onDelete={handleDelete} onOrder={handleOrder} onClear={handleClear} />
                            )}
                            {gridData.length === 0 && <div className='p-4 text-center text-gray-500'>No records found.</div>}
                        </form>
                    </FormProvider>
                </CardContent>
            </Card>

            {activeRequests > 0 && (
                <output
                    className='fixed inset-0 z-[100] flex items-center justify-center bg-background/50'
                    aria-live='polite'>
                    <span className='flex items-center gap-3 rounded-md border bg-background px-5 py-4 shadow-lg'>
                        <Loader2 className='h-6 w-6 animate-spin text-primary' />
                        <span className='font-medium'>Loading...</span>
                    </span>
                </output>
            )}

<AlertDialog
    open={!!deleteTarget}
    onOpenChange={(open) => {
        if (!open && !isDeleting) setDeleteTarget(null);
    }}
>
    <AlertDialogContent>
        <AlertDialogHeader>
            <AlertDialogTitle>Delete menu?</AlertDialogTitle>
            <AlertDialogDescription>
                Are you sure you want to delete{' '}
                <span className="font-semibold">{deleteTarget?.ivrmmmI_MenuName}</span>?
                This action cannot be undone.
            </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
                disabled={isDeleting}
                onClick={(e) => {
                    e.preventDefault(); // keep the dialog open until the request finishes
                    confirmDelete();
                }}
                className="bg-red-600 hover:bg-red-700"
            >
                {isDeleting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
        </AlertDialogFooter>
    </AlertDialogContent>
</AlertDialog>
        </div>
    );
}
