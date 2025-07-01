from extensions import db

quote_collection = db.Table('quote_collection',
    db.Column('quote_id', db.Integer, db.ForeignKey('quotes.id'), primary_key=True),
    db.Column('collection_id', db.Integer, db.ForeignKey('collections.id'), primary_key=True)
)

class Collection(db.Model):
    __tablename__ = 'collections'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)

    quotes = db.relationship('Quote', secondary=quote_collection, lazy='subquery',
        backref=db.backref('collections', lazy=True))

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'user_id': self.user_id,
            'quotes': [quote.to_dict() for quote in self.quotes]
        }

    def to_dict_simple(self):
        return {
            'id': self.id,
            'name': self.name,
            'user_id': self.user_id,
            'quote_count': len(self.quotes)
        }