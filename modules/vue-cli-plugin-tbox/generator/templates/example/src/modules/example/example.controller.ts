import { Controller, Route, Get, Post, Body } from '@t-box/server';

@Route('api/example')
export class ExampleController extends Controller {
  @Get('{0}')
  public exampleData(id: number) {
    return {
      name: 'Example Data',
      query: id
    };
  }

  @Post()
  public examplePost(@Body data: { name: string; value: string }) {
    return {
      name: 'Example Data',
      data
    };
  }
}
