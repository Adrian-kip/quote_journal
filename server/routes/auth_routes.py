from flask import request, jsonify, Blueprint
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity

from extensions import db
from models.user import User

auth_bp = Blueprint('auth_bp', __name__)

@auth_bp.route('/signup', methods=['POST'])
def signup():
    """
    Handles new user registration.
    """
    data = request.get_json()
    username = data.get('username')
    email = data.get('email')
    password = data.get('password')

    # Basic validation
    if not username or not email or not password:
        return jsonify({"msg": "Username, email, and password are required"}), 400

    # Check if user already exists
    if User.query.filter_by(username=username).first() or User.query.filter_by(email=email).first():
        return jsonify({"msg": "Username or email already exists"}), 409

    # Create new user and hash the password
    new_user = User(username=username, email=email)
    new_user.set_password(password)

    # Add to database
    db.session.add(new_user)
    db.session.commit()

    return jsonify({"msg": "User created successfully"}), 201

@auth_bp.route('/login', methods=['POST'])
def login():
    """
    Handles user login and returns a JWT token.
    """
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')

    if not email or not password:
        return jsonify({"msg": "Email and password are required"}), 400

    # Find user by email
    user = User.query.filter_by(email=email).first()

    # Check if user exists and password is correct
    if user and user.check_password(password):
        # Create a new token with the user's id as the identity
        access_token = create_access_token(identity=str(user.id))
        return jsonify(access_token=access_token, user=user.to_dict()), 200

    return jsonify({"msg": "Invalid email or password"}), 401

@auth_bp.route('/validate', methods=['GET'])
@jwt_required()
def validate_token():
    """
    Validates the JWT token and returns the user's data.
    """
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    if user:
        return jsonify(user.to_dict()), 200
    return jsonify({"msg": "User not found"}), 404