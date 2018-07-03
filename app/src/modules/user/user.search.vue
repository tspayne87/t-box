<template lang='pug'>
    div Why are there X's Joe
</template>

<script lang='ts'>
    import Vue from 'vue';
    import { ComponentRoute } from '@square-one/client';

    @ComponentRoute({
        route: {
            path: '/user'
        }
    })
    export default class UserSearch extends Vue {
        public mounted() {
            console.log('Why are there X\'s Joe');
        }
    }
</script>

