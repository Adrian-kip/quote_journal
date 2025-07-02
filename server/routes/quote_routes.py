from flask import request, jsonify, Blueprint
from flask_jwt_extended import jwt_required, get_jwt_identity
from sqlalchemy import func 
from extensions import db
from models.user import User
from models.quote import Quote
from models.like import Like

quote_bp = Blueprint('quote_bp', __name__)

@quote_bp.route('/quotes', methods=['GET'])
def get_all_quotes():
    page = request.args.get('page', 1, type=int)
    per_page = 15
    query = Quote.query
    search_query = request.args.get('q')
    if search_query:
        query = query.filter(Quote.content.ilike(f'%{search_query}%'))
    paginated_quotes = query.order_by(Quote.id.desc()).paginate(page=page, per_page=per_page, error_out=False)
    return jsonify({
        'quotes': [quote.to_dict() for quote in paginated_quotes.items],
        'has_next': paginated_quotes.has_next,
        'page': paginated_quotes.page,
        'total_pages': paginated_quotes.pages
    }), 200


@quote_bp.route('/quotes/trending', methods=['GET'])
def get_trending_quotes():
    """
    Returns quotes sorted by the number of likes in descending order.
    """
    page = request.args.get('page', 1, type=int)
    per_page = 15

    
    paginated_quotes = Quote.query.outerjoin(Like).group_by(Quote.id).order_by(func.count(Like.id).desc()).paginate(
        page=page, per_page=per_page, error_out=False
    )

    return jsonify({
        'quotes': [quote.to_dict() for quote in paginated_quotes.items],
        'has_next': paginated_quotes.has_next,
        'page': paginated_quotes.page,
        'total_pages': paginated_quotes.pages
    }), 200


@quote_bp.route('/quotes/feed', methods=['GET'])
@jwt_required()
def get_followed_quotes_feed():
    page = request.args.get('page', 1, type=int)
    per_page = 15
    current_user_id = int(get_jwt_identity())
    current_user = User.query.get(current_user_id)
    followed_user_ids = [user.id for user in current_user.followed]
    followed_user_ids.append(current_user_id)
    paginated_quotes = Quote.query.filter(
        Quote.user_id.in_(followed_user_ids)
    ).order_by(Quote.id.desc()).paginate(page=page, per_page=per_page, error_out=False)
    return jsonify({
        'quotes': [quote.to_dict() for quote in paginated_quotes.items],
        'has_next': paginated_quotes.has_next,
        'page': paginated_quotes.page,
        'total_pages': paginated_quotes.pages
    }), 200


@quote_bp.route('/tags/<string:tag_name>', methods=['GET'])
def get_quotes_by_tag(tag_name):
    page = request.args.get('page', 1, type=int)
    per_page = 15
    search_term = f"%#{tag_name}%"
    paginated_quotes = Quote.query.filter(Quote.tags.ilike(search_term)).order_by(Quote.id.desc()).paginate(page=page, per_page=per_page, error_out=False)
    return jsonify({
        'quotes': [quote.to_dict() for quote in paginated_quotes.items],
        'has_next': paginated_quotes.has_next,
        'page': paginated_quotes.page,
        'total_pages': paginated_quotes.pages
    }), 200


@quote_bp.route('/quotes/<int:quote_id>', methods=['GET'])
def get_single_quote(quote_id):
    quote = Quote.query.get_or_404(quote_id)
    return jsonify(quote.to_dict()), 200


@quote_bp.route('/quotes', methods=['POST'])
@jwt_required()
def create_quote():
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


@quote_bp.route('/quotes/<int:quote_id>', methods=['PATCH'])
@jwt_required()
def update_quote(quote_id):
    quote = Quote.query.get_or_404(quote_id)
    current_user_id = int(get_jwt_identity())
    if quote.user_id != current_user_id:
        return jsonify({"msg": "Unauthorized to edit this quote"}), 403
    data = request.get_json()
    quote.content = data.get('content', quote.content)
    quote.tags = data.get('tags', quote.tags)
    db.session.commit()
    return jsonify(quote.to_dict()), 200


@quote_bp.route('/quotes/<int:quote_id>', methods=['DELETE'])
@jwt_required()
def delete_quote(quote_id):
    quote = Quote.query.get_or_404(quote_id)
    current_user_id = int(get_jwt_identity())
    if quote.user_id != current_user_id:
        return jsonify({"msg": "Unauthorized to delete this quote"}), 403
    db.session.delete(quote)
    db.session.commit()
    return jsonify({"msg": "Quote deleted successfully"}), 200

@quote_bp.route('/likes', methods=['POST'])
@jwt_required()
def add_like():
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