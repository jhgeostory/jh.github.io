
import { NextResponse } from 'next/server';
import { syncBids } from '@/lib/sync_service';

// Prevent caching this route
export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const result = await syncBids();
        return NextResponse.json(result);
    } catch (error: any) {
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        );
    }
}
