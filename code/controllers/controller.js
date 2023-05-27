import { categories, transactions } from "../models/model.js";
import { Group, User } from "../models/User.js";
import { handleDateFilterParams, handleAmountFilterParams, verifyAuth } from "./utils.js";

import validator from 'validator';


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

        //get attributes
        const { type, color } = req.body;

        //validate attributes
        if (!type || !color) return res.status(400).json({ error: "incomplete attribute" });
        if (type == "" || color == "") return res.status(400).json({ error: "empty string" });

        //authenticate
        const adminAuth = verifyAuth(req, res, { authType: 'Admin' });
        if (!adminAuth.authorized) {
            return res.status(401).json({ error: adminAuth.cause })
        }

        //check if category exists
        const existingCategory = await categories.findOne({ type: type });
        if (existingCategory) return res.status(400).json({ error: "category already exists" });

        //create and save category
        const new_categories = new categories({ type, color });
        await new_categories.save() //auto throws duplicate type error
            .then(data => res.status(200).json({ data: { type: data.type, color: data.color }, refreshedTokenMessage: res.locals.refreshedTokenMessage }));

    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}

/**
 * updateCategory
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
Returns a 400 error if the type of category passed in the request body as the new type represents an already existing category in the database
Returns a 401 error if called by an authenticated user who is not an admin (authType = Admin)
 */
