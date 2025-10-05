# Message Notification System - Complete Implementation

## Date: October 5, 2025

## Problem Statement

**Issue**: When a support agent sends a message to a customer (or vice versa) in the ticket conversation, the recipient doesn't receive any notification - neither via email nor in the web application.

## Solution Overview

Implemented a complete bi-directional message notification system with:

1. ✅ **Email notifications** when new messages are added
2. ✅ **In-app notifications** with real-time updates
3. ✅ **Browser notifications** (desktop/mobile)
4. ✅ **Smart routing** (customer ↔ agent communication)

---

## Implementation Details

### 1. Backend Email Service (`backend/emailService.js`)

#### New Method: `notifyNewMessage()`

Sends email notifications when a message is added to a ticket.

**Features**:

- HTML email template with message preview
- Sender name and timestamp
- Ticket context (ID, title, status)
- Direct link to view and reply
- Professional styling matching the app theme

**Template Includes**:

```javascript
- Subject: "💬 New Message on Ticket #123 - Issue Title"
- Sender info with timestamp
- Message content (formatted with line breaks)
- Ticket details card
- "View & Reply to Ticket" button
- Footer with company branding
```

#### New Method: `generateNewMessageEmail()`

Generates the HTML email template for message notifications.

**Parameters**:

- `ticket` - Ticket object with ID, title, status
- `message` - Message object with content, sender, timestamp
- `recipientInfo` - User receiving the notification
- `senderInfo` - User who sent the message

---

### 2. Backend Message Endpoint (`backend/server.js`)

#### Updated: `POST /api/tickets/:id/messages`

**New Logic**:

```javascript
1. Add message to ticket
2. Determine message sender role
3. If sender is CUSTOMER:
   - Notify assigned agent (if assigned)
   - OR notify ALL support agents + admins
4. If sender is AGENT/ADMIN:
   - Notify the customer
5. Send emails (non-blocking - doesn't fail message creation)
```

**Recipient Resolution**:
| Sender Role | Recipients |
|------------|------------|
| Customer | Assigned agent OR all agents/admins |
| Support Agent | Customer (ticket owner) |
| Administrator | Customer (ticket owner) |

**Console Logging**:

```javascript
💬 New message added to ticket #123
💬 From: John Doe (user_id_123)
💬 Content: Hello, I need help...
📧 Notifying customer: customer@example.com
✅ Message notification sent to customer@example.com
```

---

### 3. Frontend Notification System (`src/components/NotificationSystem.tsx`)

#### New Function: `checkForNewMessages()`

**Functionality**:

- Polls local storage every 5 seconds
- Compares message timestamps with last check
- Filters messages from other users
- Creates in-app notifications
- Triggers browser notifications
- Shows notification badge count

**Logic Flow**:

```javascript
1. Get all tickets from localStorage
2. Get lastMessageCheck timestamp
3. For each ticket:
   - Find messages newer than lastMessageCheck
   - Filter messages from other users (not current user)
   - Create notification for each new message
4. Store notifications in localStorage
5. Update badge count
6. Show browser notification (if permitted)
7. Update lastMessageCheck timestamp
```

**Notification Object**:

```javascript
{
  id: "message-msg_123-1633024800000",
  type: "message",
  title: "New Message",
  message: "John Doe: Hello, I need help with...",
  ticketId: "ticket_123",
  timestamp: "2025-10-05T10:30:00.000Z",
  read: false
}
```

#### Browser Notifications

- Requests permission on first load
- Shows desktop notification for each new message
- Includes message preview and sender name
- Uses app icon/badge

---

## User Flows

### Flow 1: Customer Sends Message to Agent

```
1. Customer opens ticket and types message
2. Customer clicks "Send"
3. Frontend: POST /api/tickets/:id/messages
4. Backend: Saves message to MongoDB
5. Backend: Finds assigned agent OR all agents
6. Backend: Sends email(s) to agent(s)
   ↓
7. Agent: Receives email notification
   Subject: "💬 New Message on Ticket #123"
   Content: Customer message preview
   Button: "View & Reply to Ticket"
   ↓
8. Agent: Opens app
9. Frontend: checkForNewMessages() runs
10. Frontend: Shows notification badge
11. Frontend: Shows browser notification
12. Agent: Clicks notification → opens ticket
13. Agent: Sees customer's message
14. Agent: Replies
```

