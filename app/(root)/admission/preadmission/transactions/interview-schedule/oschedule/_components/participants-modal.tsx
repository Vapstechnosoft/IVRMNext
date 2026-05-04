'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { useUpdateParticipants, useOralTestScheduleDetails } from '@/hooks/admission/preadmission/transactions/use-oral-test-schedule';
import { IOralTestSchedule } from '@/types/admission/preadmission/transactions/oral-test-schedule';
import { useState, useEffect } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { MultiSelect } from '@/components/ui/multi-select';
import { Loader2, Save, X } from 'lucide-react';
import { toast } from 'sonner';

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
    const [selectedStaffIds, setSelectedStaffIds] = useState<string[]>([]);

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
                        <div className="space-y-2 animate-in fade-in slide-in-from-top-1">
                            <Label className="text-sm font-semibold">Select Staff Members</Label>
                            <MultiSelect
                                options={staffOptions}
                                defaultValue={selectedStaffIds}
                                onValueChange={setSelectedStaffIds}
                                placeholder="Select staff..."
                                maxCount={5}
                            />
                        </div>
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
