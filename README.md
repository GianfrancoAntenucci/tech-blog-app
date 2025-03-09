# Tech Blog Application

A full-stack blog application built with Node.js, Express, and MySQL.

## Features

- User authentication (register/login)
- Create, read, update, and delete blog posts
- Responsive design
- Secure password hashing
- JWT authentication

## Tech Stack

- **Backend**: Node.js, Express
- **Database**: MySQL (Clever Cloud)
- **Authentication**: JWT, bcryptjs
- **Other**: CORS, dotenv

## Installation

1. Clone the repository:
```bash
git clone https://github.com/GianfrancoAntenucci/tech-blog-app.git
cd tech-blog-app
```

2. Install dependencies:
```bash
npm install
```

3. Create a .env file:
```properties
MYSQL_ADDON_HOST=your-mysql-host
MYSQL_ADDON_DB=your-database-name
MYSQL_ADDON_USER=your-username
MYSQL_ADDON_PASSWORD=your-password
MYSQL_ADDON_PORT=3306
JWT_SECRET=your-jwt-secret
```

4. Initialize the database:
```bash
npm run init-db
```

## Scripts

- `npm start`: Start the production server
- `npm run dev`: Start development server with nodemon
- `npm run check-db`: Check database connection and tables
- `npm run init-db`: Initialize database tables

## API Endpoints

### Authentication
- `POST /api/auth/register`: Register a new user
- `POST /api/auth/login`: Login user

### Posts
- `GET /api/posts`: Get all posts
- `GET /api/posts/:id`: Get single post
- `POST /api/posts`: Create new post (requires authentication)
- `PUT /api/posts/:id`: Update post (requires authentication)
- `DELETE /api/posts/:id`: Delete post (requires authentication)

## Database Schema

### Users Table
```sql
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(255) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Posts Table
```sql
CREATE TABLE posts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    user_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

## Deployment

This application is configured for deployment on Clever Cloud. Environment variables are automatically set through the Clever Cloud dashboard.

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.

## Acknowledgments

- [Express.js](https://expressjs.com/)
- [MySQL](https://www.mysql.com/)
- [Clever Cloud](https://www.clever-cloud.com/)
