import 'reflect-metadata';
import * as Sequelize from 'sequelize';
import { addModelProperty } from '../util';

export const COLUMN: string = 'so:db:columns';

export function Column(options?: Sequelize.DefineAttributeColumnOptions) {
    let finalOptions: Sequelize.DefineAttributeColumnOptions = options || { type: Sequelize.TEXT };
    return (target: any, property: string) => {
        addModelProperty(target, property);
        if (options === undefined) {
            let type = Reflect.getMetadata('design:type', target, property);
            switch (type) {
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
        }

        // Set into reflection
        Reflect.defineMetadata(COLUMN, finalOptions, target, property);
    };
}