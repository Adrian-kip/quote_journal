# server/config.py
import os
from dotenv import load_dotenv

# This will load the .env file ONLY in your local development,
# because the .env file does not exist on the Render server.
# In production, the app will rely on the environment variables
# provided by the Render service itself.
load_dotenv()

class Config:
    """
    Final, production-ready configuration.
    """
    SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URI')
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    JWT_SECRET_KEY = os.environ.get('JWT_SECRET_KEY')