import { User, Address, Todo } from './models';

export const testAddress = new Address();
testAddress.line1 = '1234 Test Lane';
testAddress.city = 'Tester';
testAddress.state = 'State';
testAddress.zip = '098765';

export const testUser = new User();
testUser.username = 'test-user';
testUser.addresses = [testAddress];

export const testTodo = new Todo();
testTodo.action = 'Testing Todo';
testTodo.inProgress = true;
testTodo.completed = false;

export const testTodos: Todo[] = [];
for (let i = 0; i < 10; ++i) {
    let item = new Todo();
    item.action = `todo ${i}`;
    item.inProgress = i % 2 === 0;
    item.completed = false;

    testTodos.push(item);
}
