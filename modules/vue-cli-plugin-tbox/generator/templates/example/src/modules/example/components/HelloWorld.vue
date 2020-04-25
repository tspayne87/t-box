<template>
  <div>Hello From T-Box</div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';

@Component({ name: 'hello-world'})
export default class HelloWorldComponent extends Vue { }
</script>
