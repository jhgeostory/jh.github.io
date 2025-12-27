
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function SyncButton() {
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleSync = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/sync');
            const data = await res.json();

            if (data.success) {
                if (data.totalNew > 0) {
                    alert(`동기화 완료! ${data.totalNew}건의 새로운 공고를 찾았습니다.`);
                } else {
                    alert('동기화 완료. 새로운 공고가 없습니다.');
                }
                router.refresh(); // Refresh server component data
            } else {
                alert('오류 발생: ' + data.error);
            }
        } catch (e) {
            alert('동기화 요청 실패');
        } finally {
            setLoading(false);
        }
    };

    return (
        <button
            onClick={handleSync}
            disabled={loading}
            className={`px-4 py-2 rounded-lg text-sm font-medium text-white transition-colors
        ${loading
                    ? 'bg-blue-300 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700 shadow-sm active:transform active:scale-95'
                }`}
        >
            {loading ? (
                <span className="flex items-center gap-2">
                    <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    동기화 중...
                </span>
            ) : (
                '🔄 최신 데이터 동기화'
            )}
        </button>
    );
}
