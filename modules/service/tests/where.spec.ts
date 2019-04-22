// import { assert } from 'chai';
// import 'mocha';

// import { User, Address, Todo } from './models';
// import { ServerRepository } from '../src/server';
// import { UserService, TodoService } from './services';
// import { testUser, testTodo } from './customModels';

// describe('{Navigation}', function() {
//     let repository: ServerRepository;

//     before(function (done) {
//         repository = new ServerRepository();
//         repository.connect('mongodb://localhost:27017/tboxModelTest')
//             .then(() => {
//                 repository.addModel(User);
//                 repository.addModel(Todo);
//                 done();
//             }).catch((err) => done(err));
//     });

//     it('Create', (done) => {
//         let service = new UserService(repository);
//         service.save(testUser)
//             .then(result => {
//                 testTodo.user = result;

//                 let service = new TodoService(repository);
//                 service.save(testTodo)
//                     .then(() => done())
//                     .catch(err => done(err));
//             }).catch(err => done(err));
//     });

//     it('FindOne', (done) => {
//         let service = new TodoService(repository);
//         service.find()
//             .populate(x => x.user)
//             .toArray()
//             .then(results => {
//                 assert.equal(results.length, 1);

//                 let result = results[0];

//                 assert.equal(result instanceof Todo, true);

//                 assert.equal(testTodo.action, result.action);
//                 assert.equal(testTodo.inProgress, result.inProgress);
//                 assert.equal(testTodo.completed, result.completed);

//                 assert.notEqual(result.user, null);
//                 assert.equal(result.user instanceof User, true);

//                 assert.equal(testUser.username, result.user.username);

//                 assert.equal(result.user.addresses.length, 1);
//                 assert.equal(result.user.addresses[0] instanceof Address, true);

//                 assert.equal(testUser.addresses[0].line1, result.user.addresses[0].line1);
//                 assert.equal(testUser.addresses[0].city, result.user.addresses[0].city);
//                 assert.equal(testUser.addresses[0].state, result.user.addresses[0].state);
//                 assert.equal(testUser.addresses[0].zip, result.user.addresses[0].zip);

//                 done();
//             }).catch(err => done(err));
//     });

//     it('Remove', (done) => {
//         let service = new TodoService(repository);
//         service.find()
//             .first()
//             .then(result => {
//                 assert.notEqual(result, null);
//                 if (result !== null) {
//                     service.remove(result)
//                         .then(r => {
//                             assert.equal(r, true);

//                             let service = new UserService(repository);
//                             service.find()
//                                 .first()
//                                 .then(result => {
//                                     assert.notEqual(result, null);
//                                     if (result !== null) {
//                                         service.remove(result)
//                                             .then(r => {
//                                                 assert.equal(r, true);
//                                                 done();
//                                             }).catch(err => done(err));
//                                     } else {
//                                         done();
//                                     }
//                                 }).catch(err => done(err));
//                         }).catch(err => done(err));
//                 } else {
//                     done();
//                 }
//             }).catch(err => done(err));
//     });

//     after(function(done) {
//         repository.disconnect()
//             .then(x => done())
//             .catch(err => done(err));
//     });
// });
