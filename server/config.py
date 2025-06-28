# server/config.py
import os

# We are temporarily disabling dotenv for this test.

class Config:
    """
    Configuration class for the Flask application.
    """
    # --- TEMPORARY DEBUGGING STEP ---
    # WARNING: This is for testing only. Do not leave this in production code.
    # Paste your Render Internal Database URL directly here inside the quotes.
    SQLALCHEMY_DATABASE_URI = "postgresql://quote_journal_db_user:Ido1eDqVUBfZxFo86QqHis2b22my9ZGA@dpg-d1g53tfgi27c73efvag0-a/quote_journal_db"
    # ---

    SQLALCHEMY_TRACK_MODIFICATIONS = False

    # We still need to get the JWT secret from the environment.
    JWT_SECRET_KEY = os.environ.get('JWT_SECRET_KEY')