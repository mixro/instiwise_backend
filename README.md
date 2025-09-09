# INSTiWISE Backend - Technical Documentation

![Node.js](https://img.shields.io/badge/Node.js-v18.x-green) 
![Express.js](https://img.shields.io/badge/Express.js-v4.x-blue)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-green)
![Mongoose](https://img.shields.io/badge/Mongoose-v6.x-orange)
![JWT](https://img.shields.io/badge/JWT-Security-red)

The **InstiWise Backend** is a robust Node.js-based backend designed to support academic management, project sharing, student networking, and institute-wide announcements. It provides secure APIs for **user authentication, course and lesson scheduling, project documentation, and centralized communication**.


## Table of Contents

- [Overview](#overview)
- [Project Structure](#project-structure)
- [Architecture](#architecture)
- [Technologies](#technologies)
- [Setup Instructions](#setup-instructions)
- [API Endpoints](#api-endpoints)
- [Authentication](#authentication)
- [Testing](#testing)
- [Deployment](#deployment)
- [Error Handling](#error-handling)
- [Security](#security)
- [Future Improvements](#future-improvements)
- [Support](#support)


## Overview

The InstiWise backend powers the **Smart Institute Concept**, enabling:
- Academic management (courses, lessons, room schedules).
- Student project sharing and collaboration.
- News & announcements from student organizations and administration.
- Student networking & connectivity across the institute.

It uses **Express.js** for routing, **MongoDB** (via Mongoose) for data storage, and **JWT** for authentication.

## Project Structure

```
instiwise_backend/
├── models/
│   ├── course.model.js       # Course schema
│   ├── lesson.model.js       # Lesson schema
│   ├── post.model.js         # News/announcements schema
│   ├── projects.model.js     # Projects schema
│   ├── room.model.js         # Rooms schema
│   └── user.model.js         # User schema
│
├── routes/
│   ├── Auth.js               # Authentication routes
│   ├── Courses.js            # Course routes
│   ├── Lessons.js            # Lesson routes
│   ├── Posts.js              # Posts routes
│   ├── Projects.js           # Projects routes
│   ├── Rooms.js              # Rooms routes
│   ├── User.js               # User routes
│   └── verifyToken.js        # JWT verification middleware
│
├── env                       # Environment config file
├── controller.js             # Central controller logic
├── index.js                  # Main entry point
├── package.json              # Dependencies & scripts
└── package-lock.json
```
## Architecture

### Components
- **Express.js Server**: Handles all API requests and routes.
- **MongoDB + Mongoose**: Database for storing users, courses, lessons, projects, posts, and rooms.
- **JWT Authentication**: Ensures secure access for users and admins.
- **CryptoJS**: Encrypts passwords for safe storage.
- **Middleware**: Protects routes using `verifyToken.js`.


## Technologies

- **Node.js**: v18.x  
- **Express.js**: v4.x  
- **MongoDB**: Latest (Atlas or local)  
- **Mongoose**: v6.x for schema modeling  
- **JWT**: For secure authentication  
- **CryptoJS**: For password encryption  
- **Moment.js**: For time/date management  


## Setup Instructions

### Prerequisites
- **Node.js**: v18.x (run `node -v` to verify)
- **MongoDB**: Atlas account or local installation
- **Postman**: For testing APIs
- **Git**: For cloning the repository

### Installation
1. **Clone Repository**
   ```bash
   git clone https://github.com/your-username/instiwise_backend.git
   cd instiwise_backend
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Configure Environment**
   Create `.env` in the root directory:
   ```env
   MONGO_URL=your_mongodb_connection_string
   PASS_SEC=your_crypto_secret
   JWT_SEC=your_jwt_secret
   PORT=8800
   ```

4. **Run the Server**
   ```bash
   npm start
   ```
   For development with auto-restart:
   ```bash
   npm run dev
   ```
   Backend runs at:
   👉 http://localhost:8800/api/





## API Endpoints

- **Authentication**
  - POST /api/auth/register → Register new user
  - POST /api/auth/login → Login
  - POST /api/auth/google-login → Google login
  - POST /api/auth/google-register → Google register

- **Users**
  - GET /api/users/:id → Get user details
  - PUT /api/users/:id → Update user profile
  - DELETE /api/users/:id → Delete user

- **Courses & Lessons**
  - POST /api/courses/ → Create new course
  - POST /api/lessons/ → Create new lesson
  - GET /api/lessons/ongoing → Get ongoing lessons
  - GET /api/lessons/upcoming → Get upcoming lessons

- **Rooms**
  - POST /api/rooms/ → Create room
  - GET /api/rooms/ → Get all rooms
  - GET /api/lessons/room/:id → Get lessons in a room

- **Projects**
  - POST /api/projects/ → Create new project
  - GET /api/projects/ → Get all projects

- **Posts**
  - POST /api/posts/ → Create news/announcement
  - GET /api/posts/ → Get all posts


## Authentication

- **JWT**: Required for accessing most routes.
- **verifyToken.js middleware**: Protects restricted APIs.
- **Roles**: Admins can create/update/delete lessons, courses, rooms, and posts.


## Testing

- Use Postman to test routes.
- Run backend locally with MongoDB connection.
- Future improvements include Jest test coverage.


## Deployment

- Deploy on Heroku, Render, or AWS EC2.
- Use MongoDB Atlas for database hosting.
- Add CI/CD pipelines for continuous deployment.


## Error Handling

- Standardized error responses (400, 401, 403, 500).
- Middleware catches and logs errors.


## Security

- Passwords encrypted with CryptoJS.
- JWT-based authentication.
- Role-based access for admin routes.
- MongoDB validation to prevent injections.


## Future Improvements

- Notifications for new announcements.
- Real-time chat for student networking.
- Analytics dashboard for administrators.
- Improved project sharing (files, videos).


## Support

For inquiries or support:\
📧 Email: josephchongola43@gmail.com\
🌐 Website: [INSTiWISE Platform](https://instiwise.netlify.app/)