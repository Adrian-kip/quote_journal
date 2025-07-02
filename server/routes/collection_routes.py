from flask import request, jsonify, Blueprint
from flask_jwt_extended import jwt_required, get_jwt_identity
from extensions import db
from models.collection import Collection
from models.quote import Quote
from models.user import User

collection_bp = Blueprint('collection_bp', __name__)

@collection_bp.route('/collections', methods=['GET'])
@jwt_required()
def get_user_collections():
    current_user_id = int(get_jwt_identity())
    collections = Collection.query.filter_by(user_id=current_user_id).all()
    return jsonify([collection.to_dict_simple() for collection in collections]), 200

@collection_bp.route('/collections', methods=['POST'])
@jwt_required()
def create_collection():
    data = request.get_json()
    name = data.get('name')
    if not name:
        return jsonify({"msg": "Collection name is required"}), 400
    current_user_id = int(get_jwt_identity())
    new_collection = Collection(name=name, user_id=current_user_id)
    db.session.add(new_collection)
    db.session.commit()
    return jsonify(new_collection.to_dict_simple()), 201

@collection_bp.route('/collections/<int:collection_id>', methods=['GET'])
@jwt_required()
def get_single_collection(collection_id):
    current_user_id = int(get_jwt_identity())
    collection = Collection.query.get(collection_id)
    if not collection:
        return jsonify({"msg": "Collection not found"}), 404
    if collection.user_id != current_user_id:
        return jsonify({"msg": "Unauthorized"}), 403
    return jsonify(collection.to_dict()), 200

@collection_bp.route('/collections/<int:collection_id>', methods=['DELETE'])
@jwt_required()
def delete_collection(collection_id):
    current_user_id = int(get_jwt_identity())
    collection = Collection.query.get(collection_id)
    if not collection:
        return jsonify({"msg": "Collection not found"}), 404
    if collection.user_id != current_user_id:
        return jsonify({"msg": "Unauthorized"}), 403
    db.session.delete(collection)
    db.session.commit()
    return jsonify({"msg": "Collection deleted successfully"}), 200

@collection_bp.route('/collections/add-quote', methods=['POST'])
@jwt_required()
def add_quote_to_collection():
    data = request.get_json()
    quote_id = data.get('quote_id')
    collection_id = data.get('collection_id')

    if not quote_id or not collection_id:
        return jsonify({"msg": "quote_id and collection_id are required"}), 400
    
    current_user_id = int(get_jwt_identity())
    quote = Quote.query.get(quote_id)
    collection = Collection.query.get(collection_id)

    if not quote or not collection:
        return jsonify({"msg": "Quote or Collection not found"}), 404

    if collection.user_id != current_user_id:
        return jsonify({"msg": "Unauthorized"}), 403
    
    
    if quote in collection.quotes:
        return jsonify({"msg": "This quote is already in that collection"}), 409 # 409 Conflict
    
    
    collection.quotes.append(quote)
    db.session.commit()

    return jsonify({"msg": f"Quote added to collection '{collection.name}'"}), 200