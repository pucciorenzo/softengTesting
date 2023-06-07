import { categories, transactions } from "../models/model.js";
import { Group, User } from "../models/User.js";
import { handleDateFilterParams, handleAmountFilterParams, verifyAuth } from "./utils.js";

import { createValueTypeObject, validateValueType, validateValueTypes, resError, resData } from "../helpers/extraUtils.js";

/**
 * Error response:
 * res.status(errorCode).json({ error: "Error message" });
 */



/**
* createCategory
Request Parameters: None
Request Body Content: An object having attributes type and color
Example: {type: "food", color: "red"}
Response data Content: An object having attributes type and color
Example: res.status(200).json({data: {type: "food", color: "red"}, refreshedTokenMessage: res.locals.refreshedTokenMessage})
Returns a 400 error if the request body does not contain all the necessary attributes
Returns a 400 error if at least one of the parameters in the request body is an empty string
Returns a 400 error if the type of category passed in the request body represents an already existing category in the database
Returns a 401 error if called by an authenticated user who is not an admin (authType = Admin)
*/
export const createCategory = async (req, res) => {
    try {

        //authenticate
        const auth = verifyAuth(req, res, { authType: 'Admin' });
        if (!auth.flag) return resError(res, 401, auth.cause);

        //get attributes
        const { type, color } = req.body;

        //validate attributes
        const validation = validateValueTypes([
            createValueTypeObject(type, 'string'),
            createValueTypeObject(color, 'string')
        ]);
        if (!validation.flag) return resError(res, 400, validation.cause);

        //check if category exists
        if (await categories.findOne({ type: type })) return resError(res, 400, "category already exists");

        //create and save category
        const new_categories = new categories({ type, color });
        await new_categories.save() //auto throws duplicate type error
            .then(data => resData(res, { type: data.type, color: data.color }));

    } catch (error) {
        console.log(error)
        resError(res, 500, error.message);
    }
}

/**
updateCategory
Request Parameters: A string equal to the type of the category that must be edited
Example: api/categories/food
Request Body Content: An object having attributes type and color equal to the new values to assign to the category
Example: {type: "Food", color: "yellow"}
Response data Content: An object with parameter message that confirms successful editing and a parameter count that is equal to the count of transactions whose category was changed with the new type
Example: res.status(200).json({data: {message: "Category edited successfully", count: 2}, refreshedTokenMessage: res.locals.refreshedTokenMessage})
In case any of the following errors apply then the category is not updated, and transactions are not changed
Returns a 400 error if the request body does not contain all the necessary attributes
Returns a 400 error if at least one of the parameters in the request body is an empty string
Returns a 400 error if the type of category passed as a route parameter does not represent a category in the database
Returns a 400 error if the type of category passed in the request body as the new type represents an already existing category in the database and that category is not the same as the requested one
Returns a 401 error if called by an authenticated user who is not an admin (authType = Admin)
 */
export const updateCategory = async (req, res) => {
    try {

        //authenticate
        const auth = verifyAuth(req, res, { authType: 'Admin' });
        if (!auth.flag) return resError(res, 401, auth.cause); // unauthorized

        //get parameters
        const currentType = req.params.type;

        // get attributes
        const newType = req.body.type;
        const newColor = req.body.color;

        //validate attributes
        const validation = validateValueTypes([
            createValueTypeObject(newType, 'string'),
            createValueTypeObject(newColor, 'string'),
        ]);
        if (!validation.flag) return resError(res, 400, validation.cause);

        //confirm category to be updated exists
        const currentCategory = await categories.findOne({ type: currentType });
        if (!currentCategory) return resError(res, 400, "category does not exist");

        //confirm new category type does not exist
        if (newType != currentType && await categories.findOne({ type: newType })) return resError(res, 400, "new category exists");

        //update category
        currentCategory.type = newType;
        currentCategory.color = newColor;
        await currentCategory.save();

        //update transactions
        const count = (await transactions.updateMany({ type: currentType }, { type: newType })).modifiedCount;

        //return successful and updated transactions count
        return resData(res, { message: "Category edited successfully", count: count });

    } catch (error) {
        resError(res, 500, error.message);
    }
}

