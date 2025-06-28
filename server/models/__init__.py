from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

from .user import User
from .quote import Quote
from .like import Like
