import { categories, transactions } from '../models/model';
import { Group, User } from '../models/User';
import { handleAmountFilterParams, handleDateFilterParams, verifyAuth } from '../controllers/utils';
import { createCategory, createTransaction, deleteCategory, deleteTransaction, deleteTransactions, getAllTransactions, getCategories, getTransactionsByGroup, getTransactionsByGroupByCategory, getTransactionsByUser, getTransactionsByUserByCategory, updateCategory } from '../controllers/controller';

jest.mock('../models/model');
jest.mock('../controllers/utils');
jest.mock('../models/User');

beforeEach(() => {

    jest.resetAllMocks();

});
afterEach(() => {

    jest.resetAllMocks();

});

describe("U2.1: createCategory", () => {

    test('U2.1.1: should return 400 error if request body is incomplete', async () => {
        const req = { body: { type: 'testType' } };
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };

        verifyAuth.mockReturnValueOnce({ flag: true, cause: 'Authorized' })

        await createCategory(req, res);

        expect(res.status).toBeCalledWith(400);
        expect(res.json).toBeCalledWith({ error: 'incomplete attributes' });
    });


    test('U2.1.2: should return 400 error if request body contains empty strings', async () => {
        const req = { body: { type: '', color: 'testColor' } };
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };

        verifyAuth.mockReturnValueOnce({ flag: true, cause: 'Authorized' })

        await createCategory(req, res);

        expect(res.status).toBeCalledWith(400);
        expect(res.json).toBeCalledWith({ error: 'empty string' });
    });


    test('U2.1.3: should return 401 error if called by an authenticated user who is not an admin', async () => {
        const req = { body: { type: 'testType', color: 'testColor' } };
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };

        verifyAuth.mockReturnValueOnce({ flag: false, cause: 'Not admin' });

        await createCategory(req, res);

        expect(res.status).toBeCalledWith(401);
        expect(res.json).toBeCalledWith({ error: 'Not admin' });
    });

    test('U2.1.4: should return 400 if the type represents an already existing category in the database', async () => {
        const req = { body: { type: 'testType', color: 'testColor' } };
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };

        verifyAuth.mockReturnValueOnce({ flag: true, cause: 'Authorized' })
        const mockFindOne = jest.spyOn(categories, 'findOne');
        mockFindOne.mockResolvedValueOnce({ type: 'testType' });

        await createCategory(req, res);


        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ error: 'category already exists' });
    });

    test('U2.1.5: should create new category', async () => {
        const mockReq = {
            body: {
                type: "testType",
                color: "testColor"
            }
        }
        const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            locals: {
            }
        }
        const mockResStatus = 200
        const mockResData = {
            data: {
                type: "testType",
                color: "testColor"
            }
        }

        verifyAuth.mockReturnValueOnce({ flag: true, cause: 'Authorized' })
        jest.spyOn(categories, 'findOne').mockResolvedValueOnce(null);
        jest.spyOn(categories.prototype, 'save').mockResolvedValueOnce({ _id: "0", type: "testType", color: "testColor" });

        await createCategory(mockReq, mockRes);

        expect(verifyAuth).toHaveBeenCalledWith(mockReq, mockRes, { authType: 'Admin' });
        expect(categories.prototype.save).toHaveBeenCalledWith();
        //expect(categories.find).toHaveBeenCalledWith({ type: "testType" });
        expect(mockRes.status).toHaveBeenCalledWith(mockResStatus);
        expect(mockRes.json).toHaveBeenCalledWith(mockResData);
    });



    test('U2.1.6: should return a 500 if an error occurs', async () => {
        const req = { body: { type: 'testType', color: 'testColor' } };
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };
        const errorMessage = 'Error';

        verifyAuth.mockReturnValueOnce({ flag: true, cause: 'Authorized' })

        jest.spyOn(console, 'error').mockImplementation(() => { });

        jest.spyOn(categories, 'findOne').mockRejectedValueOnce(new Error(errorMessage));

        await createCategory(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
    });

})

describe("U2.2: updateCategory", () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    test('U2.2.1: should return 400 error if request body is incomplete', async () => {
        const req = {
            params: { type: 'currentTestType' },
            body: { type: 'newTestType' }
        };
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };

        verifyAuth.mockReturnValueOnce({ flag: true, cause: 'Authorized' })

        await updateCategory(req, res);

        expect(res.status).toBeCalledWith(400);
        expect(res.json).toBeCalledWith({ error: 'incomplete attributes' });
    });

    test('U2.2.2: should return 400 error if request body contains empty strings', async () => {
        const req = {
            params: { type: 'currentTestType' },
            body: { type: '', color: 'newTestColor' }
        };
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };

        verifyAuth.mockReturnValueOnce({ flag: true, cause: 'Authorized' })

        await updateCategory(req, res);

        expect(res.status).toBeCalledWith(400);
        expect(res.json).toBeCalledWith({ error: 'empty string' });
    });

    test('U2.2.3: should return 400 error if the type of category passed as a route parameter does not represent a category in the database', async () => {
        const req = {
            params: { type: 'nonExistingType' },
            body: { type: 'newTestType', color: 'newTestColor' }
        };
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };

        verifyAuth.mockReturnValueOnce({ flag: true, cause: 'Authorized' });

        jest.spyOn(categories, 'findOne').mockResolvedValueOnce(null);

        await updateCategory(req, res);

        expect(res.status).toBeCalledWith(400);
        expect(res.json).toBeCalledWith({ error: 'category does not exist' });
    });

    test('U2.2.4: should return 400 error if the type of category passed in the request body as the new type represents an already existing category in the database and that category is not the same as the requested one', async () => {
        const req = {
            params: { type: 'existingType' },
            body: { type: 'alsoExistingType', color: 'newTestColor' }
        };
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };
        const existingCategory = {
            _id: '0',
            type: 'existingType',
            color: 'currentColor',
            save: jest.fn()
        }
        const alsoExistingCategory = {
            _id: '1',
            type: 'alsoExistingType',
            color: 'currentColor',
            save: jest.fn()
        }

        verifyAuth.mockReturnValueOnce({ flag: true, cause: 'Authorized' });

        jest.spyOn(categories, 'findOne')
            .mockResolvedValueOnce(existingCategory)
            .mockResolvedValueOnce(alsoExistingCategory);

        await updateCategory(req, res);

        expect(res.status).toBeCalledWith(400);
        expect(res.json).toBeCalledWith({ error: 'new category exists' });
    });

    test('U2.2.5: should return 401 error if called by an authenticated user who is not an admin', async () => {
        const req = {
            params: { type: 'currentTestType' },
            body: { type: 'testType', color: 'newTestColor' }
        };
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };

        verifyAuth.mockReturnValueOnce({ flag: false, cause: 'Not admin' });

        await updateCategory(req, res);

        expect(res.status).toBeCalledWith(401);
        expect(res.json).toBeCalledWith({ error: 'Not admin' });
    });

    test("U2.2.6: should update a category's both type and color",
        async () => {

            const mockReq = {
                params: {
                    type: "currentType"
                },
                body: {
                    type: "newType",
                    color: "newColor"
                }
            }
            const mockRes = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn(),
                locals: {
                }
            }
            const mockCurrentCategory =
            {
                _id: '0',
                type: 'currentType',
                color: 'currentColor',
                save: jest.fn()
            }
            const mockResStatus = 200
            const mockResData = {
                data: {
                    message: "Category edited successfully",
                    count: 5
                }
            }

            verifyAuth.mockImplementation(() => {
                return { flag: true, cause: 'Authorized' }
            })
            categories.findOne
                .mockResolvedValueOnce(
                    mockCurrentCategory
                )
                .mockResolvedValueOnce(null);
            transactions.updateMany.mockResolvedValueOnce({ modifiedCount: mockResData.data.count });

            await updateCategory(mockReq, mockRes);

            expect(verifyAuth).toHaveBeenCalledWith(mockReq, mockRes, { authType: 'Admin' });
            expect(categories.findOne).toHaveBeenCalledWith({ type: mockReq.params.type });
            expect(categories.findOne).toHaveBeenCalledWith({ type: mockReq.body.type });
            expect(mockCurrentCategory.save).toHaveBeenCalled()
            expect(transactions.updateMany).toHaveBeenCalledWith({ type: mockReq.params.type }, { type: mockReq.body.type });
            expect(mockRes.status).toHaveBeenCalledWith(mockResStatus);
            expect(mockRes.json).toHaveBeenCalledWith(mockResData);
        }
    );

    test("U2.2.7: should update a category's color only",
        async () => {

            const mockReq = {
                params: {
                    type: "currentType"
                },
                body: {
                    type: "currentType",
                    color: "newColor"
                }
            }
            const mockRes = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn(),
                locals: {
                }
            }
            const mockCurrentCategory =
            {
                _id: '0',
                type: 'currentType',
                color: 'currentColor',
                save: jest.fn()
            }
            const mockResStatus = 200
            const mockResData = {
                data: {
                    message: "Category edited successfully",
                    count: 5
                }
            }
            verifyAuth.mockImplementation(() => {
                return { flag: true, cause: 'Authorized' }
            });
            categories.findOne
                .mockResolvedValueOnce(mockCurrentCategory)
            transactions.updateMany.mockResolvedValueOnce({ modifiedCount: mockResData.data.count });

            await updateCategory(mockReq, mockRes);

            expect(verifyAuth).toHaveBeenCalledWith(mockReq, mockRes, { authType: 'Admin' });
            expect(categories.findOne).toHaveBeenCalledWith({ type: mockReq.params.type });
            expect(mockCurrentCategory.save).toHaveBeenCalled()
            expect(transactions.updateMany).toHaveBeenCalledWith({ type: mockReq.params.type }, { type: mockReq.body.type });
            expect(mockRes.status).toHaveBeenCalledWith(mockResStatus);
            expect(mockRes.json).toHaveBeenCalledWith(mockResData);
        }
    );

    test('U2.2.8: should return a 500 if an error occurs', async () => {
        const req = { body: { type: 'testType', color: 'testColor' } };
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };
        const errorMessage = 'Error';

        verifyAuth.mockReturnValueOnce({ flag: true, cause: 'Authorized' })

        jest.spyOn(console, 'error').mockImplementation(() => { });

        jest.spyOn(categories, 'findOne').mockRejectedValueOnce(new Error(errorMessage));

        await updateCategory(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
    });
})

