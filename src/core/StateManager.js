export class StateManager {
    constructor() {
        this.state = {
            currentMode: 'normal',       // 預設正常(跟隨)模式
            currentImage: '8b374a4f-90c3-46eb-843d-6b4aa15c9706.jpg', // 💡 初始小人不要了，直接照著跟隨樣式
            isUserUploaded: false,       
            stats: {
                totalClicks: 0
            }
        };
        this.listeners = [];
    }

    getState() {
        return this.state;
    }

    setState(newState) {
        this.state = { ...this.state, ...newState };
        this.notify();
    }

    updateStats(key, value) {
        this.state.stats[key] = value;
        this.notify();
    }

    subscribe(listener) {
        this.listeners.push(listener);
        return () => {
            this.listeners = this.listeners.filter(l => l !== listener);
        };
    }

    notify() {
        this.listeners.forEach(listener => listener(this.state));
    }
}