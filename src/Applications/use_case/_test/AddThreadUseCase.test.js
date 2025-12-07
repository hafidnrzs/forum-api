const AddedThread = require('../../../Domains/threads/entities/AddedThread');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const AddThreadUseCase = require('../AddThreadUseCase');

describe('AddThreadUseCase', () => {
  /**
   * Menguji apakah use case mampu mengorkestrasikan langkah membuat thread dengan benar
   */
  it('should orchestrating the add thread action correctly', async () => {
    // Arrange
    const useCasePayload = {
      title: 'judul thread',
      body: 'isi thread',
    };

    const owner = 'user-123';

    const expectedAddedThread = new AddedThread({
      id: 'thread-123',
      title: useCasePayload.title,
      owner,
    });

    // create dependency of use case
    const mockThreadRepository = new ThreadRepository();

    // mock needed function
    mockThreadRepository.addThread = jest.fn().mockImplementation(() =>
      Promise.resolve(
        new AddedThread({
          id: 'thread-123',
          title: useCasePayload.title,
          owner,
        })
      )
    );

    // create use case instance
    const addThreadUseCase = new AddThreadUseCase({
      threadRepository: mockThreadRepository,
    });

    // Action
    const addedThread = await addThreadUseCase.execute(useCasePayload, owner);

    // Assert
    expect(addedThread).toStrictEqual(expectedAddedThread);
    expect(mockThreadRepository.addThread).toBeCalledWith({
      title: useCasePayload.title,
      body: useCasePayload.body,
      owner,
    });
  });

  it('should throw error when payload not contain needed property', async () => {
    // Arrange
    const useCasePayload = {
      title: 'judul thread',
    };
    const owner = 'user-123';

    const mockThreadRepository = new ThreadRepository();
    const addThreadUseCase = new AddThreadUseCase({ threadRepository: mockThreadRepository });

    // Action & Assert
    await expect(addThreadUseCase.execute(useCasePayload, owner)).rejects.toThrowError(
      'THREAD.NOT_CONTAIN_NEEDED_PROPERTY'
    );
  });

  it('should throw error when payload not meet data type specification', async () => {
    // Arrange
    const useCasePayload = {
      title: 'judul thread',
      body: 123,
    };
    const owner = 'user-123';

    const mockThreadRepository = new ThreadRepository();
    const addThreadUseCase = new AddThreadUseCase({ threadRepository: mockThreadRepository });

    // Action & Assert
    await expect(addThreadUseCase.execute(useCasePayload, owner)).rejects.toThrowError(
      'THREAD.NOT_MEET_DATA_TYPE_SPECIFICATION'
    );
  });
});
