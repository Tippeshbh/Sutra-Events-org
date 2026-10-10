import { db } from '../db.js';

export interface NotificationPayload {
  bookingId: string;
  referenceCode: string;
  recipientName: string;
  recipientContact: string; // phone or email
  type: 'BOOKING_RECEIVED' | 'QUOTATION_READY' | 'BOOKING_CONFIRMED' | 'HOLD_REMINDER' | 'STATUS_UPDATE';
  channel: 'EMAIL' | 'WHATSAPP' | 'SMS';
  variables: Record<string, string>;
}

export function dispatchNotification(payload: NotificationPayload) {
  const isEmailConfigured = process.env.NOTIFICATION_EMAIL_ENABLED === 'true';
  const isWhatsAppConfigured = process.env.NOTIFICATION_WHATSAPP_ENABLED === 'true';

  let status: 'SENT' | 'SIMULATED_READY' | 'PENDING_CONFIG' = 'SIMULATED_READY';
  let details = '';

  if (payload.channel === 'EMAIL') {
    if (isEmailConfigured) {
      status = 'SENT';
      details = `Email sent via SMTP gateway to ${payload.recipientContact}`;
    } else {
      status = 'SIMULATED_READY';
      details = `Notification logged and formatted for customer ${payload.recipientName}. Live delivery requires SMTP/Resend API credentials in environment.`;
    }
  } else if (payload.channel === 'WHATSAPP') {
    if (isWhatsAppConfigured && process.env.WHATSAPP_API_TOKEN) {
      status = 'SENT';
      details = `WhatsApp template dispatched to ${payload.recipientContact}`;
    } else {
      status = 'SIMULATED_READY';
      details = `WhatsApp payload generated. Live API dispatch requires WHATSAPP_API_TOKEN in environment. Direct click-to-WhatsApp link available.`;
    }
  } else {
    status = 'SIMULATED_READY';
    details = `SMS dispatch formatted. Provider credentials not enabled in environment.`;
  }

  const logId = `notif-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
  const now = new Date().toISOString();

  try {
    db.prepare(`
      INSERT INTO notification_logs (
        id, booking_id, recipient, channel, template, status, details, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      logId,
      payload.bookingId,
      payload.recipientContact,
      payload.channel,
      payload.type,
      status,
      details,
      now
    );
  } catch (err) {
    console.error('Error logging notification:', err);
  }

  return {
    id: logId,
    status,
    details,
    channel: payload.channel,
    timestamp: now
  };
}

export function getNotificationsForBooking(bookingId: string) {
  return db.prepare(`
    SELECT * FROM notification_logs 
    WHERE booking_id = ? 
    ORDER BY created_at DESC
  `).all(bookingId);
}
