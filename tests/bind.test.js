import Container from '../src/Container';
import {string} from "../src/decorators/propertyDecorators";

class Test {
    @string
    name = '';
    constructor(name) {
        this.name = name;
    }
}

let container = Container.getInstance();
container.bind('test', Test);

let test1 = container.make('test', 'test');
let test2 = container.make('test', 'test');
try{
    test1.name = 1;
}catch (e) {
    console.log(e);
}

test('test1 not equal test2!', () => {
    expect(test1 === test2)
        .toEqual(false);
});

container.user = class User {
    constructor() {

    }
}

let user1 = container.user;
let user2 = container.user;
test('user1 not equal user2!', () => {
    expect(user1 === user2)
        .toEqual(false);
});
