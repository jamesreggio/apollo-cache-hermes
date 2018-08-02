"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var apollo_utilities_1 = require("apollo-utilities");
var errors_1 = require("./errors");
var util_1 = require("./util");
/**
 * The GraphQL AST is parsed down into a simple tree containing all information
 * the cache requires to read/write associated payloads.
 *
 * A parsed query has no notion of fragments, or other such redirections; they
 * are flattened into query nodes when parsed.
 */
var ParsedQueryNode = /** @class */ (function () {
    function ParsedQueryNode(
    /** Any child fields. */
    children, 
    /**
     * The name of the field (as defined by the schema).
     *
     * Omitted by default (can be inferred by its key in a node map), unless
     * the field is aliased.
     */
    schemaName, 
    /** The map of the field's arguments and their values, if parameterized. */
    args, 
    /**
     * Whether a (transitive) child contains arguments.  This allows us to
     * ignore whole subtrees in some situations if they were completely static.
     * */
    hasParameterizedChildren, selection, // TODO(jamesreggio): TS compiler won't let me type this as SelectionNode.
    excluded) {
        this.children = children;
        this.schemaName = schemaName;
        this.args = args;
        this.hasParameterizedChildren = hasParameterizedChildren;
        this.selection = selection;
        this.excluded = excluded;
    }
    return ParsedQueryNode;
}());
exports.ParsedQueryNode = ParsedQueryNode;
/**
 * Represents the location a variable should be used as an argument to a
 * parameterized field.
 *
 * Note that variables can occur _anywhere_ within an argument, not just at the
 * top level.
 */
var VariableArgument = /** @class */ (function () {
    function VariableArgument(
    /** The name of the variable. */
    name) {
        this.name = name;
    }
    return VariableArgument;
}());
exports.VariableArgument = VariableArgument;
/**
 * Maintains a cache of SelectionSetNode to ParsedQuery mappings.
 *
 * The cache is keyed on the JSON-stringified SelectionSetNode, so equivalent
 * SelectionSets will resolve the same ParsedQuery. This helps with avoiding
 * duplicate writes of the same entity for a given SelectionSet.
 */
var SelectionSetCache = /** @class */ (function () {
    function SelectionSetCache() {
        this._cache = {};
    }
    SelectionSetCache.prototype.set = function (key, value) {
        var hash = SelectionSetCache._hash(key);
        if (hash) {
            this._cache[hash] = value;
        }
    };
    SelectionSetCache.prototype.get = function (key) {
        var hash = SelectionSetCache._hash(key);
        return hash ? this._cache[hash] : undefined;
    };
    SelectionSetCache._hash = function (key) {
        try {
            // JSON.stringify is assumed to be deterministic on the VMs we target.
            // Technically, the ordering of keys is unspecified, but in practice,
            // JavaScriptCore and V8 will serialize in the order added.
            return JSON.stringify(key);
        }
        catch (error) {
            return undefined;
        }
    };
    return SelectionSetCache;
}());
/**
 * Parsed a GraphQL AST selection into a tree of ParsedQueryNode instances.
 */
function parseQuery(context, fragments, selectionSet) {
    var variables = new Set();
    var visitedSelectionSets = new SelectionSetCache();
    var parsedQuery = _buildNodeMap(variables, context, fragments, visitedSelectionSets, selectionSet);
    if (!parsedQuery) {
        throw new Error("Parsed a query, but found no fields present; it may use unsupported GraphQL features");
    }
    return { parsedQuery: parsedQuery, variables: variables };
}
exports.parseQuery = parseQuery;
/**
 * Recursively builds a mapping of field names to ParsedQueryNodes for the given
 * selection set.
 */