describe("U2.3: deleteCategory", () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    test('U2.3.1: should return 400 error if request body is incomplete', async () => {
        const req = {
            params: {},
            body: {}
        };
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };

        verifyAuth.mockReturnValueOnce({ flag: true, cause: 'Authorized' })

        await deleteCategory(req, res);

        expect(res.status).toBeCalledWith(400);
        expect(res.json).toBeCalledWith({ error: 'incomplete attributes' });
    });

    test('U2.3.2: should return 400 error if called when there is only one category in the database', async () => {
        const req = {
            params: {},
            body: { types: ['A'] }
        };
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };

        const mockCategories = [
            { _id: 0, type: "A", color: "A" },
        ];

        verifyAuth.mockReturnValueOnce({ flag: true, cause: 'Authorized' });
        categories.find.mockResolvedValueOnce(mockCategories);

        await deleteCategory(req, res);

        expect(res.status).toBeCalledWith(400);
        expect(res.json).toBeCalledWith({ error: 'only zero or one category exists' });
    });

    test('U2.3.3: should return 400 error if at least one of the types in the array is an empty string', async () => {
        const req = {
            params: {},
            body: { types: ['C', 'B', '', 'D', 'E'] }
        };
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };

        verifyAuth.mockReturnValueOnce({ flag: true, cause: 'Authorized' })

        await deleteCategory(req, res);

        expect(res.status).toBeCalledWith(400);
        expect(res.json).toBeCalledWith({ error: 'at least one: empty string' });
    });

    test('U2.3.4: should return 400 error if the array passed in the request body is empty', async () => {
        const req = {
            params: {},
            body: { types: [] }
        };
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };

        verifyAuth.mockReturnValueOnce({ flag: true, cause: 'Authorized' })

        await deleteCategory(req, res);

        expect(res.status).toBeCalledWith(400);
        expect(res.json).toBeCalledWith({ error: 'empty array' });
    });

    test('U2.3.5: should return 400 error if at least one of the types in the array does not represent a category in the database', async () => {
        const req = {
            params: {},
            body: { types: ['C', 'B', 'F'] }
        };
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };
        const mockCategories = [
            { _id: 0, type: "A", color: "A" },
            { _id: 1, type: "B", color: "B" },
            { _id: 2, type: "C", color: "C" },
            { _id: 3, type: "D", color: "D" },
            { _id: 4, type: "E", color: "E" },
        ];

        verifyAuth.mockReturnValueOnce({ flag: true, cause: 'Authorized' });
        categories.find.mockResolvedValueOnce(mockCategories);

        await deleteCategory(req, res);

        expect(res.status).toBeCalledWith(400);
        expect(res.json).toBeCalledWith({ error: 'at least one type does not exist' });
    });

    test('U2.3.6: should return 401 error if called by an authenticated user who is not an admin', async () => {
        const req = {
            params: {},
            body: { types: ['C', 'B', 'E'] }
        };
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };

        verifyAuth.mockReturnValueOnce({ flag: false, cause: 'Not admin' });

        await deleteCategory(req, res);

        expect(res.status).toBeCalledWith(401);
        expect(res.json).toBeCalledWith({ error: 'Not admin' });
    });

    test('U2.3.7: should delete all categories except oldest and set transactions to oldest', async () => {
        const mockReq = {
            params: {
            },
            body: {
                types: ["C", "B", "A", "D", "E"]
            }
        }
        const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            locals: {
            }
        }
        const mockCategories = [
            { _id: 0, type: "A", color: "A" },
            { _id: 1, type: "B", color: "B" },
            { _id: 2, type: "C", color: "C" },
            { _id: 3, type: "D", color: "D" },
            { _id: 4, type: "E", color: "E" },
        ]

        const mockTypesToDelete = ["C", "B", "D", "E"];
        const mockModifiedCount = 15;
        const mockResStatus = 200
        const mockResData = {
            data: {
                message: "Categories deleted",
                count: mockModifiedCount
            }
        }

        verifyAuth.mockReturnValueOnce({ flag: true, cause: 'Authorized' });
        categories.find.mockResolvedValueOnce(mockCategories);
        categories.deleteMany.mockResolvedValueOnce();
        transactions.updateMany.mockResolvedValueOnce({ modifiedCount: mockModifiedCount });

        await deleteCategory(mockReq, mockRes);

        expect(verifyAuth).toHaveBeenCalledWith(mockReq, mockRes, { authType: 'Admin' });
        expect(categories.deleteMany).toHaveBeenCalledWith({ type: { $in: mockTypesToDelete } });
        expect(transactions.updateMany).toHaveBeenCalledWith({ type: { $in: mockTypesToDelete } }, { type: mockCategories[0].type });
        expect(mockRes.status).toHaveBeenCalledWith(mockResStatus);
        expect(mockRes.json).toHaveBeenCalledWith(mockResData);

    });

    test('U2.3.8: should delete all categories and set transactions to oldest', async () => {
        const mockReq = {
            params: {
            },
            body: {
                types: ["C", "B", "A", "D"]
            }
        }
        const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            locals: {
            }
        }
        const mockCategories = [
            { _id: 0, type: "A", color: "A" },
            { _id: 1, type: "B", color: "B" },
            { _id: 2, type: "C", color: "C" },
            { _id: 3, type: "D", color: "D" },
            { _id: 4, type: "E", color: "E" },
        ]
        const mockTypesToDelete = ["C", "B", "A", "D"];
        const mockModifiedCount = 15;
        const mockResStatus = 200
        const mockResData = {
            data: {
                message: "Categories deleted",
                count: mockModifiedCount
            }
        }

        verifyAuth.mockReturnValueOnce({ flag: true, cause: 'Authorized' });
        categories.find.mockResolvedValueOnce(mockCategories);
        categories.deleteMany.mockResolvedValueOnce();
        transactions.updateMany.mockResolvedValueOnce({ modifiedCount: mockModifiedCount });

        await deleteCategory(mockReq, mockRes);

        expect(verifyAuth).toHaveBeenCalledWith(mockReq, mockRes, { authType: 'Admin' });
        expect(categories.deleteMany).toHaveBeenCalledWith({ type: { $in: mockTypesToDelete } });
        expect(transactions.updateMany).toHaveBeenCalledWith({ type: { $in: mockTypesToDelete } }, { type: "E" });
        expect(mockRes.status).toHaveBeenCalledWith(mockResStatus);
        expect(mockRes.json).toHaveBeenCalledWith(mockResData);

    });

    test('U2.3.9: should return a 500 if an error occurs', async () => {
        const req = {
            params: {
            },
            body: {
                types: ["C", "B", "A", "D"]
            }
        };
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };
        const errorMessage = 'Error';

        verifyAuth.mockReturnValueOnce({ flag: true, cause: 'Authorized' })

        jest.spyOn(console, 'error').mockImplementation(() => { });

        jest.spyOn(categories, 'find').mockRejectedValue(new Error(errorMessage));

        await deleteCategory(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
    });
})

describe("U2.4: getCategories", () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    test('U2.4.1: should retrieve all categories', async () => {
        const mockReq = {
            params: {
            },
            body: {
            }
        }
        const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            locals: {
            }
        }
        const mockCategories = [
            { _id: 0, type: "A", color: "A" },
            { _id: 1, type: "B", color: "B" },
            { _id: 2, type: "C", color: "C" },
            { _id: 3, type: "D", color: "D" },
            { _id: 4, type: "E", color: "E" },
        ]
        const mockResStatus = 200
        const mockResData = {
            data: [
                { type: "A", color: "A" },
                { type: "B", color: "B" },
                { type: "C", color: "C" },
                { type: "D", color: "D" },
                { type: "E", color: "E" },
            ]
        }

        verifyAuth.mockReturnValueOnce({ flag: true, cause: 'Authorized' });
        categories.find.mockResolvedValueOnce(mockCategories);

        await getCategories(mockReq, mockRes);

        expect(verifyAuth).toHaveBeenCalledWith(mockReq, mockRes, { authType: 'Simple' });
        expect(mockRes.status).toHaveBeenCalledWith(mockResStatus);
        expect(mockRes.json).toHaveBeenCalledWith(mockResData);

    });

    test('U2.4.2: should return 401 error if called by an authenticated user who is not an admin', async () => {
        const req = {
            params: {
            },
            body: {
            }
        }
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            locals: {
            }
        }

        verifyAuth.mockReturnValueOnce({ flag: false, cause: 'Unauthorized' });

        await getCategories(req, res);

        expect(res.status).toBeCalledWith(401);
        expect(res.json).toBeCalledWith({ error: 'Unauthorized' });
    });

    test('U2.4.3: should return a 500 if an error occurs', async () => {
        const req = { body: { type: 'testType', color: 'testColor' } };
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };
        const errorMessage = 'Error';

        verifyAuth.mockReturnValueOnce({ flag: true, cause: 'Authorized' })

        jest.spyOn(console, 'error').mockImplementation(() => { });

        jest.spyOn(categories, 'find').mockRejectedValue(new Error(errorMessage));

        await getCategories(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
    });
})

