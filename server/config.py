import os
from dotenv import load_dotenv
from datetime import timedelta

load_dotenv()

class Config:
    # Database Configuration
    SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URI')
    if not SQLALCHEMY_DATABASE_URI:
        raise ValueError("No DATABASE_URI set for Flask application")
    
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SQLALCHEMY_ENGINE_OPTIONS = {
        'pool_size': 10,
        'pool_recycle': 300,
        'pool_pre_ping': True,
        'max_overflow': 20,
    }

    # JWT Configuration
    JWT_SECRET_KEY = os.environ.get('JWT_SECRET_KEY')
    if not JWT_SECRET_KEY:
        raise ValueError("No JWT_SECRET_KEY set for Flask application")
    
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(hours=1)
    JWT_REFRESH_TOKEN_EXPIRES = timedelta(days=30)
    JWT_TOKEN_LOCATION = ['headers', 'cookies']
    JWT_COOKIE_SECURE = os.environ.get('FLASK_ENV') == 'production'
    JWT_COOKIE_CSRF_PROTECT = True
    JWT_CSRF_CHECK_FORM = True

    # Application Security
    SECRET_KEY = os.environ.get('SECRET_KEY') or JWT_SECRET_KEY
    PROPAGATE_EXCEPTIONS = True

    # CORS Configuration
    CORS_ORIGINS = os.environ.get('CORS_ORIGINS', '').split(',')
    if not CORS_ORIGINS:
        CORS_ORIGINS = ['http://localhost:3000']

    FLASK_ENV = os.environ.get('FLASK_ENV', 'development')
    DEBUG = FLASK_ENV == 'development'

class DevelopmentConfig(Config):
    DEBUG = True
    SQLALCHEMY_ECHO = True

class TestingConfig(Config):
    TESTING = True
    SQLALCHEMY_DATABASE_URI = os.environ.get('TEST_DATABASE_URI', 'sqlite:///:memory:')

class ProductionConfig(Config):
    DEBUG = False
    JWT_COOKIE_DOMAIN = os.environ.get('JWT_COOKIE_DOMAIN')

def get_config():
    env = os.environ.get('FLASK_ENV', 'development')
    return {
        'development': DevelopmentConfig,
        'testing': TestingConfig,
        'production': ProductionConfig
    }.get(env, Config)