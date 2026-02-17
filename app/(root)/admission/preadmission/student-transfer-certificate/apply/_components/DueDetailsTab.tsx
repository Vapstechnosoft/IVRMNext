'use client';

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, CheckCircle2, Info } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface DueDetailsTabProps {
    data: any;
}

export const DueDetailsTab = ({ data }: DueDetailsTabProps) => {
    const feeDues = data?.fee_details || [];
    const pdaDues = data?.pda_due_details || [];
    const libraryDues = data?.library_details || [];

    const hasDues = feeDues.length > 0 || pdaDues.length > 0 || libraryDues.length > 0;

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
            {hasDues ? (
                <Alert variant="destructive" className="bg-destructive/5">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Pending Dues Found</AlertTitle>
                    <AlertDescription>
                        This student has outstanding dues in one or more departments. Please ensure all dues are cleared before final TC generation.
                    </AlertDescription>
                </Alert>
            ) : (
                <Alert className="bg-green-50 text-green-800 border-green-200">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    <AlertTitle>No Dues Found</AlertTitle>
                    <AlertDescription>
                        The student has no outstanding dues in Fee, library or PDA accounts.
                    </AlertDescription>
                </Alert>
            )}

            {/* Fee Dues */}
            <div className="space-y-4">
                <div className="flex items-center gap-2">
                    <h3 className="text-lg font-bold text-indigo-900">Fee Dues</h3>
                    <Badge variant={feeDues.length > 0 ? "destructive" : "outline"}>
                        {feeDues.length} {feeDues.length === 1 ? 'Item' : 'Items'}
                    </Badge>
                </div>
                {feeDues.length > 0 ? (
                    <div className="rounded-md border">
                        <Table>
                            <TableHeader className="bg-muted/50">
                                <TableRow>
                                    <TableHead>Fee Group</TableHead>
                                    <TableHead>Fee Head</TableHead>
                                    <TableHead className="text-right">Balance</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {feeDues.map((due: any, index: number) => (
                                    <TableRow key={index}>
                                        <TableCell>{due.fmG_GroupName}</TableCell>
                                        <TableCell>{due.fmH_FeeName}</TableCell>
                                        <TableCell className="text-right font-semibold text-red-600">
                                            {due.balance.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                ) : (
                    <p className="text-sm text-muted-foreground italic pl-4">No pending fee dues.</p>
                )}
            </div>

            {/* Library Dues */}
            <div className="space-y-4">
                <div className="flex items-center gap-2">
                    <h3 className="text-lg font-bold text-indigo-900">Library Dues</h3>
                    <Badge variant={libraryDues.length > 0 ? "destructive" : "outline"}>
                        {libraryDues.length} {libraryDues.length === 1 ? 'Item' : 'Items'}
                    </Badge>
                </div>
                {libraryDues.length > 0 ? (
                    <div className="rounded-md border">
                        <Table>
                            <TableHeader className="bg-muted/50">
                                <TableRow>
                                    <TableHead>Book Title</TableHead>
                                    <TableHead>Book No</TableHead>
                                    <TableHead>Due Date</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {libraryDues.map((book: any, index: number) => (
                                    <TableRow key={index}>
                                        <TableCell>{book.lmbO_BookTitle}</TableCell>
                                        <TableCell>{book.lmbO_BookNo}</TableCell>
                                        <TableCell>{book.lbS_TDate || 'N/A'}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                ) : (
                    <p className="text-sm text-muted-foreground italic pl-4">No pending library books.</p>
                )}
            </div>

            {/* PDA Dues */}
            <div className="space-y-4">
                <div className="flex items-center gap-2">
                    <h3 className="text-lg font-bold text-indigo-900">PDA Dues</h3>
                    <Badge variant={pdaDues.length > 0 ? "destructive" : "outline"}>
                        {pdaDues.length} {pdaDues.length === 1 ? 'Item' : 'Items'}
                    </Badge>
                </div>
                {pdaDues.length > 0 ? (
                    <div className="rounded-md border">
                        <Table>
                            <TableHeader className="bg-muted/50">
                                <TableRow>
                                    <TableHead>Description</TableHead>
                                    <TableHead className="text-right">Amount</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {pdaDues.map((pda: any, index: number) => (
                                    <TableRow key={index}>
                                        <TableCell>{pda.description || 'PDA Due'}</TableCell>
                                        <TableCell className="text-right font-semibold text-red-600">
                                            {pda.amount.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                ) : (
                    <p className="text-sm text-muted-foreground italic pl-4">No pending PDA dues.</p>
                )}
            </div>
        </div>
    );
};
