#!/bin/bash

# Install dependencies
pip install -r requirements.txt

# Run migrations
alembic upgrade head

# Train ML model (optional, first time only)
python -m app.ml.train

# Start server
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload