import { RedisCacheService } from '@/app/apis/redis-cache-service';

export async function GET(request: Request, { params }: { params: { key: string } }) {
  const key = params.key;
  const data = await RedisCacheService.get(key);
  
  if (data === null) {
    return new Response('Cache miss', { status: 404 });
  }
  
  return new Response(JSON.stringify(data), {
    headers: { 'Content-Type': 'application/json' },
  });
}

export async function POST(request: Request, { params }: { params: { key: string } }) {
  const key = params.key;
  const body = await request.json();
  const { data, expiresIn = 5 * 60 * 1000 } = body;
  
  await RedisCacheService.set(key, data, expiresIn);
  
  return new Response(JSON.stringify({ success: true }), {
    headers: { 'Content-Type': 'application/json' },
  });
}

export async function DELETE(request: Request, { params }: { params: { key: string } }) {
  const key = params.key;
  await RedisCacheService.invalidate(key);
  
  return new Response(JSON.stringify({ success: true }), {
    headers: { 'Content-Type': 'application/json' },
  });
}