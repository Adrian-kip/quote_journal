from extensions import db
from passlib.hash import pbkdf2_sha256 as sha256


followers = db.Table('followers',
    db.Column('follower_id', db.Integer, db.ForeignKey('users.id'), primary_key=True),
    db.Column('followed_id', db.Integer, db.ForeignKey('users.id'), primary_key=True)
)

class User(db.Model):
    __tablename__ = 'users'

    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(128), nullable=False)

    quotes = db.relationship('Quote', backref='author', lazy=True, cascade="all, delete-orphan")
    likes = db.relationship('Like', backref='user', lazy=True, cascade="all, delete-orphan")
    collections = db.relationship('Collection', backref='user', lazy=True, cascade="all, delete-orphan")

    followed = db.relationship(
        'User', secondary=followers,
        primaryjoin=(followers.c.follower_id == id),
        secondaryjoin=(followers.c.followed_id == id),
        backref=db.backref('followers', lazy='dynamic'), 
        lazy='dynamic'
    )

    
    def follow(self, user):
        """Follow a user."""
        if not self.is_following(user):
            self.followed.append(user)

    def unfollow(self, user):
        """Unfollow a user."""
        if self.is_following(user):
            self.followed.remove(user)

    def is_following(self, user):
        """Check if the current user is following another user."""
        return self.followed.filter(
            followers.c.followed_id == user.id).count() > 0
    
    def set_password(self, password):
        self.password_hash = sha256.hash(password)

    def check_password(self, password):
        return sha256.verify(password, self.password_hash)

    def to_dict(self):
        return {
            'id': self.id,
            'username': self.username,
            'email': self.email
        }
    def to_public_dict(self):
        return {
            'id': self.id,
            'username': self.username,
            'followers_count': self.followers.count(),
            'following_count': self.followed.count(),
            'quotes': [quote.to_dict() for quote in self.quotes]
        }
    
    def to_dict_simple(self):
        return {
            'id': self.id,
            'username': self.username
        }