describe("U2.5: createTransaction", () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    test('U2.5.1: should return 400 error if request body is incomplete', async () => {
        const req = {
            params: {
                username: "user1",
            },
            body: {
                username: "user1",
                amount: 100
            }
        };
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };

        verifyAuth.mockReturnValueOnce({ flag: true, cause: 'Authorized' })

        await createTransaction(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toBeCalledWith({ error: 'incomplete attributes' });
    });

    test('U2.5.2: should return 400 error if request body contains empty strings', async () => {
        const req = {
            params: {
                username: "user1",
            },
            body: {
                username: "user1",
                amount: 100,
                type: ''
            }
        };
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };

        verifyAuth.mockReturnValueOnce({ flag: true, cause: 'Authorized' })

        await createTransaction(req, res);

        expect(res.status).toBeCalledWith(400);
        expect(res.json).toBeCalledWith({ error: 'empty string' });
    });

    test('U2.5.3: should return 400 error if the type of category passed in the request body does not represent a category in the database', async () => {
        const req = {
            params: {
                username: "user1",
            },
            body: {
                username: "user1",
                amount: 100,
                type: 'food'
            }
        };
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };
        const mockUser = {
            username: 'user1'
        };

        verifyAuth.mockReturnValueOnce({ flag: true, cause: 'Authorized' })

        jest.spyOn(User, 'findOne').mockResolvedValueOnce(mockUser);
        jest.spyOn(User, 'findOne').mockResolvedValueOnce(mockUser);
        jest.spyOn(categories, 'findOne').mockResolvedValueOnce(null);

        await createTransaction(req, res);

        expect(res.status).toBeCalledWith(400);
        expect(res.json).toBeCalledWith({ error: 'category does not exist' });
    });

    test('U2.5.4: should return 400 error if the username passed in the request body is not equal to the one passed as a route parameter', async () => {
        const req = {
            params: {
                username: "user1",
            },
            body: {
                username: "user2",
                amount: 100,
                type: 'food'
            }
        };
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };
        const mockUser = {
            username: 'user1'
        };
        const mockUser2 = {
            username: 'user2'
        }
        const mockCategory = {
            type: 'food'
        };

        verifyAuth.mockReturnValueOnce({ flag: true, cause: 'Authorized' })

        jest.spyOn(User, 'findOne').mockResolvedValueOnce(mockUser);
        jest.spyOn(User, 'findOne').mockResolvedValueOnce(mockUser2);
        jest.spyOn(categories, 'findOne').mockResolvedValueOnce(mockCategory);

        await createTransaction(req, res);

        expect(res.status).toBeCalledWith(400);
        expect(res.json).toBeCalledWith({ error: "cannot add other user's transaction" });
    });

    test('U2.5.5: should return 400 error if the username passed in the request body does not represent a user in the database', async () => {
        const req = {
            params: {
                username: 'user1',
            },
            body: {
                username: 'user1',
                amount: 100,
                type: 'food'
            }
        };
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };

        verifyAuth.mockReturnValueOnce({ flag: true, cause: 'Authorized' })

        jest.spyOn(User, 'findOne').mockResolvedValueOnce(null);

        await createTransaction(req, res);

        expect(res.status).toBeCalledWith(400);
        expect(res.json).toBeCalledWith({ error: "user passed as a route parameter does not exist" });
    });

    test('U2.5.6: should return 400 error if the username passed as a route parameter does not represent a user in the database', async () => {
        const req = {
            params: {
                username: 'nonUser',
            },
            body: {
                username: 'user1',
                amount: 100,
                type: 'food'
            }
        };
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };

        const mockUser = {
            username: 'user1'
        };

        verifyAuth.mockReturnValueOnce({ flag: true, cause: 'Authorized' })

        jest.spyOn(User, 'findOne').mockResolvedValueOnce(mockUser);
        jest.spyOn(User, 'findOne').mockResolvedValueOnce(null);

        await createTransaction(req, res);

        expect(res.status).toBeCalledWith(400);
        expect(res.json).toBeCalledWith({ error: "user passed in request body does not exist" });
    });

    test('U2.5.7: should return 400 error if the amount passed in the request body cannot be parsed as a floating value (negative numbers are accepted)', async () => {
        const req = {
            params: {
                username: 'nonUser',
            },
            body: {
                username: 'user1',
                amount: '1abc2',
                type: 'food'
            }
        };
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };

        verifyAuth.mockReturnValueOnce({ flag: true, cause: 'Authorized' })

        await createTransaction(req, res);

        expect(res.status).toBeCalledWith(400);
        expect(res.json).toBeCalledWith({ error: 'cannot parse as floating value' });
    });

    test('U2.5.8: should return 401 error if user is not authenticated', async () => {
        const req = {
            params: {
                username: "user1",
            },
            body: {
                username: "user1",
                amount: 100,
                type: 'food'
            }
        };
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };
        const mockUser = {
            username: 'user1'
        };
        const mockCategory = {
            type: 'food'
        };

        jest.spyOn(User, 'findOne').mockResolvedValueOnce(mockUser);
        jest.spyOn(User, 'findOne').mockResolvedValueOnce(mockUser);
        jest.spyOn(categories, 'findOne').mockResolvedValueOnce(mockCategory);

        verifyAuth.mockReturnValueOnce({ flag: false, cause: 'Unauthorized' });

        await createTransaction(req, res);

        expect(res.status).toBeCalledWith(401);
        expect(res.json).toBeCalledWith({ error: 'Unauthorized' });
    });

    test('U2.5.9: should create transaction', async () => {
        const mockReq = {
            params: {
                username: 'user1',
            },
            body: {
                username: 'user1',
                amount: 100,
                type: "A"
            }
        }
        const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            locals: {
            }
        }
        const mockDate = Date.now();
        const mockTransaction = {
            _id: 0,
            username: mockReq.body.username,
            amount: mockReq.body.amount,
            type: mockReq.body.type,
            date: mockDate
        }

        const mockResStatus = 200
        const mockResData = {
            data: {
                username: mockReq.body.username,
                amount: mockReq.body.amount,
                type: mockReq.body.type,
                date: mockDate
            }
        }

        verifyAuth.mockReturnValueOnce({ flag: true, cause: 'Authorized' });
        User.findOne.mockResolvedValueOnce(true);
        User.findOne.mockResolvedValueOnce(true);
        categories.findOne.mockResolvedValueOnce(true);
        transactions.prototype.save.mockResolvedValueOnce(mockTransaction);

        await createTransaction(mockReq, mockRes);

        expect(verifyAuth).toHaveBeenCalledWith(mockReq, mockRes, { authType: 'User', username: mockReq.params.username });
        expect(User.findOne).toHaveBeenCalledWith({ username: "user1" });
        expect(User.findOne).toHaveBeenCalledWith({ username: "user1" });
        expect(categories.findOne).toHaveBeenCalledWith({ type: "A" });
        expect(transactions.prototype.save).toHaveBeenCalled();

        expect(mockRes.status).toHaveBeenCalledWith(mockResStatus);
        expect(mockRes.json).toHaveBeenCalledWith(mockResData);
    });

    test('U2.5.10: should return a 500 if an error occurs', async () => {
        const req = {
            params: {
                username: "user1",
            },
            body: {
                username: "user1",
                amount: 100,
                type: 'food'
            }
        };
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };
        const errorMessage = 'Error';

        jest.spyOn(console, 'error').mockImplementation(() => { });

        jest.spyOn(User, 'findOne').mockRejectedValueOnce(new Error(errorMessage));

        await createTransaction(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
    });

})
describe("U2.6: getAllTransactions", () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    test('U2.6.1: should return 401 error if called by an authenticated user who is not an admin', async () => {
        const req = {
            params: {
            },
            body: {
            }
        }
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        }

        verifyAuth.mockReturnValueOnce({ flag: false, cause: 'Not admin' });

        await getAllTransactions(req, res);

        expect(res.status).toBeCalledWith(401);
        expect(res.json).toBeCalledWith({ error: 'Not admin' });
    });

    test('U2.6.2: should retrieve all transactions', async () => {
        const mockReq = {
            params: {
            },
            body: {
            }
        }
        const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            locals: {
            }
        }
        const mockDate = Date.now();
        const mockTransactionAggregateFilter = [
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
        const mockTransactionAggregate = [
            { _id: 1, username: "user1", amount: 100.00, type: "type1", date: mockDate, categories_info: { _id: 1, type: "type1", color: "color1" } },
            { _id: 2, username: "user2", amount: 200.00, type: "type2", date: mockDate, categories_info: { _id: 2, type: "type2", color: "color2" } },
            { _id: 3, username: "user3", amount: 300.00, type: "type3", date: mockDate, categories_info: { _id: 3, type: "type3", color: "color3" } },
            { _id: 4, username: "user4", amount: 400.00, type: "type4", date: mockDate, categories_info: { _id: 4, type: "type4", color: "color4" } },
            { _id: 5, username: "user5", amount: 500.00, type: "type5", date: mockDate, categories_info: { _id: 5, type: "type5", color: "color5" } },
        ]
        const mockResStatus = 200
        const mockResData = {
            data: [
                { username: "user1", amount: 100.00, type: "type1", date: mockDate, color: "color1" },
                { username: "user2", amount: 200.00, type: "type2", date: mockDate, color: "color2" },
                { username: "user3", amount: 300.00, type: "type3", date: mockDate, color: "color3" },
                { username: "user4", amount: 400.00, type: "type4", date: mockDate, color: "color4" },
                { username: "user5", amount: 500.00, type: "type5", date: mockDate, color: "color5" },
            ]
        }

        verifyAuth.mockReturnValueOnce({ flag: true, cause: 'Authorized' });
        transactions.aggregate.mockResolvedValueOnce(mockTransactionAggregate);

        await getAllTransactions(mockReq, mockRes);

        expect(verifyAuth).toHaveBeenCalledWith(mockReq, mockRes, { authType: "Admin" });
        expect(transactions.aggregate).toHaveBeenCalledWith(mockTransactionAggregateFilter);
        expect(mockRes.status).toHaveBeenCalledWith(mockResStatus);
        expect(mockRes.json).toHaveBeenCalledWith(mockResData);
    });

    test('U2.6.3: should return a 500 if an error occurs', async () => {
        const req = {
            params: {
            },
            body: {
            }
        }
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            locals: {
            }
        }
        const errorMessage = 'Error';

        verifyAuth.mockReturnValueOnce({ flag: true, cause: 'Authorized' });

        jest.spyOn(console, 'error').mockImplementation(() => { });

        jest.spyOn(transactions, 'aggregate').mockRejectedValueOnce(new Error(errorMessage));

        await getAllTransactions(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
    });
})

describe("U2.7: getTransactionsByUser", () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    test('U2.7.1: should return 400 error if the user does not exist', async () => {
        const mockReq = {
            url: '/api/transactions/users/nonExistentUser',
            params: {
                username: 'nonExistentUser'
            },
            body: {}
        };
        const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            locals: {}
        };

        verifyAuth.mockReturnValueOnce({ flag: true, cause: 'Authorized' });
        User.findOne.mockResolvedValueOnce(false);

        await getTransactionsByUser(mockReq, mockRes);

        expect(verifyAuth).toHaveBeenCalledWith(mockReq, mockRes, { authType: 'Admin' });
        expect(User.findOne).toHaveBeenCalledWith({ username: 'nonExistentUser' });
        expect(mockRes.status).toHaveBeenCalledWith(400);
        expect(mockRes.json).toHaveBeenCalledWith({ error: 'user does not exist' });
    });

    test('U2.7.2: should return 401 error if called by an authenticated user who is not the same user (user route)', async () => {
        const mockReq = {
            url: '/api/users/user1/transactions',
            params: {
                username: 'user1'
            },
            body: {}
        };
        const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            locals: {}
        };

        verifyAuth.mockReturnValueOnce({ flag: false, cause: "cannot access other user's data" });

        await getTransactionsByUser(mockReq, mockRes);

        expect(verifyAuth).toHaveBeenCalledWith(mockReq, mockRes, { authType: 'User', username: 'user1' });
        expect(mockRes.status).toHaveBeenCalledWith(401);
        expect(mockRes.json).toHaveBeenCalledWith({ error: "cannot access other user's data" });
    });

    test('U2.7.3: should return 401 error if called by an authenticated user who is not an admin (admin route)', async () => {
        const mockReq = {
            url: '/api/transactions/users/user1',
            body: {}
        };
        const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            locals: {}
        };

        verifyAuth.mockReturnValueOnce({ flag: false, cause: 'Not admin' });

        await getTransactionsByUser(mockReq, mockRes);

        expect(mockRes.status).toHaveBeenCalledWith(401);
        expect(mockRes.json).toHaveBeenCalledWith({ error: 'Not admin' });
    });

    test('U2.7.4: should throw a "unknown route" error if the path is wrong', async () => {
        const mockReq = {
            url: "/api/unknown/route",
            query: {
            }
            ,
            body: {
            }
        };
        const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            locals: {}
        };


        await getTransactionsByUser(mockReq, mockRes);

        expect(mockRes.status).toHaveBeenCalledWith(500);
        expect(mockRes.json).toHaveBeenCalledWith({ error: 'unknown route' });

    });

    test('U2.7.5: should return all users transactions (user route with date)', async () => {
        const mockDate = "2023-04-01";
        const mockUsername = "user1"
        const mockReq = {
            url: "/api/users/" + mockUsername + "/transactions?date=" + mockDate,
            query: {
                date: mockDate
            },
            params: {
                username: mockUsername
            },
            body: {
            }
        }
        const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            locals: {
            }
        }
        const mockDateFilter = {
            date:
            {
                $gte: new Date("2023-04-01T00:00:00.000Z"),
                $lte: new Date("2023-04-01T23:59:59.999Z")
            },
        }
        const mockAmountFilter = {}
        const mockTransactionAggregateFilter = [
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
                    username: mockUsername,
                    ...mockDateFilter,
                    ...mockAmountFilter
                }
            },
            { $unwind: "$categories_info" }
        ]
        const mockTransactionAggregate = [
            { _id: 1, username: "user1", amount: 100.00, type: "type1", date: mockDate, categories_info: { _id: 1, type: "type1", color: "color1" } },
            { _id: 2, username: "user1", amount: 200.00, type: "type2", date: mockDate, categories_info: { _id: 2, type: "type2", color: "color2" } },
            { _id: 3, username: "user1", amount: 300.00, type: "type3", date: mockDate, categories_info: { _id: 3, type: "type3", color: "color3" } },
            { _id: 4, username: "user1", amount: 400.00, type: "type4", date: mockDate, categories_info: { _id: 4, type: "type4", color: "color4" } },
            { _id: 5, username: "user1", amount: 500.00, type: "type5", date: mockDate, categories_info: { _id: 5, type: "type5", color: "color5" } },
        ]
        const mockResStatus = 200
        const mockResData = {
            data: [
                { username: "user1", amount: 100.00, type: "type1", date: mockDate, color: "color1" },
                { username: "user1", amount: 200.00, type: "type2", date: mockDate, color: "color2" },
                { username: "user1", amount: 300.00, type: "type3", date: mockDate, color: "color3" },
                { username: "user1", amount: 400.00, type: "type4", date: mockDate, color: "color4" },
                { username: "user1", amount: 500.00, type: "type5", date: mockDate, color: "color5" },
            ]
        }
        verifyAuth.mockReturnValueOnce({ flag: true, cause: 'Authorized' });
        handleDateFilterParams.mockImplementation(() => mockDateFilter);
        handleAmountFilterParams.mockImplementation(() => mockAmountFilter);
        User.findOne.mockResolvedValueOnce(true);
        transactions.aggregate.mockResolvedValueOnce(mockTransactionAggregate);

        await getTransactionsByUser(mockReq, mockRes);

        expect(verifyAuth).toHaveBeenCalledWith(mockReq, mockRes, { authType: "User", username: mockUsername });
        expect(handleDateFilterParams).toHaveBeenCalledWith(mockReq);
        expect(handleAmountFilterParams).toHaveBeenCalledWith(mockReq);
        expect(User.findOne).toHaveBeenCalledWith({ username: mockUsername });
        expect(transactions.aggregate).toHaveBeenCalledWith(mockTransactionAggregateFilter);
        expect(mockRes.status).toHaveBeenCalledWith(mockResStatus);
        expect(mockRes.json).toHaveBeenCalledWith(mockResData);
    });

    test('U2.7.6: should return a 500 if an error occurs', async () => {
        const req = {
            url: '/api/users/user1/transactions',
            body: {}
        };
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            locals: {}
        };
        const errorMessage = 'Error';

        jest.spyOn(console, 'error').mockImplementation(() => { });

        verifyAuth.mockReturnValueOnce({ flag: true, cause: 'Authorized' });

        jest.spyOn(User, 'findOne').mockRejectedValueOnce(new Error(errorMessage));

        await getTransactionsByUser(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
    });
})

