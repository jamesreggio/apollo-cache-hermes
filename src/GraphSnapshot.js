"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var deepFreeze = require("deep-freeze-strict");
/**
 * Maintains an identity map of all value snapshots that reference into a
 * particular version of the graph.
 *
 * Provides an immutable view into the graph at a point in time.
 *
 * Also provides a place to hang per-snapshot caches off of.
 */
var GraphSnapshot = /** @class */ (function () {
    /**
     * @internal
     */
    function GraphSnapshot(
    // TODO: Profile Object.create(null) vs Map.
    _values) {
        if (_values === void 0) { _values = Object.create(null); }
        this._values = _values;
        /** Cached results for queries. */
        this.readCache = new Map();
    }
    /**
     * Retrieves the value identified by `id`.
     */
    GraphSnapshot.prototype.getNodeData = function (id) {
        var snapshot = this.getNodeSnapshot(id);
        return snapshot ? snapshot.data : undefined;
    };
    /**
     * Returns whether `id` exists as an value in the graph.
     */
    GraphSnapshot.prototype.has = function (id) {
        return id in this._values;
    };
    /**
     * Retrieves the snapshot for the value identified by `id`.
     *
     * @internal
     */
    GraphSnapshot.prototype.getNodeSnapshot = function (id) {
        return this._values[id];
    };
    /**
     * Returns the set of ids present in the snapshot.
     *
     * @internal
     */
    GraphSnapshot.prototype.allNodeIds = function () {
        return Object.keys(this._values);
    };
    /**
     * Freezes the snapshot (generally for development mode)
     *
     * @internal
     */
    GraphSnapshot.prototype.freeze = function () {
        deepFreeze(this._values);
    };
    return GraphSnapshot;
}());
exports.GraphSnapshot = GraphSnapshot;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiR3JhcGhTbmFwc2hvdC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIkdyYXBoU25hcHNob3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSwrQ0FBa0Q7QUFPbEQ7Ozs7Ozs7R0FPRztBQUNIO0lBS0U7O09BRUc7SUFDSDtJQUNFLDRDQUE0QztJQUNyQyxPQUE4QztRQUE5Qyx3QkFBQSxFQUFBLFVBQTJCLE1BQU0sQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDO1FBQTlDLFlBQU8sR0FBUCxPQUFPLENBQXVDO1FBUnZELGtDQUFrQztRQUNsQixjQUFTLEdBQUcsSUFBSSxHQUFHLEVBQTJELENBQUM7SUFRNUYsQ0FBQztJQUVKOztPQUVHO0lBQ0gsbUNBQVcsR0FBWCxVQUFZLEVBQVU7UUFDcEIsSUFBTSxRQUFRLEdBQUcsSUFBSSxDQUFDLGVBQWUsQ0FBQyxFQUFFLENBQUMsQ0FBQztRQUMxQyxPQUFPLFFBQVEsQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDO0lBQzlDLENBQUM7SUFFRDs7T0FFRztJQUNILDJCQUFHLEdBQUgsVUFBSSxFQUFVO1FBQ1osT0FBTyxFQUFFLElBQUksSUFBSSxDQUFDLE9BQU8sQ0FBQztJQUM1QixDQUFDO0lBRUQ7Ozs7T0FJRztJQUNILHVDQUFlLEdBQWYsVUFBZ0IsRUFBVTtRQUN4QixPQUFPLElBQUksQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDLENBQUM7SUFDMUIsQ0FBQztJQUVEOzs7O09BSUc7SUFDSCxrQ0FBVSxHQUFWO1FBQ0UsT0FBTyxNQUFNLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQztJQUNuQyxDQUFDO0lBRUQ7Ozs7T0FJRztJQUNILDhCQUFNLEdBQU47UUFDRSxVQUFVLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDO0lBQzNCLENBQUM7SUFFSCxvQkFBQztBQUFELENBQUMsQUF2REQsSUF1REM7QUF2RFksc0NBQWEifQ==