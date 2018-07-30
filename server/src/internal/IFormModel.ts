import { Fields, Files } from 'formidable';

export interface IFormModel {
    fields: Fields;
    files: Files;
}