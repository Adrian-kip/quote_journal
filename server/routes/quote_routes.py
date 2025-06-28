from flask import request, jsonify, Blueprint
from flask_jwt_extended import jwt_required, get_jwt_identity
from app import db
from models.user import User
from models.quote import Quote
from models.like import Like
from sqlalchemy import or_

quote_bp = Blueprint('quote_bp', __name__)

# --- Public Route ---
@quote_bp.route('/quotes', methods=['GET'])
def get_all_quotes():
    """
    Gets all quotes from all users, with optional search.
    Publicly accessible.
    """
    search_query = request.args.get('q')
    
    query = Quote.query
    
    if search_query:
        # Case-insensitive search on quote content
        query = query.filter(Quote.content.ilike(f'%{search_query}%'))
        
    # Order by most recent
    quotes = query.order_by(Quote.id.desc()).all()
    
    return jsonify([quote.to_dict() for quote in quotes]), 200

# --- Protected Routes ---

@quote_bp.route('/quotes', methods=['POST'])
@jwt_required()
def create_quote():
    """
    Creates a new quote for the logged-in user.
    """
    data = request.get_json()
    content = data.get('content')
    tags = data.get('tags')

    if not content:
        return jsonify({"msg": "Quote content is required"}), 400

    current_user_id = get_jwt_identity()
    
    new_quote = Quote(
        content=content,
        tags=tags,
        user_id=current_user_id
    )

    db.session.add(new_quote)
    db.session.commit()

    return jsonify(new_quote.to_dict()), 201


@quote_bp.route('/quotes/<int:quote_id>', methods=['PATCH'])
@jwt_required()
def update_quote(quote_id):
    quote = Quote.query.get_or_404(quote_id)
    current_user_id = get_jwt_identity()

    # THE FIX: Convert the string from the token to an integer before comparing
    if quote.user_id != int(current_user_id):
        return jsonify({"msg": "Unauthorized to edit this quote"}), 403

    data = request.get_json()
    quote.content = data.get('content', quote.content)
    quote.tags = data.get('tags', quote.tags)

    db.session.commit()

    return jsonify(quote.to_dict()), 200

@quote_bp.route('/quotes/<int:quote_id>', methods=['GET'])
def get_single_quote(quote_id):
    """
    Gets a single quote by its ID.
    """
    quote = Quote.query.get_or_404(quote_id)
    return jsonify(quote.to_dict()), 200

@quote_bp.route('/quotes/<int:quote_id>', methods=['DELETE'])
@jwt_required()
def delete_quote(quote_id):
    quote = Quote.query.get_or_404(quote_id)
    current_user_id = get_jwt_identity()

    # THE FIX: Convert the string from the token to an integer before comparing
    if quote.user_id != int(current_user_id):
        return jsonify({"msg": "Unauthorized to delete this quote"}), 403

    db.session.delete(quote)
    db.session.commit()

    return jsonify({"msg": "Quote deleted successfully"}), 200


@quote_bp.route('/likes', methods=['POST'])
@jwt_required()
def add_like():
    # ... (keep the existing logic for getting data and user)
    data = request.get_json()
    quote_id = data.get('quote_id')
    reaction = data.get('reaction')
    current_user_id = get_jwt_identity()
    # ...

    # Find the quote we're operating on
    quote = Quote.query.get_or_404(quote_id)

    # Check if the user has already liked this quote
    existing_like = Like.query.filter_by(user_id=current_user_id, quote_id=quote_id).first()

    if existing_like:
        if existing_like.reaction == reaction:
            db.session.delete(existing_like)
        else:
            existing_like.reaction = reaction
    else:
        new_like = Like(user_id=current_user_id, quote_id=quote_id, reaction=reaction)
        db.session.add(new_like)

    db.session.commit()

    # Return the entire updated quote object
    return jsonify(quote.to_dict()), 200