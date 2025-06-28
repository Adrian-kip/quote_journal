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

    db.init_app(app)
    migrate.init_app(app, db)
    jwt.init_app(app)

    frontend_url = os.environ.get('FRONTEND_URL')
    if frontend_url:
        CORS(app, origins=[frontend_url], supports_credentials=True)
    else:
        CORS(app)

    from models import user, quote, like

    app.register_blueprint(auth_bp, url_prefix='/api')
    app.register_blueprint(quote_bp, url_prefix='/api')

    return app

# DO NOT create an app instance here for production
# app = create_app()  <-- THIS LINE IS THE PROBLEM AND IS NOW REMOVED

if __name__ == '__main__':
    # This block only runs for local development, not in production with Gunicorn
    app = create_app()
    app.run(debug=True)