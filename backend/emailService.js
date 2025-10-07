import nodemailer from 'nodemailer';

class EmailService {
  constructor() {
    this.transporter = null;
    this.initialized = false;
    this.demoMode = false;
    this.allowDemo = process.env.EMAIL_ALLOW_DEMO === 'true' || process.env.NODE_ENV !== 'production';
    this.smtpConfig = null;
    this.fromEmail = process.env.EMAIL_FROM || process.env.EMAIL_USER || null;
    this.fromName = process.env.EMAIL_FROM_NAME || process.env.COMPANY_NAME || 'Support Desk';
  }

  async initTransporter() {
    if (this.initialized) return;
    this.initialized = true;

    const provider = (process.env.EMAIL_SERVICE || '').toLowerCase();
    const sendgridApiKey = (process.env.SENDGRID_API_KEY || process.env.SMTP_PASS || '').trim();
    const requiresSendgrid = provider === 'sendgrid' || (process.env.SMTP_HOST || '').includes('sendgrid');

    if (!this.fromEmail) {
      console.warn('⚠️  EMAIL_FROM (or EMAIL_USER) is not set. Emails will fail to send.');
    }

    if (!sendgridApiKey) {
      this.demoMode = this.allowDemo;
      console.warn('⚠️  SENDGRID_API_KEY / SMTP_PASS not provided. Email service is disabled.');
      if (!this.allowDemo) {
        throw new Error('Email service not configured – set SENDGRID_API_KEY in your environment variables.');
      }
      return;
    }

    if (requiresSendgrid && !sendgridApiKey.startsWith('SG.')) {
      console.warn('⚠️  SendGrid API keys typically start with "SG." – double-check your credentials.');
    }

    const smtpConfig = {
      host: process.env.SMTP_HOST || 'smtp.sendgrid.net',
      port: parseInt(process.env.SMTP_PORT, 10) || 587,
      secure: process.env.SMTP_SECURE === 'true' || false,
      auth: {
        user: process.env.SMTP_USER || 'apikey',
        pass: sendgridApiKey
      },
      tls: {
        rejectUnauthorized: process.env.SMTP_REJECT_UNAUTHORIZED !== 'false'
      }
    };

    this.smtpConfig = smtpConfig;

    console.log('📧 Initializing email service...');
    console.log(`📧 SMTP Host: ${smtpConfig.host}`);
    console.log(`📧 SMTP Port: ${smtpConfig.port}`);
    console.log(`📧 SMTP User: ${smtpConfig.auth.user}`);
    console.log(`📧 FROM Email: ${this.fromEmail || 'not set'}`);

    try {
      this.transporter = nodemailer.createTransport(smtpConfig);
      await this.transporter.verify();
      this.demoMode = false;
      console.log('✅ Email transporter verified and ready.');
    } catch (error) {
      console.error('❌ Failed to verify email transporter:', error.message || error);

      if (!smtpConfig.secure) {
        const fallbackPort = parseInt(process.env.SMTP_FALLBACK_PORT, 10) || 465;
        const fallbackConfig = {
          ...smtpConfig,
          port: fallbackPort,
          secure: true
        };

        console.log(`🔄 Retrying email transporter verification using TLS on port ${fallbackConfig.port}...`);
        try {
          this.transporter = nodemailer.createTransport(fallbackConfig);
          await this.transporter.verify();
          this.smtpConfig = fallbackConfig;
          this.demoMode = false;
          console.log('✅ Email transporter verified using fallback TLS configuration.');
          return;
        } catch (fallbackError) {
          console.error('❌ Fallback verification failed:', fallbackError.message || fallbackError);
        }
      }

      this.transporter = null;
      this.demoMode = this.allowDemo;
      if (!this.allowDemo) {
        throw new Error('Failed to verify email transporter – emails will not be sent.');
      }
    }
  }