function _buildNodeMap(variables, context, fragments, visitedSelectionSets, selectionSet, path) {
    if (path === void 0) { path = []; }
    if (!selectionSet)
        return undefined;
    var cachedQueryNode = visitedSelectionSets.get(selectionSet);
    if (cachedQueryNode)
        return cachedQueryNode;
    var nodeMap = Object.create(null);
    try {
        for (var _a = tslib_1.__values(selectionSet.selections), _b = _a.next(); !_b.done; _b = _a.next()) {
            var selection = _b.value;
            if (selection.kind === 'Field') {
                // The name of the field (as defined by the query).
                var name_1 = selection.alias ? selection.alias.value : selection.name.value;
                var children = _buildNodeMap(variables, context, fragments, visitedSelectionSets, selection.selectionSet, tslib_1.__spread(path, [name_1]));
                var args = void 0, schemaName = void 0;
                // fields marked as @static are treated as if they are a static field in
                // the schema.  E.g. parameters are ignored, and an alias is considered
                // to be truth.
                if (!util_1.fieldHasStaticDirective(selection)) {
                    args = _buildFieldArgs(variables, selection.arguments);
                    schemaName = selection.alias ? selection.name.value : undefined;
                }
                var hasParameterizedChildren = areChildrenDynamic(children);
                var nodeSelection = util_1.fieldHasInclusionDirective(selection) ? selection : undefined;
                var node = new ParsedQueryNode(children, schemaName, args, hasParameterizedChildren, nodeSelection);
                nodeMap[name_1] = _mergeNodes(tslib_1.__spread(path, [name_1]), node, nodeMap[name_1]);
            }
            else if (selection.kind === 'FragmentSpread') {
                var fragment = fragments[selection.name.value];
                if (!fragment) {
                    throw new Error("Expected fragment " + selection.name.value + " to be defined");
                }
                var fragmentMap = _buildNodeMap(variables, context, fragments, visitedSelectionSets, fragment.selectionSet, path);
                if (fragmentMap) {
                    for (var name_2 in fragmentMap) {
                        nodeMap[name_2] = _mergeNodes(tslib_1.__spread(path, [name_2]), fragmentMap[name_2], nodeMap[name_2]);
                    }
                }
            }
            else if (selection.kind === 'InlineFragment') {
                var fragmentMap = _buildNodeMap(variables, context, fragments, visitedSelectionSets, selection.selectionSet, path);
                if (fragmentMap) {
                    for (var name_3 in fragmentMap) {
                        nodeMap[name_3] = _mergeNodes(tslib_1.__spread(path, [name_3]), fragmentMap[name_3], nodeMap[name_3]);
                    }
                }
            }
            else if (context.tracer.warning) {
                context.tracer.warning(selection.kind + " selections are not supported; query may misbehave");
            }
            _collectDirectiveVariables(variables, selection);
        }
    }
    catch (e_1_1) { e_1 = { error: e_1_1 }; }
    finally {
        try {
            if (_b && !_b.done && (_c = _a.return)) _c.call(_a);
        }
        finally { if (e_1) throw e_1.error; }
    }
    var queryNode = Object.keys(nodeMap).length ? nodeMap : undefined;
    visitedSelectionSets.set(selectionSet, queryNode);
    return queryNode;
    var e_1, _c;
}
/**
 * Well, are they?
 */
function areChildrenDynamic(children) {
    if (!children)
        return undefined;
    for (var name_4 in children) {
        var child = children[name_4];
        if (child.hasParameterizedChildren)
            return true;
        if (child.args)
            return true;
        if (child.schemaName)
            return true; // Aliases are dynamic at read time.
    }
    return undefined;
}
exports.areChildrenDynamic = areChildrenDynamic;
/**
 * Build the map of arguments to their natural JS values (or variables).
 */
