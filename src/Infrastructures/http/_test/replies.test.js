const pool = require('../../database/postgres/pool');
const container = require('../../container');
const createServer = require('../createServer');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const RepliesTableTestHelper = require('../../../../tests/RepliesTableTestHelper');
const AuthenticationsTableTestHelper = require('../../../../tests/AuthenticationsTableTestHelper');

describe('/threads/{threadId}/comments/{commentId}/replies endpoint', () => {
  afterAll(async () => {
    await pool.end();
  });

  afterEach(async () => {
    await RepliesTableTestHelper.cleanTable();
    await CommentsTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
    await AuthenticationsTableTestHelper.cleanTable();
  });

  describe('when POST /threads/{threadId}/comments/{commentId}/replies', () => {
    it('should respond 201 when post reply succeeds', async () => {
      // Arrange
      const server = await createServer(container);
      const requestPayload = { content: 'sebuah balasan' };

      /** create user & login */
      await server.inject({
        method: 'POST',
        url: '/users',
        payload: { username: 'dicoding', password: 'secret', fullname: 'Dicoding' },
      });

      const loginResponse = await server.inject({
        method: 'POST',
        url: '/authentications',
        payload: { username: 'dicoding', password: 'secret' },
      });
      const {
        data: { accessToken },
      } = JSON.parse(loginResponse.payload);

      /** populate thread & comment */
      const addThreadResponse = await server.inject({
        method: 'POST',
        url: '/threads',
        payload: { title: 'judul thread', body: 'isi thread' },
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const {
        data: { addedThread },
      } = JSON.parse(addThreadResponse.payload);

      const addCommentResponse = await server.inject({
        method: 'POST',
        url: `/threads/${addedThread.id}/comments`,
        payload: { content: 'sebuah comment' },
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const {
        data: { addedComment },
      } = JSON.parse(addCommentResponse.payload);

      // Action
      const response = await server.inject({
        method: 'POST',
        url: `/threads/${addedThread.id}/comments/${addedComment.id}/replies`,
        payload: requestPayload,
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toBe(201);
      expect(responseJson.status).toBe('success');
      expect(responseJson.data.addedReply).toBeDefined();
      expect(responseJson.data.addedReply.id).toBeDefined();
      expect(responseJson.data.addedReply.content).toBe(requestPayload.content);
    });

    it('should respond 400 when payload invalid', async () => {
      // Arrange
      const server = await createServer(container);

      /** create user & login */
      await server.inject({
        method: 'POST',
        url: '/users',
        payload: { username: 'dicoding', password: 'secret', fullname: 'Dicoding' },
      });

      const loginResponse = await server.inject({
        method: 'POST',
        url: '/authentications',
        payload: { username: 'dicoding', password: 'secret' },
      });
      const {
        data: { accessToken },
      } = JSON.parse(loginResponse.payload);

      /** populate thread & comment */
      const addThreadResponse = await server.inject({
        method: 'POST',
        url: '/threads',
        payload: { title: 'judul thread', body: 'isi thread' },
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const {
        data: { addedThread },
      } = JSON.parse(addThreadResponse.payload);

      const addCommentResponse = await server.inject({
        method: 'POST',
        url: `/threads/${addedThread.id}/comments`,
        payload: { content: 'sebuah comment' },
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const {
        data: { addedComment },
      } = JSON.parse(addCommentResponse.payload);

      // Action
      const response = await server.inject({
        method: 'POST',
        url: `/threads/${addedThread.id}/comments/${addedComment.id}/replies`,
        payload: {},
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toBe(400);
      expect(responseJson.status).toBe('fail');
    });

    it('should respond 404 when comment not found', async () => {
      // Arrange
      const server = await createServer(container);

      /** create user & login */
      await server.inject({
        method: 'POST',
        url: '/users',
        payload: { username: 'dicoding', password: 'secret', fullname: 'Dicoding' },
      });

      const loginResponse = await server.inject({
        method: 'POST',
        url: '/authentications',
        payload: { username: 'dicoding', password: 'secret' },
      });
      const {
        data: { accessToken },
      } = JSON.parse(loginResponse.payload);

      /** populate thread & comment */
      const addThreadResponse = await server.inject({
        method: 'POST',
        url: '/threads',
        payload: { title: 'judul thread', body: 'isi thread' },
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const {
        data: { addedThread },
      } = JSON.parse(addThreadResponse.payload);

      // Action
      const response = await server.inject({
        method: 'POST',
        url: `/threads/${addedThread.id}/comments/comment-404/replies`,
        payload: { content: 'balasan' },
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      // Assert
      expect(response.statusCode).toBe(404);
    });
  });

  describe('when DELETE /threads/{threadId}/comments/{commentId}/replies/{replyId}', () => {
    it('should respond 200 when delete reply succeeds for owner', async () => {
      // Arrange
      const server = await createServer(container);

      /** create user & login */
      await server.inject({
        method: 'POST',
        url: '/users',
        payload: { username: 'dicoding', password: 'secret', fullname: 'Dicoding' },
      });

      const loginResponse = await server.inject({
        method: 'POST',
        url: '/authentications',
        payload: { username: 'dicoding', password: 'secret' },
      });
      const {
        data: { accessToken },
      } = JSON.parse(loginResponse.payload);

      /** populate thread, comment, and reply */
      const addThreadResponse = await server.inject({
        method: 'POST',
        url: '/threads',
        payload: { title: 'judul thread', body: 'isi thread' },
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const {
        data: { addedThread },
      } = JSON.parse(addThreadResponse.payload);

      const addCommentResponse = await server.inject({
        method: 'POST',
        url: `/threads/${addedThread.id}/comments`,
        payload: { content: 'sebuah comment' },
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const {
        data: { addedComment },
      } = JSON.parse(addCommentResponse.payload);

      const addReplyResponse = await server.inject({
        method: 'POST',
        url: `/threads/${addedThread.id}/comments/${addedComment.id}/replies`,
        payload: { content: 'sebuah balasan' },
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const {
        data: { addedReply },
      } = JSON.parse(addReplyResponse.payload);

      // Action
      const response = await server.inject({
        method: 'DELETE',
        url: `/threads/${addedThread.id}/comments/${addedComment.id}/replies/${addedReply.id}`,
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toBe(200);
      expect(responseJson.status).toBe('success');
    });

    it('should respond 403 when delete by non-owner', async () => {
      // Arrange
      const server = await createServer(container);

      /** create multiple user & login */
      await server.inject({
        method: 'POST',
        url: '/users',
        payload: { username: 'dicoding', password: 'secret', fullname: 'Dicoding' },
      });

      await server.inject({
        method: 'POST',
        url: '/users',
        payload: { username: 'other', password: 'secret', fullname: 'Other User' },
      });

      const loginResponse1 = await server.inject({
        method: 'POST',
        url: '/authentications',
        payload: { username: 'dicoding', password: 'secret' },
      });
      const {
        data: { accessToken: accessToken1 },
      } = JSON.parse(loginResponse1.payload);

      const loginResponse2 = await server.inject({
        method: 'POST',
        url: '/authentications',
        payload: { username: 'other', password: 'secret' },
      });
      const {
        data: { accessToken: accessToken2 },
      } = JSON.parse(loginResponse2.payload);

      /** populate thread, comment, and reply */
      const addThreadResponse = await server.inject({
        method: 'POST',
        url: '/threads',
        payload: { title: 'judul thread', body: 'isi thread' },
        headers: { Authorization: `Bearer ${accessToken1}` },
      });
      const {
        data: { addedThread },
      } = JSON.parse(addThreadResponse.payload);

      const addCommentResponse = await server.inject({
        method: 'POST',
        url: `/threads/${addedThread.id}/comments`,
        payload: { content: 'sebuah comment' },
        headers: { Authorization: `Bearer ${accessToken1}` },
      });
      const {
        data: { addedComment },
      } = JSON.parse(addCommentResponse.payload);

      const addReplyResponse = await server.inject({
        method: 'POST',
        url: `/threads/${addedThread.id}/comments/${addedComment.id}/replies`,
        payload: { content: 'sebuah balasan' },
        headers: { Authorization: `Bearer ${accessToken1}` },
      });
      const {
        data: { addedReply },
      } = JSON.parse(addReplyResponse.payload);

      // Action
      const response = await server.inject({
        method: 'DELETE',
        url: `/threads/${addedThread.id}/comments/${addedComment.id}/replies/${addedReply.id}`,
        headers: { Authorization: `Bearer ${accessToken2}` },
      });

      // Assert
      expect(response.statusCode).toBe(403);
    });

    it('should respond 404 when reply not found', async () => {
      // Arrange
      const server = await createServer(container);

      /** create user & login */
      await server.inject({
        method: 'POST',
        url: '/users',
        payload: { username: 'dicoding', password: 'secret', fullname: 'Dicoding' },
      });

      const loginResponse = await server.inject({
        method: 'POST',
        url: '/authentications',
        payload: { username: 'dicoding', password: 'secret' },
      });
      const {
        data: { accessToken },
      } = JSON.parse(loginResponse.payload);

      /** populate thread & comment */
      const addThreadResponse = await server.inject({
        method: 'POST',
        url: '/threads',
        payload: { title: 'judul thread', body: 'isi thread' },
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const {
        data: { addedThread },
      } = JSON.parse(addThreadResponse.payload);

      const addCommentResponse = await server.inject({
        method: 'POST',
        url: `/threads/${addedThread.id}/comments`,
        payload: { content: 'sebuah comment' },
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const {
        data: { addedComment },
      } = JSON.parse(addCommentResponse.payload);

      // Action
      const response = await server.inject({
        method: 'DELETE',
        url: `/threads/${addedThread.id}/comments/${addedComment.id}/replies/reply-404`,
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      // Assert
      expect(response.statusCode).toBe(404);
    });
  });
});
