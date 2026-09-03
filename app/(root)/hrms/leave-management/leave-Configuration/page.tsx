'use client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useLeaveConfiguration, useSaveLeaveConfiguration } from '@/hooks/hrms/leave-management/useMasters';
import type { LeaveConfigurationFormData } from '@/types/hrms/leave-management/leaveConfiguration/leaveConfiguration';
import { Loader2 } from 'lucide-react';
import LeaveConfigurationForm from './_components/leave-configuration-form';

export default function LeaveConfigurationPage() {
    const { data: configData, isLoading, error } = useLeaveConfiguration();
    const { mutate: saveConfiguration, isPending } = useSaveLeaveConfiguration();

    const handleSubmit = (data: LeaveConfigurationFormData) => {
        saveConfiguration(data);
    };

    const handleCancel = () => {
        // Reset form to initial values
        window.location.reload();
    };

    if (isLoading) {
        return (
            <div className='flex min-h-screen items-center justify-center'>
                <Loader2 className='h-8 w-8 animate-spin text-primary' />
            </div>
        );
    }

    if (error) {
        return (
            <div className='container mx-auto p-6'>
                <Card className='border-destructive'>
                    <CardHeader>
                        <CardTitle className='text-destructive'>Error Loading Configuration</CardTitle>
                        <CardDescription>{error.message || 'Failed to load leave configuration'}</CardDescription>
                    </CardHeader>
                </Card>
            </div>
        );
    }

    return (
        <div className='min-h-screen bg-gradient-to-br from-background to-muted/20'>
            <div className='container mx-auto space-y-6 p-6'>
                <div className='flex items-center justify-between'>
                    <div></div>
                </div>

                <Card className='shadow-lg'>
                    <CardHeader className='border-b bg-muted/50'>
                        <CardTitle>Configuration Settings</CardTitle>
                        <CardDescription>Manage late-in, early-out, and cumulative time settings</CardDescription>
                    </CardHeader>
                    <CardContent className='pt-6'>
                        <LeaveConfigurationForm
                            initialData={configData?.data || null}
                            onSubmit={handleSubmit}
                            onCancel={handleCancel}
                            isPending={isPending}
                        />
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
