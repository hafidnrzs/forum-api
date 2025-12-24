const CommentRepository = require('../../../Domains/comments/CommentRepository');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const LikeCommentUseCase = require('../LikeCommentUseCase');

describe('LikeCommentUseCase', () => {
  it('should orchestrate toggle like/unlike comment correctly', async () => {
    // Arrange
    const useCasePayload = {
      threadId: 'thread-123',
      commentId: 'comment-123',
      userId: 'user-123',
    };

    const mockCommentRepository = new CommentRepository();
    const mockThreadRepository = new ThreadRepository();

    mockThreadRepository.checkThreadAvailability = jest
      .fn()
      .mockImplementation(() => Promise.resolve());
    mockCommentRepository.checkCommentAvailability = jest
      .fn()
      .mockImplementation(() => Promise.resolve());
    mockCommentRepository.likeComment = jest.fn().mockImplementation(() => Promise.resolve());

    const likeCommentUseCase = new LikeCommentUseCase({
      commentRepository: mockCommentRepository,
      threadRepository: mockThreadRepository,
    });

    // Action
    await likeCommentUseCase.execute(useCasePayload);

    // Assert
    expect(mockThreadRepository.checkThreadAvailability).toBeCalledWith(useCasePayload.threadId);
    expect(mockCommentRepository.checkCommentAvailability).toBeCalledWith(useCasePayload.commentId);
    expect(mockCommentRepository.likeComment).toBeCalledWith(
      useCasePayload.commentId,
      useCasePayload.userId
    );
  });
});
