class CommentDetail {
  constructor(payload) {
    this._verifyPayload(payload);

    this.id = payload.id;
    this.username = payload.username;
    this.date = payload.date;
    this.content = payload.is_delete ? '**komentar telah dihapus**' : payload.content;
    this.likeCount = payload.likeCount ?? 0;
    this.replies = payload.replies;
  }

  _verifyPayload(payload) {
    const { id, username, date, content, likeCount, replies } = payload;

    if (!id || !username || !date || !content) {
      throw new Error('COMMENT_DETAIL.NOT_CONTAIN_NEEDED_PROPERTY');
    }

    if (
      typeof id !== 'string' ||
      typeof username !== 'string' ||
      typeof date !== 'string' ||
      typeof content !== 'string' ||
      (likeCount !== undefined && typeof likeCount !== 'number')
    ) {
      throw new Error('COMMENT_DETAIL.NOT_MEET_DATA_TYPE_SPECIFICATION');
    }

    if (replies && !Array.isArray(replies)) {
      throw new Error('COMMENT_DETAIL.NOT_MEET_DATA_TYPE_SPECIFICATION');
    }
  }
}

module.exports = CommentDetail;
