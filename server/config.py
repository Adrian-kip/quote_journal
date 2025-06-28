import os
from dotenv import load_dotenv

# Find the absolute path of the directory containing this file
basedir = os.path.abspath(os.path.dirname(__file__))

# Define the path to the .env file
dotenv_path = os.path.join(basedir, '.env')

# Load the .env file from the specified path
load_dotenv(dotenv_path=dotenv_path)

class Config:
    """
    Configuration class for the Flask application.
    Loads values from the .env file.
    """
    SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL')
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    JWT_SECRET_KEY = os.environ.get('JWT_SECRET_KEY')
