const CommentRepository = require('../../../Domains/comments/CommentRepository');
const CommentDetail = require('../../../Domains/threads/entities/CommentDetail');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const ThreadDetail = require('../../../Domains/threads/entities/ThreadDetail');
const NotFoundError = require('../../../Commons/exceptions/NotFoundError');
const GetThreadDetailUseCase = require('../GetThreadDetailUseCase');

describe('GetThreadDetailUseCase', () => {
  it('should orchestrate get thread detail action correctly', async () => {
    // Arrange
    const threadId = 'thread-123';

    const threadPayload = {
      id: threadId,
      title: 'sebuah thread',
      body: 'sebuah body thread',
      date: '2021-08-08T07:19:09.775Z',
      username: 'dicoding',
    };

    const commentsPayload = [
      new CommentDetail({
        id: 'comment-123',
        username: 'johndoe',
        date: '2021-08-08T07:22:33.555Z',
        content: 'sebuah comment',
        is_delete: false,
      }),
      new CommentDetail({
        id: 'comment-456',
        username: 'dicoding',
        date: '2021-08-08T07:26:21.338Z',
        content: 'comment has been deleted',
        is_delete: true,
      }),
    ];

    const expectedThreadDetail = new ThreadDetail({
      ...threadPayload,
      comments: commentsPayload,
    });

    /** creating dependency of use case */
    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();

    /** mocking needed function */
    mockThreadRepository.getThreadById = jest
      .fn()
      .mockImplementation(() => Promise.resolve(threadPayload));
    mockCommentRepository.getCommentsByThreadId = jest
      .fn()
      .mockImplementation(() => Promise.resolve(commentsPayload));

    /** creating use case instance */
    const getThreadDetailUseCase = new GetThreadDetailUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
    });

    // Action
    const threadDetail = await getThreadDetailUseCase.execute(threadId);

    // Assert
    expect(mockThreadRepository.getThreadById).toBeCalledWith(threadId);
    expect(mockCommentRepository.getCommentsByThreadId).toBeCalledWith(threadId);
    expect(threadDetail).toStrictEqual(expectedThreadDetail);
  });

  it('should throw NotFoundError when thread does not exist', async () => {
    // Arrange
    const threadId = 'thread-not-found';

    /** creating dependency of use case */
    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();

    /** mocking needed function */
    mockThreadRepository.getThreadById = jest
      .fn()
      .mockImplementation(() => Promise.reject(new NotFoundError('thread tidak ditemukan')));
    mockCommentRepository.getCommentsByThreadId = jest.fn();

    /** creating use case instance */
    const getThreadDetailUseCase = new GetThreadDetailUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
    });

    // Action & Assert
    await expect(getThreadDetailUseCase.execute(threadId)).rejects.toThrow(NotFoundError);
    expect(mockCommentRepository.getCommentsByThreadId).not.toBeCalled();
  });
});