export const updateCategory = async (req, res) => {
    try {
        // get attributes
        const currentType = req.params.type;
        const newType = req.body.type;
        const newColor = req.body.color;


        //validate attributes
        if (!currentType || !newType || !newColor) return res.status(400).json({ error: "incomplete attribute" });
        if (currentType == "" || newType == "" || newColor == "") return res.status(400).json({ error: "empty string" });

        //authenticate
        const adminAuth = verifyAuth(req, res, { authType: 'Admin' });
        if (!adminAuth.authorized) {
            return res.status(401).json({ error: adminAuth.cause }) // unauthorized
        }

        //confirm category to be updated exists
        const currentCategory = await categories.findOne({ type: currentType });
        if (!currentCategory) return res.status(400).json({ error: "category does not exist" });

        //confirm new category type does not exist
        if (
            (newType != currentType) &&
            (await categories.findOne({ type: newType }))
        ) return res.status(401).json({ error: "new category exists" });

        //update category
        currentCategory.type = newType;
        currentCategory.color = newColor;
        await currentCategory.save();

        //update transactions
        const count = (await transactions.updateMany({ type: currentType }, { type: newType })).modifiedCount;

        //return successful and transactions update count
        return res.status(200).json({ data: { message: "Category edited successfully", count: count } });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

/**
 * deleteCategory
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
Returns a 400 error if at least one of the types in the array does not represent a category in the database
Returns a 401 error if called by an authenticated user who is not an admin (authType = Admin)
 */
export const deleteCategory = async (req, res) => {
    try {
        //get attributes
        const types = req.body.types;
        //validate attributes
        if (!types || !Array.isArray(types)) return res.status(400).json({ error: "incomplete attribute" });
        if (types.length === 0) return res.status(400).json({ error: "no categories to delete" });
        const typeArray = types.map(String);
        if (typeArray.includes("")) return res.status(400).json({ error: "empty strings" });

        //verify admin
        const adminAuth = verifyAuth(req, res, { authType: 'Admin' });
        if (!adminAuth.authorized) {
            return res.status(401).json({ error: adminAuth.cause }) // unauthorized
        }

        if (await categories.countDocuments({}) <= 1) return res.status(400).json({ error: "only zero or one category exists" });

        //check all categories to be deleted exist
        for (const type of typeArray) {
            if (! await categories.countDocuments({ type: type })) {
                return res.status(400).json({ error: "at least one type does not exist" });
            }
        }

        //delete categories, keep atleast one, generate list of deleted types
        let deletedTypeArray = [];
        for (const type of typeArray) {
            if (await categories.countDocuments({}) > 1) {
                await categories.deleteOne({ type: type });
                deletedTypeArray.push(type);
            }
        };

        //get first category in database
        const firstCategoryType = (await categories.findOne({})).type;

        //replace all deleted types in transaction with first type and get count modified
        const count = (await transactions.updateMany({ type: { $in: deletedTypeArray } }, { type: firstCategoryType })).modifiedCount;

        return res.status(200).json({ data: { message: "Categories deleted", count: count }, refreshedTokenMessage: res.locals.refreshedTokenMessage });

    } catch (error) {
        res.status(500).json({ error: error.message });
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
        const simpleAuth = verifyAuth(req, res, { authType: 'Simple' });
        if (!simpleAuth.authorized) {
            return res.status(401).json({ error: simpleAuth.cause }) // unauthorized
        }

        let data = await categories.find({})
        let filter = data.map(v => Object.assign({}, { type: v.type, color: v.color }))
        return res.status(200).json({ data: filter, refreshedTokenMessage: res.locals.refreshedTokenMessage });

    } catch (error) {
        res.status(500).json({ error: error.message })
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
        //get attributes
        const { username, amount, type } = req.body;

        //validate attributes
        if (!username || !amount || !type) return res.status(400).json({ error: "incomplete attribute" });
        if (username == "" || amount == "" || type == "") return res.status(400).json({ error: "empty strings" });
        if (!validator.isFloat(amount)) return res.status(400).json({ error: "amount cannot be parsed as floating value" });
        if (username != req.params.username) return res.status(400).json({ error: "cannot add other user's transaction" });

        //authenticate
        const userAuth = verifyAuth(req, res, { authType: "User", username: req.params.username });
        if (!userAuth.authorized) {
            return res.status(401).json({ error: userAuth.cause })
        }

        if (!(await User.findOne({ username: username }))) return res.status(401).json({ error: "user with the username not found" });

        if (!(await categories.findOne({ type: type }))) {
            return res.status(401).json({ error: "category does not exist" });
        }

        const new_transactions = new transactions({ username, amount, type });
        await new_transactions.save()
            .then(data => res.status(200).json({ data: { username: data.username, amount: data.amount, type: data.type, date: data.date }, refreshedTokenMessage: res.locals.refreshedTokenMessage }));

    } catch (err) {
        res.status(500).json({ error: err.message })
    }
}

/**
 * getAllTransactions
Request Parameters: None
Request Body Content: None
Response data Content: An array of objects, each one having attributes username, type, amount, date and color
Example: res.status(200).json({data: [{username: "Mario", amount: 100, type: "food", date: "2023-05-19T00:00:00", color: "red"}, {username: "Mario", amount: 70, type: "health", date: "2023-05-19T10:00:00", color: "green"}, {username: "Luigi", amount: 20, type: "food", date: "2023-05-19T10:00:00", color: "red"} ], refreshedTokenMessage: res.locals.refreshedTokenMessage})
Returns a 401 error if called by an authenticated user who is not an admin (authType = Admin)
 */
export const getAllTransactions = async (req, res) => {
    try {

        //verify admin
        const adminAuth = verifyAuth(req, res, { authType: 'Admin' });
        if (!adminAuth.authorized) {
            return res.status(401).json({ error: adminAuth.cause }) // unauthorized
        }
        /**
         * MongoDB equivalent to the query "SELECT * FROM transactions, categories WHERE transactions.type = categories.type"
         */
        await transactions.aggregate([
            {
                $lookup: {
                    from: "categories",
                    localField: "type",
                    foreignField: "type",
                    as: "categories_info"
                }
            },
            { $unwind: "$categories_info" }
        ]).then(
            (result) => {
                let data = result.map(
                    v =>
                        Object.assign({},
                            { username: v.username, amount: v.amount, type: v.type, date: v.date, color: v.categories_info.color }
                        )
                );
                res.status(200).json({ data: data, refreshedTokenMessage: res.locals.refreshedTokenMessage });
            }
        );

    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}

/**
 * getTransactionsByUser
Request Parameters: A string equal to the username of the involved user
Example: /api/users/Mario/transactions (user route)
Example: /api/transactions/users/Mario (admin route)
Request Body Content: None
Response data Content: An array of objects, each one having attributes username, type, amount, date and color
Example: res.status(200).json({data: [{username: "Mario", amount: 100, type: "food", date: "2023-05-19T00:00:00", color: "red"}, {username: "Mario", amount: 70, type: "health", date: "2023-05-19T10:00:00", color: "green"} ] refreshedTokenMessage: res.locals.refreshedTokenMessage})
Returns a 400 error if the username passed as a route parameter does not represent a user in the database
Returns a 401 error if called by an authenticated user who is not the same user as the one in the route (authType = User) if the route is /api/users/:username/transactions
Returns a 401 error if called by an authenticated user who is not an admin (authType = Admin) if the route is /api/transactions/users/:username
Can be filtered by date and amount if the necessary query parameters are present and if the route is /api/users/:username/transactions ****
 */
export const getTransactionsByUser = async (req, res) => {
    try {

        const username = req.params.username;
        let queryParams;

        //admin route
        if (req.url.includes("transactions/users") >= 0) {
            const adminAuth = verifyAuth(req, res, { authType: 'Admin' });
            if (!adminAuth.authorized) {
                return res.status(401).json({ error: adminAuth.cause })
            }
        }

        //user route
        else if (req.url.endsWith("/transactions") >= 0) {
            const userAuth = verifyAuth(req, res, { authType: "User", username: req.params.username });
            if (!userAuth.authorized) {
                return res.status(401).json({ error: userAuth.cause })
            }
        }
        else {
            throw new Error('unknown route');
        }

        if (! await User.findOne({ username: username })) return res.status(400).json({ error: "user does not exist" });

        /**
        * MongoDB equivalent to the query "SELECT * FROM transactions, categories WHERE transactions.type = categories.type"
        */
        await transactions.aggregate([
            {
                $lookup: {
                    from: "categories",
                    localField: "type",
                    foreignField: "type",
                    as: "categories_info"
                }
            },
            {
                $match: {
                    username: username
                }
            },
            { $unwind: "$categories_info" }
        ]).then((result) => {
            let data = result.map(v => Object.assign({}, { username: v.username, amount: v.amount, type: v.type, date: v.date, color: v.categories_info.color }))
            res.status(200).json({ data: data, refreshedTokenMessage: res.locals.refreshedTokenMessage });
        });

    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}

/**
 * The behavior defined below applies only for the specified route
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

        const username = req.params.username;
        const category = req.params.category;
        let queryParams;

        //admin route
        if (req.url.includes("/transactions/users/") >= 0) {
            const adminAuth = verifyAuth(req, res, { authType: 'Admin' });
            if (!adminAuth.authorized) {
                return res.status(401).json({ error: adminAuth.cause })
            }
        }

        //user route
        else if (req.url.includes("/transactions/category/") >= 0) {
            const userAuth = verifyAuth(req, res, { authType: "User", username: req.params.username });
            if (!userAuth.authorized) {
                return res.status(401).json({ error: userAuth.cause })
            }
        }
        else {
            throw new Error('unknown route');
        }

        if (! await User.findOne({ username: username })) return res.status(400).json({ error: "user does not exist" });
        if (! await categories.findOne({ type: category })) return res.status(400).json({ error: "category does not exist" });

        /**
        * MongoDB equivalent to the query "SELECT * FROM transactions, categories WHERE transactions.type = categories.type"
        */
        await transactions.aggregate([
            {
                $lookup: {
                    from: "categories",
                    localField: "type",
                    foreignField: "type",
                    as: "categories_info"
                }
            },
            {
                $match: {
                    username: username,
                    type: category
                }
            },
            { $unwind: "$categories_info" }
        ]).then((result) => {
            let data = result.map(v => Object.assign({}, { username: v.username, amount: v.amount, type: v.type, date: v.date, color: v.categories_info.color }))
            res.status(200).json({ data: data, refreshedTokenMessage: res.locals.refreshedTokenMessage });
        });

    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}


/**
 * getTransactionsByGroup
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

        if (!req.params.name) return res.status(400).json({ error: "no group name" });

        const group = await Group.findOne({ name: req.params.name }).populate('members.user');
        if (!group) return res.status(400).json("group does not exist");
        //console.log(group);

        //authenticate//
        //admin route
        if (req.url.includes("/transactions/groups/") >= 0) {
            const auth = verifyAuth(req, res, { authType: 'Admin' });
            if (!auth.authorized) {
                return res.status(401).json({ error: adminAuth.cause })
            }
        }
        //user route
        else if (req.url.endsWith("/transactions") >= 0) {
            const auth = verifyAuth(req, res,
                {
                    authType: "Group",
                    emails: group.members.map(member => member.email)
                }
            );
            if (!auth.authorized) {
                return res.status(401).json({ error: userAuth.cause })
            }
        }
        else {
            throw new Error('unknown route');
        }

        await transactions.aggregate(
            [
                {
                    $lookup: {
                        from: "categories",
                        localField: "type",
                        foreignField: "type",
                        as: "categories_info"
                    }
                }
                , {
                    $match: {
                        username: {
                            $in: group.members.map(m => m.user.username)
                        }
                    },
                },
                { $unwind: "$categories_info" }
            ]
        ).then((result) => {
            //console.log(result);
            let data = result.map(v => Object.assign({}, { username: v.username, amount: v.amount, type: v.type, date: v.date, color: v.categories_info.color }))
            res.status(200).json({ data: data, refreshedTokenMessage: res.locals.refreshedTokenMessage });
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: error.message })
    }
}


/**
 * getTransactionsByGroupByCategory
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

        if (!req.params.name) return res.status(400).json({ error: "no group paramter" });
        if (!req.params.category) return res.status(400).json({ error: "no category parameter" });


        const group = await Group.findOne({ name: req.params.name }).populate('members.user');
        if (!group) return res.status(400).json("group does not exist");
        //console.log(group);

        const category = await categories.findOne({ type: req.params.category });
        if (!category) return res.status(400).json("category does not exist");

        //authenticate//
        //admin route
        if (req.url.includes("/transactions/groups/") >= 0) {
            const auth = verifyAuth(req, res, { authType: 'Admin' });
            if (!auth.authorized) {
                return res.status(401).json({ error: adminAuth.cause })
            }
        }
        //user route
        else if (req.url.includes("/transactions/category/") >= 0) {
            const auth = verifyAuth(req, res,
                {
                    authType: "Group",
                    emails: group.members.map(member => member.email)
                }
            );
            if (!auth.authorized) {
                return res.status(401).json({ error: userAuth.cause })
            }
        }
        else {
            throw new Error('unknown route');
        }

        await transactions.aggregate(
            [
                {
                    $lookup: {
                        from: "categories",
                        localField: "type",
                        foreignField: "type",
                        as: "categories_info"
                    }
                }
                , {
                    $match: {
                        username: {
                            $in: group.members.map(m => m.user.username)
                        },
                        type: category.type
                    },
                },
                { $unwind: "$categories_info" }
            ]
        ).then((result) => {
            //console.log(result);
            let data = result.map(v => Object.assign({}, { username: v.username, amount: v.amount, type: v.type, date: v.date, color: v.categories_info.color }))
            res.status(200).json({ data: data, refreshedTokenMessage: res.locals.refreshedTokenMessage });
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: error.message })
    }
}



/**
 * deleteTransaction
Request Parameters: A string equal to the username of the involved user
Example: /api/users/Mario/transactions
Request Body Content: The _id of the transaction to be deleted
Example: {_id: "6hjkohgfc8nvu786"}
Response data Content: A string indicating successful deletion of the transaction
Example: res.status(200).json({data: {message: "Transaction deleted"}, refreshedTokenMessage: res.locals.refreshedTokenMessage})
Returns a 400 error if the request body does not contain all the necessary attributes
Returns a 400 error if the username passed as a route parameter does not represent a user in the database
Returns a 400 error if the _id in the request body does not represent a transaction in the database
Returns a 401 error if called by an authenticated user who is not the same user as the one in the route (authType = User)
 */
export const deleteTransaction = async (req, res) => {
    try {

        const username = req.params.username;
        const transaction_id = req.body._id;

        if (!username || !transaction_id) return res.status(400).json({ error: "incomplete attributes" });

        //authenticate user
        const auth = verifyAuth(req, res, { authType: "User", username: username });
        if (!auth.authorized) {
            return res.status(401).json({ error: auth.cause })
        }

        if (! await User.findOne({ username: username })) return res.status(400).json({ error: "user does not exist" });
        if (! await transactions.findOne({ _id: transaction_id })) return res.status(400).json({ error: "transaction does not exist" });

        await transactions.deleteOne({ _id: transaction_id });

        return res.status(200).json({ data: { message: "Transaction deleted" }, refreshedTokenMessage: res.locals.refreshedTokenMessage })

    } catch (error) {
        console.log(error);
        res.status(500).json({ error: error.message })
    }
}

/**
 * deleteTransactions
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

        const _ids = req.body._ids;
        if (!_ids || !Array.isArray(_ids) || _ids.length == 0) return res.status(400).json({ error: "incomplete attributes" });

        if (_ids.includes("")) return res.status(400).json({ error: "at least one empty string id" });

        const adminAuth = verifyAuth(req, res, { authType: 'Admin' });
        if (!adminAuth.authorized) {
            return res.status(401).json({ error: adminAuth.cause }) //unauthorized
        }

        for (const _id of _ids) {
            if (! await transactions.countDocuments({ _id: _id })) {
                return res.status(400).json({ error: "at least one transaction does not exist" });
            }
        }

        await transactions.deleteMany({ _id: { $in: _ids } })

        return res.status(200).json({ data: { message: "Transactions deleted" }, refreshedTokenMessage: res.locals.refreshedTokenMessage });

    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}
