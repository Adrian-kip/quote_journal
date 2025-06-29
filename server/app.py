# server/app.py
import os
from flask import Flask
from flask_cors import CORS
from config import Config

# Import extensions from our new file
from extensions import db, migrate, jwt

# Import routes
from routes.auth_routes import auth_bp
from routes.quote_routes import quote_bp

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    # Initialize extensions with the app
    db.init_app(app)
    migrate.init_app(app, db)
    jwt.init_app(app)

    # Final, Secure CORS Configuration for Production
    frontend_url = os.environ.get('FRONTEND_URL')
    if frontend_url:
        CORS(app, origins=[frontend_url], supports_credentials=True)
    else:
        # Fallback for local development if the variable isn't set
        CORS(app)

    # This import is needed for Flask-Migrate to see the models
    from models import user, quote, like

    # Register blueprints
    app.register_blueprint(auth_bp, url_prefix='/api')
    app.register_blueprint(quote_bp, url_prefix='/api')

    return app

app = create_app()

if __name__ == '__main__':
    app.run(debug=True)