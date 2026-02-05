import SibApiV3Sdk from '@getbrevo/brevo';
import cron from 'node-cron';
import Event from '../models/eventModel.js';
import User from '../models/userModel.js';

// Initialize Brevo API client
let apiInstance = null;

const initBrevo = () => {
  const apiKey = process.env.BREVO_API_KEY;
  if (apiKey) {
    if (apiKey.startsWith('xsmtpsib-')) {
      console.log('⚠️ Warning: You provided an SMTP key (starts with xsmtpsib-). This service requires a v3 API Key (starts with xkeysib-). Email may fail.');
    }
    apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();
    apiInstance.setApiKey(SibApiV3Sdk.TransactionalEmailsApiApiKeys.apiKey, apiKey);
    console.log('✅ Brevo email service initialized (Web API)');
    return true;
  }
  console.log('⚠️ Brevo API key not found - email notifications disabled');
  return false;
};

// Send email notification via Brevo Web API
const sendEmailNotification = async (userEmail, userName, event, minutesBefore) => {
  if (!apiInstance) {
    console.log('⚠️ Brevo not initialized, skipping email');
    return false;
  }

  const timeText = minutesBefore >= 60 
    ? `${Math.floor(minutesBefore / 60)} hour${minutesBefore >= 120 ? 's' : ''}` 
    : `${minutesBefore} minutes`;

  const eventTime = new Date(event.date).toLocaleString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit'
  });

  const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();
  
  sendSmtpEmail.subject = `⏰ Reminder: ${event.title} in ${timeText}`;
  sendSmtpEmail.htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Event Reminder</title>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
      </style>
    </head>
    <body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
        <!-- Header -->
        <div style="padding: 40px 40px; background: linear-gradient(135deg, #4f46e5 0%, #6366f1 100%); text-align: center;">
          <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 700; letter-spacing: -0.5px;">TaskFlow</h1>
          <p style="margin: 10px 0 0; color: rgba(255, 255, 255, 0.9); font-size: 16px;">Don't miss your upcoming event</p>
        </div>

        <!-- Content -->
        <div style="padding: 40px;">
          <h2 style="margin: 0 0 20px; color: #0f172a; font-size: 20px; font-weight: 600;">Hi ${userName},</h2>
          <p style="margin: 0 0 24px; color: #475569; font-size: 16px; line-height: 1.5;">
            Just a quick reminder that your event <strong style="color: #4f46e5;">"${event.title}"</strong> is starting in <strong>${timeText}</strong>.
          </p>

          <!-- Event Card -->
          <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 24px;">
            <div style="margin-bottom: 16px;">
              <small style="display: block; color: #64748b; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px;">Event</small>
              <div style="color: #0f172a; font-size: 18px; font-weight: 600;">${event.title}</div>
            </div>
            
            <div style="margin-bottom: ${event.description ? '16px' : '0'};">
              <small style="display: block; color: #64748b; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px;">Time</small>
              <div style="color: #334155; font-size: 16px;">📅 ${eventTime}</div>
            </div>

            ${event.description ? `
            <div>
              <small style="display: block; color: #64748b; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px;">Description</small>
              <div style="color: #334155; font-size: 16px; line-height: 1.5;">${event.description}</div>
            </div>
            ` : ''}
          </div>

          <div style="text-align: center; margin-top: 40px;">
            <a href="${process.env.CLIENT_URL || 'http://localhost:3000'}/calendar" style="display: inline-block; padding: 12px 32px; background-color: #0f172a; color: #ffffff; text-decoration: none; font-weight: 500; border-radius: 8px; font-size: 16px; transition: background-color 0.2s;">View Calendar</a>
          </div>
        </div>

        <!-- Footer -->
        <div style="padding: 30px 40px; background-color: #f8fafc; border-top: 1px solid #e2e8f0; text-align: center;">
          <p style="margin: 0; color: #94a3b8; font-size: 12px;">
            Sent with ⚡ by TaskFlow<br>
            You set this reminder for yourself.
          </p>
        </div>
      </div>
    </body>
    </html>
  `;
  sendSmtpEmail.sender = { 
    name: process.env.BREVO_SENDER_NAME || 'TaskFlow',
    email: process.env.BREVO_SENDER_EMAIL || 'noreply@taskflow.app'
  };
  sendSmtpEmail.to = [{ email: userEmail, name: userName }];
  sendSmtpEmail.textContent = `Hi ${userName},\n\nThis is a reminder that "${event.title}" is coming up in ${timeText}.\n\nEvent Details:\n- Title: ${event.title}\n- When: ${eventTime}\n${event.description ? `- Description: ${event.description}` : ''}\n\n— TaskFlow`;

  try {
    const data = await apiInstance.sendTransacEmail(sendSmtpEmail);
    console.log(`📧 Email sent to ${userEmail} for event: ${event.title}`);
    return true;
  } catch (error) {
    console.error('Brevo email error:', error.response?.body || error.message);
    return false;
  }
};

// Check and send pending reminders
const checkAndSendReminders = async () => {
  try {
    const now = new Date();
    
    // Find events with unsent reminders that should be sent now
    const events = await Event.find({
      date: { $gt: now }, // Future events only
      'reminders.sent': false
    }).populate('userId', 'email name');

    for (const event of events) {
      const eventTime = new Date(event.date).getTime();
      
      for (let i = 0; i < event.reminders.length; i++) {
        const reminder = event.reminders[i];
        if (reminder.sent) continue;

        const reminderTime = eventTime - (reminder.timeBefore * 60 * 1000);
        
        // If reminder time has passed or is within the next minute
        if (now.getTime() >= reminderTime) {
          const user = event.userId;
          
          if (reminder.type === 'email' || reminder.type === 'both') {
            const sent = await sendEmailNotification(
              user.email, 
              user.name, 
              event, 
              reminder.timeBefore
            );
            
            if (sent) {
              event.reminders[i].sent = true;
              await event.save();
            }
          }
          
          if (reminder.type === 'push' || reminder.type === 'both') {
            event.reminders[i].sent = true;
            await event.save();
          }
        }
      }
    }
  } catch (error) {
    console.error('Reminder check error:', error);
  }
};

const startReminderScheduler = () => {
  cron.schedule('* * * * *', () => {
    checkAndSendReminders();
  });
  console.log('📅 Reminder scheduler started');
};

export { 
  initBrevo, 
  sendEmailNotification, 
  checkAndSendReminders, 
  startReminderScheduler 
};
