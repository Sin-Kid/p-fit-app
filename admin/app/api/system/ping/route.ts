import { NextResponse } from 'next/server';
import net from 'net';

export async function POST(request: Request) {
  try {
    const { host = '127.0.0.1', port = 80 } = await request.json();
    const startTime = performance.now();

    const result = await new Promise<{ ok: boolean; latencyMs: number; error?: string }>((resolve) => {
      const socket = new net.Socket();
      socket.setTimeout(2500);

      socket.connect(port, host, () => {
        const latency = Math.round(performance.now() - startTime);
        socket.destroy();
        resolve({ ok: true, latencyMs: latency });
      });

      socket.on('error', (err) => {
        const latency = Math.round(performance.now() - startTime);
        socket.destroy();
        resolve({ ok: false, latencyMs: latency, error: err.message });
      });

      socket.on('timeout', () => {
        socket.destroy();
        resolve({ ok: false, latencyMs: 2500, error: 'Connection timed out' });
      });
    });

    return NextResponse.json({
      host,
      port,
      reachable: result.ok,
      latencyMs: result.latencyMs,
      error: result.error,
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}
