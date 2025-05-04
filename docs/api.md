# API Documentation for GitAdventure

This document outlines the available API endpoints for the GitAdventure application.

## Base URL

All endpoints are relative to the base URL:

```
http://localhost:3001/api
```

Or the value specified in `VITE_API_BASE_URL` environment variable.

## Command Validation Endpoints

### Validate Command

Validates a Git command against the expected pattern for a specific quest step.

- **URL**: `/commands`
- **Method**: `POST`
- **Content Type**: `application/json`

#### Request Body

```json
{
  "command": "git init",
  "questId": 1,
  "currentStep": 1
}
```

| Field | Type | Description |
|-------|------|-------------|
| command | string | The Git command entered by the user |
| questId | number | The ID of the current quest |
| currentStep | number | (Optional) The current step number in the quest |

#### Response

```json
{
  "success": true,
  "valid": true,
  "message": "Command 'git init' is valid.",
  "nextStep": 2,
  "commandName": "git init"
}
```

| Field | Type | Description |
|-------|------|-------------|
| success | boolean | Whether the API call was successful |
| valid | boolean | Whether the command is valid for the current step |
| message | string | A message describing the validation result |
| nextStep | number | (Optional) The next step number if the command was valid |
| commandName | string | The name of the command that was validated |

#### Error Response

```json
{
  "success": false,
  "message": "Command and questId are required"
}
```

#### Example Usage

```javascript
// Frontend code example
const validateCommand = async (command) => {
  try {
    const response = await fetch('http://localhost:3001/api/commands', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        command,
        questId: 1,
        currentStep: 1,
      }),
    });
    
    return await response.json();
  } catch (error) {
    console.error('Error validating command:', error);
    return { success: false, valid: false, message: 'Server error' };
  }
};
```

## Error Codes

| Status Code | Description |
|-------------|-------------|
| 200 | OK - Request was successful |
| 400 | Bad Request - Missing required fields |
| 500 | Internal Server Error - Server-side error |

## Future Endpoints (Planned)

The following endpoints are planned for future implementation:

### Quest Endpoints

- **GET /quests** - Get a list of available quests
- **GET /quests/:id** - Get details for a specific quest
- **GET /quests/:id/steps** - Get steps for a specific quest

### User Progress Endpoints

- **GET /users/:id/progress** - Get a user's progress
- **POST /users/:id/progress** - Update a user's progress
- **GET /users/:id/quests/:questId/progress** - Get a user's progress for a specific quest

### User Authentication

- **POST /auth/register** - Register a new user
- **POST /auth/login** - Log in a user
- **POST /auth/logout** - Log out a user

## WebSocket Events (Planned)

Future versions of the API may include WebSocket support for real-time updates:

- **command_executed** - When a command is executed successfully
- **quest_progress_updated** - When a user's quest progress is updated
- **new_quest_available** - When a new quest becomes available