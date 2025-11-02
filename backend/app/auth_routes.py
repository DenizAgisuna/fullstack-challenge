from http import HTTPStatus
import logging
from flask import Blueprint, jsonify, request
from flask_jwt_extended import create_access_token

from .extensions import db
from .models import User
from .schemas import UserCreate, UserResponse, TokenResponse

auth_bp = Blueprint('auth', __name__)

logger = logging.getLogger('app.auth_routes')


@auth_bp.post('/register')
def register():
    payload = request.get_json() or {}
    
    try:
        data = UserCreate.model_validate(payload)
    except Exception as exc:
        logger.warning(f"Registration validation error: {str(exc)}")
        return jsonify({'error': str(exc)}), HTTPStatus.BAD_REQUEST
    
    if User.query.filter_by(email=data.email).first():
        logger.warning(f"Email already registered: {data.email}")
        return jsonify({'error': 'Registration validation error:'}), HTTPStatus.CONFLICT
    
    user = User(email=data.email, full_name=data.full_name)
    user.set_password(data.password)
    
    logger.info(f"Creating user: {user.email}")
    db.session.add(user)
    db.session.commit()
    logger.info(f"User created: {user.email}")
    
    token = create_access_token(identity=str(user.id))
    logger.info(f"Token created: {token}")
    response = TokenResponse(
        access_token=token,
        user=UserResponse.model_validate(user)
    )
    logger.info(f"Response: {response.model_dump()}")
    return jsonify(response.model_dump()), HTTPStatus.CREATED


@auth_bp.post('/login')
def login():
    payload = request.get_json() or {}
    logger.info(f"Login attempt for email: {payload.get('email', 'unknown')}")
    
    try:
        data = UserCreate.model_validate(payload)
    except Exception as exc:
        logger.warning(f"Login validation error: {str(exc)}")
        return jsonify({'error': f"Login validation error: {str(exc)}"}), HTTPStatus.BAD_REQUEST
    
    user = User.query.filter_by(email=data.email).first()
    if not user or not user.check_password(data.password):
        logger.warning(f"Failed login attempt for email: {data.email}")
        return jsonify({'error': 'Invalid credentials'}), HTTPStatus.UNAUTHORIZED
    
    logger.info(f"Successful login for user: {user.email}")

    token = create_access_token(identity=str(user.id))
    logger.info(f"Token created: {token}")
    response = TokenResponse(
        access_token=token,
        user=UserResponse.model_validate(user)
    )
    logger.info(f"Response: {response.model_dump()}")
    return jsonify(response.model_dump()), HTTPStatus.OK

