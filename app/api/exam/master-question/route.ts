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
        console.error('[API master-question POST] error:', error?.message);
        return NextResponse.json({ success: false, error: error?.message || 'Backend connection error', data: {} }, { status: 500 });
    }
}
