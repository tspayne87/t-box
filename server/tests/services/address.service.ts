import { Address } from '../models/address.model';
import { Service } from '../../src';

export class AddressService extends Service<Address> {
    protected _model = Address;
}