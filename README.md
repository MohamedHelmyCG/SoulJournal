# Voice Journal Web App - Updated Documentation

## Overview
Voice Journal is a conversational journaling application that allows users to record voice entries, see real-time transcriptions, and receive AI-powered therapeutic reflections. The app features a calming color palette, chat-based interface, and secure authentication.

## Key Features

### Core Functionality
- **Voice Recording**: Record your thoughts using your device's microphone
- **Real-time Transcription**: See your voice transcribed as you speak
- **Therapeutic AI Responses**: Receive thoughtful, emotionally intelligent reflections
- **Conversation-Based Interface**: Journal entries are stored as complete conversations
- **Local Storage**: All entries are stored locally for privacy and offline access

### User Experience
- **Calming Design**: Soothing color palette with lavender, lilac, and soft violet tones
- **Chat Interface**: Familiar messaging-style interface with distinct bubbles
- **Journal Archive**: View and search past conversations
- **Conversation Continuity**: Option to continue previous conversations
- **Secure Authentication**: Firebase authentication with Google and email/password options

## Getting Started

### Installation
1. Clone the repository
2. Navigate to the project directory
3. Install dependencies with `pnpm install`
4. Configure Firebase:
   - Create a Firebase project at https://console.firebase.google.com/
   - Enable Authentication (Google and Email/Password providers)
   - Copy your Firebase config to `src/hooks/useFirebaseAuth.tsx`
5. Start the development server with `pnpm run dev`

### Firebase Configuration
Replace the placeholder Firebase configuration in `src/hooks/useFirebaseAuth.tsx` with your actual Firebase project details:

```typescript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};
```

## Usage

### Authentication
- Sign up with email/password or Google account
- Secure authentication powered by Firebase

### Creating a New Entry
1. Log in to your account
2. Click the "New Entry" button
3. Click the microphone button to start recording
4. Speak your thoughts and see them transcribed in real-time
5. Click the stop button when finished
6. Receive a thoughtful AI reflection
7. Continue the conversation or save the entry

### Viewing Past Entries
1. All entries are displayed on the home screen
2. Click on any entry to view the full conversation
3. Use the search bar to find specific entries
4. Click "Continue Conversation" to add to an existing entry

## Technical Details

### Tech Stack
- **Frontend**: React with TypeScript
- **UI**: TailwindCSS with custom components
- **Voice Recording**: Web Audio API
- **Transcription**: Web Speech API
- **Storage**: IndexedDB (via localStorage)
- **Authentication**: Firebase Authentication

### Color Palette
- Lavender (#E2D4F0)
- Lilac (#D6B3E6)
- Pale Mauve (#E8D7F1)
- Soft Violet (#C3A0D8)

### Key Components
- **ChatInterface**: Main conversation UI with real-time transcription
- **useAIReflection**: Hook for generating therapeutic, humanlike responses
- **useJournalStorage**: Hook for managing conversation-based journal entries
- **useFirebaseAuth**: Hook for Firebase authentication integration

## Deployment
To deploy the application:

1. Build the production version:
   ```
   pnpm run build
   ```

2. Deploy to your preferred hosting service (Firebase Hosting recommended):
   ```
   firebase deploy
   ```

## Future Enhancements
- Cloud synchronization for multi-device access
- Advanced AI response customization
- Voice commands for hands-free journaling
- Export/import functionality for backups
- Analytics for conversation patterns and insights

## Support
For issues or feature requests, please open an issue on the GitHub repository.

---

Thank you for using Voice Journal! We hope it helps you reflect and grow through meaningful conversations with yourself.
