import { categories, transactions } from '../models/model';
import { Group, User } from '../models/User';
import { handleAmountFilterParams, handleDateFilterParams, verifyAuth } from '../controllers/utils';
import { createCategory, createTransaction, deleteCategory, deleteTransaction, deleteTransactions, getAllTransactions, getCategories, getTransactionsByGroup, getTransactionsByGroupByCategory, getTransactionsByUser, getTransactionsByUserByCategory, updateCategory } from '../controllers/controller';

jest.mock('../models/model');
jest.mock('../controllers/utils');
jest.mock('../models/User');

beforeEach(() => {
    /*verifyAuth.mockClear();
    handleDateFilterParams.mockClear();
    handleAmountFilterParams.mockClear();

    categories.find.mockClear();
    transactions.find.mockClear();

    categories.findOne.mockClear();
    transactions.findOne.mockClear();
    User.findOne.mockClear();
    Group.findOne.mockClear();

    categories.updateMany.mockClear();
    transactions.updateMany.mockClear();
    User.updateMany.mockClear();
    Group.updateMany.mockClear();

    categories.deleteMany.mockClear();
    transactions.deleteMany.mockClear();
    User.deleteMany.mockClear();
    Group.deleteMany.mockClear();

    categories.deleteOne.mockClear();
    transactions.deleteOne.mockClear();
    User.deleteOne.mockClear();
    Group.deleteOne.mockClear();

    transactions.aggregate.mockClear();

    categories.prototype.save.mockClear();
    transactions.prototype.save.mockClear();
    User.prototype.save.mockClear();
    Group.prototype.save.mockClear();
*/
    jest.resetAllMocks();

});

describe("createCategory", () => {
    afterEach(() => {
        jest.clearAllMocks();
    });
    
    test('should return 400 error if request body is incomplete', async () => {
        const req = { body: { type: 'testType' } };
        const res = {
          status: jest.fn().mockReturnThis(),
          json: jest.fn(),
        };
    
        verifyAuth.mockReturnValue({ flag: true, cause: 'Authorized' })

        await createCategory(req, res);
    
        expect(res.status).toBeCalledWith(400);
        expect(res.json).toBeCalledWith({ error: 'incomplete attributes' });
      });

    test('should return 400 error if request body contains empty strings', async () => {
        const req = { body: { type: '', color: 'testColor' } };
        const res = {
          status: jest.fn().mockReturnThis(),
          json: jest.fn(),
        };

        verifyAuth.mockReturnValue({ flag: true, cause: 'Authorized' })
    
        await createCategory(req, res);
    
        expect(res.status).toBeCalledWith(400);
        expect(res.json).toBeCalledWith({ error: 'empty string' });
    });

    test('should return 401 error if called by an authenticated user who is not an admin', async () => {
        const req = { body: { type: 'testType', color: 'testColor' } };
        const res = {
          status: jest.fn().mockReturnThis(),
          json: jest.fn(),
        };

        verifyAuth.mockReturnValue({ flag: false, cause: 'Not admin' });

        await createCategory(req, res);

        expect(res.status).toBeCalledWith(401);
        expect(res.json).toBeCalledWith({ error: 'Not admin' });
    });

    test('should return 400 if the type represents an already existing category in the database', async () => {
        const req = { body: { type: 'testType', color: 'testColor' } };
        const res = {
          status: jest.fn().mockReturnThis(),
          json: jest.fn(),
        };

        verifyAuth.mockReturnValue({ flag: true, cause: 'Authorized' })
        const mockFindOne = jest.spyOn(categories, 'findOne');
        mockFindOne.mockResolvedValue({ type: 'testType' });
    
        await createCategory(req, res);
        
    
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ error: 'category already exists' });
      });

    test('should create new category', async () => {
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

        verifyAuth.mockReturnValue({ flag: true, cause: 'Authorized' })
        jest.spyOn(categories, 'findOne').mockResolvedValue(null);
        jest.spyOn(categories.prototype, 'save').mockResolvedValue({ _id: "0", type: "testType", color: "testColor" });

        await createCategory(mockReq, mockRes);

        expect(verifyAuth).toHaveBeenCalledWith(mockReq, mockRes, { authType: 'Admin' });
        expect(categories.prototype.save).toHaveBeenCalledWith();
        //expect(categories.find).toHaveBeenCalledWith({ type: "testType" });
        expect(mockRes.status).toHaveBeenCalledWith(mockResStatus);
        expect(mockRes.json).toHaveBeenCalledWith(mockResData);
    });

    test('should return 500 if an error occurs', async () => {
        const req = { body: { type: 'testType', color: 'testColor' } };
        const res = {
          status: jest.fn().mockReturnThis(),
          json: jest.fn(),
        };
        const errorMessage = 'Error';

        verifyAuth.mockReturnValue({ flag: true, cause: 'Authorized' })
    
        jest.spyOn(console, 'error').mockImplementation(() => {});
    
        jest.spyOn(categories, 'findOne').mockRejectedValueOnce(new Error(errorMessage));
    
        await createCategory(req, res);
    
        expect(res.status).toHaveBeenCalledWith(500);
      });

})

