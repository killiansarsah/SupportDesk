# Customer Support Ticketing System

A comprehensive, enterprise-level customer support ticketing system built with React, TypeScript, and modern web technologies. This application provides a complete solution for managing customer support requests with role-based access control, real-time communication, and advanced ticket management features.

## 🚀 Key Features

### Multi-Role Authentication System
- **Administrator**: Full system access, user management, analytics dashboard
- **Support Agent**: Ticket management, customer communication, assignment handling
- **Customer**: Ticket creation, viewing own tickets, real-time messaging

### Advanced Ticket Management
- Complete ticket lifecycle (Open → In Progress → Resolved → Closed)
- Priority-based categorization (Low, Medium, High, Urgent)
- Automatic and manual ticket assignment
- File attachment support with drag-and-drop
- Advanced search and filtering capabilities
- Complete audit trail and history tracking

### Modern UI/UX Design
- Glassmorphism effects with frosted glass styling
- Dynamic background animations with floating particles
- Responsive design optimized for all devices
- Smooth micro-interactions and hover effects
- Professional color palette with excellent accessibility
- Loading states with skeleton screens

## 🛠 Technology Stack

### Frontend
- **React 18** - Modern React with hooks and functional components
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first CSS framework
- **Lucide React** - Beautiful icon library
- **Vite** - Fast build tool and development server

### Backend (Simulated)
- **Mock Services** - Sophisticated simulation of backend operations
- **Local Storage** - Client-side data persistence
- **JWT Simulation** - Token-based authentication flow

### Development Tools
- **ESLint** - Code linting and quality assurance
- **PostCSS** - CSS processing and optimization
- **Autoprefixer** - Automatic vendor prefixing

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (version 18.0 or higher)
- **npm** (version 8.0 or higher) or **yarn** (version 1.22 or higher)
- **Git** for version control
- Modern web browser (Chrome, Firefox, Safari, Edge)

## 🚀 Installation Instructions

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/customer-support-system.git
cd customer-support-system
```

### 2. Install Dependencies

```bash
# Using npm
npm install

# Using yarn
yarn install
```

### 3. Environment Configuration

Create a `.env` file in the root directory:

```env
# Application Configuration
VITE_APP_NAME=Customer Support System
VITE_APP_VERSION=1.0.0
VITE_APP_ENVIRONMENT=development

# API Configuration
VITE_API_BASE_URL=http://localhost:3000/api
VITE_API_TIMEOUT=10000

# MongoDB Configuration (for future backend integration)
MONGODB_URI=mongodb+srv://techzealous100_db_user:2MFSX1MwrqJEwAbg@support-ticketing.6sj5h0j.mongodb.net/?retryWrites=true&w=majority&appName=support-ticketing
MONGODB_DB_NAME=support_ticketing

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRES_IN=24h
JWT_REFRESH_EXPIRES_IN=7d

# File Upload Configuration
MAX_FILE_SIZE=10485760
ALLOWED_FILE_TYPES=jpg,jpeg,png,gif,pdf,doc,docx,txt

# Email Configuration (for notifications)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# Storage Configuration
STORAGE_TYPE=local
UPLOAD_PATH=./uploads

# Security Configuration
BCRYPT_ROUNDS=12
RATE_LIMIT_WINDOW=15
RATE_LIMIT_MAX_REQUESTS=100

# Development Configuration
PORT=5173
HOST=localhost
```

### 4. Start Development Server

```bash
# Using npm
npm run dev

# Using yarn
yarn dev
```

The application will be available at `http://localhost:5173`

## 📁 Project Structure

```
customer-support-system/
├── public/
│   ├── vite.svg                 # Vite logo
│   └── index.html              # HTML template
├── src/
│   ├── components/             # React components
│   │   ├── AdminDashboard.tsx  # Administrator dashboard
│   │   ├── AgentDashboard.tsx  # Support agent dashboard
│   │   ├── CustomerDashboard.tsx # Customer dashboard
│   │   ├── CreateTicket.tsx    # Ticket creation form
│   │   ├── Dashboard.tsx       # Main dashboard router
│   │   ├── Layout.tsx          # Application layout wrapper
│   │   ├── Login.tsx           # Authentication component
│   │   ├── TicketDetail.tsx    # Individual ticket view
│   │   └── TicketList.tsx      # Ticket listing component
│   ├── services/               # Business logic services
│   │   ├── authService.ts      # Authentication service
│   │   └── ticketService.ts    # Ticket management service
│   ├── types/                  # TypeScript type definitions
│   │   └── index.ts            # Main type definitions
│   ├── App.tsx                 # Main application component
│   ├── main.tsx               # Application entry point
│   ├── index.css              # Global styles and animations
│   └── vite-env.d.ts          # Vite type definitions
├── .env                        # Environment variables
├── .env.example               # Environment variables template
├── .gitignore                 # Git ignore rules
├── eslint.config.js           # ESLint configuration
├── package.json               # Project dependencies
├── postcss.config.js          # PostCSS configuration
├── tailwind.config.js         # Tailwind CSS configuration
├── tsconfig.json              # TypeScript configuration
├── tsconfig.app.json          # App-specific TypeScript config
├── tsconfig.node.json         # Node-specific TypeScript config
├── vite.config.ts             # Vite configuration
└── README.md                  # Project documentation
```

### Key Components Explanation

- **`src/components/`**: Contains all React components organized by functionality
- **`src/services/`**: Business logic and API interaction services
- **`src/types/`**: TypeScript interfaces and type definitions
- **`src/index.css`**: Global styles, animations, and Tailwind CSS imports