/**
deleteCategory
Request Parameters: None
Request Body Content: An array of strings that lists the types of the categories to be deleted
Example: {types: ["health"]}
Response data Content: An object with an attribute message that confirms successful deletion and an attribute count that specifies the number of transactions that have had their category type changed
Example: res.status(200).json({data: {message: "Categories deleted", count: 1}, refreshedTokenMessage: res.locals.refreshedTokenMessage})
Given N = categories in the database and T = categories to delete:
If N > T then all transactions with a category to delete must have their category set to the oldest category that is not in T
If N = T then the oldest created category cannot be deleted and all transactions must have their category set to that category
In case any of the following errors apply then no category is deleted
Returns a 400 error if the request body does not contain all the necessary attributes
Returns a 400 error if called when there is only one category in the database
Returns a 400 error if at least one of the types in the array is an empty string
Returns a 400 error if the array passed in the request body is empty
Returns a 400 error if at least one of the types in the array does not represent a category in the database
Returns a 401 error if called by an authenticated user who is not an admin (authType = Admin)
 */
export const deleteCategory = async (req, res) => {
    try {

        //verify admin
        const auth = verifyAuth(req, res, { authType: 'Admin' });
        if (!auth.flag) return resError(res, 401, auth.cause); // unauthorized

        //get attributes
        let typesToDelete = req.body.types;

        //validate attributes
        const validation = validateValueType(createValueTypeObject(typesToDelete, 'stringArray'));
        if (!validation.flag) return resError(res, 400, validation.cause);

        //get current categories types in database
        let currentTypes = (await categories.find({})).map(c => c.type);

        //check more than one category exists
        if (currentTypes.length <= 1) return resError(res, 400, "only zero or one category exists");

        //check all categories to be deleted exists and track duplicates
        const uniqueTypes = {};
        for (const typeToDelete of typesToDelete) {
            if (!currentTypes.includes(typeToDelete)) {
                return resError(res, 400, "at least one type does not exist");
            }
            uniqueTypes[typeToDelete] = typeToDelete;
        }

        //remove duplicates
        typesToDelete = Object.keys(uniqueTypes);

        //N==T, if deleting all categories, don't delete oldest
        let oldestType = currentTypes[0];
        if (currentTypes.length == typesToDelete.length) typesToDelete = typesToDelete.filter(t => t != oldestType);

        //N>T, find the oldest among remaining categories after deletion
        for (const type of typesToDelete) {
            currentTypes = currentTypes.filter(ct => ct != type)
        }
        oldestType = currentTypes[0];

        //delete categories
        await categories.deleteMany(
            {
                type: { $in: typesToDelete }
            }
        );

        //replace all deleted types in transaction with oldest type and get count modified
        const count = (await transactions.updateMany({ type: { $in: typesToDelete } }, { type: oldestType })).modifiedCount;

        //send data
        return resData(res, { message: "Categories deleted", count: count });

    } catch (error) {
        resError(res, 500, error.message);
    }
}

/**
 * getCategories
Request Parameters: None
Request Body Content: None
Response data Content: An array of objects, each one having attributes type and color
Example: res.status(200).json({data: [{type: "food", color: "red"}, {type: "health", color: "green"}], refreshedTokenMessage: res.locals.refreshedTokenMessage})
Returns a 401 error if called by a user who is not authenticated (authType = Simple)
 */
export const getCategories = async (req, res) => {
    try {

        //authenticate
        const auth = verifyAuth(req, res, { authType: 'Simple' });
        if (!auth.flag) return resError(res, 401, auth.cause); // unauthorized

        //retreive all categories and format
        let data = (await categories.find({})).map(v => Object.assign({}, { type: v.type, color: v.color }));

        //send data
        return resData(res, data);

    } catch (error) {
        resError(res, 500, error.message);
    }
}

/**
createTransaction
Request Parameters: A string equal to the username of the involved user
Example: /api/users/Mario/transactions
Request Body Content: An object having attributes username, type and amount
Example: {username: "Mario", amount: 100, type: "food"}
Response data Content: An object having attributes username, type, amount and date
Example: res.status(200).json({data: {username: "Mario", amount: 100, type: "food", date: "2023-05-19T00:00:00"}, refreshedTokenMessage: res.locals.refreshedTokenMessage})
Returns a 400 error if the request body does not contain all the necessary attributes
Returns a 400 error if at least one of the parameters in the request body is an empty string
Returns a 400 error if the type of category passed in the request body does not represent a category in the database
Returns a 400 error if the username passed in the request body is not equal to the one passed as a route parameter
Returns a 400 error if the username passed in the request body does not represent a user in the database
Returns a 400 error if the username passed as a route parameter does not represent a user in the database
Returns a 400 error if the amount passed in the request body cannot be parsed as a floating value (negative numbers are accepted)
Returns a 401 error if called by an authenticated user who is not the same user as the one in the route parameter (authType = User)
 */
