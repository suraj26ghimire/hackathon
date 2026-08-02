# AI Scholarship Matcher 🎓

An AI-powered scholarship matching platform for Nepali students. Students create a profile, and the system automatically matches them with relevant scholarships, explains why they qualify, and helps them apply.

## 🌟 Features

- **AI Scholarship Matching** — Multi-criteria scoring (GPA, Education, Field, Province, Income, Gender)
- **Student Profile** — Comprehensive profile to maximize match accuracy
- **30 Sample Scholarships** — Seeded database with diverse Nepali scholarships
- **Scholarship Search** — Search by field, location, gender, need-based, etc.
- **Bookmark System** — Save scholarships for later
- **AI Chatbot** — Floating assistant for questions
- **Match Explanation** — Shows why you match or miss each scholarship
- **JWT Authentication** — Secure register/login/logout
- **Admin Panel** — Django admin for managing scholarships and users

---

## 🏗️ Tech Stack

| Layer       | Technology                          |
|-------------|-------------------------------------|
| Frontend    | React + Vite + Tailwind CSS         |
| Backend     | Django 6 + Django REST Framework    |
| Database    | SQLite (dev) / PostgreSQL (prod)    |
| Auth        | JWT via `djangorestframework-simplejwt` |
| HTTP Client | Axios                               |
| Icons       | Lucide React                        |

---

## 📁 Project Structure

```
ai-scholarship-matcher/
├── venv/                    # Python virtual environment
├── backend/                 # Django backend
│   ├── backend/             # Django project settings, urls
│   ├── users/               # Auth, StudentProfile models & APIs
│   ├── scholarships/        # Scholarship & Bookmark models, APIs
│   ├── recommendations/     # AI matching engine API
│   ├── notifications/       # Notification app (extendable)
│   ├── chatbot/             # AI chatbot API
│   ├── requirements.txt     # Python dependencies
│   └── db.sqlite3           # SQLite database (auto-created)
└── frontend/                # React frontend
    ├── src/
    │   ├── components/      # Navbar, ScholarshipCard, ChatbotWidget
    │   ├── pages/           # Login, Register, Dashboard, Profile, Scholarships, ScholarshipDetails
    │   ├── context/         # AuthContext (JWT state management)
    │   └── services/        # Axios API service
    └── index.html
```

---

## 🚀 Setup Instructions

### Prerequisites

- Python 3.10+
- Node.js 18+
- npm

---

### 1. Clone / Navigate to the Project

```bash
cd /path/to/ai-scholarship-matcher
```

---

### 2. Backend Setup

```bash
# Activate the virtual environment
source venv/bin/activate        # macOS/Linux
# venv\Scripts\activate          # Windows

# Install dependencies
cd backend
pip install -r requirements.txt

# Run migrations
python manage.py migrate

# Seed 30 sample scholarships
python manage.py seed_scholarships

# Create admin user (for Django Admin panel)
python manage.py createsuperuser

# Start the backend server
python manage.py runserver
```

Backend will run at: **http://localhost:8000**

Admin Panel: **http://localhost:8000/admin**

---

### 3. Frontend Setup

Open a **new terminal tab**:

```bash
cd /path/to/ai-scholarship-matcher/frontend

npm install
npm run dev
```

Frontend will run at: **http://localhost:5173**

---

## 🔗 API Endpoints

| Method | URL                              | Auth Required | Description             |
|--------|----------------------------------|---------------|-------------------------|
| POST   | `/api/users/register/`           | No            | Register new user       |
| POST   | `/api/users/login/`              | No            | Get JWT tokens          |
| POST   | `/api/users/token/refresh/`      | No            | Refresh access token    |
| GET    | `/api/users/profile/`            | Yes           | Get current user profile |
| PUT    | `/api/users/profile/`            | Yes           | Update profile          |
| GET    | `/api/scholarships/list/`        | No            | List all scholarships   |
| GET    | `/api/scholarships/list/{id}/`   | No            | Get scholarship details |
| GET    | `/api/scholarships/bookmarks/`   | Yes           | Get user bookmarks      |
| POST   | `/api/scholarships/bookmarks/`   | Yes           | Add bookmark            |
| DELETE | `/api/scholarships/bookmarks/{id}/` | Yes        | Remove bookmark         |
| GET    | `/api/recommendations/`          | Yes           | Get AI-matched scholarships |
| POST   | `/api/chatbot/`                  | No            | Ask the AI chatbot      |

---

## 🧠 Matching Algorithm

The AI engine scores each scholarship for a student:

| Criteria       | Weight |
|----------------|--------|
| Education Level | 30%   |
| Field of Study  | 25%   |
| GPA             | 20%   |
| Province        | 10%   |
| Family Income   | 10%   |
| Other Conditions (gender, disability) | 5% |

Scholarships are returned sorted by match percentage (highest first).

---

## 🎨 UI Pages

| Page                | Route                  | Description                        |
|---------------------|------------------------|------------------------------------|
| Login               | `/login`               | JWT login                          |
| Register            | `/register`            | Create account                     |
| Dashboard           | `/`                    | Welcome card, top matches, reminders |
| Profile             | `/profile`             | Edit student profile               |
| Scholarships        | `/scholarships`        | Browse & search all scholarships   |
| Scholarship Details | `/scholarships/:id`    | Full details, AI match score, apply |

---

## 🔧 Configuration

### Use PostgreSQL instead of SQLite

In `backend/backend/settings.py`, update the `DATABASES` section:

```python
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': 'scholarship_db',
        'USER': 'your_user',
        'PASSWORD': 'your_password',
        'HOST': 'localhost',
        'PORT': '5432',
    }
}
```

### Add OpenAI API (for real AI chatbot)

In `backend/chatbot/views.py`, replace the mock responses with:

```python
import openai
openai.api_key = "YOUR_OPENAI_KEY"
response = openai.chat.completions.create(...)
```

---

## 🛠️ Development Tips

- **Re-seed scholarships:** `python manage.py seed_scholarships`
- **Create admin:** `python manage.py createsuperuser`
- **API browsing:** Visit `http://localhost:8000/api/scholarships/list/` in browser (DRF UI)
- **Manage scholarships:** `http://localhost:8000/admin`

---

## 📦 Extending the Project

| Feature              | Where to add                                |
|----------------------|---------------------------------------------|
| Email reminders      | `notifications/` — add Celery + SMTP        |
| OCR transcript       | `users/` — add PyTesseract or Google Vision |
| Real AI chatbot      | `chatbot/views.py` — plug in OpenAI/Gemini  |
| Telegram reminders   | `notifications/` — add python-telegram-bot  |
| International scholarships | Add to `seed_scholarships` data       |

---

## 🏆 Hackathon Demo Flow

1. Register → Fill Profile
2. Go to Dashboard → See AI-matched scholarships
3. Click a scholarship → See 92% match score + explanation
4. Bookmark it → See in Dashboard sidebar
5. Use chatbot → Ask "What documents do I need?"
6. Admin panel → Show scholarship management

---

Built with ❤️ for Nepal's student community.