## 🌐 Deployment Instructions

### GitHub Pages Deployment

1. **Build the application:**
```bash
npm run build
```

2. **Install gh-pages:**
```bash
npm install --save-dev gh-pages
```

3. **Add deployment scripts to package.json:**
```json
{
  "scripts": {
    "predeploy": "npm run build",
    "deploy": "gh-pages -d dist"
  },
  "homepage": "https://your-username.github.io/customer-support-system"
}
```

4. **Deploy:**
```bash
npm run deploy
```

### Netlify Deployment

1. **Build the application:**
```bash
npm run build
```

2. **Create `_redirects` file in `dist` folder:**
```
/*    /index.html   200
```

3. **Deploy via Netlify CLI:**
```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login to Netlify
netlify login

# Deploy
netlify deploy --prod --dir=dist
```

### Server Deployment (VPS/Dedicated Server)

1. **Prepare the server:**
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2 for process management
sudo npm install -g pm2
```

2. **Deploy the application:**
```bash
# Clone repository
git clone https://github.com/your-username/customer-support-system.git
cd customer-support-system

# Install dependencies
npm install

# Build application
npm run build

# Serve with PM2
pm2 serve dist 3000 --name "support-system"
pm2 startup
pm2 save
```

3. **Configure Nginx (optional):**
```nginx
server {
    listen 80;
    server_name your-domain.com;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## 👥 User Management

### Demo Accounts

The application comes with pre-configured demo accounts for testing:

| Role | Email | Password | Access Level |
|------|-------|----------|--------------|
| Administrator | admin@company.com | password123 | Full system access |
| Support Agent | agent@company.com | password123 | Ticket management |
| Customer | customer@email.com | password123 | Own tickets only |

### Removing Demo Accounts

To remove demo accounts for production:

1. **Open `src/services/authService.ts`**
2. **Locate the `MOCK_USERS` array**
3. **Remove or modify the demo user entries:**

```typescript
// Remove this entire array for production
const MOCK_USERS: User[] = [
  // Remove these demo users
];
```

4. **Implement real user registration:**
```typescript
async register(userData: RegisterData): Promise<AuthResult> {
  // Implement actual user registration logic
  // Connect to your backend API
}
```

### User Authentication Flow

1. **Login Process:**
   - User enters credentials
   - System validates against user database
   - JWT token generated and stored
   - User redirected to role-specific dashboard

2. **Session Management:**
   - Tokens stored in localStorage
   - Automatic session restoration on page reload
   - Token expiration handling

3. **Logout Process:**
   - Clear stored tokens
   - Redirect to login page
   - Clear user session data

## 🔧 Development Guidelines

### Running Locally

1. **Start development server:**
```bash
npm run dev
```

2. **Run type checking:**
```bash
npm run typecheck
```

3. **Run linting:**
```bash
npm run lint
```

### Testing Procedures

1. **Test all user roles:**
   - Login with each demo account
   - Verify role-specific functionality
   - Test permission restrictions

2. **Test ticket workflow:**
   - Create tickets as customer
   - Assign tickets as agent
   - Update ticket status
   - Add messages and attachments

3. **Test responsive design:**
   - Verify mobile compatibility
   - Test tablet layouts
   - Check desktop functionality

### Troubleshooting Common Issues

#### Build Errors
```bash
# Clear node modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Clear Vite cache
rm -rf .vite
npm run dev
```

#### TypeScript Errors
```bash
# Run type checking
npm run typecheck

# Check for missing dependencies
npm install @types/node --save-dev
```

#### Styling Issues
```bash
# Rebuild Tailwind CSS
npx tailwindcss -i ./src/index.css -o ./dist/output.css --watch
```

## 📊 Database Schema

### User Schema
```typescript
interface User {
  id: string;
  email: string;
  name: string;
  role: 'administrator' | 'support-agent' | 'customer';
  avatar?: string;
  createdAt: string;
  lastLogin?: string;
  isActive: boolean;
}
```

### Ticket Schema
```typescript
interface Ticket {
  id: string;
  title: string;
  description: string;
  category: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'open' | 'in-progress' | 'resolved' | 'closed';
  customerId: string;
  assignedTo?: string;
  createdAt: string;
  updatedAt: string;
  attachments: Attachment[];
  messages: Message[];
  history: HistoryEntry[];
}
```

## 🤝 Contributing

1. **Fork the repository**
2. **Create a feature branch:**
```bash
git checkout -b feature/amazing-feature
```

3. **Commit your changes:**
```bash
git commit -m 'Add some amazing feature'
```

4. **Push to the branch:**
```bash
git push origin feature/amazing-feature
```

5. **Open a Pull Request**

### Code Style Guidelines

- Use TypeScript for all new code
- Follow ESLint configuration
- Use functional components with hooks
- Implement proper error handling
- Add comments for complex logic
- Write descriptive commit messages

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:

- **Email**: support@yourdomain.com
- **Documentation**: [Wiki](https://github.com/your-username/customer-support-system/wiki)
- **Issues**: [GitHub Issues](https://github.com/your-username/customer-support-system/issues)

## 🔄 Version History

- **v1.0.0** - Initial release with core functionality
- **v1.1.0** - Added file attachment support
- **v1.2.0** - Enhanced UI/UX with glassmorphism effects
- **v1.3.0** - Improved responsive design and accessibility

---

**Built with ❤️ using React, TypeScript, and modern web technologies.**