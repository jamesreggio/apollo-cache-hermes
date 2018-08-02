"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var Transaction_1 = require("./apollo/Transaction");
var CacheSnapshot_1 = require("./CacheSnapshot");
var nodes_1 = require("./nodes");
var operations_1 = require("./operations");
var schema_1 = require("./schema");
var util_1 = require("./util");
/**
 * Collects a set of edits against a version of the cache, eventually committing
 * them in the form of a new cache snapshot.
 *
 * If a ChangeId is provided, edits will be made on top of the optimistic state
 * (an optimistic update).  Otherwise edits are made against the baseline state.
 */
var CacheTransaction = /** @class */ (function () {
    function CacheTransaction(_context, _snapshot, _optimisticChangeId) {
        this._context = _context;
        this._snapshot = _snapshot;
        this._optimisticChangeId = _optimisticChangeId;
        /** The set of nodes edited throughout the transaction. */
        this._editedNodeIds = new Set();
        /** All edits made throughout the transaction. */
        this._deltas = [];
        /** All queries written during the transaction. */
        this._writtenQueries = new Set();
        this._parentSnapshot = _snapshot;
    }
    CacheTransaction.prototype.isOptimisticTransaction = function () {
        return this._optimisticChangeId ? true : undefined;
    };
    CacheTransaction.prototype.transformDocument = function (document) {
        return this._context.transformDocument(document);
    };
    /**
     * Executes reads against the current values in the transaction.
     */
    CacheTransaction.prototype.read = function (query) {
        return operations_1.read(this._context, query, this._optimisticChangeId ? this._snapshot.optimistic : this._snapshot.baseline);
    };
    /**
     * Merges a payload with the current values in the transaction.
     *
     * If this is an optimistic transaction, edits will be made directly on top of
     * any previous optimistic values.  Otherwise, edits will be made to the
     * baseline state (and any optimistic updates will be replayed over it).
     */
    CacheTransaction.prototype.write = function (query, payload) {
        if (this._optimisticChangeId) {
            this._writeOptimistic(query, payload);
        }
        else {
            this._writeBaseline(query, payload);
        }
    };
    /**
     * Roll back a previously enqueued optimistic update.
     */
    CacheTransaction.prototype.rollback = function (changeId) {
        var current = this._snapshot;
        var optimisticQueue = current.optimisticQueue.remove(changeId);
        current.optimisticQueue = optimisticQueue;
        var optimistic = this._buildOptimisticSnapshot(current.baseline);
        // Invalidate all IDs from the soon-to-be previous optimistic snapshot,
        // since we don't know which IDs were changed by the one we're rolling back.
        var allIds = new Set(current.optimistic.allNodeIds());
        util_1.addToSet(this._editedNodeIds, allIds);
        this._snapshot = new CacheSnapshot_1.CacheSnapshot(current.baseline, optimistic, optimisticQueue);
    };
    /**
     * Removes values from the current transaction
     */
    // eslint-disable-next-line class-methods-use-this
    CacheTransaction.prototype.evict = function (_query) {
        throw new Error('evict() is not implemented on CacheTransaction');
    };
    /**
     * Complete the transaction, returning the new snapshot and the ids of any
     * nodes that were edited.
     */
    CacheTransaction.prototype.commit = function () {
        this._triggerEntityUpdaters();
        var snapshot = this._snapshot;
        if (this._optimisticChangeId) {
            snapshot = new CacheSnapshot_1.CacheSnapshot(snapshot.baseline, snapshot.optimistic, snapshot.optimisticQueue.enqueue(this._optimisticChangeId, this._deltas));
        }
        return { snapshot: snapshot, editedNodeIds: this._editedNodeIds, writtenQueries: this._writtenQueries };
    };
    CacheTransaction.prototype.getPreviousNodeSnapshot = function (nodeId) {
        var prevSnapshot = this._optimisticChangeId ? this._parentSnapshot.optimistic : this._parentSnapshot.baseline;
        return prevSnapshot.getNodeSnapshot(nodeId);
    };
    CacheTransaction.prototype.getCurrentNodeSnapshot = function (nodeId) {
        var currentSnapshot = this._optimisticChangeId ? this._snapshot.optimistic : this._snapshot.baseline;
        return currentSnapshot.getNodeSnapshot(nodeId);
    };
    /**
     * Emits change events for any callbacks configured via
     * CacheContext#entityUpdaters.
     */
    CacheTransaction.prototype._triggerEntityUpdaters = function () {
        var entityUpdaters = this._context.entityUpdaters;
        if (!Object.keys(entityUpdaters).length)
            return;
        // Capture a static set of nodes, as the updaters may add to _editedNodeIds.
        var nodesToEmit = [];
        try {
            for (var _a = tslib_1.__values(this._editedNodeIds), _b = _a.next(); !_b.done; _b = _a.next()) {
                var nodeId = _b.value;
                var node = this.getCurrentNodeSnapshot(nodeId);
                var previous = this.getPreviousNodeSnapshot(nodeId);
                // One of them may be undefined; but we are guaranteed that both represent
                // the same entity.
                var either = node || previous;
                if (!(either instanceof nodes_1.EntitySnapshot))
                    continue; // Only entities
                var typeName = util_1.isObject(either.data) && either.data.__typename;
                if (!typeName && nodeId === schema_1.StaticNodeId.QueryRoot) {
                    typeName = 'Query';
                }
                if (!typeName)
                    continue; // Must have a typename for now.
                var updater = entityUpdaters[typeName];
                if (!updater)
                    continue;
                nodesToEmit.push({
                    updater: updater,
                    node: node && node.data,
                    previous: previous && previous.data,
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
        if (!nodesToEmit.length)
            return;
        // TODO: This is weirdly the only place where we assume an Apollo interface.
        // Can we clean this up? :(
        var dataProxy = new Transaction_1.ApolloTransaction(this);
        try {
            for (var nodesToEmit_1 = tslib_1.__values(nodesToEmit), nodesToEmit_1_1 = nodesToEmit_1.next(); !nodesToEmit_1_1.done; nodesToEmit_1_1 = nodesToEmit_1.next()) {
                var _d = nodesToEmit_1_1.value, updater = _d.updater, node = _d.node, previous = _d.previous;
                updater(dataProxy, node, previous);
            }
        }
        catch (e_2_1) { e_2 = { error: e_2_1 }; }
        finally {
            try {
                if (nodesToEmit_1_1 && !nodesToEmit_1_1.done && (_e = nodesToEmit_1.return)) _e.call(nodesToEmit_1);
            }
            finally { if (e_2) throw e_2.error; }
        }
        var e_1, _c, e_2, _e;
    };
    /**
     * Merge a payload with the baseline snapshot.
     */
    CacheTransaction.prototype._writeBaseline = function (query, payload) {
        var current = this._snapshot;
        var _a = operations_1.write(this._context, current.baseline, query, payload), baseline = _a.snapshot, editedNodeIds = _a.editedNodeIds, writtenQueries = _a.writtenQueries;
        util_1.addToSet(this._editedNodeIds, editedNodeIds);
        util_1.addToSet(this._writtenQueries, writtenQueries);
        var optimistic = this._buildOptimisticSnapshot(baseline);
        this._snapshot = new CacheSnapshot_1.CacheSnapshot(baseline, optimistic, current.optimisticQueue);
    };
    /**
     * Given a baseline snapshot, build an optimistic one from it.
     */
    CacheTransaction.prototype._buildOptimisticSnapshot = function (baseline) {
        var optimisticQueue = this._snapshot.optimisticQueue;
        if (!optimisticQueue.hasUpdates())
            return baseline;
        var _a = optimisticQueue.apply(this._context, baseline), snapshot = _a.snapshot, editedNodeIds = _a.editedNodeIds;
        util_1.addToSet(this._editedNodeIds, editedNodeIds);
        return snapshot;
    };
    /**
     * Merge a payload with the optimistic snapshot.
     */
    CacheTransaction.prototype._writeOptimistic = function (query, payload) {
        this._deltas.push({ query: query, payload: payload });
        var _a = operations_1.write(this._context, this._snapshot.optimistic, query, payload), optimistic = _a.snapshot, editedNodeIds = _a.editedNodeIds, writtenQueries = _a.writtenQueries;
        util_1.addToSet(this._writtenQueries, writtenQueries);
        util_1.addToSet(this._editedNodeIds, editedNodeIds);
        this._snapshot = new CacheSnapshot_1.CacheSnapshot(this._snapshot.baseline, optimistic, this._snapshot.optimisticQueue);
    };
    return CacheTransaction;
}());
exports.CacheTransaction = CacheTransaction;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQ2FjaGVUcmFuc2FjdGlvbi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIkNhY2hlVHJhbnNhY3Rpb24udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEsb0RBQXlEO0FBQ3pELGlEQUFnRDtBQUdoRCxpQ0FBdUQ7QUFDdkQsMkNBQTJDO0FBRzNDLG1DQUEwRztBQUMxRywrQkFBMEQ7QUFFMUQ7Ozs7OztHQU1HO0FBQ0g7SUFjRSwwQkFDVSxRQUFzQixFQUN0QixTQUF3QixFQUN4QixtQkFBOEI7UUFGOUIsYUFBUSxHQUFSLFFBQVEsQ0FBYztRQUN0QixjQUFTLEdBQVQsU0FBUyxDQUFlO1FBQ3hCLHdCQUFtQixHQUFuQixtQkFBbUIsQ0FBVztRQWZ4QywwREFBMEQ7UUFDbEQsbUJBQWMsR0FBRyxJQUFJLEdBQUcsRUFBVSxDQUFDO1FBRTNDLGlEQUFpRDtRQUN6QyxZQUFPLEdBQW9CLEVBQUUsQ0FBQztRQUV0QyxrREFBa0Q7UUFDMUMsb0JBQWUsR0FBRyxJQUFJLEdBQUcsRUFBcUIsQ0FBQztRQVVyRCxJQUFJLENBQUMsZUFBZSxHQUFHLFNBQVMsQ0FBQztJQUNuQyxDQUFDO0lBRUQsa0RBQXVCLEdBQXZCO1FBQ0UsT0FBTyxJQUFJLENBQUMsbUJBQW1CLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDO0lBQ3JELENBQUM7SUFFRCw0Q0FBaUIsR0FBakIsVUFBa0IsUUFBc0I7UUFDdEMsT0FBTyxJQUFJLENBQUMsUUFBUSxDQUFDLGlCQUFpQixDQUFDLFFBQVEsQ0FBQyxDQUFDO0lBQ25ELENBQUM7SUFFRDs7T0FFRztJQUNILCtCQUFJLEdBQUosVUFBSyxLQUFtQjtRQUN0QixPQUFPLGlCQUFJLENBQ1QsSUFBSSxDQUFDLFFBQVEsRUFDYixLQUFLLEVBQ0wsSUFBSSxDQUFDLG1CQUFtQixDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFD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