  async sendEmail(to, subject, htmlContent, textContent = '') {
    try {
      if (!this.initialized) {
        await this.initTransporter();
      }

      if (!this.transporter) {
        const message = 'Email service is not configured. No email was sent.';
        const payload = {
          success: false,
          error: message,
          demoMode: this.demoMode,
          to,
          subject
        };

        if (this.demoMode) {
          console.warn('📭 Email service running in demo mode – skipping send:', { to, subject });
        } else {
          console.error('❌ Email transporter unavailable. Check SendGrid/SMTP configuration.');
        }

        return payload;
      }

      if (!this.fromEmail) {
        throw new Error('EMAIL_FROM (or EMAIL_USER) must be configured to send emails.');
      }

      const fromName = this.fromName;
      const fromEmail = this.fromEmail;

      const mailOptions = {
        from: `"${fromName}" <${fromEmail}>`,
        to: to,
        subject: subject,
        html: htmlContent,
        text: textContent || htmlContent.replace(/<[^>]*>/g, '') // Strip HTML for text version
      };

      console.log(`📧 Sending email to: ${to}`);
      console.log(`📧 From: ${mailOptions.from}`);
      console.log(`📧 Subject: ${subject}`);

      const result = await this.transporter.sendMail(mailOptions);
      console.log('✅ Email sent successfully:', result.messageId);
      return { success: true, messageId: result.messageId };

    } catch (error) {
      console.error('❌ Email sending failed:', error);
      return { success: false, error: error.message };
    }
  }

