import { auth } from '@/lib/auth';
import { type NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

const BACKEND_BASE = (process.env.LESSONPLANNER_API_BASE_URL || 'http://localhost:5000/api').replace(/\/$/, '');

export async function GET(req: NextRequest) {
    try {
        const session = await auth();
        const token = session?.token;
        const { searchParams } = new URL(req.url);
        const miId = searchParams.get('MI_Id') || '30';

        const res = await axios.get(`${BACKEND_BASE}/MasterComplexityFacade?MI_Id=${miId}`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return NextResponse.json({ success: true, data: res.data || {} });
    } catch (error: any) {
        console.error('Error fetching master complexity:', error.message);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const session = await auth();
        const token = session?.token;
        const body = await req.json();
        const { action, ...payload } = body;
        
        let targetUrl = `${BACKEND_BASE}/SaveMasterComplexity`;

        if (action === 'toggle') {
            targetUrl = `${BACKEND_BASE}/DeactivateActivateComplexities`;
        } else if (action === 'delete') {
            targetUrl = `${BACKEND_BASE}/DeleteComplexity`;
        } else if (action === 'load') {
            targetUrl = `${BACKEND_BASE}/getmastercompliexities`;
        }

        const res = await axios.post(targetUrl, payload, config);

        const dto = res.data || {};
        return NextResponse.json({
            success: dto.success !== false,
            data: dto,
            message: dto.message || 'Operation successful',
            returnval: dto.returnval ?? false
        });
    } catch (error: any) {
        console.error('Error in master complexity action:', error.message);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest) {
    try {
        const session = await auth();
        const token = session?.token;
        const body = await req.json();
        const res = await axios.delete(`${BACKEND_BASE}/MasterComplexityFacade/delete/${body.LPMCOMP_Id}`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return NextResponse.json({ success: true, data: res.data });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
