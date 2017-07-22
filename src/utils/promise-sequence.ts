export default function sequence(tasks : Array<any>, results : Array<any>) : Promise<any> {
    if (tasks.length === 0) {
        return Promise.resolve(results);
    }
    const currentTask = tasks.shift();
    return currentTask().then((item : any) => {
        results.push(item);
        return sequence(tasks, results);
    })
}
