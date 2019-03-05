export interface IServerConfig {
    /**
     * The locations where the static resources are kept.
     */
    staticFolders?: string[];
    /**
     * The upload directory that should be used when uploading files from the client.
     */
    uploadDir?: string;
    /**
     * The asset directory that should be used to find assets in the application.
     */
    assetDir?: string;
    /**
     * This the current working directory that this server is running in.
     */
    cwd: string;
}