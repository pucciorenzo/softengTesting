import { categories, transactions } from "../models/model.js";
import { Group, User } from "../models/User.js";
import { handleDateFilterParams, handleAmountFilterParams, verifyAuth } from "./utils.js";


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
        const existingCategory = categories.findOne({ type: type });
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
 * Return all the categories
  - Request Body Content: None
  - Response `data` Content: An array of objects, each one having attributes `type` and `color`
  - Optional behavior:
    - empty array is returned if there are no categories
 */
export const getCategories = async (req, res) => {
    try {
        const simpleAuth = verifyAuth(req, res, { authType: 'Simple' });
        if (!simpleAuth.authorized) {
            return res.status(401).json({ error: simpleAuth.cause }) // unauthorized
        }
        let data = await categories.find({})
        let filter = data.map(v => Object.assign({}, { type: v.type, color: v.color }))
        return res.status(200).json({ data: filter });
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}

/**
 * Create a new transaction made by a specific user
  - Request Body Content: An object having attributes `username`, `type` and `amount`
  - Response `data` Content: An object having attributes `username`, `type`, `amount` and `date`
  - Optional behavior:
    - error 401 is returned if the username or the type of category does not exist
 */
export const createTransaction = async (req, res) => {
    try {
        const adminAuth = verifyAuth(req, res, { authType: 'Admin' });
        if (!adminAuth.authorized) {
            const userAuth = verifyAuth(req, res, { authType: "User", username: req.params.username });
            if (!userAuth.authorized) {
                return res.status(401).json({ error: userAuth.cause })
            }
        }
        const { username, amount, type } = req.body;
        if (username != req.params.username) return res.status(401).json({ error: "cannot add other user's transaction" });
        if (!(await categories.findOne({ type: type }))) {
            return res.status(401).json({ error: "category does not exist" });
        }
        const new_transactions = new transactions({ username, amount, type });
        await new_transactions.save()
            .then(data => res.status(200).json({ data: data, message: "transaction created successfully" }))
            .catch(err => { throw err });
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
}

/**
 * Return all transactions made by all users
  - Request Body Content: None
  - Response `data` Content: An array of objects, each one having attributes `username`, `type`, `amount`, `date` and `color`
  - Optional behavior:
    - empty array must be returned if there are no transactions
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
        transactions.aggregate([
            {
                $lookup: {
                    from: "categories",
                    localField: "type",
                    foreignField: "type",
                    as: "categories_info"
                }
            },
            { $unwind: "$categories_info" }
        ]).then((result) => {
            let data = result.map(v => Object.assign({}, { _id: v._id, username: v.username, amount: v.amount, type: v.type, color: v.categories_info.color, date: v.date }))
            res.status(200).json(data);
        }).catch(error => { throw (error) })
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}

/**
 * Return all transactions made by a specific user
  - Request Body Content: None
  - Response `data` Content: An array of objects, each one having attributes `username`, `type`, `amount`, `date` and `color`
  - Optional behavior:
    - error 401 is returned if the user does not exist
    - empty array is returned if there are no transactions made by the user
    - if there are query parameters and the function has been called by a Regular user then the returned transactions must be filtered according to the query parameters
 */
export const getTransactionsByUser = async (req, res) => {
    try {
        //Distinction between route accessed by Admins or Regular users for functions that can be called by both
        //and different behaviors and access rights
        /* if (req.url.indexOf("/transactions/users/") >= 0) {
         } else {
         }
         */

        const adminAuth = verifyAuth(req, res, { authType: 'Admin' });
        if (!adminAuth.authorized) {
            const userAuth = verifyAuth(req, res, { authType: "User", username: req.params.username });
            if (!userAuth.authorized) {
                return res.status(401).json({ error: userAuth.cause })
            }
        }

        //user self access and admin any access
        /**
        * MongoDB equivalent to the query "SELECT * FROM transactions, categories WHERE transactions.type = categories.type"
        */
        transactions.aggregate([
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
                    username: req.params.username
                }
            },
            { $unwind: "$categories_info" }
        ]).then((result) => {
            let data = result.map(v => Object.assign({}, { _id: v._id, username: v.username, amount: v.amount, type: v.type, color: v.categories_info.color, date: v.date }))
            res.json(data);
        }).catch(error => { throw (error) })
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}

/**
 * Return all transactions made by a specific user filtered by a specific category
  - Request Body Content: None
  - Response `data` Content: An array of objects, each one having attributes `username`, `type`, `amount`, `date` and `color`, filtered so that `type` is the same for all objects
  - Optional behavior:
    - empty array is returned if there are no transactions made by the user with the specified category
    - error 401 is returned if the user or the category does not exist
 */
export const getTransactionsByUserByCategory = async (req, res) => {
    try {
        //Distinction between route accessed by Admins or Regular users for functions that can be called by both
        //and different behaviors and access rights
        /* if (req.url.indexOf("/transactions/users/") >= 0) {
         } else {
         }
         */

        const adminAuth = verifyAuth(req, res, { authType: 'Admin' });
        if (!adminAuth.authorized) {
            const userAuth = verifyAuth(req, res, { authType: "User", username: req.params.username });
            if (!userAuth.authorized) {
                return res.status(401).json({ error: userAuth.cause })
            }
        }

        //user self access and admin any access
        /**
        * MongoDB equivalent to the query "SELECT * FROM transactions, categories WHERE transactions.type = categories.type"
        */
        transactions.aggregate([
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
                    username: req.params.username,
                    type: req.params.category
                }
            },
            { $unwind: "$categories_info" }
        ]).then((result) => {
            let data = result.map(v => Object.assign({}, { _id: v._id, username: v.username, amount: v.amount, type: v.type, color: v.categories_info.color, date: v.date }))
            res.json(data);
        }).catch(error => { throw (error) })
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}


