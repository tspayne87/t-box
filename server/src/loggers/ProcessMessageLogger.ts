import { ILogger } from './ILogger';

export class ProcessMessageLogger implements ILogger {
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
        if (process.send !== undefined) {
            process.send({ message, type });
        }
    }
}