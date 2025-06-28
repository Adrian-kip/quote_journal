from models import db 
from passlib.hash import pbkdf2_sha256 as sha256

class User(db.Model):
    __tablename__ = 'users'

    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(128), nullable=False)

    quotes = db.relationship('Quote', backref='author', lazy=True, cascade="all, delete-orphan")
    likes = db.relationship('Like', backref='user', lazy=True, cascade="all, delete-orphan")

    def set_password(self, password):
        """Hashes the password."""
        self.password_hash = sha256.hash(password)

    def check_password(self, password):
        """Verifies the password."""
        return sha256.verify(password, self.password_hash)

    def to_dict(self):
        """Converts user object to a dictionary."""
        return {
            'id': self.id,
            'username': self.username,
            'email': self.email
        }