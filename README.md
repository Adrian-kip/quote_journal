Quote Journal
Quote Journal is a full-stack web application where users can discover, post, and organize their favorite quotes. It features a modern, responsive interface with a personalized social feed, quote collections, and a dark/light mode theme.

Key Features
User Authentication: Secure user signup and login using JSON Web Tokens (JWT).

Social Following: Users can follow other authors to create a personalized homepage feed.

Quote & Collection Management: Full CRUD (Create, Read, Update, Delete) functionality for quotes and themed collections.

Interactive Engagement: React to quotes with emojis, save quotes to collections, and explore user profiles.

Discovery Feeds: Logged-in users see a personalized feed, while logged-out users see a feed of trending quotes sorted by popularity.

Dynamic UI: A responsive masonry layout with clickable tags and a toggleable dark/light mode.

Tech Stack
Backend
Framework: Flask (Python)

Database: PostgreSQL

ORM: SQLAlchemy with Flask-Migrate

Authentication: Flask-JWT-Extended

Frontend
Library: React (built with Vite)

Routing: React Router

State Management: React Context API

Forms: Formik & Yup

Setup and Installation
Backend (/server)
Navigate to the /server directory.

Create a Python virtual environment: python3 -m venv venv

Activate it: source venv/bin/activate

Install dependencies: pip install -r requirements.txt

Create a local .env file and set your DATABASE_URI and JWT_SECRET_KEY.

Create the local database: createdb your_db_name

Run database migrations: flask db upgrade

Run the server: flask run

Frontend (/client)
Navigate to the /client directory.

Install dependencies: npm install

Run the development server: npm run dev
