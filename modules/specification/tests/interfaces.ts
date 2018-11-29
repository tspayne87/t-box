export interface IPerson {
    firstName: string;
    lastName: string;
    birthday: Date;
    gender: string;
    isDeleted: boolean;
}

export interface IPost {
    authorId: number;
    status: string;
}