describe("U2.8: getTransactionsByUserByCategory", () => {
    test('U2.8.1: should show all user transactions of  given category (user route)', async () => {
        const mockUsername = "user1";
        const mockCategoryType = "type1";
        const mockReq = {
            url: "/api/users/" + mockUsername + "/transactions/category/" + mockCategoryType,
            query: {
            },
            params: {
                username: mockUsername,
                category: mockCategoryType
            },
            body: {
            }
        }
        const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            locals: {
            }
        }
        const mockTransactionAggregateFilter = [
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
                    username: mockUsername,
                    type: mockCategoryType
                }
            },
            { $unwind: "$categories_info" }
        ]
        const mockDate = Date.now();
        const mockTransactionAggregate = [
            { _id: 1, username: mockUsername, amount: 100.00, type: mockCategoryType, date: mockDate, categories_info: { _id: 1, type: mockCategoryType, color: "color1" } },
            { _id: 2, username: mockUsername, amount: 200.00, type: mockCategoryType, date: mockDate, categories_info: { _id: 1, type: mockCategoryType, color: "color1" } },
            { _id: 3, username: mockUsername, amount: 300.00, type: mockCategoryType, date: mockDate, categories_info: { _id: 1, type: mockCategoryType, color: "color1" } },
            { _id: 4, username: mockUsername, amount: 400.00, type: mockCategoryType, date: mockDate, categories_info: { _id: 1, type: mockCategoryType, color: "color1" } },
            { _id: 5, username: mockUsername, amount: 500.00, type: mockCategoryType, date: mockDate, categories_info: { _id: 1, type: mockCategoryType, color: "color1" } },
        ]
        const mockResStatus = 200
        const mockResData = {
            data: [
                { username: "user1", amount: 100.00, type: "type1", date: mockDate, color: "color1" },
                { username: "user1", amount: 200.00, type: "type1", date: mockDate, color: "color1" },
                { username: "user1", amount: 300.00, type: "type1", date: mockDate, color: "color1" },
                { username: "user1", amount: 400.00, type: "type1", date: mockDate, color: "color1" },
                { username: "user1", amount: 500.00, type: "type1", date: mockDate, color: "color1" },
            ]
        }
        verifyAuth.mockReturnValueOnce({ flag: true, cause: 'Authorized' });
        User.findOne.mockResolvedValueOnce(true);
        categories.findOne.mockResolvedValueOnce(true);
        transactions.aggregate.mockResolvedValueOnce(mockTransactionAggregate);

        await getTransactionsByUserByCategory(mockReq, mockRes);

        expect(verifyAuth).toHaveBeenCalledWith(mockReq, mockRes, { authType: "User", username: mockUsername });
        expect(User.findOne).toHaveBeenCalledWith({ username: mockUsername });
        expect(categories.findOne).toHaveBeenCalledWith({ type: mockCategoryType });
        expect(transactions.aggregate).toHaveBeenCalledWith(mockTransactionAggregateFilter);
        expect(mockRes.status).toHaveBeenCalledWith(mockResStatus);
        expect(mockRes.json).toHaveBeenCalledWith(mockResData);
    });


    test('U2.8.2: should show all user transactions of  given category (admin route)', async () => {
        const mockUsername = "user1";
        const mockCategoryType = "type1";
        const mockReq = {
            url: "/api/transactions/users/" + mockUsername + "/category/" + mockCategoryType,
            query: {
            },
            params: {
                username: mockUsername,
                category: mockCategoryType
            },
            body: {
            }
        }
        const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            locals: {
            }
        }
        const mockTransactionAggregateFilter = [
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
                    username: mockUsername,
                    type: mockCategoryType
                }
            },
            { $unwind: "$categories_info" }
        ]
        const mockDate = Date.now();
        const mockTransactionAggregate = [
            { _id: 1, username: mockUsername, amount: 100.00, type: mockCategoryType, date: mockDate, categories_info: { _id: 1, type: mockCategoryType, color: "color1" } },
            { _id: 2, username: mockUsername, amount: 200.00, type: mockCategoryType, date: mockDate, categories_info: { _id: 1, type: mockCategoryType, color: "color1" } },
            { _id: 3, username: mockUsername, amount: 300.00, type: mockCategoryType, date: mockDate, categories_info: { _id: 1, type: mockCategoryType, color: "color1" } },
            { _id: 4, username: mockUsername, amount: 400.00, type: mockCategoryType, date: mockDate, categories_info: { _id: 1, type: mockCategoryType, color: "color1" } },
            { _id: 5, username: mockUsername, amount: 500.00, type: mockCategoryType, date: mockDate, categories_info: { _id: 1, type: mockCategoryType, color: "color1" } },
        ]
        const mockResStatus = 200
        const mockResData = {
            data: [
                { username: "user1", amount: 100.00, type: "type1", date: mockDate, color: "color1" },
                { username: "user1", amount: 200.00, type: "type1", date: mockDate, color: "color1" },
                { username: "user1", amount: 300.00, type: "type1", date: mockDate, color: "color1" },
                { username: "user1", amount: 400.00, type: "type1", date: mockDate, color: "color1" },
                { username: "user1", amount: 500.00, type: "type1", date: mockDate, color: "color1" },
            ]
        }
        verifyAuth.mockReturnValueOnce({ flag: true, cause: 'Authorized' });
        User.findOne.mockResolvedValueOnce(true);
        categories.findOne.mockResolvedValueOnce(true);
        transactions.aggregate.mockResolvedValueOnce(mockTransactionAggregate);

        await getTransactionsByUserByCategory(mockReq, mockRes);

        expect(verifyAuth).toHaveBeenCalledWith(mockReq, mockRes, { authType: "Admin" });
        expect(User.findOne).toHaveBeenCalledWith({ username: mockUsername });
        expect(categories.findOne).toHaveBeenCalledWith({ type: mockCategoryType });
        expect(transactions.aggregate).toHaveBeenCalledWith(mockTransactionAggregateFilter);
        expect(mockRes.status).toHaveBeenCalledWith(mockResStatus);
        expect(mockRes.json).toHaveBeenCalledWith(mockResData);
    });

    test('U2.8.3: should return a 500 error when error is thrown', async () => {
        const mockUsername = "user1";
        const mockCategoryType = "type1";
        const mockReq = {
            url: "/api/transactions/users/" + mockUsername + "/category/" + mockCategoryType,
            query: {
            },
            params: {
                username: mockUsername,
                category: mockCategoryType
            },
            body: {
            }
        }
        const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            locals: {
            }
        }
        const mockTransactionAggregateFilter = [
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
                    username: mockUsername,
                    type: mockCategoryType
                }
            },
            { $unwind: "$categories_info" }
        ]
        const mockDate = Date.now();
        const mockTransactionAggregate = [
            { _id: 1, username: mockUsername, amount: 100.00, type: mockCategoryType, date: mockDate, categories_info: { _id: 1, type: mockCategoryType, color: "color1" } },
            { _id: 2, username: mockUsername, amount: 200.00, type: mockCategoryType, date: mockDate, categories_info: { _id: 1, type: mockCategoryType, color: "color1" } },
            { _id: 3, username: mockUsername, amount: 300.00, type: mockCategoryType, date: mockDate, categories_info: { _id: 1, type: mockCategoryType, color: "color1" } },
            { _id: 4, username: mockUsername, amount: 400.00, type: mockCategoryType, date: mockDate, categories_info: { _id: 1, type: mockCategoryType, color: "color1" } },
            { _id: 5, username: mockUsername, amount: 500.00, type: mockCategoryType, date: mockDate, categories_info: { _id: 1, type: mockCategoryType, color: "color1" } },
        ]
        const errorMessage = "internal error";
        const mockResStatus = 500
        const mockResData = { error: errorMessage }
        verifyAuth.mockReturnValueOnce({ flag: true, cause: 'Authorized' });
        User.findOne.mockResolvedValueOnce(true);
        categories.findOne.mockResolvedValueOnce(true);
        transactions.aggregate.mockRejectedValueOnce(new Error(errorMessage));

        await getTransactionsByUserByCategory(mockReq, mockRes);

        expect(verifyAuth).toHaveBeenCalledWith(mockReq, mockRes, { authType: "Admin" });
        expect(User.findOne).toHaveBeenCalledWith({ username: mockUsername });
        expect(categories.findOne).toHaveBeenCalledWith({ type: mockCategoryType });
        expect(transactions.aggregate).toHaveBeenCalledWith(mockTransactionAggregateFilter);
        expect(mockRes.status).toHaveBeenCalledWith(mockResStatus);
        expect(mockRes.json).toHaveBeenCalledWith(mockResData);
    });

    test('U2.8.4: should return 400 error if the username does not represent a user in the database', async () => {
        const mockUsername = "nonexistentUser";
        const mockCategoryType = "type1";
        const mockReq = {
            url: "/api/users/" + mockUsername + "/transactions/category/" + mockCategoryType,
            params: {
                username: mockUsername,
                category: mockCategoryType
            },
        };
        const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        verifyAuth.mockReturnValueOnce({ flag: true, cause: 'Authorized' });
        User.findOne.mockResolvedValueOnce(false);

        await getTransactionsByUserByCategory(mockReq, mockRes);

        expect(mockRes.status).toHaveBeenCalledWith(400);
        expect(mockRes.json).toHaveBeenCalledWith({ error: "user does not exist" });
    });

    test('U2.8.5: should return 400 error if the category does not represent a category in the database', async () => {
        const mockUsername = "user1";
        const mockCategoryType = "nonexistentCategory";
        const mockReq = {
            url: "/api/users/" + mockUsername + "/transactions/category/" + mockCategoryType,
            params: {
                username: mockUsername,
                category: mockCategoryType
            }
        };
        const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        verifyAuth.mockReturnValueOnce({ flag: true, cause: 'Authorized' });
        User.findOne.mockResolvedValueOnce(true);
        categories.findOne.mockResolvedValueOnce(false);

        await getTransactionsByUserByCategory(mockReq, mockRes);

        expect(mockRes.status).toHaveBeenCalledWith(400);
        expect(mockRes.json).toHaveBeenCalledWith({ error: "category does not exist" });
    });

    test('U2.8.6: should return 401 error if called by an authenticated user who is not the same user (user route)', async () => {
        const mockUsername = "user1";
        const mockCategoryType = "type1";
        const mockReq = {
            url: '/api/users/user1/transactions/category/food',
            params: {
                username: mockUsername,
                category: mockCategoryType
            },
            body: {}
        };
        const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            locals: {}
        };

        verifyAuth.mockReturnValueOnce({ flag: false, cause: "cannot access other user's data" });

        await getTransactionsByUserByCategory(mockReq, mockRes);

        expect(verifyAuth).toHaveBeenCalledWith(mockReq, mockRes, { authType: 'User', username: mockUsername });
        expect(mockRes.status).toHaveBeenCalledWith(401);
        expect(mockRes.json).toHaveBeenCalledWith({ error: "cannot access other user's data" });
    });

    test('U2.8.7: should return 401 error if called by an authenticated user who is not an admin (authType = Admin)', async () => {
        const mockUsername = "user1";
        const mockCategoryType = "type1";
        const mockReq = {
            url: "/api/transactions/users/" + mockUsername + "/category/" + mockCategoryType,
            params: {
                username: mockUsername,
                category: mockCategoryType
            }
        };
        const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        verifyAuth.mockReturnValueOnce({ flag: false, cause: 'Not admin' });

        await getTransactionsByUserByCategory(mockReq, mockRes);

        expect(verifyAuth).toHaveBeenCalledWith(mockReq, mockRes, { authType: "Admin" });
        expect(mockRes.status).toHaveBeenCalledWith(401);
        expect(mockRes.json).toHaveBeenCalledWith({ error: "Not admin" });
    });

    test('U2.8.8: should throw a "unknown route" error if the path is wrong', async () => {
        const mockUsername = "user1";
        const mockCategoryType = "type1";
        const mockReq = {
            url: "/api/unknown/route",
            query: {
            },
            params: {
                username: mockUsername,
                category: mockCategoryType
            },
            body: {
            }
        };
        const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            locals: {}
        };


        await getTransactionsByUserByCategory(mockReq, mockRes);

        expect(mockRes.status).toHaveBeenCalledWith(500);
        expect(mockRes.json).toHaveBeenCalledWith({ error: 'unknown route' });

    });


})

