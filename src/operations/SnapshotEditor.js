"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var apollo_utilities_1 = require("apollo-utilities");
var errors_1 = require("../errors");
var GraphSnapshot_1 = require("../GraphSnapshot");
var nodes_1 = require("../nodes");
var util_1 = require("../util");
/**
 * Builds a set of changes to apply on top of an existing `GraphSnapshot`.
 *
 * Performs the minimal set of edits to generate new immutable versions of each
 * node, while preserving immutability of the parent snapshot.
 */
var SnapshotEditor = /** @class */ (function () {
    function SnapshotEditor(
    /** The configuration/context to use when editing snapshots. */
    _context, 
    /** The snapshot to base edits off of. */
    _parent) {
        this._context = _context;
        this._parent = _parent;
        /**
         * Tracks all node snapshots that have changed vs the parent snapshot.
         */
        this._newNodes = Object.create(null);
        /**
         * Tracks the nodes that have new _values_ vs the parent snapshot.
         *
         * This is a subset of the keys in `_newValues`.  The difference is all nodes
         * that have only changed references.
         */
        this._editedNodeIds = new Set();
        /**
         * Tracks the nodes that have been rebuilt, and have had all their inbound
         * references updated to point to the new value.
         */
        this._rebuiltNodeIds = new Set();
        /** The queries that were written, and should now be considered complete. */
        this._writtenQueries = new Set();
    }
    /**
     * Merge a GraphQL payload (query/fragment/etc) into the snapshot, rooted at
     * the node identified by `rootId`.
     */
    SnapshotEditor.prototype.mergePayload = function (query, payload) {
        var parsed = this._context.parseOperation(query);
        // We collect all warnings associated with this operation to avoid
        // overwhelming the log for particularly nasty payloads.
        var warnings = [];
        // First, we walk the payload and apply all _scalar_ edits, while collecting
        // all references that have changed.  Reference changes are applied later,
        // once all new nodes have been built (and we can guarantee that we're
        // referencing the correct version).
        var referenceEdits = [];
        this._mergeSubgraph({} /* visitedSubgraphs */, referenceEdits, warnings, parsed.rootId, [] /* prefixPath */, [] /* path */, parsed.parsedQuery, payload);
        // Now that we have new versions of every edited node, we can point all the
        // edited references to the correct nodes.
        //
        // In addition, this performs bookkeeping the inboundReferences of affected
        // nodes, and collects all newly orphaned nodes.
        var orphanedNodeIds = this._mergeReferenceEdits(referenceEdits);
        // Remove (garbage collect) orphaned subgraphs.
        this._removeOrphanedNodes(orphanedNodeIds);
        // The query should now be considered complete for future reads.
        this._writtenQueries.add(parsed);
        // Don't emit empty arrays for easy testing upstream.
        return warnings.length ? { warnings: warnings } : {};
    };
    /**
     * Merge a payload (subgraph) into the cache, following the parsed form of the
     * operation.
     */
    SnapshotEditor.prototype._mergeSubgraph = function (visitedSubgraphs, referenceEdits, warnings, containerId, prefixPath, path, parsed, payload) {
        // Don't trust our inputs; we can receive values that aren't JSON
        // serializable via optimistic updates.
        if (payload === undefined) {
            payload = null;
        }
        // We should only ever reach a subgraph if it is a container (object/array).
        if (typeof payload !== 'object') {
            var message = "Received a " + typeof payload + " value, but expected an object/array/null";
            throw new errors_1.InvalidPayloadError(message, prefixPath, containerId, path, payload);
        }
        // TODO(ianm): We're doing this a lot.  How much is it impacting perf?
        var previousValue = util_1.deepGet(this._getNodeData(containerId), path);
        // Recurse into arrays.
        if (Array.isArray(payload) || Array.isArray(previousValue)) {
            var previousValid = util_1.isNil(previousValue) || Array.isArray(previousValue);
            var payloadValid = util_1.isNil(payload) || Array.isArray(payload);
            if (!previousValid) {
                var message = "Unsupported transition from a non-list to list value";
                var error = new errors_1.InvalidPayloadError(message, prefixPath, containerId, path, payload);
                warnings.push(error.message);
            }
            if (!payloadValid) {
                var message = "Unsupported transition from a list to a non-list value";
                var error = new errors_1.InvalidPayloadError(message, prefixPath, containerId, path, payload);
                warnings.push(error.message);
            }
            if (payloadValid) {
                this._mergeArraySubgraph(visitedSubgraphs, referenceEdits, warnings, containerId, prefixPath, path, parsed, payload, previousValid ? previousValue : null);
                return;
            }
        }
        var payloadId = this._context.entityIdForValue(payload);
        var previousId = this._context.entityIdForValue(previousValue);
        // TODO(jamesreggio): Does `excluded` need to evaluated before this?
        // Is this an identity change?
        if (payloadId !== previousId) {
            // It is invalid to transition from a *value* with an id to one without.
            if (!util_1.isNil(payload) && !payloadId) {
                var message = "Unsupported transition from an entity to a non-entity value";
                var error = new errors_1.InvalidPayloadError(message, prefixPath, containerId, path, payload);
                warnings.push(error.message);
            }
            // The reverse is also invalid.
            if (!util_1.isNil(previousValue) && !previousId) {
                var message = "Unsupported transition from a non-entity value to an entity";
                var error = new errors_1.InvalidPayloadError(message, prefixPath, containerId, path, payload);
                warnings.push(error.message);
            }
            // Double check that our id generator is behaving properly.
            if (payloadId && util_1.isNil(payload)) {
                throw new errors_1.OperationError("entityIdForNode emitted an id for a nil payload value", prefixPath, containerId, path, payload);
            }
            // Fix references. See: orphan node tests on "orphan a subgraph" The new
            // value is null and the old value is an entity. We will want to remove
            // reference to such entity
            referenceEdits.push({
                containerId: containerId,
                path: path,
                prevNodeId: previousId,
                nextNodeId: payloadId,
            });
            // Nothing more to do here; the reference edit will null out this field.
            if (!payloadId)
                return;
            // End of the line for a non-reference.
        }
        else if (util_1.isNil(payload)) {
            if (previousValue !== null) {
                this._setValue(containerId, path, null, true);
            }
            return;
        }
        // Return early if we've already written payloadId with the given query.
        if (payloadId) {
            if (!visitedSubgraphs[payloadId]) {
                visitedSubgraphs[payloadId] = new Set();
            }
            if (visitedSubgraphs[payloadId].has(parsed)) {
                return;
            }
            visitedSubgraphs[payloadId].add(parsed);
        }
        // If we've entered a new node; it becomes our container.
        if (payloadId) {
            prefixPath = tslib_1.__spread(prefixPath, path);
            containerId = payloadId;
            path = [];
        }
        // Finally, we can walk into individual values.
        for (var payloadName in parsed) {
            var node = parsed[payloadName];
            if (node.excluded) {
                continue;
            }
            // Having a schemaName on the node implies that payloadName is an alias.
            var schemaName = node.schemaName ? node.schemaName : payloadName;
            var fieldValue = util_1.deepGet(payload, [payloadName]);
            // Don't trust our inputs.  Ensure that missing values are null.
            if (fieldValue === undefined) {
                fieldValue = null;
                // And if it was explicitly undefined, that likely indicates a malformed
                // input (mutation, direct write).
                if (payload && payloadName in payload) {
                    warnings.push("Encountered undefined at " + tslib_1.__spread(prefixPath, path).join('.') + ". Treating as null");
                }
            }
            var containerIdForField = containerId;
            // For static fields, we append the current cacheKey to create a new path
            // to the field.
            //
            //   user: {
            //     name: 'Bob',   -> fieldPath: ['user', 'name']
            //     address: {     -> fieldPath: ['user', 'address']
            //       city: 'A',   -> fieldPath: ['user', 'address', 'city']
            //       state: 'AB', -> fieldPath: ['user', 'address', 'state']
            //     },
            //     info: {
            //       id: 0,       -> fieldPath: ['id']
            //       prop1: 'hi'  -> fieldPath: ['prop1']
            //     },
            //     history: [
            //       {
            //         postal: 123 -> fieldPath: ['user', 'history', 0, 'postal']
            //       },
            //       {
            //         postal: 456 -> fieldPath: ['user', 'history', 1, 'postal']
            //       }
            //     ],
            //     phone: [
            //       '1234', -> fieldPath: ['user', 0]
            //       '5678', -> fieldPath: ['user', 1]
            //     ],
            //   },
            //
            // Similarly, something to keep in mind is that parameterized nodes
            // (instances of ParameterizedValueSnapshot) can have direct references to
            // an entity node's value.
            //
            // For example, with the query:
            //
            //   foo(id: 1) { id, name }
            //
            // The cache would have:
            //
            //   1: {
            //     data: { id: 1, name: 'Foo' },
            //   },
            //   'ROOT_QUERY❖["foo"]❖{"id":1}': {
            //     data: // a direct reference to the node of entity '1'.
            //   },
            //
            // This allows us to rely on standard behavior for entity references: If
            // node '1' is edited, the parameterized node must also be edited.
            // Similarly, the parameterized node contains an outbound reference to the
            // entity node, for garbage collection.
            var fieldPrefixPath = prefixPath;
            var fieldPath = tslib_1.__spread(path, [schemaName]);
            if (node.args) {
                // The values of a parameterized field are explicit nodes in the graph;
                // so we set up a new container & path.
                containerIdForField = this._ensureParameterizedValueSnapshot(containerId, fieldPath, node.args);
                fieldPrefixPath = tslib_1.__spread(prefixPath, fieldPath);
                fieldPath = [];
            }
            // Note that we're careful to fetch the value of our new container; not
            // the outer container.
            var previousFieldValue = util_1.deepGet(this._getNodeData(containerIdForField), fieldPath);
            // For fields with sub selections, we walk into them; only leaf fields are
            // directly written via _setValue.  This allows us to perform minimal
            // edits to the graph.
            if (node.children) {
                this._mergeSubgraph(visitedSubgraphs, referenceEdits, warnings, containerIdForField, fieldPrefixPath, fieldPath, node.children, fieldValue);
                // We've hit a leaf field.
                //
                // Note that we must perform a _deep_ equality check here, to cover cases
                // where a leaf value is a complex object.
            }
            else if (!apollo_utilities_1.isEqual(fieldValue, previousFieldValue)) {
                // We intentionally do not deep copy the nodeValue as Apollo will
                // then perform Object.freeze anyway. So any change in the payload
                // value afterward will be reflect in the graph as well.
                //
                // We use selection.name.value instead of payloadKey so that we
                // always write to cache using real field name rather than alias
                // name.
                this._setValue(containerIdForField, fieldPath, fieldValue);
            }
        }
    };
    /**
     * Merge an array from the payload (or previous cache data).
     */
    SnapshotEditor.prototype._mergeArraySubgraph = function (visitedSubgraphs, referenceEdits, warnings, containerId, prefixPath, path, parsed, payload, previousValue) {
        if (util_1.isNil(payload)) {
            // Note that we mark this as an edit, as this method is only ever called
            // if we've determined the value to be an array (which means that
            // previousValue MUST be an array in this case).
            this._setValue(containerId, path, null, true);
            return;
        }
        var payloadLength = payload ? payload.length : 0;
        var previousLength = previousValue ? previousValue.length : 0;
        // Note that even though we walk into arrays, we need to be
        // careful to ensure that we don't leave stray values around if
        // the new array is of a different length.
        //
        // So, we resize the array to our desired size before walking.
        if (payloadLength !== previousLength || !previousValue) {
            var newArray = Array.isArray(previousValue)
                ? previousValue.slice(0, payloadLength) : new Array(payloadLength);
            this._setValue(containerId, path, newArray);
            // Drop any extraneous references.
            if (payloadLength < previousLength) {
                this._removeArrayReferences(referenceEdits, containerId, path, payloadLength - 1);
            }
        }
        // Note that we're careful to iterate over all indexes, in case this is a
        // sparse array.
        for (var i = 0; i < payload.length; i++) {
            var childPayload = payload[i];
            if (childPayload === undefined) {
                // Undefined values in an array are strictly invalid; and likely
                // indicate a malformed input (mutation, direct write).
                childPayload = null;
                if (i in payload) {
                    warnings.push("Encountered undefined at " + tslib_1.__spread(path, [i]).join('.') + ". Treating as null");
                }
                else {
                    warnings.push("Encountered hole in array at " + tslib_1.__spread(path, [i]).join('.') + ". Filling with null");
                }
            }
            this._mergeSubgraph(visitedSubgraphs, referenceEdits, warnings, containerId, prefixPath, tslib_1.__spread(path, [i]), parsed, childPayload);
        }
    };
    /**
     *
     */
    SnapshotEditor.prototype._removeArrayReferences = function (referenceEdits, containerId, prefix, afterIndex) {
        var container = this._getNodeSnapshot(containerId);
        if (!container || !container.outbound)
            return;
        try {
            for (var _a = tslib_1.__values(container.outbound), _b = _a.next(); !_b.done; _b = _a.next()) {
                var reference = _b.value;
                if (!util_1.pathBeginsWith(reference.path, prefix))
                    continue;
                var index = reference.path[prefix.length];
                if (typeof index !== 'number')
                    continue;
                if (index <= afterIndex)
                    continue;
                // At this point, we've got a reference beyond the array's new bounds.
                referenceEdits.push({
                    containerId: containerId,
                    path: reference.path,
                    prevNodeId: reference.id,
                    nextNodeId: undefined,
                    noWrite: true,
                });
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (_b && !_b.done && (_c = _a.return)) _c.call(_a);
            }
            finally { if (e_1) throw e_1.error; }
        }
        var e_1, _c;
    };
    /**
     * Update all nodes with edited references, and ensure that the bookkeeping of
     * the new and _past_ references are properly updated.
     *
     * Returns the set of node ids that are newly orphaned by these edits.
     */
    SnapshotEditor.prototype._mergeReferenceEdits = function (referenceEdits) {
        var orphanedNodeIds = new Set();
        try {
            for (var referenceEdits_1 = tslib_1.__values(referenceEdits), referenceEdits_1_1 = referenceEdits_1.next(); !referenceEdits_1_1.done; referenceEdits_1_1 = referenceEdits_1.next()) {
                var _a = referenceEdits_1_1.value, containerId = _a.containerId, path = _a.path, prevNodeId = _a.prevNodeId, nextNodeId = _a.nextNodeId, noWrite = _a.noWrite;
                if (!noWrite) {
                    var target = nextNodeId ? this._getNodeData(nextNodeId) : null;
                    this._setValue(containerId, path, target);
                }
                var container = this._ensureNewSnapshot(containerId);
                if (prevNodeId) {
                    util_1.removeNodeReference('outbound', container, prevNodeId, path);
                    var prevTarget = this._ensureNewSnapshot(prevNodeId);
                    util_1.removeNodeReference('inbound', prevTarget, containerId, path);
                    if (!prevTarget.inbound) {
                        orphanedNodeIds.add(prevNodeId);
                    }
                }
                if (nextNodeId) {
                    util_1.addNodeReference('outbound', container, nextNodeId, path);
                    var nextTarget = this._ensureNewSnapshot(nextNodeId);
                    util_1.addNodeReference('inbound', nextTarget, containerId, path);
                    orphanedNodeIds.delete(nextNodeId);
                }
            }
        }
        catch (e_2_1) { e_2 = { error: e_2_1 }; }
        finally {
            try {
                if (referenceEdits_1_1 && !referenceEdits_1_1.done && (_b = referenceEdits_1.return)) _b.call(referenceEdits_1);
            }
            finally { if (e_2) throw e_2.error; }
        }
        return orphanedNodeIds;
        var e_2, _b;
    };
    /**
     * Commits the transaction, returning a new immutable snapshot.
     */
    SnapshotEditor.prototype.commit = function () {
        // At this point, every node that has had any of its properties change now
        // exists in _newNodes.  In order to preserve immutability, we need to walk
        // all nodes that transitively reference an edited node, and update their
        // references to point to the new version.
        this._rebuildInboundReferences();
        var snapshot = this._buildNewSnapshot();
        if (this._context.freezeSnapshots) {
            snapshot.freeze();
        }
        return {
            snapshot: snapshot,
            editedNodeIds: this._editedNodeIds,
            writtenQueries: this._writtenQueries,
        };
    };
    /**
     * Collect all our pending changes into a new GraphSnapshot.
     */
    SnapshotEditor.prototype._buildNewSnapshot = function () {
        var entityTransformer = this._context.entityTransformer;
        var snapshots = tslib_1.__assign({}, this._parent._values);
        for (var id in this._newNodes) {
            var newSnapshot = this._newNodes[id];
            // Drop snapshots that were garbage collected.
            if (newSnapshot === undefined) {
                delete snapshots[id];
            }
            else {
                // TODO: This should not be run for ParameterizedValueSnapshots
                if (entityTransformer) {
                    var data = this._newNodes[id].data;
                    if (data)
                        entityTransformer(data);
                }
                snapshots[id] = newSnapshot;
            }
        }
        return new GraphSnapshot_1.GraphSnapshot(snapshots);
    };
    /**
     * Transitively walks the inbound references of all edited nodes, rewriting
     * those references to point to the newly edited versions.
     */
    SnapshotEditor.prototype._rebuildInboundReferences = function () {
        var queue = Array.from(this._editedNodeIds);
        util_1.addToSet(this._rebuiltNodeIds, queue);
        while (queue.length) {
            var nodeId = queue.pop();
            var snapshot = this._getNodeSnapshot(nodeId);
            if (!(snapshot instanceof nodes_1.EntitySnapshot))
                continue;
            if (!snapshot || !snapshot.inbound)
                continue;
            try {
                for (var _a = tslib_1.__values(snapshot.inbound), _b = _a.next(); !_b.done; _b = _a.next()) {
                    var _c = _b.value, id = _c.id, path = _c.path;
                    this._setValue(id, path, snapshot.data, false);
                    if (this._rebuiltNodeIds.has(id))
                        continue;
                    this._rebuiltNodeIds.add(id);
                    queue.push(id);
                }
            }
            catch (e_3_1) { e_3 = { error: e_3_1 }; }
            finally {
                try {
                    if (_b && !_b.done && (_d = _a.return)) _d.call(_a);
                }
                finally { if (e_3) throw e_3.error; }
            }
        }
        var e_3, _d;
    };
    /**
     * Transitively removes all orphaned nodes from the graph.
     */
    SnapshotEditor.prototype._removeOrphanedNodes = function (nodeIds) {
        var queue = Array.from(nodeIds);
        while (queue.length) {
            var nodeId = queue.pop();
            var node = this._getNodeSnapshot(nodeId);
            if (!node)
                continue;
            this._newNodes[nodeId] = undefined;
            this._editedNodeIds.add(nodeId);
            if (!node.outbound)
                continue;
            try {
                for (var _a = tslib_1.__values(node.outbound), _b = _a.next(); !_b.done; _b = _a.next()) {
                    var _c = _b.value, id = _c.id, path = _c.path;
                    var reference = this._ensureNewSnapshot(id);
                    if (util_1.removeNodeReference('inbound', reference, nodeId, path)) {
                        queue.push(id);
                    }
                }
            }
            catch (e_4_1) { e_4 = { error: e_4_1 }; }
            finally {
                try {
                    if (_b && !_b.done && (_d = _a.return)) _d.call(_a);
                }
                finally { if (e_4) throw e_4.error; }
            }
        }
        var e_4, _d;
    };
    /**
     * Retrieve the _latest_ version of a node snapshot.
     */
    SnapshotEditor.prototype._getNodeSnapshot = function (id) {
        return id in this._newNodes ? this._newNodes[id] : this._parent.getNodeSnapshot(id);
    };
    /**
     * Retrieve the _latest_ version of a node.
     */
    SnapshotEditor.prototype._getNodeData = function (id) {
        var snapshot = this._getNodeSnapshot(id);
        return snapshot ? snapshot.data : undefined;
    };
    /**
     * Set `newValue` at `path` of the value snapshot identified by `id`, without
     * modifying the parent's copy of it.
     *
     * This will not shallow clone objects/arrays along `path` if they were
     * previously cloned during this transaction.
     */
    SnapshotEditor.prototype._setValue = function (id, path, newValue, isEdit) {
        if (isEdit === void 0) { isEdit = true; }
        if (isEdit) {
            this._editedNodeIds.add(id);
        }
        var parent = this._parent.getNodeSnapshot(id);
        var current = this._ensureNewSnapshot(id);
        current.data = util_1.lazyImmutableDeepSet(current.data, parent && parent.data, path, newValue);
    };
    /**
     * Ensures that we have built a new version of a snapshot for node `id` (and
     * that it is referenced by `_newNodes`).
     */
    SnapshotEditor.prototype._ensureNewSnapshot = function (id) {
        var parent;
        if (id in this._newNodes) {
            return this._newNodes[id];
        }
        else {
            parent = this._parent.getNodeSnapshot(id);
        }
        // TODO: We're assuming that the only time we call _ensureNewSnapshot when
        // there is no parent is when the node is an entity.  Can we enforce it, or
        // pass a type through?
        var newSnapshot = parent ? nodes_1.cloneNodeSnapshot(parent) : new nodes_1.EntitySnapshot();
        this._newNodes[id] = newSnapshot;
        return newSnapshot;
    };
    /**
     * Ensures that there is a ParameterizedValueSnapshot for the given node with
     * arguments
     */
    SnapshotEditor.prototype._ensureParameterizedValueSnapshot = function (containerId, path, args) {
        var fieldId = nodeIdForParameterizedValue(containerId, path, args);
        // We're careful to not edit the container unless we absolutely have to.
        // (There may be no changes for this parameterized value).
        var containerSnapshot = this._getNodeSnapshot(containerId);
        if (!containerSnapshot || !util_1.hasNodeReference(containerSnapshot, 'outbound', fieldId, path)) {
            // We need to construct a new snapshot otherwise.
            var newSnapshot = new nodes_1.ParameterizedValueSnapshot();
            util_1.addNodeReference('inbound', newSnapshot, containerId, path);
            this._newNodes[fieldId] = newSnapshot;
            // Ensure that the container points to it.
            util_1.addNodeReference('outbound', this._ensureNewSnapshot(containerId), fieldId, path);
        }
        return fieldId;
    };
    return SnapshotEditor;
}());
exports.SnapshotEditor = SnapshotEditor;
/**
 * Generate a stable id for a parameterized value.
 */
