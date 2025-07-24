# 🚀 Setup Guide for Agentic AI Billing Assistant

This guide will help you set up and run the React-based AI billing assistant.

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js 16+** and **npm** (Download from [nodejs.org](https://nodejs.org/))
- **OpenAI API Key** (Get from [platform.openai.com](https://platform.openai.com/))

## 🔧 Installation Steps

### 1. Install Dependencies

**Frontend Dependencies:**
```bash
npm install
```

**Backend Dependencies:**
```bash
cd backend
npm install
cd ..
```

### 2. Environment Configuration

Create the backend environment file:
```bash
cp backend/.env.example backend/.env
```

Edit `backend/.env` and add your OpenAI API key:
```env
OPENAI_API_KEY=your_openai_api_key_here
PORT=5000
NODE_ENV=development
```

### 3. Start the Application

You need to run both the backend and frontend servers:

**Terminal 1 - Start Backend Server:**
```bash
cd backend
npm run dev
```
The backend will start on `http://localhost:5000`

**Terminal 2 - Start Frontend Server:**
```bash
npm start
```
The frontend will start on `http://localhost:3000`

### 4. Access the Application

Open your browser and navigate to:
```
http://localhost:3000
```

## 🎯 First Steps

1. **Upload a PDF Invoice**: Use the drag-and-drop area to upload a PDF bill
2. **Ask Questions**: Try asking about your bill or general market questions
3. **Use Voice Input**: Click the microphone icon to speak your questions
4. **Explore Actions**: Try payment actions, address changes, or filing complaints

## 🔍 Troubleshooting

### Common Issues

**1. "Cannot find module" errors**
```bash
# Delete node_modules and reinstall
rm -rf node_modules backend/node_modules
npm install
cd backend && npm install
```

**2. OpenAI API errors**
- Verify your API key is correct in `backend/.env`
- Check your OpenAI account has credits
- Ensure the API key has the necessary permissions

**3. Port already in use**
```bash
# Kill processes on ports 3000 and 5000
npx kill-port 3000 5000
```

**4. CORS errors**
- Ensure both frontend and backend are running
- Check that the proxy setting in `package.json` points to `http://localhost:5000`

### Development Tips

**Hot Reload:**
Both servers support hot reload - changes will automatically refresh the application.

**Debugging:**
- Backend logs appear in Terminal 1
- Frontend logs appear in the browser console
- Use browser DevTools for debugging React components

**API Testing:**
You can test the backend API directly:
```bash
# Health check
curl http://localhost:5000/api/health

# Test chat endpoint
curl -X POST http://localhost:5000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Hello, how are you?"}'
```

## 🎨 Customization

### Styling
- Modify `tailwind.config.js` for theme changes
- Update CSS classes in components for styling
- Adjust animations in Framer Motion components

### AI Behavior
- Edit the `SYSTEM_PROMPT` in `backend/server.js`
- Modify response handling in chat endpoints
- Add new action handlers for custom functionality

### Features
- Add new components in `src/components/`
- Extend the chat context in `src/context/ChatContext.js`
- Add new API endpoints in `backend/server.js`

## 📦 Production Deployment

### Build for Production
```bash
# Build frontend
npm run build

# The build folder contains the production-ready files
```

### Environment Variables for Production
```env
NODE_ENV=production
OPENAI_API_KEY=your_production_api_key
PORT=5000
CORS_ORIGINS=https://yourdomain.com
```

### Deployment Options
- **Vercel/Netlify**: For frontend static hosting
- **Heroku/Railway**: For full-stack deployment
- **AWS/Google Cloud**: For enterprise deployment

## 🆘 Getting Help

If you encounter issues:

1. Check the console logs in both terminals
2. Verify all dependencies are installed correctly
3. Ensure your OpenAI API key is valid and has credits
4. Check that both servers are running on the correct ports

For additional support, refer to the main README.md or contact the development team.

---

**Happy coding! 🚀**
