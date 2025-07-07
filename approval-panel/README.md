# Approval Management Panel

A web-based approval management system that integrates with Google Drive and Firebase to streamline file approval workflows for infrastructure teams.

## Features

### 🗂️ Google Drive Integration
- **File Picker**: Select any file from Google Drive (photos, PDFs, Excel files, drawings, etc.)
- **Direct Links**: Access files directly from the approval panel
- **File Type Recognition**: Automatic file type detection with appropriate icons

### 📋 Approval Workflow
- **Multiple Approvers**: Add one or more approvers via email
- **File Categories**: Organize files by type (Drawing, Budget, Site Photo, Structural PDF, Excel Estimate, Other)
- **Due Dates**: Set approval deadlines with overdue tracking
- **Comments**: Add context and instructions for approvers
- **Notifications**: Optional reminders and approval notifications

### 📊 Dashboard & Tracking
- **Status Overview**: View pending, approved, and rejected requests at a glance
- **Filter & Search**: Filter by status, project name, or category
- **Activity Logs**: Complete audit trail of all approval actions
- **Individual Status**: Track each approver's response separately

### 🔔 Smart Features
- **Reminder System**: Automatic reminders for overdue approvals
- **Project Organization**: Group approvals by project name
- **Real-time Updates**: Live status updates using Firebase
- **Mobile Responsive**: Clean, minimal UI that works on all devices

## Quick Start

### Prerequisites
- Node.js 16+ and npm
- Firebase project (optional - will use mock data otherwise)
- Google Drive API credentials (optional - will use mock picker otherwise)

### Installation

1. **Clone and Install**
   ```bash
   cd approval-panel
   npm install
   ```

2. **Environment Setup** (Optional)
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your API keys
   ```

3. **Start Development Server**
   ```bash
   npm start
   ```

4. **Open Application**
   - Navigate to `http://localhost:3000`
   - The app works immediately with demo data!

## Configuration

### Firebase Setup (Optional)
1. Create a Firebase project at https://console.firebase.google.com
2. Enable Firestore Database
3. Get your Firebase config and add to `.env.local`

### Google Drive API Setup (Optional)
1. Create a project in Google Cloud Console
2. Enable Google Drive API and Google Picker API
3. Create credentials (API Key and OAuth 2.0 Client ID)
4. Add credentials to `.env.local`

**Note**: The application works perfectly with mock data if you skip these steps!

## Usage Guide

### Creating an Approval Request

1. **Navigate to "New Request"**
2. **Select a File**: Click "Select File from Google Drive"
   - In demo mode: randomly selects a mock file
   - With API: opens Google Drive picker
3. **Fill Request Details**:
   - Choose file category
   - Add project name (optional)
   - Enter approver emails (comma-separated)
   - Set due date
   - Add comments/instructions
   - Configure notifications
4. **Submit Request**: The request appears on the dashboard immediately

### Managing Approvals

**Dashboard Features:**
- **Filter Requests**: By status or project
- **View Details**: Click any request to see full information
- **Activity Log**: Track all actions and comments
- **Send Reminders**: For pending approvals
- **Status Tracking**: Individual approver status

**Request Details:**
- File information with direct link
- Approver list with individual status
- Due date with overdue warnings
- Activity timeline
- Latest comments

### Mock Data (Demo Mode)

When APIs aren't configured, the app includes realistic demo data:
- **Sample Files**: Site photos, structural PDFs, budget spreadsheets
- **Mock Approvers**: Realistic approval scenarios
- **Activity Logs**: Complete audit trails
- **Status Examples**: Pending, approved, and rejected requests

## Architecture

### Frontend (React + TypeScript)
- **Clean UI**: Minimal, professional design
- **Responsive**: Works on mobile and desktop
- **Type Safety**: Full TypeScript coverage
- **React Hooks**: Modern functional components

### Backend (Firebase)
- **Firestore**: NoSQL database for approvals and activity logs
- **Real-time**: Live updates across all clients
- **Scalable**: Handles multiple projects and users

### Integrations
- **Google Drive API**: File picker and direct links
- **Date Handling**: Smart date formatting and overdue detection
- **Form Validation**: Comprehensive input validation

## File Structure

```
src/
├── components/          # React components
│   ├── Header.tsx      # Navigation header
│   ├── Dashboard.tsx   # Main approval dashboard
│   ├── ApprovalForm.tsx # Create new requests
│   ├── ApprovalCard.tsx # Individual request display
│   ├── FilePicker.tsx  # Google Drive integration
│   └── ActivityFeed.tsx # Activity logs
├── services/           # API services
│   ├── firestore.ts    # Firebase/Firestore operations
│   └── googleDrive.ts  # Google Drive API
├── types/              # TypeScript definitions
│   └── index.ts        # All interfaces and types
├── config/             # Configuration
│   └── firebase.ts     # Firebase setup
└── styles/             # CSS styles
    └── global.css      # All styling
```

## Deployment

### Production Build
```bash
npm run build
```

### Deployment Options
- **Firebase Hosting**: Easy integration with Firebase backend
- **Netlify/Vercel**: Simple static hosting
- **Traditional Hosting**: Any static file server

### Environment Variables
For production, set these environment variables:
- `REACT_APP_FIREBASE_*`: Firebase configuration
- `REACT_APP_GOOGLE_*`: Google API credentials

## Browser Support

- Chrome 80+
- Firefox 75+
- Safari 13+
- Edge 80+

## Development

### Available Scripts
- `npm start`: Development server
- `npm run build`: Production build
- `npm test`: Run tests
- `npm run eject`: Eject from Create React App

### Contributing
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - see LICENSE file for details.

---

**Built for infrastructure teams who need simple, effective approval workflows.** 🏗️
