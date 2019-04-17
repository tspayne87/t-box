import { Field, Schema, Model } from '../../src';
import { User } from './user';

@Schema('todo')
export class Todo extends Model {
    @Field()
    public action: string = '';

    @Field()
    public inProgress: boolean = false;

    @Field()
    public completed: boolean = false;

    @Field()
    public user!: User;
}
