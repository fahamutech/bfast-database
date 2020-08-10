# BFast::Database Engine 2.x

Database as a service application to work with mongoDb as a primary and with any other database engine in future

## Abstract

This document raises some best ways to write a general purpose application and query language using JSON to allow clients to access data and manipulate data to database from the client side ( web, mobile or desktop ), from a single point HTTP endpoint

Joshua Mshana

![](RackMultipart20200810-4-vrkhbg_html_6a913d7dd8dad8cd.png)

## 1.0 Introduction

Backend application written to act upon a database to respond to user actions on the client side. Those services written exposed to RESTful API mostly and sometimes to remember all the endpoints of a service become a challenge.

Also we write an application on top of a database inorder to sanitize or validate data. We try to save and apply some validation to data to check if they pass some certain criteria and if a user is authorized to perform that activity.

The tool must account for those issues:

1. Single point to access data and if possible a single endpoint
2. Permissions and Authorization issues to check if agent permitted to perform that action
3. Power to embedded multiple CRUD operation in single request
4. Performing transactions

Since it uses a single point for entry point we need an expressive rule to explain CRUD operation. Expressive rule will be transferred as JSON from client to server and server will respond with the respective JSON

##


## 1.1 Configurations

**BFast::Database** must be initialized with some configuration to make it flexible to change it according to environment or requirements. The **BFast::Database** Adapter must look like this.

exportinterfaceBFastDatabaseAdapter {

start(config: DaaSConfig): Promise\&lt;boolean\&gt;;

stop(): Promise\&lt;boolean\&gt;;

}

exportinterfaceDaaSConfig {

port: number;

masterKey: string;

applicationId: string;

mountPath: string;

adapters: {

database: (config: DaaSConfig)=\&gt;DatabaseAdapter,

auth: (config: DaaSConfig)=\&gt;AuthAdapter,

}

}

And to Start it should be like this.

