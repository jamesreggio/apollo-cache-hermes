"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var lodashGet = require("lodash.get");
var schema_1 = require("../schema");
var util_1 = require("../util");
var SnapshotEditor_1 = require("./SnapshotEditor");
function read(context, raw, snapshot, includeNodeIds) {
    if (includeNodeIds === void 0) { includeNodeIds = true; }
    var tracerContext;
    if (context.tracer.readStart) {
        tracerContext = context.tracer.readStart(raw);
    }
    var operation = context.parseOperation(raw);
    var queryResult = snapshot.readCache.get(operation);
    var cacheHit = true;
    if (!queryResult) {
        cacheHit = false;
        var staticResult = snapshot.getNodeData(operation.rootId);
        var result = staticResult;
        var nodeIds = includeNodeIds ? new Set() : undefined;
        if (!operation.isStatic) {
            result = _walkAndOverlayDynamicValues(operation, context, snapshot, staticResult, nodeIds);
        }
        var complete = _visitSelection(operation, context, result, nodeIds);
        queryResult = { result: result, complete: complete, nodeIds: nodeIds };
        snapshot.readCache.set(operation, queryResult);
    }
    // We can potentially ask for results without node ids first, and then follow
    // up with an ask for them.  In that case, we need to fill in the cache a bit
    // more.
    if (includeNodeIds && !queryResult.nodeIds) {
        cacheHit = false;
        var nodeIds = new Set();
        var complete = _visitSelection(operation, context, queryResult.result, nodeIds);
        queryResult.complete = complete;
        queryResult.nodeIds = nodeIds;
    }
    if (context.tracer.readEnd) {
        var result = { result: queryResult, cacheHit: cacheHit };
        context.tracer.readEnd(operation, result, tracerContext);
    }
    return queryResult;
}
exports.read = read;
var OverlayWalkNode = /** @class */ (function () {
    function OverlayWalkNode(value, containerId, parsedMap, path) {
        this.value = value;
        this.containerId = containerId;
        this.parsedMap = parsedMap;
        this.path = path;
    }
    return OverlayWalkNode;
}());
/**
 * Walks a parameterized field map, overlaying values at those paths on top of
 * existing results.
 *
 * Overlaid values are objects with prototypes pointing to the original results,
 * and new properties pointing to the parameterized values (or objects that
 * contain them).
 */
function _walkAndOverlayDynamicValues(query, context, snapshot, result, nodeIds) {
    // Corner case: We stop walking once we reach a parameterized field with no
    // snapshot, but we should also preemptively stop walking if there are no
    // dynamic values to be overlaid
    var rootSnapshot = snapshot.getNodeSnapshot(query.rootId);
    if (util_1.isNil(rootSnapshot))
        return result;
    // TODO: A better approach here might be to walk the outbound references from
    // each node, rather than walking the result set.  We'd have to store the path
    // on parameterized value nodes to make that happen.
    var newResult = _wrapValue(result, context);
    // TODO: This logic sucks.  We'd do much better if we had knowledge of the
    // schema.  Can we layer that on in such a way that we can support uses w/ and
    // w/o a schema compilation step?
    var queue = [new OverlayWalkNode(newResult, query.rootId, query.parsedQuery, [])];
    while (queue.length) {
        var walkNode = queue.pop();
        var value = walkNode.value, parsedMap = walkNode.parsedMap;
        var containerId = walkNode.containerId, path = walkNode.path;
        var valueId = context.entityIdForValue(value);
        if (valueId) {
            containerId = valueId;
            path = [];
        }
        for (var key in parsedMap) {
            var node = parsedMap[key];
            if (node.excluded) {
                continue;
            }
            var child = void 0;
            var fieldName = key;
            // This is an alias if we have a schemaName declared.
            fieldName = node.schemaName ? node.schemaName : key;
            var nextContainerId = containerId;
            var nextPath = path;
            if (node.args) {
                var childId = SnapshotEditor_1.nodeIdForParameterizedValue(containerId, tslib_1.__spread(path, [fieldName]), node.args);
                var childSnapshot = snapshot.getNodeSnapshot(childId);
                if (!childSnapshot) {
                    var typeName = value.__typename;
                    if (!typeName && containerId === schema_1.StaticNodeId.QueryRoot) {
                        typeName = 'Query'; // Preserve the default cache's behavior.
                    }
                    // Should we fall back to a redirect?
                    var redirect = lodashGet(context.resolverRedirects, [typeName, fieldName]);
                    if (redirect) {
                        childId = redirect(node.args);
                        if (!util_1.isNil(childId)) {
                            childSnapshot = snapshot.getNodeSnapshot(childId);
                        }
                    }
                }
                // Still no snapshot? Ok we're done here.
                if (!childSnapshot)
                    continue;
                if (nodeIds)
                    nodeIds.add(childId);
                nextContainerId = childId;
                nextPath = [];
                child = childSnapshot.data;
            }
            else {
                nextPath = tslib_1.__spread(path, [fieldName]);
                child = value[fieldName];
            }
            // Have we reached a leaf (either in the query, or in the cache)?
            if (node.hasParameterizedChildren && node.children && child !== null) {
                if (Array.isArray(child)) {
                    child = tslib_1.__spread(child);
                    for (var i = child.length - 1; i >= 0; i--) {
                        if (child[i] === null)
                            continue;
                        child[i] = _wrapValue(child[i], context);
                        queue.push(new OverlayWalkNode(child[i], nextContainerId, node.children, tslib_1.__spread(nextPath, [i])));
                    }
                }
                else {
                    child = _wrapValue(child, context);
                    queue.push(new OverlayWalkNode(child, nextContainerId, node.children, nextPath));
                }
            }
            // Because key is already a field alias, result will be written correctly
            // using alias as key.
            value[key] = child;
        }
    }
    return newResult;
}
exports._walkAndOverlayDynamicValues = _walkAndOverlayDynamicValues;
function _wrapValue(value, context) {
    if (value === undefined)
        return {};
    if (Array.isArray(value))
        return tslib_1.__spread(value);
    if (util_1.isObject(value)) {
        var newValue = tslib_1.__assign({}, value);
        if (context.entityTransformer && context.entityIdForValue(value)) {
            context.entityTransformer(newValue);
        }
        return newValue;
    }
    return value;
}
/**
 * Determines whether `result` satisfies the properties requested by
 * `selection`.
 */
