import { Fields } from 'formidable';
import { FileContainer } from '../internal/uploadFile';

/**
 * Form model that will handle the object that stores the fields and files for formidable.
 */
export interface IFormModel {
    /**
     * The fields from the post requests.
     */
    body: Fields;
    /**
     * The files from the post requests.
     */
    files: FileContainer;
}