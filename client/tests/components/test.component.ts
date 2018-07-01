import Vue from 'vue';
import { ComponentRoute } from '../../src';

@ComponentRoute({
    route: {
        path: '/test'
    }
})
export default class TestComponent extends Vue {

}