describe("U2.9: getTransactionsByGroup", () => {

    test('U2.9.1: should return 400 error if the group name passed as a route parameter does not represent a group in the database (user route)', async () => {
        const mockGroupName = "nonGroup";
        const mockReq = {
            url: "/api/groups/" + mockGroupName + "/transactions",
            query: {
            },
            params: {
                name: mockGroupName,
            },
            body: {
            }
        }
        const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            locals: {
            }
        }

        Group.findOne.mockResolvedValueOnce(null);

        await getTransactionsByGroup(mockReq, mockRes);

        expect(Group.findOne).toHaveBeenCalledWith({ name: mockGroupName })

        expect(mockRes.status).toHaveBeenCalledWith(400);
        expect(mockRes.json).toHaveBeenCalledWith({ error: 'group does not exist' });
    });

    test('U2.9.2: should return 400 error if the group name passed as a route parameter does not represent a group in the database (admin route)', async () => {
        const mockGroupName = "nonGroup";
        const mockReq = {
            url: "/api/transactions/groups" + mockGroupName,
            query: {
            },
            params: {
                name: mockGroupName,
            },
            body: {
            }
        }
        const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            locals: {
            }
        }

        verifyAuth.mockReturnValueOnce({ flag: true, cause: "authorized" });
        Group.findOne.mockResolvedValueOnce(null);

        await getTransactionsByGroup(mockReq, mockRes);

        expect(verifyAuth).toHaveBeenCalledWith(mockReq, mockRes, { authType: "Admin" });
        expect(Group.findOne).toHaveBeenCalledWith({ name: mockGroupName })

        expect(mockRes.status).toHaveBeenCalledWith(400);
        expect(mockRes.json).toHaveBeenCalledWith({ error: 'group does not exist' });
    });

    test('U2.9.3: should return 401 error if called by an authenticated user who is not part of the group (authType = Group) if the route is /api/groups/:name/transactions', async () => {
        const mockGroupName = "group1";
        const mockGroup = {
            _id: 1,
            name: mockGroupName,
            members: [
                { email: "user1@ezwallet.com", user: "u1" },
                { email: "user2@ezwallet.com", user: "u2" },
                { email: "user3@ezwallet.com", user: "u3" },
                { email: "user4@ezwallet.com", user: "u4" },
                { email: "user5@ezwallet.com", user: "u5" },
            ]
        }
        const mockReq = {
            url: "/api/groups/" + mockGroupName + "/transactions/category/",
            query: {
            },
            params: {
                name: mockGroupName,
            },
            body: {
            }
        }
        const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            locals: {
            }
        }

        Group.findOne.mockResolvedValueOnce(mockGroup);
        categories.findOne.mockResolvedValueOnce(true);
        verifyAuth.mockReturnValueOnce({ flag: false, cause: 'user not in group' });

        await getTransactionsByGroup(mockReq, mockRes);

        expect(mockRes.status).toHaveBeenCalledWith(401);
        expect(mockRes.json).toHaveBeenCalledWith({ error: "user not in group" });

    });

    test('U2.9.4: should return 401 error if called by an authenticated user who is not an admin (authType = Admin) if the route is /api/transactions/groups/:name', async () => {
        const mockGroupName = "group1";
        const mockReq = {
            url: "/api/transactions/groups/" + mockGroupName,
            query: {
            },
            params: {
                name: mockGroupName,
            },
            body: {
            }
        };
        const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            locals: {}
        };

        Group.findOne.mockResolvedValueOnce(true);
        verifyAuth.mockReturnValueOnce({ flag: false, cause: 'Not admin' });

        await getTransactionsByGroup(mockReq, mockRes);

        expect(verifyAuth).toHaveBeenCalledWith(mockReq, mockRes, { authType: 'Admin' });
        expect(mockRes.status).toHaveBeenCalledWith(401);
        expect(mockRes.json).toHaveBeenCalledWith({ error: "Not admin" });

    });

    test('U2.9.5: should throw a "unknown route" error if the path is wrong', async () => {
        const mockGroupName = "group1";
        const mockReq = {
            url: "/api/unknown/route",
            query: {
            },
            params: {
                name: mockGroupName,
            },
            body: {
            }
        };
        const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            locals: {}
        };

        await getTransactionsByGroup(mockReq, mockRes);

        expect(mockRes.status).toHaveBeenCalledWith(500);
        expect(mockRes.json).toHaveBeenCalledWith({ error: 'unknown route' });
    });


    test("U2.9.6: should show all transactions of members of user's group group (user route)", async () => {
        const mockGroupName = "group1";
        const mockPopulatedGroup = {
            _id: 1,
            name: mockGroupName,
            members: [
                { email: "user1@ezwallet.com", user: { _id: "1", username: "user1" } },
                { email: "user2@ezwallet.com", user: { _id: "2", username: "user2" } },
                { email: "user3@ezwallet.com", user: { _id: "3", username: "user3" } },
                { email: "user4@ezwallet.com", user: { _id: "4", username: "user4" } },
                { email: "user5@ezwallet.com", user: { _id: "5", username: "user5" } },
            ]
        }
        const mockGroup = {
            _id: 1,
            name: mockGroupName,
            members: [
                { email: "user1@ezwallet.com", user: "1" },
                { email: "user2@ezwallet.com", user: "2" },
                { email: "user3@ezwallet.com", user: "3" },
                { email: "user4@ezwallet.com", user: "4" },
                { email: "user5@ezwallet.com", user: "5" },
            ],
            populate: jest.fn().mockResolvedValueOnce(mockPopulatedGroup)
        }
        const mockReq = {
            url: "/api/groups/" + mockGroupName + "/transactions",
            query: {
            }
            ,
            params: {
                name: mockGroupName
            },
            body: {
            }
        }
        const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            locals: {
            }
        }
        const mockTransactionAggregateFilter = [
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
                        $in: mockPopulatedGroup.members.map(m => m.user.username)
                    }
                },
            },
            { $unwind: "$categories_info" }
        ]
        const mockDate = Date.now();
        const mockTransactionAggregate = [
            { _id: 1, username: "user1", amount: 100.00, type: "type1", date: mockDate, categories_info: { _id: 1, type: "type1", color: "color1" } },
            { _id: 2, username: "user2", amount: 200.00, type: "type1", date: mockDate, categories_info: { _id: 1, type: "type1", color: "color1" } },
            { _id: 3, username: "user3", amount: 300.00, type: "type1", date: mockDate, categories_info: { _id: 1, type: "type1", color: "color1" } },
            { _id: 4, username: "user4", amount: 400.00, type: "type1", date: mockDate, categories_info: { _id: 1, type: "type1", color: "color1" } },
            { _id: 5, username: "user5", amount: 500.00, type: "type1", date: mockDate, categories_info: { _id: 1, type: "type1", color: "color1" } },
        ]
        const mockResStatus = 200
        const mockResData = {
            data: [
                { username: "user1", amount: 100.00, type: "type1", date: mockDate, color: "color1" },
                { username: "user2", amount: 200.00, type: "type1", date: mockDate, color: "color1" },
                { username: "user3", amount: 300.00, type: "type1", date: mockDate, color: "color1" },
                { username: "user4", amount: 400.00, type: "type1", date: mockDate, color: "color1" },
                { username: "user5", amount: 500.00, type: "type1", date: mockDate, color: "color1" },
            ]
        }

        Group.findOne.mockResolvedValueOnce(mockGroup);
        //mockGroup.populate.mockResolvedValueOnce(mockPopulatedGroup);
        verifyAuth.mockReturnValueOnce({ flag: true, cause: 'Authorized' });
        User.findOne.mockResolvedValueOnce(mockPopulatedGroup.members[0].user);
        User.findOne.mockResolvedValueOnce(mockPopulatedGroup.members[1].user);
        User.findOne.mockResolvedValueOnce(mockPopulatedGroup.members[2].user);
        User.findOne.mockResolvedValueOnce(mockPopulatedGroup.members[3].user);
        User.findOne.mockResolvedValueOnce(mockPopulatedGroup.members[4].user);

        transactions.aggregate.mockResolvedValueOnce(mockTransactionAggregate);

        await getTransactionsByGroup(mockReq, mockRes);

        expect(Group.findOne).toHaveBeenCalledWith({ name: mockGroupName });
        //expect(mockGroup.populate).toHaveBeenCalled();
        expect(verifyAuth).toHaveBeenCalledWith(mockReq, mockRes, { authType: "Group", emails: ["user1@ezwallet.com", "user2@ezwallet.com", "user3@ezwallet.com", "user4@ezwallet.com", "user5@ezwallet.com"] });
        expect(User.findOne).toHaveBeenCalledWith({ email: mockGroup.members[0].email });
        expect(User.findOne).toHaveBeenCalledWith({ email: mockGroup.members[1].email });
        expect(User.findOne).toHaveBeenCalledWith({ email: mockGroup.members[2].email });
        expect(User.findOne).toHaveBeenCalledWith({ email: mockGroup.members[3].email });
        expect(User.findOne).toHaveBeenCalledWith({ email: mockGroup.members[4].email });
        expect(transactions.aggregate).toHaveBeenCalledWith(mockTransactionAggregateFilter);
        expect(mockRes.status).toHaveBeenCalledWith(mockResStatus);
        expect(mockRes.json).toHaveBeenCalledWith(mockResData);
    });

    test("U2.9.7: should show all transactions of members of group (admin route)", async () => {
        const mockGroupName = "group1";
        const mockPopulatedGroup = {
            _id: 1,
            name: mockGroupName,
            members: [
                { email: "user1@ezwallet.com", user: { _id: "1", username: "user1" } },
                { email: "user2@ezwallet.com", user: { _id: "2", username: "user2" } },
                { email: "user3@ezwallet.com", user: { _id: "3", username: "user3" } },
                { email: "user4@ezwallet.com", user: { _id: "4", username: "user4" } },
                { email: "user5@ezwallet.com", user: { _id: "5", username: "user5" } },
            ]
        }
        const mockGroup = {
            _id: 1,
            name: mockGroupName,
            members: [
                { email: "user1@ezwallet.com", user: "1" },
                { email: "user2@ezwallet.com", user: "2" },
                { email: "user3@ezwallet.com", user: "3" },
                { email: "user4@ezwallet.com", user: "4" },
                { email: "user5@ezwallet.com", user: "5" },
            ],
            populate: jest.fn().mockResolvedValueOnce(mockPopulatedGroup)
        }
        const mockReq = {
            url: "/api/transactions/groups/" + mockGroupName,
            query: {
            }
            ,
            params: {
                name: mockGroupName
            },
            body: {
            }
        }
        const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            locals: {
            }
        }
        const mockTransactionAggregateFilter = [
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
                        $in: mockPopulatedGroup.members.map(m => m.user.username)
                    }
                },
            },
            { $unwind: "$categories_info" }
        ]
        const mockDate = Date.now();
        const mockTransactionAggregate = [
            { _id: 1, username: "user1", amount: 100.00, type: "type1", date: mockDate, categories_info: { _id: 1, type: "type1", color: "color1" } },
            { _id: 2, username: "user2", amount: 200.00, type: "type1", date: mockDate, categories_info: { _id: 1, type: "type1", color: "color1" } },
            { _id: 3, username: "user3", amount: 300.00, type: "type1", date: mockDate, categories_info: { _id: 1, type: "type1", color: "color1" } },
            { _id: 4, username: "user4", amount: 400.00, type: "type1", date: mockDate, categories_info: { _id: 1, type: "type1", color: "color1" } },
            { _id: 5, username: "user5", amount: 500.00, type: "type1", date: mockDate, categories_info: { _id: 1, type: "type1", color: "color1" } },
        ]
        const mockResStatus = 200
        const mockResData = {
            data: [
                { username: "user1", amount: 100.00, type: "type1", date: mockDate, color: "color1" },
                { username: "user2", amount: 200.00, type: "type1", date: mockDate, color: "color1" },
                { username: "user3", amount: 300.00, type: "type1", date: mockDate, color: "color1" },
                { username: "user4", amount: 400.00, type: "type1", date: mockDate, color: "color1" },
                { username: "user5", amount: 500.00, type: "type1", date: mockDate, color: "color1" },
            ]
        }

        verifyAuth.mockReturnValueOnce({ flag: true, cause: 'Authorized' });
        Group.findOne.mockResolvedValueOnce(mockGroup);
        //mockGroup.populate.mockResolvedValueOnce(mockPopulatedGroup);
        User.findOne.mockResolvedValueOnce(mockPopulatedGroup.members[0].user);
        User.findOne.mockResolvedValueOnce(mockPopulatedGroup.members[1].user);
        User.findOne.mockResolvedValueOnce(mockPopulatedGroup.members[2].user);
        User.findOne.mockResolvedValueOnce(mockPopulatedGroup.members[3].user);
        User.findOne.mockResolvedValueOnce(mockPopulatedGroup.members[4].user);
        transactions.aggregate.mockResolvedValueOnce(mockTransactionAggregate);

        await getTransactionsByGroup(mockReq, mockRes);

        expect(verifyAuth).toHaveBeenCalledWith(mockReq, mockRes, { authType: "Admin" });
        expect(Group.findOne).toHaveBeenCalledWith({ name: mockGroupName });
        //expect(mockGroup.populate).toHaveBeenCalled();
        expect(User.findOne).toHaveBeenCalledWith({ email: mockGroup.members[0].email });
        expect(User.findOne).toHaveBeenCalledWith({ email: mockGroup.members[1].email });
        expect(User.findOne).toHaveBeenCalledWith({ email: mockGroup.members[2].email });
        expect(User.findOne).toHaveBeenCalledWith({ email: mockGroup.members[3].email });
        expect(User.findOne).toHaveBeenCalledWith({ email: mockGroup.members[4].email });
        expect(transactions.aggregate).toHaveBeenCalledWith(mockTransactionAggregateFilter);
        expect(mockRes.status).toHaveBeenCalledWith(mockResStatus);
        expect(mockRes.json).toHaveBeenCalledWith(mockResData);
    });
})

