const CommentRepository = require('../../../Domains/comments/CommentRepository');
const AddedReply = require('../../../Domains/replies/entities/AddedReply');
const NewReply = require('../../../Domains/replies/entities/NewReply');
const ReplyRepository = require('../../../Domains/replies/ReplyRepository');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const AddReplyUseCase = require('../AddReplyUseCase');

describe('AddReplyUseCase', () => {
  it('should orchestrate add reply correctly', async () => {
    // Arrange
    const useCasePayload = { content: 'sebuah balasan komentar' };
    const threadId = 'thread-123';
    const commentId = 'comment-123';
    const owner = 'user-123';

    const expected = {
      id: 'reply-123',
      content: 'sebuah balasan komentar',
      owner,
    };

    const mockReplyRepository = new ReplyRepository();
    const mockCommentRepository = new CommentRepository();
    const mockThreadRepository = new ThreadRepository();

    /** mock needed function */
    mockThreadRepository.checkThreadAvailability = jest.fn().mockResolvedValue();
    mockCommentRepository.checkCommentAvailability = jest.fn().mockResolvedValue();
    mockReplyRepository.addReply = jest.fn().mockResolvedValue(new AddedReply(expected));

    /** create use case instance */
    const addReplyUseCase = new AddReplyUseCase({
      replyRepository: mockReplyRepository,
      commentRepository: mockCommentRepository,
      threadRepository: mockThreadRepository,
    });

    // Action
    const result = await addReplyUseCase.execute(useCasePayload, threadId, commentId, owner);

    // Assert
    expect(mockThreadRepository.checkThreadAvailability).toBeCalledWith(threadId);
    expect(mockCommentRepository.checkCommentAvailability).toBeCalledWith(commentId);
    expect(mockReplyRepository.addReply).toBeCalledWith(
      new NewReply(useCasePayload),
      commentId,
      owner
    );
    expect(result).toStrictEqual(new AddedReply(expected));
  });
});
