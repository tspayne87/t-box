import { ILogger } from './ILogger';

export class ConsoleLogger implements ILogger {
    public log(message: string) {
        this.sendMessage(message, 'log');
    }

    public info(message: string) {
        this.sendMessage(message, 'info');
    }

    public error(message: string) {
        this.sendMessage(message, 'error');
    }

    private sendMessage(message: string, type: string) {
        console.log(message);
    }
}