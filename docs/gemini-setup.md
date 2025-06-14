# Gemini AI Integration Setup

This guide will help you set up the free Gemini API for profile summarization and interview suggestions.

## Getting Your Free Gemini API Key

1. **Visit Google AI Studio**: Go to [https://aistudio.google.com/](https://aistudio.google.com/)

2. **Sign in**: Use your Google account to sign in

3. **Get API Key**: 
   - Click on "Get API key" in the left sidebar
   - Click "Create API key in new project" or select an existing project
   - Copy the generated API key

## Environment Setup

1. **Create Environment File**: Create a `.env.local` file in your project root:
   ```bash
   # In the project root directory
   touch .env.local
   ```

2. **Add Your API Key**: Add the following to your `.env.local` file:
   ```env
   GEMINI_API_KEY=your_actual_api_key_here
   ```
   
   Replace `your_actual_api_key_here` with the API key you copied from Google AI Studio.

3. **Restart Development Server**: After adding the environment variable, restart your development server:
   ```bash
   npm run dev
   ```

## Features Included

### 🧠 AI Profile Insights
- **Smart Analysis**: AI analyzes your interview history and performance
- **Personalized Summary**: Get a professional summary of your skills and progress
- **Strength Identification**: AI identifies your top technical strengths
- **Improvement Areas**: Highlights specific areas where you can grow
- **Actionable Recommendations**: Receive targeted advice for skill development

### 💡 Intelligent Interview Suggestions
- **Personalized Recommendations**: AI creates custom interview suggestions based on your profile
- **Adaptive Difficulty**: Suggestions match your current skill level
- **Focus Areas**: Targeted practice in areas where you need improvement
- **Variety**: Covers frontend, backend, fullstack, and DevOps topics

### 📊 Enhanced Feedback
- **Detailed Analysis**: AI provides comprehensive feedback on your interview performance
- **Technical Accuracy**: Evaluates the correctness of your technical answers
- **Communication Skills**: Assesses clarity and effectiveness of your explanations
- **Growth Insights**: Specific advice on how to improve for future interviews

## How It Works

1. **Data Collection**: The system analyzes your created interviews, completion history, and performance patterns

2. **AI Processing**: Gemini AI processes this data to understand your learning journey and skill progression

3. **Insight Generation**: AI generates personalized insights including:
   - Professional skill summary
   - Identified strengths and weaknesses
   - Customized learning recommendations
   - Suggested interview topics and difficulty levels

4. **Continuous Learning**: The more you use the platform, the more accurate and helpful the AI insights become

## Privacy & Security

- **API Security**: Your Gemini API key is stored securely on the server side
- **Data Privacy**: Interview data is processed temporarily and not stored by Google
- **Local Storage**: Your interview data remains in your browser's local storage
- **No Personal Data**: Only interview-related data is analyzed, no personal information is shared

## Fallback System

If the Gemini API is unavailable or you haven't set up an API key:
- The system provides helpful fallback insights
- Basic recommendations are still available
- All core interview functionality continues to work
- No degradation in the main interview experience

## API Limits

The free Gemini API includes generous limits:
- **Rate Limit**: 60 requests per minute
- **Daily Limit**: Substantial daily quotas for personal use
- **No Cost**: Completely free for moderate usage

For most users, these limits are more than sufficient for regular interview practice.

## Troubleshooting

**API Key Not Working?**
- Ensure the key is correctly copied without extra spaces
- Verify the environment file is named `.env.local` exactly
- Restart your development server after adding the key

**No Insights Appearing?**
- Create a few practice interviews first
- Complete at least one interview to generate meaningful data
- Check browser console for any error messages

**Rate Limit Errors?**
- The system will automatically use fallback data
- Wait a few minutes before generating new insights
- Consider creating interviews less frequently

## Need Help?

If you encounter any issues with the Gemini API integration:
1. Check the browser console for error messages
2. Verify your API key is correctly set in `.env.local`
3. Ensure your development server is restarted after adding environment variables
4. The fallback system ensures the app continues working even without AI features
