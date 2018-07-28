import CartParser from './CartParser';


let parser;

beforeEach(() => {
    parser = new CartParser();
});

describe("CartParser - unit tests", () => {
    // Add your unit tests here.
    describe("validate", () => {
        it("should throw an error about unexpected header name ", () => {
            let header = 'Product name,Price,Total',
                expected = {
                    type: parser.ErrorType.HEADER
                },
                result = parser.validate(header);

            expect(result).toEqual(
                expect.arrayContaining([
                    expect.objectContaining(expected)
                ])
            );
        });

        it("should throw an error about invalid quantity of cells in a row", () => {
            let content = `Product name,Price,Quantity
        Mollis\n consequat,9.00,2
        Tvoluptatem,10.32,1
        Scelerisque lacinia,18.90,1`;


            let expected = {
                    type: parser.ErrorType.ROW,
                    message: `Expected row to have 3 cells but received 1.`
                },
                result = parser.validate(content);

            expect(result).toEqual(
                expect.arrayContaining([
                    expect.objectContaining(expected)
                ])
            );

        });

        it("should throw an error about empty cell", () => {
            let content = `Product name,Price,Quantity\n
         ,9.00,2`,
                expected = {
                    type: parser.ErrorType.CELL,
                    message: 'Expected cell to be a nonempty string but received \"\".'
                },
                result = parser.validate(content);

            expect(result).toEqual(
                expect.arrayContaining([
                    expect.objectContaining(expected)
                ])
            );

        });

        it("should throw an error when cell is not a positive number", () => {
            let content = `Product name,Price,Quantity\n
         ASDsad,test,2`,
                expected = {
                    type: parser.ErrorType.CELL,
                    message: 'Expected cell to be a positive number but received "test".'
                },
                result = parser.validate(content);


            expect(result).toEqual(
                expect.arrayContaining([
                    expect.objectContaining(expected)
                ])
            );


        });

        it("should not call createError and return [] on valid data", () => {
            let content = `Product name,Price,Quantity\n
                       Mollis consequat,9.00,2,
                        Mollis consequat,9.00,2,
                        Mollis consequat,9.00,2`,
                expected = [],
                result = parser.validate(content);

            parser.createError = jest.fn();
            expect(result).toEqual(expected);
            expect(parser.createError).toHaveBeenCalledTimes(0);


        });
    });


    describe("parseLine", () => {


        it("should return JSON obj with id from CSV string", () => {
            let content = `Tvoluptatem,10.32,1`,
                expected = {
                    name: 'Tvoluptatem',
                    price: 10.32,
                    quantity: 1,
                    id: expect.anything()
                },
                result = parser.parseLine(content);


            expect(result).toEqual(
                expect.objectContaining(expected)
            );


        });

    });


    describe("calcTotal", () => {
        it("should return correct amount and type(number) - total price", () => {
            let line1 = `testes2,10.2,10`,
                line2 = `testes,12.2,2`,
                parsedLine1 = parser.parseLine(line1),
                parsedLine2 = parser.parseLine(line2),
                expected = 126.4,
                cartItems = [parsedLine1, parsedLine2],
                result = parser.calcTotal(cartItems);


            expect(result).toEqual(expected);


        })

    })


    describe("CartParser", () => {
        it("should contain valid schema ", () => {

            const expected = {
                columns:
                    [{name: 'Product name', key: 'name', type: 'string'},
                        {name: 'Price', key: 'price', type: 'numberPositive'},
                        {name: 'Quantity', key: 'quantity', type: 'numberPositive'}]
            };


            const isSchema = new CartParser().schema;
            expect(isSchema).toEqual(expected);


        })

    });


    describe("parser", () => {
        it('should throw error if validate() returns array with errors', () => {
            parser.validate = jest.fn(() => {
                return ['errors here']
            });


            expect(() => parser.parse('./samples/cart.csv')).toThrow('Validation failed!');


        })

    })
});

describe("CartParser - integration tests", () => {
    // Add your integration tests here.
    it('should parse file correctly', () => {
        const expected = {
            items: [
                {
                    id: expect.anything(),
                    name: 'Mollis consequat',
                    price: 9,
                    quantity: 2
                },
                {
                    id: expect.anything(),
                    name: 'Tvoluptatem',
                    price: 10.32,
                    quantity: 1
                },
                {
                    id: expect.anything(),
                    name: 'Scelerisque lacinia',
                    price: 18.90,
                    quantity: 1
                },
                {
                    id: expect.anything(),
                    name: 'Consectetur adipiscing',
                    price: 28.72,
                    quantity: 10
                },
                {
                    id: expect.anything(),
                    name: 'Condimentum aliquet',
                    price: 13.90,
                    quantity: 1
                }
            ],
            total: 348.32
        }

        const result = parser.parse('./samples/cart.csv');

        expect(result).toEqual(expected);
    })

});