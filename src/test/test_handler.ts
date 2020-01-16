import Chirit from '../chirit.js';

export default async function() {
    const handler = new Chirit.Handler(() => true);

    const resultInitial = await handler.invoke();
    console.log(resultInitial);

    handler.defaultChangedCallback = (handler) => {
        console.log(handler);
    };

    handler.beforeAddCallback = (type, handler) => {
        console.log(type, handler);
    };

    handler.afterAddCallback = (type, handler) => {
        console.log(type, handler);
    };

    handler.beforeRemoveCallback = (type, handler) => {
        console.log(type, handler);
    };

    handler.afterRemoveCallback = (type, handler) => {
        console.log(type, handler);
    };

    handler
    .setDefault(() => false)
    .resetDefault()
    .setDefault((data) => data);

    const resultDefault = await handler.invoke({dummy: true});
    console.log(resultDefault);

    const dummyHandler = () => false;

    handler
    .add('A', (_data, type) => {
        return {
            type: type,
            first: true
        };
    })
    .add('A', () => {
        return {
            first: false,
            second: true
        };
    })
    .add('B', dummyHandler);

    const resultA = await handler.invoke({dummy: true}, 'A');
    console.log(resultA);

    const resultB = await handler.invoke({dummy: true}, 'B');
    console.log(resultB);

    console.log(handler.remove('B', dummyHandler).has('B'));

    const resultB2 = await handler.invoke({dummy: true}, 'B');
    console.log(resultB2);

}