function _visitSelection(query, context, result, nodeIds) {
    var complete = true;
    if (nodeIds && result !== undefined) {
        nodeIds.add(query.rootId);
    }
    // TODO: Memoize per query, and propagate through cache snapshots.
    util_1.walkOperation(query.parsedQuery, result, function (value, fields) {
        if (value === undefined) {
            complete = false;
        }
        // If we're not including node ids, we can stop the walk right here.
        if (!complete)
            return !nodeIds;
        if (!util_1.isObject(value))
            return false;
        if (nodeIds && util_1.isObject(value)) {
            var nodeId = context.entityIdForValue(value);
            if (nodeId !== undefined) {
                nodeIds.add(nodeId);
            }
        }
        try {
            for (var fields_1 = tslib_1.__values(fields), fields_1_1 = fields_1.next(); !fields_1_1.done; fields_1_1 = fields_1.next()) {
                var field = fields_1_1.value;
                if (!(field in value)) {
                    complete = false;
                    break;
                }
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (fields_1_1 && !fields_1_1.done && (_a = fields_1.return)) _a.call(fields_1);
            }
            finally { if (e_1) throw e_1.error; }
        }
        return false;
        var e_1, _a;
    });
    return complete;
}
exports._visitSelection = _visitSelection;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVhZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbInJlYWQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEsc0NBQXlDO0FBTXpDLG9DQUFrRjtBQUNsRixnQ0FBeUQ7QUFFekQsbURBQStEO0FBa0IvRCxjQUFxQixPQUFxQixFQUFFLEdBQWlCLEVBQUUsUUFBdUIsRUFBRSxjQUFxQjtJQUFyQiwrQkFBQSxFQUFBLHFCQUFxQjtJQUMzRyxJQUFJLGFBQWEsQ0FBQztJQUNsQixJQUFJLE9BQU8sQ0FBQyxNQUFNLENBQUMsU0FBUyxFQUFFO1FBQzVCLGFBQWEsR0FBRyxPQUFPLENBQUMsTUFBTSxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsQ0FBQztLQUMvQztJQUVELElBQU0sU0FBUyxHQUFHLE9BQU8sQ0FBQyxjQUFjLENBQUMsR0FBRyxDQUFDLENBQUM7SUFDOUMsSUFBSSxXQUFXLEdBQUcsUUFBUSxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsU0FBUyxDQUFvQyxDQUFDO0lBQ3ZGLElBQUksUUFBUSxHQUFHLElBQUksQ0FBQztJQUNwQixJQUFJLENBQUMsV0FBVyxFQUFFO1FBQ2hCLFFBQVEsR0FBRyxLQUFLLENBQUM7UUFDakIsSUFBTSxZQUFZLEdBQUcsUUFBUSxDQUFDLFdBQVcsQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDLENBQUM7UUFFNUQsSUFBSSxNQUFNLEdBQUcsWUFBWSxDQUFDO1FBQzFCLElBQU0sT0FBTyxHQUFHLGNBQWMsQ0FBQyxDQUFDLENBQUMsSUFBSSxHQUFHLEVBQVUsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDO1FBQy9ELElBQUksQ0FBQyxTQUFTLENBQUMsUUFBUSxFQUFFO1lBQ3ZCLE1BQU0sR0FBRyw0QkFBNEIsQ0FBQyxTQUFTLEVBQUUsT0FBTyxFQUFFLFFBQVEsRUFBRSxZQUFZLEVBQUUsT0FBTyxDQUFDLENBQUM7U0FDNUY7UUFFRCxJQUFNLFFBQVEsR0FBRyxlQUFlLENBQUMsU0FBUyxFQUFFLE9B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