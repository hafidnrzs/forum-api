const NewReply = require('../../Domains/replies/entities/NewReply');

class AddReplyUseCase {
  constructor({ replyRepository, commentRepository, threadRepository }) {
    this._replyRepository = replyRepository;
    this._commentRepository = commentRepository;
    this._threadRepository = threadRepository;
  }

  async execute(useCasePayload, threadId, commentId, owner) {
    // verify thread exists
    this._threadRepository.checkThreadAvailability(threadId);
    // verify comment exists
    this._commentRepository.checkCommentAvailability(commentId);

    const newReply = new NewReply(useCasePayload);
    return this._replyRepository.addReply(newReply, commentId, owner);
  }
}

module.exports = AddReplyUseCase;
