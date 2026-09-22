import { getToken } from '@vercel/connect';

const MAX_FIELD_LENGTH = 500;

function getText(value) {
  return typeof value === 'string' ? value.trim().slice(0, MAX_FIELD_LENGTH) : '';
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const allowedOrigins = new Set([
    'https://exaltdigitalmedia.com',
    'https://www.exaltdigitalmedia.com',
  ]);
  const origin = req.headers.origin;
  if (origin && !allowedOrigins.has(origin)) {
    return res.status(403).json({ error: 'Invalid request origin.' });
  }

  const { businessName, name, phone, email, plan, companyWebsite } = req.body || {};
  if (getText(companyWebsite)) {
    return res.status(400).json({ error: 'Invalid submission.' });
  }

  const lead = {
    businessName: getText(businessName),
    name: getText(name),
    phone: getText(phone),
    email: getText(email),
    plan: getText(plan),
  };

  if (Object.values(lead).some((value) => !value) || !/^\S+@\S+\.\S+$/.test(lead.email)) {
    return res.status(400).json({ error: 'Please provide all required fields.' });
  }

  const { MAILGUN_DOMAIN, LEAD_RECIPIENT } = process.env;
  if (!MAILGUN_DOMAIN || !LEAD_RECIPIENT) {
    console.error('Mailgun delivery settings are not configured');
    return res.status(500).json({ error: 'Email delivery is not configured.' });
  }

  const fields = new URLSearchParams({
    from: `Exalt Digital Leads <postmaster@${MAILGUN_DOMAIN}>`,
    to: LEAD_RECIPIENT,
    subject: `New ${lead.plan} trial lead: ${lead.businessName}`,
    text: [
      `Business: ${lead.businessName}`,
      `Contact: ${lead.name}`,
      `Email: ${lead.email}`,
      `Phone: ${lead.phone}`,
      `Selected plan: ${lead.plan}`,
    ].join('\n'),
  });

  try {
    const mailgunApiKey = process.env.MAILGUN_API_KEY || await getToken('api.mailgun.net/coral-harbor', {
      subject: { type: 'app' },
    });
    const response = await fetch(`https://api.mailgun.net/v3/${MAILGUN_DOMAIN}/messages`, {
      method: 'POST',
      headers: {
        Authorization: `Basic ${Buffer.from(`api:${mailgunApiKey}`).toString('base64')}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: fields,
    });

    if (!response.ok) {
      console.error('Mailgun rejected lead email', response.status);
      return res.status(502).json({ error: 'Unable to deliver lead email.' });
    }

    return res.status(200).json({ ok: true });
  } catch (error) {
    console.error('Mailgun lead delivery failed', error);
    return res.status(502).json({ error: 'Unable to deliver lead email.' });
  }
}
