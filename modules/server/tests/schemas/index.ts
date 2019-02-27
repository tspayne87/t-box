import { Schema, Document } from 'mongoose';

export interface IUser extends Document {
    username: string;
    password: string;
}

export interface IRole extends Document {
    name: string;
    description: string;
}

export const User = new Schema<IUser>({
    username: String,
    password: String
});

export const Role = new Schema<IRole>({
    name: String,
    description: String
});