const ReplyDetail = require('../ReplyDetail');

describe('ReplyDetail entities', () => {
  it('should be throw error when payload did not contain needed property', () => {
    // Arrange
    const payload = {};

    // Action & Assert
    expect(() => new ReplyDetail(payload)).toThrowError('REPLY_DETAIL.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should be throw error when payload did not meet data type specification', () => {
    // Arrange
    const payload = {
      id: 1234,
      content: 'balasan komentar',
      date: '2025-12-06T17:36:18.982Z',
      username: 1234,
    };

    // Action & Assert
    expect(() => new ReplyDetail(payload)).toThrowError(
      'REPLY_DETAIL.NOT_MEET_DATA_TYPE_SPECIFICATION'
    );
  });

  it('should create ReplyDetail object correctly', () => {
    // Arrange
    const payload = {
      id: 'reply-123',
      content: 'balasan komentar',
      date: '2025-12-06T17:36:18.982Z',
      username: 'johndoe',
    };

    // Action
    const replyDetail = new ReplyDetail(payload);

    // Assert
    expect(replyDetail).toBeInstanceOf(ReplyDetail);
    expect(replyDetail.id).toEqual(payload.id);
    expect(replyDetail.content).toEqual(payload.content);
    expect(replyDetail.date).toEqual(payload.date);
    expect(replyDetail.username).toEqual(payload.username);
  });
});
