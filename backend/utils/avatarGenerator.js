/**
 * Avatar Generator Utility
 * Generates beautiful, unique avatars for users using DiceBear API
 */

const AVATAR_STYLES = [
  'avataaars',      // Cartoon-style avatars
  'bottts',         // Robot avatars
  'fun-emoji',      // Fun emoji-based
  'identicon',      // Geometric patterns
  'initials',       // Initials with colors
  'lorelei',        // Illustrated characters
  'micah',          // Minimalist illustrations
  'personas',       // Professional avatars
  'pixel-art',      // 8-bit pixel art
  'thumbs',         // Thumbs up characters
];

const BACKGROUND_COLORS = [
  'b6e3f4', 'c0aede', 'd1d4f9', 'ffd5dc', 'ffdfbf',
  'a8e6cf', 'dcedc1', 'ffd3b6', 'ffaaa5', 'ff8b94',
  '87ceeb', '98d8c8', 'f7dc6f', 'bb8fce', 'f8b88b'
];

/**
 * Generate a random avatar URL for a user
 * @param {string} seed - Unique identifier (user ID or email)
 * @param {string} style - Avatar style (optional)
 * @returns {string} Avatar URL
 */
export function generateAvatarUrl(seed, style = null) {
  // Use a random style if not specified
  const avatarStyle = style || AVATAR_STYLES[Math.floor(Math.random() * AVATAR_STYLES.length)];
  
  // Pick a random background color
  const bgColor = BACKGROUND_COLORS[Math.floor(Math.random() * BACKGROUND_COLORS.length)];
  
  // Generate avatar URL using DiceBear API
  return `https://api.dicebear.com/7.x/${avatarStyle}/svg?seed=${encodeURIComponent(seed)}&backgroundColor=${bgColor}&radius=50`;
}

/**
 * Generate avatar based on user role with specific styles
 * @param {string} seed - Unique identifier
 * @param {string} role - User role
 * @returns {string} Avatar URL
 */
export function generateRoleBasedAvatar(seed, role) {
  let style;
  
  switch (role) {
    case 'administrator':
      // Professional, authoritative avatars
      style = ['personas', 'micah', 'avataaars'][Math.floor(Math.random() * 3)];
      break;
    case 'support-agent':
    case 'agent':
      // Friendly, approachable avatars
      style = ['lorelei', 'avataaars', 'fun-emoji'][Math.floor(Math.random() * 3)];
      break;
    case 'customer':
      // Diverse, colorful avatars
      style = ['avataaars', 'bottts', 'fun-emoji', 'pixel-art'][Math.floor(Math.random() * 4)];
      break;
    default:
      style = 'avataaars';
  }
  
  return generateAvatarUrl(seed, style);
}

/**
 * Generate initials-based avatar (fallback option)
 * @param {string} name - User name
 * @param {string} backgroundColor - Hex color
 * @returns {string} Avatar URL
 */
export function generateInitialsAvatar(name, backgroundColor = null) {
  const bgColor = backgroundColor || BACKGROUND_COLORS[Math.floor(Math.random() * BACKGROUND_COLORS.length)];
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=${bgColor}&color=fff&size=200&bold=true&rounded=true`;
}

/**
 * Get a consistent avatar for a user (same seed always generates same avatar)
 * @param {Object} user - User object
 * @returns {string} Avatar URL
 */
export function getUserAvatar(user) {
  // Use user ID as seed for consistency
  const seed = user._id ? user._id.toString() : user.email;
  return generateRoleBasedAvatar(seed, user.role);
}
