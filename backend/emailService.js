import nodemailer from 'nodemailer';

class EmailService {
  constructor() {
    this.transporter = null;
    this.initialized = false;
  }

  initTransporter() {
    if (this.initialized) return;
    this.initialized = true;

    // Configuration for different email providers
    const emailConfig = {
      // Gmail configuration (you can switch to other providers)
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER, // Your email
        pass: process.env.EMAIL_APP_PASSWORD // App-specific password
      }
    };

    // Alternative SMTP configuration (for other providers)
    const smtpConfig = {
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: process.env.SMTP_PORT || 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_APP_PASSWORD
      }
    };

    // Use Gmail service or SMTP based on configuration
    this.transporter = nodemailer.createTransport(
      process.env.EMAIL_SERVICE === 'smtp' ? smtpConfig : emailConfig
    );
  }

  async sendEmail(to, subject, htmlContent, textContent = '') {
    try {
      if (!this.initialized) {
        this.initTransporter();
      }

      if (!this.transporter) {
        console.log('Email service not configured - email would be sent to:', to);
        return { success: true, message: 'Email service not configured (demo mode)' };
      }

      const mailOptions = {
        from: `"${process.env.COMPANY_NAME || 'Support Desk'}" <${process.env.EMAIL_USER}>`,
        to: to,
        subject: subject,
        html: htmlContent,
        text: textContent || htmlContent.replace(/<[^>]*>/g, '') // Strip HTML for text version
      };

      const result = await this.transporter.sendMail(mailOptions);
      console.log('Email sent successfully:', result.messageId);
      return { success: true, messageId: result.messageId };

    } catch (error) {
      console.error('Email sending failed:', error);
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
            <h2>🎫 New Support Ticket Created</h2>
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


}

export default new EmailService();