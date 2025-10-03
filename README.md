# Qiu System layout

test chg deploy

[![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?style=for-the-badge&logo=vercel)](https://vercel.com/iveex/v0-qiu-system-layout)
[![Built with v0](https://img.shields.io/badge/Built%20with-v0.dev-black?style=for-the-badge)](https://v0.dev/chat/projects/2wjhg86DPw4)

### Setup

1. Clone the repository:

   ```
   git clone <repository-url>
   cd <repository-folder>
   ```

2. Create a virtual environment:

   ```
   python -m venv venv
   ```

3. Activate the virtual environment:

   - Windows:
     ```
     venv\Scripts\activate || venv\Scripts\activate.bat
     ```
   - macOS/Linux:
     ```
     source venv/bin/activate
     ```

4. Install dependencies:

   ```
   pip install -r requirements.txt
   ```

5. Change the directory to:

   ```
   cd backend
   ```

6. Run the application:
   ```
   uvicorn main:app --reload
   ```

### Frontend (Next.js)

1. Clone and navigate to the frontend directory:

   ```
   cd <frontend-name>
   ```

2. Install dependencies:

   ```
   npm install
   ```

3. Run the development server:
   ```
   npm run dev
   ```

The application will be available at:

- Frontend: [http://localhost:3000](http://localhost:3000)
- Backend: [http://localhost:8000](http://localhost:8000) and
- [http://localhost:8000/docs](http://localhost:8000/docs) to access the backend documentation

## Overview

This repository will stay in sync with your deployed chats on [v0.dev](https://v0.dev).
Any changes you make to your deployed app will be automatically pushed to this repository from [v0.dev](https://v0.dev).

## Deployment

Your project is live at:

**[https://vercel.com/iveex/v0-qiu-system-layout](https://vercel.com/iveex/v0-qiu-system-layout)**

## Build your app

Continue building your app on:

**[https://v0.dev/chat/projects/2wjhg86DPw4](https://v0.dev/chat/projects/2wjhg86DPw4)**