describe("updateCategory", () => {
    afterEach(() => {
        jest.clearAllMocks();
    });
    
    test('should return 400 error if request body is incomplete', async () => {
        const req = {
            params: {type: 'currentTestType'},
            body: { type: 'newTestType' } 
        };
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };

        verifyAuth.mockReturnValue({ flag: true, cause: 'Authorized' })
    
        await updateCategory(req, res);
    
        expect(res.status).toBeCalledWith(400);
        expect(res.json).toBeCalledWith({ error: 'incomplete attributes' });
      });

    test('should return 400 error if request body contains empty strings', async () => {
        const req = {
            params: {type: 'currentTestType'},
            body: { type: '', color: 'newTestColor' } 
        };
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };

        verifyAuth.mockReturnValue({ flag: true, cause: 'Authorized' })
    
        await updateCategory(req, res);
    
        expect(res.status).toBeCalledWith(400);
        expect(res.json).toBeCalledWith({ error: 'empty string' });
    });

    test('should return 400 error if the type of category passed as a route parameter does not represent a category in the database', async () => {
        const req = {
            params: {type: 'nonExistingType'},
            body: { type: 'newTestType', color: 'newTestColor' } 
        };
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };

        verifyAuth.mockReturnValue({ flag: true, cause: 'Authorized' });
        
        jest.spyOn(categories, 'findOne').mockResolvedValue(null);

        await updateCategory(req, res);

        expect(res.status).toBeCalledWith(400);
        expect(res.json).toBeCalledWith({ error: 'category does not exist' });
    });

    test('should return 400 error if the type of category passed in the request body as the new type represents an already existing category in the database and that category is not the same as the requested one', async () => {
        const req = {
            params: {type: 'existingType'},
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

        verifyAuth.mockReturnValue({ flag: true, cause: 'Authorized' });
        
        jest.spyOn(categories, 'findOne')
        .mockResolvedValue(existingCategory)
        .mockResolvedValueOnce(alsoExistingCategory);

        await updateCategory(req, res);

        expect(res.status).toBeCalledWith(400);
        expect(res.json).toBeCalledWith({ error: 'new category exists' });
    });

    test('should return 401 error if called by an authenticated user who is not an admin', async () => {
        const req = {
            params: {type: 'currentTestType'},
            body: { type: 'testType', color: 'newTestColor' } 
        };
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };

        verifyAuth.mockReturnValue({ flag: false, cause: 'Not admin' });

        await updateCategory(req, res);

        expect(res.status).toBeCalledWith(401);
        expect(res.json).toBeCalledWith({ error: 'Not admin' });
    });

    test(
        "should update a category's both type and color",
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
            transactions.updateMany.mockResolvedValue({ modifiedCount: mockResData.data.count });

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

    test(
        "should update a category's color only",
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
            transactions.updateMany.mockResolvedValue({ modifiedCount: mockResData.data.count });

            await updateCategory(mockReq, mockRes);

            expect(verifyAuth).toHaveBeenCalledWith(mockReq, mockRes, { authType: 'Admin' });
            expect(categories.findOne).toHaveBeenCalledWith({ type: mockReq.params.type });
            expect(mockCurrentCategory.save).toHaveBeenCalled()
            expect(transactions.updateMany).toHaveBeenCalledWith({ type: mockReq.params.type }, { type: mockReq.body.type });
            expect(mockRes.status).toHaveBeenCalledWith(mockResStatus);
            expect(mockRes.json).toHaveBeenCalledWith(mockResData);
        }
    );    

    test('should return 500 if an error occurs', async () => {
        const req = { body: { type: 'testType', color: 'testColor' } };
        const res = {
          status: jest.fn().mockReturnThis(),
          json: jest.fn(),
        };
        const errorMessage = 'Error';

        verifyAuth.mockReturnValue({ flag: true, cause: 'Authorized' })
    
        jest.spyOn(console, 'error').mockImplementation(() => {});
    
        jest.spyOn(categories, 'findOne').mockRejectedValueOnce(new Error(errorMessage));
    
        await updateCategory(req, res);
    
        expect(res.status).toHaveBeenCalledWith(500);
      });
})

