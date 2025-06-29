from flask import request, jsonify, Blueprint
from flask_jwt_extended import create_access_token
from extensions import db
from models.user import User
from sqlalchemy.exc import SQLAlchemyError, IntegrityError
import re
import logging

auth_bp = Blueprint('auth_bp', __name__)

# Email validation regex
EMAIL_REGEX = re.compile(r'^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$')

@auth_bp.route('/signup', methods=['POST'])
def signup():
    """
    Register a new user account
    ---
    tags:
      - Authentication
    parameters:
      - in: body
        name: body
        required: true
        schema:
          type: object
          required:
            - username
            - email
            - password
          properties:
            username:
              type: string
              minLength: 3
              maxLength: 80
            email:
              type: string
              format: email
            password:
              type: string
              minLength: 8
    responses:
      201:
        description: User created successfully
      400:
        description: Invalid input data
      409:
        description: Username or email already exists
      500:
        description: Internal server error
    """
    if not request.is_json:
        return jsonify({"msg": "Missing JSON in request"}), 400

    data = request.get_json()
    required_fields = ['username', 'email', 'password']
    if not all(field in data for field in required_fields):
        return jsonify({"msg": "Missing required fields"}), 400

    try:
        username = data['username'].strip()
        email = data['email'].strip().lower()
        password = data['password']

        # Input validation
        if len(username) < 3 or len(username) > 80:
            return jsonify({"msg": "Username must be between 3-80 characters"}), 400
        if not username.isalnum():
            return jsonify({"msg": "Username can only contain letters and numbers"}), 400
        if len(email) > 120:
            return jsonify({"msg": "Email too long"}), 400
        if not EMAIL_REGEX.match(email):
            return jsonify({"msg": "Invalid email format"}), 400
        if len(password) < 8:
            return jsonify({"msg": "Password must be at least 8 characters"}), 400

        new_user = User(username=username, email=email)
        new_user.set_password(password)

        db.session.add(new_user)
        db.session.commit()

        # Create access token
        access_token = create_access_token(
            identity=new_user.id,
            additional_claims={"username": new_user.username}
        )

        logging.info(f"New user created: {username} ({email})")
        return jsonify({
            "msg": "User created successfully",
            "user": new_user.to_dict(),
            "access_token": access_token
        }), 201

    except ValueError as e:
        db.session.rollback()
        logging.warning(f"Validation error during signup: {str(e)}")
        return jsonify({"msg": str(e)}), 400
    except IntegrityError as e:
        db.session.rollback()
        logging.warning(f"Integrity error during signup: {str(e)}")
        return jsonify({"msg": "Username or email already exists"}), 409
    except SQLAlchemyError as e:
        db.session.rollback()
        logging.error(f"Database error during signup: {str(e)}")
        return jsonify({"msg": "Database error occurred"}), 500
    except Exception as e:
        db.session.rollback()
        logging.error(f"Unexpected error during signup: {str(e)}")
        return jsonify({"msg": "Internal server error"}), 500

@auth_bp.route('/login', methods=['POST'])
def login():
    """
    Authenticate user and return access token
    ---
    tags:
      - Authentication
    parameters:
      - in: body
        name: body
        required: true
        schema:
          type: object
          required:
            - email
            - password
          properties:
            email:
              type: string
              format: email
            password:
              type: string
    responses:
      200:
        description: Successful authentication
      400:
        description: Invalid input data
      401:
        description: Invalid credentials
      500:
        description: Internal server error
    """
    if not request.is_json:
        return jsonify({"msg": "Missing JSON in request"}), 400

    data = request.get_json()
    required_fields = ['email', 'password']
    if not all(field in data for field in required_fields):
        return jsonify({"msg": "Missing required fields"}), 400

    try:
        email = data['email'].strip().lower()
        password = data['password']

        # Input validation
        if not email or not password:
            return jsonify({"msg": "Email and password are required"}), 400
        if len(email) > 120:
            return jsonify({"msg": "Email too long"}), 400
        if not EMAIL_REGEX.match(email):
            return jsonify({"msg": "Invalid email format"}), 400

        user = User.query.filter_by(email=email).first()

        if user and user.check_password(password):
            # Create access token with additional claims
            access_token = create_access_token(
                identity=user.id,
                additional_claims={"username": user.username}
            )
            
            logging.info(f"User logged in: {user.username} ({email})")
            return jsonify({
                "msg": "Login successful",
                "access_token": access_token,
                "user": user.to_dict()
            }), 200

        logging.warning(f"Failed login attempt for email: {email}")
        return jsonify({"msg": "Invalid email or password"}), 401

    except ValueError as e:
        logging.warning(f"Validation error during login: {str(e)}")
        return jsonify({"msg": str(e)}), 400
    except SQLAlchemyError as e:
        logging.error(f"Database error during login: {str(e)}")
        return jsonify({"msg": "Database error occurred"}), 500
    except Exception as e:
        logging.error(f"Unexpected error during login: {str(e)}")
        return jsonify({"msg": "Internal server error"}), 500