# PCOS Insight - AI-Powered Health Assessment

*Automatically synced with your [v0.app](https://v0.app) deployments*

[![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?style=for-the-badge&logo=vercel)](https://vercel.com/khushbumankare1-3021s-projects/v0-pcosinsightformmain)
[![Built with v0](https://img.shields.io/badge/Built%20with-v0.app-black?style=for-the-badge)](https://v0.app/chat/projects/vtg2WvCQzQF)

## Overview

A comprehensive PCOS (Polycystic Ovary Syndrome) risk assessment application featuring:

- **Next.js Frontend**: Modern React-based user interface with authentication
- **FastAPI Backend**: Python-based API with JWT authentication and ML model integration
- **AI-Powered Predictions**: Support for trained pickle models for PCOS risk assessment
- **User Management**: Complete authentication system with user registration and login
- **Assessment Tracking**: Store and retrieve user assessment history

## Architecture

\`\`\`
┌─────────────────┐    HTTP/JWT    ┌──────────────────┐    Pickle Models    ┌─────────────────┐
│   Next.js       │ ──────────────► │   FastAPI        │ ──────────────────► │   ML Models     │
│   Frontend      │                │   Backend        │                    │   (Your Models) │
│                 │                │                  │                    │                 │
│ • Authentication│                │ • JWT Auth       │                    │ • pcos_model.pkl│
│ • User Dashboard│                │ • User Management│                    │ • scaler.pkl    │
│ • PCOS Forms    │                │ • ML Predictions │                    │                 │
│ • Results View  │                │ • SQLite/Postgres│                    │                 │
└─────────────────┘                └──────────────────┘                    └─────────────────┘
\`\`\`

## Quick Start

### Prerequisites

- Node.js 18+ and npm/yarn
- Python 3.8+ and pip
- Your trained PCOS prediction model (pickle format)

### 1. Setup FastAPI Backend

\`\`\`bash
# Navigate to the ML API directory
cd ml-api

# Install Python dependencies
pip install -r requirements.txt

# Add your trained models
mkdir -p models
# Place your pcos_model.pkl and scaler.pkl files in the models/ directory

# Run the FastAPI server
uvicorn main:app --reload --host 0.0.0.0 --port 8000
\`\`\`

The FastAPI server will be available at `http://localhost:8000`
- API Documentation: `http://localhost:8000/docs`
- Health Check: `http://localhost:8000/health`

### 2. Setup Next.js Frontend

\`\`\`bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your configuration
\`\`\`

Required environment variables in `.env.local`:
\`\`\`bash
# FastAPI Backend URL
NEXT_PUBLIC_FASTAPI_URL=http://localhost:8000

# JWT Secret (must match FastAPI SECRET_KEY)
SECRET_KEY=your-secret-key-change-in-production
\`\`\`

\`\`\`bash
# Run the development server
npm run dev
\`\`\`

The Next.js app will be available at `http://localhost:3000`

## Model Requirements

Your pickle model should:

1. **Input Format**: Accept 41 numerical features (see FastAPI main.py for complete list)
2. **Methods**: Support either `predict()` or `predict_proba()` methods
3. **Compatibility**: Be compatible with scikit-learn format
4. **Output**: Return risk scores between 0-1 for binary classification

### Example Model Structure
\`\`\`python
# Your model should work like this:
import pickle
model = pickle.load(open('models/pcos_model.pkl', 'rb'))
prediction = model.predict_proba(features)  # Returns [[prob_no_pcos, prob_pcos]]
risk_score = prediction[0][1]  # PCOS probability
\`\`\`

## Features

### Frontend (Next.js)
- ✅ User registration and login
- ✅ Protected routes with JWT authentication
- ✅ Multi-step PCOS assessment form (20+ parameters)
- ✅ AI-powered risk assessment results
- ✅ User dashboard with assessment history
- ✅ Responsive design with Tailwind CSS

### Backend (FastAPI)
- ✅ JWT-based authentication
- ✅ User management with SQLAlchemy
- ✅ PCOS prediction endpoints
- ✅ Assessment history storage
- ✅ Automatic API documentation
- ✅ Health monitoring endpoints

### ML Integration
- ✅ Support for custom pickle models
- ✅ Feature preprocessing and validation
- ✅ Confidence scoring
- ✅ Personalized recommendations
- ✅ Fallback predictions if model unavailable

## API Endpoints

### Authentication
- `POST /auth/register` - User registration
- `POST /auth/login` - User login
- `GET /auth/me` - Get current user info

### Assessments
- `POST /assessments` - Create new PCOS assessment
- `GET /assessments` - Get user's assessment history

### Health
- `GET /health` - Service health check
- `GET /` - API status

## Deployment

### FastAPI Backend
\`\`\`bash
# Using Docker
docker build -t pcos-api ./ml-api
docker run -p 8000:8000 -v /path/to/models:/app/models pcos-api

# Or deploy to cloud platforms:
# - Heroku, AWS, GCP, Azure
# - Railway, Render, DigitalOcean
\`\`\`

### Next.js Frontend
\`\`\`bash
# Build for production
npm run build
npm start

# Or deploy to Vercel (recommended)
vercel --prod
\`\`\`

## Environment Variables

### Next.js (.env.local)
\`\`\`bash
NEXT_PUBLIC_FASTAPI_URL=https://your-fastapi-domain.com
SECRET_KEY=your-jwt-secret-key
\`\`\`

### FastAPI
\`\`\`bash
SECRET_KEY=your-jwt-secret-key
DATABASE_URL=sqlite:///./pcos_app.db  # or PostgreSQL URL for production
\`\`\`

## Development

### Project Structure
\`\`\`
├── app/                    # Next.js app directory
│   ├── auth/              # Authentication pages
│   ├── dashboard/         # User dashboard
│   ├── assessment/        # PCOS assessment
│   └── api/               # API routes
├── components/            # React components
│   ├── auth/              # Auth-related components
│   ├── assessment/        # Assessment components
│   └── ui/                # UI components
├── lib/                   # Utilities and configurations
│   ├── auth/              # Authentication context
│   └── config/            # API configuration
└── ml-api/                # FastAPI backend
    ├── main.py            # FastAPI application
    ├── models/            # ML model files
    └── requirements.txt   # Python dependencies
\`\`\`

### Adding Your Model

1. Train your PCOS prediction model using your preferred ML framework
2. Save as pickle file: `pickle.dump(model, open('pcos_model.pkl', 'wb'))`
3. Place in `ml-api/models/` directory
4. Ensure it accepts the 41 features defined in the FastAPI schema
5. Test with the health endpoint: `GET /health`

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test both frontend and backend
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For issues and questions:
1. Check the API documentation at `/docs`
2. Verify your model format matches the requirements
3. Ensure all environment variables are set correctly
4. Check the health endpoints for service status

---

**Continue building your app on: [https://v0.app/chat/projects/vtg2WvCQzQF](https://v0.app/chat/projects/vtg2WvCQzQF)**