/**
 * Return all transactions made by members of a specific group
  - Request Body Content: None
  - Response `data` Content: An array of objects, each one having attributes `username`, `type`, `amount`, `date` and `color`
  - Optional behavior:
    - error 401 is returned if the group does not exist
    - empty array must be returned if there are no transactions made by the group
 */
//router.get("/transactions/groups/:name", getTransactionsByGroup)
export const getTransactionsByGroup = async (req, res) => {
    try {
        //Distinction between route accessed by Admins or Regular users for functions that can be called by both
        //and different behaviors and access rights
        /* if (req.url.indexOf("/transactions/users/") >= 0) {
         } else {
         }
         */
        let group = await Group.findOne({ name: req.params.name });
        if (!group) return res.status(401).json("group does not exist");

        const adminAuth = verifyAuth(req, res, { authType: 'Admin' });
        if (!adminAuth.authorized) {
            const groupAuth = verifyAuth(req, res, { authType: "Group", emails: group.members.map(member => { return member.email }) });
            if (!userAuth.authorized) {
                return res.status(401).json({ error: userAuth.cause })
            }
        }
        //user self access and admin any access
        /**
        * MongoDB equivalent to the query "SELECT * FROM transactions, categories WHERE transactions.type = categories.type"
        */
        transactions.aggregate([
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
                        $in: group.members.map(async (member) => { return (await User.findOne({ email: member.email })) })
                    }
                }
            },
            { $unwind: "$categories_info" }
        ]).then((result) => {
            let data = result.map(v => Object.assign({}, { _id: v._id, username: v.username, amount: v.amount, type: v.type, color: v.categories_info.color, date: v.date }))
            res.json(data);
        }).catch(error => { throw (error) })
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}


/**
 * Return all transactions made by members of a specific group filtered by a specific category
  - Request Body Content: None
  - Response `data` Content: An array of objects, each one having attributes `username`, `type`, `amount`, `date` and `color`, filtered so that `type` is the same for all objects.
  - Optional behavior:
    - error 401 is returned if the group or the category does not exist
    - empty array must be returned if there are no transactions made by the group with the specified category
 */
export const getTransactionsByGroupByCategory = async (req, res) => {
    try {
        //Distinction between route accessed by Admins or Regular users for functions that can be called by both
        //and different behaviors and access rights
        /* if (req.url.indexOf("/transactions/users/") >= 0) {
         } else {
         }
         */
        let group = await Group.findOne({ name: req.params.name });
        if (!group) return res.status(401).json("group does not exist");
        let category = await categories.findOne({ name: req.params.category });
        if (!category) return res.status(401).json("category does not exist");

        const adminAuth = verifyAuth(req, res, { authType: 'Admin' });
        if (!adminAuth.authorized) {
            const groupAuth = verifyAuth(req, res, { authType: "Group", emails: group.members.map(member => { return member.email }) });
            if (!userAuth.authorized) {
                return res.status(401).json({ error: userAuth.cause })
            }
        }
        //user self access and admin any access
        /**
        * MongoDB equivalent to the query "SELECT * FROM transactions, categories WHERE transactions.type = categories.type"
        */
        transactions.aggregate([
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
                        $in: group.members.map(member => { return member.user.username })
                    },
                    type: req.params.category
                }
            },
            { $unwind: "$categories_info" }
        ]).then((result) => {
            let data = result.map(v => Object.assign({}, { _id: v._id, username: v.username, amount: v.amount, type: v.type, color: v.categories_info.color, date: v.date }))
            res.json(data);
        }).catch(error => { throw (error) })
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}


/**
 * Delete a transaction made by a specific user
  - Request Body Content: The `_id` of the transaction to be deleted
  - Response `data` Content: A string indicating successful deletion of the transaction
  - Optional behavior:
    - error 401 is returned if the user or the transaction does not exist
 */
export const deleteTransaction = async (req, res) => {
    try {
        const adminAuth = verifyAuth(req, res, { authType: 'Admin' });
        if (!adminAuth.authorized) {
            const userAuth = verifyAuth(req, res, { authType: "User", username: req.params.username });
            if (!userAuth.authorized) {
                return res.status(401).json({ error: userAuth.cause })
            }
        }
        let user = User.findOne({ name: req.params.username });
        if (!user) return res.status(401).json("user does not exist");
        let transaction = await transactions.findOne({ username: user.username, _id: req.params._id });
        if (!transaction) return res.status(401).json("transaction does not exist");
        await transactions.deleteOne({ _id: req.params._id });
        return res.json("deleted successfully")
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}

/**
 * Delete multiple transactions identified by their ids
  - Request Body Content: An array of strings that lists the `_ids` of the transactions to be deleted
  - Response `data` Content: A message confirming successful deletion
  - Optional behavior:
    - error 401 is returned if at least one of the `_ids` does not have a corresponding transaction. Transactions that have an id are not deleted in this case
 */
export const deleteTransactions = async (req, res) => {
    try {
        const adminAuth = verifyAuth(req, res, { authType: 'Admin' });
        if (!adminAuth.authorized) {
            return res.status(401).json({ error: adminAuth.cause })
        }
        const ids = req.body._ids;
        ids.forEach(async id => {
            let transaction = await transactions.findOne({ _id: req.params._id });
            if (!transaction) return res.status(401).json("at least one transaction does not exist");
        })
        ids.forEach(async id => {
            await transactions.deleteOne({ _id: req.params._id });
        })
        return res.json("all trnasactions deleted succsssfully")
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}
