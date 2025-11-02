from http import HTTPStatus
from datetime import datetime, date
import logging

from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity

from .extensions import db
from .models import Participant, User
from .schemas import ParticipantCreate, ParticipantResponse

participants_bp = Blueprint("participants", __name__)

logger = logging.getLogger('app.participant_routes')


@participants_bp.get("")
@jwt_required()
def list_participants():
    logger.info("Listing all participants")
    participants = Participant.query.all()
    logger.info(f"Found {len(participants)} participants")
    return (
        jsonify(
            [ParticipantResponse.model_validate(p).model_dump() for p in participants]
        ),
        HTTPStatus.OK,
    )


@participants_bp.post("")
@jwt_required()
def create_participant():
    payload = request.get_json() or {}
    user_id = get_jwt_identity()
    logger.info(f"User {user_id} attempting to create participant with subject_id: {payload.get('subject_id', 'unknown')}")

    try:
        data = ParticipantCreate.model_validate(payload)
    except Exception as exc:
        logger.warning(f"Participant creation validation error: {str(exc)}")
        return jsonify({"error": str(exc)}), HTTPStatus.BAD_REQUEST

    if Participant.query.filter_by(subject_id=data.subject_id).first():
        logger.warning(f"Participant creation failed: Subject ID '{data.subject_id}' already exists")
        return jsonify({"error": "Subject ID already exists"}), HTTPStatus.CONFLICT

    participant = Participant(**data.model_dump(exclude={"participant_id"}))
    if data.participant_id:
        participant.participant_id = data.participant_id

    logger.info(f"Creating participant: {participant.subject_id} (age: {participant.age}, group: {participant.study_group})")
    db.session.add(participant)
    db.session.commit()
    logger.info(f"Participant created successfully: ID {participant.id}, subject_id: {participant.subject_id}")

    return (
        jsonify(ParticipantResponse.model_validate(participant).model_dump()),
        HTTPStatus.CREATED,
    )


@participants_bp.get("/<int:participant_id>")
@jwt_required()
def get_participant(participant_id):
    user_id = get_jwt_identity()
    logger.info(f"User {user_id} requesting participant ID {participant_id}")
    participant = Participant.query.get_or_404(participant_id)
    logger.info(f"Participant {participant_id} retrieved: {participant.subject_id}")
    return (
        jsonify(ParticipantResponse.model_validate(participant).model_dump()),
        HTTPStatus.OK,
    )


@participants_bp.put("/<int:participant_id>")
@jwt_required()
def update_participant(participant_id):
    participant = Participant.query.get_or_404(participant_id)
    payload = request.get_json() or {}
    user_id = get_jwt_identity()
    logger.info(f"User {user_id} attempting to update participant ID {participant_id}")

    try:
        data = ParticipantCreate.model_validate(payload)
    except Exception as exc:
        logger.warning(f"Participant update validation error for ID {participant_id}: {str(exc)}")
        return jsonify({"error": str(exc)}), HTTPStatus.BAD_REQUEST

    # Check for duplicate subject_id if changed
    if data.subject_id != participant.subject_id:
        if Participant.query.filter_by(subject_id=data.subject_id).first():
            logger.warning(f"Participant update failed: Subject ID '{data.subject_id}' already exists")
            return jsonify({"error": "Subject ID already exists"}), HTTPStatus.CONFLICT

    logger.info(f"Updating participant ID {participant_id}: subject_id={data.subject_id}, status={data.status}, age={data.age}")
    for key, value in data.model_dump(exclude={"participant_id"}).items():
        setattr(participant, key, value)

    db.session.commit()
    logger.info(f"Participant {participant_id} updated successfully")

    return (
        jsonify(ParticipantResponse.model_validate(participant).model_dump()),
        HTTPStatus.OK,
    )


@participants_bp.delete("/<int:participant_id>")
@jwt_required()
def delete_participant(participant_id):
    participant = Participant.query.get_or_404(participant_id)
    user_id = get_jwt_identity()
    subject_id = participant.subject_id
    logger.info(f"User {user_id} attempting to delete participant ID {participant_id} (subject_id: {subject_id})")
    
    db.session.delete(participant)
    db.session.commit()
    logger.info(f"Participant {participant_id} ({subject_id}) deleted successfully")

    return jsonify({"message": "Participant deleted"}), HTTPStatus.OK


@participants_bp.get("/metrics/summary")
@jwt_required()
def get_metrics():
    logger.info("Retrieving participant metrics")
    total = Participant.query.count()
    active = Participant.query.filter_by(status="active").count()
    completed = Participant.query.filter_by(status="completed").count()
    withdrawn = Participant.query.filter_by(status="withdrawn").count()
    treatment = Participant.query.filter_by(study_group="treatment").count()
    control = Participant.query.filter_by(study_group="control").count()
    logger.info(f"Metrics retrieved: total={total}, active={active}, completed={completed}, withdrawn={withdrawn}")

    return (
        jsonify(
            {
                "total": total,
                "by_status": {
                    "active": active,
                    "completed": completed,
                    "withdrawn": withdrawn,
                },
                "by_group": {"treatment": treatment, "control": control},
            }
        ),
        HTTPStatus.OK,
    )
