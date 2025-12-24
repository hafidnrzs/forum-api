const AuthorizationError = require('../../Commons/exceptions/AuthorizationError');
const NotFoundError = require('../../Commons/exceptions/NotFoundError');
const CommentRepository = require('../../Domains/comments/CommentRepository');
const AddedComment = require('../../Domains/comments/entities/AddedComment');
const CommentDetail = require('../../Domains/comments/entities/CommentDetail');

class CommentRepositoryPostgres extends CommentRepository {
  constructor(pool, idGenerator) {
    super();
    this._pool = pool;
    this._idGenerator = idGenerator;
  }

  async addComment(comment, threadId) {
    const { content, owner } = comment;
    const id = `comment-${this._idGenerator()}`;
    const date = new Date().toISOString();

    const query = {
      text: 'INSERT INTO comments VALUES ($1, $2, $3, $4, $5, $6) RETURNING id, content, owner',
      values: [id, content, date, owner, threadId, false],
    };

    const result = await this._pool.query(query);

    return new AddedComment({ ...result.rows[0] });
  }

  async checkCommentAvailability(commentId) {
    const query = {
      text: 'SELECT id FROM comments WHERE id = $1',
      values: [commentId],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('comment tidak ditemukan');
    }
  }

  async verifyCommentOwner(commentId, owner) {
    const query = {
      text: 'SELECT owner FROM comments WHERE id = $1',
      values: [commentId],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('comment tidak ditemukan');
    }

    const comment = result.rows[0];

    if (comment.owner !== owner) {
      throw new AuthorizationError('Anda tidak berhak mengakses resource ini');
    }
  }

  async deleteComment(commentId) {
    const query = {
      text: 'UPDATE comments SET is_delete = TRUE WHERE id = $1',
      values: [commentId],
    };

    await this._pool.query(query);
  }

  async getCommentsByThreadId(threadId) {
    const query = {
      text: `SELECT c.id, c.content, c.date, c.is_delete, u.username,
      COUNT(DISTINCT cl.id)::int AS "likeCount"
      FROM comments c
      LEFT JOIN users u ON c.owner = u.id
      LEFT JOIN comment_likes cl ON c.id = cl.comment_id
      WHERE thread_id = $1
      GROUP BY c.id, c.content, c.date, c.is_delete, u.username
      ORDER BY date ASC`,
      values: [threadId],
    };

    const result = await this._pool.query(query);

    return result.rows.map((comment) => new CommentDetail(comment));
  }

  async likeComment(commentId, userId) {
    const id = `like-${this._idGenerator()}`;
    const createdAt = new Date().toISOString();

    // Cek state apakah user sudah like atau tidak
    const checkQuery = {
      text: 'SELECT id FROM comment_likes WHERE comment_id = $1 AND user_id = $2',
      values: [commentId, userId],
    };

    const checkResult = await this._pool.query(checkQuery);

    if (checkResult.rowCount > 0) {
      // Jika terdeteksi, maka hapus like
      const deleteQuery = {
        text: 'DELETE FROM comment_likes WHERE comment_id = $1 AND user_id = $2',
        values: [commentId, userId],
      };
      await this._pool.query(deleteQuery);
    } else {
      // Tambah like
      const insertQuery = {
        text: 'INSERT INTO comment_likes VALUES ($1, $2, $3, $4)',
        values: [id, commentId, userId, createdAt],
      };
      await this._pool.query(insertQuery);
    }
  }

  async getCommentLikeCount(commentId) {
    const query = {
      text: 'SELECT COUNT(*) FROM comment_likes WHERE comment_id = $1',
      values: [commentId],
    };

    const result = await this._pool.query(query);

    return parseInt(result.rows[0].count, 10);
  }
}

module.exports = CommentRepositoryPostgres;
