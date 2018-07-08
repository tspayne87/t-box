import 'reflect-metadata';
import * as Sequelize from 'sequelize';

export function Column(options?: Sequelize.DefineAttributeColumnOptions) {
    let finalOptions: Sequelize.DefineAttributeColumnOptions = options || { type: Sequelize.TEXT };
    return (target: any, property: string) => {
        const Ctor = target.constructor;
        Ctor.__columns__ = Ctor.__columns__ || {};
        var type = Reflect.getMetadata('design:type', target, property);
        switch(type) {
            case String:
                finalOptions.type = Sequelize.STRING;
                break;
            case Number:
                finalOptions.type = Sequelize.NUMBER;
                break;
            case Boolean:
                finalOptions.type = Sequelize.BOOLEAN;
                break;
            case Date:
                finalOptions.type = Sequelize.DATE;
                break;
        }
        if (Ctor.__columns__[property] === undefined) {
            Ctor.__columns__[property] = finalOptions;
        } else {
            Ctor.__columns__[property] = Object.assign(Ctor.__columns__[property], finalOptions);
        }
    }
}