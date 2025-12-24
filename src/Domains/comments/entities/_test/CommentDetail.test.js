const CommentDetail = require('../CommentDetail');

describe('CommentDetail entities', () => {
  it('should throw error when payload not contain needed property', () => {
    // Arrange
    const payload = {
      id: 'comment-123',
      username: 'user-123',
    };

    // Action & Assert
    expect(() => new CommentDetail(payload)).toThrowError(
      'COMMENT_DETAIL.NOT_CONTAIN_NEEDED_PROPERTY'
    );
  });

  it('should throw error when payload not meet data type specification', () => {
    // Arrange
    const payload = {
      id: 1234,
      username: 'user-123',
      date: '2025-12-06T07:22:33.555Z',
      content: 'sebuah komentar',
      likeCount: undefined,
    };

    // Action & Assert
    expect(() => new CommentDetail(payload)).toThrowError(
      'COMMENT_DETAIL.NOT_MEET_DATA_TYPE_SPECIFICATION'
    );
  });

  it('should throw error when replies is not an array', () => {
    // Arrange
    const payload = {
      id: 'comment-123',
      username: 'user-123',
      date: '2025-12-06T07:22:33.555Z',
      content: 'sebuah komentar',
      replies: 'bukan array',
    };

    // Action & Assert
    expect(() => new CommentDetail(payload)).toThrowError(
      'COMMENT_DETAIL.NOT_MEET_DATA_TYPE_SPECIFICATION'
    );
  });

  it('should create CommentDetail entities correctly', () => {
    // Arrange
    const payload = {
      id: 'comment-123',
      username: 'user-123',
      date: '2025-12-06T07:22:33.555Z',
      likeCount: 0,
      content: 'sebuah komentar',
    };

    // Action
    const commentDetail = new CommentDetail(payload);

    // Assert
    expect(commentDetail).toBeInstanceOf(CommentDetail);
    expect(commentDetail.id).toEqual(payload.id);
    expect(commentDetail.username).toEqual(payload.username);
    expect(commentDetail.date).toEqual(payload.date);
    expect(commentDetail.likeCount).toEqual(payload.likeCount);
    expect(commentDetail.content).toEqual(payload.content);
  });

  it('should handle deleted comment with default likeCount', () => {
    // Arrange
    const payload = {
      id: 'comment-123',
      username: 'user-123',
      date: '2025-12-06T07:22:33.555Z',
      content: 'sebuah komentar',
      is_delete: true,
    };

    // Action
    const commentDetail = new CommentDetail(payload);

    // Assert
    expect(commentDetail.content).toEqual('**komentar telah dihapus**');
    expect(commentDetail.likeCount).toEqual(0);
  });
});
