from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_jwt_extended import JWTManager
import logging

db = SQLAlchemy(engine_options={
    'pool_size': 10,
    'pool_recycle': 300,
    'pool_pre_ping': True,
    'max_overflow': 20
})

migrate = Migrate()
jwt = JWTManager()

@jwt.token_in_blocklist_loader
def check_if_token_revoked(jwt_header, jwt_payload):
    return False

def setup_db_logging(app):
    if app.debug:
        logging.basicConfig()
        logging.getLogger('sqlalchemy.engine').setLevel(logging.INFO)