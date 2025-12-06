const CommentRepository = require('../../../Domains/comments/CommentRepository');
const ReplyRepository = require('../../../Domains/replies/ReplyRepository');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const DeleteReplyUseCase = require('../DeleteReplyUseCase');

describe('DeleteReplyUseCase', () => {
  it('should orchestrate delete reply correctly', async () => {
    // Arrange
    const useCasePayload = {
      threadId: 'thread-123',
      commentId: 'comment-123',
      replyId: 'reply-123',
      owner: 'user-123',
    };

    const mockReplyRepository = new ReplyRepository();
    const mockCommentRepository = new CommentRepository();
    const mockThreadRepository = new ThreadRepository();

    /** mock needed function using Jest */
    mockThreadRepository.checkThreadAvailability = jest.fn().mockResolvedValue();
    mockCommentRepository.checkCommentAvailability = jest.fn().mockResolvedValue();
    mockReplyRepository.verifyReplyExists = jest.fn().mockResolvedValue();
    mockReplyRepository.verifyReplyOwner = jest.fn().mockResolvedValue();
    mockReplyRepository.deleteReply = jest.fn().mockResolvedValue();

    /** create use case instance */
    const deleteReplyUseCase = new DeleteReplyUseCase({
      replyRepository: mockReplyRepository,
      commentRepository: mockCommentRepository,
      threadRepository: mockThreadRepository,
    });

    // Action
    const result = await deleteReplyUseCase.execute(useCasePayload);

    // Assert
    expect(mockThreadRepository.checkThreadAvailability).toBeCalledWith(useCasePayload.threadId);
    expect(mockCommentRepository.checkCommentAvailability).toBeCalledWith(useCasePayload.commentId);
    expect(mockReplyRepository.verifyReplyExists).toBeCalledWith(useCasePayload.replyId);
    expect(mockReplyRepository.verifyReplyOwner).toBeCalledWith(
      useCasePayload.replyId,
      useCasePayload.owner
    );
    expect(mockReplyRepository.deleteReply).toBeCalledWith(useCasePayload.replyId);
  });
});
