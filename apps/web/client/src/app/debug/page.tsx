'use client';

import { useEffect, useState } from 'react';

export default function DebugPage() {
    const [apiTest, setApiTest] = useState<any>(null);
    const [trpcTest, setTrpcTest] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const testAPIs = async () => {
            // Test simple API
            try {
                const response = await fetch('/api/test');
                const data = await response.json();
                setApiTest({ success: true, data, status: response.status });
            } catch (error: any) {
                setApiTest({ success: false, error: error.message });
            }

            // Test tRPC API
            try {
                const response = await fetch('/api/trpc/health?batch=1&input=%7B%220%22%3A%7B%22json%22%3Anull%7D%7D');
                const data = await response.json();
                setTrpcTest({ success: true, data, status: response.status });
            } catch (error: any) {
                setTrpcTest({ success: false, error: error.message });
            }

            setLoading(false);
        };

        testAPIs();
    }, []);

    if (loading) {
        return <div className="p-8">Loading API tests...</div>;
    }

    return (
        <div className="p-8 space-y-6">
            <h1 className="text-2xl font-bold">API Debug Page</h1>
            
            <div className="space-y-4">
                <div className="border p-4 rounded">
                    <h2 className="text-lg font-semibold">Simple API Test (/api/test)</h2>
                    <div className={`mt-2 p-2 rounded ${apiTest?.success ? 'bg-green-100' : 'bg-red-100'}`}>
                        <pre>{JSON.stringify(apiTest, null, 2)}</pre>
                    </div>
                </div>

                <div className="border p-4 rounded">
                    <h2 className="text-lg font-semibold">tRPC Health Test</h2>
                    <div className={`mt-2 p-2 rounded ${trpcTest?.success ? 'bg-green-100' : 'bg-red-100'}`}>
                        <pre>{JSON.stringify(trpcTest, null, 2)}</pre>
                    </div>
                </div>

                <div className="border p-4 rounded">
                    <h2 className="text-lg font-semibold">Environment Info</h2>
                    <div className="mt-2 p-2 bg-gray-100 rounded">
                        <p><strong>Window location:</strong> {typeof window !== 'undefined' ? window.location.href : 'N/A'}</p>
                        <p><strong>User agent:</strong> {typeof window !== 'undefined' ? navigator.userAgent : 'N/A'}</p>
                    </div>
                </div>
            </div>
        </div>
    );
}