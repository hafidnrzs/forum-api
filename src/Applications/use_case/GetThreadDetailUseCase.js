const ThreadDetail = require('../../Domains/threads/entities/ThreadDetail');

class GetThreadDetailUseCase {
  constructor({ threadRepository, commentRepository }) {
    this._threadRepository = threadRepository;
    this._commentRepository = commentRepository;
  }

  async execute(threadId) {
    // get thread basic info
    const thread = await this._threadRepository.getThreadById(threadId);

    // get all comments for the thread
    const comments = await this._commentRepository.getCommentsByThreadId(threadId);

    // combine thread with comments
    return new ThreadDetail({
      ...thread,
      comments,
    });
  }
}

module.exports = GetThreadDetailUseCase;
