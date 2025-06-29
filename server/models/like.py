from extensions import db


class Like(db.Model):
    __tablename__ = 'likes'

    id = db.Column(db.Integer, primary_key=True)
    reaction = db.Column(db.String(10), nullable=False) # Emoji
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    quote_id = db.Column(db.Integer, db.ForeignKey('quotes.id'), nullable=False)

    def to_dict(self):
        """Converts like object to a dictionary."""
        return {
            'id': self.id,
            'reaction': self.reaction,
            'user_id': self.user_id
        }