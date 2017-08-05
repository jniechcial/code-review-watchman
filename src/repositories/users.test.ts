import UsersRepository from './users';
import User from '../models/user';
import { NoUserFound } from '../errors';

const user = new User('test1');

describe('UsersRepository', () => {
    it('#getUser returns user by particular username', async () => {
        const usersRepository = new UsersRepository([user]);
        expect(usersRepository.getUser('test1')).toEqual(user);
    });

    it('#getUser throws NoUserError when no user is found for particular username', async () => {
        const usersRepository = new UsersRepository([]);
        expect(() => {
            usersRepository.getUser('test1')
        }).toThrowError(NoUserFound);
    });
});