describe("deleteCategory", () => {
    afterEach(() => {
        jest.clearAllMocks();
    });
    
    test('should return 400 error if request body is incomplete', async () => {
        const req = {
            params: {},
            body: {} 
        };
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };

        verifyAuth.mockReturnValue({ flag: true, cause: 'Authorized' })
    
        await deleteCategory(req, res);
    
        expect(res.status).toBeCalledWith(400);
        expect(res.json).toBeCalledWith({ error: 'incomplete attributes' });
      });

      test('should return 400 error if called when there is only one category in the database', async () => {
        const req = {
            params: {},
            body: { types: ['A']} 
        };
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };

        const mockCategories = [
            { _id: 0, type: "A", color: "A" },
        ];

        verifyAuth.mockReturnValue({ flag: true, cause: 'Authorized' });
        categories.find.mockResolvedValue(mockCategories);
    
        await deleteCategory(req, res);
    
        expect(res.status).toBeCalledWith(400);
        expect(res.json).toBeCalledWith({ error: 'only zero or one category exists' });
    });

    test('should return 400 error if at least one of the types in the array is an empty string', async () => {
        const req = {
            params: {},
            body: { types: ['C', 'B', '', 'D', 'E']} 
        };
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };

        verifyAuth.mockReturnValue({ flag: true, cause: 'Authorized' })
    
        await deleteCategory(req, res);
    
        expect(res.status).toBeCalledWith(400);
        expect(res.json).toBeCalledWith({ error: 'at least one: empty string' });
    });

    test('should return 400 error if the array passed in the request body is empty', async () => {
        const req = {
            params: {},
            body: { types: []} 
        };
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };

        verifyAuth.mockReturnValue({ flag: true, cause: 'Authorized' })
    
        await deleteCategory(req, res);
    
        expect(res.status).toBeCalledWith(400);
        expect(res.json).toBeCalledWith({ error: 'empty array' });
    });

    test('should return 400 error if at least one of the types in the array does not represent a category in the database', async () => {
        const req = {
            params: {},
            body: { types: ['C', 'B', 'F']} 
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
    
        verifyAuth.mockReturnValue({ flag: true, cause: 'Authorized' });
        categories.find.mockResolvedValue(mockCategories);

        await deleteCategory(req, res);
    
        expect(res.status).toBeCalledWith(400);
        expect(res.json).toBeCalledWith({ error: 'at least one type does not exist' });
    });

    test('should return 401 error if called by an authenticated user who is not an admin', async () => {
        const req = {
            params: {},
            body: { types: ['C', 'B', 'E']} 
        };
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };

        verifyAuth.mockReturnValue({ flag: false, cause: 'Not admin' });

        await deleteCategory(req, res);

        expect(res.status).toBeCalledWith(401);
        expect(res.json).toBeCalledWith({ error: 'Not admin' });
    });

    test('should delete all categories except oldest and set transactions to oldest', async () => {
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

        verifyAuth.mockReturnValue({ flag: true, cause: 'Authorized' });
        categories.find.mockResolvedValue(mockCategories);
        categories.deleteMany.mockResolvedValue();
        transactions.updateMany.mockResolvedValue({ modifiedCount: mockModifiedCount });

        await deleteCategory(mockReq, mockRes);

        expect(verifyAuth).toHaveBeenCalledWith(mockReq, mockRes, { authType: 'Admin' });
        expect(categories.deleteMany).toHaveBeenCalledWith({ type: { $in: mockTypesToDelete } });
        expect(transactions.updateMany).toHaveBeenCalledWith({ type: { $in: mockTypesToDelete } }, { type: mockCategories[0].type });
        expect(mockRes.status).toHaveBeenCalledWith(mockResStatus);
        expect(mockRes.json).toHaveBeenCalledWith(mockResData);

    });

    test('should delete all categories and set transactions to oldest', async () => {
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

        verifyAuth.mockReturnValue({ flag: true, cause: 'Authorized' });
        categories.find.mockResolvedValue(mockCategories);
        categories.deleteMany.mockResolvedValue();
        transactions.updateMany.mockResolvedValue({ modifiedCount: mockModifiedCount });

        await deleteCategory(mockReq, mockRes);

        expect(verifyAuth).toHaveBeenCalledWith(mockReq, mockRes, { authType: 'Admin' });
        expect(categories.deleteMany).toHaveBeenCalledWith({ type: { $in: mockTypesToDelete } });
        expect(transactions.updateMany).toHaveBeenCalledWith({ type: { $in: mockTypesToDelete } }, { type: "E" });
        expect(mockRes.status).toHaveBeenCalledWith(mockResStatus);
        expect(mockRes.json).toHaveBeenCalledWith(mockResData);

    });

    test('should return 500 if an error occurs', async () => {
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

        verifyAuth.mockReturnValue({ flag: true, cause: 'Authorized' })
    
        jest.spyOn(console, 'error').mockImplementation(() => {});
    
        jest.spyOn(categories, 'find').mockRejectedValue(new Error(errorMessage));
    
        await deleteCategory(req, res);
    
        expect(res.status).toHaveBeenCalledWith(500);
      });
})

describe("getCategories", () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    test('should retreive all categories', async () => {
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

        verifyAuth.mockReturnValue({ flag: true, cause: 'Authorized' });
        categories.find.mockResolvedValue(mockCategories);

        await getCategories(mockReq, mockRes);

        expect(verifyAuth).toHaveBeenCalledWith(mockReq, mockRes, { authType: 'Simple' });
        expect(mockRes.status).toHaveBeenCalledWith(mockResStatus);
        expect(mockRes.json).toHaveBeenCalledWith(mockResData);

    });

    test('should return 401 error if called by an authenticated user who is not an admin', async () => {
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

        verifyAuth.mockReturnValue({ flag: false, cause: 'Unauthorized' });

        await getCategories(req, res);

        expect(res.status).toBeCalledWith(401);
        expect(res.json).toBeCalledWith({ error: 'Unauthorized' });
    });

    test('should return 500 if an error occurs', async () => {
        const req = { body: { type: 'testType', color: 'testColor' } };
        const res = {
          status: jest.fn().mockReturnThis(),
          json: jest.fn(),
        };
        const errorMessage = 'Error';

        verifyAuth.mockReturnValue({ flag: true, cause: 'Authorized' })
    
        jest.spyOn(console, 'error').mockImplementation(() => {});
    
        jest.spyOn(categories, 'find').mockRejectedValue(new Error(errorMessage));
    
        await getCategories(req, res);
    
        expect(res.status).toHaveBeenCalledWith(500);
      });
})

