const CommentRepository = require('../../../Domains/comments/CommentRepository');
const CommentDetail = require('../../../Domains/threads/entities/CommentDetail');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const ThreadDetail = require('../../../Domains/threads/entities/ThreadDetail');
const NotFoundError = require('../../../Commons/exceptions/NotFoundError');
const GetThreadDetailUseCase = require('../GetThreadDetailUseCase');
const ReplyRepository = require('../../../Domains/replies/ReplyRepository');

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
        replies: [],
      }),
      new CommentDetail({
        id: 'comment-456',
        username: 'dicoding',
        date: '2021-08-08T07:26:21.338Z',
        content: 'comment has been deleted',
        is_delete: true,
        replies: [],
      }),
    ];

    const expectedThreadDetail = new ThreadDetail({
      ...threadPayload,
      comments: commentsPayload.map((comment) => ({
        ...comment,
        replies: [],
      })),
    });

    /** creating dependency of use case */
    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();
    const mockReplyRepository = new ReplyRepository();

    /** mocking needed function */
    mockThreadRepository.getThreadById = jest.fn().mockResolvedValue(threadPayload);
    // .mockImplementation(() => Promise.resolve(threadPayload));
    mockCommentRepository.getCommentsByThreadId = jest.fn().mockResolvedValue(commentsPayload);
    // .mockImplementation(() => Promise.resolve(commentsPayload));
    mockReplyRepository.getRepliesByCommentIds = jest.fn().mockResolvedValue([]);

    /** creating use case instance */
    const getThreadDetailUseCase = new GetThreadDetailUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
      replyRepository: mockReplyRepository,
    });

    // Action
    const threadDetail = await getThreadDetailUseCase.execute(threadId);

    // Assert
    expect(mockThreadRepository.getThreadById).toBeCalledWith(threadId);
    expect(mockCommentRepository.getCommentsByThreadId).toBeCalledWith(threadId);
    expect(mockReplyRepository.getRepliesByCommentIds).toBeCalledWith([
      'comment-123',
      'comment-456',
    ]);
    expect(threadDetail).toStrictEqual(expectedThreadDetail);
  });

  it('should throw NotFoundError when thread does not exist', async () => {
    // Arrange
    const threadId = 'thread-not-found';

    /** creating dependency of use case */
    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();
    const mockReplyRepository = new ReplyRepository();

    /** mocking needed function */
    mockThreadRepository.getThreadById = jest
      .fn()
      .mockImplementation(() => Promise.reject(new NotFoundError('thread tidak ditemukan')));
    mockCommentRepository.getCommentsByThreadId = jest.fn();

    /** creating use case instance */
    const getThreadDetailUseCase = new GetThreadDetailUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
      replyRepository: mockReplyRepository,
    });

    // Action & Assert
    await expect(getThreadDetailUseCase.execute(threadId)).rejects.toThrow(NotFoundError);
    expect(mockCommentRepository.getCommentsByThreadId).not.toBeCalled();
  });

  it('should include replies in thread detail with deleted content masked', async () => {
    // Arrange
    const threadPayload = {
      id: 'thread-123',
      title: 'sebuah thread',
      body: 'isi dari thread',
      date: '2025-12-07T07:19:09.775Z',
      username: 'dicoding',
    };

    const commentsPayload = [
      new CommentDetail({
        id: 'comment-123',
        username: 'johndoe',
        date: '2025-12-06T22:33:09.555Z',
        content: 'sebuah comment',
        is_delete: false,
      }),
      new CommentDetail({
        id: 'comment-456',
        username: 'dicoding',
        date: '2025-12-07T07:26:09.555Z',
        content: '**komentar telah dihapus**',
        is_delete: true,
      }),
    ];

    /** mock replies data */
    const repliesPayload = [
      {
        id: 'reply-123',
        content: 'sebuah balasan komentar',
        date: '2025-12-07T08:00:00.000Z',
        username: 'alice',
        comment_id: 'comment-123',
        is_delete: false,
      },
      {
        id: 'reply-456',
        content: 'balasan yang dihapus',
        date: '2025-12-07T08:05:00.000Z',
        username: 'bob',
        comment_id: 'comment-123',
        is_delete: true,
      },
      {
        id: 'reply-789',
        content: 'balasan lainnya',
        date: '2025-12-07T08:10:00.000Z',
        username: 'charlie',
        comment_id: 'comment-456',
        is_delete: false,
      },
    ];

    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();
    const mockReplyRepository = new ReplyRepository();

    /** mocking needed function */
    mockThreadRepository.getThreadById = jest.fn().mockResolvedValue(threadPayload);
    mockCommentRepository.getCommentsByThreadId = jest.fn().mockResolvedValue(commentsPayload);
    mockReplyRepository.getRepliesByCommentIds = jest.fn().mockResolvedValue(repliesPayload);

    /** create use case instance */
    const useCase = new GetThreadDetailUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
      replyRepository: mockReplyRepository,
    });

    // Action
    const threadDetail = await useCase.execute(threadPayload.id);

    // Assert
    expect(mockThreadRepository.getThreadById).toBeCalledWith(threadPayload.id);
    expect(mockCommentRepository.getCommentsByThreadId).toBeCalledWith(threadPayload.id);
    expect(mockReplyRepository.getRepliesByCommentIds).toBeCalledWith([
      'comment-123',
      'comment-456',
    ]);

    /** verify first comment has 2 replies (one masked soft deleted) */
    expect(threadDetail.comments[0].replies).toHaveLength(2);
    expect(threadDetail.comments[0].replies[0]).toEqual({
      id: 'reply-123',
      username: 'alice',
      date: '2025-12-07T08:00:00.000Z',
      content: 'sebuah balasan komentar',
    });
    expect(threadDetail.comments[0].replies[1]).toEqual({
      id: 'reply-456',
      username: 'bob',
      content: '**balasan telah dihapus**',
      date: '2025-12-07T08:05:00.000Z',
    });

    /** verify second comment has 1 reply */
    expect(threadDetail.comments[1].replies).toHaveLength(1);
    expect(threadDetail.comments[1].replies[0].id).toBe('reply-789');

    /** verify replies are sorted descending by date */
    const firstCommentDates = threadDetail.comments[0].replies.map((r) => r.date);
    expect(firstCommentDates).toEqual([...firstCommentDates].sort());
  });
});
