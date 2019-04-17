import { Service, ModelService } from '../../src';
import { User } from '../models';

@Service(User)
export class UserService extends ModelService<User> {
}
