import { Application } from '@square-one/client';

let boot = async () => {
    let app = new Application();
    await app.registerComponents(require.context('./modules', true, /\.vue$/));
    app.boot();
};
boot();