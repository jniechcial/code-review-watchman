export default class PullRequestReview {
    username : string;
    state : string;

    constructor(data : any) {
        this.username = data.user.login;
        this.state = data.state;
    }
}
