/* istanbul ignore file */
const pool = require('../src/Infrastructures/database/postgres/pool');

const CommentLikesTableTestHelper = {
  async addLike({
    id = 'like-123',
    commentId = 'comment-123',
    userId = 'user-123',
    createdAt = '2025-12-24T07:22:33.555Z',
  }) {
    const query = {
      text: 'INSERT INTO comment_likes VALUES($1, $2, $3, $4)',
      values: [id, commentId, userId, createdAt],
    };

    await pool.query(query);
  },

  async findLikesByCommentId(commentId) {
    const query = {
      text: 'SELECT * FROM comment_likes WHERE comment_id = $1',
      values: [commentId],
    };

    const result = await pool.query(query);
    return result.rows;
  },

  async cleanTable() {
    await pool.query('DELETE FROM comment_likes WHERE 1=1');
  },
};

module.exports = CommentLikesTableTestHelper;
