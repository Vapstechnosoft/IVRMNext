'use client';

import { ColumnDef } from '@tanstack/react-table';
import Image from 'next/image';

export interface IStudentWiseReport {
    docname: string;
    statuss: string;
    submited: string;
    docpath: string;
    filetype?: string;
}

export interface IDocumentWiseReport {
    studentnam: string;
    admno: string;
    classname: string;
    sectionname: string;
    statuss: string;
    submited: string;
    docpath: string;
    filetype?: string;
}

export const getStudentWiseColumns = (
    onViewDoc: (doc: any) => void
): ColumnDef<IStudentWiseReport>[] => {
    return [
        {
            accessorKey: 'slno',
            header: 'SL.NO',
            cell: ({ row }) => row.index + 1,
            size: 50
        },
        {
            accessorKey: 'docname',
            header: 'Document Name'
        },
        {
            accessorKey: 'statuss',
            header: 'Status'
        },
        {
            accessorKey: 'submited',
            header: 'Remarks'
        },
        {
            accessorKey: 'docpath',
            header: 'Document',
            cell: ({ row }) => {
                const docpath = row.original.docpath;
                const filetype = row.original.filetype || docpath?.split('.').pop()?.toLowerCase();
                
                if (!docpath) return null;
                
                if (filetype === 'pdf') {
                    return <span className="font-bold">PDF</span>;
                } else if (filetype === 'jpg' || filetype === 'jpeg' || filetype === 'png') {
                    return (
                        <div className="h-16 w-16 relative">
                            <Image 
                                src={docpath} 
                                alt="Document" 
                                fill 
                                className="object-cover rounded"
                            />
                        </div>
                    );
                }
                return <span>Document</span>;
            }
        },
        {
            id: 'actions',
            header: 'Action',
            cell: ({ row }) => {
                const docpath = row.original.docpath;
                const filetype = row.original.filetype || docpath?.split('.').pop()?.toLowerCase();
                
                if (!docpath) return null;
                
                if (filetype === 'pdf') {
                    return (
                        <a href={docpath} target="_blank" rel="noreferrer" className="text-orange-500 font-bold hover:underline">
                            (Download pdf)
                        </a>
                    );
                } else if (filetype === 'jpg' || filetype === 'jpeg' || filetype === 'png') {
                    return (
                        <button 
                            type="button" 
                            className="text-blue-600 hover:underline"
                            onClick={() => onViewDoc(row.original)}
                        >
                            View
                        </button>
                    );
                }
                return null;
            }
        }
    ];
};

export const getDocumentWiseColumns = (
    onViewDoc: (doc: any) => void
): ColumnDef<IDocumentWiseReport>[] => {
    return [
        {
            accessorKey: 'slno',
            header: 'SL.NO',
            cell: ({ row }) => row.index + 1,
            size: 50
        },
        {
            accessorKey: 'studentnam',
            header: 'Student Name'
        },
        {
            accessorKey: 'admno',
            header: 'Admno'
        },
        {
            accessorKey: 'classname',
            header: 'Class'
        },
        {
            accessorKey: 'sectionname',
            header: 'Section'
        },
        {
            accessorKey: 'statuss',
            header: 'Status'
        },
        {
            accessorKey: 'submited',
            header: 'Remarks'
        },
        {
            accessorKey: 'docpath',
            header: 'Document',
            cell: ({ row }) => {
                const docpath = row.original.docpath;
                const filetype = row.original.filetype || docpath?.split('.').pop()?.toLowerCase();
                
                if (!docpath) return null;
                
                if (filetype === 'pdf') {
                    return <span className="font-bold">PDF</span>;
                } else if (filetype === 'jpg' || filetype === 'jpeg' || filetype === 'png') {
                    return (
                        <div className="h-16 w-16 relative">
                            <Image 
                                src={docpath} 
                                alt="Document" 
                                fill 
                                className="object-cover rounded"
                            />
                        </div>
                    );
                }
                return <span>Document</span>;
            }
        },
        {
            id: 'actions',
            header: 'Action',
            cell: ({ row }) => {
                const docpath = row.original.docpath;
                const filetype = row.original.filetype || docpath?.split('.').pop()?.toLowerCase();
                
                if (!docpath) return null;
                
                if (filetype === 'pdf') {
                    return (
                        <a href={docpath} target="_blank" rel="noreferrer" className="text-orange-500 font-bold hover:underline">
                            (Download pdf)
                        </a>
                    );
                } else if (filetype === 'jpg' || filetype === 'jpeg' || filetype === 'png') {
                    return (
                        <button 
                            type="button" 
                            className="text-blue-600 hover:underline"
                            onClick={() => onViewDoc(row.original)}
                        >
                            View
                        </button>
                    );
                }
                return null;
            }
        }
    ];
};