### Flow 2: Agent Sends Message to Customer

```
1. Agent opens ticket and types reply
2. Agent clicks "Send"
3. Frontend: POST /api/tickets/:id/messages
4. Backend: Saves message to MongoDB
5. Backend: Finds customer user
6. Backend: Sends email to customer
   ↓
7. Customer: Receives email notification
   Subject: "💬 New Message on Ticket #123"
   Content: Agent response preview
   Button: "View & Reply to Ticket"
   ↓
8. Customer: Opens app
9. Frontend: checkForNewMessages() runs
10. Frontend: Shows notification badge
11. Frontend: Shows browser notification
12. Customer: Clicks notification → opens ticket
13. Customer: Sees agent's reply
14. Conversation continues...
```

---

## Configuration

### Environment Variables Required

```bash
# Email Service (SendGrid)
SENDGRID_API_KEY=SG.your_api_key_here
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
EMAIL_FROM=noreply@yourdomain.com
EMAIL_FROM_NAME=Support Desk

# Frontend URL (for email links)
FRONTEND_URL=https://your-app.netlify.app

# Company Info
COMPANY_NAME=Your Company Name
```

### Frontend Configuration

No additional configuration needed. The notification system:

- Uses existing `VITE_API_BASE_URL` from `.env`
- Automatically requests browser notification permission
- Stores notification state in localStorage

---

## Testing

### Test 1: Customer → Agent Message

**Steps**:

1. Login as customer
2. Open or create a ticket
3. Send a message
4. Login as support agent (different browser/incognito)
5. Verify:
   - ✅ Email received by agent
   - ✅ Notification badge shows "1"
   - ✅ Browser notification appears
   - ✅ Clicking notification opens ticket

### Test 2: Agent → Customer Message

**Steps**:

1. Login as support agent
2. Open a customer ticket
3. Send a reply
4. Login as customer (different browser/incognito)
5. Verify:
   - ✅ Email received by customer
   - ✅ Notification badge shows "1"
   - ✅ Browser notification appears
   - ✅ Clicking notification opens ticket

### Test 3: Unassigned Ticket

**Steps**:

1. Create ticket (no agent assigned)
2. Customer sends message
3. Verify:
   - ✅ ALL agents receive email
   - ✅ ALL admins receive email
   - ✅ Each agent sees notification

### Test 4: Email Content

**Steps**:

1. Send message with special characters/formatting
2. Check email inbox
3. Verify:
   - ✅ HTML renders correctly
   - ✅ Line breaks preserved
   - ✅ Links work
   - ✅ Button is clickable
   - ✅ Sender name displayed
   - ✅ Timestamp formatted

---

## Architecture

### Communication Flow

```
┌─────────────┐
│   Customer  │
│   Browser   │
└──────┬──────┘
       │ POST /api/tickets/:id/messages
       ↓
┌─────────────────┐
│  Backend API    │
│  (Express.js)   │
├─────────────────┤
│ 1. Save Message │
│ 2. Find Users   │
│ 3. Send Emails  │
└────┬──────┬─────┘
     │      │
     │      └────────────────┐
     ↓                       ↓
┌─────────────┐      ┌──────────────┐
│  MongoDB    │      │ Email Service│
│  (Ticket)   │      │  (SendGrid)  │
└─────────────┘      └───────┬──────┘
                             ↓
                     ┌──────────────┐
                     │ Agent Email  │
                     │   Inbox      │
                     └──────────────┘
                             ↓
                     ┌──────────────┐
                     │ Agent Opens  │
                     │     App      │
                     └──────┬───────┘
                            ↓
                   ┌────────────────────┐
                   │  Notification      │
                   │  System Polling    │
                   │  (Every 5 seconds) │
                   └────────┬───────────┘
                            ↓
                   ┌────────────────────┐
                   │  Browser           │
                   │  Notification      │
                   └────────────────────┘
```

---

## Performance Considerations

### Polling Interval

- **Current**: 5 seconds
- **Impact**: Low (only reads localStorage)
- **Improvement**: Could use WebSockets for real-time

### Email Sending

- **Non-blocking**: Uses `.then()` instead of `await`
- **Failure handling**: Message still saved if email fails
- **Logging**: Console logs show email status

### Notification Storage

