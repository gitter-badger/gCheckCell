define(["Parser/AST/AST", "FSharp/FSharp", "XClasses/XTypes" ], function (AST, FSharp, XTypes) {

    describe('Address test', function () {
        var address;
        beforeEach(function () {
            address = new AST.Address(2, 3, "sheetName", "workbookName");
        });
        it("charColToInt", function () {
            expect(AST.Address.charColToInt("A")).toEqual(1);
            expect(AST.Address.charColToInt("z")).toEqual(26);
            expect(AST.Address.charColToInt("Aa")).toEqual(27);
            expect(AST.Address.charColToInt("AB")).toEqual(28);
            expect(function () {
                AST.Address.charColToInt("A4");
            }).toThrow();
            expect(function () {
                AST.Address.charColToInt("");
            }).toThrow();
            expect(function () {
                AST.Address.charColToInt("%");
            }).toThrow();
        });
        it("IntToCharCol", function () {
            expect(AST.Address.intToColChars(1)).toEqual("A");
            expect(AST.Address.intToColChars(26)).toEqual("Z");
            expect(AST.Address.intToColChars(27)).toEqual("AA");
            expect(AST.Address.intToColChars(28)).toEqual("AB");
            expect(function () {
                AST.Address.intToColChars(-23);
            }).toThrow();
            expect(function () {
                AST.Address.intToColChars(0);
            }).toThrow();
            expect(function () {
                AST.Address.intToColChars();
            }).toThrow();
            expect(function () {
                AST.Address.intToColChars("as");
            }).toThrow();
        });

        it("AddressConstructor", function () {
            var a = new AST.Address(2, 3, "sheetName", "workbookName");
            expect(a.X).toEqual(3);
            expect(a.Y).toEqual(2);
            expect(a.WorksheetName).toEqual("sheetName");
            expect(a.WorkbookName).toEqual("workbookName");
            var b = new AST.Address(2, "C", "sheetName", "workbookName");
            expect(b.X).toEqual(3);
            expect(b.Y).toEqual(2);
            expect(b.WorksheetName).toEqual("sheetName");
            expect(b.WorkbookName).toEqual("workbookName");
        });

        it("getA1Local", function () {
            expect(address.getA1Local()).toEqual("C2");
        });

        it("getA1Worksheet", function () {
            var a = new AST.Address(2, 3, null, "book");
            expect(function () {
                a.getA1Worksheet();
            }).toThrow();
            expect(address.getA1Worksheet()).toEqual("sheetName");
        });
        it("getA1Workbook", function () {
            var a = new AST.Address(2, 3, "sheet", null);
            expect(function () {
                a.getA1Workbook();
            }).toThrow();
            expect(address.getA1Workbook()).toEqual("workbookName");
        });
        it("getA1FullyQualified", function () {
            expect(address.getA1FullyQualified()).toEqual("[workbookName]sheetName!C2");
        });
        it("getR1C1", function () {
            var a = new AST.Address(2, 3, "sheet", null);
            var b = new AST.Address(2, 3, null, "book");
            expect(address.getR1C1()).toEqual("[workbookName]sheetName!R2C3");
            expect(a.getR1C1()).toEqual("sheet!R2C3");
            expect(b.getR1C1()).toEqual("[book]R2C3");
        });
        it("getHashCode", function () {
            var a = new AST.Address(2, 3, "sheet", null);
            var b = new AST.Address(2, 3, null, "book");
            expect(address.getHashCode()).toEqual("workbookName_sheetName_3_2");
            expect(function () {
                a.getHashCode();
            }).toThrow();
            expect(function () {
                b.getHashCode();
            }).toThrow();
        });

        it("insideRange", function () {
            var rng = new AST.Range(new AST.Address(1, 1, "sheet", "book"), new AST.Address(5, 5, "sheet", "book"));
            var rng2 = new AST.Range(new AST.Address(4, 4, "sheet", "book"), new AST.Address(5, 5, "sheet", "book"));
            expect(address.insideRange(rng)).toEqual(true);
            expect(address.insideRange(rng2)).toEqual(false);
        });
        it("InsideAddress", function () {
            var a = new AST.Address(1, 1, "sheet", "book");
            var b = new AST.Address(2, 3, "sheet", "book");
            expect(address.insideAddr(a)).toEqual(false);
            expect(address.insideAddr(b)).toEqual(true);
        });
        it("toString", function () {
            expect(address.toString()).toEqual("(2,3)");
        });
        //TODO
        xit("getCOMObject", function () {

        });
        //TODO
        xit("compute", function () {

        });
    });

    //TODO
    xdescribe("ConstantArray", function () {
        it("Constructor", function () {
            var a = new AST.ConstantArray("sheet", [
                [new AST.ConstantNumber("sheet", 123)]
            ]);

        });
    });
    describe("ConstantError", function () {
        var err;
        beforeEach(function () {
            err = new AST.ConstantError("sheet", "#VALUE!");
        });
        it("toString", function () {
            expect(err.toString()).toEqual("Error(#VALUE!)");
        });
    });
    describe("ConstantLogical", function () {
        var log;
        beforeEach(function () {
            log = new AST.ConstantLogical("sheet", "TRUE");
        });
        it("toString", function () {
            expect(log.toString()).toEqual("Logical(true)");
        });
        it("compute", function () {
            var alog = new AST.ConstantLogical("sheet", "FALSE");
            expect(log.compute({}, {})).toEqual({value: true, type: XTypes.Boolean});
            expect(alog.compute({}, {})).toEqual({value: false, type: XTypes.Boolean});

        });
    });

    describe("ConstantNumber", function () {
        var number;
        beforeEach(function () {
            number = new AST.ConstantNumber(null, 233);
        });
        it("toString", function () {
            expect(number.toString()).toEqual("Constant(233)");
        });
        it("compute", function () {
            expect(number.compute({}, {})).toEqual({value: 233, type: XTypes.Number});
        })

    });

    describe("ConstantString", function () {
        var str;
        beforeEach(function () {
            str = new AST.ConstantString(null, "dsa");
        });
        it("toString", function () {
            expect(str.toString()).toEqual("String(dsa)");
        });
        it("compute", function () {
            expect(str.compute({}, {})).toEqual({value: "dsa", type: XTypes.String});
        })
    });
    describe("ParensExpr", function () {
        var parens;
        var parexpr;
        beforeEach(function () {
            var expr = jasmine.createSpyObj('expr', ['resolve', 'fixAssoc', 'compute']);
            parens = new AST.ParensExpr("test");
            parexpr = new AST.ParensExpr(expr);
        });
        it("toString", function () {
            expect(parens.toString()).toEqual("ParensExpr(test)")
        });
        it("resolve", function () {
            parexpr.resolve({Name: "book"}, {Name: "sheet"});
            expect(parexpr.Expr.resolve).toHaveBeenCalled();
        });
        it("fixAssoc", function () {
            parexpr.fixAssoc();
            expect(parexpr.Expr.fixAssoc).toHaveBeenCalled();
        });
        it("compute", function () {
            parexpr.compute();
            expect(parexpr.Expr.compute).toHaveBeenCalled();
        });
    });

    describe("PostfixOpExpr", function () {
        var postfix;
        var postfix2;
        beforeEach(function () {
            var expr = jasmine.createSpyObj('expr', ['resolve', 'fixAssoc', 'compute']);
            postfix = new AST.PostfixOpExpr("%", new AST.ConstantNumber(null, 123));
            postfix2 = new AST.PostfixOpExpr("%", expr);
        });
        it("toString", function () {
            expect(postfix.toString()).toEqual("PostfixOpExpr(\"%\",Constant(123))");
        });
        it("resolve", function () {
            postfix2.resolve({Name: "book"}, {Name: "sheet"});
            expect(postfix2.Expr.resolve).toHaveBeenCalled();
        });
        it("fixAssoc", function () {
            postfix2.fixAssoc();
            expect(postfix2.Expr.fixAssoc).toHaveBeenCalled();
        });
        it("compute", function () {
            expect(postfix.compute({}, {}, false, false, false)).toEqual({value: 1.23, type: XTypes.Number});
        });
    });

    describe("Range", function () {
        var range;
        beforeEach(function () {
            range = new AST.Range(new AST.Address(1, 1, "sheet", "book"), new AST.Address(5, 5, "sheet", "book"));
        });
        it("toString", function () {
            expect(range.toString()).toEqual((new AST.Address(1, 1, "sheet", "book")).toString() + "," + (new AST.Address(5, 5, "sheet", "book")).toString());
        });
        it("insideRange", function () {
            "use strict";
            var aux = new AST.Range(new AST.Address(2, 2, "sheet", "book"), new AST.Address(3, 3, "sheet", "book"));
            expect(range.insideRange(aux)).toEqual(false);
            expect(aux.insideRange(range)).toEqual(true);
        });
        //TODO
        xit("insideAddr", function () {

        });

    });

    describe("Reference", function () {
        it("resolve", function () {
            var wb = {};
            wb.Name = "WbName";
            var ws = {};
            ws.Name = "WsName";
            var ref = new AST.Reference(null, null);
            ref.resolve(wb, ws);
            expect(ref.WorksheetName).toEqual("WsName");
            expect(ref.WorkbookName).toEqual("WbName");
        });
    });

    describe("UnaryOpExpr", function () {
        var expr = new AST.UnaryOpExpr("+", new AST.ConstantNumber(null, 2));
        it("Constructor", function () {
            var a = new AST.UnaryOpExpr("+", new AST.ConstantNumber(null, 2));
            expect(a.Expr).toEqual(new AST.ConstantNumber(null, 2));
            expect(a.Operator).toEqual("+");
        });
        it("toString", function () {
            expect(expr.toString()).toEqual("UnaryOpExpr('+',Constant(2))");
        });
        it("compute", function () {
            var b = new AST.UnaryOpExpr("-", new AST.ConstantNumber(null, 2));
            expect(expr.compute({}, {})).toEqual({value: 2, type: XTypes.Number});
            expect(b.compute({}, {})).toEqual({value: -2, type: XTypes.Number});
        });
    });

    //TODO
    xdescribe("BinOpExpr", function () {

    });


});
