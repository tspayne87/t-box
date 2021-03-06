/**
 * Enum that handles all the different HTTP requests that can be used in the system.
 */
export enum Method {
    Get, Post, Delete, Put, Patch
}

/**
 * Helper enum to normalize response codes for the server.
 */
export enum Status {
    Ok = 200,
    Redirect = 301,
    BadRequest = 400,
    Unauthorized = 401,
    InternalServerError = 500
}