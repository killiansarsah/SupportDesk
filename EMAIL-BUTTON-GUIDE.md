# Email Button Location Guide

## 📧 Where to Find the "Send Email to Customer" Button

### Location

The **"Send Email to Customer"** button is located in the **Ticket Detail** view, in the right sidebar under "Actions".

### How to Access It

#### Step 1: Open a Ticket

1. Go to your Agent Dashboard
2. Click on any ticket from the ticket list
3. The ticket detail view will open

#### Step 2: Find the Actions Panel

Look at the **right side** of the screen for the "Actions" panel. It contains:

- Status dropdown (if you can change status)
- Assignee dropdown (if you can assign tickets)
- **"Send Email to Customer"** button ← **HERE!**

### Button Appearance

```
┌─────────────────────────────┐
│         ACTIONS             │
├─────────────────────────────┤
│  [Change Status ▼]          │
│  [Change Assignee ▼]        │
│  ┌─────────────────────┐    │
│  │ ✉ Send Email to     │    │
│  │   Customer          │    │
│  └─────────────────────┘    │
└─────────────────────────────┘
```

### Button Details

- **Color**: Blue background
- **Icon**: Send/Mail icon on the left
- **Text**: "Send Email to Customer"
- **Full Width**: Takes the full width of the Actions panel
- **Position**: Below the status and assignee dropdowns

### Who Can See It?

✅ **Support Agents** - Can see and use the button
✅ **Administrators** - Can see and use the button
❌ **Customers** - Cannot see this button

### What Changed?

**Before**: The button only appeared when ticket status was "Resolved" or "Closed"
**Now**: The button is **always visible** for agents and admins, regardless of ticket status

### How to Use It

1. **Click the "Send Email to Customer" button**
2. A modal will pop up with:
   - Customer's email address (pre-filled)
   - Subject line field
   - Message field (with template text)
3. **Edit the message** if needed
4. **Click "Send Email"**
5. Customer will receive the email notification

### Email Modal Details

```
┌───────────────────────────────────────┐
│  ✉ Send Email to Customer          X  │
├───────────────────────────────────────┤
│                                       │
│  Customer Email                       │
│  ┌─────────────────────────────────┐ │
│  │ customer@example.com            │ │
│  └─────────────────────────────────┘ │
│                                       │
│  Subject                              │
│  ┌─────────────────────────────────┐ │
│  │ Your Support Ticket Update      │ │
│  └─────────────────────────────────┘ │
│                                       │
│  Message                              │
│  ┌─────────────────────────────────┐ │
│  │ Your ticket has been resolved.. │ │
│  │                                 │ │
│  │                                 │ │
│  └─────────────────────────────────┘ │
│                                       │
│  [Cancel]           [Send Email]     │
│                                       │
└───────────────────────────────────────┘
```

### Troubleshooting

#### "I don't see the button"

**Check:**

1. Are you logged in as a **Support Agent** or **Administrator**?
   - Customers cannot see this button
2. Have you opened a **ticket detail** view?
   - The button only appears when viewing a specific ticket
3. Is the Actions panel visible on the right side?
   - Try scrolling down on the right side

#### "The button is grayed out"

- This shouldn't happen now, but if it does, refresh the page

#### "Nothing happens when I click"

1. Check your browser console for errors (F12)
2. Ensure you're connected to the internet
3. Try refreshing the page

### Mobile View

On mobile devices:

- The Actions panel moves to the bottom
- Button remains full-width
- Scroll down to see it

### Tips

💡 **Quick Access**: The button is always visible now - no need to change ticket status first

💡 **Pre-filled Template**: The email comes with a default message template that you can customize

💡 **Customer Info**: The customer's email is automatically filled in from the ticket

💡 **Email History**: Sent emails are logged in the ticket history

### Additional Features

The email modal allows you to:

- ✅ View customer's email address
- ✅ Edit the subject line
- ✅ Customize the message
- ✅ Send professional notifications
- ✅ Keep customers informed

### Summary

**Location**: Ticket Detail View → Right Sidebar → Actions Panel → "Send Email to Customer" button

**Visibility**: Always visible for Support Agents and Administrators

**Purpose**: Send email notifications to customers about their ticket updates

If you still can't find the button after checking these steps, please refresh your browser or re-login to ensure you have the latest version!