describe("createTransaction", () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    test('should return 400 error if request body is incomplete', async () => {
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

        verifyAuth.mockReturnValue({ flag: true, cause: 'Authorized' })

        await createTransaction(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toBeCalledWith({ error: 'incomplete attributes' });
      });

      test('should return 400 error if request body contains empty strings', async () => {
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
        
        verifyAuth.mockReturnValue({ flag: true, cause: 'Authorized' })
    
        await createTransaction(req, res);
    
        expect(res.status).toBeCalledWith(400);
        expect(res.json).toBeCalledWith({ error: 'empty string' });
    });

    test('should return 400 error if the type of category passed in the request body does not represent a category in the database', async () => {
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

        verifyAuth.mockReturnValue({ flag: true, cause: 'Authorized' })
          
        jest.spyOn(User, 'findOne').mockResolvedValueOnce(mockUser);
        jest.spyOn(User, 'findOne').mockResolvedValueOnce(mockUser);
        jest.spyOn(categories, 'findOne').mockResolvedValueOnce(null);
      
        await createTransaction(req, res);

        expect(res.status).toBeCalledWith(400);
        expect(res.json).toBeCalledWith({ error: 'category does not exist' });
    });

    test('should return 400 error if the username passed in the request body is not equal to the one passed as a route parameter', async () => {
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

        verifyAuth.mockReturnValue({ flag: true, cause: 'Authorized' })
        
        jest.spyOn(User, 'findOne').mockResolvedValueOnce(mockUser);
        jest.spyOn(User, 'findOne').mockResolvedValueOnce(mockUser2);
        jest.spyOn(categories, 'findOne').mockResolvedValueOnce(mockCategory);
      
        await createTransaction(req, res);

        expect(res.status).toBeCalledWith(400);
        expect(res.json).toBeCalledWith({ error: "cannot add other user's transaction" });
    });

    test('should return 400 error if the username passed in the request body does not represent a user in the database', async () => {
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

        verifyAuth.mockReturnValue({ flag: true, cause: 'Authorized' })
          
        jest.spyOn(User, 'findOne').mockResolvedValueOnce(null);
      
        await createTransaction(req, res);

        expect(res.status).toBeCalledWith(400);
        expect(res.json).toBeCalledWith({ error: 'user does not exist' });
    });

    test('should return 400 error if the username passed as a route parameter does not represent a user in the database', async () => {
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

        verifyAuth.mockReturnValue({ flag: true, cause: 'Authorized' })
        
        jest.spyOn(User, 'findOne').mockResolvedValueOnce(mockUser);
        jest.spyOn(User, 'findOne').mockResolvedValueOnce(null);
      
        await createTransaction(req, res);

        expect(res.status).toBeCalledWith(400);
        expect(res.json).toBeCalledWith({ error: 'user passed as a route parameter does not exist' });
    });

    test('should return 400 error if the amount passed in the request body cannot be parsed as a floating value (negative numbers are accepted)', async () => {
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

        verifyAuth.mockReturnValue({ flag: true, cause: 'Authorized' })

        await createTransaction(req, res);

        expect(res.status).toBeCalledWith(400);
        expect(res.json).toBeCalledWith({ error: 'cannot parse as floating value' });
    });

    test('should return 401 error if user is not authenticated', async () => {
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
      
        verifyAuth.mockReturnValue({ flag: false, cause: 'Unauthorized' });

        await createTransaction(req, res);

        expect(res.status).toBeCalledWith(401);
        expect(res.json).toBeCalledWith({ error: 'Unauthorized' });
    });

    test('should create transaction', async () => {
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

        verifyAuth.mockReturnValue({ flag: true, cause: 'Authorized' });
        User.findOne.mockResolvedValue(true);
        categories.findOne.mockResolvedValue(true);
        transactions.prototype.save.mockResolvedValue(mockTransaction);

        await createTransaction(mockReq, mockRes);

        expect(verifyAuth).toHaveBeenCalledWith(mockReq, mockRes, { authType: 'User', username: mockReq.params.username });
        expect(mockRes.status).toHaveBeenCalledWith(mockResStatus);
        expect(mockRes.json).toHaveBeenCalledWith(mockResData);
    });

    test('should return 500 if an error occurs', async () => {
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
    
        jest.spyOn(console, 'error').mockImplementation(() => {});
    
        jest.spyOn(User, 'findOne').mockRejectedValueOnce(new Error(errorMessage));
    
        await createTransaction(req, res);
    
        expect(res.status).toHaveBeenCalledWith(500);
      });
})

describe("getAllTransactions", () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    test('should return 401 error if called by an authenticated user who is not an admin', async () => {
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

        verifyAuth.mockReturnValue({ flag: false, cause: 'Not admin' });

        await getAllTransactions(req, res);

        expect(res.status).toBeCalledWith(401);
        expect(res.json).toBeCalledWith({ error: 'Not admin' });
    });

    test('should retreive all transactions', async () => {
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

        verifyAuth.mockReturnValue({ flag: true, cause: 'Authorized' });
        transactions.aggregate.mockResolvedValue(mockTransactionAggregate);

        await getAllTransactions(mockReq, mockRes);

        expect(verifyAuth).toHaveBeenCalledWith(mockReq, mockRes, { authType: "Admin" });
        expect(transactions.aggregate).toHaveBeenCalledWith(mockTransactionAggregateFilter);
        expect(mockRes.status).toHaveBeenCalledWith(mockResStatus);
        expect(mockRes.json).toHaveBeenCalledWith(mockResData);
    });
    
    test('should return 500 if an error occurs', async () => {
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

        verifyAuth.mockReturnValue({ flag: true, cause: 'Authorized' });
    
        jest.spyOn(console, 'error').mockImplementation(() => {});
    
        jest.spyOn(transactions, 'aggregate').mockRejectedValueOnce(new Error(errorMessage));
    
        await getAllTransactions(req, res);
    
        expect(res.status).toHaveBeenCalledWith(500);
      });
})

