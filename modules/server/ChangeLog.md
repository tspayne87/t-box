0.4.3 / 2020-01-20
===================
  * Modify: Moving express to a dev dependency

0.4.2 / 2019-08-03
===================
  * Added: Put: Decorator to add more variety for RESTfull API's
  * Added: Patch: Decorator to add more variety for RESTfull API's

0.4.2 / 2019-08-03
===================

  * Breaking Change: Named route parameters have been replaced with parameter index based control, this was changed due to not a good way around Uglifying a file and it loosing its reference.
  * Breaking Change: Query parameters and Body automatic injectors are now longer allowed due to uglifying the files.
  * Added: Query: Decorator added to help getting data from the query since argument names do not work with uglifying.

0.4.1 / 2019-07-31
===================

  * Bug Fix: Fixing case on files.

0.4.0 / 2019-07-29
===================

  * Bug Fix: Fixed bug to deal with issues around dependencies

0.3.9 / 2019-03-16
===================

  * Bug Fix: Fixed bug that was causing some routes to not go to the correct routes based on parameters.

0.3.8 / 2019-03-05
===================

  * Changed IServiceHandler to allow for promises in the 'addServices' method.

0.3.7 / 2019-03-05
===================

  * Added: Application added new method unbind to allow for unbinding from a node server.

0.3.6 / 2019-03-05
===================

  * Breaking Change: Assets are not located in the individual modules where the controllers lie, they are now located in their own folder that can be configured in the server.
  * Breaking Change: Removed registerStaticFolders method from the application and moved it into the configuration object passed into the application's contructor.
  * Breaking Change: Removed uploadDir property from the application and moved it into the configuration object passed into the application's constructor.
  * Added: Configuration object to application to configure static location, upload directory, current working directory and asset directory.
  * Added: Optional fullPath argument to AssetResult to allow for full path configuration for the asset result.
  * Added: Extra parameter into the processResponse method on the results so that the server can push in its configuration so that the asset result can figure out where the asset folder is.

0.3.5 / 2019-02-27
===================

  * Adding the Redirect result as well as redirect method on the controller.

0.3.4 / 2019-02-21
===================

  * Breaking Change: Renaming 'createBeforeDecorator' to 'createBeforeActionDecorator'
  * Changed the before action decorator to include injection by changing the callback function to a class
  * Added BeforeAction class to help with creating before action decorators

0.3.3 / 2019-02-21
===================

  * Exposing the status enum to be used on result objects
  * Added in 'createBeforeDecorator' to create custom attributes that will be called before the route
  * Changed server to handle the before attribute callbacks
  * Changed the internal logic of how routes are saved on an object moving from attaching to constructor to reflection

0.3.2 / 2019-02-10
===================

  * Updating process arguments to new up the type instead of just calling the function

0.3.1 / 2019-02-10
===================

  * Updating README

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