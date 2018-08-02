"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var nodes_1 = require("../nodes");
var schema_1 = require("../schema");
var util_1 = require("../util");
/**
 * Create serializable representation of GraphSnapshot.
 *
 * The output still contains 'undefined' value as it is expected that caller
 * will perform JSON.stringify which will strip off 'undefined' value or
 * turn it into 'null' if 'undefined' is in an array.
 *
 * @throws Will throw an error if there is no corresponding node type
 */
function extract(graphSnapshot, cacheContext) {
    var result = {};
    var entities = graphSnapshot._values;
    // We don't need to check for hasOwnProperty because data._values is
    // created with prototype of 'null'
    for (var id in entities) {
        var nodeSnapshot = entities[id];
        var outbound = nodeSnapshot.outbound, inbound = nodeSnapshot.inbound;
        var type = void 0;
        if (nodeSnapshot instanceof nodes_1.EntitySnapshot) {
            type = 0 /* EntitySnapshot */;
        }
        else if (nodeSnapshot instanceof nodes_1.ParameterizedValueSnapshot) {
            type = 1 /* ParameterizedValueSnapshot */;
        }
        else {
            throw new Error(nodeSnapshot.constructor.name + " does not have corresponding enum value in Serializable.NodeSnapshotType");
        }
        var serializedEntity = { type: type };
        if (outbound) {
            serializedEntity.outbound = outbound;
        }
        if (inbound) {
            serializedEntity.inbound = inbound;
        }
        // Extract data value
        var extractedData = extractSerializableData(graphSnapshot, nodeSnapshot);
        if (extractedData !== undefined) {
            if (cacheContext.tracer.warning) {
                try {
                    if (!schema_1.isSerializable(extractedData, /* allowUndefined */ true)) {
                        cacheContext.tracer.warning("Data at entityID " + id + " is unserializable");
                    }
                }
                catch (error) {
                    cacheContext.tracer.warning("Data at entityID " + id + " is unserializable because of stack overflow");
                    cacheContext.tracer.warning(error);
                }
            }
            serializedEntity.data = extractedData;
        }
        result[id] = serializedEntity;
    }
    return result;
}
exports.extract = extract;
function extractSerializableData(graphSnapshot, nodeSnapshot) {
    // If there is no outbound, then data is a value
    // 'data' can also be undefined or null even though there exist an
    // outbound reference (e.g referencing ParameterizedValueSnapshot).
    // We can simply skip extraction of such data.
    if (!nodeSnapshot.outbound || !nodeSnapshot.data) {
        return nodeSnapshot.data;
    }
    // Type annotation is needed otherwise type of entity.data is not nullable
    // and so does extractedData which will cause an error when we assing 'null'.
    var extractedData = nodeSnapshot.data;
    try {
        // Set all the outbound path (e.g reference) to undefined.
        for (var _a = tslib_1.__values(nodeSnapshot.outbound), _b = _a.next(); !_b.done; _b = _a.next()) {
            var outbound = _b.value;
            // Only reference to EntitySnapshot is recorded in the data property
            // So we didn't end up set the value to be 'undefined' in the output
            // in every case
            if (graphSnapshot.getNodeSnapshot(outbound.id) instanceof nodes_1.EntitySnapshot) {
                // we have to write out 'null' here to differentiate between
                // data doesn't exist and data is a reference.
                //
                // In the case of parameterized field hanging off of a root
                // the data at the ROOTQUERY node will be undefined with outbound
                // reference to the parameterized node.
                extractedData = util_1.lazyImmutableDeepSet(extractedData, nodeSnapshot.data, outbound.path, outbound.path.length === 0 ? null : undefined);
            }
        }
    }
    catch (e_1_1) { e_1 = { error: e_1_1 }; }
    finally {
        try {
            if (_b && !_b.done && (_c = _a.return)) _c.call(_a);
        }
        finally { if (e_1) throw e_1.error; }
    }
    return extractedData;
    var e_1, _c;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXh0cmFjdC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImV4dHJhY3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBRUEsa0NBQW9GO0FBRXBGLG9DQUF5RDtBQUN6RCxnQ0FBK0M7QUFFL0M7Ozs7Ozs7O0dBUUc7QUFDSCxpQkFBd0IsYUFBNEIsRUFBRSxZQUEwQjtJQUM5RSxJQUFNLE1BQU0sR0FBK0IsRUFBRSxDQUFDO0lBQzlDLElBQU0sUUFBUSxHQUFHLGFBQWEsQ0FBQyxPQUFPLENBQUM7SUFDdkMsb0VBQW9FO0lBQ3BFLG1DQUFtQztJQUNuQyxLQUFLLElBQU0sRUFBRSxJQUFJLFFBQVEsRUFBRTtRQUN6QixJQUFNLFlBQVksR0FBRyxRQUFRLENBQUMsRUFBRSxDQUFDLENBQUM7UUFDMUIsSUFBQSxnQ0FBUSxFQUFFLDhCQUFPLENBQWtCO1FBRTNDLElBQUksSUFBSSxTQUErQixDQUFDO1FBQ3hDLElBQUksWUFBWSxZQUFZLHNCQUFjLEVBQUU7WUFDMUMsSUFBSSx5QkFBK0MsQ0FBQztTQUNyRDthQUFNLElBQUksWUFBWSxZQUFZLGtDQUEwQixFQUFFO1lBQzdELElBQUkscUNBQTJELENBQUM7U0FDakU7YUFBTTtZQUNMLE1BQU0sSUFBSSxLQUFLLENBQUksWUFBWSxDQUFDLFdBQVcsQ0FBQyxJQUFJLDZFQUEwRSxDQUFDLENBQUM7U0FDN0g7UUFFRCxJQUFNLGdCQUFnQixHQUE4QixFQUFFLElBQUksTUFBQSxFQUFFLENBQUM7UUFFN0QsSUFBSSxRQUFRLEVBQUU7WUFDWixnQkFBZ0IsQ0FBQyxRQUFRLEdBQUcsUUFBUSxDQUFDO1NBQ3RDO1FBRUQsSUFBSSxPQUFPLEVBQUU7WUFDWCxnQkFBZ0IsQ0FBQyxPQUFPLEdBQUcsT0FBTyxDQUFDO1NBQ3BDO1FBRUQscUJBQXFCO1FBQ3JCLElBQU0sYUFBYSxHQUFHLHVCQUF1QixDQUFDLGFBQWEsRUFBRSxZQUFZLENBQUMsQ0FBQztRQUMzRSxJQUFJLGFBQWEsS0FBSyxTQUFTLEVBQUU7WUFDL0IsSUFBSSxZQUFZLENBQUMsTUFBTSxDQUFDLE9BQU8sRUFBRTtnQkFDL0IsSUFBSTtvQkFDRixJQUFJLENBQUMsdUJBQWMsQ0FBQyxhQUFhLEVBQUUsb0JBQW9CLENBQUMsSUFBSSxDQUFDLEVBQUU7d0JBQzdELFlBQVksQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLHNCQUFvQixFQUFFLHVCQUFvQixDQUFDLENBQUM7cUJBQ3pFO2lCQUNGO2dCQUFDLE9BQU8sS0FBSyxFQUFFO29CQUNkLFlBQVksQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLHNCQUFvQixFQUFFLGlEQUE4QyxDQUFDLENBQUM7b0JBQ2xHLFlBQVksQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFDO2lCQUNwQzthQUNGO1lBQ0QsZ0JBQWdCLENBQUMsSUFBSSxHQUFHLGFBQWEsQ0FBQztTQUN2QztRQUVELE1BQU0sQ0FBQyxFQUFFLENBQUMsR0FBRyxnQkFBZ0IsQ0FBQztLQUMvQjtJQUVELE9BQU8sTUFBTSxDQUFDO0FBQ2hCLENBQUM7QUFoREQsMEJBZ0RDO0FBRUQsaUNBQWlDLGFBQTRCLEVBQUUsWUFBMEI7SUFDdkYsZ0RBQWdEO0lBQ2hELGtFQUFrRTtJQUNsRSxtRUFBbUU7SUFDbkUsOENBQThDO0lBQzlDLElBQUksQ0FBQyxZQUFZLENBQUMsUUFBUSxJQUFJLENBQUMsWUFBWSxDQUFDLElBQUksRUFBRTtRQUNoRCxPQUFPLFlBQVksQ0FBQyxJQUFJLENBQUM7S0FDMUI7SUFFRCwwRUFBMEU7SUFDMUUsNkVBQTZFO0lBQzdFLElBQUksYUFBYSxHQUFxQixZQUFZLENBQUMsSUFBSSxDQUFDOztRQUV4RCwwREFBMEQ7UUFDMUQsS0FBdUIsSUFBQSxLQUFBLGlCQUFBLFlBQVksQ0FBQyxRQUFRLENBQUEsZ0JBQUE7WUFBdkMsSUFBTSxRQUFRLFdBQUE7WUFDakIsb0VBQW9FO1lBQ3BFLG9FQUFvRTtZQUNwRSxnQkFBZ0I7WUFDaEIsSUFBSSxhQUFhLENBQUMsZUFBZSxDQUFDLFFBQVEsQ0FBQyxFQUFFLENBQUMsWUFBWSxzQkFBYyxFQUFFO2dCQUN4RSw0REFBNEQ7Z0JBQzVELDhDQUE4QztnQkFDOUMsRUFBRTtnQkFDRiwyREFBMkQ7Z0JBQzNELGlFQUFpRTtnQkFDakUsdUNBQXVDO2dCQUN2QyxhQUFhLEdBQUcsMkJBQW9CLENBQUMsYUFBYSxFQUFFLFlBQVksQ0FBQyxJQUFJLEVBQUUsUUFBUSxDQUFDLElBQUksRUFBRSxRQUFRLENBQUMsSUFBSSxDQUFDLE1BQU0sS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUM7YUFDdEk7U0FDRjs7Ozs7Ozs7O0lBRUQsT0FBTyxhQUFhLENBQUM7O0FBQ3ZCLENBQUMifQ==