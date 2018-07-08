<template lang='pug'>
    a(href='mailto:tspayne87@gmail.com') tspayne87@gmail.com
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