export const createTransaction = async (req, res) => {
    try {

        //authenticate
        const auth = verifyAuth(req, res, { authType: "User", username: req.params.username });
        if (!auth.flag) return resError(res, 401, auth.cause);

        //get attributes
        let { username, amount, type } = req.body;

        //validate attributes
        const validation = validateValueTypes([
            createValueTypeObject(username, 'string'),
            createValueTypeObject(amount, 'amount'),
            createValueTypeObject(type, 'string'),
        ])
        if (!validation.flag) return resError(res, 400, validation.cause);

        //convert amount to number if string
        amount = parseFloat(amount);

        //check users exist
        if (!(await User.findOne({ username: username }))) return resError(res, 400, "user does not exist");
        if (!(await User.findOne({ username: req.params.username }))) return resError(res, 400, "user passed as a route parameter does not exist");

        //check if calling user adds his own transaction
        if (username != req.params.username) return resError(res, 400, "cannot add other user's transaction");

        //check category exists
        if (!(await categories.findOne({ type: type }))) return resError(res, 400, "category does not exist");

        //create and save new transaction
        const new_transactions = new transactions({ username, amount, type });
        await new_transactions.save()
            //send saved transaction as response data
            .then(data => resData(res, { username: data.username, amount: data.amount, type: data.type, date: data.date }));

    } catch (error) {
        resError(res, 500, error.message);
    }
}

/**
getAllTransactions
Request Parameters: None
Request Body Content: None
Response data Content: An array of objects, each one having attributes username, type, amount, date and color
Example: res.status(200).json({data: [{username: "Mario", amount: 100, type: "food", date: "2023-05-19T00:00:00", color: "red"}, {username: "Mario", amount: 70, type: "health", date: "2023-05-19T10:00:00", color: "green"}, {username: "Luigi", amount: 20, type: "food", date: "2023-05-19T10:00:00", color: "red"} ], refreshedTokenMessage: res.locals.refreshedTokenMessage})
Returns a 401 error if called by an authenticated user who is not an admin (authType = Admin)
 */
export const getAllTransactions = async (req, res) => {
    try {

        //verify admin
        const auth = verifyAuth(req, res, { authType: 'Admin' });
        if (!auth.flag) return resError(res, 401, auth.cause); // unauthorized

        //join transactions and categories table using type field
        await transactions.aggregate(
            [
                {
                    $lookup: {
                        from: "categories",
                        localField: "type",
                        foreignField: "type",
                        as: "categories_info"
                    }
                },
                { $unwind: "$categories_info" }
            ]
        ).then(
            (result) => {
                //format data
                let data = result.map(v =>
                    Object.assign(
                        {},
                        { username: v.username, amount: v.amount, type: v.type, date: v.date, color: v.categories_info.color }
                    )
                );
                //send
                resData(res, data);
            }
        );

    } catch (error) {
        resError(res, 500, error.message);
    }
}

/**
getTransactionsByUser
Request Parameters: A string equal to the username of the involved user
Example: /api/users/Mario/transactions (user route)
Example: /api/transactions/users/Mario (admin route)
Request Body Content: None
Response data Content: An array of objects, each one having attributes username, type, amount, date and color
Example: res.status(200).json({data: [{username: "Mario", amount: 100, type: "food", date: "2023-05-19T00:00:00", color: "red"}, {username: "Mario", amount: 70, type: "health", date: "2023-05-19T10:00:00", color: "green"} ] refreshedTokenMessage: res.locals.refreshedTokenMessage})
Returns a 400 error if the username passed as a route parameter does not represent a user in the database
Returns a 401 error if called by an authenticated user who is not the same user as the one in the route (authType = User) if the route is /api/users/:username/transactions
Returns a 401 error if called by an authenticated user who is not an admin (authType = Admin) if the route is /api/transactions/users/:username
Can be filtered by date and amount if the necessary query parameters are present and if the route is /api/users/:username/transactions
 */
