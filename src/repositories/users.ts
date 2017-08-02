import User from '../models/user';
import * as Errors from '../errors';

export default class UsersRepository {
    users : Array<User>;

    constructor(users: Array<User>) {
        this.users = users;
    }

    getUsers() : Array<User> {
        return this.users;
    }

    getUser(name : string) : User {
        const user = this.users.find((_user) => {
            return _user.username === name;
        });

        if (user === undefined) { throw new Errors.NoUserFound(); }

        return user;
    }
}
