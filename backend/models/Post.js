const db = require('../config/database');

class Post {
    static async create({ title, content, user_id }) {
        try {
            const [result] = await db.execute(
                'INSERT INTO posts (title, content, user_id) VALUES (?, ?, ?)',
                [title, content, user_id]
            );

            const [posts] = await db.execute(`
                SELECT p.*, u.username 
                FROM posts p 
                JOIN users u ON p.user_id = u.id 
                WHERE p.id = ?
            `, [result.insertId]);

            return posts[0];
        } catch (error) {
            console.error('Database error in create:', error);
            throw new Error('Failed to create post');
        }
    }

    static async findAll() {
        try {
            const [posts] = await db.execute(`
                SELECT p.*, u.username 
                FROM posts p 
                JOIN users u ON p.user_id = u.id 
                ORDER BY p.created_at DESC
            `);
            return posts;
        } catch (error) {
            console.error('Database error in findAll:', error);
            throw new Error('Failed to fetch posts');
        }
    }
  
    // Get a single post by ID
    static async findById(id) {
        try {
            const [rows] = await db.execute(`
                SELECT 
                    p.id,
                    p.title,
                    p.content,
                    p.user_id,
                    DATE_FORMAT(p.created_at, '%Y-%m-%d %H:%i:%s') as created_at,
                    u.username
                FROM posts p
                JOIN users u ON p.user_id = u.id
                WHERE p.id = ?
            `, [id]);

            if (rows.length === 0) {
                return null;
            }

            return {
                ...rows[0],
                created_at: new Date(rows[0].created_at).toISOString()
            };
        } catch (error) {
            console.error('Database error in findById:', error);
            throw new Error('Failed to fetch post');
        }
    }
  
    // Get posts by a specific user
    static async findByUserId(userId) {
        const [rows] = await db.execute(`
            SELECT p.id, p.title, p.content, p.created_at, 
                   u.id as user_id, u.username 
            FROM posts p
            JOIN users u ON p.user_id = u.id
            WHERE p.user_id = ?
            ORDER BY p.created_at DESC
        `, [userId]);
        return rows;
    }
  
    // Update a post
    static async update(id, userId, { title, content }) {
        try {
            // First check if the post exists and belongs to the user
            const [posts] = await db.execute(
                'SELECT * FROM posts WHERE id = ? AND user_id = ?',
                [id, userId]
            );

            if (posts.length === 0) {
                throw new Error('Post not found or unauthorized');
            }

            // Update the post
            await db.execute(
                'UPDATE posts SET title = ?, content = ? WHERE id = ? AND user_id = ?',
                [title, content, id, userId]
            );

            // Fetch the updated post with username
            const [updatedPosts] = await db.execute(`
                SELECT p.*, u.username 
                FROM posts p
                JOIN users u ON p.user_id = u.id
                WHERE p.id = ?
            `, [id]);

            return updatedPosts[0];
        } catch (error) {
            console.error('Database error in update:', error);
            throw new Error(error.message || 'Failed to update post');
        }
    }
  
    // Delete a post
    static async delete(id) {
        try {
            const [result] = await db.execute(
                'DELETE FROM posts WHERE id = ?',
                [id]
            );

            if (result.affectedRows === 0) {
                throw new Error('Post not found');
            }

            return true;
        } catch (error) {
            console.error('Database error in delete:', error);
            throw new Error('Failed to delete post');
        }
    }
}

module.exports = Post;
