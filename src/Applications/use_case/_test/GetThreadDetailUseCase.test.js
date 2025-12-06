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
      }),
    ];

    const repliesPayload = [
      {
        id: 'reply-123',
        content: 'sebuah balasan',
        date: '2021-08-08T08:00:00.000Z',
        username: 'alice',
        comment_id: 'comment-123',
        is_delete: false,
      },
    ];

    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();
    const mockReplyRepository = new ReplyRepository();

    mockThreadRepository.getThreadById = jest.fn().mockResolvedValue(threadPayload);
    mockCommentRepository.getCommentsByThreadId = jest.fn().mockResolvedValue(commentsPayload);
    mockReplyRepository.getRepliesByCommentIds = jest.fn().mockResolvedValue(repliesPayload);

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
    expect(mockReplyRepository.getRepliesByCommentIds).toBeCalledWith(['comment-123']);
    expect(threadDetail).toBeInstanceOf(ThreadDetail);
    expect(threadDetail.id).toEqual(threadId);
    expect(threadDetail.comments).toHaveLength(1);
    expect(threadDetail.comments[0].replies).toHaveLength(1);
    expect(threadDetail.comments[0].replies[0].content).toEqual('sebuah balasan');
  });

  it('should throw NotFoundError when thread does not exist', async () => {
    // Arrange
    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();
    const mockReplyRepository = new ReplyRepository();

    mockThreadRepository.getThreadById = jest
      .fn()
      .mockRejectedValue(new NotFoundError('thread tidak ditemukan'));

    const getThreadDetailUseCase = new GetThreadDetailUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
      replyRepository: mockReplyRepository,
    });

    // Action & Assert
    await expect(getThreadDetailUseCase.execute('thread-xxx')).rejects.toThrow(NotFoundError);
  });

  it('should mask deleted reply content correctly', async () => {
    // Arrange
    const threadPayload = {
      id: 'thread-123',
      title: 'sebuah thread',
      body: 'isi thread',
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
    ];

    const repliesPayload = [
      {
        id: 'reply-123',
        content: 'balasan aktif',
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
    ];

    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();
    const mockReplyRepository = new ReplyRepository();

    mockThreadRepository.getThreadById = jest.fn().mockResolvedValue(threadPayload);
    mockCommentRepository.getCommentsByThreadId = jest.fn().mockResolvedValue(commentsPayload);
    mockReplyRepository.getRepliesByCommentIds = jest.fn().mockResolvedValue(repliesPayload);

    const useCase = new GetThreadDetailUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
      replyRepository: mockReplyRepository,
    });

    // Action
    const threadDetail = await useCase.execute(threadPayload.id);

    // Assert
    expect(threadDetail.comments[0].replies).toHaveLength(2);
    expect(threadDetail.comments[0].replies[0].content).toEqual('balasan aktif');
    expect(threadDetail.comments[0].replies[1].content).toEqual('**balasan telah dihapus**');
  });

  it('should return empty replies array when comment has no replies', async () => {
    // Arrange
    const threadPayload = {
      id: 'thread-123',
      title: 'sebuah thread',
      body: 'isi thread',
      date: '2025-12-07T07:19:09.775Z',
      username: 'dicoding',
    };

    const commentsPayload = [
      new CommentDetail({
        id: 'comment-123',
        username: 'johndoe',
        date: '2025-12-06T22:33:09.555Z',
        content: 'comment with replies',
        is_delete: false,
      }),
      new CommentDetail({
        id: 'comment-456',
        username: 'jane',
        date: '2025-12-07T07:26:09.555Z',
        content: 'comment without replies',
        is_delete: false,
      }),
    ];

    const repliesPayload = [
      {
        id: 'reply-123',
        content: 'reply to first comment',
        date: '2025-12-07T08:00:00.000Z',
        username: 'alice',
        comment_id: 'comment-123',
        is_delete: false,
      },
    ];

    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();
    const mockReplyRepository = new ReplyRepository();

    mockThreadRepository.getThreadById = jest.fn().mockResolvedValue(threadPayload);
    mockCommentRepository.getCommentsByThreadId = jest.fn().mockResolvedValue(commentsPayload);
    mockReplyRepository.getRepliesByCommentIds = jest.fn().mockResolvedValue(repliesPayload);

    const useCase = new GetThreadDetailUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
      replyRepository: mockReplyRepository,
    });

    // Action
    const threadDetail = await useCase.execute(threadPayload.id);

    // Assert
    expect(threadDetail.comments[0].replies).toHaveLength(1);
    expect(threadDetail.comments[1].replies).toEqual([]);
  });

  it('should sort replies by date in ascending order', async () => {
    // Arrange
    const threadPayload = {
      id: 'thread-123',
      title: 'sebuah thread',
      body: 'isi thread',
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
    ];

    const repliesPayload = [
      {
        id: 'reply-3',
        content: 'third',
        date: '2025-12-07T08:30:00.000Z',
        username: 'charlie',
        comment_id: 'comment-123',
        is_delete: false,
      },
      {
        id: 'reply-1',
        content: 'first',
        date: '2025-12-07T08:00:00.000Z',
        username: 'alice',
        comment_id: 'comment-123',
        is_delete: false,
      },
      {
        id: 'reply-2',
        content: 'second',
        date: '2025-12-07T08:15:00.000Z',
        username: 'bob',
        comment_id: 'comment-123',
        is_delete: false,
      },
    ];

    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();
    const mockReplyRepository = new ReplyRepository();

    mockThreadRepository.getThreadById = jest.fn().mockResolvedValue(threadPayload);
    mockCommentRepository.getCommentsByThreadId = jest.fn().mockResolvedValue(commentsPayload);
    mockReplyRepository.getRepliesByCommentIds = jest.fn().mockResolvedValue(repliesPayload);

    const useCase = new GetThreadDetailUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
      replyRepository: mockReplyRepository,
    });

    // Action
    const threadDetail = await useCase.execute(threadPayload.id);

    // Assert
    expect(threadDetail.comments[0].replies[0].id).toBe('reply-1');
    expect(threadDetail.comments[0].replies[1].id).toBe('reply-2');
    expect(threadDetail.comments[0].replies[2].id).toBe('reply-3');
  });
});