function _buildFieldArgs(variables, argumentsNode) {
    if (!argumentsNode)
        return undefined;
    var args = {};
    try {
        for (var argumentsNode_1 = tslib_1.__values(argumentsNode), argumentsNode_1_1 = argumentsNode_1.next(); !argumentsNode_1_1.done; argumentsNode_1_1 = argumentsNode_1.next()) {
            var arg = argumentsNode_1_1.value;
            // Mapped name of argument to it JS value
            args[arg.name.value] = _valueFromNode(variables, arg.value);
        }
    }
    catch (e_2_1) { e_2 = { error: e_2_1 }; }
    finally {
        try {
            if (argumentsNode_1_1 && !argumentsNode_1_1.done && (_a = argumentsNode_1.return)) _a.call(argumentsNode_1);
        }
        finally { if (e_2) throw e_2.error; }
    }
    return Object.keys(args).length ? args : undefined;
    var e_2, _a;
}
/**
 * Evaluate a ValueNode and yield its value in its natural JS form.
 */
function _valueFromNode(variables, node) {
    return apollo_utilities_1.valueFromNode(node, function (_a) {
        var value = _a.name.value;
        variables.add(value);
        return new VariableArgument(value);
    });
}
/**
 * Collect the variables in use by any directives on the node.
 */
function _collectDirectiveVariables(variables, node) {
    var directives = node.directives;
    if (!directives)
        return;
    try {
        for (var directives_1 = tslib_1.__values(directives), directives_1_1 = directives_1.next(); !directives_1_1.done; directives_1_1 = directives_1.next()) {
            var directive = directives_1_1.value;
            if (!directive.arguments)
                continue;
            try {
                for (var _a = tslib_1.__values(directive.arguments), _b = _a.next(); !_b.done; _b = _a.next()) {
                    var argument = _b.value;
                    apollo_utilities_1.valueFromNode(argument.value, function (_a) {
                        var value = _a.name.value;
                        variables.add(value);
                    });
                }
            }
            catch (e_3_1) { e_3 = { error: e_3_1 }; }
            finally {
                try {
                    if (_b && !_b.done && (_c = _a.return)) _c.call(_a);
                }
                finally { if (e_3) throw e_3.error; }
            }
        }
    }
    catch (e_4_1) { e_4 = { error: e_4_1 }; }
    finally {
        try {
            if (directives_1_1 && !directives_1_1.done && (_d = directives_1.return)) _d.call(directives_1);
        }
        finally { if (e_4) throw e_4.error; }
    }
    var e_4, _d, e_3, _c;
}
/**
 * Merges two node definitions; mutating `target` to include children from
 * `source`.
 */
function _mergeNodes(path, target, source) {
    if (!source)
        return target;
    if (!apollo_utilities_1.isEqual(target.args, source.args)) {
        throw new errors_1.ConflictingFieldsError("parameterization mismatch", path, [target, source]);
    }
    if (target.schemaName !== source.schemaName) {
        throw new errors_1.ConflictingFieldsError("alias mismatch", path, [target, source]);
    }
    if (!source.children)
        return target;
    if (!target.children) {
        target.children = source.children;
    }
    else {
        for (var name_5 in source.children) {
            target.children[name_5] = _mergeNodes(tslib_1.__spread(path, [name_5]), source.children[name_5], target.children[name_5]);
        }
    }
    if (source.hasParameterizedChildren && !target.hasParameterizedChildren) {
        target.hasParameterizedChildren = true;
    }
    return target;
}
/**
 * Replace all instances of VariableArgument contained within a parsed operation
 * with their actual values.
 *
 * This requires that all variables used are provided in `variables`.
 */
function expandVariables(parsed, variables) {
    return _expandVariables(parsed, variables);
}
exports.expandVariables = expandVariables;
function _expandVariables(parsed, variables) {
    if (!parsed)
        return undefined;
    var newMap = {};
    for (var key in parsed) {
        var node = parsed[key];
        // TODO(jamesreggio): Eliminate unnecessary cast once explicit type can be
        // applied to `selection` property.
        var excluded = (node.selection && !apollo_utilities_1.shouldInclude(node.selection, variables))
            ? true : undefined;
        if (node.args || node.hasParameterizedChildren || excluded) {
            newMap[key] = new ParsedQueryNode(_expandVariables(node.children, variables), node.schemaName, expandFieldArguments(node.args, variables), node.hasParameterizedChildren, node.selection, excluded);
            // No variables to substitute for this subtree.
        }
        else {
            newMap[key] = node;
        }
    }
    return newMap;
}
exports._expandVariables = _expandVariables;
/**
 * Sub values in for any variables required by a field's args.
 */
