# API Documentation for GitAdventure

This document outlines the available API endpoints for the GitAdventure application.

## Base URL

All endpoints are relative to the base URL (default):

```
http://localhost:3000/api
```

Or the value specified in the `PORT` environment variable for the backend.

## Authentication Endpoints (`/api/auth`)

Handles user registration and login.

### Register User

- **URL**: `/register`
- **Method**: `POST`
- **Controller**: `AuthController.register`
- **Description**: Registers a new user.
- **Request Body**: `{ "username": "string", "password": "string" }`
- **Response**: `{ "userId": "uuid", "username": "string", "message": "User registered successfully" }` or error message.

### Login User

- **URL**: `/login`
- **Method**: `POST`
- **Controller**: `AuthController.login`
- **Description**: Logs in an existing user.
- **Request Body**: `{ "username": "string", "password": "string" }`
- **Response**: `{ "token": "jwt_token", "message": "Login successful" }` or error message.

## Command Validation Endpoints (`/api/commands`)

Validates user-entered commands, potentially related to quests.

### Validate Command

- **URL**: `/validate` (Note: The previous documentation mentioned `/` but the route file likely uses `/validate` or similar based on standard practices. Needs verification if `/` is indeed the endpoint).
- **Method**: `POST`
- **Controller**: `CommandController.validateCommand`
- **Middleware**: `authMiddleware` (Requires authentication)
- **Description**: Validates a command entered by the user, possibly checking against quest requirements.
- **Request Body**: `{ "command": "string", "questId": "uuid", "currentStep": number }` (Schema needs confirmation based on `CommandController`)
- **Response**: `{ "success": boolean, "valid": boolean, "message": "string", "nextStep": number | null, "commandName": "string" }` (Schema needs confirmation)

## Quest Endpoints (`/api/quests`)

Manages quests and their steps.

### Get All Quests

- **URL**: `/`
- **Method**: `GET`
- **Controller**: `QuestController.getAllQuests`
- **Description**: Retrieves a list of all available quests.
- **Response**: `Array<Quest>` or error message.

### Get Quest by ID

- **URL**: `/:id`
- **Method**: `GET`
- **Controller**: `QuestController.getQuestById`
- **Description**: Retrieves details for a specific quest.
- **Response**: `Quest` or error message.

## Progress Endpoints (`/api/progress`)

Manages user game progress.

### Get User Progress

- **URL**: `/`
- **Method**: `GET`
- **Controller**: `GameProgressController.getUserProgress`
- **Middleware**: `authMiddleware` (Requires authentication)
- **Description**: Retrieves the current progress for the logged-in user.
- **Response**: `UserProgress` or error message.

### Update User Progress

- **URL**: `/`
- **Method**: `POST`
- **Controller**: `GameProgressController.updateUserProgress`
- **Middleware**: `authMiddleware` (Requires authentication)
- **Description**: Updates the progress for the logged-in user.
- **Request Body**: `{ /* Structure depends on GameProgressController */ }`
- **Response**: `UserProgress` or error message.

## Error Codes

| Status Code | Description |
|-------------|-------------|
| 200 / 201   | OK / Created - Request was successful |
| 400         | Bad Request - Invalid input or missing fields |
| 401         | Unauthorized - Authentication required or failed |
| 404         | Not Found - Resource not found |
| 500         | Internal Server Error - Server-side error |

*Note: Specific request/response schemas and exact endpoint paths should be verified against the controller implementations.*