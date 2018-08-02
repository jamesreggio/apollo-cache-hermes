"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var CacheSnapshot_1 = require("./CacheSnapshot");
var CacheTransaction_1 = require("./CacheTransaction");
var context_1 = require("./context");
var GraphSnapshot_1 = require("./GraphSnapshot");
var operations_1 = require("./operations");
var OptimisticUpdateQueue_1 = require("./OptimisticUpdateQueue");
var util_1 = require("./util");
/**
 * The Hermes cache.
 *
 * @see https://github.com/apollographql/apollo-client/issues/1971
 * @see https://github.com/apollographql/apollo-client/blob/2.0-alpha/src/data/cache.ts
 */
var Cache = /** @class */ (function () {
    function Cache(config) {
        /** All active query observers. */
        this._observers = [];
        var initialGraphSnapshot = new GraphSnapshot_1.GraphSnapshot();
        this._snapshot = new CacheSnapshot_1.CacheSnapshot(initialGraphSnapshot, initialGraphSnapshot, new OptimisticUpdateQueue_1.OptimisticUpdateQueue());
        this._context = new context_1.CacheContext(config);
    }
    Cache.prototype.transformDocument = function (document) {
        return this._context.transformDocument(document);
    };
    Cache.prototype.restore = function (data, migrationMap, verifyQuery) {
        var _a = operations_1.restore(data, this._context), cacheSnapshot = _a.cacheSnapshot, editedNodeIds = _a.editedNodeIds;
        var migrated = operations_1.migrate(cacheSnapshot, migrationMap);
        if (verifyQuery && !operations_1.read(this._context, verifyQuery, migrated.baseline).complete) {
            throw new Error("Restored cache cannot satisfy the verification query");
        }
        this._setSnapshot(migrated, editedNodeIds);
    };
    Cache.prototype.extract = function (optimistic, pruneQuery) {
        var cacheSnapshot = optimistic ? this._snapshot.optimistic : this._snapshot.baseline;
        return operations_1.extract(pruneQuery ? operations_1.prune(this._context, cacheSnapshot, pruneQuery).snapshot : cacheSnapshot, this._context);
    };
    Cache.prototype.evict = function (_query) {
        throw new Error("evict() is not implemented on Cache");
    };
    /**
     * Reads the selection expressed by a query from the cache.
     *
     * TODO: Can we drop non-optimistic reads?
     * https://github.com/apollographql/apollo-client/issues/1971#issuecomment-319402170
     */
    Cache.prototype.read = function (query, optimistic) {
        // TODO: Can we drop non-optimistic reads?
        // https://github.com/apollographql/apollo-client/issues/1971#issuecomment-319402170
        return operations_1.read(this._context, query, optimistic ? this._snapshot.optimistic : this._snapshot.baseline);
    };
    /**
     * Retrieves the current value of the entity identified by `id`.
     */
    Cache.prototype.getEntity = function (id) {
        return this._snapshot.optimistic.getNodeData(id);
    };
    /**
     * Registers a callback that should be triggered any time the nodes selected
     * by a particular query have changed.
     */
    Cache.prototype.watch = function (query, callback) {
        var _this = this;
        var observer = new operations_1.QueryObserver(this._context, query, this._snapshot.optimistic, callback);
        this._observers.push(observer);
        return function () { return _this._removeObserver(observer); };
    };
    /**
     * Writes values for a selection to the cache.
     */
    Cache.prototype.write = function (query, payload) {
        this.transaction(function (t) { return t.write(query, payload); });
    };
    Cache.prototype.transaction = function (changeIdOrCallback, callback) {
        var tracer = this._context.tracer;
        var changeId;
        if (typeof callback !== 'function') {
            callback = changeIdOrCallback;
        }
        else {
            changeId = changeIdOrCallback;
        }
        var tracerContext;
        if (tracer.transactionStart) {
            tracerContext = tracer.transactionStart();
        }
        var transaction = new CacheTransaction_1.CacheTransaction(this._context, this._snapshot, changeId);
        try {
            callback(transaction);
        }
        catch (error) {
            if (tracer.transactionEnd) {
                tracer.transactionEnd(error.toString(), tracerContext);
            }
            return false;
        }
        var _a = transaction.commit(), snapshot = _a.snapshot, editedNodeIds = _a.editedNodeIds;
        this._setSnapshot(snapshot, editedNodeIds);
        if (tracer.transactionEnd) {
            tracer.transactionEnd(undefined, tracerContext);
        }
        return true;
    };
    /**
     * Roll back a previously enqueued optimistic update.
     */
    Cache.prototype.rollback = function (changeId) {
        this.transaction(function (t) { return t.rollback(changeId); });
    };
    Cache.prototype.getSnapshot = function () {
        return this._snapshot;
    };
    /**
     * Resets all data tracked by the cache.
     */
    Cache.prototype.reset = function () {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var allIds, baseline, optimistic, optimisticQueue;
            return tslib_1.__generator(this, function (_a) {
                allIds = new Set(this._snapshot.optimistic.allNodeIds());
                baseline = new GraphSnapshot_1.GraphSnapshot();
                optimistic = baseline;
                optimisticQueue = new OptimisticUpdateQueue_1.OptimisticUpdateQueue();
                this._setSnapshot(new CacheSnapshot_1.CacheSnapshot(baseline, optimistic, optimisticQueue), allIds);
                return [2 /*return*/];
            });
        });
    };
    // Internal
    /**
     * Unregister an observer.
     */
    Cache.prototype._removeObserver = function (observer) {
        var index = this._observers.findIndex(function (o) { return o === observer; });
        if (index < 0)
            return;
        this._observers.splice(index, 1);
    };
    /**
     * Point the cache to a new snapshot, and let observers know of the change.
     * Call onChange callback if one exist to notify cache users of any change.
     */
    Cache.prototype._setSnapshot = function (snapshot, editedNodeIds) {
        var lastSnapshot = this._snapshot;
        this._snapshot = snapshot;
        if (lastSnapshot) {
            _copyUnaffectedCachedReads(lastSnapshot.baseline, snapshot.baseline, editedNodeIds);
            // Don't bother copying the optimistic read cache unless it's actually a
            // different snapshot.
            if (snapshot.optimistic !== snapshot.baseline) {
                _copyUnaffectedCachedReads(lastSnapshot.optimistic, snapshot.optimistic, editedNodeIds);
            }
        }
        var tracerContext;
        if (this._context.tracer.broadcastStart) {
            tracerContext = this._context.tracer.broadcastStart({ snapshot: snapshot, editedNodeIds: editedNodeIds });
        }
        try {
            for (var _a = tslib_1.__values(this._observers), _b = _a.next(); !_b.done; _b = _a.next()) {
                var observer = _b.value;
                observer.consumeChanges(snapshot.optimistic, editedNodeIds);
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (_b && !_b.done && (_c = _a.return)) _c.call(_a);
            }
            finally { if (e_1) throw e_1.error; }
        }
        if (this._context.onChange) {
            this._context.onChange(this._snapshot, editedNodeIds);
        }
        if (this._context.tracer.broadcastEnd) {
            this._context.tracer.broadcastEnd({ snapshot: snapshot, editedNodeIds: editedNodeIds }, tracerContext);
        }
        var e_1, _c;
    };
    return Cache;
}());
exports.Cache = Cache;
/**
 * Preserves cached reads for any queries that do not overlap with the edited
 * entities in the new snapshot.
 *
 * TODO: Can we special case ROOT_QUERY somehow; any fields hanging off of it
 * tend to aggressively bust the cache, when we don't really mean to.
 */
