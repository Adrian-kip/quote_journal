from extensions import db


class Quote(db.Model):
    __tablename__ = 'quotes'

    id = db.Column(db.Integer, primary_key=True)
    content = db.Column(db.Text, nullable=False)
    tags = db.Column(db.String(200), nullable=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)

    likes = db.relationship('Like', backref='quote', lazy=True, cascade="all, delete-orphan")

    def to_dict(self):
        """Converts quote object to a dictionary."""
        return {
            'id': self.id,
            'content': self.content,
            'tags': self.tags,
            'user_id': self.user_id,
            'author': self.author.username,
            'likes': [like.to_dict() for like in self.likes]
        }