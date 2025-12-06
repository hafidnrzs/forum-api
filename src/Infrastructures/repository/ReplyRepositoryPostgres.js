const AuthorizationError = require('../../Commons/exceptions/AuthorizationError');
const NotFoundError = require('../../Commons/exceptions/NotFoundError');
const AddedReply = require('../../Domains/replies/entities/AddedReply');
const ReplyDetail = require('../../Domains/replies/entities/ReplyDetail');
const ReplyRepository = require('../../Domains/replies/ReplyRepository');

class ReplyRepositoryPostgres extends ReplyRepository {
  constructor(pool, idGenerator) {
    super();
    this._pool = pool;
    this._idGenerator = idGenerator;
  }

  async addReply(newReply, commentId, ownerId) {
    const id = `reply-${this._idGenerator()}`;
    const date = new Date().toISOString();
    const query = {
      text: 'INSERT INTO replies VALUES($1, $2, $3, $4, $5, $6) RETURNING id, content, owner',
      values: [id, newReply.content, date, ownerId, commentId, false],
    };

    const result = await this._pool.query(query);
    return new AddedReply(result.rows[0]);
  }

  async getRepliesByCommentIds(commentIds) {
    if (!commentIds.length) return [];

    const query = {
      text: `SELECT r.id, r.content, r.date, r.is_delete, r.comment_id, u.username
      FROM replies r
      LEFT JOIN users u ON u.id = r.owner
      WHERE r.comment_id = ANY($1::text[])
      ORDER BY r.date ASC`,
      values: [commentIds],
    };

    const result = await this._pool.query(query);
    return result.rows.map((row) => new ReplyDetail(row));
  }

  async verifyReplyExists(replyId) {
    const query = {
      text: 'SELECT id FROM replies WHERE id = $1',
      values: [replyId],
    };

    const result = await this._pool.query(query);
    if (!result.rowCount) {
      throw new NotFoundError('reply tidak ditemukan');
    }
  }

  async verifyReplyOwner(replyId, ownerId) {
    const query = {
      text: 'SELECT owner FROM replies WHERE id = $1',
      values: [replyId],
    };

    const result = await this._pool.query(query);
    if (!result.rowCount) {
      throw new NotFoundError('reply tidak ditemukan');
    }
    if (result.rows[0].owner !== ownerId) {
      throw new AuthorizationError('Anda tidak berhak mengakses resource ini');
    }
  }

  async deleteReply(replyId) {
    const query = {
      text: 'UPDATE replies SET is_delete = TRUE WHERE id = $1',
      values: [replyId],
    };

    await this._pool.query(query);
  }
}

module.exports = ReplyRepositoryPostgres;
