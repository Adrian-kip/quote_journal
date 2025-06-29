# server/routes/auth_routes.py

from flask import request, jsonify, Blueprint
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from extensions import db
from models.user import User

auth_bp = Blueprint('auth_bp', __name__)

# POST /signup
@auth_bp.route('/signup', methods=['POST'])
def signup():
    try:
        data = request.get_json()
        username = data.get('username')
        email = data.get('email', '').strip().lower()
        password = data.get('password')

        if not username or not email or not password:
            return jsonify({"msg": "Username, email, and password are required"}), 400

        if User.query.filter((User.username == username) | (User.email == email)).first():
            return jsonify({"msg": "Username or email already exists"}), 409

        new_user = User(username=username, email=email)
        new_user.set_password(password)

        db.session.add(new_user)
        db.session.commit()

        return jsonify({"msg": "User created successfully"}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

# POST /login
@auth_bp.route('/login', methods=['POST'])
def login():
    try:
        data = request.get_json()
        email = data.get('email', '').strip().lower()
        password = data.get('password')

        if not email or not password:
            return jsonify({"msg": "Email and password are required"}), 400

        user = User.query.filter_by(email=email).first()

        if user and user.check_password(password):
            access_token = create_access_token(identity=user.id)
            return jsonify(access_token=access_token, user=user.to_dict()), 200

        return jsonify({"msg": "Invalid email or password"}), 401
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# GET /validate
@auth_bp.route('/validate', methods=['GET'])
@jwt_required()
def validate_token():
    try:
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)
        if user:
            return jsonify(user.to_dict()), 200
        return jsonify({"msg": "User not found"}), 404
    except Exception as e:
        return jsonify({"error": str(e)}), 500
