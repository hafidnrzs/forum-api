class ReplyDetail {
  constructor(payload) {
    this._verifyPayload(payload);

    this.id = payload.id;
    this.content = payload.content;
    this.date = payload.date;
    this.username = payload.username;
    this.comment_id = payload.comment_id;
    this.is_delete = payload.is_delete;
  }

  _verifyPayload(payload) {
    const { id, content, date, username, comment_id, is_delete } = payload;

    if (!id || !content || !date || !username || !comment_id || is_delete === undefined) {
      throw new Error('REPLY_DETAIL.NOT_CONTAIN_NEEDED_PROPERTY');
    }

    if (
      typeof id !== 'string' ||
      typeof content !== 'string' ||
      typeof date !== 'string' ||
      typeof username !== 'string' ||
      typeof comment_id !== 'string' ||
      typeof is_delete !== 'boolean'
    ) {
      throw new Error('REPLY_DETAIL.NOT_MEET_DATA_TYPE_SPECIFICATION');
    }
  }
}

module.exports = ReplyDetail;
