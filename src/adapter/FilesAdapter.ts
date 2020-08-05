export interface FilesAdapter {
    /** Responsible for storing the file in order to be retrieved later by its filename
     *
     * @param {string} filename - the filename to save
     * @param {*} data - the buffer of data from the file
     * @param {string} contentType - the supposed contentType
     * @discussion the contentType can be undefined if the controller was not able to determine it
     * @param {object} options - (Optional) options to be passed to file adapter (S3 File Adapter Only)
     * - tags: object containing key value pairs that will be stored with file
     * - metadata: object containing key value pairs that will be sotred with file (https://docs.aws.amazon.com/AmazonS3/latest/user-guide/add-object-metadata.html)
     * @discussion options are not supported by all file adapters. Check the your adapter's documentation for compatibility
     *
     * @return {Promise} a promise that should fail if the storage didn't succeed
     */
    createFile(filename: string, data: Buffer, contentType: string, options: Object): Promise<string>

    /** Responsible for deleting the specified file
     *
     * @param {string} filename - the filename to delete
     *
     * @return {Promise} a promise that should fail if the deletion didn't succeed
     */
    deleteFile(filename: string): Promise<any>

    /** Responsible for retrieving the data of the specified file
     *
     * @param {string} filename - the name of file to retrieve
     *
     * @return {Promise} a promise that should pass with the file data or fail on error
     */
    getFileData(filename: string): Promise<any>

    /** Returns an absolute URL where the file can be accessed
     *
     * @param {string} filename
     *
     * @return {string} Absolute URL
     */
    getFileLocation(filename: string): Promise<string>;

    /** Handles Byte-Range Requests for Streaming
     *
     * @param {string} filename
     * @param {object} request
     * @param {object} response
     * @param {string} contentType
     *
     * @returns {Promise} Data for byte range
     */

    handleFileStream(filename: any, request: any, response: any, contentType: any): any;
    signedUrl(filename: string): Promise<string>;
    canHandleFileStream: boolean;
    isS3: boolean;

    /**
     * list all files available
     */
    listFiles(): Promise<any>;


    /** Responsible for retrieving metadata and tags
     *
     * @param {string} filename - the filename to retrieve metadata
     *
     * @return {Promise} a promise that should pass with metadata
     */
    // getMetadata(filename: string): Promise<any> {}

    validateFilename(filename: string): Promise<any>;
}
