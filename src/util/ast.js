"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var apollo_utilities_1 = require("apollo-utilities");
var primitive_1 = require("./primitive");
var apollo_utilities_2 = require("apollo-utilities");
exports.getOperationOrDie = apollo_utilities_2.getOperationDefinitionOrDie;
exports.variablesInOperation = apollo_utilities_2.variablesInOperation;
exports.valueFromNode = apollo_utilities_2.valueFromNode;
/**
 * Returns the default values of all variables in the operation.
 */
function variableDefaultsInOperation(operation) {
    var defaults = {};
    if (operation.variableDefinitions) {
        try {
            for (var _a = tslib_1.__values(operation.variableDefinitions), _b = _a.next(); !_b.done; _b = _a.next()) {
                var definition = _b.value;
                if (definition.type.kind === 'NonNullType')
                    continue; // Required.
                var defaultValue = definition.defaultValue;
                defaults[definition.variable.name.value] = primitive_1.isObject(defaultValue) ? apollo_utilities_1.valueFromNode(defaultValue) : null;
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (_b && !_b.done && (_c = _a.return)) _c.call(_a);
            }
            finally { if (e_1) throw e_1.error; }
        }
    }
    return defaults;
    var e_1, _c;
}
exports.variableDefaultsInOperation = variableDefaultsInOperation;
/**
 * Extracts fragments from `document` by name.
 */
function fragmentMapForDocument(document) {
    var map = {};
    try {
        for (var _a = tslib_1.__values(document.definitions), _b = _a.next(); !_b.done; _b = _a.next()) {
            var definition = _b.value;
            if (definition.kind !== 'FragmentDefinition')
                continue;
            map[definition.name.value] = definition;
        }
    }
    catch (e_2_1) { e_2 = { error: e_2_1 }; }
    finally {
        try {
            if (_b && !_b.done && (_c = _a.return)) _c.call(_a);
        }
        finally { if (e_2) throw e_2.error; }
    }
    return map;
    var e_2, _c;
}
exports.fragmentMapForDocument = fragmentMapForDocument;
/**
 * Returns whether a selection set is considered static from the cache's
 * perspective.
 *
 * This is helpful if you want to assert that certain fragments or queries stay
 * static within the cache (and thus, avoid read-time overhead).
 *
 * If the selectionSet contains fragments, you must provide a getter function
 * that exposes them.
 */
function selectionSetIsStatic(selectionSet, fragmentGetter) {
    try {
        for (var _a = tslib_1.__values(selectionSet.selections), _b = _a.next(); !_b.done; _b = _a.next()) {
            var selection = _b.value;
            if (selection.kind === 'Field') {
                if (!fieldIsStatic(selection))
                    return false;
                if (selection.selectionSet && !selectionSetIsStatic(selection.selectionSet, fragmentGetter))
                    return false;
            }
            else if (selection.kind === 'FragmentSpread') {
                if (!fragmentGetter) {
                    throw new Error("fragmentGetter is required for selection sets with ...fragments");
                }
                var fragmentSet = fragmentGetter(selection.name.value);
                if (!fragmentSet) {
                    throw new Error("Unknown fragment " + selection.name.value + " in isSelectionSetStatic");
                }
                if (!selectionSetIsStatic(fragmentSet, fragmentGetter))
                    return false;
            }
            else if (selection.kind === 'InlineFragment') {
                if (!selectionSetIsStatic(selection.selectionSet, fragmentGetter))
                    return false;
            }
            else {
                throw new Error("Unknown selection type " + selection.kind + " in isSelectionSetStatic");
            }
        }
    }
    catch (e_3_1) { e_3 = { error: e_3_1 }; }
    finally {
        try {
            if (_b && !_b.done && (_c = _a.return)) _c.call(_a);
        }
        finally { if (e_3) throw e_3.error; }
    }
    return true;
    var e_3, _c;
}
exports.selectionSetIsStatic = selectionSetIsStatic;
function fieldIsStatic(field) {
    var isActuallyStatic = !fieldHasAlias(field) && !fieldIsParameterized(field);
    return isActuallyStatic || fieldHasStaticDirective(field);
}
exports.fieldIsStatic = fieldIsStatic;
function fieldHasAlias(field) {
    return !!field.alias;
}
exports.fieldHasAlias = fieldHasAlias;
function fieldIsParameterized(field) {
    return !!(field.arguments && field.arguments.length);
}
exports.fieldIsParameterized = fieldIsParameterized;
function fieldHasStaticDirective(_a) {
    var directives = _a.directives;
    if (!directives)
        return false;
    return directives.some(function (directive) { return directive.name.value === 'static'; });
}
exports.fieldHasStaticDirective = fieldHasStaticDirective;
function fieldHasInclusionDirective(_a) {
    var directives = _a.directives;
    if (!directives)
        return false;
    return directives.some(function (directive) { return (directive.name.value === 'include' || directive.name.value === 'exclude'); });
}
exports.fieldHasInclusionDirective = fieldHasInclusionDirective;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXN0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiYXN0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUFBLHFEQUE4RDtBQVk5RCx5Q0FBdUM7QUFFdkMscURBSzBCO0FBSnhCLCtDQUFBLDJCQUEyQixDQUFxQjtBQUNoRCxrREFBQSxvQkFBb0IsQ0FBQTtBQUNwQiwyQ0FBQSxhQUFhLENBQUE7QUFnQmY7O0dBRUc7QUFDSCxxQ0FBNEMsU0FBa0M7SUFDNUUsSUFBTSxRQUFRLEdBQUcsRUFBRSxDQUFDO0lBQ3BCLElBQUksU0FBUyxDQUFDLG1CQUFtQixFQUFFOztZQUNqQyxLQUF5QixJQUFBLEtBQUEsaUJBQUEsU0FBUyxDQUFDLG1CQUFtQixDQUFBLGdCQUFBO2dCQUFqRCxJQUFNLFVBQVUsV0FBQTtnQkFDbkIsSUFBSSxVQUFVLENBQUMsSUFBSSxDQUFDLElBQUksS0FBSyxhQUFhO29CQUFFLFNBQVMsQ0FBQyxZQUFZO2dCQUUxRCxJQUFBLHNDQUFZLENBQWdCO2dCQUNwQyxRQUFRLENBQUMsVUFBVSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLEdBQUcsb0JBQVEsQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDLENBQUMsZ0NBQWEsQ0FBQyxZQUF5QixDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQzthQUNySDs7Ozs7Ozs7O0tBQ0Y7SUFFRCxPQUFPLFFBQVEsQ0FBQzs7QUFDbEIsQ0FBQztBQVpELGtFQVlDO0FBQ0Q7O0dBRUc7QUFDSCxnQ0FBdUMsUUFBc0I7SUFDM0QsSUFBTSxHQUFHLEdBQWdCLEVBQUUsQ0FBQzs7UUFDNUIsS0FBeUIsSUFBQSxLQUFBLGlCQUFBLFFBQVEsQ0FBQyxXQUFXLENBQUEsZ0JBQUE7WUFBeEMsSUFBTSxVQUFVLFdBQUE7WUFDbkIsSUFBSSxVQUFVLENBQUMsSUFBSSxLQUFLLG9CQUFvQjtnQkFBRSxTQUFTO1lBQ3ZELEdBQUcsQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLEtBQUss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