describe("U2.10: getTransactionsByGroupByCategory", () => {

    test('U2.10.1: should return 400 error if the group name passed as a route parameter does not represent a group in the database(user route)', async () => {
        const mockGroupName = "nonGroup";
        const mockCategory = "type1"
        const mockReq = {
            url: "/api/groups/" + mockGroupName + "/transactions/category/" + mockCategory,
            query: {
            },
            params: {
                name: mockGroupName,
                category: mockCategory
            },
            body: {
            }
        }
        const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            locals: {
            }
        }

        Group.findOne.mockResolvedValueOnce(false);

        await getTransactionsByGroupByCategory(mockReq, mockRes);

        expect(mockRes.status).toHaveBeenCalledWith(400);
        expect(mockRes.json).toHaveBeenCalledWith({ error: 'group does not exist' });
    });

    test('U2.10.2: should return 400 error if the group name passed as a route parameter does not represent a group in the database(admin route)', async () => {
        const mockGroupName = "nonGroup";
        const mockCategory = "type1"
        const mockReq = {
            url: "/api/transactions/groups/" + mockGroupName + "/category/" + mockCategory,
            query: {
            },
            params: {
                name: mockGroupName,
                category: mockCategory
            },
            body: {
            }
        }
        const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            locals: {
            }
        }

        verifyAuth.mockReturnValueOnce({ flag: true, cause: "authorized" });
        Group.findOne.mockResolvedValueOnce(false);

        await getTransactionsByGroupByCategory(mockReq, mockRes);

        expect(mockRes.status).toHaveBeenCalledWith(400);
        expect(mockRes.json).toHaveBeenCalledWith({ error: 'group does not exist' });
    });

    test('U2.10.3: should return 400 error if the category passed as a route parameter does not represent a category in the database', async () => {
        const mockGroupName = "group1";
        const mockPopulatedGroup = {
            _id: 1,
            name: mockGroupName,
            members: [
                { email: "user1@ezwallet.com", user: { _id: "1", username: "user1" } },
                { email: "user2@ezwallet.com", user: { _id: "2", username: "user2" } },
                { email: "user3@ezwallet.com", user: { _id: "3", username: "user3" } },
                { email: "user4@ezwallet.com", user: { _id: "4", username: "user4" } },
                { email: "user5@ezwallet.com", user: { _id: "5", username: "user5" } },
            ]
        }
        const mockGroup = {
            _id: 1,
            name: mockGroupName,
            members: [
                { email: "user1@ezwallet.com", user: "1" },
                { email: "user2@ezwallet.com", user: "2" },
                { email: "user3@ezwallet.com", user: "3" },
                { email: "user4@ezwallet.com", user: "4" },
                { email: "user5@ezwallet.com", user: "5" },
            ],
            populate: jest.fn().mockResolvedValueOnce(mockPopulatedGroup)
        }
        const mockCategory = "nonType";
        const mockReq = {
            url: "/api/groups/" + mockGroupName + "/transactions/category/" + mockCategory,
            query: {
            },
            params: {
                name: mockGroupName,
                category: mockCategory
            },
            body: {
            }
        }
        const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            locals: {
            }
        }

        Group.findOne.mockResolvedValueOnce(mockGroup);
        verifyAuth.mockReturnValueOnce({ flag: true, cause: "authorized" });
        categories.findOne.mockResolvedValueOnce(false);

        await getTransactionsByGroupByCategory(mockReq, mockRes);

        expect(mockRes.status).toHaveBeenCalledWith(400);
        expect(mockRes.json).toHaveBeenCalledWith({ error: 'category does not exist' });
    });

    test('U2.10.4: should return 401 error if called by an authenticated user who is not part of the group (authType = Group) if the route is /api/groups/:name/transactions', async () => {
        const mockGroupName = "group1";
        const mockCategory = "type1";
        const mockGroup = {
            _id: 1,
            name: mockGroupName,
            members: [
                { email: "user1@ezwallet.com", user: "u1" },
                { email: "user2@ezwallet.com", user: "u2" },
                { email: "user3@ezwallet.com", user: "u3" },
                { email: "user4@ezwallet.com", user: "u4" },
                { email: "user5@ezwallet.com", user: "u5" },
            ]
        }
        const mockReq = {
            url: "/api/groups/" + mockGroupName + "/transactions/category/" + mockCategory,
            query: {
            },
            params: {
                name: mockGroupName,
                category: mockCategory
            },
            body: {
            }
        }
        const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            locals: {
            }
        }

        Group.findOne.mockResolvedValueOnce(mockGroup);
        categories.findOne.mockResolvedValueOnce(true);
        verifyAuth.mockReturnValueOnce({ flag: false, cause: 'user not in group' });

        await getTransactionsByGroupByCategory(mockReq, mockRes);

        expect(mockRes.status).toHaveBeenCalledWith(401);
        expect(mockRes.json).toHaveBeenCalledWith({ error: "user not in group" });
    });

    test('U2.10.5: should return 401 error if called by an authenticated user who is not an admin (authType = Admin) if the route is /api/transactions/groups/:name', async () => {
        const mockGroupName = "group1";
        const mockCategory = "type1";
        const mockReq = {
            url: "/api/transactions/groups/group1/category/type1",
            query: {
            },
            params: {
                name: mockGroupName,
                category: mockCategory
            },
            body: {
            }
        };
        const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            locals: {}
        };

        Group.findOne.mockResolvedValueOnce(true);
        categories.findOne.mockResolvedValueOnce(true);
        verifyAuth.mockReturnValueOnce({ flag: false, cause: 'Not admin' });

        await getTransactionsByGroupByCategory(mockReq, mockRes);

        expect(verifyAuth).toHaveBeenCalledWith(mockReq, mockRes, { authType: 'Admin' });
        expect(mockRes.status).toHaveBeenCalledWith(401);
        expect(mockRes.json).toHaveBeenCalledWith({ error: "Not admin" });

    });



    test('U2.10.6: should throw a "unknown route" error if the path is wrong', async () => {
        const mockGroupName = "group1";
        const mockCategory = "type1";
        const mockReq = {
            url: "/api/unknown/route",
            query: {
            },
            params: {
                name: mockGroupName,
                category: mockCategory
            },
            body: {
            }
        };
        const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            locals: {}
        };

        await getTransactionsByGroupByCategory(mockReq, mockRes);

        expect(mockRes.status).toHaveBeenCalledWith(500);
        expect(mockRes.json).toHaveBeenCalledWith({ error: 'unknown route' });

    });

    test('U2.10.7: should show all transactions of members of the group (user route)', async () => {
        const mockGroupName = "group1";
        const mockCategory = "type1";
        const mockPopulatedGroup = {
            _id: 1,
            name: mockGroupName,
            members: [
                { email: "user1@ezwallet.com", user: { _id: "1", username: "user1" } },
                { email: "user2@ezwallet.com", user: { _id: "2", username: "user2" } },
                { email: "user3@ezwallet.com", user: { _id: "3", username: "user3" } },
                { email: "user4@ezwallet.com", user: { _id: "4", username: "user4" } },
                { email: "user5@ezwallet.com", user: { _id: "5", username: "user5" } },
            ]
        }
        const mockGroup = {
            _id: 1,
            name: mockGroupName,
            members: [
                { email: "user1@ezwallet.com", user: "1" },
                { email: "user2@ezwallet.com", user: "2" },
                { email: "user3@ezwallet.com", user: "3" },
                { email: "user4@ezwallet.com", user: "4" },
                { email: "user5@ezwallet.com", user: "5" },
            ],
            populate: jest.fn().mockResolvedValueOnce(mockPopulatedGroup)
        }
        const mockReq = {
            url: "/api/groups/" + mockGroupName + "/transactions/category/" + mockCategory,
            query: {
            }
            ,
            params: {
                name: mockGroupName,
                category: mockCategory
            },
            body: {
            }
        }
        const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            locals: {
            }
        }
        const mockTransactionAggregateFilter = [
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
                        $in: mockPopulatedGroup.members.map(m => m.user.username)
                    },
                    type: mockCategory
                },
            },
            { $unwind: "$categories_info" }
        ]
        const mockDate = Date.now();
        const mockTransactionAggregate = [
            { _id: 1, username: "user1", amount: 100.00, type: "type1", date: mockDate, categories_info: { _id: 1, type: "type1", color: "color1" } },
            { _id: 2, username: "user2", amount: 200.00, type: "type1", date: mockDate, categories_info: { _id: 1, type: "type1", color: "color1" } },
            { _id: 3, username: "user3", amount: 300.00, type: "type1", date: mockDate, categories_info: { _id: 1, type: "type1", color: "color1" } },
            { _id: 4, username: "user4", amount: 400.00, type: "type1", date: mockDate, categories_info: { _id: 1, type: "type1", color: "color1" } },
            { _id: 5, username: "user5", amount: 500.00, type: "type1", date: mockDate, categories_info: { _id: 1, type: "type1", color: "color1" } },
        ]
        const mockResStatus = 200
        const mockResData = {
            data: [
                { username: "user1", amount: 100.00, type: "type1", date: mockDate, color: "color1" },
                { username: "user2", amount: 200.00, type: "type1", date: mockDate, color: "color1" },
                { username: "user3", amount: 300.00, type: "type1", date: mockDate, color: "color1" },
                { username: "user4", amount: 400.00, type: "type1", date: mockDate, color: "color1" },
                { username: "user5", amount: 500.00, type: "type1", date: mockDate, color: "color1" },
            ]
        }

        Group.findOne.mockResolvedValueOnce(mockGroup);
        verifyAuth.mockReturnValueOnce({ flag: true, cause: 'Authorized' });
        //mockGroup.populate.mockResolvedValueOnce(mockPopulatedGroup);
        verifyAuth.mockReturnValueOnce({ flag: true, cause: 'Authorized' });
        User.findOne.mockResolvedValueOnce(mockPopulatedGroup.members[0].user);
        User.findOne.mockResolvedValueOnce(mockPopulatedGroup.members[1].user);
        User.findOne.mockResolvedValueOnce(mockPopulatedGroup.members[2].user);
        User.findOne.mockResolvedValueOnce(mockPopulatedGroup.members[3].user);
        User.findOne.mockResolvedValueOnce(mockPopulatedGroup.members[4].user);
        categories.findOne.mockResolvedValueOnce(true);
        transactions.aggregate.mockResolvedValueOnce(mockTransactionAggregate);

        await getTransactionsByGroupByCategory(mockReq, mockRes);

        expect(Group.findOne).toHaveBeenCalledWith({ name: mockGroupName });
        //expect(mockGroup.populate).toHaveBeenCalled();
        expect(verifyAuth).toHaveBeenCalledWith(mockReq, mockRes, { authType: "Group", emails: ["user1@ezwallet.com", "user2@ezwallet.com", "user3@ezwallet.com", "user4@ezwallet.com", "user5@ezwallet.com"] });
        expect(User.findOne).toHaveBeenCalledWith({ email: mockGroup.members[0].email });
        expect(User.findOne).toHaveBeenCalledWith({ email: mockGroup.members[1].email });
        expect(User.findOne).toHaveBeenCalledWith({ email: mockGroup.members[2].email });
        expect(User.findOne).toHaveBeenCalledWith({ email: mockGroup.members[3].email });
        expect(User.findOne).toHaveBeenCalledWith({ email: mockGroup.members[4].email });
        expect(verifyAuth).toHaveBeenCalledWith(mockReq, mockRes, { authType: "Group", emails: ["user1@ezwallet.com", "user2@ezwallet.com", "user3@ezwallet.com", "user4@ezwallet.com", "user5@ezwallet.com"] });
        expect(categories.findOne).toHaveBeenCalledWith({ type: mockCategory });
        expect(transactions.aggregate).toHaveBeenCalledWith(mockTransactionAggregateFilter);
        expect(mockRes.status).toHaveBeenCalledWith(mockResStatus);
        expect(mockRes.json).toHaveBeenCalledWith(mockResData);
    });
    test('U2.10.8: should show all transactions of members of the group (admin route)', async () => {
        const mockGroupName = "group1";
        const mockCategory = "type1";
        const mockPopulatedGroup = {
            _id: 1,
            name: mockGroupName,
            members: [
                { email: "user1@ezwallet.com", user: { _id: "1", username: "user1" } },
                { email: "user2@ezwallet.com", user: { _id: "2", username: "user2" } },
                { email: "user3@ezwallet.com", user: { _id: "3", username: "user3" } },
                { email: "user4@ezwallet.com", user: { _id: "4", username: "user4" } },
                { email: "user5@ezwallet.com", user: { _id: "5", username: "user5" } },
            ]
        }
        const mockGroup = {
            _id: 1,
            name: mockGroupName,
            members: [
                { email: "user1@ezwallet.com", user: "1" },
                { email: "user2@ezwallet.com", user: "2" },
                { email: "user3@ezwallet.com", user: "3" },
                { email: "user4@ezwallet.com", user: "4" },
                { email: "user5@ezwallet.com", user: "5" },
            ],
            populate: jest.fn().mockResolvedValueOnce(mockPopulatedGroup)
        }
        const mockReq = {
            url: "/api/transactions/groups/" + mockGroupName + "/category/" + mockCategory,
            query: {
            }
            ,
            params: {
                name: mockGroupName,
                category: mockCategory
            },
            body: {
            }
        }
        const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),//.mockImplementationOnce(a =>//console.log(a)),
            locals: {
            }
        }
        const mockTransactionAggregateFilter = [
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
                        $in: mockPopulatedGroup.members.map(m => m.user.username)
                    },
                    type: mockCategory
                },
            },
            { $unwind: "$categories_info" }
        ]
        const mockDate = Date.now();
        const mockTransactionAggregate = [
            { _id: 1, username: "user1", amount: 100.00, type: "type1", date: mockDate, categories_info: { _id: 1, type: "type1", color: "color1" } },
            { _id: 2, username: "user2", amount: 200.00, type: "type1", date: mockDate, categories_info: { _id: 1, type: "type1", color: "color1" } },
            { _id: 3, username: "user3", amount: 300.00, type: "type1", date: mockDate, categories_info: { _id: 1, type: "type1", color: "color1" } },
            { _id: 4, username: "user4", amount: 400.00, type: "type1", date: mockDate, categories_info: { _id: 1, type: "type1", color: "color1" } },
            { _id: 5, username: "user5", amount: 500.00, type: "type1", date: mockDate, categories_info: { _id: 1, type: "type1", color: "color1" } },
        ]
        const mockResStatus = 200
        const mockResData = {
            data: [
                { username: "user1", amount: 100.00, type: "type1", date: mockDate, color: "color1" },
                { username: "user2", amount: 200.00, type: "type1", date: mockDate, color: "color1" },
                { username: "user3", amount: 300.00, type: "type1", date: mockDate, color: "color1" },
                { username: "user4", amount: 400.00, type: "type1", date: mockDate, color: "color1" },
                { username: "user5", amount: 500.00, type: "type1", date: mockDate, color: "color1" },
            ]
        }

        verifyAuth.mockReturnValueOnce({ flag: true, cause: 'Authorized' });
        Group.findOne.mockResolvedValueOnce(mockGroup);
        //mockGroup.populate.mockResolvedValueOnce(mockPopulatedGroup);
        User.findOne.mockResolvedValueOnce(mockPopulatedGroup.members[0].user);
        User.findOne.mockResolvedValueOnce(mockPopulatedGroup.members[1].user);
        User.findOne.mockResolvedValueOnce(mockPopulatedGroup.members[2].user);
        User.findOne.mockResolvedValueOnce(mockPopulatedGroup.members[3].user);
        User.findOne.mockResolvedValueOnce(mockPopulatedGroup.members[4].user);
        categories.findOne.mockResolvedValueOnce(true);
        transactions.aggregate.mockResolvedValueOnce(mockTransactionAggregate);

        await getTransactionsByGroupByCategory(mockReq, mockRes);

        expect(verifyAuth).toHaveBeenCalledWith(mockReq, mockRes, { authType: "Admin" });
        expect(Group.findOne).toHaveBeenCalledWith({ name: mockGroupName });
        //expect(mockGroup.populate).toHaveBeenCalled();
        expect(User.findOne).toHaveBeenCalledWith({ email: mockGroup.members[0].email });
        expect(User.findOne).toHaveBeenCalledWith({ email: mockGroup.members[1].email });
        expect(User.findOne).toHaveBeenCalledWith({ email: mockGroup.members[2].email });
        expect(User.findOne).toHaveBeenCalledWith({ email: mockGroup.members[3].email });
        expect(User.findOne).toHaveBeenCalledWith({ email: mockGroup.members[4].email });
        expect(categories.findOne).toHaveBeenCalledWith({ type: mockCategory })
        expect(transactions.aggregate).toHaveBeenCalledWith(mockTransactionAggregateFilter);
        expect(mockRes.status).toHaveBeenCalledWith(mockResStatus);
        expect(mockRes.json).toHaveBeenCalledWith(mockResData);
    });

})

