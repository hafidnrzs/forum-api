const Comment = require('../../Domains/comments/entities/Comment');

class AddCommentUseCase {
  constructor({ commentRepository, threadRepository }) {
    this._commentRepository = commentRepository;
    this._threadRepository = threadRepository;
  }

  async execute(useCasePayload, threadId, owner) {
    // verify thread exists
    await this._threadRepository.checkThreadAvailability(threadId);

    const comment = new Comment(useCasePayload);
    return this._commentRepository.addComment({ ...comment, owner }, threadId);
  }
}

module.exports = AddCommentUseCase;
