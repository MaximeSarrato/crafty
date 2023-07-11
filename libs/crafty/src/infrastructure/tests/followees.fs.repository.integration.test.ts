import * as fs from 'fs';
import * as path from 'path';
import { FileSystemFolloweesRepository } from '../followees.fs.repository';

const testUserFolloweesPath = path.join(__dirname, './user-followees.json');

describe('FileSystemFolloweesRepository', () => {
  beforeEach(async () => {
    try {
      await fs.promises.writeFile(testUserFolloweesPath, JSON.stringify({}));
    } catch (error) {}
  });

  test('followUser() can save the followees of a user in the filesystem', async () => {
    const followeesRepository = new FileSystemFolloweesRepository(
      testUserFolloweesPath,
    );

    await fs.promises.writeFile(
      testUserFolloweesPath,
      JSON.stringify({ Alice: ['Bob'], Bob: ['Charlie'] }),
    );

    await followeesRepository.followUser({
      user: 'Alice',
      followee: 'Charlie',
    });

    const followeesData = await fs.promises.readFile(testUserFolloweesPath);
    const followeesJSON = JSON.parse(followeesData.toString());
    expect(followeesJSON).toEqual({
      Alice: ['Bob', 'Charlie'],
      Bob: ['Charlie'],
    });
  });

  test('followUser() can save the followees of a user in the filesystem when there was no followees before', async () => {
    const followeesRepository = new FileSystemFolloweesRepository(
      testUserFolloweesPath,
    );

    await fs.promises.writeFile(
      testUserFolloweesPath,
      JSON.stringify({ Alice: [], Bob: ['Charlie'] }),
    );

    await followeesRepository.followUser({
      user: 'Alice',
      followee: 'Charlie',
    });

    const followeesData = await fs.promises.readFile(testUserFolloweesPath);
    const followeesJSON = JSON.parse(followeesData.toString());
    expect(followeesJSON).toEqual({
      Alice: ['Charlie'],
      Bob: ['Charlie'],
    });
  });

  test('getFolloweesOf() can get the followees of a user from the filesystem', async () => {
    const followeesRepository = new FileSystemFolloweesRepository(
      testUserFolloweesPath,
    );

    await fs.promises.writeFile(
      testUserFolloweesPath,
      JSON.stringify({ Alice: ['Bob'], Bob: ['Charlie'] }),
    );

    const [aliceFollowees, bobFollowees] = await Promise.all([
      followeesRepository.getFolloweesOf('Alice'),
      followeesRepository.getFolloweesOf('Bob'),
    ]);

    expect(aliceFollowees).toEqual(['Bob']);
    expect(bobFollowees).toEqual(['Charlie']);
  });
});
