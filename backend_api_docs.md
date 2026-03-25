# OpenLani Backend API Documentation

## Base URL
`/api/v1`

## 1. Authentication & Account Management

### 1.1 Update Account Information
- **Endpoint**: `/account/update`
- **Method**: `POST`
- **Description**: Updates user's password and/or username.
- **Request Body**:
  ```json
  {
    "currentPassword": "old_password123",
    "newPassword": "new_password456",
    "newUsername": "new_user_name" // optional
  }
  ```
- **Response**:
  - `200 OK`: `{"status": "success", "message": "Account updated successfully"}`
  - `400 Bad Request`: `{"status": "error", "message": "Validation failed"}`
  - `401 Unauthorized`: `{"status": "error", "message": "Incorrect current password"}`

---

## 2. Model Configuration

### 2.1 Get Configured Models
- **Endpoint**: `/models`
- **Method**: `GET`
- **Description**: Retrieves all configured AI models.
- **Response**:
  ```json
  {
    "status": "success",
    "data": [
      {
        "id": "model_abc123",
        "provider": "OpenAI",
        "name": "gpt-4",
        "apiBaseUrl": "https://api.openai.com/v1",
        "type": "Text"
      }
    ]
  }
  ```

### 2.2 Add New Model
- **Endpoint**: `/models`
- **Method**: `POST`
- **Description**: Adds a new model configuration.
- **Request Body**:
  ```json
  {
    "provider": "OpenAI",
    "name": "gpt-4",
    "apiBaseUrl": "https://api.openai.com/v1",
    "apiKeys": ["sk-key1", "sk-key2"],
    "type": "Text"
  }
  ```
- **Response**:
  - `201 Created`: `{"status": "success", "data": {"id": "model_abc123"}}`

### 2.3 Update Model Configuration
- **Endpoint**: `/models/{modelId}`
- **Method**: `PUT`
- **Description**: Updates an existing model's configuration.
- **Request Body**:
  ```json
  {
    "provider": "OpenAI",
    "name": "gpt-4-turbo",
    "apiBaseUrl": "https://api.openai.com/v1",
    "apiKeys": ["sk-key1", "sk-new-key3"],
    "type": "Text"
  }
  ```
- **Response**:
  - `200 OK`: `{"status": "success", "message": "Model updated successfully"}`
  - `404 Not Found`: `{"status": "error", "message": "Model not found"}`

### 2.4 Delete Model
- **Endpoint**: `/models/{modelId}`
- **Method**: `DELETE`
- **Description**: Deletes a specific model configuration.
- **Response**:
  - `200 OK`: `{"status": "success", "message": "Model deleted successfully"}`
  - `404 Not Found`: `{"status": "error", "message": "Model not found"}`

---

## 3. Chat System

### 3.1 Get Chat History List
- **Endpoint**: `/chat/history`
- **Method**: `GET`
- **Description**: Retrieves a list of all chat conversations.
- **Response**:
  ```json
  {
    "status": "success",
    "data": [
      {
        "id": "chat_789",
        "title": "Welcome Chat",
        "updatedAt": "2026-03-24T12:00:00Z"
      }
    ]
  }
  ```

### 3.2 Create New Chat
- **Endpoint**: `/chat`
- **Method**: `POST`
- **Description**: Initializes a new chat conversation.
- **Response**:
  - `201 Created`: `{"status": "success", "data": {"id": "chat_123", "title": "New Conversation"}}`

### 3.3 Delete Chat
- **Endpoint**: `/chat/{chatId}`
- **Method**: `DELETE`
- **Description**: Deletes a specific chat conversation.
- **Response**:
  - `200 OK`: `{"status": "success", "message": "Chat deleted successfully"}`
  - `404 Not Found`: `{"status": "error", "message": "Chat not found"}`

### 3.4 Get Chat Messages
- **Endpoint**: `/chat/{chatId}/messages`
- **Method**: `GET`
- **Description**: Retrieves messages for a specific chat.
- **Response**:
  ```json
  {
    "status": "success",
    "data": [
      {
        "id": "msg_001",
        "role": "user",
        "text": "Hello!",
        "time": "12:00:00"
      },
      {
        "id": "msg_002",
        "role": "ai",
        "model": "OpenAI/gpt-4",
        "text": "Hi there! How can I help you?",
        "time": "12:00:02"
      }
    ]
  }
  ```

### 3.5 Send Chat Message
- **Endpoint**: `/chat/{chatId}/messages`
- **Method**: `POST`
- **Description**: Sends a message to the AI and gets a response (supports standard JSON or server-sent events for streaming).
- **Headers**:
  - `Accept: text/event-stream` (if streaming response is requested)
- **Request Body**:
  ```json
  {
    "text": "What is the capital of France?",
    "modelId": "model_abc123",
    "stream": true,
    "attachments": [] // array of file IDs if files were uploaded
  }
  ```
- **Response (Standard)**:
  - `200 OK`: `{"status": "success", "data": {"id": "msg_003", "role": "ai", "text": "Paris.", "model": "OpenAI/gpt-4", "time": "12:01:00"}}`

### 3.6 Upload File
- **Endpoint**: `/chat/upload`
- **Method**: `POST`
- **Content-Type**: `multipart/form-data`
- **Description**: Uploads a file to be attached to the next message.
- **Request Form-Data**:
  - `file`: The binary file data.
- **Response**:
  - `200 OK`: `{"status": "success", "data": {"fileId": "file_456", "filename": "data.csv"}}`