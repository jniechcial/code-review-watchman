import * as IDataAdapter from './data-adapter';
import User from './models/user';
import PullRequest from './models/pull-request';
import UsersRepository from './repositories/users';

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

    getUsers(): Promise<UsersRepository> {
        return this.fetchData().then((data) => {
            const users: UsersRepository = this.generateUsersRepository(data);

            return Promise.resolve(users);
        });
    }

    private generateUsersRepository(data : Array<any>) : UsersRepository {
        const _users : { [username: string] : User } = {};

        data.forEach((pullRequest) => {
            const prInstance : PullRequest = new PullRequest(pullRequest.id, pullRequest.url, pullRequest.reviews);

            const user = _users[pullRequest.user.login] || new User(pullRequest.user.login);
            user.pullRequestsSubmitted.push(prInstance);
            _users[user.username] = user;

            prInstance.reviews.forEach((review : any) => {
                if (review.state === 'PENDING') { return; }

                const user = _users[review.username] || new User(review.username);
                user.pullRequestsReviewed.push(prInstance);
                _users[user.username] = user;
            });
        });

        return new UsersRepository(Object.keys(_users).map((key) => _users[key]));
    }
}
