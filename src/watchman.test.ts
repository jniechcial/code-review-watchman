import Watchman from './watchman';
import * as DataAdapter from './data-adapter';

const mockedData = [
    {
        id: '1',
        url: '/test/1',
        user: { login: 'test1' },
        reviews: [{
            user: { login: 'test2' },
            state: 'APPROVED',
        }],
    },
    {
        id: '1',
        url: '/test/1',
        user: { login: 'test2' },
        reviews: [{
            user: { login: 'test3' },
            state: 'APPROVED',
        }],
    },
];

class MockedDataAdapter implements DataAdapter.IDataAdapterInterface {
    spy: any;

    constructor(spy : any) {
        this.spy = spy;
    }

    fetchData(fromDate: Date, endDate: Date): Promise<any> {
        this.spy();
        return Promise.resolve(mockedData);
    }
}

describe('Watchman', () => {
    it('#getUsers creates users repository by fetching data from dataAdapter', async () => {
        const fetchDataSpy = jest.fn();

        const mockedDataAdapter = new MockedDataAdapter(fetchDataSpy);
        const watchman = new Watchman(new Date(), new Date(), mockedDataAdapter);
        watchman.getUsers().then((usersRepository) => {
            expect(fetchDataSpy).toHaveBeenCalled();
            expect(usersRepository.getUser('test1').username).toEqual('test1');
            expect(usersRepository.getUser('test2').username).toEqual('test2');
            expect(usersRepository.getUser('test1').pullRequestsReviewed.length).toEqual(0);
            expect(usersRepository.getUser('test1').pullRequestsSubmitted.length).toEqual(1);
        });
    });
});
