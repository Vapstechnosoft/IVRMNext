'use client';

import { DataTable } from '@/components/ui/data-table/data-table';
import type { ColumnDef } from '@tanstack/react-table';
import { Database, RefreshCw } from 'lucide-react';

interface GenericDataTableProps<T> {
    // Data props
    data?: T[];
    columns: ColumnDef<T>[];
    totalItems?: number;

    // State props
    isLoading: boolean;
    error?: Error | null;
    success?: boolean;
    errorMessage?: string;

    // Table configuration
    showViewOptions?: boolean;
    columnPinning?: { left?: string[]; right?: string[] };

    // Custom messages
    loadingMessage?: string;
    errorTitle?: string;
    noDataTitle?: string;
    noDataDescription?: string;
    requestFailedTitle?: string;

    // Custom icons
    LoadingIcon?: React.ComponentType<{ className?: string }>;
    ErrorIcon?: React.ComponentType<{ className?: string }>;
    NoDataIcon?: React.ComponentType<{ className?: string }>;

    // Custom loading/error components
    LoadingComponent?: React.ComponentType;
    ErrorComponent?: React.ComponentType<{ error: Error; message: string }>;
    NoDataComponent?: React.ComponentType;
}

export function GenericDataTable<T>({
    data = [],
    columns,
    totalItems = 0,
    isLoading,
    error,
    success = true,
    errorMessage,
    showViewOptions = true,
    columnPinning,
    loadingMessage = 'Loading data...',
    errorTitle = 'Error Loading Data',
    noDataTitle = 'No Data Found',
    noDataDescription = 'Get started by creating your first record',
    requestFailedTitle = 'Request Failed',
    LoadingIcon = RefreshCw,
    ErrorIcon = Database,
    NoDataIcon = Database,
    LoadingComponent,
    ErrorComponent,
    NoDataComponent
}: GenericDataTableProps<T>) {
    // Loading state
    if (isLoading) {
        if (LoadingComponent) {
            return <LoadingComponent />;
        }

        return (
            <div className='flex flex-col items-center justify-center space-y-4 py-12'>
                <LoadingIcon className='h-8 w-8 animate-spin text-secondary' />
                <p className='text-muted-foreground text-sm'>{loadingMessage}</p>
            </div>
        );
    }

    // Error state
    if (error) {
        if (ErrorComponent) {
            return <ErrorComponent error={error} message={error.message} />;
        }

        return (
            <div className='flex flex-col items-center justify-center space-y-4 py-12'>
                <div className='rounded-full bg-destructive/10 p-3'>
                    <ErrorIcon className='h-6 w-6 text-destructive' />
                </div>
                <div className='space-y-2 text-center'>
                    <h3 className='font-semibold text-destructive'>{errorTitle}</h3>
                    <p className='text-muted-foreground text-sm'>{error.message || errorMessage || 'Failed to load data'}</p>
                </div>
            </div>
        );
    }

    // Request failed state (when success is false but no error)
    if (!success) {
        return (
            <div className='flex flex-col items-center justify-center space-y-4 py-12'>
                <div className='rounded-full bg-destructive/10 p-3'>
                    <ErrorIcon className='h-6 w-6 text-destructive' />
                </div>
                <div className='space-y-2 text-center'>
                    <h3 className='font-semibold text-destructive'>{requestFailedTitle}</h3>
                    <p className='text-muted-foreground text-sm'>{errorMessage || 'Failed to fetch data'}</p>
                </div>
            </div>
        );
    }

    // No data state
    if (data.length === 0) {
        if (NoDataComponent) {
            return <NoDataComponent />;
        }

        return (
            <div className='flex flex-col items-center justify-center space-y-4 py-12'>
                <div className='rounded-full bg-muted p-3'>
                    <NoDataIcon className='h-6 w-6 text-muted-foreground' />
                </div>
                <div className='space-y-2 text-center'>
                    <h3 className='font-semibold'>{noDataTitle}</h3>
                    <p className='text-muted-foreground text-sm'>{noDataDescription}</p>
                </div>
            </div>
        );
    }

    // Success state with data
    return (
        <div className='overflow-hidden rounded-lg bg-card'>
            <DataTable
                isLoading={false}
                columns={columns}
                data={data}
                totalItems={totalItems}
                showViewOptions={showViewOptions}
                columnPinning={columnPinning}
            />
        </div>
    );
}

// Hook for common API response pattern
export function useDataTableProps(
    response: any,
    options?: {
        dataKey?: string;
        totalKey?: string;
        successKey?: string;
        messageKey?: string;
    }
) {
    const { dataKey = 'data', totalKey = 'total', successKey = 'success', messageKey = 'message' } = options || {};

    return {
        data: response?.[dataKey] || [],
        totalItems: response?.[totalKey] || 0,
        success: response?.[successKey],
        errorMessage: response?.[messageKey]
    };
}