  // Template for new ticket notification to support team
  generateNewTicketEmailToSupport(ticket, customerInfo) {
    const subject = `🎫 New Support Ticket #${ticket.id} - ${ticket.priority} Priority`;
    
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 8px 8px 0 0; }
          .content { background: #f9f9f9; padding: 20px; border: 1px solid #ddd; }
          .ticket-info { background: white; padding: 15px; border-radius: 5px; margin: 10px 0; }
          .priority-high { border-left: 4px solid #e74c3c; }
          .priority-medium { border-left: 4px solid #f39c12; }
          .priority-low { border-left: 4px solid #27ae60; }
          .footer { background: #333; color: white; text-align: center; padding: 15px; border-radius: 0 0 8px 8px; }
          .btn { display: inline-block; background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin: 10px 5px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h2>🎫New Support Ticket Created</h2>
            <p>A new support ticket has been submitted and needs your attention.</p>
          </div>
          
          <div class="content">
            <div class="ticket-info priority-${ticket.priority?.toLowerCase()}">
              <h3>Ticket Details</h3>
              <p><strong>Ticket ID:</strong> #${ticket.id}</p>
              <p><strong>Title:</strong> ${ticket.title}</p>
              <p><strong>Priority:</strong> <span style="text-transform: capitalize; font-weight: bold;">${ticket.priority}</span></p>
              <p><strong>Category:</strong> ${ticket.category}</p>
              <p><strong>Status:</strong> ${ticket.status}</p>
              <p><strong>Created:</strong> ${new Date(ticket.createdAt || Date.now()).toLocaleString()}</p>
            </div>

            <div class="ticket-info">
              <h3>Customer Information</h3>
              <p><strong>Name:</strong> ${customerInfo.name || 'Not provided'}</p>
              <p><strong>Email:</strong> ${customerInfo.email || 'Not provided'}</p>
              <p><strong>Phone:</strong> ${customerInfo.phone || 'Not provided'}</p>
              
            </div>

            <div class="ticket-info">
              <h3>Problem Description</h3>
              <p>${ticket.description.replace(/\n/g, '<br>')}</p>
            </div>

            <div style="text-align: center; margin: 20px 0;">
              <a href="${process.env.FRONTEND_URL || 'http://localhost:5174'}/tickets/${ticket.id}" class="btn">
                📝 View & Respond to Ticket
              </a>
              <a href="${process.env.FRONTEND_URL || 'http://localhost:5174'}/dashboard" class="btn">
                📊 Go to Dashboard
              </a>
            </div>
          </div>

          <div class="footer">
            <p>This is an automated notification from ${process.env.COMPANY_NAME || 'Support Desk'}</p>
            <p>Please respond to this ticket as soon as possible</p>
          </div>
        </div>
      </body>
      </html>
    `;

    return { subject, html };
  }

  // Template for ticket confirmation to customer
  generateTicketConfirmationToCustomer(ticket, customerInfo) {
    const subject = `✅ Support Ticket #${ticket.id} Created - We're Here to Help!`;
    
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 8px 8px 0 0; text-align: center; }
          .content { background: #f9f9f9; padding: 20px; border: 1px solid #ddd; }
          .ticket-info { background: white; padding: 15px; border-radius: 5px; margin: 10px 0; }
          .footer { background: #333; color: white; text-align: center; padding: 15px; border-radius: 0 0 8px 8px; }
          .status-badge { background: #27ae60; color: white; padding: 5px 15px; border-radius: 20px; display: inline-block; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h2>✅ Your Support Ticket Has Been Created!</h2>
            <p>Thank you for contacting us. We've received your request and our team will respond soon.</p>
          </div>
          
          <div class="content">
            <p>Dear ${customerInfo.name || 'Valued Customer'},</p>
            
            <p>We've successfully received your support ticket and wanted to confirm the details:</p>

            <div class="ticket-info">
              <h3>Your Ticket Information</h3>
              <p><strong>Ticket ID:</strong> <span style="font-size: 18px; color: #667eea;">#${ticket.id}</span></p>
              <p><strong>Subject:</strong> ${ticket.title}</p>
              <p><strong>Priority Level:</strong> <span style="text-transform: capitalize;">${ticket.priority}</span></p>
              <p><strong>Category:</strong> ${ticket.category}</p>
              <p><strong>Current Status:</strong> <span class="status-badge">${ticket.status}</span></p>
              <p><strong>Submitted:</strong> ${new Date(ticket.createdAt || Date.now()).toLocaleString()}</p>
            </div>

            <div class="ticket-info">
              <h3>What You Can Expect</h3>
              <ul>
                <li><strong>Response Time:</strong> We aim to respond within 24 hours</li>
                <li><strong>Updates:</strong> You'll receive email notifications for any updates</li>
                <li><strong>Communication:</strong> Reply to this email to add information to your ticket</li>
                <li><strong>Resolution:</strong> We'll notify you when your issue is resolved</li>
              </ul>
            </div>

            <div class="ticket-info">
              <h3>Need Immediate Help?</h3>
              <p>If this is urgent, you can:</p>
              <ul>
                <li>Reply to this email with "URGENT" in the subject line</li>
                <li>Contact our live chat on our website</li>
                <li>Call our support hotline: ${process.env.SUPPORT_PHONE || '(555) 123-4567'}</li>
              </ul>
            </div>
          </div>

          <div class="footer">
            <p><strong>Ticket Reference:</strong> #${ticket.id}</p>
            <p>Keep this email for your records. Reply to add more information to your ticket.</p>
            <p>${process.env.COMPANY_NAME || 'Support Desk'} - We're here to help! 🚀</p>
          </div>
        </div>
      </body>
      </html>
    `;

    return { subject, html };
  }

  // Template for ticket resolution notification to customer
  generateResolutionEmailToCustomer(ticket, customerInfo, resolutionMessage, resolvedBy) {
    const subject = `🎉 Ticket #${ticket.id} Resolved - ${ticket.title}`;
    
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #27ae60 0%, #2ecc71 100%); color: white; padding: 20px; border-radius: 8px 8px 0 0; text-align: center; }
          .content { background: #f9f9f9; padding: 20px; border: 1px solid #ddd; }
          .ticket-info { background: white; padding: 15px; border-radius: 5px; margin: 10px 0; }
          .resolution-box { background: #d4edda; border: 1px solid #c3e6cb; padding: 15px; border-radius: 5px; margin: 15px 0; }
          .footer { background: #333; color: white; text-align: center; padding: 15px; border-radius: 0 0 8px 8px; }
          .btn { display: inline-block; background: #27ae60; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin: 10px 5px; }
          .rating-section { background: #e3f2fd; border: 1px solid #bbdefb; padding: 15px; border-radius: 5px; text-align: center; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h2>🎉 Great News! Your Ticket Has Been Resolved</h2>
            <p>We're happy to let you know that your support ticket has been successfully resolved.</p>
          </div>
          
          <div class="content">
            <p>Dear ${customerInfo.name || 'Valued Customer'},</p>
            
            <p>We're pleased to inform you that your support ticket has been resolved by our team.</p>

            <div class="ticket-info">
              <h3>Ticket Summary</h3>
              <p><strong>Ticket ID:</strong> #${ticket.id}</p>
              <p><strong>Original Issue:</strong> ${ticket.title}</p>
              <p><strong>Category:</strong> ${ticket.category}</p>
              <p><strong>Resolved By:</strong> ${resolvedBy}</p>
              <p><strong>Resolution Date:</strong> ${new Date().toLocaleString()}</p>
            </div>

            <div class="resolution-box">
              <h3>✅ Resolution Details</h3>
              <p>${resolutionMessage.replace(/\n/g, '<br>')}</p>
            </div>

            <div class="ticket-info">
              <h3>What Happens Next?</h3>
              <ul>
                <li>Your ticket is now marked as <strong>resolved</strong></li>
                <li>If you're satisfied with the solution, no further action is needed</li>
                <li>If you need additional help, simply reply to this email</li>
                <li>We'll reopen your ticket if you respond within 7 days</li>
              </ul>
            </div>

            <div class="rating-section">
              <h3>📝 How Did We Do?</h3>
              <p>We'd love to hear about your experience! Your feedback helps us improve our service.</p>
              <div style="margin: 15px 0;">
                <a href="${process.env.FRONTEND_URL || 'http://localhost:5174'}/feedback?ticket=${ticket.id}&rating=5" class="btn" style="background: #27ae60;">😊 Excellent</a>
                <a href="${process.env.FRONTEND_URL || 'http://localhost:5174'}/feedback?ticket=${ticket.id}&rating=3" class="btn" style="background: #f39c12;">😐 Good</a>
                <a href="${process.env.FRONTEND_URL || 'http://localhost:5174'}/feedback?ticket=${ticket.id}&rating=1" class="btn" style="background: #e74c3c;">😞 Needs Improvement</a>
              </div>
            </div>
          </div>

          <div class="footer">
            <p><strong>Ticket #${ticket.id}</strong> - Resolved</p>
            <p>Thank you for choosing ${process.env.COMPANY_NAME || 'Support Desk'}!</p>
            <p>Need help with something else? Contact us anytime! 💪</p>
          </div>
        </div>
      </body>
      </html>
    `;

    return { subject, html };
  }

  // Send new ticket notification to all support agents
  async notifyNewTicket(ticket, customerInfo, supportAgents) {
    const { subject, html } = this.generateNewTicketEmailToSupport(ticket, customerInfo);
    const results = [];

    // Send to all support agents
    for (const agent of supportAgents) {
      if (agent.email) {
        const result = await this.sendEmail(agent.email, subject, html);
        results.push({ agent: agent.email, result });
      }
    }

    // Send confirmation to customer
    if (customerInfo.email) {
      const customerEmail = this.generateTicketConfirmationToCustomer(ticket, customerInfo);
      const customerResult = await this.sendEmail(
        customerInfo.email, 
        customerEmail.subject, 
        customerEmail.html
      );
      results.push({ customer: customerInfo.email, result: customerResult });
    }

    return results;
  }

  // Send resolution notification to customer
  async notifyTicketResolution(ticket, customerInfo, resolutionMessage, resolvedBy) {
    if (!customerInfo.email) {
      return { success: false, error: 'Customer email not provided' };
    }

    const { subject, html } = this.generateResolutionEmailToCustomer(
      ticket, 
      customerInfo, 
      resolutionMessage, 
      resolvedBy
    );

    return await this.sendEmail(customerInfo.email, subject, html);
  }

  // Template for new message notification
  generateNewMessageEmail(ticket, message, recipientInfo, senderInfo) {
    const subject = `💬 New Message on Ticket #${ticket.id || ticket._id} - ${ticket.title}`;
    
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 8px 8px 0 0; }
          .content { background: #f9f9f9; padding: 20px; border: 1px solid #ddd; }
          .message-box { background: white; padding: 15px; border-radius: 5px; margin: 15px 0; border-left: 4px solid #667eea; }
          .sender-info { color: #667eea; font-weight: bold; margin-bottom: 5px; }
          .message-content { margin: 10px 0; line-height: 1.8; }
          .ticket-info { background: white; padding: 15px; border-radius: 5px; margin: 10px 0; }
          .btn { display: inline-block; padding: 12px 24px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 10px 5px; }
          .footer { background: #333; color: white; text-align: center; padding: 15px; border-radius: 0 0 8px 8px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h2>💬 New Message Received</h2>
            <p>You have a new message on your support ticket.</p>
          </div>
          
          <div class="content">
            <p>Hi ${recipientInfo.name || 'there'},</p>
            
            <p>You've received a new message regarding your support ticket:</p>

            <div class="ticket-info">
              <p><strong>Ticket ID:</strong> #${ticket.id || ticket._id}</p>
              <p><strong>Subject:</strong> ${ticket.title}</p>
              <p><strong>Status:</strong> ${ticket.status}</p>
            </div>

            <div class="message-box">
              <div class="sender-info">
                From: ${senderInfo.name}
                <span style="color: #999; font-weight: normal; margin-left: 10px;">
                  ${new Date(message.timestamp).toLocaleString()}
                </span>
              </div>
              <div class="message-content">
                ${message.content.replace(/\n/g, '<br>')}
              </div>
            </div>

            <p style="margin-top: 20px;">
              <a href="${process.env.FRONTEND_URL || 'http://localhost:5174'}/tickets/${ticket.id || ticket._id}" class="btn">
                📝 View & Reply to Ticket
              </a>
            </p>

            <p style="color: #666; font-size: 14px; margin-top: 20px;">
              💡 <strong>Tip:</strong> You can reply to this email directly, and your response will be added to the ticket.
            </p>
          </div>

          <div class="footer">
            <p><strong>Ticket #${ticket.id || ticket._id}</strong> - ${ticket.status}</p>
            <p>Thank you for using ${process.env.COMPANY_NAME || 'Support Desk'}!</p>
          </div>
        </div>
      </body>
      </html>
    `;

    return { subject, html };
  }

  // Send new message notification
  async notifyNewMessage(ticket, message, recipientUser, senderUser) {
    try {
      if (!recipientUser || !recipientUser.email) {
        console.log('⚠️  No recipient email provided for message notification');
        return { success: false, error: 'No recipient email provided' };
      }

      console.log(`📧 Sending new message notification to: ${recipientUser.email}`);
      console.log(`📧 Message from: ${senderUser.name}`);
      console.log(`📧 Ticket: #${ticket.id || ticket._id}`);

      const { subject, html } = this.generateNewMessageEmail(
        ticket,
        message,
        recipientUser,
        senderUser
      );

      const result = await this.sendEmail(recipientUser.email, subject, html);
      
      if (result.success) {
        console.log(`✅ Message notification sent to ${recipientUser.email}`);
      } else {
        console.error(`❌ Failed to send message notification to ${recipientUser.email}`);
      }

      return result;
    } catch (error) {
      console.error('❌ Error sending message notification:', error);
      return { success: false, error: error.message };
    }
  }

  getStatus() {
    return {
      initialized: this.initialized,
      ready: !!this.transporter,
      demoMode: this.demoMode,
      allowDemo: this.allowDemo,
      host: this.smtpConfig?.host || process.env.SMTP_HOST || 'smtp.sendgrid.net',
      port: this.smtpConfig?.port || (process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT, 10) : 587),
      fromEmail: this.fromEmail,
      provider: process.env.EMAIL_SERVICE || 'smtp'
    };
  }

}

export default new EmailService();