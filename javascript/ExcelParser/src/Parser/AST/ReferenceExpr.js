/**
 * Thic class contains the ReferenceExpr class.
 * This is used to wrap every Expression type.
 */
define("Parser/AST/ReferenceExpr", function () {
    "use strict";
    function ReferenceExpr(/*Reference*/ ref) {
        this.Ref = ref;
    }

    ReferenceExpr.prototype.toString = function () {
        return "ReferenceExpr." + this.Ref.toString();
    };

    ReferenceExpr.prototype.Resolve = function (/*XWorkbook*/ wb, /*XWorksheet*/ ws) {
        this.Ref.Resolve(wb, ws);
    };
    return ReferenceExpr;
});
