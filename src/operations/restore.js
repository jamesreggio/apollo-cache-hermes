"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var lodashSet = require("lodash.set");
var lodashFindIndex = require("lodash.findindex");
var CacheSnapshot_1 = require("../CacheSnapshot");
var GraphSnapshot_1 = require("../GraphSnapshot");
var nodes_1 = require("../nodes");
var OptimisticUpdateQueue_1 = require("../OptimisticUpdateQueue");
var util_1 = require("../util");
/**
 * Restore GraphSnapshot from serializable representation.
 *
 * The parameter 'serializedState' is likely to be result running JSON.stringify
 * on a result of 'extract' method. This function will directly reference object
 * in the serializedState.
 *
 * @throws Will throw an error if 'type' in serializedState cannot be mapped to
 *    different sub-class of NodeSnapshot.
 * @throws Will throw an error if there is undefined in sparse array
 */
function restore(serializedState, cacheContext) {
    var _a = createGraphSnapshotNodes(serializedState, cacheContext), nodesMap = _a.nodesMap, editedNodeIds = _a.editedNodeIds;
    var graphSnapshot = new GraphSnapshot_1.GraphSnapshot(nodesMap);
    return {
        cacheSnapshot: new CacheSnapshot_1.CacheSnapshot(graphSnapshot, graphSnapshot, new OptimisticUpdateQueue_1.OptimisticUpdateQueue()),
        editedNodeIds: editedNodeIds,
    };
}
exports.restore = restore;
function createGraphSnapshotNodes(serializedState, cacheContext) {
    var nodesMap = Object.create(null);
    var editedNodeIds = new Set();
    // Create entity nodes in the GraphSnapshot
    for (var nodeId in serializedState) {
        var _a = serializedState[nodeId], type = _a.type, data = _a.data, inbound = _a.inbound, outbound = _a.outbound;
        var nodeSnapshot = void 0;
        switch (type) {
            case 0 /* EntitySnapshot */:
                nodeSnapshot = new nodes_1.EntitySnapshot(data, inbound, outbound);
                break;
            case 1 /* ParameterizedValueSnapshot */:
                nodeSnapshot = new nodes_1.ParameterizedValueSnapshot(data, inbound, outbound);
                break;
            default:
                throw new Error("Invalid Serializable.NodeSnapshotType " + type + " at " + nodeId);
        }
        nodesMap[nodeId] = nodeSnapshot;
        editedNodeIds.add(nodeId);
    }
    // Patch data property and reconstruct references
    restoreEntityReferences(nodesMap, cacheContext);
    return { nodesMap: nodesMap, editedNodeIds: editedNodeIds };
}
function restoreEntityReferences(nodesMap, cacheContext) {
    var entityTransformer = cacheContext.entityTransformer, entityIdForValue = cacheContext.entityIdForValue;
    for (var nodeId in nodesMap) {
        var _a = nodesMap[nodeId], data = _a.data, outbound = _a.outbound;
        if (entityTransformer && util_1.isObject(data) && entityIdForValue(data)) {
            entityTransformer(data);
        }
        // If it doesn't have outbound then 'data' doesn't have any references
        // If it is 'undefined' means that there is no data value
        // in both cases, there is no need for modification.
        if (!outbound || data === undefined) {
            continue;
        }
        try {
            for (var outbound_1 = tslib_1.__values(outbound), outbound_1_1 = outbound_1.next(); !outbound_1_1.done; outbound_1_1 = outbound_1.next()) {
                var _b = outbound_1_1.value, referenceId = _b.id, path = _b.path;
                var referenceNode = nodesMap[referenceId];
                if (referenceNode instanceof nodes_1.EntitySnapshot && data === null) {
                    // data is a reference.
                    nodesMap[nodeId].data = referenceNode.data;
                }
                else if (referenceNode instanceof nodes_1.ParameterizedValueSnapshot) {
                    // This is specifically to handle a sparse array which happen
                    // when each element in the array reference data in a
                    // ParameterizedValueSnapshot.
                    // (see: parameterizedFields/nestedParameterizedReferenceInArray.ts)
                    // We only want to try walking if its data contains an array
                    var indexToArrayIndex = lodashFindIndex(path, util_1.isNumber);
                    if (indexToArrayIndex !== -1) {
                        tryRestoreSparseArray(data, path, 0);
                    }
                }
                else if (Array.isArray(data) || util_1.isObject(data)) {
                    lodashSet(data, path, referenceNode.data);
                }
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (outbound_1_1 && !outbound_1_1.done && (_c = outbound_1.return)) _c.call(outbound_1);
            }
            finally { if (e_1) throw e_1.error; }
        }
    }
    var e_1, _c;
}
/**
 * Helper function to walk 'data' according to the given path
 * and try to recreate sparse array when encounter 'null' in array along
 * the path.
 *
 * The function assumes that the given data already has the shape of the path
 * For example:
 *    path -> ['one', 0, 'two', 1] will be with
 *    data ->
 *    { one: [
 *        two: [null, <some data>]
 *    ]}
 *
 * This is garunteed to be such a case because when we extract sparse array,
 * we will set 'undefined' as value of an array which will then be
 * JSON.stringify to 'null' and will preserve the structure along the path
 *
 */
