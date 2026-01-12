'use client';

import { ColumnDef } from '@tanstack/react-table';
import type { ICirculationParameterGridData } from '@/types/library/transactions/circulation-parameter';
import { Edit, Lock, Unlock, Zap, ZapOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface GetColumnsProps {
    onEdit: (row: ICirculationParameterGridData) => void;
    onToggleStatus: (row: ICirculationParameterGridData) => void;
    bookFlag: 'BP' | 'NBP';
    issuerType: 'STUDENT' | 'STAFF' | 'DEPARTMENT' | 'GUEST';
}

export const getCirculationParameterColumns = ({
    onEdit,
    onToggleStatus,
    bookFlag,
    issuerType
}: GetColumnsProps): ColumnDef<ICirculationParameterGridData>[] => {

    // Base columns (Sl.No always first)
    const columns: ColumnDef<ICirculationParameterGridData>[] = [
        {
            id: 'slNo',
            header: 'Sl.No',
            cell: ({ row }) => row.index + 1,
            enableSorting: false,
            enableHiding: false,
            size: 60,
        }
    ];

    // Conditional columns based on Book Parameter (BP) vs Non-Book (NBP)
    if (bookFlag === 'BP') {
        columns.push({
            accessorKey: 'LBCPA_IssueRefFlg',
            header: 'Book Type',
        });
    } else {
        columns.push({
            accessorKey: 'LMC_CategoryName',
            header: 'Category',
        });
    }

    // Conditional columns based on Issuer Type
    if (issuerType === 'STUDENT') {
        columns.push({
            accessorKey: 'ASMCL_ClassName',
            header: 'Class',
        });
    } else if (issuerType === 'STAFF') {
        columns.push({
            accessorKey: 'HRMGT_EmployeeGroupType',
            header: 'Group Type',
        });
    }

    // Mapping fields that have different names in API response but we want to show uniformly
    // We can use a custom accessor to normalize
    columns.push({
        id: 'noOfItems',
        header: 'No. Of Item',
        accessorFn: (row) => {
            if (bookFlag === 'BP') {
                if (issuerType === 'STUDENT') return row.LBCPAS_NoOfItems || row.LBCPASC_NoOfItems;
                if (issuerType === 'STAFF') return row.LBCPAST_NoOfItems;
                return row.LBCPAO_NoOfItems;
            } else {
                if (issuerType === 'STUDENT') return row.LNBCPAS_NoOfItems || row.LNBCPASC_NoOfItems;
                if (issuerType === 'STAFF') return row.LNBCPAST_NoOfItems;
                return row.LNBCPAO_NoOfItems;
            }
        }
    });

    columns.push({
        id: 'issueDays',
        header: 'Issue Days',
        accessorFn: (row) => {
            if (bookFlag === 'BP') {
                if (issuerType === 'STUDENT') return row.LBCPAS_IssueDays || row.LBCPASC_IssueDays;
                if (issuerType === 'STAFF') return row.LBCPAST_IssueDays;
                return row.LBCPAO_IssueDays;
            } else {
                if (issuerType === 'STUDENT') return row.LNBCPAS_IssueDays || row.LNBCPASC_IssueDays;
                if (issuerType === 'STAFF') return row.LNBCPAST_IssueDays;
                return row.LNBCPAO_IssueDays;
            }
        }
    });

    columns.push({
        id: 'renewals',
        header: 'Max Renewals',
        accessorFn: (row) => {
            if (bookFlag === 'BP') {
                if (issuerType === 'STUDENT') return row.LBCPAS_NoOfRenewals || row.LBCPASC_NoOfRenewals;
                if (issuerType === 'STAFF') return row.LBCPAST_NoOfRenewals;
                return row.LBCPAO_NoOfRenewals;
            } else {
                if (issuerType === 'STUDENT') return row.LNBCPAS_NoOfRenewals || row.LNBCPASC_NoOfRenewals;
                if (issuerType === 'STAFF') return row.LNBCPAST_NoOfRenewals;
                return row.LNBCPAO_NoOfRenewals;
            }
        }
    });

    // Active Status Column (Helper to check active flag)
    const getActiveFlag = (row: ICirculationParameterGridData) => {
        if (bookFlag === 'BP') {
            if (issuerType === 'STUDENT') return row.LBCPAS_ActiveFlg !== false && row.LBCPASC_ActiveFlg !== false; // Handling undefined
            if (issuerType === 'STAFF') return row.LBCPAST_ActiveFlg;
            return row.LBCPAO_ActiveFlg;
        } else {
            if (issuerType === 'STUDENT') return row.LNBCPAS_ActiveFlg !== false && row.LNBCPASC_ActiveFlg !== false;
            if (issuerType === 'STAFF') return row.LNBCPAST_ActiveFlg;
            return row.LNBCPAO_ActiveFlg;
        }
    };

    columns.push({
        id: 'status',
        header: 'Status',
        cell: ({ row }) => {
            const isActive = getActiveFlag(row.original);
            return (
                <Badge variant={isActive ? 'default' : 'destructive'} className="w-20 justify-center">
                    {isActive ? 'Active' : 'Inactive'}
                </Badge>
            );
        }
    });

    // Actions
    columns.push({
        id: 'actions',
        header: 'Actions',
        cell: ({ row }) => {
            const isActive = getActiveFlag(row.original);
            return (
                <div className="flex gap-2 justify-center">
                    <Button variant="ghost" size="icon" onClick={() => onEdit(row.original)} title="Edit">
                        <Edit className="h-4 w-4 text-blue-500" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onToggleStatus(row.original)}
                        title={isActive ? "Deactivate" : "Activate"}
                    >
                        {isActive ? (
                            <ZapOff className="h-4 w-4 text-red-500" />
                        ) : (
                            <Zap className="h-4 w-4 text-green-500" />
                        )}
                    </Button>
                </div>
            );
        }
    });

    return columns;
};