function nodeIdForParameterizedValue(containerId, path, args) {
    return containerId + "\u2756" + JSON.stringify(path) + "\u2756" + JSON.stringify(args);
}
exports.nodeIdForParameterizedValue = nodeIdForParameterizedValue;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiU25hcHNob3RFZGl0b3IuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJTbmFwc2hvdEVkaXRvci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSxxREFBMkM7QUFHM0Msb0NBQWdFO0FBQ2hFLGtEQUFpRDtBQUNqRCxrQ0FBdUc7QUFJdkcsZ0NBU2lCO0FBZ0NqQjs7Ozs7R0FLRztBQUNIO0lBd0JFO0lBQ0UsK0RBQStEO0lBQ3ZELFFBQXNCO0lBQzlCLHlDQUF5QztJQUNqQyxPQUFzQjtRQUZ0QixhQUFRLEdBQVIsUUFBUSxDQUFjO1FBRXRCLFlBQU8sR0FBUCxPQUFPLENBQWU7UUExQmhDOztXQUVHO1FBQ0ssY0FBUyxHQUFvQixNQUFNLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDO1FBRXpEOzs7OztXQUtHO1FBQ0ssbUJBQWMsR0FBRyxJQUFJLEdBQUcsRUFBVSxDQUFDO1FBRTNDOzs7V0FHRztRQUNLLG9CQUFlLEdBQUcsSUFBSSxHQUFHLEVBQVUsQ0FBQztRQUU1Qyw0RUFBNEU7UUFDcEUsb0JBQWUsR0FBRyxJQUFJLEdBQUcsRUFBcUIsQ0FBQztJQU9wRCxDQUFDO0lBRUo7OztPQUdHO0lBQ0gscUNBQVksR0FBWixVQUFhLEtBQW1CLEVBQUUsT0FBbUI7UUFDbkQsSUFBTSxNQUFNLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxjQUFjLENBQUMsS0FBSyxDQUFDLENBQUM7UUFFbkQsa0VBQWtFO1FBQ2xFLHdEQUF3RDtRQUN4RCxJQUFNLFFBQVEsR0FBYSxFQUFFLENBQUM7UUFFOUIsNEVBQTRFO1FBQzVFLDBFQUEwRTtRQUMxRSxzRUFBc0U7UUFDdEUsb0NBQW9DO1FBQ3BDLElBQU0sY0FBYyxHQUFvQixFQUFFLENBQUM7UUFDM0MsSUFBSSxDQUFDLGNBQWMsQ0FDakIsRUFBRSxDQUFDLHNCQUFzQixFQUN6QixjQUFjLEVBQ2QsUUFBUSxFQUNSLE1BQU0sQ0FBQyxNQUFNLEVBQ2IsRUFBRSxDQUFDLGdCQUFnQixFQUNu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