newBFastDatabase().start({

port:3000

}).then(\_=\&gt;console.log(&#39;server started at port 3000&#39;));

## 1.2 HTTP Endpoint

Server must listen to one endpoint by default is **/daas** , All Requests will be handled by **POST** http method. Each request must contain the following header. JSON is used for send and receive messages.

{

&quot;content-type&quot;:&quot;application/json&quot;

}

## 1.3 Errors

During checking and establishing a connection to start executing rules errors will return as normal HTTP response bodies. When any of the rules result in error that rule value will be null and its error as object will be included in the **errors** block of the returned data. For example when we create **User** and **Post** on the same request and **Post** fails this is the error.

{

&quot;createUser&quot;: {

&quot;id&quot;:&quot;89695uiu8&quot;,

&quot;createdAt&quot;: &quot;2020-02-01 67:89:12 GMT3+&quot;

},

&quot;errors&quot;: {

&quot;create.Post&quot;:{

&quot;message&quot;:&quot;Post not created because of duplication&quot;

}

}

}

##


## 2.0 CRUD Rules

Crud operation must be mapped to specific rules for the endpoint to understand and react to specific actions based on a rule.

## ,2.1 Common rules

  - Each table/domain/collection must have common attributes which are
    - **\_id: string** -\&gt; This must be mapped to **id.**
    - **\_created\_by: string** -\&gt; this mapped to **createdBy.** Which is the id of the user who created that entry to a Domain/Table/Collection.
    - **\_created\_at: Date** -\&gt; this must be mapped to **createdAt.**
    - **\_updated\_at: Date** -\&gt; this must be mapped to **updatedAt.**

user must see right hand fields while database must see left hand fields

  - JSON sent to the server from the client its root must be **{ }** and on top level fields can include the following.
    - **Token: string** -\&gt; which will be used for authorization operation to determine user permission if resource is protected

{

...

&quot;token&quot;: &quot;6547fjhfiyr8r&quot;

...

}

    - **applicationId: string** -\&gt; this is a mandatory field for every request

{

...&quot;applicationId&quot;:\&lt;your-application-id-used-to-start-a-server\&gt;

...

}

    - **masterKey: string** -\&gt; this is optional field

You can use this to override any rule and perform admin level activities

{

...

&quot;masterKey&quot;: &quot;654778757bjbo987t876fjhfiyr8r&quot;

...

}

**NOTE:** By default a server will not return all attributes when create, update or query but you can override that behavior by set **return: []** as its uses will be described in this document. **return** is a reserved keyword must not be used in as a field or a column in a data you want to save.

When a server successfully serves your request you specify in a rule the response will be available in nameSpace of your rule. Example **createUser** shall return **createUser** with your created User.

## 2.2 Create Domain/Table/Collection

To specify a create/save operation a JSON field must start with a word **create** then followed by a Domain/Table/Collection name to write data to e.g **createUser** means add new entry to domain/table/collection called **User** in database and data to save must be the value of **create${domain}** field. The word after **create** must be of any length and cases ideally but following CamelCase will be good for readable code. Examples of create operation will be as follows.

{

&quot;token&quot;: &quot;6547fjhfiyr8r&quot;,

&quot;createUser&quot;: {

&quot;name&quot;: &quot;John&quot;,

&quot;age&quot;: 30

}

}

**token** is optional. That rule means adding a new entry to the domain/table called **User** put **name=John** and **age=30**. Return **id** of created data.

{

&quot;createUser&quot;:{

&quot;id&quot;: &quot;6657jg878&quot;,

}

}

To add many products we just send arrays

{

&quot;token&quot;: &quot;6547fjhfiyr8r&quot;,

&quot;createUser&quot;: [

{

&quot;name&quot;: &quot;John&quot;,

&quot;age&quot;: 30

},

{

&quot;name&quot;: &quot;Doe&quot;,

&quot;age&quot;: 12,

&quot;h&quot;: 100

}

]

}

Response should be like.

{

&quot;createUser&quot;:[

{

&quot;id&quot;: &quot;6657jg878&quot;,

},

{

&quot;id&quot;: &quot;op65AWjg8&quot;,

}

]

}

In the **create** rule it returns **id** if you want more than one field to return you must specify those fields with the field **return** which is an array of extra fields you want to return. For example,

{

&quot;token&quot;: &quot;6547fjhfiyr8r&quot;,

&quot;createUser&quot;: {

&quot;name&quot;: &quot;John&quot;,

&quot;age&quot;: 30,

&quot;return&quot;: [&quot;age&quot;,&quot;name&quot;]

}

}

Now the server will respond with the extra field you specify.

{

&quot;createUser&quot;:{

&quot;id&quot;: &quot;6657jg878&quot;,

&quot;name&quot;: &quot;John&quot;,

&quot;age&quot;: 30,

}

}

If return is empty array like **return: []** server will return all data of that document

## 2.3 Read/Query Domain/Table/Collection

To get or query domain/table/collection a JSON field for that must start with a word **query** then followed by a Domain/Table/Collection name to query to e.g **queryUser** means find user(s) to domain/table/collection called **User** in database and format is **query${domain}**. The word after **query** must be of any length and cases ideally but following CamelCase will be good for readable code.

**query${domain}** rule block has a default field which you can use to shape your query. Those fields are as follows.

- **skip: number** -\&gt; specify data to skip, default is **0.**
- **size: number** -\&gt; specify number of data to return, default is **20.** If value is negative means you need all the documents to be returned
- **count: boolean** -\&gt; you can count the results of a query to return a number of documents if set to true default value is false.
- **orderBy: Array\&lt;{[field]:orderNumber}\&gt;** -\&gt; specify array of fields to order by. orderNumber can be 1 for ascending or -1 for descending. Field is the column we orderBy.
- **last: number** -\&gt; this will return the number of data you specify from last of results.
- **first: number** -\&gt; this will return the number of data you specify from the beginning of results.
- **filter: FilterModel** -\&gt; this is your query filter you send to server default is **{}** if not specified
- **return: Array\&lt;string\&gt;** -\&gt; if not specified default is **[]** and will return only **id.** Either you specify or not **id** return id data match your query found.
- **id: string** -\&gt; if this field present will ignore all other values except **return** and will return that specific data or **null** if not found

**\*NOTE\*** -\&gt; **FilterModel** needs more discussion to find a format of a query to be sent to the server.

Examples of query operation will be as follows.

### 2.3.1 Basic Query

Following example will return all users if exist or **[]** if no data exist, default return field is **id.** Since we do not specify any return fields

{

&quot;token&quot;: &quot;6547fjhfiyr8r&quot;,

&quot;queryUser&quot;: {}

}

Response from server will be like this:

{

&quot;queryUser&quot;: [

{

&quot;id&quot;:&quot;op65AWjg8&quot;

},

{

&quot;id&quot;:&quot;12sdAWj&quot;

}

]

}

### 2.3.2 Query By Id

{

&quot;token&quot;: &quot;6547fjhfiyr8r&quot;,

&quot;queryUser&quot;: {

&quot;id&quot;:&quot;op65AWjg8&quot;,

&quot;return&quot;:[&quot;name&quot;,&quot;age&quot;]

}

}

Response from the server will be as follows.

{

&quot;queryUser&quot;: {

&quot;id&quot;:&quot;op65AWjg8&quot;,

&quot;name&quot;: &quot;John&quot;,

&quot;age&quot;: 30

}

}

### 2.3.3 Query By Filter

{

&quot;queryUser&quot;: {

&quot;filter&quot;:{

&quot;name&quot;:&quot;John&quot;

},

&quot;return&quot;:[&quot;age&quot;]

}

}

Response from the server will be as follows.

{

&quot;queryUser&quot;: [

{

&quot;id&quot;:&quot;op65AWjg8&quot;,

&quot;age&quot;:30

}

]

}

### 2.3.4 Count

You can count the result of a query filter and return the total number of matched objects.

{

&quot;queryUser&quot;: {

&quot;filter&quot;:{

&quot;name&quot;:&quot;John&quot;

},

&quot;count&quot;: true

}

}

Response from server will be like the following

{

&quot;queryUser&quot;: 1

}

###


### 2.3.4 OrderBy

You can order your query result by using the **orderBy** field inside the queryrule which is an array of maps containing your fields you want to orderBy. The sort map looks like this **{ \&lt;field\&gt; : number },** number can be 1 for ascending and -1 for descending. See example below.

{

&quot;applicationId&quot;: &quot;daas&quot;,

&quot;queryProduct&quot;: {

&quot;filter&quot;: {},

&quot;orderBy&quot;: [{&quot;name&quot;: 1}],

&quot;return&quot;: [&quot;name&quot;]

}

}

Response will be an array of the product array by names in ascending order.

{

&quot;queryProduct&quot;: [

{&quot;name&quot;: &quot;apple&quot;, &quot;id&quot;: &quot;y756yh-iuisyu-er56fg&quot;}

]

}

## 2.4 Update Domain/Table/Collection

To specify a update/patch operation a JSON field must start with a word **update** then followed by a Domain/Table/Collection name to write data to e.g **updateUser** means update entry to domain/table/collection called **User** in database and data to update must be the value of **create${domain}** field in JSON you specify. The word after **update** must be of any length and cases ideally but following CamelCase will be good for readable code.

**update${domain}** rule block has a default field which you can use to shape your update. Those fields are as follows.

- **filter: FilterModel** -\&gt; update data that match the specified filter object
- **size: number** -\&gt; limit of number of data to search
- **skip: number** -\&gt; number of data to skip when search the match using filter
- **id: string** -\&gt; specify id of the data you want to update if this present **filter** field will be ignored
- **upsert: boolean** -\&gt; specify if data should be created if not present as a result of a filter, default is **false**
- **update: UpdateModel** -\&gt; add data you want to update, if not specified default is **{ }.** UpdateModel can contain operator to modify data like insert into a list of array or update a relation
- **return: Array\&lt;string\&gt;** -\&gt; specify additional fields to return default is **[]**. The operation will return **id** and **updatedAt** and with or without those fields you specify in the **return** field.

###


### 2.4.1 Update Many Documents Match Filter Query

This operation will update all the documents that match the given filter and will return all the update documents in array.

{

&quot;updateUser&quot;: {

&quot;filter&quot;:{

&quot;name&quot;:&quot;John&quot;

},

&quot;update&quot;: {

$set: {&quot;name&quot;: &quot;Josh&quot;}

},

&quot;return&quot;:[&quot;name&quot;]

}

}

Response from the server will be like the following.

{

&quot;updateUser&quot;:[

{

&quot;id&quot;: &quot;98675tgu&quot;,

&quot;updatedAt&quot;: &quot;2020-01-97 12:78:00 MT3+&quot;,

&quot;name&quot;: &quot;Josh&quot;

}

]

}

###


### 2.4.2 Update Single Document By Using Its Id

If you use **id** to update a document **filter** and **upsert** field if present will be ignored and if data with that **id** is not present will return not found error 404. Examples of update requests will be as follows.

{

&quot;updateUser&quot;: {

&quot;id&quot;:&quot;98675tgu&quot;,

&quot;update&quot;: {

$set: {&quot;name&quot;: &quot;Dzeko&quot;}

},

&quot;return&quot;:[]

}

}

Response from server will be as follows

{

&quot;ResultOfUpdateUser&quot;:{

&quot;id&quot;: &quot;98675tgu&quot;,

&quot;updatedAt&quot;: &quot;2020-01-97 12:78:00 MT3+&quot;,

&quot;name&quot;: &quot;Dzeko&quot;,

&quot;age&quot;: 30

}

}

##


## 2.5Delete Domain/Table/Collection

To specify a delete operation a JSON field must start with a word **delete** then followed by a Domain/Table/Collection name to delete data to e.g **deleteUser** means delete entry to domain/table/collection called **User** in database and information of entry to delete must be the value of **delete${domain}** field in JSON you specify. The word after **delete** must be of any length and cases ideally but following CamelCase will be good for readable code.

**delete${domain}** rule block has a default field which you can use to shape your delete operation. Those fields are as follows.

- **filter: FilterModel** -\&gt; delete data that match the specified filter object.
- **id: string** -\&gt; specify **id** of the data you want to delete, if this present **filter** field will be ignored.

Delete operation will return only the id of the deleted item ( s ). If delete operation fails will return with error code and message if you delete multiple documents and if a document is not deleted its id field will return null. Example of delete operation is as follows.

### 2.5.1 Delete Single Document By Id

{

&quot;deleteUser&quot;:{

&quot;id&quot;: &quot;98675tgu&quot;

}

}

When user is deleted the results will be the id of the delete user

{

&quot;deleteUser&quot;:{

&quot;id&quot;: &quot;98675tgu&quot;

}

}

### 2.5.2 Delete MultipleDocument

You can delete multiple data as follows.

{

&quot;applicationId&quot;:&quot;6878567gjh&quot;,

&quot;deleteUser&quot;:{

filter: {

&quot;age&quot;: 20

},

}

}

The response will be the array of ids of deleted documents or null if the document is not deleted.

{

&quot;deleteUser&quot;:[

{

&quot;id&quot;: &quot;98675tgu&quot;

}

]

}

## 3.0 Transactions

Database operations sometimes need to be transactional across multiple Domain/Table/Collection so an easy way to perform transactions is needed. Transaction can be performed by issuing the Transaction Block rule.

You specify the transaction block by **transaction** keyword and the body can contain many CRUD rule blocks as explained in section 2.

Transaction block has the following field which you put all operation you want to perform

- **commit** -\&gt; This contains all the operations needed for that transaction.

The result of the transaction will be a combination of individual CRUD operations.

Example of transaction operation is as follows.

{

&quot;applicationId&quot;:&quot;6878567gjh&quot;,

&quot;transaction&quot;:{

&quot;commit&quot;:{

&quot;createUser&quot;:{

&quot;name&quot;: &quot;Jody&quot;

},

&quot;createPayment&quot;:{

&quot;txid&quot;: 232353535

}

}

}

}

## 4.0 Authentication &amp; Permission Policy

Tool must provide a general authentication mechanism for grant access to users and authorization mechanism for resource consumption. Authentication use special domain name to store data which is **\_User** and Authorization it use **\_Policy**

## 4.1 Authentication

You use the **auth** rule block to add new users or get access to the system. **auth** rule block fields are as follows.

- **signUp: SignUpModel** -\&gt; use this field to register new users to the system.
- **signIn: SignInModel** -\&gt; use this field for already registered users to get a temporary token to access subsequences requests.
- **reset: string** -\&gt; use this to reset a user password using a user email.

### 4.1.1 Create New User

To create a new user to auth records records you must send the following JSON to server

{

&quot;applicationId&quot;:&quot;6878567gjh&quot;,

&quot;auth&quot;:{

&quot;signUp&quot;:{

&quot;email&quot;:&quot;eitah12@email.co&quot;,

&quot;username&quot;:&quot;eith12&quot;,

&quot;password&quot;:&quot;8697tgygyt78tuy&quot;,

&quot;fullName&quot;:&quot;8an 9o0&quot;

}

}

}

Response from the server will be as follows.

{

&quot;auth&quot;:{

&quot;signUp&quot;:{

&quot;email&quot;:&quot;eitah12@email.co&quot;,

&quot;id&quot;:&quot;eitah12968u&quot;,

&quot;username&quot;:&quot;eith12&quot;,

&quot;token&quot;:&quot;8697tgygyt78tuy.y78967ugkgiyu.099oyu&quot;,

&quot;createdAt&quot;:&quot;2020-20-20 &amp;8:09:89 GMT3+&quot;,

&quot;fullName&quot;:&quot;8an 9o0&quot;

}

}

}

###


### 4.1.2 SignIn User

After you get registered next time you need to authenticate yourself, you will send the following request to the server to perform such action.

{

&quot;auth&quot;:{

&quot;signIn&quot;:{

&quot;username&quot;:&quot;eith12&quot;,

&quot;password&quot;:&quot;8697tgygyt78tuy&quot;

}

}

}

If user successful signIn will return the following response.

{

&quot;auth&quot;:{

&quot;signIn&quot;:{

&quot;email&quot;:&quot;eitah12@email.co&quot;,

&quot;Username&quot;:&quot;eith12&quot;,

&quot;id&quot;:&quot;78967gkugt&quot;,

&quot;token&quot;:&quot;8697tgygyt78tuy.y78967ugkgiyu.099oyu&quot;,

&quot;createdAt&quot;:&quot;2020-20-20 &amp;8:09:89 GMT3+&quot;,

&quot;fullName&quot;:&quot;8an 9o0&quot;

}

}

}

If It fails to login, the **signIn** field shall be null and error to be found in the errors block.

### 4.1.3 Reset Password

You can reset a password of an already registered user by sending the following request to the server.

{

&quot;auth&quot;:{

&quot;reset&quot;:{

&quot;email&quot;:&quot;eitah12@email.co&quot;

}

}

}

Password reset instructions will be sent to the email if it exists in database records. Server response will be as follows.

{

&quot;auth&quot;:{

&quot;reset&quot;: &quot;Password recovery process sent to your email.&quot;

}

}

## 4.2 Authorization

Data access policy controlled by rules. You use the **policy** JSON rule block to add new rules for database access. You need **masterKey** in the top level block **{ }** to perform this action.

### 4.2.1 Rule format

The **policy** block has the following fields, **add, remove** &amp; **list .** Rules field is an object which has the following format.

&quot;add&quot;: {

&quot;\&lt;resource-operation\&gt;&quot;: &quot;\&lt;condition\&gt;&quot;

},

&quot;list&quot;: {},

&quot;remove&quot;: {

&quot;ruleId&quot;: &quot;\&lt;rule-id\&gt;&quot;

}

**\&lt;resource-operation\&gt;** is the operation to act upon a resource, the common operation is

- **update.${Domain/Table/Collection}**
- **create.${Domain/Table/Collection}**
- **delete.${Domain/Table/Collection}**
- **query.${Domain/Table/Collection}**
- **files.save**
- **files.delete**
- **files.list**
- **files.read**

**\&lt;condition\&gt;** is the expression which evaluates to boolean either **true** or **false**. In your expression **context** is an object which will be injected, some of its properties are.

{

&quot;auth&quot;: boolean,

&quot;uid&quot;: string,

&quot;domain&quot;: string

}

- **auth** -\&gt; this field will be true if the user is authenticated otherwise is false.
- **uid** -\&gt; the user id execute the request or undefined.
- **domain** -\&gt; the resource current accessed.

### 4.2.2 Define Rules

When rules saved will replace any existing rules that match the new rule update. Example of adding rules.

{

&quot;masterKey&quot;:&quot;687tgjhgi78978567gjh&quot;,

&quot;applicationId&quot;:&quot;6878567gjh&quot;,

&quot;policy&quot;:{

&quot;add&quot;: {

&quot;query.\*&quot;: &quot;return true&quot;,

&quot;create.Product&quot;: &quot;return false&quot;

}

}

}

This symbol **\*** means any Domain/Table/Collection.

Example of defining a javascript function is as follows.

{

&quot;masterKey&quot;:&quot;687tgjhgi78978567gjh&quot;,

&quot;applicationId&quot;:&quot;6878567gjh&quot;,

&quot;policy&quot;:{

&quot;add&quot;: {

&quot;query.\*&quot;: `

constauth===context.auth;

returnauth===true;

`

}

}

}

The last statement of the condition must **return boolean.** When return is **true** means request has access to that resource and if **false** means request does not have access to that resource.

### 4.2.3 List Rules

You can list all available rules in your project as follows.

{

&quot;masterKey&quot;:&quot;687tgjhgi78978567gjh&quot;,

&quot;applicationId&quot;:&quot;6878567gjh&quot;,

&quot;policy&quot;:{

&quot;list&quot;: {}

}

}

The response from server will be as follows;

{

&quot;policy&quot;:{

&quot;list&quot;: {

&quot;ruleId&quot;: &quot;read.\*&quot;

}

}

}

### 4.2.3 Remove Rules

You can remove saved policy by using **remove** rule block inside policy you will be required to supply the ruleId of the policy you remove. ruleId is equivalent to action you specify when you add a policy rule

{

&quot;masterKey&quot;:&quot;687tgjhgi78978567gjh&quot;,

&quot;applicationId&quot;:&quot;6878567gjh&quot;,

&quot;policy&quot;:{

&quot;remove&quot;: {&quot;ruleId&quot;:&quot;query.\*&quot;}

}

}

## 5.0 Aggregation

At some moment we want to perform aggregation of the data instead of just querying with a normal filter. The tool must provide ability to perform aggregation. You use **aggregate${Domain/Table/Collection}** to perform aggregation to a specified collection. This rule requires a **masterKey** since aggregation can alter data structure.

{

&quot;applicationId&quot;:&quot;7867tgyujk&quot;,

&quot;masterKey&quot;: &quot;785ghjgjfh&quot;,

&quot;aggregateTest&quot;: [

{

&quot;$match&quot;: {

&quot;name&quot;: &quot;qwerty&quot;

}

}

]

}

If no error the result of aggregation will be found at **aggregateTest** from the JSON which returned by a server.

##


##


## 6.0 Storage

Server must be able to save a simple file around **5~10 MB** and large files with **Gb** of data and retrieve those files. It has to use amazon **s3** compatible storage or **GridFS** mongoDb storage driver or a custom one as it seems fits.

## 6.1 Base64 encode files

For simple files we use rule blocks with base64 encoded. To control files you use **files** rule block, the structure of the rule is as follows.

- **save.filename -\&gt;** this field is any string may contain a file extension for auto content type detect, server will generate a random prefix id and append to the filename you provide so you can use the same file name multiple times and server will return a unique file name for each.
- **save.base64 -\&gt;** the content of file to save base64 encoded or plain text
- **save.type -\&gt;** the content-type mime of the file you save if not supplied mime will be determined from filename extension.
- **delete.filename -\&gt;** filename returned by server not the one you supplied.

{

&quot;applicationId&quot;: string,

&quot;files&quot;: {

&quot;save&quot;: {

&quot;filename&quot;: string,

&quot;base64&quot;: string,

&quot;type&quot;: string

},

&quot;delete&quot;: {

&quot;filename&quot;: string

}

}

}

##


### 6.1.1 Save File

To save you send the following JSON to the server.

{

&quot;applicationId&quot;: &quot;d75ujgdkj&quot;,

&quot;files&quot;: {

&quot;save&quot;: {

&quot;filename&quot;: &quot;hello.txt&quot;,

&quot;base64&quot;: &quot;Helo, world!&quot;

}

}

}

If successfully saved, the server will return the path of the file location.

{

&quot;files&quot;:{

&quot;save&quot;: &quot;/storage/778guyg/file/d75ujgdkj/9f8875fb-4064-4d71-584a733-hello.txt&quot;

}

}

Then you can append the path returned with your server host address to view the file. Or if you know the **filename** to view the file its path is **${hostname}:${port}/storage/${applicationId}/file/${filename}** e.g http://localhost:6000/storage/8767tuy/file/jgyrutiyhjfd-hello.txt

##


### 6.1.2 Delete File

To delete a file you send the following JSON to the server.

{

&quot;applicationId&quot;: &quot;d75ujgdkj&quot;,

&quot;files&quot;: {

&quot;delete&quot;: {

&quot;filename&quot;: &quot;oioyui-hjgiuguy-jkfjyfh-785ygjkh-hello.txt&quot;

}

}

}

If the file is successfully deleted, the server will return the filename which is just deleted.

{

&quot;files&quot;: {

&quot;delete&quot; : &quot;oioyui-hjgiuguy-jkfjyfh-785ygjkh-hello.txt&quot;

}

}

### 6.1.3 List Files

To list your files you send the following JSON to the server.

{

&quot;applicationId&quot;: &quot;d75ujgdkj&quot;,

&quot;files&quot;: {

&quot;list&quot;: {

&quot;prefix&quot;: &quot;&quot;

}

}

}

Server will return array of file objects

{

&quot;files&quot;: {

&quot;list&quot; : [{filename: &quot;oioyui-hjgiuguy-jkfjyfh-785ygjkh-hello.txt&quot;}]

}

}

### 6.1.4 Retrieve a file

When you know the filename you can get file content by using the following format **${hostname}:${port}/${your-server-endpoint}/storage/${your-application-id}/file/${filename}**. For example **https://bfast-daas.com/storage/788h/file/76tyuuu-78uui-87ui.mp4**

## 6.2 Upload large files

You can upload large files with efficiency and progress tracking, this will use a direct and dedicated rest api endpoint **/storage/${applicationId}** with **POST** http method. This endpoint handle a multipart form data, form your client side you will send your formdata with files you want to save and will respond with the urls of the files saved;

The response will be a json of the following format;

{

&quot;urls&quot;: [&quot;/storage/889/file/077-hello.txt&quot;]

}

The result will always be an array even if you only upload one file.

##


## 7.0 Database Indexes

You can modify the indexes of your database domain/collection/table for performance improvement and other factors as it seems fits. Format of the rule is **index${Domain/Collection/Table}** e.g **indexProduct.** This rule requires a **masterKey** field in your root rule block. Its format is as follows

## 7.1 Format

The **index${domain}** block has the following fields, **add, remove** &amp; **list .** index field is an object which has the following format.

&quot;add&quot;: [{&quot;field&quot;: &quot;name&quot;}],

&quot;list&quot;: { },

&quot;remove&quot;: { }

## 7.2 Add Indexes

To add a new index to a domain/table/collection use **add** which accepts an array of the indexes you want to add, if the index exists will be updated.

{

&quot;applicationId&quot;: &quot;daas&quot;,

&quot;masterKey&quot;: &quot;daas-master&quot;,

&quot;indexProduct&quot;: {

&quot;add&quot;: [

{&quot;field&quot;: &quot;name&quot;}

]

}

}

The response from the server will be as follows

{

&quot;indexProduct&quot;: { &quot;add&quot;: &quot;Indexes added&quot; }

}

## 7.3 List Indexes

To list all available indexes for a domain use **list** sub command for **index${domain}** rule as follows;

{

&quot;applicationId&quot;: &quot;daas&quot;,

&quot;masterKey&quot;: &quot;daas-master&quot;,

&quot;indexProduct&quot;: {

&quot;list&quot;: {}

}

}

The response will be the list of the indexes available both user defined and default ( primary key index ).

{

&quot;indexProduct&quot;: {

&quot;list&quot;: [

{

&quot;v&quot;: 2,

&quot;key&quot;: {&quot;name&quot;: 1},

&quot;name&quot;: &quot;name\_1&quot;,

&quot;ns&quot;: &quot;051475c8-60f6-4809-a33a-db9db0d4416a.Product&quot;

}

]

}

}

## 7.4 Remove Indexes

You can delete/remove a user defined index only by using the **remove** rule in **index${domain}** rule block.

{

&quot;applicationId&quot;: &quot;daas&quot;,

&quot;masterKey&quot;: &quot;daas-master&quot;,

&quot;indexProduct&quot;: {

&quot;remove&quot;: {}

}

}

The response from the server will be as follows.

{

&quot;indexProduct&quot;: {

&quot;remove&quot;: true

}

}

## 8.0 PlayGround

This is an interface for you to play with your rules when developing your application. You open the UI by running the following command.

~$ bfast database playground

You must install &quot; **bfast-tools**&quot; a cli tool from npm like this **&quot;~$ npm install -g bfast-tools&quot;**
