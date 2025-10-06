# Avatar System Documentation

## Overview
The support desk now features a beautiful, automatic avatar generation system that creates unique, attractive avatars for every user - administrators, support agents, and customers.

## Features

### 🎨 Avatar Styles
The system uses **DiceBear API** to generate diverse, professional avatars with multiple styles:

1. **Administrators**: Professional, authoritative avatars
   - Styles: Personas, Micah, Avataaars
   
2. **Support Agents**: Friendly, approachable avatars
   - Styles: Lorelei, Avataaars, Fun Emoji
   
3. **Customers**: Diverse, colorful avatars
   - Styles: Avataaars, Bottts (robots), Fun Emoji, Pixel Art

### ✨ Key Benefits
- **Automatic Generation**: Every new user gets a unique avatar upon signup
- **Consistent**: Same user always gets the same avatar (based on user ID)
- **Attractive**: Professional, modern designs with vibrant colors
- **Role-Based**: Different styles for different user roles
- **No Maintenance**: No need to upload or manage images

## How It Works

### 1. New User Registration
When a user signs up (regular or Google OAuth):
```javascript
// Avatar is automatically generated after user creation
user.avatar = getUserAvatar(user);
await user.save();
```

### 2. Existing Users
Run the migration script to generate avatars for all existing users:
```bash
cd backend
node generate-avatars.js
```

### 3. Avatar Generation Logic
```javascript
import { getUserAvatar } from './utils/avatarGenerator.js';

// Generates a unique, consistent avatar for the user
const avatarUrl = getUserAvatar(user);
```

## Avatar URL Examples

### Administrator
```
https://api.dicebear.com/7.x/personas/svg?seed=USER_ID&backgroundColor=87ceeb&radius=50
```

### Support Agent
```
https://api.dicebear.com/7.x/lorelei/svg?seed=USER_ID&backgroundColor=98d8c8&radius=50
```

### Customer
```
https://api.dicebear.com/7.x/avataaars/svg?seed=USER_ID&backgroundColor=ffd5dc&radius=50
```

## API Integration Points

### 1. User Registration (`/api/auth/register`)
- Generates avatar after user creation
- Saves avatar URL to user document

### 2. Google OAuth (`/api/auth/google/signin` & `/api/auth/google/signup`)
- Uses Google profile picture if available
- Falls back to generated avatar if no Google picture

### 3. Admin User Creation (`/api/users`)
- Automatically generates avatar for new users
- Returns avatar URL in response

## Avatar Generator Utility

Located at: `backend/utils/avatarGenerator.js`

### Main Functions

#### `getUserAvatar(user)`
Generates a consistent avatar for a user based on their role.
```javascript
const avatar = getUserAvatar(user);
// Returns: https://api.dicebear.com/7.x/...
```

#### `generateRoleBasedAvatar(seed, role)`
Generates an avatar with a specific role-based style.
```javascript
const avatar = generateRoleBasedAvatar(user._id, 'administrator');
```

#### `generateAvatarUrl(seed, style)`
Low-level function to generate avatar with specific style.
```javascript
const avatar = generateAvatarUrl('unique-seed', 'avataaars');
```

## Migration Script

### Purpose
Updates all existing users in the database with generated avatars.

### Location
`backend/generate-avatars.js`

### Usage
```bash
cd backend
node generate-avatars.js
```

### What It Does
1. Connects to MongoDB
2. Finds all users without custom avatars
3. Generates unique avatar for each user
4. Saves updated user documents
5. Provides detailed progress report

### Output Example
```
🔌 Connecting to MongoDB...
✅ Connected to MongoDB

📊 Found 12 users in database

✨ Generated avatar for test (customer)
   Email: test@gmail.com
   Avatar: https://api.dicebear.com/7.x/avataaars/svg?seed=...

⏭️  Skipping John Doe (john@example.com) - already has custom avatar

📊 Summary:
   ✅ Updated: 3 users
   ⏭️  Skipped: 9 users
   📝 Total: 12 users
```

## DiceBear API

### Why DiceBear?
- ✅ Free and open-source
- ✅ No API key required
- ✅ High-quality, diverse styles
- ✅ Consistent output (same seed = same avatar)
- ✅ SVG format (scalable, small file size)
- ✅ Customizable colors and shapes

### API Documentation
https://www.dicebear.com/

### Available Styles
- **avataaars**: Cartoon-style avatars
- **bottts**: Robot avatars
- **fun-emoji**: Emoji-based avatars
- **personas**: Professional illustrated avatars
- **lorelei**: Minimalist character illustrations
- **micah**: Simple, modern avatars
- **pixel-art**: Retro 8-bit style
- **identicon**: Geometric patterns
- **thumbs**: Thumbs-up characters
- **initials**: Text-based with colored backgrounds

## Customization

### Change Avatar Styles
Edit `backend/utils/avatarGenerator.js`:
```javascript
const AVATAR_STYLES = [
  'avataaars',
  'bottts',
  'fun-emoji',
  // Add or remove styles here
];
```

### Change Background Colors
Edit the color palette:
```javascript
const BACKGROUND_COLORS = [
  'b6e3f4', // Light blue
  'ffd5dc', // Light pink
  // Add hex colors (without #)
];
```

### Change Role-Based Styles
Modify `generateRoleBasedAvatar()` function:
```javascript
case 'administrator':
  style = ['personas', 'micah'][Math.floor(Math.random() * 2)];
  break;
```

## Frontend Integration

### Display Avatar in Components
The avatar is automatically included in user objects:

```typescript
// User object structure
interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar?: string; // Avatar URL
}

// Display in JSX
<img 
  src={user.avatar || '/default-avatar.png'} 
  alt={user.name}
  className="w-10 h-10 rounded-full"
/>
```

### Update Components
Make sure all components that display user avatars use the `avatar` field from the user object.

## Troubleshooting

### Avatars Not Showing
1. Check if user has `avatar` field in database
2. Verify avatar URL is accessible
3. Run migration script for existing users

### Generate New Avatars
Delete existing avatars and run migration:
```javascript
// In MongoDB or via API
await User.updateMany({}, { $unset: { avatar: "" } });
```
Then run `node generate-avatars.js`

### Change Avatar Style for Specific User
```javascript
import { generateAvatarUrl } from './utils/avatarGenerator.js';

user.avatar = generateAvatarUrl(user._id, 'personas');
await user.save();
```

## Deployment

### Railway Deployment
The avatar system works automatically in production:
1. Push code to GitHub
2. Railway auto-deploys
3. New users get avatars automatically
4. Existing users: Run migration via Railway CLI

### Run Migration in Production
```bash
# Via Railway CLI
railway run node backend/generate-avatars.js
```

## Future Enhancements

### Potential Features
- [ ] Allow users to customize their avatars
- [ ] Add more avatar styles
- [ ] Avatar upload option
- [ ] Avatar marketplace with premium styles
- [ ] Animation effects on avatars
- [ ] Dark mode avatar variants

## Summary

The avatar system provides:
✅ **Automatic** - No manual work required
✅ **Beautiful** - Professional, modern designs  
✅ **Consistent** - Same user = same avatar
✅ **Diverse** - Multiple styles and colors
✅ **Role-Based** - Appropriate for user type
✅ **Free** - No API costs
✅ **Scalable** - Works for unlimited users

Every user now has a unique, attractive avatar that enhances the visual appeal of your support desk!
