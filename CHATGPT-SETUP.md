# ChatGPT Integration Setup Guide

Your LiveChat component has been successfully integrated with ChatGPT! Here's how to complete the setup:

## 🔑 Step 1: Get Your OpenAI API Key

1. Go to [OpenAI Platform](https://platform.openai.com/api-keys)
2. Sign in to your OpenAI account (or create one)
3. Click "Create new secret key"
4. Copy the API key (starts with `sk-`)

## ⚙️ Step 2: Configure Your Environment

1. Open the file: `.env.local` in your project root
2. Replace `your_openai_api_key_here` with your actual API key:
   ```
   VITE_OPENAI_API_KEY=sk-your-actual-api-key-here
   ```
3. Save the file

## 🚀 Step 3: Test the ChatBot

1. Start your development server: `npm run dev`
2. Open your application
3. Click the chat bubble in the bottom-right corner
4. Try chatting with the AI!

## 💬 Features

- **Real ChatGPT Integration**: Uses OpenAI's GPT-3.5-turbo model
- **Smart Conversation**: Maintains context throughout the chat
- **Agent Escalation**: Type "agent" or "human" to connect with support
- **Clear Conversation**: Use the refresh button in the chat header
- **Error Handling**: Graceful fallbacks if API is unavailable
- **Quick Suggestions**: Pre-built suggestion buttons for common queries

## 🔒 Security Notes

- **Development Only**: Current setup allows browser-side API calls
- **Production Recommendation**: Move API calls to your backend server
- **API Key Protection**: Never commit your actual API key to version control

## 💰 Usage Costs

- ChatGPT API has usage-based pricing
- GPT-3.5-turbo is very affordable (~$0.002 per 1K tokens)
- Monitor your usage at [OpenAI Usage Dashboard](https://platform.openai.com/usage)

## 🛠️ Customization

You can customize the AI behavior by editing the system prompt in:
`src/services/openaiService.ts` - Look for the `conversationHistory` initialization

## 🚨 Troubleshooting

- **"AI service not configured"**: Check your `.env.local` file
- **"Usage limit reached"**: Check your OpenAI billing/usage
- **API errors**: Check browser console for detailed error messages

## 📝 Example Conversations

Try these sample conversations:

- "How do I reset my password?"
- "I need help with billing"
- "Create a support ticket"
- "I want to speak to a human agent"

---

Your chatbot is now powered by real AI! 🎉
