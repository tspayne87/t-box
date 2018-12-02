import { Fields } from 'formidable';
import { UploadedFiles } from './UploadFile';

export interface IFormModel {
    fields: Fields;
    files: UploadedFiles;
}