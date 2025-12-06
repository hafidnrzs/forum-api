const ThreadDetail = require('../ThreadDetail');

describe('ThreadDetail entities', () => {
  it('should throw error when payload not contain needed property', () => {
    // Arrange
    const payload = {
      id: 'thread-123',
      title: 'judul thread',
      body: 'isi thread',
    };

    // Action & Assert
    expect(() => new ThreadDetail(payload)).toThrowError(
      'THREAD_DETAIL.NOT_CONTAIN_NEEDED_PROPERTY'
    );
  });

  it('should throw error when payload not meet data type specification', () => {
    // Arrange
    const payload = {
      id: 1234,
      title: 'judul thread',
      body: 'isi thread',
      date: '2025-12-06T07:22:33.555Z',
      username: 'user-123',
      comments: {
        id: 'comment-123',
        username: 'user-123',
        date: '2022-12-06T07:22:33.555Z',
        content: 'sebuah komentar',
      },
    };

    // Action & Assert
    expect(() => new ThreadDetail(payload)).toThrowError(
      'THREAD_DETAIL.NOT_MEET_DATA_TYPE_SPECIFICATION'
    );
  });

  it('should create ThreadDetail entities correctly', () => {
    // Arrange
    const payload = {
      id: 'thread-123',
      title: 'judul thread',
      body: 'isi thread',
      date: '2025-12-06T07:22:33.555Z',
      username: 'user-123',
      comments: [
        {
          id: 'comment-123',
          username: 'user-123',
          date: '2025-12-06T07:22:33.555Z',
          content: 'sebuah komentar',
        },
      ],
    };

    // Action
    const threadDetail = new ThreadDetail(payload);

    // Assert
    expect(threadDetail).toBeInstanceOf(ThreadDetail);
    expect(threadDetail.id).toEqual(payload.id);
    expect(threadDetail.title).toEqual(payload.title);
    expect(threadDetail.body).toEqual(payload.body);
    expect(threadDetail.date).toEqual(payload.date);
    expect(threadDetail.username).toEqual(payload.username);
    expect(threadDetail.comments).toEqual(payload.comments);
  });
});