export const getTransactionsByUser = async (req, res) => {
    try {

        //let dateFilter = { date: { $gte: new Date("2023-04-30T00:00:00.000Z") } };
        let dateFilter = {};
        let amountFilter = {};

        //authenticate//
        //admin route
        if ((/transactions\/users/).test(req.url)) {

            //authenticate as admin
            const auth = verifyAuth(req, res, { authType: 'Admin' });
            if (!auth.flag) return resError(res, 401, auth.cause);

            //don't use date amount filters
            //dateFilter = amountFilter = {};

        }

        //user route
        else if ((/\/users\/.+\/transactions.*/).test(req.url)) {

            //authenticate as user
            const auth = verifyAuth(req, res, { authType: "User", username: req.params.username });
            if (!auth.flag) return resError(res, 401, auth.cause);

            //also use filters if specified in parameter
            dateFilter = handleDateFilterParams(req);
            amountFilter = handleAmountFilterParams(req);
        }

        //unrecognized route
        else {
            throw new Error('unknown route');
        }

        //check if user exists
        if (! await User.findOne({ username: req.params.username })) return resError(res, 400, "user does not exist");

        /**
        * MongoDB equivalent to the query "SELECT * FROM transactions, categories WHERE transactions.type = categories.type"
        */
        await transactions.aggregate([
            {
                //join transactions and categories using type field
                $lookup: {
                    from: "categories",
                    localField: "type",
                    foreignField: "type",
                    as: "categories_info"
                }
            },
            {
                //filter the transactions
                $match: {
                    username: req.params.username,
                    ...dateFilter,
                    ...amountFilter
                }
            },
            { $unwind: "$categories_info" }
        ]).then((result) => {
            //format data
            let data = result.map(v => Object.assign({}, { username: v.username, amount: v.amount, type: v.type, date: v.date, color: v.categories_info.color }))
            //send
            resData(res, data);
        });
    } catch (error) {
        resError(res, 500, error.message);
    }
}

/**
getTransactionsByUserByCategory
The behavior defined below applies only for the specified route
Request Parameters: A string equal to the username of the involved user, a string equal to the requested category
Example: /api/users/Mario/transactions/category/food (user route)
Example: /api/transactions/users/Mario/category/food (admin route)
Request Body Content: None
Response data Content: An array of objects, each one having attributes username, type, amount, date and color, filtered so that type is the same for all objects
Example: res.status(200).json({data: [{username: "Mario", amount: 100, type: "food", date: "2023-05-19T00:00:00", color: "red"} ] refreshedTokenMessage: res.locals.refreshedTokenMessage})
Returns a 400 error if the username passed as a route parameter does not represent a user in the database
Returns a 400 error if the category passed as a route parameter does not represent a category in the database
Returns a 401 error if called by an authenticated user who is not the same user as the one in the route (authType = User) if the route is /api/users/:username/transactions/category/:category
Returns a 401 error if called by an authenticated user who is not an admin (authType = Admin) if the route is /api/transactions/users/:username/category/:category
 */
export const getTransactionsByUserByCategory = async (req, res) => {
    try {

        //authenticate//
        //admin route
        if (req.url.includes("/transactions/users/")) {
            const auth = verifyAuth(req, res, { authType: 'Admin' });
            if (!auth.flag) return resError(res, 401, auth.cause);

        }
        //user route
        else if (req.url.includes("/transactions/category/")) {
            const auth = verifyAuth(req, res, { authType: "User", username: req.params.username });
            if (!auth.flag) return resError(res, 401, auth.cause);
        }
        //unknown route
        else {
            throw new Error('unknown route');
        }

        //check user exists
        if (! await User.findOne({ username: req.params.username })) return resError(res, 400, "user does not exist");

        //check category exists
        if (! await categories.findOne({ type: req.params.category })) return resError(res, 400, "category does not exist");

        /**
        * MongoDB equivalent to the query "SELECT * FROM transactions, categories WHERE transactions.type = categories.type"
        */
        await transactions.aggregate([
            {
                //join transactions and categories
                $lookup: {
                    from: "categories",
                    localField: "type",
                    foreignField: "type",
                    as: "categories_info"
                }
            },
            {
                //filter
                $match: {
                    username: req.params.username,
                    type: req.params.category
                }
            },
            { $unwind: "$categories_info" }
        ]).then((result) => {
            //prepare data
            let data = result.map(v => Object.assign({}, { username: v.username, amount: v.amount, type: v.type, date: v.date, color: v.categories_info.color }))
            //send data
            resData(res, data);
        });

    } catch (error) {
        resError(res, 500, error.message);
    }
}


