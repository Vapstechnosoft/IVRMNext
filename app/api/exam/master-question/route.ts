import axios from 'axios';
import { type NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const miId = searchParams.get('MI_Id') ? Number(searchParams.get('MI_Id')) : 30;

        const backendRes = await axios.post(
            'http://localhost:50006/api/LP_OnlineExamFacade/getloaddata',
            {
                MI_Id: miId
            },
            {
                headers: {
                    'Content-Type': 'application/json'
                },
                timeout: 10000
            }
        );

        const data = backendRes.data?.data || backendRes.data || {};
        return NextResponse.json({ success: true, data });
    } catch (error: any) {
        console.error('[API master-question GET] error:', error?.message);
        return NextResponse.json({ success: false, error: error?.message || 'Backend connection error', data: {} }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const miId = body?.MI_Id ? Number(body.MI_Id) : 30;

        let endpoint = 'getloaddata';
        let payload: any = { MI_Id: miId, ...body };

        if (body.action === 'save' || body.LPMOEQ_Question || body.LMSMOEQ_Question) {
            endpoint = 'SaveMasterQuestionDetails';
            payload = {
                MI_Id: miId,
                Userid: body.Userid || 231,
                LPMOEQ_Id: Number(body.LPMOEQ_Id ?? body.LMSMOEQ_Id ?? 0),
                ISMS_Id: Number(body.ISMS_Id ?? body.ismS_Id ?? 0),
                ASMCL_Id: Number(body.ASMCL_Id ?? body.asmcL_Id ?? 397),
                LPMT_Id: Number(body.LPMT_Id ?? body.lpmT_Id ?? 16),
                LPMCOMP_Id: Number(body.LPMCOMP_Id ?? body.lpmcomP_Id ?? body.LMSMOECX_Id ?? body.lmsmoecX_Id ?? 1),
                LPMOEQ_Question: body.LPMOEQ_Question ?? body.LMSMOEQ_Question ?? '',
                LPMOEQ_QuestionDesc: body.LPMOEQ_QuestionDesc ?? body.LMSMOEQ_QuestionDesc ?? '',
                LPMOEQ_Marks: Number(body.LPMOEQ_Marks ?? body.LMSMOEQ_Marks ?? 1),
                LPMOEQ_SubjectiveFlg: Boolean(body.LPMOEQ_SubjectiveFlg ?? false),
                LPMOEQ_MatchTheFollowingFlg: Boolean(body.LPMOEQ_MatchTheFollowingFlg ?? false),
                LPMOEQ_StructuralFlg: body.LPMOEQ_StructuralFlg || '',
                LPMOEQ_Answer: body.LPMOEQ_Answer || '',
                LPMOEQ_NoOfOptions: Number(body.LPMOEQ_NoOfOptions || 0),
                LPMOEQ_MFRowCount: 0,
                LPMOEQ_MFColumnCount: 0,
                classlist: (body.classlist || [{ ASMCL_Id: Number(body.ASMCL_Id ?? body.asmcL_Id ?? 397) }]).map((c: any) => ({
                    ASMCL_Id: typeof c === 'number' ? c : (c.ASMCL_Id ?? c.asmcL_Id ?? 397)
                })),
                tempoptionsDTO: (body.tempoptionsDTO || body.questionOptions || []).map((opt: any, idx: number) => ({
                    LPMOEQOA_Id: Number(opt.LPMOEQOA_Id ?? opt.lmsmoeqoA_Id ?? 0),
                    LPMOEQOA_Option: opt.LPMOEQOA_Option ?? opt.lmsmoeqoA_Option ?? opt.option ?? '',
                    LPMOEQOA_OptionCode: opt.LPMOEQOA_OptionCode ?? String.fromCharCode(65 + idx),
                    LPMOEQOA_AnswerFlag: Boolean(opt.LPMOEQOA_AnswerFlag ?? opt.lmsmoeqoA_AnswerFlag ?? false),
                    LPMOEQOA_Marks: Number(opt.LPMOEQOA_Marks ?? opt.lmsmoeqoA_Marks ?? 1),
                    LPMOEQOA_Order: idx + 1
                })),
                tempfilesDTO: (body.tempfilesDTO || body.questionFiles || []).map((file: any) => ({
                    LPMOEQF_Id: Number(file.LPMOEQF_Id ?? 0),
                    LPMOEQF_FileName: file.LPMOEQF_FileName ?? file.fileName ?? '',
                    LPMOEQF_FilePath: file.LPMOEQF_FilePath ?? file.filePath ?? '',
                    LPMOEQF_ActiveFlag: true
                }))
            };
        } else if (body.action === 'options') {
            endpoint = 'ViewMasterQuesOptions';
        } else if (body.action === 'toggle') {
            endpoint = 'DeactivateActivateQuestion';
        }

        const backendRes = await axios.post(`http://localhost:50006/api/LP_OnlineExamFacade/${endpoint}`, payload, {
            headers: {
                'Content-Type': 'application/json'
            },
            timeout: 15000
        });

        const data = backendRes.data?.data || backendRes.data || {};
        return NextResponse.json({ success: true, ...backendRes.data, data });
    } catch (error: any) {
        console.error('[API master-question POST] error:', error?.message);
        return NextResponse.json(
            { success: false, error: error?.message || 'Backend connection error', message: error?.message },
            { status: 500 }
        );
    }
}