- **Location**: localStorage (persistent across sessions)
- **Size**: Limited to last 100 notifications
- **Cleanup**: Old notifications auto-removed

---

## Known Limitations

1. **Polling-based**: Not true real-time (5-second delay)
2. **LocalStorage**: Notifications not synced across devices
3. **Email only**: No SMS/Push notifications
4. **Browser notifications**: Requires user permission
5. **No read receipts**: Can't track if recipient saw message

---

## Future Enhancements

### Short-term

1. ✨ **WebSocket support** - True real-time updates
2. ✨ **Typing indicators** - Show when user is typing
3. ✨ **Read receipts** - Mark messages as read
4. ✨ **Message reactions** - Emoji reactions to messages

### Medium-term

1. 🚀 **Push notifications** - Mobile app notifications
2. 🚀 **SMS notifications** - Text message alerts
3. 🚀 **Slack integration** - Post messages to Slack
4. 🚀 **Email replies** - Reply to ticket via email

### Long-term

1. 🎯 **Message threading** - Group related messages
2. 🎯 **File attachments** - Send files in messages
3. 🎯 **Voice messages** - Audio message support
4. 🎯 **Video calls** - Built-in video chat

---

## Troubleshooting

### Issue: No email received

**Check**:

1. SENDGRID_API_KEY configured correctly
2. FROM email verified in SendGrid
3. Backend logs show email sent
4. Check spam folder
5. Verify recipient email in database

**Debug**:

```bash
# Check backend logs
tail -f logs/server.log | grep "📧"
```

### Issue: No in-app notification

**Check**:

1. Notification system component rendered
2. localStorage has messages
3. Browser console for errors
4. Check lastMessageCheck timestamp

**Debug**:

```javascript
// In browser console
localStorage.getItem("lastMessageCheck");
localStorage.getItem("notifications");
```

### Issue: Browser notification not showing

**Check**:

1. Notification permission granted
2. Browser supports notifications
3. Not in "Do Not Disturb" mode
4. Check browser notification settings

**Debug**:

```javascript
// In browser console
Notification.permission; // Should be "granted"
```

---

## API Reference

### POST /api/tickets/:id/messages

**Request**:

```json
{
  "senderId": "user_id_123",
  "senderName": "John Doe",
  "content": "Hello, I need help with...",
  "isInternal": false
}
```

**Response**:

```json
{
  "id": "msg_123",
  "ticketId": "ticket_456",
  "userId": "user_id_123",
  "userName": "John Doe",
  "content": "Hello, I need help with...",
  "timestamp": "2025-10-05T10:30:00.000Z",
  "isInternal": false
}
```

**Side Effects**:

- Saves message to MongoDB
- Sends email notifications
- Updates ticket updatedAt timestamp

---

## Security

### Email Security

- Uses SendGrid SMTP (TLS encryption)
- No sensitive data in email body
- Secure links with ticket ID only

### API Security

- Messages saved to database
- No authentication required (add later)
- XSS prevention (sanitize content)

### Privacy

- Internal messages not sent via email
- Only ticket participants receive notifications
- Email addresses not exposed

---

## Deployment Checklist

- [ ] Set SENDGRID_API_KEY environment variable
- [ ] Verify FROM email in SendGrid
- [ ] Set FRONTEND_URL to production URL
- [ ] Test email delivery in production
- [ ] Test browser notifications on HTTPS
- [ ] Monitor backend logs for email errors
- [ ] Set up email bounce handling
- [ ] Configure email rate limiting

---

**Status**: ✅ Implemented and Tested  
**Version**: 1.0.0  
**Last Updated**: October 5, 2025  
**Author**: AI Assistant

---

## Quick Reference

| Feature               | Status | Notes                 |
| --------------------- | ------ | --------------------- |
| Email notifications   | ✅     | Via SendGrid SMTP     |
| In-app notifications  | ✅     | Polling every 5s      |
| Browser notifications | ✅     | Requires permission   |
| Customer → Agent      | ✅     | Notifies assigned/all |
| Agent → Customer      | ✅     | Notifies ticket owner |
| Internal messages     | ✅     | No notifications sent |
| Real-time (WebSocket) | ❌     | Future enhancement    |
| SMS notifications     | ❌     | Future enhancement    |
| Push notifications    | ❌     | Future enhancement    |
