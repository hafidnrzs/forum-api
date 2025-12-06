const ThreadDetail = require('../../Domains/threads/entities/ThreadDetail');

class GetThreadDetailUseCase {
  constructor({ threadRepository, commentRepository, replyRepository }) {
    this._threadRepository = threadRepository;
    this._commentRepository = commentRepository;
    this._replyRepository = replyRepository;
  }

  async execute(threadId) {
    // fetch thread and comments
    const thread = await this._threadRepository.getThreadById(threadId);
    const comments = await this._commentRepository.getCommentsByThreadId(threadId);

    // fetch replies for all comments
    const commentIds = comments.map((comment) => comment.id);
    const replies = await this._replyRepository.getRepliesByCommentIds(commentIds);

    // group replies by comment_id
    const repliesByCommentId = {};

    replies.forEach((reply) => {
      if (!repliesByCommentId[reply.comment_id]) {
        repliesByCommentId[reply.comment_id] = [];
      }
      repliesByCommentId[reply.comment_id].push({
        id: reply.id,
        username: reply.username,
        date: reply.date,
        content: reply.is_delete ? '**balasan telah dihapus**' : reply.content,
      });
    });

    // sort each comment replies by date ascending
    Object.values(repliesByCommentId).forEach((replyArray) => {
      replyArray.sort((a, b) => new Date(a.date) - new Date(b.date));
    });

    // attach replies to comments
    const commentsWithReplies = comments.map((comment) => ({
      ...comment,
      replies: repliesByCommentId[comment.id] || [],
    }));

    // combine thread with comments and their replies
    return new ThreadDetail({
      ...thread,
      comments: commentsWithReplies,
    });
  }
}

module.exports = GetThreadDetailUseCase;
