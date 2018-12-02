export interface IAddress {
    line1: string;
    city: string;
    state: string;
    zip: string;
}

export interface IPerson {
    firstName: string;
    lastName: string;
    birthday: Date;
    gender: string;
    isDeleted: boolean;
    age: number;

    address: IAddress;
}

export interface IPost {
    authorId: number;
    status: string;
}