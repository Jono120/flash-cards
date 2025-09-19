```NOTE: This is a proof of concept and is still in active development.```
# Flashcard Generator

An intelligent flashcard application that automatically generates study materials from uploaded documents using Google's Gemini AI. Upload PDFs, Word documents, or PowerPoint presentations and get personalized flashcards for efficient studying.

## Features

- **Multi-format Document Support**: Upload PDF, DOCX, and PPTX files
- **AI-Powered Generation**: Uses Google Gemini to create intelligent flashcards
- **Progress Tracking**: Monitor your learning progress and streaks
- **Spaced Repetition**: Optimized review scheduling for better retention
- **User Authentication**: Secure login with OAuth support (Apple OAuth integrated)
- **Responsive Design**: Works seamlessly on desktop and mobile
- **Holiday Features**: Special holiday banners and management

## Tech Stack

### Backend
- **FastAPI**: Modern, fast web framework for Python
- **SQLAlchemy**: SQL toolkit and ORM
- **PostgreSQL**: Database (configurable)
- **Ollama Model**: This tool employs Ollama local models as first generation
- **Google Generative AI**: Gemini API for flashcard generation
- **Alembic**: Database migrations
- **JWT Authentication**: Secure user sessions

### Frontend
- **React**: JavaScript library for building user interfaces
- **Tailwind CSS**: Utility-first CSS framework
- **Axios**: HTTP client for API requests

### Document Processing
- **PyMuPDF (fitz)**: PDF text extraction
- **python-docx**: Word document processing
- **python-pptx**: PowerPoint presentation processing

## Project Structure

```
flashcards/
│
├── backend/                  # FastAPI backend
│   ├── main.py               # Entry point (FastAPI app)
│   ├── models.py             # SQLAlchemy models
│   ├── crud.py               # Database logic
│   ├── database.py           # DB session + engine
│   ├── schemas.py            # Pydantic schemas
│   ├── auth.py               # User auth & JWTs
│   ├── oauth_routes.py       # OAuth authentication routes
│   └── utils/                # Helper utilities
│       ├── apple_oauth.py    # Apple OAuth integration
│       ├── chunking.py       # Text chunking pipeline
│       ├── extractors.py     # Document text extraction
│       ├── flashcards.py     # Flashcard processing
│       └── generator.py      # AI flashcard generation
│
├── frontend/                 # React frontend
│   ├── src/
│   │   ├── App.js
│   │   ├── api.js            # API calls to backend
│   │   ├── components/
│   │   │   ├── DailyReview.js
│   │   │   ├── FileUpload.js
│   │   │   ├── FlashCardViewer.js
│   │   │   ├── HolidayBanner.js
│   │   │   ├── HolidayManager.js
│   │   │   ├── Login.js
│   │   │   ├── OAuthCallback.js
│   │   │   ├── ProgressDashboard.js
│   │   │   └── UploadComponent.js
│   │   ├── styles/           # Tailwind / CSS
│   │   └── utils/            # Frontend helpers
│   ├── package.json
│   └── tailwind.config.js
│
├── docs/                     # Documentation
├── docker-compose.yml        # Docker configuration
├── requirements.txt          # Python dependencies
└── README.md                 # This file
```

## Prerequisites

- Python 3.12+
- Node.js 16+ (for frontend)
- PostgreSQL (optional - can use SQLite for development)
- Google Gemini API key

## Installation

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd flash
```

### 2. Backend Setup

```bash
# Install Python dependencies
pip install -r requirements.txt

# Set up environment variables
cp .env.example .env
# Edit .env file with your configuration
```

### 3. Environment Variables

Create a `.env` file in the root directory:

```env
# Gemini AI API
GEMINI_API_KEY=your_gemini_api_key_here

# Database
DATABASE_URL=postgresql://username:password@localhost/flashcards
# Or use SQLite for development:
# DATABASE_URL=sqlite:///./flashcards.db

# JWT Secret
SECRET_KEY=your_secret_key_here
ALGORITHM=HS256

# OAuth (optional)
APPLE_CLIENT_ID=your_apple_client_id
APPLE_CLIENT_SECRET=your_apple_client_secret
```

### 4. Database Setup

```bash
# Run database migrations
alembic upgrade head
```

### 5. Frontend Setup

```bash
cd frontend
npm install
npm start
```

### 6. Start the Backend

```bash
# From the root directory
uvicorn backend.main:app --reload --host 0.0.0.0 --port 8000
```

## Usage

1. **Start the Application**
   - Backend runs on `http://localhost:8000`
   - Frontend runs on `http://localhost:3000`

2. **Upload Documents**
   - Navigate to the upload page
   - Select PDF, DOCX, or PPTX files
   - Wait for AI processing

3. **Study with Flashcards**
   - View generated flashcards
   - Use spaced repetition for optimal learning
   - Track your progress

4. **Monitor Progress**
   - Check your learning streaks
   - View performance analytics
   - Manage your study sessions

## API Endpoints

### Authentication
- `POST /auth/login` - User login
- `POST /auth/register` - User registration
- `POST /auth/oauth/apple` - Apple OAuth

### Flashcards
- `POST /flashcards/upload` - Upload and process documents
- `GET /flashcards/` - Get user's flashcards
- `GET /flashcards/{id}` - Get specific flashcard
- `POST /flashcards/{id}/review` - Submit review

### User Progress
- `GET /progress/` - Get user progress
- `GET /progress/streaks` - Get learning streaks

## Docker Deployment

```bash
# Build and run with Docker Compose
docker-compose up --build
```

## Development

### Running Tests

```bash
# Backend tests
pytest

# Frontend tests
cd frontend
npm test
```

### Code Style

The project uses:
- **Black** for Python code formatting
- **ESLint/Prettier** for JavaScript formatting

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

## API Key Setup

### Getting a Gemini API Key

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Create a new API key
4. Copy the key to your `.env` file

### Apple OAuth Setup (Optional)

1. Register as an Apple Developer
2. Create a Services ID in the Apple Developer Console
3. Configure OAuth settings
4. Add credentials to your `.env` file

## Troubleshooting

### Common Issues

1. **Import Errors**: Ensure all dependencies are installed with `pip install -r requirements.txt`
2. **Database Connection**: Check your `DATABASE_URL` in the `.env` file
3. **API Key Issues**: Verify your Gemini API key is correct and has sufficient quota
4. **CORS Errors**: Ensure the backend CORS settings allow your frontend domain

### Logs

- Backend logs: Check console output where uvicorn is running
- Frontend logs: Check browser developer console

## License

MIT License - see LICENSE file for details

## Support

For issues and questions:
1. Check the troubleshooting section
2. Review existing GitHub issues
3. Create a new issue with detailed information

---

Built to use FastAPI, React, and Google Gemini AI
Added updates and adjustments with the help of Claude, Gemini and GitHub Copilot, all work is my own however.
