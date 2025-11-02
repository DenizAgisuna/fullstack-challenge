# API Documentation

Complete API reference for the Clinical Trial Data Dashboard backend.

**Base URL**: `http://localhost:5000/api`

All participant endpoints require authentication via JWT token in the Authorization header:
```http
Authorization: Bearer <your_token>
```

---

## Authentication Endpoints

### Register User

Register a new user account.

**Endpoint**: `POST /api/auth/register`

**Request Body**:
```json
{
  "email": "user@example.com",
  "password": "password123",
  "full_name": "John Doe"
}
```

**Response**: `201 Created`
```json
{
  "access_token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "token_type": "bearer",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "full_name": "John Doe"
  }
}
```

**Error Responses**:
- `400 Bad Request`: Validation error (invalid email format, missing fields)
- `409 Conflict`: Email already registered

---

### Login

Authenticate and receive JWT token.

**Endpoint**: `POST /api/auth/login`

**Request Body**:
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response**: `200 OK`
```json
{
  "access_token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "token_type": "bearer",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "full_name": "John Doe"
  }
}
```

**Error Responses**:
- `400 Bad Request`: Validation error
- `401 Unauthorized`: Invalid credentials

---

## Participant Endpoints

All participant endpoints require authentication.

### List All Participants

Retrieve a list of all participants.

**Endpoint**: `GET /api/participants`

**Headers**:
```http
Authorization: Bearer <token>
```

**Response**: `200 OK`
```json
[
  {
    "id": 1,
    "participant_id": "550e8400-e29b-41d4-a716-446655440000",
    "subject_id": "P001",
    "study_group": "treatment",
    "enrollment_date": "2024-01-15",
    "status": "active",
    "age": 45,
    "gender": "F",
    "created_at": "2024-01-15T10:00:00",
    "updated_at": "2024-01-15T10:00:00"
  },
  {
    "id": 2,
    "participant_id": "550e8400-e29b-41d4-a716-446655440001",
    "subject_id": "P002",
    "study_group": "control",
    "enrollment_date": "2024-01-20",
    "status": "completed",
    "age": 38,
    "gender": "M",
    "created_at": "2024-01-20T10:00:00",
    "updated_at": "2024-01-25T14:30:00"
  }
]
```

**Error Responses**:
- `401 Unauthorized`: Missing or invalid token

---

### Get Single Participant

Retrieve details for a specific participant by ID.

**Endpoint**: `GET /api/participants/<id>`

**Parameters**:
- `id` (path, integer): Participant database ID

**Headers**:
```http
Authorization: Bearer <token>
```

**Response**: `200 OK`
```json
{
  "id": 1,
  "participant_id": "550e8400-e29b-41d4-a716-446655440000",
  "subject_id": "P001",
  "study_group": "treatment",
  "enrollment_date": "2024-01-15",
  "status": "active",
  "age": 45,
  "gender": "F",
  "created_at": "2024-01-15T10:00:00",
  "updated_at": "2024-01-15T10:00:00"
}
```

**Error Responses**:
- `401 Unauthorized`: Missing or invalid token
- `404 Not Found`: Participant not found

---

### Create Participant

Create a new participant.

**Endpoint**: `POST /api/participants`

**Headers**:
```http
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body**:
```json
{
  "subject_id": "P001",
  "study_group": "treatment",
  "enrollment_date": "2024-01-15",
  "status": "active",
  "age": 45,
  "gender": "F"
}
```

**Field Descriptions**:
- `subject_id` (string, required): Unique identifier for the participant (e.g., "P001")
- `study_group` (string, required): Must be either `"treatment"` or `"control"`
- `enrollment_date` (string, required): Date in `YYYY-MM-DD` format
- `status` (string, optional): Must be `"active"`, `"completed"`, or `"withdrawn"`. Defaults to `"active"`
- `age` (integer, required): Participant age, must be between 0 and 150
- `gender` (string, required): Must be `"M"`, `"F"`, or `"Other"`

**Response**: `201 Created`
```json
{
  "id": 1,
  "participant_id": "550e8400-e29b-41d4-a716-446655440000",
  "subject_id": "P001",
  "study_group": "treatment",
  "enrollment_date": "2024-01-15",
  "status": "active",
  "age": 45,
  "gender": "F",
  "created_at": "2024-01-15T10:00:00",
  "updated_at": "2024-01-15T10:00:00"
}
```

**Error Responses**:
- `400 Bad Request`: Validation error (invalid date format, age out of range, invalid enum values)
- `401 Unauthorized`: Missing or invalid token
- `409 Conflict`: Subject ID already exists

**Example Validation Errors**:
```json
{
  "error": "1 validation error for ParticipantCreate\nenrollment_date\n  Input should be a valid date or datetime, invalid character in year [type=date_from_datetime_parsing, input_value='Mon, 15 Jan 2024 00:00:00 GM', input_type=str]"
}
```

---

### Update Participant

Update an existing participant.

**Endpoint**: `PUT /api/participants/<id>`

**Parameters**:
- `id` (path, integer): Participant database ID

**Headers**:
```http
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body**:
```json
{
  "subject_id": "P001",
  "study_group": "treatment",
  "enrollment_date": "2024-01-15",
  "status": "completed",
  "age": 45,
  "gender": "F"
}
```

