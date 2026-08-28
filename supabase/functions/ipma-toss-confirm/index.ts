import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  try {
    const auth = req.headers.get('Authorization') || '';
    if (!auth.startsWith('Bearer ')) throw new Error('로그인이 필요합니다.');

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const serviceRole = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const tossSecret = Deno.env.get('TOSS_SECRET_KEY');
    if (!tossSecret) throw new Error('TOSS_SECRET_KEY가 설정되지 않았습니다.');

    const userDb = createClient(supabaseUrl, anonKey, { global: { headers: { Authorization: auth } } });
    const { data: userData, error: userError } = await userDb.auth.getUser();
    if (userError || !userData.user) throw new Error('로그인 확인에 실패했습니다.');
    const user = userData.user;

    const { paymentKey, orderId, amount, contentCode } = await req.json();
    if (!paymentKey || !orderId || !contentCode) throw new Error('필수 결제 정보가 없습니다.');
    if (!/^[-_A-Za-z0-9]{6,64}$/.test(String(orderId))) throw new Error('주문번호 형식이 올바르지 않습니다.');

    const admin = createClient(supabaseUrl, serviceRole);
    const { data: content, error: contentError } = await admin.from('ipma_paid_contents')
      .select('id,content_code,title,price_amount,currency,is_active').eq('content_code', contentCode).eq('is_active', true).single();
    if (contentError || !content) throw new Error('판매 콘텐츠를 찾을 수 없습니다.');
    if (content.currency !== 'KRW' || Number(amount) !== Number(content.price_amount)) throw new Error('결제 금액 검증에 실패했습니다.');

    const duplicate = await admin.from('ipma_content_purchases').select('id,user_id,content_id,payment_status')
      .or(`order_id.eq.${orderId},provider_payment_key.eq.${paymentKey}`).maybeSingle();
    if (duplicate.data && duplicate.data.user_id === user.id && duplicate.data.payment_status === 'paid') {
      return Response.json({ ok: true, alreadyConfirmed: true }, { headers: corsHeaders });
    }

    const basic = btoa(`${tossSecret}:`);
    const tossRes = await fetch('https://api.tosspayments.com/v1/payments/confirm', {
      method: 'POST',
      headers: { 'Authorization': `Basic ${basic}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ paymentKey, orderId, amount: Number(content.price_amount) }),
    });
    const toss = await tossRes.json();
    if (!tossRes.ok) throw new Error(toss?.message || '토스 결제 승인 API 오류');
    if (toss.orderId !== orderId || Number(toss.totalAmount) !== Number(content.price_amount)) throw new Error('승인 결과 검증에 실패했습니다.');

    const { error: upsertError } = await admin.from('ipma_content_purchases').upsert({
      user_id: user.id,
      content_id: content.id,
      order_id: orderId,
      payment_provider: 'tosspayments',
      provider_payment_key: paymentKey,
      amount_paid: Number(content.price_amount),
      payment_status: 'paid',
      access_status: 'active',
      paid_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }, { onConflict: 'user_id,content_id' });
    if (upsertError) throw upsertError;

    return Response.json({ ok: true, orderId, method: toss.method, status: toss.status }, { headers: corsHeaders });
  } catch (e) {
    return Response.json({ ok: false, message: e instanceof Error ? e.message : String(e) }, { status: 400, headers: corsHeaders });
  }
});
