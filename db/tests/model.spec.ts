import { assert } from 'chai';
import 'mocha';

import * as Sequelize from 'sequelize';

describe('/user', function() {

    const db = new Sequelize({
        dialect: 'mssql',
        dialectModulePath: 'sequelize-msnodesqlv8',
        dialectOptions: {
            connectionString: 'Driver={SQL Server Native Client 11.0};Server=TETHYS;Database=TestApp;Trusted_Connection=yes;'
        }
    });

    it('{GET}:/user', (done) => {
        const User = db.define<any, any>('user', {
            Username: Sequelize.STRING,
            Birthday: Sequelize.DATE
        });

        User.sync()
            .then(() => User.create({
                Username: 'Terry',
                Birthday: new Date(1987, 3, 27)
            }).then(terry => {
                done();
            }));
    });

    after(function(done) {
        db.close()
            .then(() => done());
    });
});