describe("U2.11: deleteTransaction", () => {
    test('U2.11.1: should return 400 error if the request body does not contain all the necessary attributes', async () => {
        const req = {
            params: {
                username: 'user1'
            },
            body: {

            }
        }
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            locals: {
            }
        }

        verifyAuth.mockReturnValueOnce({ flag: true, cause: 'Authorized' });

        await deleteTransaction(req, res);

        expect(res.status).toBeCalledWith(400);
        expect(res.json).toBeCalledWith({ error: 'incomplete attributes' });
    });

    test('U2.11.2: should return 400 error if the _id in the request body is an empty string', async () => {
        const req = {
            params: {
                username: 'user1'
            },
            body: {
                _id: ''
            }
        }
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            locals: {
            }
        }

        verifyAuth.mockReturnValueOnce({ flag: true, cause: 'Authorized' });

        await deleteTransaction(req, res);

        expect(res.status).toBeCalledWith(400);
        expect(res.json).toBeCalledWith({ error: 'empty string' });
    });

    test('U2.11.3: should return 400 error if the username passed as a route parameter does not represent a user in the database', async () => {
        const req = {
            params: {
                username: 'user1'
            },
            body: {
                _id: 'id1'
            }
        }
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            locals: {
            }
        }

        verifyAuth.mockReturnValueOnce({ flag: true, cause: 'Authorized' });

        jest.spyOn(User, 'findOne').mockResolvedValueOnce(null);

        await deleteTransaction(req, res);

        expect(res.status).toBeCalledWith(400);
        expect(res.json).toBeCalledWith({ error: 'user does not exist' });
    });

    test('U2.11.4: should return 400 error if the _id in the request body does not represent a transaction in the database', async () => {
        const req = {
            params: {
                username: 'user1'
            },
            body: {
                _id: 'id1'
            }
        }
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            locals: {
            }
        }

        verifyAuth.mockReturnValueOnce({ flag: true, cause: 'Authorized' });

        jest.spyOn(User, 'findOne').mockResolvedValueOnce(true);
        jest.spyOn(transactions, 'findOne').mockResolvedValueOnce(false);

        await deleteTransaction(req, res);

        expect(res.status).toBeCalledWith(400);
        expect(res.json).toBeCalledWith({ error: 'transaction does not exist' });
    });

    test('U2.11.5: should return 400 error if the _id in the request body represents a transaction made by a different user than the one in the route', async () => {
        const req = {
            params: {
                username: 'user1'
            },
            body: {
                _id: 'id1'
            }
        }
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            locals: {
            }
        }
        const mockTransaction = {
            _id: "id1", username: "user2", type: "type1", date: Date.now()
        }

        verifyAuth.mockReturnValueOnce({ flag: true, cause: 'Authorized' });

        jest.spyOn(User, 'findOne').mockResolvedValueOnce(true);
        jest.spyOn(transactions, 'findOne').mockResolvedValueOnce(mockTransaction);

        await deleteTransaction(req, res);

        expect(res.status).toBeCalledWith(400);
        expect(res.json).toBeCalledWith({ error: 'transaction made by different user' });
    });

    test('U2.11.6: should return 401 error if user is not authenticated', async () => {
        const req = {
            params: {
                username: 'user1'
            },
            body: {
                _id: 'id1'
            }
        }
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            locals: {
            }
        }
        const mockTransaction = {
            _id: "id1", username: "user1", type: "type1", date: Date.now()
        }


        verifyAuth.mockReturnValueOnce({ flag: false, cause: 'Unauthorized' });

        jest.spyOn(User, 'findOne').mockResolvedValueOnce(true);
        jest.spyOn(transactions, 'findOne').mockResolvedValueOnce(mockTransaction);


        await deleteTransaction(req, res);

        expect(res.status).toBeCalledWith(401);
        expect(res.json).toBeCalledWith({ error: 'Unauthorized' });
    });

    test('U2.11.7: should delete a transaction', async () => {
        const mockUsername = "user1";
        const mockTransaction_id = "id1";
        const mockReq = {
            params: {
                username: mockUsername
            },
            body: {
                _id: mockTransaction_id
            }
        }
        const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            locals: {
            }
        }
        const mockTransaction = {
            _id: "id1", username: "user1", type: "type1", date: Date.now()
        }
        const mockResStatus = 200
        const mockResData = {
            data: {
                message: "Transaction deleted"
            }
        }
        verifyAuth.mockReturnValueOnce({ flag: true, cause: "authorized" });

        User.findOne.mockResolvedValueOnce(true);
        transactions.findOne.mockResolvedValueOnce(mockTransaction);
        transactions.deleteOne.mockResolvedValueOnce(true);

        await deleteTransaction(mockReq, mockRes);

        expect(verifyAuth).toHaveBeenCalledWith(mockReq, mockRes, { authType: "User", username: mockUsername });
        expect(User.findOne).toHaveBeenCalledWith({ username: mockUsername });
        expect(transactions.findOne).toHaveBeenCalledWith({ _id: mockTransaction_id });
        expect(transactions.deleteOne).toHaveBeenCalledWith({ _id: mockTransaction_id });
        expect(mockRes.status).toHaveBeenCalledWith(mockResStatus);
        expect(mockRes.json).toHaveBeenCalledWith(mockResData);
    });

    test('U2.11.8: should return a 500 if an error occurs', async () => {
        const mockUsername = "user1";
        const mockTransaction_id = "id1";
        const req = {
            params: {
                username: mockUsername
            },
            body: {
                _id: mockTransaction_id
            }
        }
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            locals: {
            }
        }
        const mockTransaction = {
            _id: "id1", username: "user1", type: "type1", date: Date.now()
        }

        const errorMessage = 'Error';

        verifyAuth.mockReturnValueOnce({ flag: true, cause: "authorized" });
        User.findOne.mockResolvedValueOnce(true);
        transactions.findOne.mockResolvedValueOnce(mockTransaction);

        jest.spyOn(console, 'error').mockImplementation(() => { });
        jest.spyOn(transactions, 'deleteOne').mockRejectedValueOnce(new Error(errorMessage));

        await deleteTransaction(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
    });
})

