# Test Report

<The goal of this document is to explain how the application was tested, detailing how the test cases were defined and what they cover>

# Contents

- [Test Report](#test-report)
- [Contents](#contents)
- [Dependency graph](#dependency-graph)
- [Integration approach](#integration-approach)
- [Tests](#tests)
- [Coverage](#coverage)
  - [Coverage of FR](#coverage-of-fr)
  - [Coverage white box](#coverage-white-box)





# Dependency graph 

 <!-- <report the here the dependency graph of EzWallet> -->
![Dependency Diagram](diagrams/DependencyGraph.svg){: .shadow}

     
# Integration approach

    <Write here the integration sequence you adopted, in general terms (top down, bottom up, mixed) and as sequence
    (ex: step1: unit A, step 2: unit A+B, step 3: unit A+B+C, etc)> 
    <Some steps may  correspond to unit testing (ex step1 in ex above)>
    <One step will  correspond to API testing, or testing unit route.js>
    


# Tests

   <in the table below list the test cases defined For each test report the object tested, the test level (API, integration, unit) and the technique used to define the test case  (BB/ eq partitioning, BB/ boundary, WB/ statement coverage, etc)>   <split the table if needed>


| Test case name                                                                                                                                                                                                                                              | Object(s) tested                 | Test level  | Technique used         |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------- | ----------- | ---------------------- |
|                                                                                                                                                                                                                                                             |                                  |             |                        |
| PASS  test/auth.integration.test.js (5.061 s)                                                                                                                                                                                                               |                                  |             |                        |
| register                                                                                                                                                                                                                                                    |                                  |             |                        |
| √ should register user successfully (304 ms)                                                                                                                                                                                                                | register                         | integration | WB/ statement coverage |
| √ should return a 400 error if the email in the request body identifies an already existing user  (16 ms)                                                                                                                                                   | register                         | integration | WB/ statement coverage |
| √ should return a 400 error if the username in the request body identifies an already existing user (10 ms)                                                                                                                                                 | register                         | integration | WB/ statement coverage |
| √ should return a 400 error if the email in the request body is not in a valid email format   (8 ms)                                                                                                                                                        | register                         | integration | WB/ statement coverage |
| √ should return a 400 error if at least one of the parameters in the request body is an empty string  (8 ms)                                                                                                                                                | register                         | integration | WB/ statement coverage |
| √ should return a 400 error if the request body does not contain all the necessary attributes  (10 ms)                                                                                                                                                      | register                         | integration | WB/ statement coverage |
| registerAdmin                                                                                                                                                                                                                                               |                                  |             |                        |
| √ should register admin successfully (243 ms)                                                                                                                                                                                                               | registerAdmin                    | integration | WB/ statement coverage |
| √ should return a 400 error if the email in the request body identifies an already existing user   (9 ms)                                                                                                                                                   | registerAdmin                    | integration | WB/ statement coverage |
| √ should return a 400 error if the username in the request body identifies an already existing user  (12 ms)                                                                                                                                                | registerAdmin                    | integration | WB/ statement coverage |
| √ should return a 400 error if the email in the request body is not in a valid email format  (9 ms)                                                                                                                                                         | registerAdmin                    | integration | WB/ statement coverage |
| √ should return a 400 error if at least one of the parameters in the request body is an empty string  (8 ms)                                                                                                                                                | registerAdmin                    | integration | WB/ statement coverage |
| √ should return a 400 error if the request body does not contain all the necessary attributes (7 ms)                                                                                                                                                        | registerAdmin                    | integration | WB/ statement coverage |
| login                                                                                                                                                                                                                                                       |                                  |             |                        |
| √ Should login successfully (473 ms)                                                                                                                                                                                                                        | login                            | integration | WB/ statement coverage |
| √ should return a 400 error if the supplied password does not match with the one in the database (467 ms)                                                                                                                                                   | login                            | integration | WB/ statement coverage |
| √ should return a 400 error if the email in the request body does not identify a user in the database (239 ms)                                                                                                                                              | login                            | integration | WB/ statement coverage |
| √ should return a 400 error if the email in the request body is not in a valid email format (236 ms)                                                                                                                                                        | login                            | integration | WB/ statement coverage |
| √ should return a 400 error if at least one of the parameters in the request body is an empty string (237 ms)                                                                                                                                               | login                            | integration | WB/ statement coverage |
| √ should return a 400 error if the request body does not contain all the necessary attributes (236 ms)                                                                                                                                                      | login                            | integration | WB/ statement coverage |
| logout                                                                                                                                                                                                                                                      |                                  |             |                        |
| √ Should logout successfully (239 ms)                                                                                                                                                                                                                       | logout                           | integration | WB/ statement coverage |
| √ should return a 400 error if the refresh token in the request's cookies does not represent a userin the database (236 ms)                                                                                                                                 | logout                           | integration | WB/ statement coverage |
| √ should return a 400 error if the request does not have a refresh token in the cookies (235 ms)                                                                                                                                                            | logout                           | integration | WB/ statement coverage |
|                                                                                                                                                                                                                                                             |                                  |             |                        |
| PASS  test/controller.integration.test.js                                                                                                                                                                                                                   |                                  |             |                        |
| createCategory                                                                                                                                                                                                                                              |                                  |             |                        |
| √ should create a category (120 ms)                                                                                                                                                                                                                         | createCategory                   | integration | WB/ statement coverage |
| √ should return a 400 error if the type of category passed in the request body represents an already existing category in the database (11 ms)                                                                                                              | createCategory                   | integration | WB/ statement coverage |
| √ should return a 400 error if at least one of the parameters in the request body is an empty string (8 ms)                                                                                                                                                 | createCategory                   | integration | WB/ statement coverage |
| √ should return a 400 error if the request body does not contain all the necessary attributes (8 ms)                                                                                                                                                        | createCategory                   | integration | WB/ statement coverage |
| √ should return a 401 error if called by an authenticated user who is not an admin (authType = Admin) (8 ms)                                                                                                                                                | createCategory                   | integration | WB/ statement coverage |
| updateCategory                                                                                                                                                                                                                                              |                                  |             |                        |
| √ should update a category with both new type and new color (18 ms)                                                                                                                                                                                         | updateCategory                   | integration | WB/ statement coverage |
| √ should update a category with new color (12 ms)                                                                                                                                                                                                           | updateCategory                   | integration | WB/ statement coverage |
| √ should return a 401 error if called by an authenticated user who is not an admin (authType = Admin) (9 ms)                                                                                                                                                | updateCategory                   | integration | WB/ statement coverage |
| √ should return a 400 error if the type of category passed in the request body as the new type represents an already existing category in the database and that category is not the same as the requested one (11 ms)                                       | updateCategory                   | integration | WB/ statement coverage |
| √ should return a 400 error if the type of category passed as a route parameter does not represent a category in the database (9 ms)                                                                                                                        | updateCategory                   | integration | WB/ statement coverage |
| √ should return a 400 error if at least one of the parameters in the request body is an empty string (8 ms)                                                                                                                                                 | updateCategory                   | integration | WB/ statement coverage |
| √ should return a 400 error if the request body does not contain all the necessary attributes (8 ms)                                                                                                                                                        | updateCategory                   | integration | WB/ statement coverage |
| deleteCategory                                                                                                                                                                                                                                              |                                  |             |                        |
| √ should delete all categories except oldest (N==T) (12 ms)                                                                                                                                                                                                 | deleteCategory                   | integration | WB/ statement coverage |
| √ should delete all categories provided (N>T) (13 ms)                                                                                                                                                                                                       | deleteCategory                   | integration | WB/ statement coverage |
| √ should return a 401 error if called by an authenticated user who is not an admin (authType = Admin) (11 ms)                                                                                                                                               | deleteCategory                   | integration | WB/ statement coverage |
| √ should return a 400 error if at least one of the types in the array does not represent a categoryin the database (11 ms)                                                                                                                                  | deleteCategory                   | integration | WB/ statement coverage |
| √ should return a 400 error if the array passed in the request body is empty     (10 ms)                                                                                                                                                                    | deleteCategory                   | integration | WB/ statement coverage |
| √ should return a 400 error if at least one of the types in the array is an empty string     (9 ms)                                                                                                                                                         | deleteCategory                   | integration | WB/ statement coverage |
| √ should return a 400 error if called when there is only one category in the database     (9 ms)                                                                                                                                                            | deleteCategory                   | integration | WB/ statement coverage |
| √ should return a 400 error if the request body does not contain all the necessary attributes     (9 ms)                                                                                                                                                    | deleteCategory                   | integration | WB/ statement coverage |
| getCategories                                                                                                                                                                                                                                               |                                  |             |                        |
| √ should get all categories (user) (9 ms)                                                                                                                                                                                                                   | getCategories                    | integration | WB/ statement coverage |
| √ should return a 401 error if called by a user who is not authenticated (authType = Simple)     (7ms)                                                                                                                                                      | getCategories                    | integration | WB/ statement coverage |
| createTransaction                                                                                                                                                                                                                                           |                                  |             |                        |
| √ should create a transaction (15 ms)                                                                                                                                                                                                                       | createTransaction                | integration | WB/ statement coverage |
| √ should return a 401 error if called by an authenticated user who is not the same user as the one in the route parameter (authType = User) (12 ms)                                                                                                         | createTransaction                | integration | WB/ statement coverage |
| √ should return a 400 error if the amount passed in the request body cannot be parsed as a floatingvalue (negative numbers are accepted) (13 ms)                                                                                                            | createTransaction                | integration | WB/ statement coverage |
| √ should return a 400 error if the username passed as a route parameter does not represent a user in the database (11 ms)                                                                                                                                   | createTransaction                | integration | WB/ statement coverage |
| √ should return a 400 error if the username passed in the request body does not represent a user inthe database (12 ms)                                                                                                                                     | createTransaction                | integration | WB/ statement coverage |
| √ should return a 400 error if the username passed in the request body is not equal to the one passed as a route parameter (13 ms)                                                                                                                          | createTransaction                | integration | WB/ statement coverage |
| √ should return a 400 error if the type of category passed in the request body does not represent acategory in the database (14 ms)                                                                                                                         | createTransaction                | integration | WB/ statement coverage |
| √ should return a 400 error if at least one of the parameters in the request body is an empty string (12 ms)                                                                                                                                                | createTransaction                | integration | WB/ statement coverage |
| √ should return a 400 error if the request body does not contain all the necessary attributes (11 ms)                                                                                                                                                       | createTransaction                | integration | WB/ statement coverage |
| getAllTransactions                                                                                                                                                                                                                                          |                                  |             |                        |
| √ should retreive all user's transactions (12 ms)                                                                                                                                                                                                           | getAllTransactions               | integration | WB/ statement coverage |
| √ should return a 401 error if called by an authenticated user who is not an admin (authType = Admin) (10 ms)                                                                                                                                               | getAllTransactions               | integration | WB/ statement coverage |
| getTransactionsByUser                                                                                                                                                                                                                                       |                                  |             |                        |
| √ should retreive the user's transactions(admin route) (14 ms)                                                                                                                                                                                              | getTransactionsByUser            | integration | WB/ statement coverage |
| √ should return a 401 error if called by an authenticated user who is not an admin (authType = Admin) if the route is /api/transactions/users/:username (11 ms)                                                                                             | getTransactionsByUser            | integration | WB/ statement coverage |
| √ should retreive the user's transactions(user route) with from and upto (15 ms)                                                                                                                                                                            | getTransactionsByUser            | integration | WB/ statement coverage |
| √ should return a 401 error if called by an authenticated user who is not the same user as the one in the route (authType = User) if the route is /api/users/:username/transactions (11 ms)                                                                 | getTransactionsByUser            | integration | WB/ statement coverage |
| √ should return a 401 error if called by an authenticated user who is not the same user as the one in the route (authType = User) if the route is /api/users/:username/transactions (12 ms)                                                                 | getTransactionsByUser            | integration | WB/ statement coverage |
| getTransactionsByUserByCategory                                                                                                                                                                                                                             |                                  |             |                        |
| √ should retreive the user's transactions belonging to a category(user route) (14 ms)                                                                                                                                                                       | getTransactionsByUserByCategory  | integration | WB/ statement coverage |
| √ should return a 401 error if called by an authenticated user who is not an admin (authType = Admin) if the route is /api/transactions/users/:username/category/:category (11 ms)                                                                          | getTransactionsByUserByCategory  | integration | WB/ statement coverage |
| √ should retreive the user's transactions belonging to a category(admin route) (14 ms)                                                                                                                                                                      | getTransactionsByUserByCategory  | integration | WB/ statement coverage |
| √ should return a 401 error if called by an authenticated user who is not the same user as the one in the route (authType = User) if the route is /api/users/:username/transactions/category/:category (11 ms)                                              | getTransactionsByUserByCategory  | integration | WB/ statement coverage |
| √ should return a 400 error if the category passed as a route parameter does not represent a category in the database (15 ms)                                                                                                                               | getTransactionsByUserByCategory  | integration | WB/ statement coverage |
| √ should return a 400 error if the username passed as a route parameter does not represent a user in the database (14 ms)                                                                                                                                   | getTransactionsByUserByCategory  | integration | WB/ statement coverage |
| getTransactionsByGroup                                                                                                                                                                                                                                      |                                  |             |                        |
| √ should retreive the all group members transactions (user route) (28 ms)                                                                                                                                                                                   | getTransactionsByGroup           | integration | WB/ statement coverage |
| √ should return a 401 error if called by an authenticated user who is not part of the group (authType = Group) if the route is /api/groups/:name/transactions (19 ms)                                                                                       | getTransactionsByGroup           | integration | WB/ statement coverage |
| √ should retreive the all group members transactions (admin route) (20 ms)                                                                                                                                                                                  | getTransactionsByGroup           | integration | WB/ statement coverage |
| √ should return a 401 error if called by an authenticated user who is not an admin (authType = Admin) if the route is /api/transactions/groups/:name (17 ms)                                                                                                | getTransactionsByGroup           | integration | WB/ statement coverage |
| √ should return a 400 error if the group name passed as a route parameter does not represent a group in the database     (admin route, auth first)    (17 ms)                                                                                               | getTransactionsByGroup           | integration | WB/ statement coverage |
| √ should return a 400 error if the group name passed as a route parameter does not represent a group in the database (user route, group check first)  (17 ms)                                                                                               | getTransactionsByGroup           | integration | WB/ statement coverage |
| getTransactionsByGroupByCategory                                                                                                                                                                                                                            |                                  |             |                        |
| √ should retreive all group members transactions belonging to a category(user route) (21 ms)                                                                                                                                                                | getTransactionsByGroupByCategory | integration | WB/ statement coverage |
| √ should return a 401 error if called by an authenticated user who is not part of the group (authType = Group) if the route is /api/groups/:name/transactions/category/:category (16 ms)                                                                    | getTransactionsByGroupByCategory | integration | WB/ statement coverage |
| √ should retreive all group members transactions belonging to a category(admin route) (20 ms)                                                                                                                                                               | getTransactionsByGroupByCategory | integration | WB/ statement coverage |
| √ should return a 401 error if called by an authenticated user who is not an admin (authType = Admin) if the route is /api/transactions/groups/:name/category/:category (18 ms)                                                                             | getTransactionsByGroupByCategory | integration | WB/ statement coverage |
| √ should return a 400 error if the group name passed as a route parameter does not represent a group in the database(user route, group check first) (17 ms)                                                                                                 | getTransactionsByGroupByCategory | integration | WB/ statement coverage |
| √ should return a 400 error if the group name passed as a route parameter does not represent a group in the database(admin route) (16 ms)                                                                                                                   | getTransactionsByGroupByCategory | integration | WB/ statement coverage |
| √ should return a 400 error if the category passed as a route parameter does not represent a category in the database (19 ms)                                                                                                                               | getTransactionsByGroupByCategory | integration | WB/ statement coverage |
| deleteTransaction                                                                                                                                                                                                                                           |                                  |             |                        |
| √ should delete a transaction (22 ms)                                                                                                                                                                                                                       | deleteTransaction                | integration | WB/ statement coverage |
| √ should return a 401 error if called by an authenticated user who is not the same user as the one in the route (authType = User) (18 ms)                                                                                                                   | deleteTransaction                | integration | WB/ statement coverage |
| √ should return a 400 error if the _id in the request body represents a transaction made by a different user than the one in the route (17 ms)                                                                                                              | deleteTransaction                | integration | WB/ statement coverage |
| √ should return a 400 error if the _id in the request body does not represent a transaction in the database (16 ms)                                                                                                                                         | deleteTransaction                | integration | WB/ statement coverage |
| √ should return a 400 error if the username passed as a route parameter does not represent a user in the database (16 ms)                                                                                                                                   | deleteTransaction                | integration | WB/ statement coverage |
| √ should return a 400 error if the _id in the request body is an empty string     (15 ms)                                                                                                                                                                   | deleteTransaction                | integration | WB/ statement coverage |
| √ should return a 400 error if the request body does not contain all the necessary attributes  (16 ms)                                                                                                                                                      | deleteTransaction                | integration | WB/ statement coverage |
| √ should return a 500 error if the id is not valid db id (17 ms)                                                                                                                                                                                            | deleteTransaction                | integration | WB/ statement coverage |
| deleteTransactions                                                                                                                                                                                                                                          |                                  |             |                        |
| √ should delete all transactions (22 ms)                                                                                                                                                                                                                    | deleteTransactions               | integration | WB/ statement coverage |
| √ should return a 401 error if called by an authenticated user who is not an admin (authType = Admin) (17 ms)                                                                                                                                               | deleteTransactions               | integration | WB/ statement coverage |
| √ should return a 400 error if at least one of the ids in the array does not represent a transaction in the database (20 ms)                                                                                                                                | deleteTransactions               | integration | WB/ statement coverage |
| √ should return a 400 error if at least one of the ids in the array is an empty string     (16 ms)                                                                                                                                                          | deleteTransactions               | integration | WB/ statement coverage |
| √ should return a 400 error if the request body does not contain all the necessary attributes  (17 ms)                                                                                                                                                      | deleteTransactions               | integration | WB/ statement coverage |
| √ should return a 500 error if the transactions id is not valid (19 ms)                                                                                                                                                                                     | deleteTransactions               | integration | WB/ statement coverage |
|                                                                                                                                                                                                                                                             |                                  |             |                        |
| PASS  test/users.integration.test.js                                                                                                                                                                                                                        |                                  |             |                        |
| getUsers                                                                                                                                                                                                                                                    |                                  |             |                        |
| √ should return a 401 error if called by an authenticated user who is not an admin (authType = Admin) (116 ms)                                                                                                                                              | getUsers                         | integration | WB/ statement coverage |
| √ should retrieve list of all users (17 ms)                                                                                                                                                                                                                 | getUsers                         | integration | WB/ statement coverage |
| getUser                                                                                                                                                                                                                                                     |                                  | integration |                        |
| √ should return a 400 error if the username passed as the route parameter does not represent a userin the database (12 ms)                                                                                                                                  | getUser                          | integration | WB/ statement coverage |
| √ should retur a 401 error if called by an authenticated user who is neither the same user as the one in the route parameter (authType = User) nor an admin (authType = Admin) (9 ms)                                                                       | getUser                          | integration | WB/ statement coverage |
| √ should retrieve a regular user (9 ms)                                                                                                                                                                                                                     | getUser                          | integration | WB/ statement coverage |
| √ should retrieve a regular user if called by an admin (11 ms)                                                                                                                                                                                              | getUser                          | integration | WB/ statement coverage |
| createGroup                                                                                                                                                                                                                                                 |                                  |             |                        |
| √ should return a 400 error if the request body does not contain all the necessary attributes (18 ms)                                                                                                                                                       | createGroup                      | integration | WB/ statement coverage |
| √ should return a 400 error if the group name passed in the request body is an empty string (9 ms)                                                                                                                                                          | createGroup                      | integration | WB/ statement coverage |
| √ should create a group (23 ms)                                                                                                                                                                                                                             | createGroup                      | integration | WB/ statement coverage |
| √ should return a 401 error if called by a user who is not authenticated (authType = Simple) (12 ms)                                                                                                                                                        | createGroup                      | integration | WB/ statement coverage |
| √ should return a 400 error if at least one of the member emails is an empty string (12 ms)                                                                                                                                                                 | createGroup                      | integration | WB/ statement coverage |
| √ should return a 400 error if at least one of the member emails is not in a valid email format   (11 ms)                                                                                                                                                   | createGroup                      | integration | WB/ statement coverage |
| √ should return a 400 error if the user who calls the API is already in a group   (14 ms)                                                                                                                                                                   | createGroup                      | integration | WB/ statement coverage |
| √ should return a 400 error if all the provided emails (the ones in the array, the email of the user calling the function does not have to be considered in this case) represent users that are already in a group or do not exist in the  database (14 ms) | createGroup                      | integration | WB/ statement coverage |
| √ should return a 400 error if all the provided emails (the ones in the array, the email of the user calling the function does not have to be considered in this case) represent users that are already in a group or do not exist in the  database (12 ms) | createGroup                      | integration | WB/ statement coverage |
| √ should return a 400 error if the group name passed in the request body represents an already existing group in the database (11 ms)                                                                                                                       | createGroup                      | integration | WB/ statement coverage |
| getGroups                                                                                                                                                                                                                                                   |                                  |             |                        |
| √ should get all groups (13 ms)                                                                                                                                                                                                                             | getGroups                        | integration | WB/ statement coverage |
| √ should return a 401 error if called by an authenticated user who is not an admin (authType = Admin) (13 ms)                                                                                                                                               | getGroups                        | integration | WB/ statement coverage |
| getGroup                                                                                                                                                                                                                                                    |                                  | integration |                        |
| √ should get user's group (admin auth) (13 ms)                                                                                                                                                                                                              | getGroup                         | integration | WB/ statement coverage |
| √ should get user's group (user auth) (14 ms)                                                                                                                                                                                                               | getGroup                         | integration | WB/ statement coverage |
| √ should return a 401 error if called by an authenticated user who is neither part of the group (authType = Group) nor an admin (authType = Admin) (13 ms)                                                                                                  | getGroup                         | integration | WB/ statement coverage |
| √ should return a 400 error if the group name passed as a route parameter does not represent a group in the database (admin auth) (13 ms)                                                                                                                   | getGroup                         | integration | WB/ statement coverage |
| √ should return a 400 error if the group name passed as a route parameter does not represent a group in the database (user auth) (13 ms)                                                                                                                    | getGroup                         | integration | WB/ statement coverage |
| addToGroup                                                                                                                                                                                                                                                  |                                  |             |                        |
| √ should add to group (user route) (26 ms)                                                                                                                                                                                                                  | addToGroup                       | integration | WB/ statement coverage |
| √ should return a 401 error if called by an authenticated user who is not part of the group (authType = Group) if the route is api/groups/:name/add (13 ms)                                                                                                 | addToGroup                       | integration | WB/ statement coverage |
| √ should add to group (admin route) (23 ms)                                                                                                                                                                                                                 | addToGroup                       | integration | WB/ statement coverage |
| √ should return a 401 error if called by an authenticated user who is not an admin (authType = Admin) if the route is api/groups/:name/insert (14 ms)                                                                                                       | addToGroup                       | integration | WB/ statement coverage |
| √ should return a 400 error if at least one of the member emails is not in a valid email format   (13 ms)                                                                                                                                                   | addToGroup                       | integration | WB/ statement coverage |
| √ should return a 400 error if at least one of the member emails is an empty string   (14 ms)                                                                                                                                                               | addToGroup                       | integration | WB/ statement coverage |
| √ should return a 400 error if all the provided emails represent users that are already in a group or do not exist in the database   (22 ms)                                                                                                                | addToGroup                       | integration | WB/ statement coverage |
| √ should return a 400 error if the group name passed as a route parameter does not represent a group in the database  (13 ms)                                                                                                                               | addToGroup                       | integration | WB/ statement coverage |
| √ should return a 400 error if the group name passed as a route parameter does not represent a group in the database  (13 ms)                                                                                                                               | addToGroup                       | integration | WB/ statement coverage |
| removeFromGroup                                                                                                                                                                                                                                             |                                  |             |                        |
| √ should remove from group keeping the oldest(user route) (21 ms)                                                                                                                                                                                           | removeFromGroup                  | integration | WB/ statement coverage |
| √ should return a 401 error if called by an authenticated user who is not part of the group (authType = Group) if the route is api/groups/:name/remove (15 ms)                                                                                              | removeFromGroup                  | integration | WB/ statement coverage |
| √ should return a 401 error if called by an authenticated user who is not an admin (authType = Admin) if the route is api/groups/:name/pull (14 ms)                                                                                                         | removeFromGroup                  | integration | WB/ statement coverage |
| √ should remove from group keeping the oldest(admin route) (22 ms)                                                                                                                                                                                          | removeFromGroup                  | integration | WB/ statement coverage |
| √ should return a 400 error if the group contains only one member before deleting any user  (user auth) (12 ms)                                                                                                                                             | removeFromGroup                  | integration | WB/ statement coverage |
| √ should return a 400 error if at least one of the emails is an empty string   (15 ms)                                                                                                                                                                      | removeFromGroup                  | integration | WB/ statement coverage |
| √ should return a 400 error if at least one of the emails is not in a valid email format   (14 ms)                                                                                                                                                          | removeFromGroup                  | integration | WB/ statement coverage |
| √ should return a 400 error if all the provided emails represent users that do not belong to the group or do not exist in the database (20 ms)                                                                                                              | removeFromGroup                  | integration | WB/ statement coverage |
| √ should return a 400 error if the group name passed as a route parameter does not represent a group in the database(user route) (14 ms)                                                                                                                    | removeFromGroup                  | integration | WB/ statement coverage |
| √ should return a 400 error if the group name passed as a route parameter does not represent a group in the database(admin route) (13 ms)                                                                                                                   | removeFromGroup                  | integration | WB/ statement coverage |
| deleteUser                                                                                                                                                                                                                                                  |                                  |             |                        |
| √ should delete user and group (17 ms)                                                                                                                                                                                                                      | deleteUser                       | integration | WB/ statement coverage |
| √ should delete user and group member (15 ms)                                                                                                                                                                                                               | deleteUser                       | integration | WB/ statement coverage |
| √ should delete user and not group member (15 ms)                                                                                                                                                                                                           | deleteUser                       | integration | WB/ statement coverage |
| √ should return a 401 error if called by an authenticated user who is not an admin (authType = Admin) (12 ms)                                                                                                                                               | deleteUser                       | integration | WB/ statement coverage |
| √ should return a 400 error if the email passed in the request body does not represent a user in the database (11 ms)                                                                                                                                       | deleteUser                       | integration | WB/ statement coverage |
| √ should return a 400 error if the email passed in the request body is not in correct email format (11 ms)                                                                                                                                                  | deleteUser                       | integration | WB/ statement coverage |
| √ should return a 400 error if the email passed in the request body is an empty string   (11 ms)                                                                                                                                                            | deleteUser                       | integration | WB/ statement coverage |
| √ should return a 400 error if the request body does not contain all the necessary attributes (11 ms)                                                                                                                                                       | deleteUser                       | integration | WB/ statement coverage |
| √ should return a 400 error if the email passed in the request body represents an admin   (13 ms)                                                                                                                                                           | deleteUser                       | integration | WB/ statement coverage |
| deleteGroup                                                                                                                                                                                                                                                 |                                  |             |                        |
| √ should delete group (11 ms)                                                                                                                                                                                                                               | deleteGroup                      | integration | WB/ statement coverage |
| √ should return a 401 error if called by an authenticated user who is not an admin (authType = Admin) (10 ms)                                                                                                                                               | deleteGroup                      | integration | WB/ statement coverage |
| √ should return a 400 error if the name passed in the request body does not represent a group in the database (11 ms)                                                                                                                                       | deleteGroup                      | integration | WB/ statement coverage |
| √ should return a 400 error if the name passed in the request body is an empty string (11 ms)                                                                                                                                                               | deleteGroup                      | integration | WB/ statement coverage |
| √ should return a 400 error if the request body does not contain all the necessary attributes (10 ms)                                                                                                                                                       | deleteGroup                      | integration | WB/ statement coverage |
|                                                                                                                                                                                                                                                             |                                  |             |                        |
| PASS  test/utils.integration.test.js                                                                                                                                                                                                                        |                                  |             |                        |
| handleDateFilterParams                                                                                                                                                                                                                                      |                                  |             |                        |
| √ should return correct filter using from and upto parameters (19 ms)                                                                                                                                                                                       | handleDateFilterParams           | integration | WB/ statement coverage |
| √ should return correct filter using from parameters (7 ms)                                                                                                                                                                                                 | handleDateFilterParams           | integration | WB/ statement coverage |
| √ should return correct filter using upTo parameters (4 ms)                                                                                                                                                                                                 | handleDateFilterParams           | integration | WB/ statement coverage |
| √ should return correct filter using date parameters (25 ms)                                                                                                                                                                                                | handleDateFilterParams           | integration | WB/ statement coverage |
| √ should return nothing since no query defined (17 ms)                                                                                                                                                                                                      | handleDateFilterParams           | integration | WB/ statement coverage |
| √ should throw error if data is present with the two other parameters (from) (44 ms)                                                                                                                                                                        | handleDateFilterParams           | integration | WB/ statement coverage |
| √ should throw error if data is present with the two other parameters (upTo) (5 ms)                                                                                                                                                                         | handleDateFilterParams           | integration | WB/ statement coverage |
| √ should throw error invalid data parameter format (4 ms)                                                                                                                                                                                                   | handleDateFilterParams           | integration | WB/ statement coverage |
| √ should throw error invalid from parameter format (5 ms)                                                                                                                                                                                                   | handleDateFilterParams           | integration | WB/ statement coverage |
| √ should throw error invalid upTo parameter format (6 ms)                                                                                                                                                                                                   | handleDateFilterParams           | integration | WB/ statement coverage |
| verifyAuth                                                                                                                                                                                                                                                  |                                  |             |                        |
| √ should authorize user and refresh token authType==Simple  (9 ms)                                                                                                                                                                                          | verifyAuth                       | integration | WB/ statement coverage |
| √ should not authorize user and refresh token authType==Simple  (4 ms)                                                                                                                                                                                      | verifyAuth                       | integration | WB/ statement coverage |
| √ should authorize user and refresh token authType==Admin  (4 ms)                                                                                                                                                                                           | verifyAuth                       | integration | WB/ statement coverage |
| √ should not authorize user authType==Admin  (4 ms)                                                                                                                                                                                                         | verifyAuth                       | integration | WB/ statement coverage |
| √ should authorize user and refresh token authType==User  (4 ms)                                                                                                                                                                                            | verifyAuth                       | integration | WB/ statement coverage |
| √ should not authorize user and refresh token authType==User  (4 ms)                                                                                                                                                                                        | verifyAuth                       | integration | WB/ statement coverage |
| √ should authorize user and refresh token where authType==Group  (4 ms)                                                                                                                                                                                     | verifyAuth                       | integration | WB/ statement coverage |
| √ should not authorize user and refresh token where authType==Group  (4 ms)                                                                                                                                                                                 | verifyAuth                       | integration | WB/ statement coverage |
| √ should not authorize user and refresh token where authType==Unknown  (5 ms)                                                                                                                                                                               | verifyAuth                       | integration | WB/ statement coverage |
| √ should not authorize if access token missing information  (4 ms)                                                                                                                                                                                          | verifyAuth                       | integration | WB/ statement coverage |
| √ should not authorize if refresh token missing information  (5 ms)                                                                                                                                                                                         | verifyAuth                       | integration | WB/ statement coverage |
| √ should not authorize if access token cannot be verified  (4 ms)                                                                                                                                                                                           | verifyAuth                       | integration | WB/ statement coverage |
| √ should not authorize if refresh token cannot be verified  (4 ms)                                                                                                                                                                                          | verifyAuth                       | integration | WB/ statement coverage |
| √ should not authorize if refresh token expired  (4 ms)                                                                                                                                                                                                     | verifyAuth                       | integration | WB/ statement coverage |
| √ should not authorize if missing tokens  (4 ms)                                                                                                                                                                                                            | verifyAuth                       | integration | WB/ statement coverage |
| handleAmountFilterParams                                                                                                                                                                                                                                    |                                  |             |                        |
| √ should return correct filter using min and max queries (5 ms)                                                                                                                                                                                             | handleAmountFilterParams         | integration | WB/ statement coverage |
| √ should return correct filter using min queries (4 ms)                                                                                                                                                                                                     | handleAmountFilterParams         | integration | WB/ statement coverage |
| √ should return correct filter using max queries (4 ms)                                                                                                                                                                                                     | handleAmountFilterParams         | integration | WB/ statement coverage |
| √ should throw an error for invalid min (since not numerical) (4 ms)                                                                                                                                                                                        | handleAmountFilterParams         | integration | WB/ statement coverage |
| √ should throw an error for invalid max (since not numerical) (4 ms)                                                                                                                                                                                        | handleAmountFilterParams         | integration | WB/ statement coverage |
| √ should return nothing since min and max queries not defined (5 ms)                                                                                                                                                                                        | handleAmountFilterParams         | integration | WB/ statement coverage |
|                                                                                                                                                                                                                                                             |                                  |             |                        |  |  |  |  |  |
|                                                                                                                                                                                                                                                             |                                  |             |                        |  |  |  |  |  |
|                                                                                                                                                                                                                                                             |                                  |             |                        |
| PASS  test/auth.unit.test.js                                                                                                                                                                                                                                |                                  |             |                        |
| register                                                                                                                                                                                                                                                    |                                  |             |                        |
| √ should register user (4 ms)                                                                                                                                                                                                                               | register                         | unit        | WB/ statement coverage |
| √ should return a 400 error if the username in the request body identifies an already existing user(1 ms)                                                                                                                                                   | register                         | unit        | WB/ statement coverage |
| √ should return a 400 error if the email in the request body identifies an already existing user (1ms)                                                                                                                                                      | register                         | unit        | WB/ statement coverage |
| √ should return a 400 error if the email in the request body is not in a valid email format (1 ms)                                                                                                                                                          | register                         | unit        | WB/ statement coverage |
| √ should return a 400 error if at least one of the parameters in the request body is an empty string                                                                                                                                                        | register                         | unit        | WB/ statement coverage |
| √ should return a 400 error if the request body does not contain all the necessary attributes (1 ms)                                                                                                                                                        | register                         | unit        | WB/ statement coverage |
| √ should return a 500 error if error is occurs                                                                                                                                                                                                              | register                         | unit        | WB/ statement coverage |
| registerAdmin                                                                                                                                                                                                                                               |                                  |             |                        |
| √ should register admin (4 ms)                                                                                                                                                                                                                              | registerAdmin                    | unit        | WB/ statement coverage |
| √ should return a 400 error if the username in the request body identifies an already existing user(1 ms)                                                                                                                                                   | registerAdmin                    | unit        | WB/ statement coverage |
| √ should return a 400 error if the email in the request body identifies an already existing user                                                                                                                                                            | registerAdmin                    | unit        | WB/ statement coverage |
| √ should return a 400 error if the email in the request body is not in a valid email format                                                                                                                                                                 | registerAdmin                    | unit        | WB/ statement coverage |
| √ should return a 400 error if at least one of the parameters in the request body is an empty string (1 ms)                                                                                                                                                 | registerAdmin                    | unit        | WB/ statement coverage |
| √ should return a 400 error if the request body does not contain all the necessary attributes                                                                                                                                                               | registerAdmin                    | unit        | WB/ statement coverage |
| √ should return a 500 error if error occurs (1 ms)                                                                                                                                                                                                          | registerAdmin                    | unit        | WB/ statement coverage |
| login                                                                                                                                                                                                                                                       |                                  | unit        | WB/ statement coverage |
| √ should log in successfully (1 ms)                                                                                                                                                                                                                         | login                            |             |                        |
| √ should return a 500 error if any error thrown (1 ms)                                                                                                                                                                                                      | login                            | unit        | WB/ statement coverage |
| √ should return a 400 error if the supplied password does not match with the one in the database   (1 ms)                                                                                                                                                   | login                            | unit        | WB/ statement coverage |
| √ should return a 400 error if the email in the request body does not identify a user in the database                                                                                                                                                       | login                            | unit        | WB/ statement coverage |
| √ should return a 400 error if the email in the request body is not in a valid email format                                                                                                                                                                 | login                            | unit        | WB/ statement coverage |
| √ should return a 400 error if at least one of the parameters in the request body is an empty string                                                                                                                                                        | login                            | unit        | WB/ statement coverage |
| √ should return a 400 error if the request body does not contain all the necessary attributes                                                                                                                                                               | login                            | unit        | WB/ statement coverage |
| logout                                                                                                                                                                                                                                                      |                                  |             |                        |
| √ should log out successfully (1 ms)                                                                                                                                                                                                                        | logout                           | unit        | WB/ statement coverage |
| √ should return a 500 error if error is thrown (1 ms)                                                                                                                                                                                                       | logout                           | unit        | WB/ statement coverage |
| √ should return a 400 error if the refresh token in the request's cookies does not represent a userin the database                                                                                                                                          | logout                           | unit        | WB/ statement coverage |
| √ should return a 400 error if the request does not have a refresh token in the cookies   (1 ms)                                                                                                                                                            | logout                           | unit        | WB/ statement coverage |
|                                                                                                                                                                                                                                                             |                                  |             |                        |
| PASS  test/controller.unit.test.js                                                                                                                                                                                                                          |                                  |             |                        |
| createCategory                                                                                                                                                                                                                                              |                                  |             |                        |
| √ should return 400 error if request body is incomplete (2 ms)                                                                                                                                                                                              | createCategory                   | unit        | WB/ statement coverage |
| √ should return 400 error if request body contains empty strings                                                                                                                                                                                            | createCategory                   | unit        | WB/ statement coverage |
| √ should return 401 error if called by an authenticated user who is not an admin                                                                                                                                                                            | createCategory                   | unit        | WB/ statement coverage |
| √ should return 400 if the type represents an already existing category in the database (1 ms)                                                                                                                                                              | createCategory                   | unit        | WB/ statement coverage |
| √ should create new category (1 ms)                                                                                                                                                                                                                         | createCategory                   | unit        | WB/ statement coverage |
| √ should return a 500 if an error occurs (1 ms)                                                                                                                                                                                                             | createCategory                   | unit        | WB/ statement coverage |
| updateCategory                                                                                                                                                                                                                                              |                                  |             |                        |
| √ should return 400 error if request body is incomplete                                                                                                                                                                                                     | updateCategory                   | unit        | WB/ statement coverage |
| √ should return 400 error if request body contains empty strings                                                                                                                                                                                            | updateCategory                   | unit        | WB/ statement coverage |
| √ should return 400 error if the type of category passed as a route parameter does not represent a category in the database                                                                                                                                 | updateCategory                   | unit        | WB/ statement coverage |
| √ should return 400 error if the type of category passed in the request body as the new type represents an already existing category in the database and that category is not the same as the requested one(1 ms)                                           | updateCategory                   | unit        | WB/ statement coverage |
| √ should return 401 error if called by an authenticated user who is not an admin                                                                                                                                                                            | updateCategory                   | unit        | WB/ statement coverage |
| √ should update a category's both type and color (1 ms)                                                                                                                                                                                                     | updateCategory                   | unit        | WB/ statement coverage |
| √ should update a category's color only                                                                                                                                                                                                                     | updateCategory                   | unit        | WB/ statement coverage |
| √ should return a 500 if an error occurs                                                                                                                                                                                                                    | updateCategory                   | unit        | WB/ statement coverage |
| deleteCategory                                                                                                                                                                                                                                              |                                  |             |                        |
| √ should return 400 error if request body is incomplete (1 ms)                                                                                                                                                                                              | deleteCategory                   | unit        | WB/ statement coverage |
| √ should return 400 error if called when there is only one category in the database                                                                                                                                                                         | deleteCategory                   | unit        | WB/ statement coverage |
| √ should return 400 error if at least one of the types in the array is an empty string                                                                                                                                                                      | deleteCategory                   | unit        | WB/ statement coverage |
| √ should return 400 error if the array passed in the request body is empty (1 ms)                                                                                                                                                                           | deleteCategory                   | unit        | WB/ statement coverage |
| √ should return 400 error if at least one of the types in the array does not represent a category in the database                                                                                                                                           | deleteCategory                   | unit        | WB/ statement coverage |
| √ should return 401 error if called by an authenticated user who is not an admin                                                                                                                                                                            | deleteCategory                   | unit        | WB/ statement coverage |
| √ should delete all categories except oldest and set transactions to oldest (1 ms)                                                                                                                                                                          | deleteCategory                   | unit        | WB/ statement coverage |
| √ should delete all categories and set transactions to oldest (3 ms)                                                                                                                                                                                        | deleteCategory                   | unit        | WB/ statement coverage |
| √ should return a 500 if an error occurs                                                                                                                                                                                                                    | deleteCategory                   | unit        | WB/ statement coverage |
| getCategories                                                                                                                                                                                                                                               |                                  |             |                        |
| √ should retreive all categories                                                                                                                                                                                                                            | getCategories                    | unit        | WB/ statement coverage |
| √ should return 401 error if called by an authenticated user who is not an admin (1 ms)                                                                                                                                                                     | getCategories                    | unit        | WB/ statement coverage |
| √ should return a 500 if an error occurs                                                                                                                                                                                                                    | getCategories                    | unit        | WB/ statement coverage |
| createTransaction                                                                                                                                                                                                                                           |                                  |             |                        |
| √ should return 400 error if request body is incomplete (1 ms)                                                                                                                                                                                              | createTransaction                | unit        | WB/ statement coverage |
| √ should return 400 error if request body contains empty strings                                                                                                                                                                                            | createTransaction                | unit        | WB/ statement coverage |
| √ should return 400 error if the type of category passed in the request body does not represent a category in the database (1 ms)                                                                                                                           | createTransaction                | unit        | WB/ statement coverage |
| √ should return 400 error if the username passed in the request body is not equal to the one passedas a route parameter                                                                                                                                     | createTransaction                | unit        | WB/ statement coverage |
| √ should return 400 error if the username passed in the request body does not represent a user in the database                                                                                                                                              | createTransaction                | unit        | WB/ statement coverage |
| √ should return 400 error if the username passed as a route parameter does not represent a user in the database                                                                                                                                             | createTransaction                | unit        | WB/ statement coverage |
| √ should return 400 error if the amount passed in the request body cannot be parsed as a floating value (negative numbers are accepted) (1 ms)                                                                                                              | createTransaction                | unit        | WB/ statement coverage |
| √ should return 401 error if user is not authenticated                                                                                                                                                                                                      | createTransaction                | unit        | WB/ statement coverage |
| √ should create transaction (2 ms)                                                                                                                                                                                                                          | createTransaction                | unit        | WB/ statement coverage |
| √ should return a 500 if an error occurs                                                                                                                                                                                                                    | createTransaction                | unit        | WB/ statement coverage |
| getAllTransactions                                                                                                                                                                                                                                          |                                  |             |                        |
| √ should return 401 error if called by an authenticated user who is not an admin                                                                                                                                                                            | getAllTransactions               | unit        | WB/ statement coverage |
| √ should retreive all transactions (1 ms)                                                                                                                                                                                                                   | getAllTransactions               | unit        | WB/ statement coverage |
| √ should return a 500 if an error occurs (1 ms)                                                                                                                                                                                                             | getAllTransactions               | unit        | WB/ statement coverage |
| getTransactionsByUser                                                                                                                                                                                                                                       |                                  |             |                        |
| √ should return 400 error if the user does not exist (1 ms)                                                                                                                                                                                                 | getTransactionsByUser            | unit        | WB/ statement coverage |
| √ should return 401 error if called by an authenticated user who is not the same user (user route)                                                                                                                                                          | getTransactionsByUser            | unit        | WB/ statement coverage |
| √ should return 401 error if called by an authenticated user who is not an admin (admin route) (1 ms)                                                                                                                                                       | getTransactionsByUser            | unit        | WB/ statement coverage |
| √ should throw a "unknown route" error if the path is wrong                                                                                                                                                                                                 | getTransactionsByUser            | unit        | WB/ statement coverage |
| √ should return all users transactions (user route with date) (1 ms)                                                                                                                                                                                        | getTransactionsByUser            | unit        | WB/ statement coverage |
| √ should return a 500 if an error occurs (1 ms)                                                                                                                                                                                                             | getTransactionsByUser            | unit        | WB/ statement coverage |
| getTransactionsByUserByCategory                                                                                                                                                                                                                             |                                  | unit        |                        |
| √ should show all user transactions of  given category (user route) (1 ms)                                                                                                                                                                                  | getTransactionsByUserByCategory  | unit        | WB/ statement coverage |
| √ should show all user transactions of  given category (admin route) (1 ms)                                                                                                                                                                                 | getTransactionsByUserByCategory  | unit        | WB/ statement coverage |
| √ should return a 500 error when error is thrown (1 ms)                                                                                                                                                                                                     | getTransactionsByUserByCategory  | unit        | WB/ statement coverage |
| √ should return 400 error if the username does not represent a user in the database                                                                                                                                                                         | getTransactionsByUserByCategory  | unit        | WB/ statement coverage |
| √ should return 400 error if the category does not represent a category in the database                                                                                                                                                                     | getTransactionsByUserByCategory  | unit        | WB/ statement coverage |
| √ should return 401 error if called by an authenticated user who is not the same user (user route)                                                                                                                                                          | getTransactionsByUserByCategory  | unit        | WB/ statement coverage |
| √ should return 401 error if called by an authenticated user who is not an admin (authType = Admin)                                                                                                                                                         | getTransactionsByUserByCategory  | unit        | WB/ statement coverage |
| √ should throw a "unknown route" error if the path is wrong (1 ms)                                                                                                                                                                                          | getTransactionsByUserByCategory  | unit        | WB/ statement coverage |
| getTransactionsByGroup                                                                                                                                                                                                                                      |                                  |             |                        |
| √ should return 400 error if the group name passed as a route parameter does not represent a group in the database (user route) (1 ms)                                                                                                                      | getTransactionsByGroup           | unit        | WB/ statement coverage |
| √ should return 400 error if the group name passed as a route parameter does not represent a group in the database (admin route)                                                                                                                            | getTransactionsByGroup           | unit        | WB/ statement coverage |
| √ should return 401 error if called by an authenticated user who is not part of the group (authType= Group) if the route is /api/groups/:name/transactions (1 ms)                                                                                           | getTransactionsByGroup           | unit        | WB/ statement coverage |
| √ should return 401 error if called by an authenticated user who is not an admin (authType = Admin)if the route is /api/transactions/groups/:name                                                                                                           | getTransactionsByGroup           | unit        | WB/ statement coverage |
| √ should throw a "unknown route" error if the path is wrong                                                                                                                                                                                                 | getTransactionsByGroup           | unit        | WB/ statement coverage |
| √ should show all transactions of members of user's group group (user route) (2 ms)                                                                                                                                                                         | getTransactionsByGroup           | unit        | WB/ statement coverage |
| √ should show all transactions of members of user's group group (admin route) (1 ms)                                                                                                                                                                        | getTransactionsByGroup           | unit        | WB/ statement coverage |
| getTransactionsByGroupByCategory                                                                                                                                                                                                                            |                                  |             |                        |
| √ should return 400 error if the group name passed as a route parameter does not represent a group in the database(user route)                                                                                                                              | getTransactionsByGroupByCategory | unit        | WB/ statement coverage |
| √ should return 400 error if the group name passed as a route parameter does not represent a group in the database(admin route) (1 ms)                                                                                                                      | getTransactionsByGroupByCategory | unit        | WB/ statement coverage |
| √ should return 400 error if the category passed as a route parameter does not represent a categoryin the database                                                                                                                                          | getTransactionsByGroupByCategory | unit        | WB/ statement coverage |
| √ should return 401 error if called by an authenticated user who is not part of the group (authType= Group) if the route is /api/groups/:name/transactions                                                                                                  | getTransactionsByGroupByCategory | unit        | WB/ statement coverage |
| √ should return 401 error if called by an authenticated user who is not an admin (authType = Admin)if the route is /api/transactions/groups/:name                                                                                                           | getTransactionsByGroupByCategory | unit        | WB/ statement coverage |
| √ should throw a "unknown route" error if the path is wrong                                                                                                                                                                                                 | getTransactionsByGroupByCategory | unit        | WB/ statement coverage |
| √ should show all transactions of member of a group (user route) (1 ms)                                                                                                                                                                                     | getTransactionsByGroupByCategory | unit        | WB/ statement coverage |
| √ should show all transactions of member of a group (admin route) (1 ms)                                                                                                                                                                                    | getTransactionsByGroupByCategory | unit        | WB/ statement coverage |
| deleteTransaction                                                                                                                                                                                                                                           |                                  |             |                        |
| √ should return 400 error if the request body does not contain all the necessary attributes (1 ms)                                                                                                                                                          | deleteTransaction                | unit        | WB/ statement coverage |
| √ should return 400 error if the _id in the request body is an empty string                                                                                                                                                                                 | deleteTransaction                | unit        | WB/ statement coverage |
| √ should return 400 error if the username passed as a route parameter does not represent a user in the database (1 ms)                                                                                                                                      | deleteTransaction                | unit        | WB/ statement coverage |
| √ should return 400 error if the _id in the request body does not represent a transaction in the database                                                                                                                                                   | deleteTransaction                | unit        | WB/ statement coverage |
| √ should return 400 error if the _id in the request body represents a transaction made by a different user than the one in the route (1 ms)                                                                                                                 | deleteTransaction                | unit        | WB/ statement coverage |
| √ should return 401 error if user is not authenticated                                                                                                                                                                                                      | deleteTransaction                | unit        | WB/ statement coverage |
| √ should delete a transaction (1 ms)                                                                                                                                                                                                                        | deleteTransaction                | unit        | WB/ statement coverage |
| √ should return a 500 if an error occurs                                                                                                                                                                                                                    | deleteTransaction                | unit        | WB/ statement coverage |
| deleteTransactions                                                                                                                                                                                                                                          |                                  |             |                        |
| √ should return 400 error if the request body does not contain all the necessary attributes (1 ms)                                                                                                                                                          | deleteTransactions               | unit        | WB/ statement coverage |
| √ should return 400 error if at least one of the ids in the array is an empty string                                                                                                                                                                        | deleteTransactions               | unit        | WB/ statement coverage |
| √ should return 400 error if at least one of the ids in the array does not represent a transaction in the database (1 ms)                                                                                                                                   | deleteTransactions               | unit        | WB/ statement coverage |
| √ should return 401 error if called by an authenticated user who is not an admin (authType = Admin)                                                                                                                                                         | deleteTransactions               | unit        | WB/ statement coverage |
| √ should delete all transactions in an array (1 ms)                                                                                                                                                                                                         | deleteTransactions               | unit        | WB/ statement coverage |
| √ should return a 500 error if error thrown (1 ms)                                                                                                                                                                                                          | deleteTransactions               | unit        | WB/ statement coverage |
|                                                                                                                                                                                                                                                             |                                  |             |                        |
| PASS  test/utils.unit.test.js                                                                                                                                                                                                                               |                                  |             |                        |
| handleDateFilterParams                                                                                                                                                                                                                                      |                                  |             |                        |
| √ should return an empty object when no date filtering parameters are provided (2 ms)                                                                                                                                                                       | handleDateFilterParams           | unit        | WB/ statement coverage |
| √ should throw an error if `date` parameter is provided together with `from` parameter (37 ms)                                                                                                                                                              | handleDateFilterParams           | unit        | WB/ statement coverage |
| √ should throw an error if `date` parameter is provided together with `upTo` parameter (1 ms)                                                                                                                                                               | handleDateFilterParams           | unit        | WB/ statement coverage |
| √ should throw an error if `date` parameter has an invalid format (1 ms)                                                                                                                                                                                    | handleDateFilterParams           | unit        | WB/ statement coverage |
| √ should handle `date` parameter correctly                                                                                                                                                                                                                  | handleDateFilterParams           | unit        | WB/ statement coverage |
| √ should handle `from` parameter correctly                                                                                                                                                                                                                  | handleDateFilterParams           | unit        | WB/ statement coverage |
| √ should throw an error if `from` parameter has an invalid format (1 ms)                                                                                                                                                                                    | handleDateFilterParams           | unit        | WB/ statement coverage |
| √ should handle `upTo` parameter correctly                                                                                                                                                                                                                  | handleDateFilterParams           | unit        | WB/ statement coverage |
| √ should throw an error if `upTo` parameter has an invalid format (1 ms)                                                                                                                                                                                    | handleDateFilterParams           | unit        | WB/ statement coverage |
| √ should handle both `from` and `upTo` parameters correctly                                                                                                                                                                                                 | handleDateFilterParams           | unit        | WB/ statement coverage |
| verifyAuth                                                                                                                                                                                                                                                  |                                  |             |                        |
| √ authType Simple, should authorize without refresh token (2 ms)                                                                                                                                                                                            | verifyAuth                       | unit        | WB/ statement coverage |
| √ authType Simple, should authorize and refresh token (4 ms)                                                                                                                                                                                                | verifyAuth                       | unit        | WB/ statement coverage |
| √ authType User, should authorize and refresh token (username match (1 ms)                                                                                                                                                                                  | verifyAuth                       | unit        | WB/ statement coverage |
| √ authType User, should not authorize (username mismatch) (1 ms)                                                                                                                                                                                            | verifyAuth                       | unit        | WB/ statement coverage |
| √ authType Group, should authorize and refresh token (user in group email (1 ms)                                                                                                                                                                            | verifyAuth                       | unit        | WB/ statement coverage |
| √ authType Group, should not authorize since user not in the group                                                                                                                                                                                          | verifyAuth                       | unit        | WB/ statement coverage |
| √ authType Admin, should authorize and refresh token (user role is admin (1 ms)                                                                                                                                                                             | verifyAuth                       | unit        | WB/ statement coverage |
| √ authType Admin, should not authorize(user role is not admin                                                                                                                                                                                               | verifyAuth                       | unit        | WB/ statement coverage |
| √ authType unknown, should not authorize                                                                                                                                                                                                                    | verifyAuth                       | unit        | WB/ statement coverage |
| √ authType Simple, should not authorize if error occurs when refreshing                                                                                                                                                                                     | verifyAuth                       | unit        | WB/ statement coverage |
| √ should not authorize if mismatched tokens (1 ms)                                                                                                                                                                                                          | verifyAuth                       | unit        | WB/ statement coverage |
| √ should not authorize if access token with missing information                                                                                                                                                                                             | verifyAuth                       | unit        | WB/ statement coverage |
| √ should not authorize if access token verify fails (1 ms)                                                                                                                                                                                                  | verifyAuth                       | unit        | WB/ statement coverage |
| √ should not authorize if refresh token with missing information                                                                                                                                                                                            | verifyAuth                       | unit        | WB/ statement coverage |
| √ should not authorize if refresh token verify fails                                                                                                                                                                                                        | verifyAuth                       | unit        | WB/ statement coverage |
| √ should not authorize if refresh token expired                                                                                                                                                                                                             | verifyAuth                       | unit        | WB/ statement coverage |
| √ should not authorize if missing/empty token                                                                                                                                                                                                               | verifyAuth                       | unit        | WB/ statement coverage |
| handleAmountFilterParams                                                                                                                                                                                                                                    |                                  |             |                        |
| √ should return an empty object when no query parameters are provided                                                                                                                                                                                       | handleAmountFilterParams         | unit        | WB/ statement coverage |
| √ should return the correct filter object when only 'min' is provided                                                                                                                                                                                       | handleAmountFilterParams         | unit        | WB/ statement coverage |
| √ should return the correct filter object when only 'max' is provided                                                                                                                                                                                       | handleAmountFilterParams         | unit        | WB/ statement coverage |
| √ should return the correct filter object when both 'min' and 'max' are provided                                                                                                                                                                            | handleAmountFilterParams         | unit        | WB/ statement coverage |
| √ should throw an error when 'min' value is not a number                                                                                                                                                                                                    | handleAmountFilterParams         | unit        | WB/ statement coverage |
| √ should throw an error when 'max' value is not a number                                                                                                                                                                                                    | handleAmountFilterParams         | unit        | WB/ statement coverage |
| √ should throw an error when 'min' value is not a number when both 'min' and 'max' are provided                                                                                                                                                             | handleAmountFilterParams         | unit        | WB/ statement coverage |
| √ should throw an error when 'max' value is not a number when both 'min' and 'max' are provided                                                                                                                                                             | handleAmountFilterParams         | unit        | WB/ statement coverage |
| PASS  test/users.unit.test.js                                                                                                                                                                                                                               |                                  |             |                        |
| getUsers                                                                                                                                                                                                                                                    |                                  |             |                        |
| √ should retreive all users (3 ms)                                                                                                                                                                                                                          | getUsers                         | unit        | WB/ statement coverage |
| √ should return a 500 error when error is thrown (1 ms)                                                                                                                                                                                                     | getUsers                         | unit        | WB/ statement coverage |
| √ should return a 401 error if called by an authenticated user who is not an admin (authType = Admin)   (1 ms)                                                                                                                                              | getUsers                         | unit        | WB/ statement coverage |
| getUser                                                                                                                                                                                                                                                     |                                  |             |                        |
| √ should retreive user (user auth) (1 ms)                                                                                                                                                                                                                   | getUser                          | unit        | WB/ statement coverage |
| √ should retreive user (admin auth)                                                                                                                                                                                                                         | getUser                          | unit        | WB/ statement coverage |
| √ should return a 500 error when error is thrown                                                                                                                                                                                                            | getUser                          | unit        | WB/ statement coverage |
| √ should return a 400 error if the username passed as the route parameter does not represent a userin the database   (1 ms)                                                                                                                                 | getUser                          | unit        | WB/ statement coverage |
| √ should return a 401 error if called by an authenticated user who is neither the same user as the one in the route parameter (authType = User) nor an admin (authType = Admin)   (1 ms)                                                                    | getUser                          | unit        | WB/ statement coverage |
| createGroup                                                                                                                                                                                                                                                 |                                  |             |                        |
| √ should create the group (6 ms)                                                                                                                                                                                                                            | createGroup                      | unit        | WB/ statement coverage |
| √ should create the group even if calling user email not present and repeating elements (6 ms)                                                                                                                                                              | createGroup                      | unit        | WB/ statement coverage |
| √ should return a 500 error if error is thrown (2 ms)                                                                                                                                                                                                       | createGroup                      | unit        | WB/ statement coverage |
| √ should return a 400 error if all the provided emails (the ones in the array, the email of the user calling the function does not have to be considered in this case) represent users that are already in a group or do not exist in the database   (2 ms) | createGroup                      | unit        | WB/ statement coverage |
| √ should return a 400 error if the user who calls the API is already in a group   (1 ms)                                                                                                                                                                    | createGroup                      | unit        | WB/ statement coverage |
| √ should return a 400 error if the user who calls the API is not found using refresh token  (1 ms)                                                                                                                                                          | createGroup                      | unit        | WB/ statement coverage |
| √ should return a 400 error if the group name passed in the request body represents an already existing group in the database                                                                                                                               | createGroup                      | unit        | WB/ statement coverage |
| √ should return a 400 error if the group name passed in the request body is an empty string                                                                                                                                                                 | createGroup                      | unit        | WB/ statement coverage |
| √ should return a 400 error if at least one of the member emails is an empty string   (1 ms)                                                                                                                                                                | createGroup                      | unit        | WB/ statement coverage |
| √ should return a 400 error if at least one of the member emails is not in a valid email format                                                                                                                                                             | createGroup                      | unit        | WB/ statement coverage |
| √ should return a 400 error if the request body does not contain all the necessary attributes                                                                                                                                                               | createGroup                      | unit        | WB/ statement coverage |
| √ should return a 400 error if the request body does not contain all the necessary attributes (1 ms)                                                                                                                                                        | createGroup                      | unit        | WB/ statement coverage |
| getGroups                                                                                                                                                                                                                                                   |                                  |             |                        |
| √ should retreive all groups                                                                                                                                                                                                                                | getGroups                        | unit        | WB/ statement coverage |
| √ should return a 500 error when error thrown (1 ms)                                                                                                                                                                                                        | getGroups                        | unit        | WB/ statement coverage |
| √ should return a 401 error if called by an authenticated user who is not an admin (authType = Admin)                                                                                                                                                       | getGroups                        | unit        | WB/ statement coverage |
| getGroup                                                                                                                                                                                                                                                    |                                  | unit        | WB/ statement coverage |
| √ should retreive the group (user auth)                                                                                                                                                                                                                     | getGroup                         | unit        | WB/ statement coverage |
| √ should retreive the group (admin auth)                                                                                                                                                                                                                    | getGroup                         | unit        | WB/ statement coverage |
| √ should return a 500 error if error thrown (admin) (1 ms)                                                                                                                                                                                                  | getGroup                         | unit        | WB/ statement coverage |
| √ should return a 401 error if called by an authenticated user who is neither part of the group (authType = Group) nor an admin (authType = Admin)                                                                                                          | getGroup                         | unit        | WB/ statement coverage |
| √ should return a 400 error if the group name passed as a route parameter does not represent a group in the database (admin)   (1 ms)                                                                                                                       | getGroup                         | unit        | WB/ statement coverage |
| √ should return a 400 error if the group name passed as a route parameter does not represent a group in the database (user)   (1 ms)                                                                                                                        | getGroup                         | unit        | WB/ statement coverage |
| addToGroup                                                                                                                                                                                                                                                  |                                  |             |                        |
| √ should add to the group (user route) filtering repeating emails (4 ms)                                                                                                                                                                                    | addToGroup                       | unit        | WB/ statement coverage |
| √ should add to the group (admin route) filtering repeating emails (3 ms)                                                                                                                                                                                   | addToGroup                       | unit        | WB/ statement coverage |
| √ should return a 500 error when error is thrown (3 ms)                                                                                                                                                                                                     | addToGroup                       | unit        | WB/ statement coverage |
| √ should return a 400 error if all the provided emails represent users that do not belong to the group or do not exist in the database (2 ms)                                                                                                               | addToGroup                       | unit        | WB/ statement coverage |
| √ should return a 400 error if at least one of the member emails is not in a valid email format (1 ms)                                                                                                                                                      | addToGroup                       | unit        | WB/ statement coverage |
| √ should return a 400 error if at least one of the member emails is an empty string                                                                                                                                                                         | addToGroup                       | unit        | WB/ statement coverage |
| √ should return a 400 error if the group name passed as a route parameter does not represent a group in the database   (1 ms)                                                                                                                               | addToGroup                       | unit        | WB/ statement coverage |
| √ should return a 401 error if called by an authenticated user who is not part of the group (authType = Group) if the route is api/groups/:name/add                                                                                                         | addToGroup                       | unit        | WB/ statement coverage |
| √ should return a 401 error if called by an authenticated user who is not an admin (authType = Admin) if the route is api/groups/:name/insert (1 ms)                                                                                                        | addToGroup                       | unit        | WB/ statement coverage |
| √ should return a 400 error if group not found in admin route                                                                                                                                                                                               | addToGroup                       | unit        | WB/ statement coverage |
| √ should return a 500 error when function accessed using unknown route (1 ms)                                                                                                                                                                               | addToGroup                       | unit        | WB/ statement coverage |
| removeFromGroup                                                                                                                                                                                                                                             |                                  |             |                        |
| √ should remove from the group (admin route) (1 ms)                                                                                                                                                                                                         | removeFromGroup                  | unit        | WB/ statement coverage |
| √ should remove from the group (user route) (1 ms)                                                                                                                                                                                                          | removeFromGroup                  | unit        | WB/ statement coverage |
| √ should return a 500 error when error is thrown (1 ms)                                                                                                                                                                                                     | removeFromGroup                  | unit        | WB/ statement coverage |
| √ should return a 400 error if all the provided emails represent users that do not belong to the group or do not exist in the database   (1 ms)                                                                                                             | removeFromGroup                  | unit        | WB/ statement coverage |
| √ should return a 400 error if at least one of the emails is not in a valid email format   (1 ms)                                                                                                                                                           | removeFromGroup                  | unit        | WB/ statement coverage |
| √ should return a 400 error if at least one of the emails is an empty string   (1 ms)                                                                                                                                                                       | removeFromGroup                  | unit        | WB/ statement coverage |
| √ should return a 400 error if the request body does not contain all the necessary attributes                                                                                                                                                               | removeFromGroup                  | unit        | WB/ statement coverage |
| √ should return a 400 error if the group contains only one member before deleting any user   (1 ms)                                                                                                                                                         | removeFromGroup                  | unit        | WB/ statement coverage |
| √ should return a 401 error if called by an authenticated user who is not part of the group (authType = Group) if the route is api/groups/:name/remove                                                                                                      | removeFromGroup                  | unit        | WB/ statement coverage |
| √ should return a 400 error if the group name passed as a route parameter does not represent a group in the database (user route)                                                                                                                           | removeFromGroup                  | unit        | WB/ statement coverage |
| √ should return a 400 error if the group name passed as a route parameter does not represent a group in the database (admin route)                                                                                                                          | removeFromGroup                  | unit        | WB/ statement coverage |
| √ should return a 401 error if called by an authenticated user who is not an admin (authType = Admin) if the route is api/groups/:name/pull                                                                                                                 | removeFromGroup                  | unit        | WB/ statement coverage |
| √ should return a 500 error when accessed by unknown route (1 ms)                                                                                                                                                                                           | removeFromGroup                  | unit        | WB/ statement coverage |
| deleteUser                                                                                                                                                                                                                                                  |                                  |             |                        |
| √ should delete user and member in a group (1 ms)                                                                                                                                                                                                           | deleteUser                       | unit        | WB/ statement coverage |
| √ should return a 500 when error is thrown (1 ms)                                                                                                                                                                                                           | deleteUser                       | unit        | WB/ statement coverage |
| √ should delete user and group (1 ms)                                                                                                                                                                                                                       | deleteUser                       | unit        | WB/ statement coverage |
| √ should delete user but not group member (1 ms)                                                                                                                                                                                                            | deleteUser                       | unit        | WB/ statement coverage |
| √ should return a 400 error if the email passed in the request body represents an admin                                                                                                                                                                     | deleteUser                       | unit        | WB/ statement coverage |
| √ should return a 400 error if the email passed in the request body does not represent a user in the database   (1 ms)                                                                                                                                      | deleteUser                       | unit        | WB/ statement coverage |
| √ should return a 400 error if the email passed in the request body is not in correct email format                                                                                                                                                          | deleteUser                       | unit        | WB/ statement coverage |
| √ should return a 400 error if the email passed in the request body is an empty string                                                                                                                                                                      | deleteUser                       | unit        | WB/ statement coverage |
| √ should return a 400 error if the request body does not contain all the necessary atributes                                                                                                                                                                | deleteUser                       | unit        | WB/ statement coverage |
| √ should return a 401 error if called by an authenticated user who is not an admin (authType = Admin)                                                                                                                                                       | deleteUser                       | unit        | WB/ statement coverage |
| deleteGroup                                                                                                                                                                                                                                                 |                                  | unit        |                        |
| √ should delete group successfully (1 ms)                                                                                                                                                                                                                   | deleteGroup                      | unit        | WB/ statement coverage |
| √ should return a 500 error if error thrown                                                                                                                                                                                                                 | deleteGroup                      | unit        | WB/ statement coverage |
| √ should return a 400 error if the name passed in the request body does not represent a group in the database   (1 ms)                                                                                                                                      | deleteGroup                      | unit        | WB/ statement coverage |
| √ should return a 400 error if the name passed in the request body is an empty string                                                                                                                                                                       | deleteGroup                      | unit        | WB/ statement coverage |
| √ should return a 400 error if the request body does not contain all the necessary attributes   (1 ms)                                                                                                                                                      | deleteGroup                      | unit        | WB/ statement coverage |
| √ should return a 401 error if called by an authenticated user who is not an admin (authType = Admin)                                                                                                                                                       | deleteGroup                      | unit        | WB/ statement coverage |












































































































































































































































































































































































































































































# Coverage



## Coverage of FR

<Report in the following table the coverage of  functional requirements (from official requirements) >

| Functional Requirements covered | Test(s) |
| ------------------------------- | ------- |
| FRx                             |         |
| FRy                             |         |
| ...                             |         |



## Coverage white box

<!-- Report here the screenshot of coverage values obtained with jest-- coverage  -->
![Coverage ScreenShot](/diagrams/Coverage.png){: .shadow}






