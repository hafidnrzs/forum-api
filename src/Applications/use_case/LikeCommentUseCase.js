class LikeCommentUseCase {
  constructor({ commentRepository, threadRepository }) {
    this._commentRepository = commentRepository;
    this._threadRepository = threadRepository;
  }

  async execute(useCasePayload) {
    const { threadId, commentId, userId } = useCasePayload;

    // validation to check thread and comment exists
    await this._threadRepository.checkThreadAvailability(threadId);
    await this._commentRepository.checkCommentAvailability(commentId);

    await this._commentRepository.likeComment(commentId, userId);
  }
}

module.exports = LikeCommentUseCase;