**Field Descriptions**: Same as Create Participant endpoint.

**Response**: `200 OK`
```json
{
  "id": 1,
  "participant_id": "550e8400-e29b-41d4-a716-446655440000",
  "subject_id": "P001",
  "study_group": "treatment",
  "enrollment_date": "2024-01-15",
  "status": "completed",
  "age": 45,
  "gender": "F",
  "created_at": "2024-01-15T10:00:00",
  "updated_at": "2024-01-20T14:30:00"
}
```

**Error Responses**:
- `400 Bad Request`: Validation error
- `401 Unauthorized`: Missing or invalid token
- `404 Not Found`: Participant not found
- `409 Conflict`: New subject_id already exists (if subject_id was changed)

---

### Delete Participant

Delete a participant.

**Endpoint**: `DELETE /api/participants/<id>`

**Parameters**:
- `id` (path, integer): Participant database ID

**Headers**:
```http
Authorization: Bearer <token>
```

**Response**: `200 OK`
```json
{
  "message": "Participant deleted"
}
```

**Error Responses**:
- `401 Unauthorized`: Missing or invalid token
- `404 Not Found`: Participant not found

---

### Get Participant Metrics

Retrieve aggregated statistics about participants.

**Endpoint**: `GET /api/participants/metrics/summary`

**Headers**:
```http
Authorization: Bearer <token>
```

**Response**: `200 OK`
```json
{
  "total": 10,
  "by_status": {
    "active": 7,
    "completed": 2,
    "withdrawn": 1
  },
  "by_group": {
    "treatment": 5,
    "control": 5
  }
}
```

**Response Fields**:
- `total` (integer): Total number of participants
- `by_status` (object): Count of participants by status
  - `active` (integer): Number of active participants
  - `completed` (integer): Number of completed participants
  - `withdrawn` (integer): Number of withdrawn participants
- `by_group` (object): Count of participants by study group
  - `treatment` (integer): Number in treatment group
  - `control` (integer): Number in control group

**Error Responses**:
- `401 Unauthorized`: Missing or invalid token

---

## System Endpoints

### Health Check

Check if the API is running.

**Endpoint**: `GET /api/health`

**Response**: `200 OK`
```json
{
  "status": "ok"
}
```

No authentication required.

---

## Data Models

### Participant Object

```json
{
  "id": 1,
  "participant_id": "550e8400-e29b-41d4-a716-446655440000",
  "subject_id": "P001",
  "study_group": "treatment",
  "enrollment_date": "2024-01-15",
  "status": "active",
  "age": 45,
  "gender": "F",
  "created_at": "2024-01-15T10:00:00",
  "updated_at": "2024-01-15T10:00:00"
}
```

**Field Types**:
- `id`: integer (auto-generated)
- `participant_id`: string (UUID, auto-generated)
- `subject_id`: string (unique identifier)
- `study_group`: enum (`"treatment"` | `"control"`)
- `enrollment_date`: string (date in `YYYY-MM-DD` format)
- `status`: enum (`"active"` | `"completed"` | `"withdrawn"`)
- `age`: integer (0-150)
- `gender`: enum (`"M"` | `"F"` | `"Other"`)
- `created_at`: string (ISO 8601 datetime)
- `updated_at`: string (ISO 8601 datetime)

### User Object

```json
{
  "id": 1,
  "email": "user@example.com",
  "full_name": "John Doe"
}
```

**Field Types**:
- `id`: integer (auto-generated)
- `email`: string (valid email address, unique)
- `full_name`: string (optional)

---

## Authentication

All participant endpoints require JWT authentication. Include the token in the Authorization header:

```http
Authorization: Bearer <your_jwt_token>
```

**Token Format**: JWT token obtained from `/api/auth/login` or `/api/auth/register`

**Token Expiration**: Default 3600 seconds (1 hour), configurable via `JWT_ACCESS_TOKEN_EXPIRES` environment variable

**Invalid Token Response**: `401 Unauthorized`

---

## Error Responses

All endpoints follow consistent error response format:

```json
{
  "error": "Error message describing what went wrong"
}
```

**Common HTTP Status Codes**:
- `200 OK`: Successful GET, PUT, DELETE
- `201 Created`: Successful POST (create)
- `400 Bad Request`: Validation error or malformed request
- `401 Unauthorized`: Missing or invalid authentication token
- `404 Not Found`: Resource not found
- `409 Conflict`: Duplicate resource (e.g., subject_id already exists)
- `500 Internal Server Error`: Server error

---

## Example Requests

### Using cURL

**Login**:
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@trial.com","password":"admin123"}'
```

**Create Participant** (using token from login):
```bash
curl -X POST http://localhost:5000/api/participants \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "subject_id": "P999",
    "study_group": "treatment",
    "enrollment_date": "2024-02-01",
    "status": "active",
    "age": 30,
    "gender": "M"
  }'
```

**Get All Participants**:
```bash
curl -X GET http://localhost:5000/api/participants \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

## Auto-Generated API Documentation

For interactive Swagger/OpenAPI documentation, consider adding:

- **Flask-RESTX**: Generates Swagger UI from code annotations
- **flasgger**: Auto-generates OpenAPI/Swagger docs from Flask routes

Both can be added to provide an interactive API documentation interface at `/api/docs` or similar endpoint.

