'use client';

import React, { forwardRef } from 'react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

interface StJamesTcPrintProps {
    data: any;
}

export const StJamesTcPrint = forwardRef<HTMLDivElement, StJamesTcPrintProps>(({ data }, ref) => {
    if (!data) return null;

    const {
        tcno,
        admno,
        lblstdname,
        lblfathername,
        lbldoa,
        previousschoolname,
        lbldol,
        lblconduct,
        laststudiedinwords,
        lbldob,
        lbldobwords,
        lblPromotion,
        todaydate,
        qrcode,
        address1,
        address2,
        address3,
        gender,
        leavingreason,
        feepaid,
        religion,
        caste,
        subjectstudied,
        daysattended,
        schooldays,
        tcappdate,
        logo,
    } = data;

    return (
        <div ref={ref} className="stjames-tc-print-container p-4 bg-white font-serif printable-content">
            <style jsx global>{`
                @media print {
                    .stjames-tc-print-container {
                        width: 100%;
                        padding: 0;
                        margin: 0;
                    }
                    .no-print {
                        display: none;
                    }
                }

                .stjames-report-wrapper {
                    display: flex;
                    width: 100%;
                    background-color: #fff;
                    font-size: 14px;
                    line-height: 1.4;
                    font-weight: 500;
                    color: #000;
                }

                .sidebar {
                    width: 35%;
                    padding-right: 15px;
                    border-right: 2px dotted #000;
                }

                .main-cert {
                    width: 65%;
                    padding-left: 20px;
                }

                .border-bottom-dotted {
                    border-bottom: 1px dotted #000;
                    display: inline-block;
                    min-height: 20px;
                }

                .tc-table {
                    width: 100%;
                    border-collapse: collapse;
                    margin-bottom: 15px;
                }

                .tc-table td {
                    padding: 4px 0;
                    vertical-align: bottom;
                }

                .header-img {
                    width: 100%;
                    margin-bottom: 10px;
                }

                .header-img img {
                    width: 100%;
                    height: auto;
                    max-height: 100px;
                    object-fit: contain;
                }

                .signature-section {
                    margin-top: 30px;
                    display: flex;
                    justify-content: flex-end;
                    font-weight: bold;
                }

                .footer-text {
                    font-size: 11px;
                    margin-top: 20px;
                    line-height: 1.2;
                }

                .center-text {
                    text-align: center;
                }

                .full-width-dotted {
                    width: 100%;
                    border-bottom: 1px dotted #000;
                    margin: 10px 0;
                }

                .english-hand {
                    font-family: 'Times New Roman', Times, serif; /* Replacement for England Hand DB */
                    font-size: 1.2em;
                }
            `}</style>

            <div className="stjames-report-wrapper">
                {/* Sidebar Section */}
                <div className="sidebar">
                    <div className="header-img">
                        <img src={logo} alt="School TC Header" />
                    </div>

                    <table className="tc-table">
                        <tbody>
                            <tr>
                                <td width="15%"><b>No :</b></td>
                                <td width="35%" className="border-bottom-dotted"><b>{tcno}</b></td>
                                <td width="20%"><b>Roll No:</b></td>
                                <td width="30%" className="border-bottom-dotted"><b>{admno}</b></td>
                            </tr>
                        </tbody>
                    </table>

                    <div className="header-img center-text">
                        <img src="/images/clients/Stjames/Transfercer.png" style={{ height: '40px', width: 'auto' }} alt="Transfer Certificate" />
                    </div>

                    <table className="tc-table">
                        <tbody>
                            <tr>
                                <td width="20%">Given to</td>
                                <td className="border-bottom-dotted center-text"><b>{lblstdname}</b></td>
                            </tr>
                            <tr><td colSpan={2}>&nbsp;</td></tr>
                            <tr><td colSpan={2} className="border-bottom-dotted center-text italic font-bold text-xs">{address1}</td></tr>
                            <tr><td colSpan={2}>&nbsp;</td></tr>
                            <tr><td colSpan={2} className="border-bottom-dotted center-text italic font-bold text-xs">{address2} {address3}</td></tr>
                            <tr><td colSpan={2}>&nbsp;</td></tr>
                            <tr>
                                <td width="30%">On account of</td>
                                <td className="border-bottom-dotted center-text"><b>{leavingreason}</b></td>
                            </tr>
                            <tr>
                                <td width="15%">Left</td>
                                <td className="border-bottom-dotted center-text">
                                    <b>{lbldol ? format(new Date(lbldol), 'dd/MM/yyyy') : ''}</b>
                                </td>
                            </tr>
                            <tr>
                                <td width="25%">Character</td>
                                <td className="border-bottom-dotted center-text"><b>{lblconduct}</b></td>
                            </tr>
                            <tr>
                                <td width="15%">Fees</td>
                                <td className="border-bottom-dotted center-text"><b>{feepaid}</b></td>
                            </tr>
                            <tr>
                                <td width="40%">Studying in Class</td>
                                <td className="border-bottom-dotted center-text"><b>{laststudiedinwords}</b></td>
                            </tr>
                            <tr>
                                <td width="30%">Promotion</td>
                                <td className="border-bottom-dotted center-text"><b>{lblPromotion?.toUpperCase()}</b></td>
                            </tr>
                            <tr>
                                <td width="35%">Date of Birth</td>
                                <td className="border-bottom-dotted center-text">
                                    <b>{lbldob ? format(new Date(lbldob), 'dd/MM/yyyy') : ''}</b>
                                </td>
                            </tr>
                            <tr>
                                <td width="35%">Religion/Caste</td>
                                <td className="border-bottom-dotted center-text">
                                    <b>{religion} / {caste}</b>
                                </td>
                            </tr>
                            <tr>
                                <td width="35%">Attendance</td>
                                <td className="border-bottom-dotted center-text">
                                    <b>{daysattended} / {schooldays}</b>
                                </td>
                            </tr>
                            <tr>
                                <td width="30%"><b>Dated:</b></td>
                                <td width="30%" className="border-bottom-dotted center-text">
                                    <b>{todaydate ? format(new Date(todaydate), 'dd/MM/yyyy') : ''}</b>
                                </td>
                            </tr>
                        </tbody>
                    </table>

                    {qrcode && (
                        <div className="flex justify-center my-4">
                            <img src={qrcode} alt="Verification QR Code" className="w-24 h-24 object-contain" />
                        </div>
                    )}

                    <div className="signature-section">
                        Principal
                    </div>

                    <table className="tc-table">
                        <tbody>
                            <tr>
                                <td width="40%">Sent to D.D.S.E. on</td>
                                <td className="border-bottom-dotted"></td>
                            </tr>
                            <tr>
                                <td width="50%">Recd. from D.D.S.E. on</td>
                                <td className="border-bottom-dotted"></td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                {/* Main Certificate Section */}
                <div className="main-cert">
                    <div className="header-img center-text">
                        <img src={logo} alt="School TC Header" />
                        {/* <img src="/images/clients/Stjames/TC.png" style={{ width: '70%' }} alt="TC Header" />
                     */}
                    </div>

                    <table className="tc-table">
                        <tbody>
                            <tr>
                                <td width="10%"><b>No :</b></td>
                                <td width="30%" className="border-bottom-dotted"><b>{tcno}</b></td>
                                <td width="30%"></td>
                                <td width="15%"><b>Roll No :</b></td>
                                <td width="15%" className="border-bottom-dotted"><b>{admno}</b></td>
                            </tr>
                        </tbody>
                    </table>

                    <div className="mt-4">
                        <span className="english-hand">This is to certify that {gender?.title || 'master'} </span>
                        <span className="border-bottom-dotted min-w-[300px] inline-block text-center font-bold px-2">{lblstdname}</span>
                    </div>

                    <div className="mt-2">
                        <span>{gender?.sonOf || 'Son of'} </span>
                        <span className="border-bottom-dotted min-w-[80%] inline-block text-center font-bold px-2">{lblfathername}</span>
                    </div>

                    <div className="mt-2">
                        <span>was admitted into this school on the (date) </span>
                        <span className="border-bottom-dotted min-w-[200px] inline-block text-center font-bold px-2">
                            {lbldoa ? format(new Date(lbldoa), 'dd/MM/yyyy') : ''}
                        </span>
                    </div>

                    <div className="mt-2 text-wrap">
                        <span>on a transfer certificate from </span>
                        <span className="border-bottom-dotted min-w-[70%] inline-block font-bold px-2">{previousschoolname}</span>
                    </div>
                    <div className="full-width-dotted"></div>

                    <div className="mt-2">
                        <span>and left on the </span>
                        <span className="border-bottom-dotted min-w-[150px] inline-block text-center font-bold px-2">
                            {lbldol ? format(new Date(lbldol), 'dd/MM/yyyy') : ''}
                        </span>
                        <span> with a </span>
                        <span className="border-bottom-dotted min-w-[120px] inline-block text-center font-bold px-2">{lblconduct}</span>
                        <span> character</span>
                    </div>

                    <div className="mt-2">
                        <span>{gender?.heShe || 'He'} was then studying in the (1) </span>
                        <span className="border-bottom-dotted min-w-[60%] inline-block text-center font-bold px-2">{laststudiedinwords}</span>
                    </div>

                    <div className="mt-2 text-wrap">
                        <span>Subjects studied: </span>
                        <span className="border-bottom-dotted min-w-[70%] inline-block font-bold px-2">{subjectstudied}</span>
                    </div>

                    <div className="mt-2">
                        <span>Class of the (2) </span>
                        <span className="border-bottom-dotted min-w-[50%] inline-block text-center font-bold">ICSE & ISC</span>
                        <span> stream, the school year</span>
                    </div>

                    <div className="mt-2">
                        <span>being from (3) </span>
                        <span className="border-bottom-dotted min-w-[150px] inline-block text-center font-bold">MARCH</span>
                        <span> to </span>
                        <span className="border-bottom-dotted min-w-[150px] inline-block text-center font-bold">FEBRUARY</span>
                    </div>

                    <div className="mt-2">
                        <span>All sum due (4) </span>
                        <span className="border-bottom-dotted min-w-[200px] inline-block text-center font-bold px-2">{feepaid}</span>
                        <span> to this school</span>
                    </div>

                    <div className="mt-1 font-semibold italic text-sm">
                        on {gender?.hisHer || 'his'} account have been remitted or satisfactorily arrange for.
                    </div>

                    <div className="mt-4">
                        <span>{gender?.hisHer ? (gender.hisHer.charAt(0).toUpperCase() + gender.hisHer.slice(1)) : 'His'} date of birth, according to the Admission Register is (in figures) </span>
                        <span className="border-bottom-dotted min-w-[150px] inline-block text-center font-bold px-2">
                            {lbldob ? format(new Date(lbldob), 'dd/MM/yyyy') : ''}
                        </span>
                    </div>

                    <div className="mt-2">
                        <span>(in words) </span>
                        <span className="border-bottom-dotted min-w-[85%] inline-block text-center font-bold">{lbldobwords}</span>
                    </div>

                    <div className="mt-4 text-[13px] leading-tight">
                        (The following additional information must be supplied if the scholar left at the end of the School year)
                    </div>

                    <div className="mt-2">
                        <span className="inline-block w-[150px]"></span>
                        <span>Promotion has been (5) </span>
                        <span className="border-bottom-dotted min-w-[300px] inline-block text-center font-bold">{lblPromotion?.toUpperCase()}</span>
                    </div>

                    <table className="tc-table mt-8">
                        <tbody>
                            <tr>
                                <td width="30%"><b>TC Application Date :</b></td>
                                <td width="20%" className="border-bottom-dotted center-text font-bold">
                                    {tcappdate ? format(new Date(tcappdate), 'dd/MM/yyyy') : ''}
                                </td>
                                <td width="10%"><b>Date :</b></td>
                                <td width="20%" className="border-bottom-dotted center-text font-bold">
                                    {todaydate ? format(new Date(todaydate), 'dd/MM/yyyy') : ''}
                                </td>
                                <td width="20%"></td>
                            </tr>
                        </tbody>
                    </table>

                    <div className="mt-8 flex justify-between items-end border-b border-black pb-2">
                        <div className="text-center w-2/3"><b>School Rubber Stamp</b></div>
                        <div className="text-right w-1/3">
                            <div className="border-t border-black border-dotted pt-1 text-center font-bold">
                                Head of the School
                            </div>
                        </div>
                    </div>

                    <div className="footer-text font-bold">
                        <div>1. To be given in words.</div>
                        <div>2. Mention whether ICSE/MADHAYAMIK /Any other examination stream.</div>
                        <div>3. Insert month.</div>
                        <div>4. Sums due to the School include payments for which provision was admitted into the school.</div>
                        <div>5. Granted / Granted on Trail / Refused.</div>
                    </div>
                </div>
            </div>
        </div>
    );
});

StJamesTcPrint.displayName = 'StJamesTcPrint';
