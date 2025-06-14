# Project Overview

## What is PrepPath?

PrepPath is an interview preparation platform designed to help users track, practice, and improve their interview skills. The application allows users to:

- Create and manage interview sessions
- Track progress and statistics
- Get personalized recommendations
- Store and review interview feedback
- Practice with sample questions
- Manage their professional profile

## Core Technologies

The project is built using the following core technologies:

1. **Next.js**: A React framework for building server-rendered applications
2. **TypeScript**: For type-safe JavaScript development
3. **Firebase**: For authentication and data storage
4. **Tailwind CSS**: For styling components
5. **Zod**: For schema validation
6. **Shadcn UI**: For UI components

## Architecture Overview

PrepPath follows a modern web application architecture:

1. **Frontend**: Next.js application with React components
2. **Backend**: Firebase services (Authentication, Firestore)
3. **State Management**: React Context API
4. **Routing**: Next.js App Router
5. **Data Validation**: Zod schemas

## Key Features

1. **User Authentication**
   - Email/Password login
   - Google OAuth integration
   - Password recovery

2. **User Profile Management**
   - Basic profile information
   - Professional details
   - Social links
   - Education history

3. **Interview Management**
   - Create interview entries
   - Track interview status
   - Record feedback and results

4. **Dashboard & Analytics**
   - Interview statistics
   - Success rate tracking
   - Upcoming interviews

5. **Personalization**
   - User preferences
   - Skill tracking
   - Interview suggestions

## Data Model

The application is built around a core user-centric data model:

1. **User**: The central entity containing profile information and references to other data
2. **Interview**: Records of interview sessions
3. **UserPreferences**: User-specific settings and preferences
4. **UserStats**: Aggregated statistics about the user's interviews and activities

This model is designed for Firebase's NoSQL document database structure, optimizing for common query patterns while working within Firebase's free tier limitations.
