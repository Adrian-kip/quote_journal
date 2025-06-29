import os
from dotenv import load_dotenv

# This will load the .env file ONLY in local development.
# On Render, the app will use the environment variables set in the dashboard.
load_dotenv()

class Config:
    SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URI')
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    JWT_SECRET_KEY = os.environ.get('JWT_SECRET_KEY')