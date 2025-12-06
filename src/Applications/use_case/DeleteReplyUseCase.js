class DeleteReplyUseCase {
  constructor({ replyRepository, commentRepository, threadRepository }) {
    this._replyRepository = replyRepository;
    this._commentRepository = commentRepository;
    this._threadRepository = threadRepository;
  }

  async execute(useCasePayload) {
    const { threadId, commentId, replyId, owner } = useCasePayload;

    // validation chain (thread, comment, reply, is the owner)
    this._threadRepository.checkThreadAvailability(threadId);
    this._commentRepository.checkCommentAvailability(commentId);
    this._replyRepository.verifyReplyExists(replyId);
    this._replyRepository.verifyReplyOwner(replyId, owner);

    // (soft) delete reply
    this._replyRepository.deleteReply(replyId);
  }
}

module.exports = DeleteReplyUseCase;
