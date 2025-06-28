# server/app.py
import os
from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_jwt_extended import JWTManager
from flask_cors import CORS
from config import Config

from routes.auth_routes import auth_bp
from routes.quote_routes import quote_bp

db = SQLAlchemy()
migrate = Migrate()
jwt = JWTManager()

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    db.init_app(app)
    migrate.init_app(app, db)
    jwt.init_app(app)

    # Correct CORS Configuration for Production
    frontend_url = os.environ.get('FRONTEND_URL')
    if frontend_url:
        CORS(app, origins=[frontend_url], supports_credentials=True)
    else:
        CORS(app)

    from models import user, quote, like

    app.register_blueprint(auth_bp, url_prefix='/api')
    app.register_blueprint(quote_bp, url_prefix='/api')

    return app

app = create_app()

if __name__ == '__main__':
    app.run(debug=True)