import { auth } from '@/lib/auth';
import { api } from '@/lib/apiService';
import { NextResponse } from 'next/server';

export async function GET() {
    try {
        const session = await auth();
        if (!session) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

        const [mainRes, subRes, pageRes] = await Promise.all([
            api.get<any>('preadmission', '/configuration/get_main_module_list').catch((err: any) => ({ __error: String(err) })),
            api.get<any>('preadmission', '/configuration/get_submodule_list').catch((err: any) => ({ __error: String(err) })),
            api.get<any>('preadmission', '/configuration/get_page_list').catch((err: any) => ({ __error: String(err) }))
        ]);

        const info = (res: any) => ({
            isNull: res === null || res === undefined,
            isArray: Array.isArray(res),
            type: typeof res,
            keys: res && typeof res === 'object' ? Object.keys(res) : null,
            success: (res as any)?.success,
            message: (res as any)?.message,
            dataIsArray: Array.isArray((res as any)?.data),
            dataLength: Array.isArray((res as any)?.data) ? (res as any).data.length : null,
            hasValues: !!(res as any)?.["$alues"],
            error: (res as any)?.__error,
            firstItem: Array.isArray((res as any)?.data) ? JSON.stringify((res as any).data[0]) : null
        });

        return NextResponse.json({ session: { role: session?.role, user: session?.username }, main: info(mainRes), sub: info(subRes), pages: info(pageRes) });
    } catch (e: any) {
        return NextResponse.json({ error: e?.message }, { status: 500 });
    }
}
