const AuthorizationError = require('../../Commons/exceptions/AuthorizationError');
const NotFoundError = require('../../Commons/exceptions/NotFoundError');
const CommentRepository = require('../../Domains/comments/CommentRepository');
const AddedComment = require('../../Domains/comments/entities/AddedComment');
const CommentDetail = require('../../Domains/threads/entities/CommentDetail');

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
      text: `SELECT c.id, c.content, c.date, c.is_delete, u.username
      FROM comments c
      LEFT JOIN users u ON c.owner = u.id
      WHERE thread_id = $1
      ORDER BY date ASC`,
      values: [threadId],
    };

    const result = await this._pool.query(query);

    return result.rows.map((comment) => new CommentDetail(comment));
  }
}

module.exports = CommentRepositoryPostgres;