describe("getTransactionsByUser", () => {
    afterEach(() => {
        jest.clearAllMocks();
    });
    
    test('should return 400 error if the user does not exist', async () => {
        const mockReq = {
            url: '/api/transactions/users/nonExistentUser',
            body: {}
        };
        const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            locals: {}
        };
      
        verifyAuth.mockReturnValue({ flag: true, cause: 'Authorized' });
        User.findOne.mockResolvedValue(false);
      
        await getTransactionsByUser(mockReq, mockRes);
      
        expect(verifyAuth).toHaveBeenCalledWith(mockReq, mockRes, { authType: 'Admin' } );
        expect(User.findOne).toHaveBeenCalledWith({ username: 'nonExistentUser' });
        expect(mockRes.status).toHaveBeenCalledWith(400);
        expect(mockRes.json).toHaveBeenCalledWith({ error: 'user does not exist' });
    });

    test('should return 401 error if called by an authenticated user who is not the same user (user route)', async () => {
        const mockReq = {
            url: '/api/users/user1/transactions',
            body: {}
        };
        const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            locals: {}
        };

        verifyAuth.mockReturnValue({ flag: false, cause: "cannot access other user's data" });

        await getTransactionsByUser(mockReq, mockRes);

        expect(verifyAuth).toHaveBeenCalledWith(mockReq, mockRes, { authType: 'User', username: 'user1' });
        expect(mockRes.status).toHaveBeenCalledWith(401);
        expect(mockRes.json).toHaveBeenCalledWith({ error:  "cannot access other user's data" });
    });

    test('should return 401 error if called by an authenticated user who is not an admin (admin route)', async () => {
        const mockReq = {
            url: '/api/transactions/users/user1',
            body: {}
        };
        const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            locals: {}
        };
        
        verifyAuth.mockReturnValue({ flag: false, cause: 'Not admin' });
    
        await getTransactionsByUser(mockReq, mockRes);
    
        expect(mockRes.status).toHaveBeenCalledWith(401);
        expect(mockRes.json).toHaveBeenCalledWith({ error: 'Not admin' });
      });

      test('should throw a "unknown route" error if the path is wrong', async () => {
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

    test('should return all users transactions (user route with date)', async () => {
        const mockDate = "2023-04-01";
        const mockUsername = "user1"
        const mockReq = {
            url: "/api/users/" + mockUsername + "/transactions?date=" + mockDate,
            query: {
                date: mockDate
            }
            ,
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
        verifyAuth.mockReturnValue({ flag: true, cause: 'Authorized' });
        handleDateFilterParams.mockImplementation(() => mockDateFilter);
        handleAmountFilterParams.mockImplementation(() => mockAmountFilter);
        User.findOne.mockResolvedValue(true);
        transactions.aggregate.mockResolvedValue(mockTransactionAggregate);

        await getTransactionsByUser(mockReq, mockRes);

        expect(verifyAuth).toHaveBeenCalledWith(mockReq, mockRes, { authType: "User", username: "user1" });
        expect(handleDateFilterParams).toHaveBeenCalledWith(mockReq);
        expect(handleAmountFilterParams).toHaveBeenCalledWith(mockReq);
        expect(User.findOne).toHaveBeenCalledWith({ username: mockUsername });
        expect(transactions.aggregate).toHaveBeenCalledWith(mockTransactionAggregateFilter);
        expect(mockRes.status).toHaveBeenCalledWith(mockResStatus);
        expect(mockRes.json).toHaveBeenCalledWith(mockResData);
    });

    test('should return 500 if an error occurs', async () => {
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
        
        jest.spyOn(console, 'error').mockImplementation(() => {});
        
        verifyAuth.mockReturnValue({ flag: true, cause: 'Authorized' });

        jest.spyOn(User, 'findOne').mockRejectedValueOnce(new Error(errorMessage));
    
        await getTransactionsByUser(req, res);
    
        expect(res.status).toHaveBeenCalledWith(500);
    });
})

describe("getTransactionsByUserByCategory", () => {
    test('should show all user transactions of  given category (user route)', async () => {
        const mockUsername = "user1";
        const mockCategoryType = "type1";
        const mockReq = {
            url: "/api/users/" + mockUsername + "/transactions/category/" + mockCategoryType,
            query: {
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
        verifyAuth.mockReturnValue({ flag: true, cause: 'Authorized' });
        User.findOne.mockResolvedValue(true);
        categories.findOne.mockResolvedValue(true);
        transactions.aggregate.mockResolvedValue(mockTransactionAggregate);

        await getTransactionsByUserByCategory(mockReq, mockRes);

        expect(verifyAuth).toHaveBeenCalledWith(mockReq, mockRes, { authType: "User", username: mockUsername });
        expect(User.findOne).toHaveBeenCalledWith({ username: mockUsername });
        expect(categories.findOne).toHaveBeenCalledWith({ type: mockCategoryType });
        expect(transactions.aggregate).toHaveBeenCalledWith(mockTransactionAggregateFilter);
        expect(mockRes.status).toHaveBeenCalledWith(mockResStatus);
        expect(mockRes.json).toHaveBeenCalledWith(mockResData);
    });

    
    test('should return 400 error if the username does not represent a user in the database', async () => {
        const mockUsername = "nonexistentUser";
        const mockCategoryType = "type1";
        const mockReq = {
            url: "/api/users/" + mockUsername + "/transactions/category/" + mockCategoryType,
        };
        const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        verifyAuth.mockReturnValue({ flag: true, cause: 'Authorized' });
        User.findOne.mockResolvedValue(false);

        await getTransactionsByUserByCategory(mockReq, mockRes);

        expect(mockRes.status).toHaveBeenCalledWith(400);
        expect(mockRes.json).toHaveBeenCalledWith({ error: "user does not exist" });
    });

    test('should return 400 error if the category does not represent a category in the database', async () => {
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

        verifyAuth.mockReturnValue({ flag: true, cause: 'Authorized' });
        User.findOne.mockResolvedValue(true);
        categories.findOne.mockResolvedValue(false);

        await getTransactionsByUserByCategory(mockReq, mockRes);

        expect(mockRes.status).toHaveBeenCalledWith(400);
        expect(mockRes.json).toHaveBeenCalledWith({ error: "category does not exist" });
    });

    test('should return 401 error if called by an authenticated user who is not the same user (user route)', async () => {
        const mockReq = {
            url: '/api/users/user1/transactions/category/food',
            body: {}
        };
        const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            locals: {}
        };

        verifyAuth.mockReturnValue({ flag: false, cause: "cannot access other user's data" });

        await getTransactionsByUserByCategory(mockReq, mockRes);

        expect(verifyAuth).toHaveBeenCalledWith(mockReq, mockRes, { authType: 'User', username: 'user1' });
        expect(mockRes.status).toHaveBeenCalledWith(401);
        expect(mockRes.json).toHaveBeenCalledWith({ error:  "cannot access other user's data" });
    });

    test('should return 401 error if called by an authenticated user who is not an admin (authType = Admin)', async () => {
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

        verifyAuth.mockReturnValue({ flag: false, cause: 'Not admin' });    

        await getTransactionsByUserByCategory(mockReq, mockRes);

        expect(verifyAuth).toHaveBeenCalledWith(mockReq, mockRes, { authType: "Admin" });
        expect(mockRes.status).toHaveBeenCalledWith(401);
        expect(mockRes.json).toHaveBeenCalledWith({ error: "Not admin" });
    });

    test('should throw a "unknown route" error if the path is wrong', async () => {
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

        
        await getTransactionsByUserByCategory(mockReq, mockRes);

        expect(mockRes.status).toHaveBeenCalledWith(500);
        expect(mockRes.json).toHaveBeenCalledWith({ error: 'unknown route' });

    });

    test('should return 500 if an error occurs', async () => {
        const req = {
            url: '/api/users/user1/transactions/category/food',
            body: {}
        };
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            locals: {}
        };
        const errorMessage = 'Error';
        
        jest.spyOn(console, 'error').mockImplementation(() => {});
        
        verifyAuth.mockReturnValue({ flag: true, cause: 'Authorized' });

        jest.spyOn(User, 'findOne').mockRejectedValueOnce(new Error(errorMessage));
    
        await getTransactionsByUserByCategory(req, res);
    
        expect(res.status).toHaveBeenCalledWith(500);
    });
})

describe("getTransactionsByGroup", () => {
    test('should return 400 error if the group name passed as a route parameter does not represent a group in the database', async () => {
        const mockGroupName = "nonGroup";
        const mockReq = {
            url: "/api/groups/" + mockGroupName + "/transactions",
            query: {
            }
            ,
            body: {
            }
        }
        const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            locals: {
            }
        }

        Group.findOne.mockResolvedValue(null);

        await getTransactionsByGroup(mockReq, mockRes);

        expect(mockRes.status).toHaveBeenCalledWith(400);
        expect(mockRes.json).toHaveBeenCalledWith( { error: 'group does not exist' });
    });

    test('should return 401 error if called by an authenticated user who is not part of the group (authType = Group) if the route is /api/groups/:name/transactions', async () => {
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
            body: {
            }
        }
        const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            locals: {
            }
        }

        Group.findOne.mockResolvedValue(mockGroup);
        categories.findOne.mockResolvedValue(true);
        verifyAuth.mockReturnValueOnce({ flag: false, cause: 'user not in group' }); 

        await getTransactionsByGroup(mockReq, mockRes);

        expect(mockRes.status).toHaveBeenCalledWith(401);
        expect(mockRes.json).toHaveBeenCalledWith({ error:  "user not in group" });

    });

    test('should return 401 error if called by an authenticated user who is not an admin (authType = Admin) if the route is /api/transactions/groups/:name', async () => {
        const mockReq = {
            url: "/api/transactions/groups/Family",
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

        Group.findOne.mockResolvedValue(true);
        verifyAuth.mockReturnValue({ flag: false, cause: 'Not admin' }); 

        await getTransactionsByGroup(mockReq, mockRes);

        expect(verifyAuth).toHaveBeenCalledWith(mockReq, mockRes, { authType: 'Admin' });
        expect(mockRes.status).toHaveBeenCalledWith(401);
        expect(mockRes.json).toHaveBeenCalledWith({ error:  "Not admin" });

    });

    test('should throw a "unknown route" error if the path is wrong', async () => {
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

        await getTransactionsByGroup(mockReq, mockRes);

        expect(mockRes.status).toHaveBeenCalledWith(500);
        expect(mockRes.json).toHaveBeenCalledWith({ error: 'unknown route' });
    });

    
    test('should show all transactions of member of a group (user route)', async () => {
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
            populate: jest.fn().mockResolvedValue(mockPopulatedGroup)
        }
        const mockReq = {
            url: "/api/groups/" + mockGroupName + "/transactions",
            query: {
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

        Group.findOne.mockResolvedValue(mockGroup);
        verifyAuth.mockReturnValue({ flag: true, cause: 'Authorized' });
        transactions.aggregate.mockResolvedValue(mockTransactionAggregate);

        await getTransactionsByGroup(mockReq, mockRes);

        expect(Group.findOne).toHaveBeenCalledWith({ name: mockGroupName });
        expect(mockGroup.populate).toHaveBeenCalled();
        expect(verifyAuth).toHaveBeenCalledWith(mockReq, mockRes, { authType: "Group", emails: ["user1@ezwallet.com", "user2@ezwallet.com", "user3@ezwallet.com", "user4@ezwallet.com", "user5@ezwallet.com"] });
        expect(transactions.aggregate).toHaveBeenCalledWith(mockTransactionAggregateFilter);
        expect(mockRes.status).toHaveBeenCalledWith(mockResStatus);
        expect(mockRes.json).toHaveBeenCalledWith(mockResData);
    });
})