describe("U2.12: deleteTransactions", () => {
    test('U2.12.1: should return 400 error if the request body does not contain all the necessary attributes', async () => {
        const req = {
            body: {

            }
        }
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        }

        verifyAuth.mockReturnValueOnce({ flag: true, cause: 'Authorized' });

        await deleteTransactions(req, res);

        expect(res.status).toBeCalledWith(400);
        expect(res.json).toBeCalledWith({ error: 'incomplete attributes' });
    });

    test('U2.12.2: should return 400 error if at least one of the ids in the array is an empty string', async () => {
        const mockTransaction_ids = [
            "id1",
            "id2",
            "id3",
            "",
            "id5",
        ];
        const req = {
            body: {
                _ids: mockTransaction_ids
            }
        }
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            locals: {
            }
        }

        verifyAuth.mockReturnValueOnce({ flag: true, cause: 'Authorized' });

        await deleteTransactions(req, res);

        expect(res.status).toBeCalledWith(400);
        expect(res.json).toBeCalledWith({ error: 'at least one: empty string' });
    });

    test('U2.12.3: should return 400 error if at least one of the ids in the array does not represent a transaction in the database', async () => {
        const mockTransaction_ids = [
            "id1",
            "id2",
            "id3",
            "id4",
            "id5",
        ];
        const req = {
            body: {
                _ids: mockTransaction_ids
            }
        }
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            locals: {
            }
        }

        verifyAuth.mockReturnValueOnce({ flag: true, cause: "authorized" });
        transactions.countDocuments.mockResolvedValueOnce(false);

        await deleteTransactions(req, res);

        expect(res.status).toBeCalledWith(400);
        expect(res.json).toBeCalledWith({ error: 'at least one transaction does not exist' });
    });

    test('U2.12.4: should return 401 error if called by an authenticated user who is not an admin (authType = Admin)', async () => {
        const mockTransaction_ids = [
            "id1",
            "id2",
            "id3",
            "id4",
            "id5",
        ];
        const req = {
            body: {
                _ids: mockTransaction_ids
            }
        }
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            locals: {
            }
        }

        verifyAuth.mockReturnValueOnce({ flag: false, cause: "Not admin" });

        await deleteTransactions(req, res);

        expect(res.status).toBeCalledWith(401);
        expect(res.json).toBeCalledWith({ error: 'Not admin' });
    });

    test('U2.12.5: should delete all transactions in an array', async () => {
        const mockTransaction_ids = [
            "id1",
            "id2",
            "id3",
            "id4",
            "id5",
        ];
        const mockReq = {
            params: {
            },
            body: {
                _ids: mockTransaction_ids
            }
        }
        const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            locals: {
            }
        }
        const mockResStatus = 200
        const mockResData = {
            data: {
                message: "Transactions deleted"
            }
        }
        verifyAuth.mockReturnValueOnce({ flag: true, cause: "authorized" });
        transactions.countDocuments.mockResolvedValueOnce(true);
        transactions.countDocuments.mockResolvedValueOnce(true);
        transactions.countDocuments.mockResolvedValueOnce(true);
        transactions.countDocuments.mockResolvedValueOnce(true);
        transactions.countDocuments.mockResolvedValueOnce(true);
        transactions.deleteMany.mockResolvedValueOnce(true);

        await deleteTransactions(mockReq, mockRes);

        expect(verifyAuth).toHaveBeenCalledWith(mockReq, mockRes, { authType: "Admin" });
        expect(transactions.countDocuments).toHaveBeenCalledWith({ _id: "id1" });
        expect(transactions.countDocuments).toHaveBeenCalledWith({ _id: "id2" });
        expect(transactions.countDocuments).toHaveBeenCalledWith({ _id: "id3" });
        expect(transactions.countDocuments).toHaveBeenCalledWith({ _id: "id4" });
        expect(transactions.countDocuments).toHaveBeenCalledWith({ _id: "id5" });
        expect(transactions.deleteMany).toHaveBeenCalledWith({ _id: { $in: mockTransaction_ids } });
        expect(mockRes.status).toHaveBeenCalledWith(mockResStatus);
        expect(mockRes.json).toHaveBeenCalledWith(mockResData);
    })

    test('U2.12.6: should return a 500 error if error thrown', async () => {
        const mockTransaction_ids = [
            "id1",
            "id2",
            "id3",
            "id4",
            "id5",
        ];
        const mockReq = {
            params: {
            },
            body: {
                _ids: mockTransaction_ids
            }
        }
        const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            locals: {
            }
        }
        const mockResStatus = 500
        const mockErrorMessage = "internal error";
        const mockResData = { error: mockErrorMessage }

        verifyAuth.mockReturnValueOnce({ flag: true, cause: "authorized" });
        transactions.countDocuments.mockResolvedValueOnce(true);
        transactions.countDocuments.mockResolvedValueOnce(true);
        transactions.countDocuments.mockResolvedValueOnce(true);
        transactions.countDocuments.mockResolvedValueOnce(true);
        transactions.countDocuments.mockResolvedValueOnce(true);
        transactions.deleteMany.mockRejectedValueOnce(new Error(mockErrorMessage));

        await deleteTransactions(mockReq, mockRes);

        expect(verifyAuth).toHaveBeenCalledWith(mockReq, mockRes, { authType: "Admin" });
        expect(transactions.countDocuments).toHaveBeenCalledWith({ _id: "id1" });
        expect(transactions.countDocuments).toHaveBeenCalledWith({ _id: "id2" });
        expect(transactions.countDocuments).toHaveBeenCalledWith({ _id: "id3" });
        expect(transactions.countDocuments).toHaveBeenCalledWith({ _id: "id4" });
        expect(transactions.countDocuments).toHaveBeenCalledWith({ _id: "id5" });
        expect(transactions.deleteMany).toHaveBeenCalledWith({ _id: { $in: mockTransaction_ids } });
        expect(mockRes.status).toHaveBeenCalledWith(mockResStatus);
        expect(mockRes.json).toHaveBeenCalledWith(mockResData);
    })
})
