"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var operations_1 = require("./operations");
/**
 * Manages a queue of optimistic updates, and the values they express on top of
 * existing cache snapshots.
 */
var OptimisticUpdateQueue = /** @class */ (function () {
    function OptimisticUpdateQueue(
    /**
     * The queue of updates, in order of oldest (lowest precedence) to newest
     * (highest precedence).
     */
    _updates) {
        if (_updates === void 0) { _updates = []; }
        this._updates = _updates;
    }
    /**
     * Appends a new optimistic update to the queue.
     */
    OptimisticUpdateQueue.prototype.enqueue = function (id, deltas) {
        // TODO: Assert unique change ids.
        return new OptimisticUpdateQueue(tslib_1.__spread(this._updates, [{ id: id, deltas: deltas }]));
    };
    /**
     * Removes an update from the queue.
     */
    OptimisticUpdateQueue.prototype.remove = function (id) {
        return new OptimisticUpdateQueue(this._updates.filter(function (u) { return u.id !== id; }));
    };
    /**
     * Whether there are any updates to apply.
     */
    OptimisticUpdateQueue.prototype.hasUpdates = function () {
        return this._updates.length > 0;
    };
    /**
     * Applies the current optimistic updates to a snapshot.
     */
    OptimisticUpdateQueue.prototype.apply = function (context, snapshot) {
        var editor = new operations_1.SnapshotEditor(context, snapshot);
        try {
            for (var _a = tslib_1.__values(this._updates), _b = _a.next(); !_b.done; _b = _a.next()) {
                var update = _b.value;
                try {
                    for (var _c = tslib_1.__values(update.deltas), _d = _c.next(); !_d.done; _d = _c.next()) {
                        var delta = _d.value;
                        editor.mergePayload(delta.query, delta.payload);
                    }
                }
                catch (e_1_1) { e_1 = { error: e_1_1 }; }
                finally {
                    try {
                        if (_d && !_d.done && (_e = _c.return)) _e.call(_c);
                    }
                    finally { if (e_1) throw e_1.error; }
                }
            }
        }
        catch (e_2_1) { e_2 = { error: e_2_1 }; }
        finally {
            try {
                if (_b && !_b.done && (_f = _a.return)) _f.call(_a);
            }
            finally { if (e_2) throw e_2.error; }
        }
        return editor.commit();
        var e_2, _f, e_1, _e;
    };
    return OptimisticUpdateQueue;
}());
exports.OptimisticUpdateQueue = OptimisticUpdateQueue;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiT3B0aW1pc3RpY1VwZGF0ZVF1ZXVlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiT3B0aW1pc3RpY1VwZGF0ZVF1ZXVlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUVBLDJDQUE4QztBQVk5Qzs7O0dBR0c7QUFDSDtJQUVFO0lBQ0U7OztPQUdHO0lBQ0ssUUFBbUM7UUFBbkMseUJBQUEsRUFBQSxXQUFXLEVBQXdCO1FBQW5DLGFBQVEsR0FBUixRQUFRLENBQTJCO0lBQzFDLENBQUM7SUFFSjs7T0FFRztJQUNILHVDQUFPLEdBQVAsVUFBUSxFQUFZLEVBQUUsTUFBdUI7UUFDM0Msa0NBQWtDO1FBQ2xDLE9BQU8sSUFBSSxxQkFBcUIsa0JBQUssSUFBSSxDQUFDLFFBQVEsR0FBRSxFQUFFLEVBQUUsSUFBQSxFQUFFLE1BQU0sUUFBQSxFQUFFLEdBQUUsQ0FBQztJQUN2RSxDQUFDO0lBRUQ7O09BRUc7SUFDSCxzQ0FBTSxHQUFOLFVBQU8sRUFBWTtRQUNqQixPQUFPLElBQUkscUJBQXFCLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsVUFBQSxDQUFDLElBQUksT0FBQSxDQUFDLENBQUMsRUFBRSxLQUFLLEVBQUUsRUFBWCxDQUFXLENBQUMsQ0FBQyxDQUFDO0lBQzNFLENBQUM7SUFFRDs7T0FFRztJQUNILDBDQUFVLEdBQVY7UUFDRSxPQUFPLElBQUksQ0FBQyxRQUFRLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQztJQUNsQyxDQUFDO0lBRUQ7O09BRUc7SUFDSCxxQ0FBSyxHQUFMLFVBQU0sT0FBcUIsRUFBRSxRQUF1QjtRQUNsRCxJQUFNLE1BQU0sR0FBRyxJQUFJLDJCQUFjLENBQUMsT0FBTyxFQUFFLFFBQVEsQ0FBQyxDQUFDOztZQUNyRCxLQUFxQixJQUFBLEtBQUEsaUJBQUEsSUFBSSxDQUFDLFFBQVEsQ0FBQSxnQkFBQTtnQkFBN0IsSUFBTSxNQUFNLFdBQUE7O29CQUNmLEtBQW9CLElBQUEsS0FBQSxpQkFBQSxNQUFNLENBQUMsTUFBTSxDQUFBLGdCQUFBO3dCQUE1QixJQUFNLEtBQUssV0FBQTt3QkFDZCxNQUFNLENBQUMsWUFBWSxDQUFDLEtBQUssQ0FBQyxLQUFLLEVBQUUsS0FBSyxDQUFDLE9BQXFCLENBQUMsQ0FBQztxQkFDL0Q7Ozs7Ozs7OzthQUNGOzs7Ozs7Ozs7UUFFRCxPQUFPLE1BQU0sQ0FBQyxNQUFNLEVBQUUsQ0FBQzs7SUFDekIsQ0FBQztJQUVILDRCQUFDO0FBQUQsQ0FBQyxBQTlDRCxJQThDQztBQTlDWSxzREFBcUIifQ==