function _copyUnaffectedCachedReads(lastSnapshot, nextSnapshot, editedNodeIds) {
    try {
        for (var _a = tslib_1.__values(lastSnapshot.readCache), _b = _a.next(); !_b.done; _b = _a.next()) {
            var _c = tslib_1.__read(_b.value, 2), operation = _c[0], result = _c[1];
            // We don't care about incomplete results.
            if (!result.complete || !('nodeIds' in result))
                continue;
            // If any nodes in the cached read were edited, do not copy.
            if (util_1.setsHaveSomeIntersection(editedNodeIds, result.nodeIds))
                continue;
            nextSnapshot.readCache.set(operation, result);
        }
    }
    catch (e_2_1) { e_2 = { error: e_2_1 }; }
    finally {
        try {
            if (_b && !_b.done && (_d = _a.return)) _d.call(_a);
        }
        finally { if (e_2) throw e_2.error; }
    }
    var e_2, _d;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQ2FjaGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJDYWNoZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFFQSxpREFBZ0Q7QUFDaEQsdURBQXNEO0FBQ3RELHFDQUF5QztBQUN6QyxpREFBZ0Q7QUFDaEQsMkNBQW1HO0FBQ25HLGlFQUFnRTtBQUloRSwrQkFBZ0U7QUFNaEU7Ozs7O0dBS0c7QUFDSDtJQVdFLGVBQVksTUFBbUM7UUFIL0Msa0NBQWtDO1FBQzFCLGVBQVUsR0FBb0IsRUFBRSxDQUFDO1FBR3ZDLElBQU0sb0JBQW9CLEdBQUcsSUFBSSw2QkFBYSxFQUFFLENBQUM7UUFDakQsSUFBSSxDQUFDLFNBQVMsR0FBRyxJQUFJLDZCQUFhLENBQUMsb0JBQW9CLEVBQUUsb0JBQW9CLEVBQUUsSUFBSSw2Q0FBcUIsRUFBRSxDQUFDLENBQUM7UUFDNUcsSUFBSSxDQUFDLFFBQVEsR0FBRyxJQUFJLHNCQUFZLENBQUMsTUFBTSxDQUFDLENBQUM7SUFDM0MsQ0FBQztJQUVELGlDQUFpQixHQUFqQixVQUFrQixRQUFzQjtRQUN0QyxPQUFPLElBQUksQ0FBQyxRQUFRLENBQUMsaUJBQWlCLENBQUMsUUFBUSxDQUFDLENBQUM7SUFDbkQsQ0FBQztJQUVELHVCQUFPLEdBQVAsVUFBUSxJQUFnQyxFQUFFLFlBQTJCLEVBQUUsV0FBMEI7UUFDekYsSUFBQSw4Q0FBK0QsRUFBN0QsZ0NBQWEsRUFBRSxnQ0FBYSxDQUFrQztRQUN0RSxJQUFNLFFBQVEsR0FBRyxvQkFBTyxDQUFDLGFBQWEsRUFBRSxZQUFZLENBQUMsQ0FBQztRQUN0RCxJQUFJLFdBQVcsSUFBSSxDQUFDLGlCQUFJLENBQUMsSUFBSSxDQUFDLFFBQVEsRUFBRSxXQUFXLEVBQUUsUUFBUSxDQUFDLFFBQVEsQ0FBQyxDQUFDLFFBQVEsRUFBRTtZQUNoRixNQUFNLElBQUksS0FBSyxDQUFDLHNEQUFzRCxDQUFDLENBQUM7U0FDekU7UUFDRCxJQUFJLENBQUMsWUFBWSxDQUFDLFFBQVEs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