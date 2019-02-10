0.3.0 / 2019-02-10
===================

  * Breaking Change: Rename 'bind' to 'bootstrap' on Application object
  * Breaking Change: Removed Dependency from Application constructor
  * Breaking Change: Application constructor arguments changed see [Application](https://github.com/tspayne87/t-box/blob/master/modules/server/docs/application.md)
  * Breaking Change: Removed properties from controller (_routes, _formFields, _formFiles, _req), these can be access as scoped services explained below
  * Added ServiceHandler that will alter the dependency object for the server
  * Added in scoped dependencies that will be created per request instead of being a singlton
  * Added ServerRequestWrapper to handle the req object coming from the server
  * Added ServerResponseWrapper to handle the res object coming from the server
  * Added FileContainer to handle files found through formidable
  * Added IServiceHandler to handle the flow for bootstrapping the server with injectables
  * Added Injectable decorator that should be used for classes added into the dependency object
  * Changed controllers are now no longer singletons to handle scoping instead, use Injectables to create singletons
  * Removed 'mmmagic' to reduce dependencies, however file types will be less precise without it

0.2.5 / 2019-02-06
===================

  * Fixing an issue where the asset result would error out and not find anything

0.2.4 / 2019-02-04
===================

  * Updating the location path structure instead of using the error stack

0.2.3 / 2019-02-04
===================

  * Added in Request object to controllers so they can communicate with middleware

0.2.2 / 2019-02-04
===================

  * Added in next functionality to middleware

0.2.1 / 2019-02-04
===================

  * Added in middleware functionality

0.2.0 / 2019-01-24
===================

  * Breaking Change: Renamed 'Server' to 'Application'
  * Converted internal server to be used as a callback function instead of housing the server internally
  * Added in ability to use both http and http2 node modules
  * Updated docs to show how the app should be used