# server/app.py

import os
from flask import Flask
from config import Config
from extensions import db, migrate, jwt
from routes.auth_routes import auth_bp
from routes.quote_routes import quote_bp
from flask_cors import CORS

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    # Initialize extensions
    db.init_app(app)
    migrate.init_app(app, db)
    jwt.init_app(app)

    # CORS setup — allow only frontend URL if provided
    frontend_url = os.environ.get('FRONTEND_URL')
    if frontend_url:
        CORS(app, origins=[frontend_url], supports_credentials=True)
    else:
        CORS(app, origins="*")  # fallback for debugging or dev

    # Import models after init_app to bind SQLAlchemy correctly
    from models import user, quote, like

    # Register routes
    app.register_blueprint(auth_bp, url_prefix='/api')
    app.register_blueprint(quote_bp, url_prefix='/api')

    return app

# Local dev only — ignored by Gunicorn on Render
if __name__ == '__main__':
    app = create_app()
    app.run(debug=True)
