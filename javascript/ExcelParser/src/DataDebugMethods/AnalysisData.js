/**
 * The AnalysisData object holds the result of the construction of the dependence tree.
 *
 */
define("DataDebugMethods/AnalysisData", ["Utilities/HashMap"], function (HashMap) {
    "use strict";
    function AnalysisData() {
        this.input_ranges = [];//holds all the input ranges of TreeNodes in the Excel file.
        this.formula_nodes = new HashMap();//a mapping from cells containing formulas to the corresponding tree node

    }

    /**
     * Returns an array of formula nodes that do not have any parents.
     * @returns {Array}
     */
    AnalysisData.prototype.getTerminalFormulaNodes = function () {
        var res = [], i, len, entrySet;
        // return only the formula nodes which do not provide
        // input to any other cell and which are also not
        // in our list of excluded functions
        entrySet = this.formula_nodes.getEntrySet();
        for (i = 0, len = entrySet.length; i < len; i++) {
            if (entrySet[i].value.parents.length === 0)
                res.push(entrySet[i].value);
        }
        return res;
    };
    /**
     * Returns ranges that can be perturbed and that do not have any children.
     * @returns {Array}
     */
    AnalysisData.prototype.getTerminalInputNodes = function () {
        // this should filter out the following two cases:
        // 1. input range is intermediate (acts as input to a formula
        //    and also contains a formula which consumes input from
        //    another range).
        // 2. the range is actually a formula cell
        var i, len, res = [];
        for (i = 0, len = this.input_ranges.length; i < len; i++) {
            if (this.input_ranges[i].dont_perturb === false && this.input_ranges[i].children.length === 0) {
                res.push(this.input_ranges[i]);
            }
        }
        return res;
    };

    return AnalysisData;
});