/**
getTransactionsByGroup
Request Parameters: A string equal to the name of the requested group
Example: /api/groups/Family/transactions (user route)
Example: /api/transactions/groups/Family (admin route)
Request Body Content: None
Response data Content: An array of objects, each one having attributes username, type, amount, date and color
Example: res.status(200).json({data: [{username: "Mario", amount: 100, type: "food", date: "2023-05-19T00:00:00", color: "red"}, {username: "Mario", amount: 70, type: "health", date: "2023-05-19T10:00:00", color: "green"}, {username: "Luigi", amount: 20, type: "food", date: "2023-05-19T10:00:00", color: "red"} ] refreshedTokenMessage: res.locals.refreshedTokenMessage})
Returns a 400 error if the group name passed as a route parameter does not represent a group in the database
Returns a 401 error if called by an authenticated user who is not part of the group (authType = Group) if the route is /api/groups/:name/transactions
Returns a 401 error if called by an authenticated user who is not an admin (authType = Admin) if the route is /api/transactions/groups/:name
 */
export const getTransactionsByGroup = async (req, res) => {
    try {
        let route;

        if (req.url.includes("/transactions/groups"))
            route = 'admin';
        else if ((/groups\/.+\/transactions/).test(req.url))
            route = 'user'
        else throw new Error('unknown route');
        
        let group = await Group.findOne({ name: req.params.name });
        if(!group) return res.status(400).json( { error: "group does not exist" } );

        let auth;

        //authenticate//
        switch(route) {
            case 'admin':   //admin route
                auth = verifyAuth(req, res, { authType: 'Admin' });
                if (!auth.flag) return resError(res, 401, auth.cause);
            case 'user':    //user route
                auth = verifyAuth(req, res, { authType: "Group", emails: group.members.map(member => member.email) });
                if (!auth.flag) return resError(res, 401, auth.cause);
        }

        group = await (await Group.findOne({ name: req.params.name })).populate('members.user');

        //retreive and send data
        await transactions.aggregate(
            [
                {
                    //join transactions and categories table
                    $lookup: {
                        from: "categories",
                        localField: "type",
                        foreignField: "type",
                        as: "categories_info"
                    }
                }
                , {
                    //filter
                    $match: {
                        username: {
                            $in: group.members.map(m => m.user.username)
                        }
                    },
                },
                { $unwind: "$categories_info" }
            ]
        ).then((result) => {
            //prepare data
            let data = result.map(v => Object.assign({}, { username: v.username, amount: v.amount, type: v.type, date: v.date, color: v.categories_info.color }))

            //send data
            resData(res, data);
        });
    } catch (error) {
        console.log(error);
        resError(res, 500, error.message);
    }
}


/**
getTransactionsByGroupByCategory
Request Parameters: A string equal to the name of the requested group, a string equal to the requested category
Example: /api/groups/Family/transactions/category/food (user route)
Example: /api/transactions/groups/Family/category/food (admin route)
Request Body Content: None
Response data Content: An array of objects, each one having attributes username, type, amount, date and color, filtered so that type is the same for all objects.
Example: res.status(200).json({data: [{username: "Mario", amount: 100, type: "food", date: "2023-05-19T00:00:00", color: "red"}, {username: "Luigi", amount: 20, type: "food", date: "2023-05-19T10:00:00", color: "red"} ] refreshedTokenMessage: res.locals.refreshedTokenMessage})
Returns a 400 error if the group name passed as a route parameter does not represent a group in the database
Returns a 400 error if the category passed as a route parameter does not represent a category in the database
Returns a 401 error if called by an authenticated user who is not part of the group (authType = Group) if the route is /api/groups/:name/transactions/category/:category
Returns a 401 error if called by an authenticated user who is not an admin (authType = Admin) if the route is /api/transactions/groups/:name/category/:category
 */
