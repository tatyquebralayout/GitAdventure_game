# API Documentation

## Endpoints

- **GET /users**: Fetch a list of users.
- **POST /users**: Create a new user.
- **GET /users/:id**: Fetch details of a specific user.
- **PUT /users/:id**: Update user information.
- **DELETE /users/:id**: Delete a user.

## Authentication

The application uses JSON Web Tokens (JWT) for authentication. Users must include a valid token in the `Authorization` header for protected routes.

## Error Codes

- **400**: Bad Request - Invalid input or missing parameters.
- **401**: Unauthorized - Missing or invalid authentication token.
- **404**: Not Found - Resource not found.
- **500**: Internal Server Error - An unexpected error occurred.