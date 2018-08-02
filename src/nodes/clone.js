"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var EntitySnapshot_1 = require("./EntitySnapshot");
var ParameterizedValueSnapshot_1 = require("./ParameterizedValueSnapshot");
/**
 * Factory function for cloning nodes to their specific type signatures, while
 * preserving object shapes.
 */
function cloneNodeSnapshot(parent) {
    var inbound = parent.inbound ? tslib_1.__spread(parent.inbound) : undefined;
    var outbound = parent.outbound ? tslib_1.__spread(parent.outbound) : undefined;
    if (parent instanceof EntitySnapshot_1.EntitySnapshot) {
        return new EntitySnapshot_1.EntitySnapshot(parent.data, inbound, outbound);
    }
    else if (parent instanceof ParameterizedValueSnapshot_1.ParameterizedValueSnapshot) {
        return new ParameterizedValueSnapshot_1.ParameterizedValueSnapshot(parent.data, inbound, outbound);
    }
    else {
        throw new Error("Unknown node type: " + Object.getPrototypeOf(parent).constructor.name);
    }
}
exports.cloneNodeSnapshot = cloneNodeSnapshot;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2xvbmUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJjbG9uZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSxtREFBa0Q7QUFFbEQsMkVBQTBFO0FBRTFFOzs7R0FHRztBQUNILDJCQUFrQyxNQUFvQjtJQUNwRCxJQUFNLE9BQU8sR0FBRyxNQUFNLENBQUMsT0FBTyxDQUFDLENBQUMsa0JBQUssTUFBTSxDQUFDLE9BQU8sRUFBRSxDQUFDLENBQUMsU0FBUyxDQUFDO0lBQ2pFLElBQU0sUUFBUSxHQUFHLE1BQU0sQ0FBQyxRQUFRLENBQUMsQ0FBQyxrQkFBSyxNQUFNLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQyxTQUFTLENBQUM7SUFFcEUsSUFBSSxNQUFNLFlBQVksK0JBQWMsRUFBRTtRQUNwQyxPQUFPLElBQUksK0JBQWMsQ0FBQyxNQUFNLENBQUMsSUFBSSxFQUFFLE9BQU8sRUFBRSxRQUFRLENBQUMsQ0FBQztLQUMzRDtTQUFNLElBQUksTUFBTSxZQUFZLHVEQUEwQixFQUFFO1FBQ3ZELE9BQU8sSUFBSSx1REFBMEIsQ0FBQyxNQUFNLENBQUMsSUFBSSxFQUFFLE9BQU8sRUFBRSxRQUFRLENBQUMsQ0FBQztLQUN2RTtTQUFNO1FBQ0wsTUFBTSxJQUFJLEtBQUssQ0FBQyx3QkFBc0IsTUFBTSxDQUFDLGNBQWMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxXQUFXLENBQUMsSUFBTSxDQUFDLENBQUM7S0FDekY7QUFDSCxDQUFDO0FBWEQsOENBV0MifQ==