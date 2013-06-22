/**
 * This file tries to test the PEG grammar rules derived from ExcelParser.Parser.fs
 * The only way I find to test the rules is to write create a parser from the rules in each test case
 * Everytime a new rule is added/modified the respective test should be modified. This is not ideal as I have two
 * instances of the same code.
 *
 */
TestCase("TestPEG",
    {

        setUp: function () {
            "use strict";
            this.grammar = 'Int32 = s:[+-]?number: ( oct:("0"[oO][0-7]+) { var res=[]; for(var i=0; i<oct.length; i++) if(oct[i] instanceof Array) res.push(oct[i].join("")); else res.push(oct[i]); var a = res.join(""); return parseInt(a.slice(0,1)+a.slice(2), 8);} / b:("0"[bB][01]+) { var res=[]; for(var i=0; i<b.length; i++) if(b[i] instanceof Array) res.push(b[i].join("")); else res.push(b[i]); var a = res.join(""); return parseInt(a.slice(0,1)+a.slice(2), 2);} / h:("0"[xX][0-9a-fA-F]+) { var res=[]; for(var i=0; i<h.length; i++) if(h[i] instanceof Array) res.push(h[i].join("")); else res.push(h[i]); var a = res.join(""); return parseInt(a, 16);} / d:[0-9]+ {return d.join("");}  ) {return parseInt(s+number);}; AsciiUpper = [A-Z]; character = [^\ufffe-\uffff] ; letter = [a-z] / [A-Z]; digit = [0-9]; AddrR = "R" r:Int32 { return r;}; AddrC = "C" r:Int32 {return r;}; AddrR1C1 = r:AddrR c:AddrC {return new AST.Address(r, c, null, null);}; AddrA = r: (AsciiUpper + ) {return r.join("");}; AddrAAbs = ("$" / "") r:AddrA {return r;}; Addr1 = r:Int32 {return r;}; Addr1Abs = ("$" / "") r:Addr1 {return r;}; AddrA1 = l:AddrAAbs r:Addr1Abs {return new AST.Address(r, l, null, null);}; AnyAddr = AddrR1C1 / AddrA1; MoreAddrR1C1 = ":" r:AddrR1C1 { return r;}; RangeR1C1 = r:AddrR1C1 l:MoreAddrR1C1 {return new AST.Range(r, l);}; MoreAddrA1 = ":" r:AddrA1 {return r;}; RangeA1 = r:AddrA1 l:MoreAddrA1 {return new AST.Range(r, l);}; RangeAny = RangeR1C1 / RangeA1; WorksheetNameQuoted = "\'" r:((! "\'" character )+) "\'" { var res=[]; for(var i=0; i<r.length; i++) res.push(r[i].join("")); return res.join("");}; WorksheetNameUnquoted = r:((digit / letter) + ) {return r.join("");}; WorksheetName = WorksheetNameQuoted / WorksheetNameUnquoted; WorkbookName = "[" r:((! ("["/"]") character )+) "]" { var res=[]; for(var i=0; i<r.length; i++) res.push(r[i].join("")); return res.join("");}; Workbook = WorkbookName / "" {return new FSharp.None();}; RangeReferenceWorksheet =  (wsname:WorksheetName "!") rng:RangeAny {return new AST.ReferenceRange(wsname, rng);}; RangeReferenceNoWorksheet = rng:RangeAny {return new AST.ReferenceRange(null, rng);}; RangeReference = RangeReferenceWorksheet / RangeReferenceNoWorksheet; AddressReferenceWorksheet = wsname:WorksheetName "!" addr:AnyAddr {return new AST.ReferenceAddress(wsname, addr);}; AddressReferenceNoWorksheet = addr:AnyAddr {return new AST.ReferenceAddress(null, addr);}; AddressReference = AddressReferenceWorksheet / AddressReferenceNoWorksheet; NamedReferenceFirstChar = "_" / letter; NamedReferenceLastChars = r:(("_" / letter / digit) *){return r.join("");}; NamedReference = c:NamedReferenceFirstChar s:NamedReferenceLastChars {return new AST.ReferenceNamed(null, c+s);}; StringReference = ["] r:(!["] character) + ["] { var res=[]; for(var i=0; i<r.length; i++) res.push(r[i].join("")); return new AST.ReferenceString(null, res.join(""));}; ConstantReference = r:Int32 {return new AST.ReferenceConstant(null, r);}; ReferenceKinds = RangeReference / AddressReference / ConstantReference / StringReference / NamedReference; Reference = w:Workbook ref:ReferenceKinds {ref.WorkbookName = w; return ref;}; BinOpChar = "+" / "-" / "*" / "<" / ">"; BinOp2Char = "<="; BinOpLong = op:BinOp2Char exp:ExpressionDecl {return {operator:op, expression:exp};}; BinOpShort = op:BinOpChar exp:ExpressionDecl {return {operator:op, expression:exp};}; BinOp = BinOpLong / BinOpShort; UnaryOpChar = "+" / "-"; ParensExpr = "(" exp:ExpressionDecl ")" {return new AST.ParensExpr(exp);}; ExpressionAtom = fn:Function {return new AST.ReferenceExpr(fn);} / ref:Reference{return new AST.ReferenceExpr(ref);}; ExpressionSimple = ExpressionAtom /  ParensExpr; UnaryOpExpr = op:UnaryOpChar exp:ExpressionDecl {return new AST.UnaryOpExpr(op,exp);}; BinOpExpr = exp:ExpressionSimple lhs:BinOp {return new AST.BinOpExpr(lhs.operator, exp, lhs.expression);} ExpressionDecl =  UnaryOpExpr / BinOpExpr / ExpressionSimple; FunctionName = r:((letter / ".") +) {return r.join("");}; Function =  f:FunctionName "(" args:ArgumentList ")" {return new AST.ReferenceFunction(null, f, args);} ; ArgumentList = res:((hd:ExpressionDecl tl:("," ExpressionDecl) * {var a=[hd]; for(i=0; i< tl.length; i++) a.push(tl[i][1]); return a; }) ?) {return res==""?[]:res;} Formula = "=" res:ExpressionDecl{return res;}; ';
        },
        tearDown: function () {
            "use strict";
            delete this.grammar;
        },
        "testInt32": function () {
            "use strict";
            var parser = PEG.buildParser('start=Int32;' + this.grammar);
            assertEquals(-123, parser.parse("-123"));
            assertEquals(+21, parser.parse("+21"));
            assertEquals(9, parser.parse("0x9"));
            assertEquals(16, parser.parse("0x10"));
            assertEquals(3, parser.parse("0b11"));
            assertException(function () {
                parser.parse("-xx");
            });
        },
        "test AddrR": function () {
            "use strict";
            var parser = PEG.buildParser('start=AddrR;' + this.grammar);
            assertEquals(-123, parser.parse("R-123"));
            assertException(function () {
                parser.parse("");
            });
            assertException(function () {
                parser.parse("R");
            });
            assertException(function () {
                parser.parse("Rrr");
            });
        },
        "test AddrR1C1": function () {
            "use strict";
            var parser = PEG.buildParser('start = AddrR1C1;' + this.grammar);
            var a = parser.parse("R1C2");

            assertInstanceOf(AST.Address, a);
            assert(a.X === 2 && a.Y === 1 && a.WorkbookName === null && a.WorksheetName === null);
            assertException(function () {
                parser.parse("R1");
            });
        },
        "test AddrA": function () {
            "use strict";
            var parser = PEG.buildParser('start=AddrA;' + this.grammar);
            assertEquals("ABCD", parser.parse("ABCD"));
            assertException(function () {
                parser.parse("a");
            });
            assertException(function () {
                parser.parse("");
            });
            assertException(function () {
                parser.parse("1");
            });
        },
        "test AddrAAbs": function () {
            "use strict";
            var parser = PEG.buildParser('start=AddrAAbs;' + this.grammar);
            assertEquals("ABCD", parser.parse("$ABCD"));
            assertEquals("ABCD", parser.parse("ABCD"));
            assertException(function () {
                parser.parse("a");
            });
            assertException(function () {
                parser.parse("");
            });
        },
        "test Addr1Abs": function () {
            "use strict";
            var parser = PEG.buildParser('start=Addr1Abs;' + this.grammar);
            assertEquals("123", parser.parse("$123"));
            assertEquals("123", parser.parse("123"));
            assertException(function () {
                parser.parse("A");
            });
            assertException(function () {
                parser.parse("");
            });
        },
        "test AddrA1": function () {
            "use strict";
            var parser = PEG.buildParser('start=AddrA1;' + this.grammar);
            var a = parser.parse("$A$2");

            assertInstanceOf(AST.Address, a);
            assertInstanceOf(AST.Address, parser.parse("RZ34"));
            assertEquals(1, a.X);
            assertEquals(2, a.Y);
            assertEquals(null, a.WorkbookName);
            assertEquals(null, a.WorksheetName);
        },
        "test AnyAddr": function () {
            "use strict";
            var parser = PEG.buildParser('start=AnyAddr;' + this.grammar);
            var a = parser.parse("R2");

            assertInstanceOf(AST.Address, parser.parse("$A$2"));
            assertInstanceOf(AST.Address, parser.parse("R2C3"));
            assertInstanceOf(AST.Address, parser.parse("R2"));
            assertException(function () {
                parser.parse("$A$2:$B$3");
            });
            assertEquals(18, a.X);
            assertEquals(2, a.Y);
            assertEquals(null, a.WorkbookName);
            assertEquals(null, a.WorksheetName);
        },
        "test MoreAddrR1C1": function () {
            "use strict";
            var parser = PEG.buildParser('start=MoreAddrR1C1;' + this.grammar);
            var a = parser.parse(":R2C3");
            assertInstanceOf(AST.Address, a);
            assertEquals(2, a.Y);
            assertEquals(3, a.X);
            assertEquals(null, a.WorksheetName);
            assertEquals(null, a.WorkbookName);
            assertException(function () {
                parser.parse("a");
            });
            assertException(function () {
                parser.parse(":23");
            });
        },
        "test RangeR1C1": function () {
            "use strict";
            var parser = PEG.buildParser('start=RangeR1C1;' + this.grammar);
            var a = parser.parse("R1C1:R4C4");
            assertInstanceOf(AST.Range, a);
            assert(a.getXLeft() === 1 && a.getYTop() === 1 && a.getXRight() === 4 && a.getYBottom() === 4);

        },
        "test MoreAddrA1": function () {
            "use strict";
            var parser = PEG.buildParser('start=MoreAddrA1;' + this.grammar);
            var a = parser.parse(":A5");
            assertInstanceOf(AST.Address, a);
            assertEquals(1, a.X);
            assertEquals(5, a.Y);
            assertException(function () {
                parser.parse("a");
            });
            assertException(function () {
                parser.parse(":23");
            });
        },
        "test RangeA1": function () {
            "use strict";
            var parser = PEG.buildParser('start=RangeA1;' + this.grammar);
            var a = parser.parse("A5:A6");
            assertInstanceOf(AST.Range, a);
            assertEquals(1, a.getXLeft());
            assertEquals(5, a.getYTop());
            assertEquals(1, a.getXRight());
            assertEquals(6, a.getYBottom());
            assertInstanceOf(AST.Range, parser.parse("$A5:$A6"));
            assertException(function () {
                parser.parse("a");
            });
            assertException(function () {
                parser.parse(":23");
            });
        },
        "test RangeAny": function () {
            "use strict";
            var parser = PEG.buildParser('start=RangeAny;' + this.grammar);
            assertInstanceOf(AST.Range, parser.parse("A5:A6"));
            assertInstanceOf(AST.Range, parser.parse("$A5:$A6"));
            assertInstanceOf(AST.Range, parser.parse("R1:C4"));
        },
        "test WorksheetNameQuoted": function () {
            "use strict";
            var parser = PEG.buildParser('start=WorksheetNameQuoted;' + this.grammar);
            assertEquals("Sheet", parser.parse("'Sheet'"));
            assertException(function () {
                parser.parse("'Sheet");
            });
            assertException(function () {
                parser.parse("'sheet'''");
            });
            assertException(function () {
                parser.parse("''");
            });
        },
        "test WorksheetNameUnquoted": function () {
            "use strict";
            var parser = PEG.buildParser('start=WorksheetNameUnquoted;' + this.grammar);
            assertEquals("Sheet", parser.parse("Sheet"));
            assertException(function () {
                parser.parse("'Sheet");
            });
            assertException(function () {
                parser.parse("'sheet'''");
            });
        },
        "test WorksheetName": function () {
            "use strict";
            var parser = PEG.buildParser('start=WorksheetName;' + this.grammar);
            assertEquals("Sheet", parser.parse("Sheet"));
            assertEquals("Sheet", parser.parse("'Sheet'"));
            assertException(function () {
                parser.parse("'Sheet");
            });
        },
        "test WorkbookName": function () {
            "use strict";
            var parser = PEG.buildParser('start=WorkbookName;' + this.grammar);
            assertEquals("Book", parser.parse("[Book]"));
            assertException(function () {
                parser.parse("[]");
            });
            assertException(function () {
                parser.parse("");
            });
        },
        "test Workbook": function () {
            "use strict";
            var parser = PEG.buildParser('start=Workbook;' + this.grammar);
            assertEquals("Book", parser.parse("[Book]"));
            assertInstanceOf(FSharp.None, parser.parse(""));
        },
        "test RangeReferenceWorksheet": function () {
            "use strict";
            var parser = PEG.buildParser('start=RangeReferenceWorksheet;' + this.grammar);
            var a = parser.parse("'Worksheet'!$A$2:$A3");
            assertInstanceOf(AST.ReferenceRange, a);
            assertEquals(1, a.Range.getXLeft());
            assertEquals(1, a.Range.getXRight());
            assertEquals(2, a.Range.getYTop());
            assertEquals(3, a.Range.getYBottom());
            assertException(function () {
                parser.parse("$A$2");
            });
            assertException(function () {
                parser.parse("'$A$2'");
            });
        },
        "test RangeReferenceNoWorksheet": function () {
            "use strict";
            var parser = PEG.buildParser('start=RangeReferenceNoWorksheet;' + this.grammar);
            var a = parser.parse("$A2:$B3");
            assertInstanceOf(AST.ReferenceRange, a);
            assertEquals(1, a.Range.getXLeft());
            assertEquals(2, a.Range.getXRight());
            assertEquals(2, a.Range.getYTop());
            assertEquals(3, a.Range.getYBottom());
            assertException(function () {
                parser.parse("'Worksheet'!$A$2:$A3");
            });
        },
        "test AddressReferenceWorksheet": function () {
            "use strict";
            var parser = PEG.buildParser('start=AddressReferenceWorksheet;' + this.grammar);
            var a = parser.parse("'Worksheet'!$A$2");
            assertEquals("ReferenceAddress(Worksheet, (2,1))", a);
            assertInstanceOf(AST.ReferenceAddress, a);
            assertException(function () {
                parser.parse("'Worksheet'!$A$2:$A3");
            });
        },

        "test AddressReferenceNoWorksheet": function () {
            "use strict";
            var parser = PEG.buildParser('start=AddressReferenceNoWorksheet;' + this.grammar);
            var a = parser.parse("$A$2");
            assertInstanceOf(AST.ReferenceAddress, a);
            assertEquals("ReferenceAddress(None, (2,1))", a.toString());
            assertInstanceOf(AST.ReferenceAddress, parser.parse("R2C3"));
            assertException(function () {
                parser.parse("'Worksheet'!$A3");
            });
        },
        "test NamedReference": function () {
            "use strict";
            var parser = PEG.buildParser('start=NamedReference;' + this.grammar);
            var a = parser.parse("_lala");

            assertInstanceOf(AST.ReferenceNamed, a);
            assertInstanceOf(AST.ReferenceNamed, parser.parse("_"));
            assertEquals("ReferenceName(None, _lala)", a.toString());
            assertException(function () {
                parser.parse("23");
            });
            assertException(function () {
                parser.parse("");
            });


        },
        "test StringReference": function () {
            "use strict";
            var parser = PEG.buildParser('start=StringReference;' + this.grammar);
            var a = parser.parse('"test"');

            assertInstanceOf(AST.ReferenceString, parser.parse("\"asd\""));
            assertEquals("String(test)", a.toString());
            assertException(function () {
                parser.parse('""');
            });
        },
        "test ConstantReference": function () {
            "use strict";
            var parser = PEG.buildParser('start=ConstantReference;' + this.grammar);
            var wb = {Name: "book"};
            var ws = {Name: "sheet"};
            var a = parser.parse("23");
            assertEquals("Constant(23)", a.toString());
            a.Resolve(wb, ws);
            assertEquals(a.WorkbookName, "book");
            assertEquals(a.WorksheetName, "sheet");

        },

        "test Reference": function () {
            "use strict";
            var parser = PEG.buildParser('start=Reference;' + this.grammar);
            //String reference
            assertInstanceOf(AST.ReferenceString, parser.parse("\"asd\""));
            var a = parser.parse("\"test\"");
            assertInstanceOf(FSharp.None, a.WorkbookName);
            assertInstanceOf(AST.ReferenceString, parser.parse("[Workbook]\"asd\""));
            a = parser.parse("[Workbook]\"asd\"");
            assertEquals("Workbook", a.WorkbookName);
            assertInstanceOf(AST.ReferenceRange, parser.parse("'Worksheet'!$A$2:$A3"));
            assertInstanceOf(AST.ReferenceRange, parser.parse("[Workbook]'Worksheet'!$A$2:$A3"));
            assertInstanceOf(AST.ReferenceAddress, parser.parse("'Worksheet'!$A$2"));
            assertInstanceOf(AST.ReferenceAddress, parser.parse("[Workbook]'Worksheet'!$A$2"));
            assertInstanceOf(AST.ReferenceConstant, parser.parse("2434"));
            assertInstanceOf(AST.ReferenceConstant, parser.parse("[Workbook]2434"));
            a = parser.parse("[Workbook]2434");
            assertEquals("Workbook", a.WorkbookName);
            assertInstanceOf(AST.ReferenceNamed, parser.parse("_dsadsa"));
            assertInstanceOf(AST.ReferenceNamed, parser.parse("[Workbook]asdda34"));
            assertException(function () {
                parser.parse("$232");
            });
            assertException(function () {
                parser.parse("");
            });
        },
        "test ExpressionAtom": function () {
            "use strict";
            var parser = PEG.buildParser("start=ExpressionAtom;" + this.grammar);
            var a = parser.parse("la()");
            assertInstanceOf(AST.ReferenceExpr, a);
            assertInstanceOf(AST.ReferenceFunction, a.Ref);
            assertEquals("la()", a.Ref.toString());
            a = parser.parse("ABS($A2)");
            assertInstanceOf(AST.ReferenceExpr, a);
            assertInstanceOf(AST.ReferenceFunction, a.Ref);
            assertEquals("ABS(ReferenceExpr ReferenceAddress(None, (2,1)))", a.Ref.toString());
            a = parser.parse("$A$2");
            assertInstanceOf(AST.ReferenceAddress, a.Ref);
            assertEquals("ReferenceAddress(None, (2,1))", a.Ref.toString());
            assertException(function () {
                parser.parse("($A2)");
            });
            assertException(function () {
                parser.parse("");
            });
        },
        "test ParensExpr": function () {
            "use strict";
            var parser = PEG.buildParser("start=ParensExpr;" + this.grammar);
            var a = parser.parse("(B4)");
            assertInstanceOf(AST.ParensExpr, a);
            assertInstanceOf(AST.ReferenceExpr, a.Expr);
            assertInstanceOf(AST.ReferenceAddress, a.Expr.Ref);
            assertEquals("(4,2)", a.Expr.Ref.Address.toString());
            assertEquals("ParensExpr (ReferenceExpr ReferenceAddress(None, (4,2)))", a.toString());
            assertException(function () {
                parser.parse("()");
            });
        },
        "test UnaryOpExpr": function () {
            "use strict";
            var parser = PEG.buildParser("start=UnaryOpExpr;" + this.grammar);
            var a = parser.parse("+$A3");

            assertInstanceOf(AST.UnaryOpExpr, a);
            assertEquals("UnaryOpExpr ('+',ReferenceExpr ReferenceAddress(None, (3,1)))", a.toString());
            assertException(function () {
                parser.parse("");
            });
            assertException(function () {
                parser.parse("+");
            });
        },
        "test BinOpExpr": function () {
            "use strict";
            var parser = PEG.buildParser("start=BinOpExpr;" + this.grammar);
            var a = parser.parse("$A3+$A2");
            assertInstanceOf(AST.BinOpExpr, a);
            assertEquals("BinOpExpr (\"+\",ReferenceExpr ReferenceAddress(None, (3,1)),ReferenceExpr ReferenceAddress(None, (2,1)))", a.toString());
            a = parser.parse("$A3<=$A2");
            assertEquals("BinOpExpr (\"<=\",ReferenceExpr ReferenceAddress(None, (3,1)),ReferenceExpr ReferenceAddress(None, (2,1)))", a.toString());
        },
        "test Function": function () {
            "use strict";
            var parser = PEG.buildParser("start=Function;" + this.grammar);
            var a = parser.parse("ABS()");

            assertInstanceOf(AST.ReferenceFunction, a);
            assertEquals("ABS()", a.toString());
            a =  parser.parse("ABS($A2:$A5,$A5,R2C5)");
            assertInstanceOf(AST.ReferenceFunction,a);
            assertEquals("ABS(ReferenceExpr ReferenceRange(None, (2,1),(5,1)),ReferenceExpr ReferenceAddress(None, (5,1)),ReferenceExpr ReferenceAddress(None, (2,5)))", a.toString());
            assertException(function () {
                parser.parse("");
            });
        },
        "test Formula": function () {
            "use strict";
            var parser = PEG.buildParser("start=Formula;" + this.grammar);
            //TODO the bulk of the test cases should go here
            assertEquals("ReferenceExpr ABS()", parser.parse("=ABS()").toString());
            assertEquals("ReferenceExpr ReferenceAddress(None, (23,1))", parser.parse("=A23").toString());
            assertEquals("ReferenceExpr ReferenceRange(None, (23,1),(45,1))", parser.parse("=A23:A45").toString());
            assertEquals("ReferenceExpr ReferenceRange(Sheet2,(4,1),(20,1))", parser.parse("=Sheet2!A4:A20").toString());
            assertEquals("ReferenceExpr ReferenceAddress(Sheet3, (1,1))", parser.parse("=[workbook2.xls]Sheet3!A1").toString());
            assertEquals("workbook2.xls", parser.parse("=[workbook2.xls]Sheet3!A1").Ref.WorkbookName);
            assertEquals("ReferenceExpr ReferenceRange(None, (3,4),(20,4))", parser.parse("=R3C4:R20C4").toString());
            assertEquals("ReferenceExpr ReferenceName(None, SardineExports)",parser.parse("=SardineExports").toString());
            assertEquals("ReferenceExpr ABS(ReferenceExpr ReferenceAddress(None, (23,1)))", parser.parse("=ABS(A23)"));
            assertEquals("ReferenceExpr SUM(ReferenceExpr ReferenceRange(Sheet2,(4,1),(20,1)))", parser.parse("=SUM(Sheet2!A4:A20)"));
            assertEquals("ReferenceExpr SUM(ReferenceExpr ReferenceAddress(Sheet3, (1,1)))",(parser.parse("=SUM([workbook2.xls]Sheet3!A1)")));
            assertEquals("ReferenceExpr SUM(ReferenceExpr ReferenceName(None, SardineExports))",parser.parse("=SUM(SardineExports)") );
            assertEquals("ReferenceExpr INDEX(ReferenceExpr ReferenceName(None, SardineExports),ReferenceExpr Constant(5))", parser.parse("=INDEX(SardineExports,5)"));
        }
    });