describe("getTransactionsByGroupByCategory", () => {
    test('should return 400 error if the group name passed as a route parameter does not represent a group in the database', async () => {
        const mockGroupName = "nonGroup";
        const mockReq = {
            url: "/api/groups/" + mockGroupName + "/transactions",
            query: {
            }
            ,
            body: {
            }
        }
        const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            locals: {
            }
        }

        Group.findOne.mockResolvedValue(false);

        await getTransactionsByGroupByCategory(mockReq, mockRes);

        expect(mockRes.status).toHaveBeenCalledWith(400);
        expect(mockRes.json).toHaveBeenCalledWith( { error: 'group does not exist' });
    });

    test('should return 400 error if the category passed as a route parameter does not represent a category in the database', async () => {
        const mockGroupName = "group1";
        const mockCategory = "type1";
        const mockReq = {
            url: "/api/groups/" + mockGroupName + "/transactions/category/" + mockCategory,
            query: {
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

        Group.findOne.mockResolvedValue(mockGroupName);
        categories.findOne.mockResolvedValue(false);

        await getTransactionsByGroupByCategory(mockReq, mockRes);

        expect(mockRes.status).toHaveBeenCalledWith(400);
        expect(mockRes.json).toHaveBeenCalledWith( { error: 'category does not exist' });
    });

    test('should return 401 error if called by an authenticated user who is not part of the group (authType = Group) if the route is /api/groups/:name/transactions', async () => {
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
            body: {
            }
        }
        const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            locals: {
            }
        }

        Group.findOne.mockResolvedValue(mockGroup);
        categories.findOne.mockResolvedValue(true);
        verifyAuth.mockReturnValueOnce({ flag: false, cause: 'user not in group' }); 

        await getTransactionsByGroupByCategory(mockReq, mockRes);

        expect(mockRes.status).toHaveBeenCalledWith(401);
        expect(mockRes.json).toHaveBeenCalledWith({ error:  "user not in group" });
    });

    test('should return 401 error if called by an authenticated user who is not an admin (authType = Admin) if the route is /api/transactions/groups/:name', async () => {
        const mockReq = {
            url: "/api/transactions/groups/group1/category/type1",
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

        Group.findOne.mockResolvedValue(true);
        categories.findOne.mockResolvedValue(true);
        verifyAuth.mockReturnValue({ flag: false, cause: 'Not admin' }); 

        await getTransactionsByGroupByCategory(mockReq, mockRes);

        expect(verifyAuth).toHaveBeenCalledWith(mockReq, mockRes, { authType: 'Admin' });
        expect(mockRes.status).toHaveBeenCalledWith(401);
        expect(mockRes.json).toHaveBeenCalledWith({ error:  "Not admin" });

    });



    test('should throw a "unknown route" error if the path is wrong', async () => {
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

        await getTransactionsByGroupByCategory(mockReq, mockRes);

        expect(mockRes.status).toHaveBeenCalledWith(500);
        expect(mockRes.json).toHaveBeenCalledWith({ error: 'unknown route' });

    });

    test('should show all transactions of member of a group (user route)', async () => {
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
            populate: jest.fn().mockResolvedValue(mockPopulatedGroup)
        }
        const mockReq = {
            url: "/api/groups/" + mockGroupName + "/transactions/category/" + mockCategory,
            query: {
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

        Group.findOne.mockResolvedValue(mockGroup);
        verifyAuth.mockReturnValue({ flag: true, cause: 'Authorized' });
        categories.findOne.mockResolvedValue(true);
        transactions.aggregate.mockResolvedValue(mockTransactionAggregate);

        await getTransactionsByGroupByCategory(mockReq, mockRes);

        expect(Group.findOne).toHaveBeenCalledWith({ name: mockGroupName });
        expect(mockGroup.populate).toHaveBeenCalled();
        expect(verifyAuth).toHaveBeenCalledWith(mockReq, mockRes, { authType: "Group", emails: ["user1@ezwallet.com", "user2@ezwallet.com", "user3@ezwallet.com", "user4@ezwallet.com", "user5@ezwallet.com"] });
        expect(categories.findOne).toHaveBeenCalledWith({type : mockCategory});
        expect(transactions.aggregate).toHaveBeenCalledWith(mockTransactionAggregateFilter);
        expect(mockRes.status).toHaveBeenCalledWith(mockResStatus);
        expect(mockRes.json).toHaveBeenCalledWith(mockResData);
    });
})

describe("deleteTransaction", () => {
    test('should return 400 error if the request body does not contain all the necessary attributes', async () => {
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

        verifyAuth.mockReturnValue({ flag: true, cause: 'Authorized' });

        await deleteTransaction(req, res);

        expect(res.status).toBeCalledWith(400);
        expect(res.json).toBeCalledWith({ error: 'incomplete attributes' });
    });

    test('should return 400 error if the _id in the request body is an empty string', async () => {
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

        verifyAuth.mockReturnValue({ flag: true, cause: 'Authorized' });

        await deleteTransaction(req, res);
    
        expect(res.status).toBeCalledWith(400);
        expect(res.json).toBeCalledWith({ error: 'empty string' });
    });

    test('should return 400 error if the username passed as a route parameter does not represent a user in the database', async () => {
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

        verifyAuth.mockReturnValue({ flag: true, cause: 'Authorized' });
        
        jest.spyOn(User, 'findOne').mockResolvedValueOnce(null);
        
        await deleteTransaction(req, res);
        
        expect(res.status).toBeCalledWith(400);
        expect(res.json).toBeCalledWith({ error: 'user does not exist' });
    });

    test('should return 400 error if the _id in the request body does not represent a transaction in the database', async () => {
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
        
        verifyAuth.mockReturnValue({ flag: true, cause: 'Authorized' });

        jest.spyOn(User, 'findOne').mockResolvedValueOnce(true);
        jest.spyOn(transactions, 'findOne').mockResolvedValue(false);
        
        await deleteTransaction(req, res);
        
        expect(res.status).toBeCalledWith(400);
        expect(res.json).toBeCalledWith({ error: 'transaction does not exist' });
    });

    test('should return 400 error if the _id in the request body represents a transaction made by a different user than the one in the route', async () => {
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

        verifyAuth.mockReturnValue({ flag: true, cause: 'Authorized' });
        
        jest.spyOn(User, 'findOne').mockResolvedValueOnce(true);
        jest.spyOn(transactions, 'findOne').mockResolvedValue(mockTransaction);
        
        await deleteTransaction(req, res);
        
        expect(res.status).toBeCalledWith(400);
        expect(res.json).toBeCalledWith({ error: 'transaction made by different user' });
    });

    test('should return 401 error if user is not authenticated', async () => {
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


        verifyAuth.mockReturnValue({ flag: false, cause: 'Unauthorized' });
        
        jest.spyOn(User, 'findOne').mockResolvedValueOnce(true);
        jest.spyOn(transactions, 'findOne').mockResolvedValue(mockTransaction);
        
        
        await deleteTransaction(req, res);

        expect(res.status).toBeCalledWith(401);
        expect(res.json).toBeCalledWith({ error: 'Unauthorized' });
    });

    test('should delete a transaction', async () => {
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
        verifyAuth.mockReturnValue({ flag: true, cause: "authorized" });
        
        User.findOne.mockResolvedValue(true);
        transactions.findOne.mockResolvedValue(mockTransaction);
        transactions.deleteOne.mockResolvedValue(true);

        await deleteTransaction(mockReq, mockRes);

        expect(verifyAuth).toHaveBeenCalledWith(mockReq, mockRes, { authType: "User", username: mockUsername });
        expect(User.findOne).toHaveBeenCalledWith({ username: mockUsername });
        expect(transactions.findOne).toHaveBeenCalledWith({ _id: mockTransaction_id });
        expect(transactions.deleteOne).toHaveBeenCalledWith({ _id: mockTransaction_id });
        expect(mockRes.status).toHaveBeenCalledWith(mockResStatus);
        expect(mockRes.json).toHaveBeenCalledWith(mockResData);
    });

    test('should return 500 if an error occurs', async () => {
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

        verifyAuth.mockReturnValue({ flag: true, cause: "authorized" });
        User.findOne.mockResolvedValue(true);
        transactions.findOne.mockResolvedValue(mockTransaction);
    
        jest.spyOn(console, 'error').mockImplementation(() => {});    
        jest.spyOn(transactions, 'deleteOne').mockRejectedValueOnce(new Error(errorMessage));
    
        await deleteTransaction(req, res);
    
        expect(res.status).toHaveBeenCalledWith(500);
      });
})

describe("deleteTransactions", () => {
    test('should return 400 error if the request body does not contain all the necessary attributes', async () => {
        const req = {
            body: {

            }
        }
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        }

        verifyAuth.mockReturnValue({ flag: true, cause: 'Authorized' });

        await deleteTransactions(req, res);

        expect(res.status).toBeCalledWith(400);
        expect(res.json).toBeCalledWith({ error: 'incomplete attributes' });
    });

    test('should return 400 error if at least one of the ids in the array is an empty string', async () => {
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

        verifyAuth.mockReturnValue({ flag: true, cause: 'Authorized' });

        await deleteTransactions(req, res);

        expect(res.status).toBeCalledWith(400);
        expect(res.json).toBeCalledWith({ error: 'at least one: empty string' });
    });

    test('should return 400 error if at least one of the ids in the array does not represent a transaction in the database', async () => {
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

        verifyAuth.mockReturnValue({ flag: true, cause: "authorized" });
        transactions.countDocuments.mockResolvedValue(false);

        await deleteTransactions(req, res);

        expect(res.status).toBeCalledWith(400);
        expect(res.json).toBeCalledWith({ error: 'at least one transaction does not exist' });
    });

    test('should return 401 error if called by an authenticated user who is not an admin (authType = Admin)', async () => {
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

        verifyAuth.mockReturnValue({ flag: false, cause: "Not admin" });

        await deleteTransactions(req, res);

        expect(res.status).toBeCalledWith(401);
        expect(res.json).toBeCalledWith({ error: 'Not admin' });
    });

    test('should delete all transactions in an array', async () => {
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
        verifyAuth.mockReturnValue({ flag: true, cause: "authorized" });
        transactions.countDocuments.mockResolvedValue(true);
        transactions.deleteMany.mockResolvedValue(true);

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
