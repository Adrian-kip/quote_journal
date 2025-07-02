import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URI')
    SQLALCHEMY_TRACK_MODIFICATIONS = False

    
    JWT_SECRET_KEY = "7d9b3c4f2e8a1d0g6h5j4k3l2m1n0o9p8q7r6s5t4u3v2w1x0y9z"
    