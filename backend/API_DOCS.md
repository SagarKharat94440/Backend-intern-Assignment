# API Documentation

Base URL: `http://localhost:5000`

## Authentication APIs

### 1. Register User
**POST** `/api/v2/auth/register`

```json
{``json
  "name": "Joe",
  "emai": "Johhn@examp
  "password": hn@exaePass12m",
  "pole": "user"ecurePass123",
  "role": "user"
}``

### 2. Login Us
**Respon `/api/v2/auth/login`

``
 
  "email": : "User regle.com",
  "pass": d": "SecurePas
}
```

###   "emaout User
**POST** `/": "v2/auth/logout`
    },
   body required.
  }
### 4. Get Profile
**GET** `/api/v2/auth/profile`

Headers: `Authorization: Bearer <token>`

## Task APIs

### 6. Create Task
**POST** `/api/v2/tasks`

Headers: `Authorization: Bearer <token>`

```json
{
  "title": "Complete project",
  "description": "Finish the task management system",
  "status": "pending",
  "priority": "high",
  "dueDate": "2024-12-31T23:59:59.000Z"
}
```

### 7. Get All Tasks
**GET** `/api/v2/tasks`

Headers: `Authorization: Bearer <token>`

Query params: `?status=pending&priority=high&page=1&limit=10&search=project`

### 8. Get Task by ID
**GET** `/api/v2/tasks/:id`

Headers: `Authorization: Bearer <token>`

### 9. Update Task
**PUT** `/api/v2/tasks/:id`

Headers: `Authorization: Bearer <token>`

```json
{
  "title": "Updated title",
  "status": "completed"
}
```

### 10. Delete Task
**DELETE** `/api/v2/tasks/:id`

Headers: `Authorization: Bearer <token>`

### 11. Get Task Stats (Admin Only)
**GET** `/api/v2/tasks/stats`

Headers: `Authorization: Bearer <token>`

## Sample cURL Commands

```bash
# Register
curl -X POST http://localhost:5000/api/v2/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"John Doe","email":"john@example.com","password":"SecurePass123"}'

# Login
curl -X POST http://localhost:5000/api/v2/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john@example.com","password":"SecurePass123"}'

# Create Task
curl -X POST http://localhost:5000/api/v2/tasks \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"title":"Test Task","description":"This is a test task"}'

# Get Tasks
curl -X GET http://localhost:5000/api/v2/tasks \
  -H "Authorization: Bearer YOUR_TOKEN"
```**PUT** `/api/v2/auth/profile`
**Headers:** `Authorization: Bearer <token>`

**Request:**
```json
{
  "name": "John Updated"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Profile updated successfully",
  "data": {
    "user": {
      "id": "user_id",
      "name": "John Updated",
      "email": "john@example.com",
      "role": "user"
    }
  }
}
```

## Task APIs

### 6. Create Task
**POST** `/api/v2/tasks`
**Headers:** `Authorization: Bearer <token>`

**Request:**
```json
{
  "title": "Complete project documentation",
  "description": "Write comprehensive documentation for the task management system",
  "status": "pending",
  "priority": "high",
  "dueDate": "2024-12-31T23:59:59.000Z",
  "assignedTo": "user_id"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Task created successfully",
  "data": {
    "task": {
      "id": "task_id",
      "title": "Complete project documentation",
      "description": "Write comprehensive documentation...",
      "status": "pending",
      "priority": "high",
      "dueDate": "2024-12-31T23:59:59.000Z",
      "createdBy": {
        "id": "user_id",
        "name": "John Doe",
        "email": "john@example.com"
      },
      "assignedTo": {
        "id": "user_id",
        "nameohn Doe",
       ail": "john@ex"
         "createdAt": "2000:00.000Z",
     At": "2024-001T00:00:00.00
    }
  }
}
``
**GET** `/api/asks?stag&priority=high&pageit=10&searcation`
**Heahorization: Bearer <t

**Response:**
son
{
  "succ successfully",
  "data": {
    "task": {
      "id": "task_id",
      "title": "Updated task title",
      "description": "Updated task description",
      "status": "in-progress",
      "priority": "medium",
      "dueDate": "2024-12-31T23:59:59.000Z",
      "createdBy": {
        "id": "user_id",
        "name": "John Doe",
        "email": "john@example.com"
      },
      "assignedTo": {
        "id": "user_id",
        "name": "John Doe",
        "email": "john@example.com"
      },
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  }
}
```

### 10. Delete Task
**DELETE** `/api/v2/tasks/:id`
**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "success": true,
  "message": "Task deleted successfully"
}
```

### 11. Get Task Statistics (Admin Only)
**GET** `/api/v2/tasks/stats`
**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "success": true,
  "data": {
    "statusStats": [
      { "_id": "pending", "count": 15 },
      { "_id": "in-progress", "count": 8 },
      { "_id": "completed", "count": 25 }
    ],
    "priorityStats": [
      { "_id": "low", "count": 10 },
      { "_id": "medium", "count": 20 },
      { "_id": "high", "count": 18 }
    ],
    "totalTasks": 48,
    "overdueTasks": 5
  }
}
```

## cURL Examples

### Register
```bash
curl -X POST http://localhost:5000/api/v2/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"John Doe","email":"john@example.com","password":"SecurePass123","role":"user"}'
```

### Login
```bash
curl -X POST http://localhost:5000/api/v2/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john@example.com","password":"SecurePass123"}'
```

### Create Task
```bash
curl -X POST http://localhost:5000/api/v2/tasks \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{"title":"Test Task","description":"This is a test task description","priority":"high"}'
```

### Get Tasks
```bash
curl -X GET "http://localhost:5000/api/v2/tasks?status=pending&page=1&limit=10" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Update Task
```bash
curl -X PUT http://localhost:5000/api/v2/tasks/TASK_ID \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{"status":"completed"}'
```

### Delete Task
```bash
curl -X DELETE http://localhost:5000/api/v2/tasks/TASK_ID \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```