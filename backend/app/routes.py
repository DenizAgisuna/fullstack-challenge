from flask import Blueprint, jsonify

api_bp = Blueprint("api", __name__)


@api_bp.get("/health")
def health_check():
    return jsonify({"status": "ok"}), 200


# Import and register sub-blueprints
from .auth_routes import auth_bp
from .participant_routes import participants_bp

api_bp.register_blueprint(auth_bp, url_prefix="/auth")
api_bp.register_blueprint(participants_bp, url_prefix="/participants")
