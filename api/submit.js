export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { name, company, email, tel, type, staff } = req.body;

  if (!name || !company || !email) {
    return res.status(400).json({ error: '必須項目が不足しています' });
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'API key not configured' });
  }

  async function sendEmail(to, subject, html) {
    const r = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'スマート店長AI <noreply@uma-s.com>',
        to,
        subject,
        html,
      }),
    });
    if (!r.ok) {
      const err = await r.json();
      throw new Error(JSON.stringify(err));
    }
    return r.json();
  }

  const applicantHtml = `
<div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:32px;background:#fff">
  <div style="background:#1e293b;border-radius:12px;padding:24px;margin-bottom:24px;text-align:center">
    <h1 style="color:#fbbf24;font-size:20px;margin:0">スマート店長AI</h1>
    <p style="color:#94a3b8;font-size:13px;margin:4px 0 0">飲食店向け統合AI業務管理ツール</p>
  </div>
  <p style="color:#1e293b;font-size:15px">${name} 様</p>
  <p style="color:#1e293b;font-size:15px;line-height:1.7">
    この度はスマート店長AIへのデモお申し込みありがとうございます。<br>
    以下のURLよりデモ画面をご体験いただけます。
  </p>
  <div style="text-align:center;margin:32px 0">
    <a href="https://smart-tencho.vercel.app/"
       style="background:#d97706;color:#fff;padding:14px 32px;border-radius:10px;text-decoration:none;font-weight:bold;font-size:15px;display:inline-block">
      デモ画面を開く →
    </a>
    <p style="font-size:12px;color:#94a3b8;margin-top:12px">
      https://smart-tencho.vercel.app/
    </p>
  </div>
  <p style="color:#64748b;font-size:13px;line-height:1.7">
    ご不明な点がございましたら、お気軽にご連絡ください。<br>
    引き続きよろしくお願いいたします。
  </p>
  <hr style="border:none;border-top:1px solid #e2e8f0;margin:24px 0">
  <p style="font-size:11px;color:#94a3b8;text-align:center">スマート店長AI — 飲食店向け統合AI業務管理ツール</p>
</div>`;

  const now = new Date().toLocaleString('ja-JP', { timeZone: 'Asia/Tokyo' });

  const adminHtml = `
<div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:32px;background:#fff">
  <h2 style="color:#d97706;font-size:18px;margin-bottom:24px">【申込通知】デモ申し込みがありました</h2>
  <table style="width:100%;border-collapse:collapse;font-size:14px">
    <tr>
      <td style="padding:10px 12px;border:1px solid #e2e8f0;font-weight:bold;background:#f8fafc;width:35%">お名前</td>
      <td style="padding:10px 12px;border:1px solid #e2e8f0">${name}</td>
    </tr>
    <tr>
      <td style="padding:10px 12px;border:1px solid #e2e8f0;font-weight:bold;background:#f8fafc">店舗名・会社名</td>
      <td style="padding:10px 12px;border:1px solid #e2e8f0">${company}</td>
    </tr>
    <tr>
      <td style="padding:10px 12px;border:1px solid #e2e8f0;font-weight:bold;background:#f8fafc">メールアドレス</td>
      <td style="padding:10px 12px;border:1px solid #e2e8f0"><a href="mailto:${email}" style="color:#d97706">${email}</a></td>
    </tr>
    <tr>
      <td style="padding:10px 12px;border:1px solid #e2e8f0;font-weight:bold;background:#f8fafc">電話番号</td>
      <td style="padding:10px 12px;border:1px solid #e2e8f0">${tel || '未記入'}</td>
    </tr>
    <tr>
      <td style="padding:10px 12px;border:1px solid #e2e8f0;font-weight:bold;background:#f8fafc">業態</td>
      <td style="padding:10px 12px;border:1px solid #e2e8f0">${type || '未選択'}</td>
    </tr>
    <tr>
      <td style="padding:10px 12px;border:1px solid #e2e8f0;font-weight:bold;background:#f8fafc">スタッフ数</td>
      <td style="padding:10px 12px;border:1px solid #e2e8f0">${staff || '未選択'}</td>
    </tr>
  </table>
  <p style="font-size:12px;color:#94a3b8;margin-top:16px">申込日時: ${now}</p>
</div>`;

  try {
    await Promise.all([
      sendEmail(email, '【スマート店長AI】デモ画面のご案内', applicantHtml),
      sendEmail('t@uma-s.com', '【申込通知】スマート店長AI デモ申し込みがありました', adminHtml),
    ]);
    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('Resend error:', err.message);
    return res.status(500).json({ error: 'メール送信に失敗しました' });
  }
}
