# server/app.py
import os
from flask import Flask
from config import Config
from extensions import db, migrate, jwt
from routes.auth_routes import auth_bp
from routes.quote_routes import quote_bp
from flask_cors import CORS
from routes.collection_routes import collection_bp

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    db.init_app(app)
    migrate.init_app(app, db)
    jwt.init_app(app)

    CORS(app)

    from models import user, quote, like

    @app.cli.command("reset-db")
    def reset_db_command():
        """Drops all database tables."""
        db.drop_all()
        print("Database tables dropped.")

    app.register_blueprint(auth_bp, url_prefix='/api')
    app.register_blueprint(quote_bp, url_prefix='/api')
    app.register_blueprint(collection_bp, url_prefix='/api')

    return app

if __name__ == '__main__':
    app = create_app()
    app.run(debug=True)