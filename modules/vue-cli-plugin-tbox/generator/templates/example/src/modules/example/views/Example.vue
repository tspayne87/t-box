<template>
  <div>
    This is a basic Example for integrating with Vue.js
    <br />
    <pre>{{parseGetRequest}}</pre>
    <br />
    <pre>{{parsePostRequest}}</pre>
    <br />
    <hello-world />
  </div>
</template>

<script lang="ts">
  import { Component, Vue } from 'vue-property-decorator';
  import HelloWorld from '../components/HelloWorld.vue';
  import axios from 'axios';

  @Component({
    name: 'example',
    components: { HelloWorld }
  })
  export default class ExampleComponent extends Vue {
    public getRequest: Record<string, string> = {};
    public postRequest: Record<string, string> = {};

    public get parseGetRequest(): string { return JSON.stringify(this.getRequest, null, 2); }
    public get parsePostRequest(): string { return JSON.stringify(this.postRequest, null, 2); }

    public async mounted() {
      this.getRequest = (await axios.get('/api/example/1')).data;
      this.postRequest = (await axios.post('/api/example', { name: 'Post Data', value: 'Example Data' })).data;
    }
  }
</script>
