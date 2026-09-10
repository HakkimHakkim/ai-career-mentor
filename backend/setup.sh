#!/bin/bash

echo "🚀 Setting up AI Career Mentor Backend..."

# Install dependencies
echo "📦 Installing dependencies..."
pip install -r requirements.txt

# Create uploads directory
mkdir -p uploads

# Train ML model
echo "🤖 Training ML model..."
python -m app.ml.train

# Seed database
echo "🌱 Seeding database..."
python -m app.seed

echo "✅ Setup complete!"
echo "🎯 Start server with: python -m uvicorn app.main:app --reload"