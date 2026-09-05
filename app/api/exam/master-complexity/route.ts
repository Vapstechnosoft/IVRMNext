import axios from 'axios';
import { type NextRequest, NextResponse } from 'next/server';

const BACKEND_BASE = 'http://localhost:50006/api/LP_OnlineExamFacade';

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const miId = searchParams.get('MI_Id') || '30';

        const res = await axios.post(`${BACKEND_BASE}/getmastercompliexities`, {
            MI_Id: Number(miId)
        });

        return NextResponse.json({
            success: true,
            data: res.data?.data || res.data || {}
        });
    } catch (error: any) {
        console.error('Error fetching master complexity:', error.message);
        return NextResponse.json(
            {
                success: false,
                error: error.message || 'Failed to fetch master complexity'
            },
            { status: 500 }
        );
    }
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { action, ...payload } = body;

        let targetUrl = `${BACKEND_BASE}/SaveMasterComplexity`;

        if (action === 'toggle') {
            targetUrl = `${BACKEND_BASE}/DeactivateActivateComplexities`;
        } else if (action === 'load') {
            targetUrl = `${BACKEND_BASE}/getmastercompliexities`;
        }

        const res = await axios.post(targetUrl, payload);
        const dto = res.data?.data || res.data || {};
        const message = dto.message || res.data?.message || 'Operation successful';
        const returnval = dto.returnval ?? res.data?.returnval ?? false;

        return NextResponse.json({
            success: res.data?.success !== false,
            data: dto,
            message,
            returnval
        });
    } catch (error: any) {
        console.error('Error in master complexity action:', error.message);
        return NextResponse.json(
            {
                success: false,
                error: error.message || 'Action failed',
                message: error.response?.data?.message || error.message
            },
            { status: 500 }
        );
    }
}
