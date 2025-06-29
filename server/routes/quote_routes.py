from flask import request, jsonify, Blueprint
from flask_jwt_extended import jwt_required, get_jwt_identity
from extensions import db
from models.quote import Quote
from models.like import Like

quote_bp = Blueprint('quote_bp', __name__)

# GET all quotes, with optional search
@quote_bp.route('/quotes', methods=['GET'])
def get_all_quotes():
    try:
        search_query = request.args.get('q')
        query = Quote.query
        if search_query:
            query = query.filter(Quote.content.ilike(f'%{search_query}%'))
        quotes = query.order_by(Quote.id.desc()).all()
        return jsonify([quote.to_dict() for quote in quotes]), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# GET a single quote by ID
@quote_bp.route('/quotes/<int:quote_id>', methods=['GET'])
def get_single_quote(quote_id):
    try:
        quote = Quote.query.get_or_404(quote_id)
        return jsonify(quote.to_dict()), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# POST a new quote (auth required)
@quote_bp.route('/quotes', methods=['POST'])
@jwt_required()
def create_quote():
    try:
        data = request.get_json()
        content = data.get('content')
        tags = data.get('tags')
        if not content:
            return jsonify({"msg": "Quote content is required"}), 400

        current_user_id = int(get_jwt_identity())
        new_quote = Quote(content=content, tags=tags, user_id=current_user_id)
        db.session.add(new_quote)
        db.session.commit()
        return jsonify(new_quote.to_dict()), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

# PATCH update a quote (auth required)
@quote_bp.route('/quotes/<int:quote_id>', methods=['PATCH'])
@jwt_required()
def update_quote(quote_id):
    try:
        quote = Quote.query.get_or_404(quote_id)
        current_user_id = int(get_jwt_identity())
        if quote.user_id != current_user_id:
            return jsonify({"msg": "Unauthorized to edit this quote"}), 403

        data = request.get_json()
        quote.content = data.get('content', quote.content)
        quote.tags = data.get('tags', quote.tags)
        db.session.commit()
        return jsonify(quote.to_dict()), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

# DELETE a quote (auth required)
@quote_bp.route('/quotes/<int:quote_id>', methods=['DELETE'])
@jwt_required()
def delete_quote(quote_id):
    try:
        quote = Quote.query.get_or_404(quote_id)
        current_user_id = int(get_jwt_identity())
        if quote.user_id != current_user_id:
            return jsonify({"msg": "Unauthorized to delete this quote"}), 403

        db.session.delete(quote)
        db.session.commit()
        return jsonify({"msg": "Quote deleted successfully"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

# POST or update a like reaction (auth required)
@quote_bp.route('/likes', methods=['POST'])
@jwt_required()
def add_like():
    try:
        data = request.get_json()
        quote_id = data.get('quote_id')
        reaction = data.get('reaction')

        if not quote_id or not reaction:
            return jsonify({"msg": "Quote ID and reaction are required"}), 400

        current_user_id = int(get_jwt_identity())
        quote = Quote.query.get_or_404(quote_id)

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
        return jsonify(quote.to_dict()), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500