function expandFieldArguments(args, variables) {
    return args ? _expandArgument(args, variables) : undefined;
}
exports.expandFieldArguments = expandFieldArguments;
function _expandArgument(arg, variables) {
    if (arg instanceof VariableArgument) {
        if (!variables || !(arg.name in variables)) {
            throw new Error("Expected variable $" + arg.name + " to exist for query");
        }
        return variables[arg.name];
    }
    else if (Array.isArray(arg)) {
        return arg.map(function (v) { return _expandArgument(v, variables); });
    }
    else if (util_1.isObject(arg)) {
        var expanded = {};
        for (var key in arg) {
            expanded[key] = _expandArgument(arg[key], variables);
        }
        return expanded;
    }
    else {
        // TS isn't inferring that arg cannot contain any VariableArgument values.
        return arg;
    }
}
exports._expandArgument = _expandArgument;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUGFyc2VkUXVlcnlOb2RlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiUGFyc2VkUXVlcnlOb2RlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUFBLHFEQUF5RTtBQUd6RSxtQ0FBa0Q7QUFFbEQsK0JBU2dCO0FBS2hCOzs7Ozs7R0FNRztBQUNIO0lBQ0U7SUFDRSx3QkFBd0I7SUFDakIsUUFBd0M7SUFDL0M7Ozs7O09BS0c7SUFDSSxVQUFtQjtJQUMxQiwyRUFBMkU7SUFDcEUsSUFBOEI7SUFDckM7OztTQUdLO0lBQ0Usd0JBQStCLEVBQy9CLFNBQWUsRUFBRSwwRUFBMEU7SUFDM0YsUUFBZTtRQWhCZixhQUFRLEdBQVIsUUFBUSxDQUFnQztRQU94QyxlQUFVLEdBQVYsVUFBVSxDQUFTO1FBRW5CLFNBQUksR0FBSixJQUFJLENBQTBCO1FBSzlCLDZCQUF3QixHQUF4Qix3QkFBd0IsQ0FBTztRQUMvQixjQUFTLEdBQVQsU0FBUyxDQUFNO1FBQ2YsYUFBUSxHQUFSLFFBQVEsQ0FBTztJQUNyQixDQUFDO0lBQ04sc0JBQUM7QUFBRCxDQUFDLEFBckJELElBcUJDO0FBckJZLDBDQUFlO0FBcUQ1Qjs7Ozs7O0dBTUc7QUFDSDtJQUNFO0lBQ0UsZ0NBQWdDO0lBQ2hCLElBQVk7UUFBWixTQUFJLEdBQUosSUFBSSxDQUFRO0lBQzNCLENBQUM7SUFDTix1QkFBQztBQUFELENBQUMsQUFMRCxJQUtDO0FBTFksNENBQWdCO0FBTzdCOzs7Ozs7R0FNRztBQUNIO0lBQUE7UUFDVSxXQUFNLEdBQTRELEVBQUUsQ0FBQztJQXlCL0UsQ0FBQztJQXZCUSwrQkFBRyxHQUFWLFVBQVcsR0FBcUIsRUFBRSxLQUErQjtRQUMvRCxJQUFNLElBQUksR0FBRyxpQkFBaUIsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUM7UUFFMUMsSUFBSSxJQUFJLEVBQUU7WUFDUixJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxHQUFHLEtBQUssQ0FBQztTQUMzQjtJ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