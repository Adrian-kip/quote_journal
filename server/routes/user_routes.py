from flask import jsonify, Blueprint
from flask_jwt_extended import jwt_required, get_jwt_identity
from extensions import db
from models.user import User

user_bp = Blueprint('user_bp', __name__)

@user_bp.route('/users/<int:user_id>/follow', methods=['POST'])
@jwt_required()
def follow_user(user_id):
    current_user_id = int(get_jwt_identity())

   
    if current_user_id == user_id:
        return jsonify({"msg": "You cannot follow yourself"}), 400

    current_user = User.query.get(current_user_id)
    user_to_follow = User.query.get(user_id)

    if not user_to_follow:
        return jsonify({"msg": "User not found"}), 404

    if current_user.is_following(user_to_follow):
        return jsonify({"msg": f"You are already following {user_to_follow.username}"}), 400

    current_user.follow(user_to_follow)
    db.session.commit()

    return jsonify({"msg": f"You are now following {user_to_follow.username}"}), 200

@user_bp.route('/users/<int:user_id>/unfollow', methods=['POST'])
@jwt_required()
def unfollow_user(user_id):
    current_user_id = int(get_jwt_identity())

    current_user = User.query.get(current_user_id)
    user_to_unfollow = User.query.get(user_id)

    if not user_to_unfollow:
        return jsonify({"msg": "User not found"}), 404

    if not current_user.is_following(user_to_unfollow):
        return jsonify({"msg": f"You are not following {user_to_unfollow.username}"}), 400

    current_user.unfollow(user_to_unfollow)
    db.session.commit()

    return jsonify({"msg": f"You have unfollowed {user_to_unfollow.username}"}), 200

@user_bp.route('/users/<int:user_id>', methods=['GET'])
@jwt_required(optional=True) 
def get_user_profile(user_id):
    profile_user = User.query.get_or_404(user_id)
    public_data = profile_user.to_public_dict()

    current_user_id_str = get_jwt_identity()
    if current_user_id_str:
        current_user = User.query.get(int(current_user_id_str))
        public_data['is_following'] = current_user.is_following(profile_user)
    else:
        public_data['is_following'] = False

    return jsonify(public_data), 200