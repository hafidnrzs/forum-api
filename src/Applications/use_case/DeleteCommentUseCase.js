class DeleteCommentUseCase {
  constructor({ commentRepository, threadRepository }) {
    this._commentRepository = commentRepository;
    this._threadRepository = threadRepository;
  }

  async execute(useCasePayload) {
    const { threadId, commentId, owner } = useCasePayload;

    // verify thread exists
    await this._threadRepository.checkThreadAvailability(threadId);

    // verify comment exists
    await this._commentRepository.checkCommentAvailability(commentId);

    // verify comment ownership
    await this._commentRepository.verifyCommentOwner(commentId, owner);

    // (soft) delete comment
    await this._commentRepository.deleteComment(commentId);
  }
}

module.exports = DeleteCommentUseCase;
