# Email System Setup Guide

Your support ticket system now includes comprehensive email notifications! Here's how to set it up:

## 🔧 Email Configuration

### Backend Setup (Required)

1. **Configure Gmail App Password** (Recommended):

   - Go to [Google Account Settings](https://myaccount.google.com/)
   - Navigate to Security → 2-Step Verification
   - Generate an "App Password" for Mail
   - Copy the 16-character app password

2. **Update Backend Environment Variables**:
   Edit `backend/.env` and configure:
   ```env
   # Email Configuration
   EMAIL_USER=your-email@gmail.com
   EMAIL_APP_PASSWORD=your-16-char-app-password
   EMAIL_SERVICE=gmail
   COMPANY_NAME=Your Support Desk
   SUPPORT_PHONE=(555) 123-4567
   FRONTEND_URL=http://localhost:5174
   ```

### Alternative Email Providers

#### Using Custom SMTP Server:

```env
EMAIL_SERVICE=smtp
SMTP_HOST=smtp.yourdomain.com
SMTP_PORT=587
EMAIL_USER=support@yourdomain.com
EMAIL_APP_PASSWORD=your-password
```

#### Using Outlook/Hotmail:

```env
EMAIL_SERVICE=smtp
SMTP_HOST=smtp-mail.outlook.com
SMTP_PORT=587
EMAIL_USER=your-email@outlook.com
EMAIL_APP_PASSWORD=your-password
```

## 📧 Email Features

### 1. **New Ticket Notifications**

- **To Support Team**: All agents and administrators receive emails when tickets are created
- **To Customer**: Confirmation email with ticket details and reference number

### 2. **Resolution Notifications**

- **To Customer**: Professional resolution email with solution details
- **Feedback Links**: Customers can rate the support experience
- **Reopen Option**: Customers can reply to reopen tickets within 7 days

### 3. **Email Templates**

- **Professional Design**: Responsive HTML templates with your branding
- **Customizable**: Edit templates in `backend/emailService.js`
- **Multi-language Ready**: Templates support different languages

## 🚀 How to Use

### For Customers:

1. Create a ticket → Receive confirmation email immediately
2. Get updates via email when status changes
3. Receive resolution email when ticket is solved
4. Rate experience or reopen by replying

### For Support Agents:

1. **Auto Notifications**: Get emails for all new tickets
2. **Manual Resolution Emails**: Use "Email Customer" button in ticket details
3. **Custom Messages**: Write personalized resolution messages
4. **Status Tracking**: System tracks all email interactions

## 🧪 Testing Email Setup

### 1. Test Email Configuration:

```bash
# Make a GET request to test email setup
curl http://localhost:3002/api/email/test
```

### 2. Create Test Ticket:

1. Create a new ticket through the UI
2. Check that support team receives notification email
3. Check that customer receives confirmation email

### 3. Test Resolution Email:

1. Mark a ticket as "Resolved"
2. Click "Email Customer" button
3. Send custom resolution message
4. Verify customer receives resolution email

## 🎨 Customization

### Email Templates Location:

- **New Ticket**: `generateNewTicketEmailToSupport()`
- **Customer Confirmation**: `generateTicketConfirmationToCustomer()`
- **Resolution**: `generateResolutionEmailToCustomer()`

### Branding Customization:

Edit these variables in `backend/.env`:

- `COMPANY_NAME`: Your company name
- `SUPPORT_PHONE`: Support phone number
- `FRONTEND_URL`: Your website URL

### Template Styling:

Edit the HTML/CSS in `backend/emailService.js` functions to match your brand colors and styling.

## 🔒 Security & Best Practices

### Email Security:

- **Never use main Gmail password** - Always use App Passwords
- **Protect .env files** - Never commit email credentials to git
- **Use environment variables** for all sensitive data

### Production Recommendations:

- **Use dedicated email service** (SendGrid, AWS SES, Mailgun)
- **Set up SPF/DKIM records** for better deliverability
- **Monitor email delivery rates** and bounce handling

## 📊 Email Monitoring

### Email Logs:

- Check backend console for email sending status
- All email results are logged with message IDs
- Failed emails are logged with error details

### Success Indicators:

```
✅ Email notifications sent for ticket #[ID]
📧 Email results: [Array of results]
```

### Error Indicators:

```
❌ Failed to send email notifications: [Error details]
```

## 🆘 Troubleshooting

### Common Issues:

**"Email service not configured"**

- Check `EMAIL_USER` and `EMAIL_APP_PASSWORD` in backend/.env
- Restart backend server after env changes

**"Authentication failed"**

- Use App Password, not regular Gmail password
- Enable 2-Factor Authentication on Google Account first

**"Connection timeout"**

- Check firewall settings
- Verify SMTP settings for your provider

**"Emails not arriving"**

- Check spam/junk folders
- Verify recipient email addresses
- Check email service quotas

### Debug Mode:

Set `NODE_ENV=development` to see detailed email logs.

## 📈 Usage Analytics

Track email engagement:

- Open rates via tracking pixels (optional)
- Click-through rates on action buttons
- Response rates for resolution emails
- Customer satisfaction ratings

---

Your email system is now fully integrated! 🎉

**Next Steps:**

1. Configure your email credentials
2. Test with a few tickets
3. Customize email templates to match your brand
4. Set up monitoring for production use
