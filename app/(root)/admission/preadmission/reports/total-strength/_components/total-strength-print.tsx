'use client';

import { format } from 'date-fns';
import React, { Fragment } from 'react';

interface TotalStrengthPrintProps {
    groupedData: Record<number, any[]>;
    totalGrand: number;
    schoolName?: string;
    schoolAddress?: string;
    schoolPhone?: string;
    logoUrl?: string;
}

export const TotalStrengthPrint = React.forwardRef<HTMLDivElement, TotalStrengthPrintProps>(
    ({ groupedData, totalGrand, schoolName, schoolAddress, schoolPhone, logoUrl }, ref) => {
        const currentDate = format(new Date(), 'dd/MM/yyyy');

        const calculateClassTotal = (rowNumber: number) => {
            const items = groupedData[rowNumber] || [];
            return items.reduce((sum, item) => sum + (item.totalstudents || 0), 0);
        };

        return (
            <div ref={ref} className='print-preview-container min-h-full w-full bg-white text-black'>
                <style>
                    {`
                        @media print {
                            @page {
                                margin: 10mm;
                                size: A4 portrait;
                            }
                            body {
                                visibility: hidden;
                                background: white;
                                margin: 0;
                                padding: 0;
                            }
                            .print-preview-container {
                                visibility: visible !important;
                                position: absolute;
                                left: 0;
                                top: 0;
                                width: 100%;
                                background: white;
                                z-index: 9999;
                                color: black;
                            }
                            .print-preview-container * {
                                visibility: visible !important;
                            }
                            .main-table {
                                width: 100%;
                                border-collapse: collapse;
                                border: none !important;
                            }
                            .data-table {
                                width: 100%;
                                border-collapse: collapse;
                                border: 1px solid #000;
                            }
                            .data-table th, .data-table td {
                                border: 1px solid #000;
                                padding: 6px;
                                text-align: center;
                                font-size: 11px;
                            }
                            .data-table th {
                                background-color: #f3f4f6;
                                font-weight: bold;
                                -webkit-print-color-adjust: exact;
                            }
                            .text-left { text-align: left !important; }
                            .text-right { text-align: right !important; }
                            .header-section {
                                text-align: center;
                                padding-bottom: 10px;
                            }
                            .footer-section {
                                padding-top: 10px;
                                display: flex;
                                justify-content: space-between;
                                font-size: 10px;
                                opacity: 0.7;
                            }
                            .no-border {
                                border: none !important;
                            }
                        }
                    `}
                </style>

                <table className='main-table no-border'>
                    <thead>
                        <tr>
                            <td className='no-border'>
                                {/* Header */}
                                <div className='header-section'>
                                    <div className='mb-4 flex items-center justify-center gap-4'>
                                        {logoUrl && <img src={logoUrl} alt='Logo' className='h-16 w-16 object-contain' />}
                                        <div className='text-center'>
                                            <h1 className='font-bold text-xl uppercase'>{schoolName || 'Institution Name'}</h1>
                                            <p className='text-xs'>{schoolAddress || 'Institution Address'}</p>
                                            <p className='text-xs'>Ph: {schoolPhone || 'N/A'}</p>
                                        </div>
                                    </div>
                                    <h2 className='inline-block border-black border-y px-4 py-1 font-bold text-md uppercase'>
                                        Total Strength Report
                                    </h2>
                                    <p className='mt-2 text-xs'>Date: {currentDate}</p>
                                </div>
                            </td>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td className='no-border'>
                                {/* Table */}
                                <table className='data-table w-full'>
                                    <thead>
                                        <tr className='bg-gray-100 uppercase'>
                                            <th className='w-12'>Sl.No</th>
                                            <th className='text-left'>Class</th>
                                            <th className='text-left'>Section</th>
                                            <th>Boys</th>
                                            <th>Girls</th>
                                            <th className='w-24 text-right'>Total</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {Object.entries(groupedData)
                                            .sort(([a], [b]) => Number(a) - Number(b))
                                            .map(([rowNumber, sections], index) => (
                                                <Fragment key={rowNumber}>
                                                    {sections.map((item: any, sectionIndex) => (
                                                        <tr key={`${rowNumber}-${item.sectionname}-${sectionIndex}`}>
                                                            <td>{sectionIndex === 0 ? index + 1 : ''}</td>
                                                            <td className='text-left'>{sectionIndex === 0 ? item.classname : ''}</td>
                                                            <td className='text-left'>{item.sectionname}</td>
                                                            <td>{item.boys}</td>
                                                            <td>{item.girls}</td>
                                                            <td className='text-right'>{item.totalstudents}</td>
                                                        </tr>
                                                    ))}
                                                    <tr className='bg-gray-50 font-bold'>
                                                        <td colSpan={3} className='text-right'>
                                                            Total for {sections[0]?.classname || ''}
                                                        </td>
                                                        <td colSpan={2} />
                                                        <td className='text-right'>{calculateClassTotal(Number(rowNumber))}</td>
                                                    </tr>
                                                </Fragment>
                                            ))}
                                        <tr className='bg-gray-200 font-bold uppercase'>
                                            <td colSpan={3} className='text-right'>
                                                Grand Total
                                            </td>
                                            <td colSpan={2} />
                                            <td className='text-right'>{totalGrand}</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </td>
                        </tr>
                    </tbody>
                    <tfoot>
                        <tr>
                            <td className='no-border'>
                                {/* Footer */}
                                <div className='footer-section'>
                                    <div>Printed on: {currentDate}</div>
                                    <div>Generated by Vaps Technosoft Pvt. Ltd.</div>
                                </div>
                            </td>
                        </tr>
                    </tfoot>
                </table>
            </div>
        );
    }
);

TotalStrengthPrint.displayName = 'TotalStrengthPrint';
