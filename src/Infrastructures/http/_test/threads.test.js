const pool = require('../../database/postgres/pool');
const container = require('../../container');
const createServer = require('../createServer');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const AuthenticationsTableTestHelper = require('../../../../tests/AuthenticationsTableTestHelper');
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const RepliesTableTestHelper = require('../../../../tests/RepliesTableTestHelper');

describe('/threads endpooint', () => {
  afterAll(async () => {
    await pool.end();
  });

  afterEach(async () => {
    await RepliesTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
    await AuthenticationsTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await CommentsTableTestHelper.cleanTable();
  });

  describe('when POST /threads', () => {
    it('should response 401 when requester not authenticated', async () => {
      // Arrange
      const requestPayload = {
        title: 'judul thread',
        body: 'isi thread',
      };
      const server = await createServer(container);

      // Action
      const response = await server.inject({
        method: 'POST',
        url: '/threads',
        payload: requestPayload,
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(401);
      expect(responseJson.error).toEqual('Unauthorized');
      expect(responseJson.message).toEqual('Missing authentication');
    });

    it('should response 400 when request payload not contain needed property', async () => {
      // Arrange
      const requestPayload = {
        title: 'judul thread',
      };
      const server = await createServer(container);

      /* Add user */
      await server.inject({
        method: 'POST',
        url: '/users',
        payload: {
          username: 'dicoding',
          password: 'secret',
          fullname: 'Dicoding Indonesia',
        },
      });

      /* Login to get access token */
      const loginResponse = await server.inject({
        method: 'POST',
        url: '/authentications',
        payload: {
          username: 'dicoding',
          password: 'secret',
        },
      });
      const {
        data: { accessToken },
      } = JSON.parse(loginResponse.payload);

      // Action
      const response = await server.inject({
        method: 'POST',
        url: '/threads',
        payload: requestPayload,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(400);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual(
        'tidak dapat membuat thread karena properti yang dibutuhkan tidak ada'
      );
    });

    it('should response 400 when request payload not meet data type specification', async () => {
      // Arrange
      const requestPayload = {
        title: 123,
        body: 'isi thread',
      };
      const server = await createServer(container);

      /* Add user */
      await server.inject({
        method: 'POST',
        url: '/users',
        payload: {
          username: 'dicoding',
          password: 'secret',
          fullname: 'Dicoding Indonesia',
        },
      });

      /* Login to get access token */
      const loginResponse = await server.inject({
        method: 'POST',
        url: '/authentications',
        payload: {
          username: 'dicoding',
          password: 'secret',
        },
      });
      const {
        data: { accessToken },
      } = JSON.parse(loginResponse.payload);

      // Action
      const response = await server.inject({
        method: 'POST',
        url: '/threads',
        payload: requestPayload,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(400);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual(
        'tidak dapat membuat thread karena tipe data tidak sesuai'
      );
    });

    it('should response 201 and persisted thread', async () => {
      // Arrange
      const requestPayload = {
        title: 'judul thread',
        body: 'isi thread',
      };
      const server = await createServer(container);

      /* Add user */
      const addUserResponse = await server.inject({
        method: 'POST',
        url: '/users',
        payload: {
          username: 'dicoding',
          password: 'secret',
          fullname: 'Dicoding Indonesia',
        },
      });
      const {
        data: {
          addedUser: { id: userId },
        },
      } = JSON.parse(addUserResponse.payload);

      /* Login to get access token */
      const loginResponse = await server.inject({
        method: 'POST',
        url: '/authentications',
        payload: {
          username: 'dicoding',
          password: 'secret',
        },
      });
      const {
        data: { accessToken },
      } = JSON.parse(loginResponse.payload);

      // Action
      const response = await server.inject({
        method: 'POST',
        url: '/threads',
        payload: requestPayload,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(201);
      expect(responseJson.status).toEqual('success');
      expect(responseJson.data.addedThread).toBeDefined();
      expect(responseJson.data.addedThread.id).toBeDefined();
      expect(responseJson.data.addedThread.title).toEqual(requestPayload.title);
      expect(responseJson.data.addedThread.owner).toEqual(userId);
    });
  });

  describe('when GET /threads/{threadId}', () => {
    it('should response 404 when thread not found', async () => {
      // Arrange
      const server = await createServer(container);

      // Action
      const response = await server.inject({
        method: 'GET',
        url: '/threads/thread-xxx',
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(404);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('thread tidak ditemukan');
    });

    it('should response 200 and return thread detail with comments and replies', async () => {
      // Arrange
      const server = await createServer(container);
      await UsersTableTestHelper.addUser({ id: 'user-123', username: 'dicoding' });
      await UsersTableTestHelper.addUser({ id: 'user-456', username: 'alice' });
      await ThreadsTableTestHelper.addThread({
        id: 'thread-123',
        owner: 'user-123',
        title: 'judul thread',
        body: 'isi thread',
        date: '2025-12-06T07:22:33.555Z',
      });
      await CommentsTableTestHelper.addComment({
        id: 'comment-001',
        threadId: 'thread-123',
        owner: 'user-123',
        date: '2025-12-06T07:23:33.555Z',
        content: 'komentar pertama',
      });
      await CommentsTableTestHelper.addComment({
        id: 'comment-002',
        threadId: 'thread-123',
        owner: 'user-123',
        date: '2025-12-06T07:24:33.555Z',
        content: 'komentar dihapus',
        isDelete: true,
      });
      await RepliesTableTestHelper.addReply({
        id: 'reply-001',
        commentId: 'comment-001',
        owner: 'user-456',
        content: 'balasan yang dihapus',
        date: '2025-12-06T07:25:33.555Z',
        isDelete: true,
      });
      await RepliesTableTestHelper.addReply({
        id: 'reply-002',
        commentId: 'comment-001',
        owner: 'user-123',
        content: 'balasan kedua',
        date: '2025-12-06T07:26:33.555Z',
      });

      // Action
      const response = await server.inject({
        method: 'GET',
        url: '/threads/thread-123',
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(200);
      expect(responseJson.status).toEqual('success');
      const { thread } = responseJson.data;
      expect(thread.id).toEqual('thread-123');
      expect(thread.title).toEqual('judul thread');
      expect(thread.body).toEqual('isi thread');
      expect(thread.username).toEqual('dicoding');
      expect(thread.comments).toHaveLength(2);
      const expectedComment1 = {
        id: 'comment-001',
        username: 'dicoding',
        date: '2025-12-06T07:23:33.555Z',
        content: 'komentar pertama',
        likeCount: 0,
        replies: [
          {
            id: 'reply-001',
            content: '**balasan telah dihapus**',
            date: '2025-12-06T07:25:33.555Z',
            username: 'alice',
            comment_id: 'comment-001',
            is_delete: true,
          },
          {
            id: 'reply-002',
            content: 'balasan kedua',
            date: '2025-12-06T07:26:33.555Z',
            username: 'dicoding',
            comment_id: 'comment-001',
            is_delete: false,
          },
        ],
      };
      expect(thread.comments[0]).toStrictEqual(expectedComment1);

      /** second comment, deleted */
      const expectedComment2 = {
        id: 'comment-002',
        username: 'dicoding',
        date: '2025-12-06T07:24:33.555Z',
        content: '**komentar telah dihapus**',
        likeCount: 0,
        replies: [],
      };
      expect(thread.comments[1]).toStrictEqual(expectedComment2);
    });
  });
});
