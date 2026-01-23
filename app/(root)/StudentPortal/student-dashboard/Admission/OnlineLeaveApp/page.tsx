'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useSession } from 'next-auth/react';
import LeaveApplicationForm from './_components/leave-application-form';
import LeaveDetailsGrid from './_components/leave-details-grid';
import {
    getLeaveLoadData,
    applyLeave,
    cancelLeave
} from './actions';
import { LeaveApplication, StudentDetails } from './types';

export default function OnlineLeaveAppPage() {
    const { status } = useSession();
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [student, setStudent] = useState<StudentDetails | null>(null);
    const [leaveApplications, setLeaveApplications] = useState<LeaveApplication[]>([]);
    const [editingLeave, setEditingLeave] = useState<LeaveApplication | null>(null);

    const loadInitialData = async () => {
        setIsLoading(true);
        try {
            const result = await getLeaveLoadData();
            if (result) {
                if (result.studentdetails && result.studentdetails.length > 0) {
                    setStudent(result.studentdetails[0]);
                }
                if (result.allstuddata) {
                    setLeaveApplications(result.allstuddata);
                }
            }
        } catch (error) {
            console.error("Failed to load initial data", error);
            toast.error("Failed to load leave data");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (status !== 'loading') {
            loadInitialData();
        }
    }, [status]);

    const handleApplyLeave = async (data: any) => {
        setIsSubmitting(true);
        try {
            const payload = {
                ASLA_Id: data.aslA_Id,
                ASLA_ApplyDate: new Date().toISOString(),
                ASLA_FromDate: data.aslA_FromDate.toISOString(),
                ASLA_ToDate: data.aslA_ToDate.toISOString(),
                ASLA_Flag: data.aslA_Flag,
                ASLA_LeaveId: data.aslA_LeaveId ? parseInt(data.aslA_LeaveId) : 0,
                ASLA_Reason: data.aslA_Reason,
            };

            await applyLeave(payload);
            toast.success(data.aslA_Id > 0 ? "Leave updated successfully!" : "Leave applied successfully!");

            // Refresh data
            await loadInitialData();
            setEditingLeave(null);

        } catch (error) {
            console.error("Failed to apply leave", error);
            toast.error("Failed to apply leave");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCancelLeave = async (leave: LeaveApplication) => {
        if (!leave.aslA_Id) return;

        // Optimistic update
        const previousLeaves = [...leaveApplications];
        setLeaveApplications(prev => prev.map(l =>
            l.aslA_Id === leave.aslA_Id ? { ...l, aslA_Status: 'Cancelled' } : l
        ));

        try {
            await cancelLeave(leave.aslA_Id);
            toast.success("Leave cancelled successfully");
        } catch (error) {
            // Revert on failure
            setLeaveApplications(previousLeaves);
            console.error("Failed to cancel leave", error);
            toast.error("Failed to cancel leave");
        }
    };

    const handleEditLeave = (leave: LeaveApplication) => {
        setEditingLeave(leave);
        // Scroll to top to show form
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleCancelForm = () => {
        setEditingLeave(null);
    };

    if (status === 'loading') {
        return <div className="flex h-screen items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>;
    }

    return (
        <div className="space-y-6">
            <LeaveApplicationForm
                student={student}
                isSubmitting={isSubmitting}
                onSubmit={handleApplyLeave}
                onCancel={handleCancelForm}
                initialData={editingLeave}
            />

            {isLoading ? (
                <div className="flex justify-center p-8">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            ) : (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-xl font-bold">Student Leave Details</CardTitle>
                            <div className="text-sm text-muted-foreground">
                                Total Records: <span className="font-bold text-primary">{leaveApplications.length}</span>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <LeaveDetailsGrid
                                data={leaveApplications}
                                onCancelLeave={handleCancelLeave}
                                onEditLeave={handleEditLeave}
                            />
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    );
}
