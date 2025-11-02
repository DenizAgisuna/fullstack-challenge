#!/usr/bin/env python
"""Seed the database with test users and participants."""

from app import create_app
from app.extensions import db
from app.models import User, Participant
from datetime import datetime
import os

app = create_app()

with app.app_context():
    should_seed = os.getenv("SEED_DB", "false").lower() == "true"

    # Check if tables exist and get counts
    try:
        user_count = User.query.count()
        participant_count = Participant.query.count()
        is_empty = user_count == 0 and participant_count == 0
    except Exception as e:
        # Check if it's an OperationalError (table doesn't exist)
        error_type = type(e).__name__
        if error_type == "OperationalError" or "no such table" in str(e).lower():
            # Tables don't exist yet
            user_count = 0
            participant_count = 0
            is_empty = True
        else:
            # Re-raise if it's a different error
            raise

    if not should_seed and not is_empty:
        print("Database already has data. Skipping seed.")
        print(f"Users: {user_count}, Participants: {participant_count}")
        exit(0)

    if should_seed:
        print("SEED_DB=true: Dropping all tables...")
        db.drop_all()
        print("Creating all tables...")
        db.create_all()
    elif is_empty:
        print("Database is empty. Creating tables...")
        db.create_all()

    print("Creating test users...")
    test_users = [
        {"email": "admin@trial.com", "password": "admin123", "full_name": "Admin User"},
        {
            "email": "researcher@trial.com",
            "password": "research123",
            "full_name": "Researcher Smith",
        },
    ]

    for user_data in test_users:
        existing_user = User.query.filter_by(email=user_data["email"]).first()
        if existing_user:
            print(f"  User {user_data['email']} already exists, skipping...")
            continue

        user = User(email=user_data["email"], full_name=user_data["full_name"])
        user.set_password(user_data["password"])
        db.session.add(user)

    print("Creating test participants...")
    test_participants = [
        {
            "subject_id": "P001",
            "study_group": "treatment",
            "enrollment_date": "2024-01-15",
            "status": "active",
            "age": 45,
            "gender": "M",
        },
        {
            "subject_id": "P002",
            "study_group": "treatment",
            "enrollment_date": "2024-01-20",
            "status": "active",
            "age": 32,
            "gender": "F",
        },
        {
            "subject_id": "P003",
            "study_group": "control",
            "enrollment_date": "2024-02-01",
            "status": "completed",
            "age": 58,
            "gender": "M",
        },
        {
            "subject_id": "P004",
            "study_group": "control",
            "enrollment_date": "2024-02-10",
            "status": "active",
            "age": 29,
            "gender": "F",
        },
        {
            "subject_id": "P005",
            "study_group": "treatment",
            "enrollment_date": "2024-03-05",
            "status": "withdrawn",
            "age": 41,
            "gender": "Other",
        },
    ]

    for participant_data in test_participants:
        existing_participant = Participant.query.filter_by(
            subject_id=participant_data["subject_id"]
        ).first()
        if existing_participant:
            print(
                f"  Participant {participant_data['subject_id']} already exists, skipping..."
            )
            continue

        enrollment_date = datetime.strptime(
            participant_data["enrollment_date"], "%Y-%m-%d"
        ).date()
        participant = Participant(
            subject_id=participant_data["subject_id"],
            study_group=participant_data["study_group"],
            enrollment_date=enrollment_date,
            status=participant_data["status"],
            age=participant_data["age"],
            gender=participant_data["gender"],
        )
        db.session.add(participant)

    db.session.commit()
    print("✓ Database seeded successfully!")
    print("\nTest users created:")
    print("  - admin@trial.com / admin123")
    print("  - researcher@trial.com / research123")
    print(f"\n✓ {len(test_participants)} participants created")
