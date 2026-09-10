# AI Career Mentor - Backend API

Production-grade FastAPI backend for AI Career Mentor platform.

## 📋 Features

- 🔐 User authentication (JWT)
- 🤖 ML career recommendation engine
- 🎯 Personalized learning roadmaps
- 💼 Job matching and recommendations
- 📝 Resume analysis with AI
- 🎤 Interview preparation
- 📚 Learning management system
- 🔔 Notifications system
- 📊 Progress tracking
- 🧠 AI-powered tutoring (Grok)

## 🚀 Quick Start

### Prerequisites
- Python 3.11+
- PostgreSQL or MySQL
- Grok API key

### Installation

```bash
# Clone repository
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Setup environment
cp .env.example .env
# Edit .env with your configuration

# Initialize database
python -m app.seed

# Run server
uvicorn app.main:app --reload
```

Server runs on: `http://localhost:8000`
API docs: `http://localhost:8000/docs`

## 📁 Project Structure