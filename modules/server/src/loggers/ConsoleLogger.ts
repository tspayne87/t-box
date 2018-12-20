import { ILogger } from './ILogger';

/**
 * Basic console logger.
 */
export class ConsoleLogger implements ILogger {
    /**
     * Method is meant to handle a log type message.
     * 
     * @param message The message that needs to be logged to the console.
     */
    public log(message: string) {
        this.sendMessage(message, 'log');
    }

    /**
     * Method is meant to handle what happens to an info message.
     * 
     * @param message The message that needs to be logged to the console.
     */
    public info(message: string) {
        this.sendMessage(message, 'info');
    }

    /**
     * Method is meant to handle what happens to an error message.
     * 
     * @param message The message that needs to be logged to the console.
     */
    public error(message: string) {
        this.sendMessage(message, 'error');
    }

    /**
     * Helper method is meant to centeralize the messages to the console.
     * 
     * @param message The message that should be logged to the console.
     * @param type The type of message that we are dealing with.
     */
    private sendMessage(message: string, type: string) {
        console[type](message);
    }
}