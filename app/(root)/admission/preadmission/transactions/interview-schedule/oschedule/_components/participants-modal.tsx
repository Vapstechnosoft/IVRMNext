'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { useUpdateParticipants, useOralTestScheduleDetails } from '@/hooks/admission/preadmission/transactions/use-oral-test-schedule';
import { IOralTestSchedule, IStaffDetails } from '@/types/admission/preadmission/transactions/oral-test-schedule';
import { useState, useEffect } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Loader2, Save, X, Search } from 'lucide-react';
import { toast } from 'sonner';
import { GenericDataTable } from '@/components/ui/data-table/generic-data-table';
import { DataTableColumnHeader } from '@/components/ui/data-table-column-header';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';

interface ParticipantsModalProps {
    rowData: IOralTestSchedule;
    isOpen: boolean;
    onClose: () => void;
}

export default function ParticipantsModal({ rowData, isOpen, onClose }: ParticipantsModalProps) {
    const { data: details } = useOralTestScheduleDetails() as any;
    const { mutate: updateParticipants, isPending: isUpdating } = useUpdateParticipants();

    const [flags, setFlags] = useState({
        staffMapping: false,
        principalMapping: false,
        managerMapping: false,
        anybodyCanStart: false,
    });
    const [selectedStaffIds, setSelectedStaffIds] = useState<number[]>([]);
    const [staffSearch, setStaffSearch] = useState('');

    // Initialize from rowData if available
    useEffect(() => {
        if (isOpen && rowData) {
            setFlags({
                staffMapping: (rowData as any).paotS_StaffMapping || false,
                principalMapping: (rowData as any).paotS_PrincipalMapping || false,
                managerMapping: (rowData as any).paotS_ManagerMapping || false,
                anybodyCanStart: (rowData as any).paotS_AnybodyCanStart || false,
            });
            // We might need an API call to get currently mapped staff if rowData doesn't have it
        }
    }, [isOpen, rowData]);

    const staffOptions = details?.stafflist?.map((s: any) => ({
        label: `${s.hrmE_EmployeeFirstName} ${s.hrmE_EmployeeMiddleName || ''} ${s.hrmE_EmployeeLastName || ''}`,
        value: String(s.hrmE_Id)
    })) || [];

    const handleSave = () => {
        const payload = {
            PAOTS_Id: rowData.paotS_Id,
            checkadd: 'SV',
            staffmapping: flags.staffMapping,
            principalmapping: flags.principalMapping,
            managermapping: flags.managerMapping,
            anybodycanstart: flags.anybodyCanStart,
            stfids: selectedStaffIds.map(Number),
        };

        updateParticipants(payload, {
            onSuccess: () => onClose()
        });
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle className="text-xl font-bold text-blue-800">Update Participants</DialogTitle>
                    <DialogDescription>
                        Manage staff and permission flags for: {rowData.paotS_ScheduleName}
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6 py-4">
                    <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-lg border border-slate-100">
                        <div className="flex items-center space-x-2">
                            <Checkbox 
                                id="staffMapping" 
                                checked={flags.staffMapping} 
                                onCheckedChange={(val: any) => setFlags({...flags, staffMapping: !!val})}
                            />
                            <Label htmlFor="staffMapping" className="text-sm font-medium leading-none cursor-pointer">
                                Staff Mapping
                            </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <Checkbox 
                                id="principalMapping" 
                                checked={flags.principalMapping} 
                                onCheckedChange={(val: any) => setFlags({...flags, principalMapping: !!val})}
                            />
                            <Label htmlFor="principalMapping" className="text-sm font-medium leading-none cursor-pointer">
                                Principal Mapping
                            </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <Checkbox 
                                id="managerMapping" 
                                checked={flags.managerMapping} 
                                onCheckedChange={(val: any) => setFlags({...flags, managerMapping: !!val})}
                            />
                            <Label htmlFor="managerMapping" className="text-sm font-medium leading-none cursor-pointer">
                                Manager Mapping
                            </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <Checkbox 
                                id="anybodyCanStart" 
                                checked={flags.anybodyCanStart} 
                                onCheckedChange={(val: any) => setFlags({...flags, anybodyCanStart: !!val})}
                            />
                            <Label htmlFor="anybodyCanStart" className="text-sm font-medium leading-none cursor-pointer">
                                Anybody can start
                            </Label>
                        </div>
                    </div>

                    {flags.staffMapping && (
                        <Card className="border-blue-100 overflow-hidden">
                            <div className="bg-blue-800 px-4 py-2 flex items-center justify-between">
                                <h3 className="text-white font-bold text-[10px] uppercase">Staff Participants</h3>
                                <div className="relative w-40">
                                    <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-blue-200" />
                                    <Input 
                                        placeholder="Search..." 
                                        className="h-6 pl-7 text-[10px] bg-blue-700/50 border-blue-600 text-white placeholder:text-blue-300"
                                        value={staffSearch}
                                        onChange={(e) => setStaffSearch(e.target.value)}
                                    />
                                </div>
                            </div>
                            <div className="max-h-[300px] overflow-auto [&_thead_tr_th]:text-black [&_thead_tr_th]:font-bold [&_thead_tr_th]:py-2 [&_thead_tr_th]:text-[10px] [&_thead_tr_th_button]:hover:bg-transparent [&_thead_tr_th_button]:hover:text-black [&_tbody_tr:nth-child(even)]:bg-slate-50">
                                <GenericDataTable<IStaffDetails>
                                    data={details?.stafflist?.filter((s: any) => 
                                        `${s.hrmE_EmployeeFirstName} ${s.hrmE_EmployeeMiddleName || ''} ${s.hrmE_EmployeeLastName || ''}`
                                        .toLowerCase().includes(staffSearch.toLowerCase())
                                    ) || []}
                                    columns={[
                                        {
                                            id: 'slno',
                                            header: ({ column }) => <DataTableColumnHeader column={column} title="SL.NO" />,
                                            cell: ({ row }) => row.index + 1,
                                            size: 40,
                                        },
                                        {
                                            accessorKey: 'hrmE_EmployeeFirstName',
                                            header: ({ column }) => <DataTableColumnHeader column={column} title="Staff Name" />,
                                            cell: ({ row }) => `${row.original.hrmE_EmployeeFirstName} ${row.original.hrmE_EmployeeMiddleName || ''} ${row.original.hrmE_EmployeeLastName || ''}`,
                                        },
                                        {
                                            id: 'select',
                                            header: ({ column }) => <DataTableColumnHeader column={column} title="Action" />,
                                            cell: ({ row }) => (
                                                <Checkbox 
                                                    checked={selectedStaffIds.includes(row.original.userid)}
                                                    onCheckedChange={(checked) => {
                                                        if (checked) {
                                                            setSelectedStaffIds(prev => [...new Set([...prev, row.original.userid])]);
                                                        } else {
                                                            setSelectedStaffIds(prev => prev.filter(id => id !== row.original.userid));
                                                        }
                                                    }}
                                                />
                                            ),
                                            size: 60,
                                        }
                                    ]}
                                    isLoading={false}
                                    isSearchRequired={false}
                                />
                            </div>
                        </Card>
                    )}
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t">
                    <Button variant="outline" onClick={onClose} disabled={isUpdating}>
                        Cancel
                    </Button>
                    <Button onClick={handleSave} disabled={isUpdating}>
                        {isUpdating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                        Update Participants
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