export const getTransactionsByGroupByCategory = async (req, res) => {
    try {
        let route;

        if (req.url.includes("/transactions/groups"))
            route = 'admin';
        else if((/groups\/.+\/transactions/).test(req.url))
            route = 'user';
        else throw new Error('unknown route');

        const groupName = req.params.name;

        let group = await Group.findOne({ name: groupName });
        if(!group) return res.status(400).json( { error: "group does not exist" } );
        
        //check category exists
        const category = req.params.category;
        if (!(await categories.findOne({ type: category }))) return resError(res, 400, "category does not exist");

        let auth;
        //authenticate//
        switch(route) {
        case 'admin':   //admin route
            auth = verifyAuth(req, res, { authType: 'Admin' });
            if (!auth.flag) return resError(res, 401, auth.cause);
        case 'user':   //user route
            auth = verifyAuth(req, res, { authType: "Group", emails: group.members.map(member => member.email) });
            if (!auth.flag) return resError(res, 401, auth.cause);
        }

        group = await (await Group.findOne({ name: groupName })).populate('members.user');

        await transactions.aggregate(
            [
                {
                    //join categories and transactions table
                    $lookup: {
                        from: "categories",
                        localField: "type",
                        foreignField: "type",
                        as: "categories_info"
                    }
                }
                , {
                    //filter
                    $match: {
                        username: {
                            $in: group.members.map(m => m.user.username)
                        },
                        type: category
                    },
                },
                { $unwind: "$categories_info" }
            ]
        ).then((result) => {

            //prepare data
            let data = result.map(v => Object.assign({}, { username: v.username, amount: v.amount, type: v.type, date: v.date, color: v.categories_info.color }))

            //send data
            resData(res, data);
        });

    } catch (error) {
        console.log(error);
        resError(res, 500, error.message);
    }
}



/**
deleteTransaction
Request Parameters: A string equal to the username of the involved user
Example: /api/users/Mario/transactions
Request Body Content: The _id of the transaction to be deleted
Example: {_id: "6hjkohgfc8nvu786"}
Response data Content: A string indicating successful deletion of the transaction
Example: res.status(200).json({data: {message: "Transaction deleted"}, refreshedTokenMessage: res.locals.refreshedTokenMessage})
Returns a 400 error if the request body does not contain all the necessary attributes
Returns a 400 error if the _id in the request body is an empty string
Returns a 400 error if the username passed as a route parameter does not represent a user in the database
Returns a 400 error if the _id in the request body does not represent a transaction in the database
Returns a 400 error if the _id in the request body represents a transaction made by a different user than the one in the route
Returns a 401 error if called by an authenticated user who is not the same user as the one in the route (authType = User)
 */
export const deleteTransaction = async (req, res) => {
    try {

        //authenticate user
        const auth = verifyAuth(req, res, { authType: "User", username: req.params.username });
        if (!auth.flag) return resError(res, 401, auth.cause)

        //get attribute
        const transaction_id = req.body._id;

        //validate attribute
        const validation = validateValueType(createValueTypeObject(transaction_id, 'string'));
        if (!validation.flag) return resError(res, 400, validation.cause);

        //get parameter
        const username = req.params.username;

        //check user exists
        if (! await User.findOne({ username: username })) return resError(res, 400, "user does not exist");

        //check transaction exists
        const transaction = await transactions.findOne({ _id: transaction_id });
        if (!transaction) return resError(res, 400, "transaction does not exist");

        //check calling user made the transaction
        if (transaction.username != username) return resError(res, 400, "transaction made by different user");

        //delete the transaction
        await transactions.deleteOne({ _id: transaction_id });

        //send success
        return resData(res, { message: "Transaction deleted" });

    } catch (error) {
        console.log(error);
        resError(res, 500, error.message);
    }
}

/**
deleteTransactions
Request Parameters: None
Request Body Content: An array of strings that lists the _ids of the transactions to be deleted
Example: {_ids: ["6hjkohgfc8nvu786"]}
Response data Content: A message confirming successful deletion
Example: res.status(200).json({data: {message: "Transactions deleted"}, refreshedTokenMessage: res.locals.refreshedTokenMessage})
In case any of the following errors apply then no transaction is deleted
Returns a 400 error if the request body does not contain all the necessary attributes
Returns a 400 error if at least one of the ids in the array is an empty string
Returns a 400 error if at least one of the ids in the array does not represent a transaction in the database
Returns a 401 error if called by an authenticated user who is not an admin (authType = Admin)
 */
export const deleteTransactions = async (req, res) => {
    try {

        //authenticate
        const auth = verifyAuth(req, res, { authType: 'Admin' });
        if (!auth.flag) return resError(res, 401, auth.cause) //unauthorized

        //get attribute
        const _ids = req.body._ids;

        //validate attribute
        const validation = validateValueType(createValueTypeObject(_ids, 'stringArray'));
        if (!validation.flag) resError(res, 400, validation.cause);

        //check if all transactions exist
        for (const _id of _ids) {

            if (! await transactions.countDocuments({ _id: _id })) return resError(res, 400, "at least one transaction does not exist");

        }

        //delete transactions
        await transactions.deleteMany({ _id: { $in: _ids } })

        //send data
        return resData(res, { message: "Transactions deleted" });

    } catch (error) {
        resError(res, 500, error.message);
    }
}
