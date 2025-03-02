const bcrypt = require('bcrypt');
const db = require('../config/database');

class User {
    static async findByUsername(username) {
        try {
            const [rows] = await db.execute(
                'SELECT * FROM users WHERE username = ?',
                [username]
            );
            return rows[0];
        } catch (error) {
            console.error('Database error:', error);
            throw new Error('Database error');
        }
    }

    static async findById(id) {
        const [rows] = await db.execute('SELECT * FROM users WHERE id = ?', [id]);
        return rows[0];
    }

    static async create(username, email, password) {
        try {
            const hashedPassword = await bcrypt.hash(password, 10);
            const [result] = await db.execute(
                'INSERT INTO users (username, email, password) VALUES (?, ?, ?)',
                [username, email, hashedPassword]
            );
            return {
                id: result.insertId,
                username,
                email
            };
        } catch (error) {
            console.error('Database error:', error);
            throw new Error('Error creating user');
        }
    }
}

module.exports = User;