function tryRestoreSparseArray(data, possibleSparseArrayPaths, idx) {
    if (data === undefined) {
        // There should never be 'undefined'
        throw new Error("Unexpected 'undefined' in the path [" + possibleSparseArrayPaths + "] at index " + idx);
    }
    if (idx >= possibleSparseArrayPaths.length || data === null || util_1.isScalar(data)) {
        return;
    }
    var prop = possibleSparseArrayPaths[idx];
    if (Array.isArray(data) && typeof prop === 'number' && data[prop] === null) {
        // truely make it sparse rather than just set "undefined'"
        delete data[prop];
        return;
    }
    tryRestoreSparseArray(data[prop], possibleSparseArrayPaths, idx + 1);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVzdG9yZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbInJlc3RvcmUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEsc0NBQXlDO0FBQ3pDLGtEQUFxRDtBQUVyRCxrREFBaUQ7QUFFakQsa0RBQWtFO0FBQ2xFLGtDQUFzRTtBQUN0RSxrRUFBaUU7QUFHakUsZ0NBQXVEO0FBRXZEOzs7Ozs7Ozs7O0dBVUc7QUFDSCxpQkFBd0IsZUFBMkMsRUFBRSxZQUEwQjtJQUN2RixJQUFBLDREQUFxRixFQUFuRixzQkFBUSxFQUFFLGdDQUFhLENBQTZEO0lBQzVGLElBQU0sYUFBYSxHQUFHLElBQUksNkJBQWEsQ0FBQyxRQUFRLENBQUMsQ0FBQztJQUVsRCxPQUFPO1FBQ0wsYUFBYSxFQUFFLElBQUksNkJBQWEsQ0FBQyxhQUFhLEVBQUUsYUFBYSxFQUFFLElBQUksNkNBQXFCLEVBQUUsQ0FBQztRQUMzRixhQUFhLGVBQUE7S0FDZCxDQUFDO0FBQ0osQ0FBQztBQVJELDBCQVFDO0FBRUQsa0NBQWtDLGVBQTJDLEVBQUUsWUFBMEI7SUFDdkcsSUFBTSxRQUFRLEdBQW9CLE1BQU0sQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUM7SUFDdEQsSUFBTSxhQUFhLEdBQUcsSUFBSSxHQUFHLEVBQVUsQ0FBQztJQUV4QywyQ0FBMkM7SUFDM0MsS0FBSyxJQUFNLE1BQU0sSUFBSSxlQUFlLEVBQUU7UUFDOUIsSUFBQSw0QkFBMkQsRUFBekQsY0FBSSxFQUFFLGNBQUksRUFBRSxvQkFBTyxFQUFFLHNCQUFRLENBQTZCO1FBRWxFLElBQUksWUFBWSxTQUFBLENBQUM7UUFDakIsUUFBUSxJQUFJLEVBQUU7WUFDWjtnQkFDRSxZQUFZLEdBQUcsSUFBSSxzQkFBYyxDQUFDLElBQWtCLEVBQUUsT0FBTyxFQUFFLFFBQVEsQ0FBQyxDQUFDO2dCQUN6RSxNQUFNO1lBQ1I7Z0JBQ0UsWUFBWSxHQUFHLElBQUksa0NBQTBCLENBQUMsSUFBaUIsRUFBRSxPQUFPLEVB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