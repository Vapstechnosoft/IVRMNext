'use client';

import { format } from 'date-fns';
import React, { Fragment, useMemo } from 'react';

interface TotalStrengthPrintProps {
    groupedData: Record<string, any[]>;
    totalGrand: number;
    dynamicElectives?: any[];
    schoolName?: string;
    schoolAddress?: string;
    schoolPhone?: string;
    logoUrl?: string;
    yearString?: string;
}

export const TotalStrengthPrint = React.forwardRef<HTMLDivElement, TotalStrengthPrintProps>(
    ({ groupedData, totalGrand, dynamicElectives = [], schoolName, schoolAddress, schoolPhone, logoUrl, yearString }, ref) => {
        const currentDate = format(new Date(), 'dd/MM/yyyy');

        const calculateClassTotalByGroup = (groupKey: string, field: string) => {
            const items = groupedData[groupKey] || [];
            return items.reduce((sum: number, item: any) => sum + (item[field] || 0), 0);
        };

        const calculateGrandTotal = (field: string) => {
            let grand = 0;
            Object.values(groupedData).forEach((sections: any[]) => {
                sections.forEach((item: any) => {
                    grand += (item[field] || 0);
                });
            });
            return grand;
        };

        return (
            <div ref={ref} className='print-preview-container bg-white text-black min-h-full w-full printable-content'>
                <style>
                    {`
                        @media print {
                            @page {
                                margin: 5mm;
                                size: A4 landscape;
                            }
                            body {
                                background: white;
                            }
                            .print-preview-container {
                                visibility: visible !important;
                                position: absolute;
                                left: 0;
                                top: 0;
                                width: 100%;
                            }
                            table {
                                border-collapse: collapse;
                                width: 100%;
                            }
                            th, td {
                                border: 0.5pt solid black !important;
                                padding: 4px;
                                text-align: center;
                                font-size: 10px;
                            }
                            th {
                                background-color: #f1f1f1 !important;
                                -webkit-print-color-adjust: exact;
                            }
                            .text-left { text-align: left; }
                            .text-right { text-align: right; }
                            .font-bold { font-weight: bold; }
                        }
                    `}
                </style>

                <div className='p-4'>
                    {/* Header */}
                    <div className='flex items-start gap-6 mb-4 mt-4'>
                        {logoUrl && (
                            <img src={logoUrl} alt='Logo' className='h-60 w-auto max-w-[1000px] object-contain' />
                        )}
                        {/* <div className='flex-1 text-center'>
                            <h1 className='text-5xl italic mb-1' style={{ fontFamily: 'Georgia, serif', color: '#102d7d' }}>{schoolName}</h1>
                            <div className='border-t-2 border-orange-400 w-full mb-3'></div>
                            <div className='text-[14px] leading-relaxed text-gray-800 font-medium'>
                                <p className='whitespace-pre-line'>{schoolAddress}</p>
                                {schoolPhone && <p className='mt-2'>Phone No : {schoolPhone}</p>}
                            </div>
                        </div> */}
                    </div>

                    <div className='text-center mb-4'>
                        <h2 className='text-xl font-bold border-b-2 border-black inline-block px-4 pb-0.5'>
                            Total Strength Report For Year {yearString}
                        </h2>
                    </div>

                    {/* Table */}
                    <table className='w-full'>
                        <thead>
                            <tr className='bg-gray-100 uppercase'>
                                <th style={{ width: '40px' }}>Sl.No</th>
                                <th className='text-left'>Class</th>
                                <th className='text-left'>Section</th>
                                <th style={{ width: '45px' }}>Boys</th>
                                <th style={{ width: '45px' }}>Girls</th>
                                <th className='text-right' style={{ width: '60px' }}>Total</th>
                                <th style={{ width: '50px' }}>New Admission</th>
                                {dynamicElectives.map((e: any) => (
                                    <th key={e.ISMS_Id || (e as any).ismS_Id}>{e.ISMS_SubjectName || (e as any).ismS_SubjectName}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {Object.entries(groupedData)
                                .map(([groupKey, sections], index) => (
                                    <Fragment key={groupKey}>
                                        {sections.map((item: any, sectionIndex) => (
                                            <tr key={`${groupKey}-${sectionIndex}`}>
                                                <td>{sectionIndex + 1}</td>
                                                {/* <td className='text-left'>{sectionIndex === 0 ? item.classname : ''}</td> */}
                                                <td>{item.classname}</td>
                                                <td className='text-left'>{item.sectionname}</td>
                                                <td>{item.boys}</td>
                                                <td>{item.girls}</td>
                                                <td className='text-right font-bold'>{item.totalstudents}</td>
                                                <td>{item.newAdmission || 0}</td>
                                                {dynamicElectives.map((e: any) => (
                                                    <td key={e.ISMS_Id || (e as any).ismS_Id}>{item[e.ISMS_SubjectName || (e as any).ismS_SubjectName] || 0}</td>
                                                ))}
                                            </tr>
                                        ))}
                                        <tr className='bg-gray-50 font-bold'>
                                            <td></td>
                                            <td className='text-left'>Total</td>
                                            <td></td>
                                            <td>{calculateClassTotalByGroup(groupKey, 'boys')}</td>
                                            <td>{calculateClassTotalByGroup(groupKey, 'girls')}</td>
                                            <td className='text-right'>{calculateClassTotalByGroup(groupKey, 'totalstudents')}</td>
                                            <td>{calculateClassTotalByGroup(groupKey, 'newAdmission')}</td>
                                            {dynamicElectives.map((e: any) => (
                                                <td key={e.ISMS_Id || (e as any).ismS_Id}>{calculateClassTotalByGroup(groupKey, e.ISMS_SubjectName || (e as any).ismS_SubjectName)}</td>
                                            ))}
                                        </tr>
                                    </Fragment>
                                ))}
                            <tr className='bg-gray-200 font-bold uppercase'>
                                <td></td>
                                <td className='text-left'>Grand Total</td>
                                <td></td>
                                <td>{calculateGrandTotal('boys')}</td>
                                <td>{calculateGrandTotal('girls')}</td>
                                <td className='text-right'>{totalGrand}</td>
                                <td>{calculateGrandTotal('newAdmission')}</td>
                                {dynamicElectives.map((e: any) => (
                                    <td key={e.ISMS_Id || (e as any).ismS_Id}>{calculateGrandTotal(e.ISMS_SubjectName || (e as any).ismS_SubjectName)}</td>
                                ))}
                            </tr>
                        </tbody>
                    </table>

                    <div className='mt-8 flex justify-between text-xs opacity-50 italic'>
                        <div>Printed on: {currentDate}</div>

                    </div>
                </div>
            </div>
        );
    }
);

TotalStrengthPrint.displayName = 'TotalStrengthPrint';
