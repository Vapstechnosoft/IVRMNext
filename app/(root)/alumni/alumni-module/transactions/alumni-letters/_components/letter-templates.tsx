'use client';

import type { IAlumniLetterStudent } from '@/types/alumni/alumni-letters';
import { format } from 'date-fns';
import { forwardRef } from 'react';

interface LetterTemplatesProps {
    students: IAlumniLetterStudent[];
    letterType: string;
    displayDateTime?: string;
}

export const LetterTemplates = forwardRef<HTMLDivElement, LetterTemplatesProps>(({ students, letterType, displayDateTime }, ref) => {
    const currentDate = format(new Date(), 'dd/MM/yyyy');

    return (
        <div ref={ref} className='print-container bg-white p-8 font-serif text-black'>
            {/* biome-ignore lint/security/noDangerouslySetInnerHtml: <explanation> */}
            <style
                dangerouslySetInnerHTML={{
                    __html: `
                .print-only { display: none; }
                @media print {
                    .print-only { display: block !important; }
                    .print-container { padding: 0 !important; }
                    .page-break { page-break-after: always; }
                    @page { margin: 1cm; }
                }
                .letter-content { font-size: 14pt; line-height: 1.6; text-align: justify; }
                .letter-header h2 { font-size: 22pt; font-weight: bold; margin-bottom: 2pt; }
                .letter-header h3 { font-size: 18pt; font-weight: bold; margin-bottom: 2pt; }
                .letter-header p { font-size: 12pt; }
                .signature-section { margin-top: 40pt; font-size: 14pt; }
                .hhh { margin-bottom: 15pt; }
            `
                }}
            />

            {students.map((student, index) => (
                <div key={student.amsT_Id} className={`letter-page ${index < students.length - 1 ? 'page-break' : ''}`}>
                    {/* Header */}
                    <div className='letter-header mb-6 border-b pb-4 text-center'>
                        <div className='flex items-center justify-center gap-6'>
                            <div className='flex h-24 w-24 items-center justify-center rounded-full border-4 border-white bg-gradient-to-br from-blue-100 to-purple-100 shadow-lg'>
                                <div className='text-center'>
                                    <div className='font-bold text-3xl text-blue-800'>SRKVS</div>
                                    <div className='text-blue-600 text-xs'>ALUMNI</div>
                                </div>
                            </div>
                            <div>
                                <h2 className='uppercase'>Sri Ramakrishna Vidyashala</h2>
                                <h3 className='text-primary/80 uppercase'>Old Boys' Association</h3>
                                <p className='text-muted-foreground'>Yadavagiri, Mysuru 570 020, Karnataka</p>
                            </div>
                        </div>
                        <div className='mt-2 text-sm italic'>
                            Phone : (0821) 2514000, 2417555 * e-mail : alumnisrkvs@gmail.com * www.srkvs.org
                        </div>
                    </div>

                    <div className='mb-8 flex justify-end font-bold'>Date: {currentDate}</div>

                    {renderLetterBody(student, letterType, displayDateTime)}

                    {/* Footer / Signature */}
                    <div className='signature-section'>
                        <div className='mb-8'>With best wishes,</div>
                        <div className='flex flex-col items-end'>
                            <div className='text-center'>
                                <p className='font-bold'>Yours affectionately,</p>
                                {/* biome-ignore lint/style/useSelfClosingElements: <explanation> */}
                                <div className='h-16'></div>
                                <p className='font-bold uppercase'>Correspondent, SRKVS</p>
                                <p className='font-bold uppercase'>Treasurer, SRKVS OBA</p>
                            </div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
});

LetterTemplates.displayName = 'LetterTemplates';

function renderLetterBody(student: IAlumniLetterStudent, type: string, displayDateTime?: string) {
    switch (type) {
        case 'OBA':
            return (
                <div className='letter-content'>
                    <div className='mb-4'>To,</div>
                    <div className='mb-6 font-bold'>
                        Dear {student.amsT_FirstName},<br />
                        {student.AMST_PerStreet}
                        <br />
                        {student.AMST_PerArea}
                        <br />
                        {student.AMST_PerCity} - {student.AMST_PerPincode}
                    </div>
                    <div className='mb-4 font-bold underline'>Sub: OBA Games Meet on {displayDateTime || '__________'}</div>
                    <div className='mb-6'>Ref:</div>
                    <p className='hhh'>
                        We are planning, as in the previous years, a Games Meet for the Old Boys' Of Vidyashala residing in Mysore and
                        nearby places. It is proposed to play matches between the alumni and the present students in Cricket, Volleyball,
                        Basketball Shuttle badminton, Table Tennis, Handball, Football and Kho-kho, provided there are sufficient number of
                        players for each game from the OBA side.
                    </p>
                    <p className='hhh'>
                        In this connection, the cricket match between the alumni and the present students of Vidyashala will be played on{' '}
                        {displayDateTime || '__________'} at Vidyashala. Other matches will also be played on the same day if sufficient
                        number of players from the OBA side turn up and if time permits.
                    </p>
                    <p className='hhh'>
                        We are happy that your name is proposed to be included in the alumni team. We hope you will make yourself free to
                        participate in the match/ matches on that day.
                    </p>
                    <p className='hhh border-2 border-black p-4 font-bold uppercase'>
                        Kindly confirm your participation by phone (2514000, 2417555) or by e-mail (alumnisrkvs@gmail.com) mentioning the
                        game in which you are willing to participate.
                    </p>
                </div>
            );
        case 'ENR':
        case 'ENR3':
            return (
                <div className='letter-content'>
                    <div className='mb-6 font-bold'>Dear Sri {student.amsT_FatherName},</div>
                    <div className='mb-4 font-bold underline'>Sub: Enrolling your boy as a member of the Old Boys' Association</div>
                    <div className='mb-6'>
                        Ref: Your ward studying in {student.asmcL_ClassName} - {student.amsT_FirstName} ({student.amsT_AdmNo}).
                    </div>
                    <p className='hhh'>
                        We are glad that your boy is preparing well for the ensuing public examination. We hope he will do well in it. He
                        has studied in our institution for {type === 'ENR' ? 'three' : 'two'} years. We trust you desire to continue his
                        association with us in future also. Hence we request you to enroll him as a member of the Old Boys' Association
                        which aims at bringing our alumni together by strengthening their network.
                    </p>
                    <p className='hhh'>
                        The Association organizes programmes like Spiritual Retreats, Regional Meets, Sports and Games Meets etc.
                        exclusively for our old Boys'. It brings out a bi-annual newsletter - Voice of Vidyashala Alumni (VOVA) with latest
                        updates about Vidyashala and OBA.
                    </p>
                    <p className='hhh'>
                        The Association offers two types of membership - Patron (Rs.5000/-) and Life Member (RS.3OOO/-) - both being
                        one-time payments only.
                    </p>
                    <p className='hhh font-bold italic'>
                        Your boy will be enrolled as a Life Member by deducting from his personal deposit an amount of Rs.3000/- towards the
                        above membership fees. You need not send any amount for this.
                    </p>
                    <p className='hhh'>
                        In case, you desire your boy to be enrolled as a patron, you will please send an additional amount of Rs.2000/- in
                        the form of a DD drawn in favour of Sri Ramakrishna Vidyashala, Mysore, with a request letter to enroll him as a
                        patron of the Old Boys' Association.
                    </p>
                </div>
            );
        case 'ADR':
            return (
                <div className='letter-content'>
                    <div className='mb-4'>To,</div>
                    <div className='mb-6 font-bold'>
                        {student.amsT_FirstName},<br />
                        {student.AMST_PerStreet}
                        <br />
                        {student.AMST_PerArea}
                        <br />
                        {student.AMST_PerCity} - {student.AMST_PerPincode}
                    </div>
                    <div className='mb-6 font-bold'>Dear {student.amsT_FirstName},</div>
                    <div className='mb-4 font-bold underline'>Sub: Change of address</div>
                    <div className='mb-6'>Ref:</div>
                    <p className='hhh'>Hope you are doing well.</p>
                    <p className='hhh'>
                        It is very nice of you to have intimated the change in your address. It has been incorporated in our records.
                    </p>
                    <p className='hhh'>Kindly visit the institution whenever you come to Mysore.</p>
                </div>
            );
        case 'PTRN':
            return (
                <div className='letter-content'>
                    <div className='mb-4'>To,</div>
                    <div className='mb-6 font-bold'>
                        Dear {student.amsT_FirstName},<br />
                        {student.AMST_PerStreet}
                        <br />
                        {student.AMST_PerArea}
                        <br />
                        {student.AMST_PerCity} - {student.AMST_PerPincode}
                    </div>
                    <div className='mb-6 font-bold'>Dear {student.amsT_FirstName},</div>
                    <div className='mb-4 font-bold underline'>Sub: Your boy is enrolled as Patron</div>
                    <div className='mb-6'>Ref:</div>
                    <p className='hhh'>
                        We are thankful to you for sending an additional membership subscription of Rs.2000/-. Please find the receipt
                        enclosed.
                    </p>
                    <p className='hhh'>
                        The Life Membership of your boy has been upgraded and he is enrolled as a Patron of the Old Boys' Association. We
                        wish him all the best.
                    </p>
                </div>
            );
        case 'LFMB':
            return (
                <div className='letter-content'>
                    <div className='mb-6 font-bold'>Dear Sri {student.amsT_FatherName},</div>
                    <div className='mb-4 font-bold underline'>Sub: Your boy is enrolled as Life Member</div>
                    <div className='mb-4'>Ref: Your ward: {student.amsT_FirstName}</div>
                    <p className='hhh'>We are glad that you have enrolled your boy as a Life Member of the Old Boys' association.</p>
                    <p className='hhh'>
                        Kindly see that he keeps in touch with the institution in future also. He is welcome to visit the institution
                        whenever convenient to him.
                    </p>
                    <p className='hhh'>
                        Whenever there is any change in his contact particulars, kindly instruct him to intimate the same to us.
                    </p>
                    <p className='hhh'>We wish him all the best in his future endeavours.</p>
                </div>
            );
        default:
            return <div>Select a valid letter type.</div>;
    }
}
