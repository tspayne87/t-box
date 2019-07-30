/**
 * Interface to handle the logger service that is sent into the server.  This should handle logging, errors and info.
 */
export interface ILogger {
    /**
     * Method is meant to handle a log type message.
     * 
     * @param message The message that needs to be logged.
     */
    log(message: string);

    /**
     * Method is meant to handle what happens to an error message.
     * 
     * @param message The message that needs to be errored out.
     */
    error(message: string);

    /**
     * Method is meant to handle what happens to an info message.
     * 
     * @param message The message that needs to be sent out as an info.
     */
    info(message: string);
}