"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var lodashGet = require("lodash.get");
var GraphSnapshot_1 = require("../GraphSnapshot");
var nodes_1 = require("../nodes");
var util_1 = require("../util");
var SnapshotEditor_1 = require("./SnapshotEditor");
/**
 * Returns the migrated entity snapshot. Supports add and modify but not delete
 * fields.
 */
function migrateEntity(id, snapshot, nodesToAdd, migrationMap) {
    // Only if object and if valid MigrationMap is provided
    if (!util_1.isObject(snapshot.data))
        return snapshot;
    var entityMigrations = lodashGet(migrationMap, '_entities');
    var parameterizedMigrations = lodashGet(migrationMap, '_parameterized');
    var typeName = snapshot.data.__typename || 'Query';
    if (entityMigrations && entityMigrations[typeName]) {
        for (var field in entityMigrations[typeName]) {
            var fieldMigration = entityMigrations[typeName][field];
            if (!fieldMigration)
                continue;
            // References work in very specific way in Hermes. If client tries
            // to migrate them at will, bad things happnen. Let's not let them shoot
            // themselves
            if (util_1.isReferenceField(snapshot, [field])) {
                throw new Error(typeName + "." + field + " is a reference field. Migration is not allowed");
            }
            snapshot.data[field] = fieldMigration(snapshot.data[field]);
        }
    }
    if (parameterizedMigrations && parameterizedMigrations[typeName]) {
        var _loop_1 = function (parameterized) {
            var fieldId = SnapshotEditor_1.nodeIdForParameterizedValue(id, parameterized.path, parameterized.args);
            // create a parameterized value snapshot if container doesn't know of the
            // parameterized field we expect
            if (!snapshot.outbound || !snapshot.outbound.find(function (s) { return s.id === fieldId; })) {
                var newNode = new nodes_1.ParameterizedValueSnapshot(parameterized.defaultReturn);
                nodesToAdd[fieldId] = newNode;
                // update the reference for the new node in the container
                util_1.addNodeReference('inbound', newNode, id, parameterized.path);
                util_1.addNodeReference('outbound', snapshot, fieldId, parameterized.path);
            }
        };
        try {
            for (var _a = tslib_1.__values(parameterizedMigrations[typeName]), _b = _a.next(); !_b.done; _b = _a.next()) {
                var parameterized = _b.value;
                _loop_1(parameterized);
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
    return snapshot;
    var e_1, _c;
}
/**
 * Migrates the CacheSnapshot. This function migrates the field values
 * in place so use it with care. Do not use it on the Hermes' current
 * CacheSnapshot. Doing so run the risk of violating immutability.
 */
function migrate(cacheSnapshot, migrationMap) {
    if (migrationMap) {
        var nodesToAdd = Object.create(null);
        var nodes = cacheSnapshot.baseline._values;
        for (var nodeId in nodes) {
            var nodeSnapshot = nodes[nodeId];
            if (nodeSnapshot instanceof nodes_1.EntitySnapshot) {
                migrateEntity(nodeId, nodeSnapshot, nodesToAdd, migrationMap);
            }
        }
        // rebuild the migrated GraphSnapshot
        var snapshots = tslib_1.__assign({}, cacheSnapshot.baseline._values);
        for (var addId in nodesToAdd) {
            var nodeToAdd = nodesToAdd[addId];
            if (!nodeToAdd)
                continue;
            snapshots[addId] = nodeToAdd;
        }
        cacheSnapshot.baseline = new GraphSnapshot_1.GraphSnapshot(snapshots);
    }
    return cacheSnapshot;
}
exports.migrate = migrate;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWlncmF0ZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIm1pZ3JhdGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEsc0NBQXlDO0FBR3pDLGtEQUFpRDtBQUNqRCxrQ0FBc0U7QUFHdEUsZ0NBSWlCO0FBRWpCLG1EQUFnRjtBQThCaEY7OztHQUdHO0FBQ0gsdUJBQ0UsRUFBVSxFQUNWLFFBQXdCLEVBQ3hCLFVBQTJCLEVBQzNCLFlBQTJCO0lBRzNCLHVEQUF1RDtJQUN2RCxJQUFJLENBQUMsZUFBUSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUM7UUFBRSxPQUFPLFFBQVEsQ0FBQztJQUU5QyxJQUFNLGdCQUFnQixHQUFHLFNBQVMsQ0FBQyxZQUFZLEVBQUUsV0FBVyxDQUFDLENBQUM7SUFDOUQsSUFBTSx1QkFBdUIsR0FBRyxTQUFTLENBQUMsWUFBWSxFQUFFLGdCQUFnQixDQUFDLENBQUM7SUFFMUUsSUFBTSxRQUFRLEdBQUcsUUFBUSxDQUFDLElBQUksQ0FBQyxVQUFvQixJQUFJLE9BQU8sQ0FBQztJQUUvRCxJQUFJLGdCQUFnQixJQUFJLGdCQUFnQixDQUFDLFFBQVEsQ0FBQyxFQUFFO1FBQ2xELEtBQUssSUFBTSxLQUFLLElBQUksZ0JBQWdCLENBQUMsUUFBUSxDQUFDLEVBQUU7WUFDOUMsSUFBTSxjQUFjLEdBQUcsZ0JBQWdCLENBQUMsUUFBUSxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUM7WUFDekQsSUFBSSxDQUFDLGNBQWM7Z0JBQUUsU0FBUztZQUM5QixrRUFBa0U7WUFDbEUsd0VBQXdFO1lBQ3hFLGFBQWE7WUFDYixJQUFJLHVCQUFnQixDQUFDLFFBQVEsRUFBRSxDQUFDLEtBQUssQ0FBQyxDQUFDLEVBQUU7Z0JBQ3ZDLE1BQU0sSUFBSSxLQUFLLENBQUksUUFBUSxTQUFJLEtBQUssb0RBQWlELENBQUMsQ0FBQzthQUN4RjtZQUNELFFBQVEsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLEdBQUcsY0FBYyxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQztTQUM3RDtLQUNGO0lBRUQsSUFBSSx1QkFBdUIsSUFBSSx1QkFBdUIsQ0FBQyxRQUFRLENBQUMsRUFBRTtnQ0FDckQsYUFBYTtZQUN0QixJQUFNLE9BQU8sR0FBRyw0Q0FBMkIsQ0FBQyxFQUFFLEVBQUUsYUFBYSxDQUFDLElBQUksRUFBRSxhQUFhLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDeEYseUVBQXlFO1lBQ3pFLGdDQUFnQztZQUNoQyxJQUFJLENBQUMsUUFBUSxDQUFDLFFBQVEsSUFBSSxDQUFDLFFBQVEsQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLFVBQUEsQ0FBQyxJQUFLLE9BQUEsQ0FBQyxDQUFDLEVBQUUsS0FBSyxPQUFPLEVBQWhCLENBQWdCLENBQUMsRUFBRTtnQkFDekUsSUFBTSxPQUFPLEdBQUcsSUFBSSxrQ0FBMEIsQ0FBQyxhQUFhLENBQUMsYUFBYSxDQUFDLENBQUM7Z0JBQzVFLFVBQVUsQ0FBQyxPQUFPLENBQUMsR0FBRyxPQUFPLENBQUM7Z0JBRTlCLHlEQUF5RDtnQkFDekQsdUJBQWdCLENBQUMsU0FBUyxFQUFFLE9BQU8sRUFBRSxFQUFFLEVBQUUsYUFBYSxDQUFDLElBQUksQ0FBQyxDQUFDO2dCQUM3RCx1QkFBZ0IsQ0FBQyxVQUFVLEVBQUUsUUFBUSxFQUFFLE9BQU8sRUFBRSxhQUFhLENBQUMsSUFBSSxDQUFDLENBQUM7YUFDckU7UUFDSCxDQUFDOztZQVpELEtBQTRCLElBQUEsS0FBQSxpQkFBQSx1QkFBdUIsQ0FBQyxRQUFRLENBQUMsQ0FBQSxnQkFBQTtnQkFBeEQsSUFBTSxhQUFhLFdBQUE7d0JBQWIsYUFBYTthQVl2Qjs7Ozs7Ozs7O0tBQ0Y7SUFFRCxPQUFPLFFBQVEsQ0FBQzs7QUFDbEIsQ0FBQztBQUVEOzs7O0dBSUc7QUFDSCxpQkFBd0IsYUFBNEIsRUFBRSxZQUEyQjtJQUMvRSxJQUFJLFlBQVksRUFBRTtRQUNoQixJQUFNLFVBQVUsR0FBb0IsTUFBTSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUN4RCxJQUFNLEtBQUssR0FBRyxhQUFhLENBQUMsUUFBUSxDQUFDLE9BQU8sQ0FBQztRQUM3QyxLQUFLLElBQU0sTUFBTSxJQUFJLEtBQUssRUFBRTtZQUMxQixJQUFNLFlBQVksR0FBRyxLQUFLLENBQUMsTUFBTSxDQUFDLENBQUM7WUFDbkMsSUFBSSxZQUFZLFlBQVksc0JBQWMsRUFBRTtnQkFDMUMsYUFBYSxDQUFDLE1BQU0sRUFBRSxZQUFZLEVBQUUsVUFBVSxFQUFFLFlBQVksQ0FBQyxDQUFDO2FBQy9EO1NBQ0Y7UUFFRCxxQ0FBcUM7UUFDckMsSUFBTSxTQUFTLHdCQUFRLGFBQWEsQ0FBQyxRQUFRLENBQUMsT0FBTyxDQUFFLENBQUM7UUFDeEQsS0FBSyxJQUFNLEtBQUssSUFBSSxVQUFVLEVBQUU7WUFDOUIsSUFBTSxTQUFTLEdBQUcsVUFBVSxDQUFDLEtBQUssQ0FBQyxDQUFDO1lBQ3BDLElBQUksQ0FBQyxTQUFTO2dCQUFFLFNBQVM7WUFDekIsU0FBUyxDQUFDLEtBQUssQ0FBQyxHQUFHLFNBQVMsQ0FBQztTQUM5QjtRQUNELGFBQWEsQ0FBQyxRQUFRLEdBQUcsSUFBSSw2QkFBYSxDQUFDLFNBQVMsQ0FBQyxDQUFDO0tBQ3ZEO0lBQ0QsT0FBTyxhQUFhLENBQUM7QUFDdkIsQ0FBQztBQXJCRCwwQkFxQkMifQ==