import { User } from '../models/user.model';
import { Service } from '../../src';

export class UserService extends Service<User> {
    protected _model = User;
}