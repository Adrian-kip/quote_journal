from extensions import db
from passlib.hash import pbkdf2_sha256 as sha256
from sqlalchemy import event

class User(db.Model):
    __tablename__ = 'users'

    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(128), nullable=False)

    quotes = db.relationship('Quote', backref='author', lazy=True, cascade="all, delete-orphan")
    likes = db.relationship('Like', backref='user', lazy=True, cascade="all, delete-orphan")

    def __init__(self, **kwargs):
        super(User, self).__init__(**kwargs)

    def set_password(self, password):
        if len(password) < 8:
            raise ValueError("Password must be at least 8 characters")
        self.password_hash = sha256.hash(password)

    def check_password(self, password):
        return sha256.verify(password, self.password_hash)

    def to_dict(self):
        return {
            'id': self.id,
            'username': self.username,
            'email': self.email
        }

@event.listens_for(User, 'before_insert')
@event.listens_for(User, 'before_update')
def validate_user(mapper, connection, target):
    if not target.username or len(target.username) > 80:
        raise ValueError("Username must be between 1 and 80 characters")
    if not target.email or '@' not in target.email or len(target.email) > 120:
        raise ValueError("Invalid email address")
    if not target.password_hash:
        raise ValueError("Password hash is required")