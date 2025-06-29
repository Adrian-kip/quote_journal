# server/config.py
import os
from dotenv import load_dotenv

# This will load the .env file ONLY in your local development.
# On Render, this file won't exist, so the app will use
# the environment variables set in the dashboard.
load_dotenv()

class Config:
    """
    Final, production-ready configuration.
    """
    SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URI')
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    JWT_SECRET_KEY = os.environ.get('JWT_SECRET_KEY')