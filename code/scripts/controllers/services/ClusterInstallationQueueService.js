

export default class ClusterInstallationQueueService{

    static queue = [];

    static constructor() {
    }

    static add(cluster){
        console.log('queue : ', this.queue);
        if (!this.queue.includes(cluster))
        {
            console.log('add cluster to queue : ', cluster);
            this.queue.push(cluster);
        }
    }

    static canAdd(cluster){
        console.log('queue : ', this.queue);
        return !this.queue.includes(cluster);
    }

    static evict(cluster){
        if (this.queue.includes(cluster))
        {
            console.log('cluster evicted from queue : ', cluster);
            this.queue.splice(this.queue.indexOf(cluster),1);
            console.log(this.queue);
        }
    }

}
