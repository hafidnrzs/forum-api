const pool = require('../../database/postgres/pool');
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const RepliesTableTestHelper = require('../../../../tests/RepliesTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const ReplyRepositoryPostgres = require('../ReplyRepositoryPostgres');
const AddedReply = require('../../../Domains/replies/entities/AddedReply');
const NotFoundError = require('../../../Commons/exceptions/NotFoundError');
const AuthorizationError = require('../../../Commons/exceptions/AuthorizationError');

describe('ReplyRepositoryPostgres', () => {
  const fakeIdGenerator = () => '123';

  beforeEach(async () => {
    await UsersTableTestHelper.addUser({
      id: 'user-123',
      username: 'dicoding',
    });
    await ThreadsTableTestHelper.addThread({
      id: 'thread-123',
      owner: 'user-123',
    });
    await CommentsTableTestHelper.addComment({
      id: 'comment-123',
      threadId: 'thread-123',
      owner: 'user-123',
    });
  });

  afterEach(async () => {
    await RepliesTableTestHelper.cleanTable();
    await CommentsTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await pool.end();
  });

  it('addReply persists and return AddedReply', async () => {
    // Arrange
    const replyRepository = new ReplyRepositoryPostgres(pool, fakeIdGenerator);
    const newReply = { content: 'sebuah balasan komentar' };

    const addedReply = await replyRepository.addReply(newReply, 'comment-123', 'user-123');

    // Action
    const replies = await RepliesTableTestHelper.findReplyById('reply-123');

    // Assert
    expect(addedReply).toStrictEqual(
      new AddedReply({
        id: 'reply-123',
        content: newReply.content,
        owner: 'user-123',
      })
    );
    expect(replies).toHaveLength(1);
  });

  it('verifyReplyExists throws NotFoundError when missing', async () => {
    // Arrange
    const replyRepository = new ReplyRepositoryPostgres(pool, fakeIdGenerator);

    // Action & Assert
    await expect(replyRepository.verifyReplyExists('reply-404')).rejects.toThrow(NotFoundError);
  });

  it('verifyReplyExists does not throw when reply exists', async () => {
    // Arrange
    const replyRepository = new ReplyRepositoryPostgres(pool, fakeIdGenerator);

    // Action & Assert
    await RepliesTableTestHelper.addReply({ id: 'reply-123', commentId: 'comment-123' });

    await expect(replyRepository.verifyReplyExists('reply-123')).resolves.not.toThrow();
  });

  it('verifyReplyOwner throws NotFoundError when missing', async () => {
    // Arrange
    const replyRepository = new ReplyRepositoryPostgres(pool, fakeIdGenerator);

    // Action & Assert
    await expect(replyRepository.verifyReplyOwner('reply-404', 'user-123')).rejects.toThrow(
      NotFoundError
    );
  });

  it('verifyReplyOwner throws AuthorizationError when owner mismatch', async () => {
    // Arrange
    const replyRepository = new ReplyRepositoryPostgres(pool, fakeIdGenerator);

    /** add another user for owner mismatch test */
    await UsersTableTestHelper.addUser({ id: 'user-abc', username: 'otheruser' });

    // Action
    await RepliesTableTestHelper.addReply({
      id: 'reply-123',
      owner: 'user-abc',
      commentId: 'comment-123',
    });

    // Assert
    await expect(replyRepository.verifyReplyOwner('reply-123', 'user-123')).rejects.toThrow(
      AuthorizationError
    );
  });

  it('verifyReplyOwner does not throw when owner matches', async () => {
    // Arrange
    const replyRepository = new ReplyRepositoryPostgres(pool, fakeIdGenerator);

    // Action
    await RepliesTableTestHelper.addReply({
      id: 'reply-123',
      owner: 'user-123',
      commentId: 'comment-123',
    });

    // Assert
    await expect(replyRepository.verifyReplyOwner('reply-123', 'user-123')).resolves.not.toThrow();
  });

  it('deleteReply sets is_delete true (soft delete)', async () => {
    // Arrange
    const replyRepository = new ReplyRepositoryPostgres(pool, fakeIdGenerator);
    await RepliesTableTestHelper.addReply({ id: 'reply-123', commentId: 'comment-123' });

    // Action
    await replyRepository.deleteReply('reply-123');
    const rows = await RepliesTableTestHelper.findReplyById('reply-123');

    // Assert
    expect(rows[0].is_delete).toBe(true);
  });

  it('getRepliesByCommentIds returns mapped ReplyDetail sorted ascending', async () => {
    // Arrange
    const replyRepository = new ReplyRepositoryPostgres(pool, fakeIdGenerator);
    await RepliesTableTestHelper.addReply({
      id: 'reply-1',
      date: '2025-12-07T01:29:00.000Z',
      commentId: 'comment-123',
    });
    await RepliesTableTestHelper.addReply({
      id: 'reply-2',
      date: '2025-12-07T02:30:00.000Z',
      commentId: 'comment-123',
      isDelete: true,
    });

    // Action
    const result = await replyRepository.getRepliesByCommentIds(['comment-123']);

    // Assert
    expect(result).toHaveLength(2);
    expect(result[0].id).toBe('reply-1');
    expect(result[1].id).toBe('reply-2');
  });

  it('getRepliesByCommentIds returns empty array when commentIds is empty', async () => {
    // Arrange
    const replyRepository = new ReplyRepositoryPostgres(pool, fakeIdGenerator);

    // Action
    const result = await replyRepository.getRepliesByCommentIds([]);

    // Assert
    expect(result).toEqual([]);
  });

  it('getRepliesByCommentIds returns empty array when no replies exist for commentIds', async () => {
    // Arrange
    const replyRepository = new ReplyRepositoryPostgres(pool, fakeIdGenerator);

    // Action
    const result = await replyRepository.getRepliesByCommentIds(['comment-123', 'comment-456']);

    // Assert
    expect(result).toEqual([]);
  });

  it('getRepliesByCommentIds handles multiple commentIds correctly', async () => {
    // Arrange
    const replyRepository = new ReplyRepositoryPostgres(pool, fakeIdGenerator);

    /** add another comment to simulate multiple comment IDs */
    await CommentsTableTestHelper.addComment({
      id: 'comment-456',
      threadId: 'thread-123',
      owner: 'user-123',
    });

    await RepliesTableTestHelper.addReply({
      id: 'reply-1',
      date: '2025-12-07T01:00:00.000Z',
      commentId: 'comment-123',
    });
    await RepliesTableTestHelper.addReply({
      id: 'reply-2',
      date: '2025-12-07T02:00:00.000Z',
      commentId: 'comment-456',
    });

    // Action
    const result = await replyRepository.getRepliesByCommentIds(['comment-123', 'comment-456']);

    // Assert
    expect(result).toHaveLength(2);
    /** verify that replies from both comments are returned */
    const replyIds = result.map((r) => r.id);
    expect(replyIds).toContain('reply-1');
    expect(replyIds).toContain('reply-2');
    /** verify correct order (sorted by date) */
    expect(result[0].id).toBe('reply-1');
    expect(result[1].id).toBe('reply-2');
  });
});
