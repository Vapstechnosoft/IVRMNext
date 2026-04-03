'use client';

import { forwardRef } from 'react';
import { format } from 'date-fns';

interface TcPrintProps {
    data: any;
}

export const TcPrint = forwardRef<HTMLDivElement, TcPrintProps>(({ data }, ref) => {
    if (!data) return null;

    const renderCertificate = (isSecond: boolean = false) => (
        <div key={isSecond ? 'second' : 'first'} style={{ minHeight: '7.3in !important' }}>
            <div style={{ borderLeft: '5px solid #d5303b !important', height: '7.3in' }}>
                <div style={{ borderLeft: '5px solid #e7cb7d !important', height: '100%' }}>
                    <div style={{ borderLeft: '4px solid #211f21 !important', height: '100%', paddingLeft: isSecond ? '13px' : '10px', paddingRight: isSecond ? '0' : '10px' }}>
                        <img 
                            src={data.imgname} 
                            alt="logo" 
                            style={{ width: '100%', height: '125px' }} 
                        />
                        <div className="text-center" style={{ borderBottom: '1px solid #eee' }}>
                            <h4 style={{ margin: '0px', fontFamily: "'Source Sans Pro', sans-serif" }}>TRANSFER CERTIFICATE</h4>
                        </div>
                        <div className="margin-top-10">
                            <div className="">
                                <div className="text-right">
                                    <b style={{ fontWeight: '600 !important', fontSize: '13px !important' }}>Date:</b>&nbsp; 
                                    <span style={{ fontSize: '13px !important' }}>{data.astC_TCIssueDate ? format(new Date(data.astC_TCIssueDate), 'dd/MM/yyyy') : ''}</span>
                                </div>
                            </div>
                            <div className="flex justify-between">
                                <div className="text-left">
                                    <b style={{ fontWeight: '600 !important', fontSize: '13px !important' }}>T.C. Serial No:</b>&nbsp; 
                                    <span style={{ fontSize: '13px !important' }}>{data.tcno} </span>
                                </div>
                                <div className="text-right">
                                    <b style={{ fontWeight: '600 !important', fontSize: '13px !important' }}>BSP ID:</b>&nbsp; 
                                    <span style={{ fontSize: '13px !important' }}>{data.BSPID} </span>
                                </div>
                            </div>
                            <div className="">
                                <div className="text-left">
                                    <b style={{ fontWeight: '600 !important', fontSize: '13px !important' }}>Scholar No:</b>&nbsp; 
                                    <span style={{ fontSize: '13px !important' }}>{data.admno} </span>
                                </div>
                            </div>
                            <p style={{ lineHeight: '18px', textAlign: 'justify', fontSize: '15px !important' }} className="mt-5">
                                This is to certify that <b style={{ fontWeight: '600 !important' }}> {data.abbrivation}{data.lblstdname} </b> son of {data.lblfathername} was admitted into this school
                                on the {data.lbldoa ? format(new Date(data.lbldoa), 'dd-MM-yyyy') : ''} and left on the {data.leftdate ? format(new Date(data.leftdate), 'dd-MM-yyyy') : ''} with a {data.lblconduct?.toLowerCase()} character.
                            </p>
                            <p style={{ lineHeight: '18px', textAlign: 'justify', fontSize: '15px !important' }}>
                                He was then studying in the &emsp;{data.laststudied}-{data.asmC_SectionName}&emsp; class of the {data.Boardtype} stream, the school year being from {data.currentyear}.
                            </p>
                            <p style={{ lineHeight: '18px', textAlign: 'justify', fontSize: '15px !important' }}>
                                All sums due to this school on his account have been remitted or satisfactorily arranged for.
                            </p>
                            <p style={{ lineHeight: '18px', textAlign: 'justify', fontSize: '15px !important' }}>
                                His date of birth, according to School Admission Register is (in figures)&emsp; {data.lbldob ? format(new Date(data.lbldob), 'dd-MM-yyyy') : ''} &emsp;(in words) {data.lbldobwords}. <br />
                                {data.resulttype} 2024.
                            </p>
                        </div>
                        
                        <div className="text-left mt-12">
                            <div className="flex justify-end">
                                <b style={{ fontWeight: '600 !important', fontSize: '15px !important', borderTop: 'solid thin' }}>&nbsp;(Principal & Secretary)</b>
                            </div>
                        </div>

                        {!isSecond ? (
                            <div className="mt-8">
                                <div className="mb-4">
                                    <b style={{ fontWeight: '600 !important', fontSize: '15px !important' }}>Received by:</b>
                                    <label style={{ display: 'inline-block', width: '150px', borderBottom: 'solid thin' }}>&nbsp;</label>
                                </div>
                                <div className="mb-4">
                                    <b style={{ fontWeight: '600 !important', fontSize: '15px !important' }}>Relationship:</b>
                                    <label style={{ display: 'inline-block', width: '150px', borderBottom: 'solid thin' }}>&nbsp;</label>
                                </div>
                                <div className="mt-8">
                                    <b style={{ fontWeight: '600 !important', fontSize: '15px !important' }}>Signature with date:</b>
                                    <label style={{ display: 'inline-block', width: '150px', borderBottom: 'solid thin' }}>&nbsp;</label>
                                </div>
                            </div>
                        ) : (
                            <>
                                <div className="mt-10">
                                    <b style={{ fontWeight: '600 !important', fontSize: '15px !important' }}>Countersigned:</b>
                                    <label style={{ display: 'inline-block', width: '150px', borderBottom: 'solid thin' }}>&nbsp;</label>
                                </div>

                                <div className="mt-5 flex justify-end" style={{ width: '100%' }}>
                                    <div style={{ width: '100px', height: '100px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                                        {data.ASCISS_QRCode && (
                                            <img 
                                                src={data.ASCISS_QRCode} 
                                                className="img-thumbnail img-responsive" 
                                                style={{ maxWidth: '100%', maxHeight: '100%' }} 
                                            />
                                        )}
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );

    return (
        <div ref={ref} id="qrcode" className="bg-white p-4" style={{ width: '210mm' }}>
            <style type="text/css" dangerouslySetInnerHTML={{ __html: `
                @font-face {
                    font-family: "Old English Text MT";
                    src: url("https://db.onlinewebfonts.com/t/f3258385782c4c96aa24fe8b5d5f9782.eot");
                    src: url("https://db.onlinewebfonts.com/t/f3258385782c4c96aa24fe8b5d5f9782.eot?#iefix")format("embedded-opentype"), url("https://db.onlinewebfonts.com/t/f3258385782c4c96aa24fe8b5d5f9782.woff")format("woff"), url("https://db.onlinewebfonts.com/t/f3258385782c4c96aa24fe8b5d5f9782.woff2")format("woff2"), url("https://db.onlinewebfonts.com/t/f3258385782c4c96aa24fe8b5d5f9782.ttf")format("truetype"), url("https://db.onlinewebfonts.com/t/f3258385782c4c96aa24fe8b5d5f9782.svg#Old English Text MT")format("svg");
                    font-weight: normal;
                    font-style: normal;
                    font-display: swap;
                }
                @media print {
                    .table-main { width: 100% !important; border: 0px !important; font-weight: 600; text-align: left !important; margin-bottom: 10px; font-size: 16px !important; line-height: 1.5; font-family: 'Times New Roman', Times, serif }
                    body { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
                    @page { size: auto; margin: 0; }
                }
                .table-main td { vertical-align: top; }
            `}} />
            
            <table className="table-main" style={{ width: '100%', fontFamily: 'Georgia, serif', borderCollapse: 'collapse' }}>
                <tbody>
                    <tr>
                        <td width="50%" style={{ paddingRight: '10px', border: 'none' }}>
                            {renderCertificate(false)}
                        </td>
                        <td width="50%" style={{ paddingLeft: '10px', border: 'none' }}>
                            {renderCertificate(true)}
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    );
});


TcPrint.displayName = 'TcPrint';
