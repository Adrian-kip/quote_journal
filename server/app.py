import os
from flask import Flask
from config import get_config
from extensions import db, migrate, jwt, setup_db_logging
from routes.auth_routes import auth_bp
from routes.quote_routes import quote_bp
from flask_cors import CORS
import logging

def create_app(config_class=None):
    app = Flask(__name__)
    app.config.from_object(config_class or get_config())
    
    db.init_app(app)
    migrate.init_app(app, db)
    jwt.init_app(app)
    setup_db_logging(app)
    
    CORS(app, resources={
        r"/api/*": {
            "origins": app.config['CORS_ORIGINS'],
            "supports_credentials": True,
            "methods": ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
            "allow_headers": ["Content-Type", "Authorization"]
        }
    })

    app.register_blueprint(auth_bp, url_prefix='/api')
    app.register_blueprint(quote_bp, url_prefix='/api')

    @app.route('/api/health')
    def health_check():
        try:
            db.session.execute('SELECT 1')
            return {'status': 'healthy'}, 200
        except Exception as e:
            app.logger.error(f"Health check failed: {e}")
            return {'status': 'unhealthy'}, 500

    @app.errorhandler(404)
    def not_found(error):
        return {'error': 'Not found'}, 404

    @app.errorhandler(500)
    def internal_error(error):
        app.logger.error(f"Server error: {error}")
        return {'error': 'Internal server error'}, 500

    return app