'use client';

import { format } from 'date-fns';
import React, { Fragment } from 'react';

interface TotalStrengthPrintProps {
    groupedData: Record<number, any[]>;
    totalGrand: number;
    dynamicElectives?: any[];
    schoolName?: string;
    schoolAddress?: string;
    schoolPhone?: string;
    logoUrl?: string;
}

export const TotalStrengthPrint = React.forwardRef<HTMLDivElement, TotalStrengthPrintProps>(
    ({ groupedData, totalGrand, dynamicElectives = [], schoolName, schoolAddress, schoolPhone, logoUrl }, ref) => {
        const currentDate = format(new Date(), 'dd/MM/yyyy');

        const calculateClassTotalByRow = (rowNumber: number, field: string) => {
            const items = groupedData[rowNumber] || [];
            return items.reduce((sum, item) => sum + (item[field] || 0), 0);
        };

        const calculateGrandTotal = (field: string) => {
            let grand = 0;
            Object.values(groupedData).forEach(sections => {
                sections.forEach(item => {
                    grand += (item[field] || 0);
                });
            });
            return grand;
        };

        return (
            <div ref={ref} className='print-preview-container bg-white text-black min-h-full w-full'>
                <style>
                    {`
                        @media print {
                            @page {
                                margin: 5mm;
                                size: A4 landscape;
                            }
                            body {
                                visibility: hidden;
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
                                border: 0.5pt solid black;
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

                <div className='p-2'>
                    {/* Header */}
                    <div className='text-center mb-4'>
                        <h1 className='text-xl font-bold uppercase'>{schoolName || 'Institution Name'}</h1>
                        <p className='text-xs'>{schoolAddress}</p>
                        <h2 className='text-lg font-bold border-y border-black my-2 inline-block px-8 py-1 truncate capitalize'>TOTAL STRENGTH REPORT</h2>
                        <p className='text-xs text-right italic'>Date: {currentDate}</p>
                    </div>

                    {/* Table */}
                    <table>
                        <thead>
                            <tr className='bg-gray-100 uppercase'>
                                <th style={{ width: '40px' }}>Sl.No</th>
                                <th className='text-left'>Class</th>
                                <th className='text-left'>Section</th>
                                <th style={{ width: '45px' }}>Boys</th>
                                <th style={{ width: '45px' }}>Girls</th>
                                {dynamicElectives.map((e: any) => (
                                    <th key={e.ISMS_Id}>{e.ISMS_SubjectName}</th>
                                ))}
                                <th style={{ width: '50px' }}>New Adm</th>
                                <th className='text-right' style={{ width: '60px' }}>Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            {Object.entries(groupedData)
                                .sort(([a], [b]) => Number(a) - Number(b))
                                .map(([rowNumber, sections], index) => (
                                    <Fragment key={rowNumber}>
                                        {sections.map((item: any, sectionIndex) => (
                                            <tr key={`${rowNumber}-${sectionIndex}`}>
                                                <td>{sectionIndex === 0 ? index + 1 : ''}</td>
                                                <td className='text-left'>{sectionIndex === 0 ? item.classname : ''}</td>
                                                <td className='text-left'>{item.sectionname}</td>
                                                <td>{item.boys}</td>
                                                <td>{item.girls}</td>
                                                {dynamicElectives.map((e: any) => (
                                                    <td key={e.ISMS_Id}>{item[e.ISMS_SubjectName] || 0}</td>
                                                ))}
                                                <td>{item.newAdmission || 0}</td>
                                                <td className='text-right'>{item.totalstudents}</td>
                                            </tr>
                                        ))}
                                        <tr className='bg-gray-50 font-bold'>
                                            <td colSpan={3} className='text-right'>Total for {sections[0]?.classname}</td>
                                            <td>{calculateClassTotalByRow(Number(rowNumber), 'boys')}</td>
                                            <td>{calculateClassTotalByRow(Number(rowNumber), 'girls')}</td>
                                            {dynamicElectives.map((e: any) => (
                                                <td key={e.ISMS_Id}>{calculateClassTotalByRow(Number(rowNumber), e.ISMS_SubjectName)}</td>
                                            ))}
                                            <td>{calculateClassTotalByRow(Number(rowNumber), 'newAdmission')}</td>
                                            <td className='text-right'>{calculateClassTotalByRow(Number(rowNumber), 'totalstudents')}</td>
                                        </tr>
                                    </Fragment>
                                ))}
                            <tr className='bg-gray-200 font-bold uppercase'>
                                <td colSpan={3} className='text-right'>Grand Total</td>
                                <td>{calculateGrandTotal('boys')}</td>
                                <td>{calculateGrandTotal('girls')}</td>
                                {dynamicElectives.map((e: any) => (
                                    <td key={e.ISMS_Id}>{calculateGrandTotal(e.ISMS_SubjectName)}</td>
                                ))}
                                <td>{calculateGrandTotal('newAdmission')}</td>
                                <td className='text-right'>{totalGrand}</td>
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
