import * as IDataAdapter from './data-adapter';
import User from './models/user';
import PullRequest from './models/pull-request';

export default class Watchman {
    private fromDate: Date;
    private endDate: Date;
    private dataAdapter: IDataAdapter.IDataAdapterInterface;
    private dataFetched: boolean;

    constructor(fromDate: Date, endDate: Date, dataAdapter: IDataAdapter.IDataAdapterInterface) {
        this.fromDate = fromDate;
        this.endDate = endDate;
        this.dataAdapter = dataAdapter;
        this.dataFetched = false;
    }

    private fetchData(): Promise<any> {
        return this.dataAdapter.fetchData(this.fromDate, this.endDate);
    }

    getUsers(): Promise<Array<User>> {
        return this.fetchData().then((data) => {
            const users: Array<User> = this.generateUsersRepository(data);

            return Promise.resolve(users);
        });
    }

    generateUsersRepository(data : Array<any>) : Array<User> {
        const _users : { [username: string] : User } = {};
        debugger;
        console.log(data[10]);

        data.forEach((pullRequest) => {
            const prInstance : PullRequest = new PullRequest(pullRequest.id, pullRequest.url);
            prInstance.url = pullRequest.url;
            const user = _users[pullRequest.user.login] || new User(pullRequest.user.login);
            user.pullRequestsSubmitted[pullRequest.id] = prInstance;
            _users[pullRequest.user.login] = user;
        });

        const users : Array<User> = Object.keys(_users).map((key) => _users[key]);

        return users;
    }
}
