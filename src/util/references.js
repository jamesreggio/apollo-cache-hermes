"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var apollo_utilities_1 = require("apollo-utilities");
/**
 * Mutates a snapshot, removing an inbound reference from it.
 *
 * Returns whether all references were removed.
 */
function removeNodeReference(direction, snapshot, id, path) {
    var references = snapshot[direction];
    if (!references)
        return true;
    var fromIndex = getIndexOfGivenReference(references, id, path);
    if (fromIndex < 0)
        return false;
    references.splice(fromIndex, 1);
    if (!references.length) {
        snapshot[direction] = undefined;
    }
    return !references.length;
}
exports.removeNodeReference = removeNodeReference;
/**
 * Mutates a snapshot, adding a new reference to it.
 */
function addNodeReference(direction, snapshot, id, path) {
    var references = snapshot[direction];
    if (!references) {
        references = snapshot[direction] = [];
    }
    var idx = getIndexOfGivenReference(references, id, path);
    if (idx === -1) {
        references.push({ id: id, path: path });
        return true;
    }
    return false;
}
exports.addNodeReference = addNodeReference;
/**
 * Return true if { id, path } is a valid reference in the node's references
 * array. Otherwise, return false.
 */
function hasNodeReference(snapshot, type, id, path) {
    var references = snapshot[type];
    if (!references || getIndexOfGivenReference(references, id, path) === -1)
        return false;
    return true;
}
exports.hasNodeReference = hasNodeReference;
/**
 * Return index of { id, path } reference in references array.
 * Otherwise, return -1.
 */
function getIndexOfGivenReference(references, id, path) {
    return references.findIndex(function (reference) {
        return reference.id === id && apollo_utilities_1.isEqual(reference.path, path);
    });
}
/**
 * Return true if of 'path' points to a valid reference field
 */
function isReferenceField(snapshot, path) {
    var references = snapshot['outbound'];
    if (!references)
        return false;
    var index = references.findIndex(function (reference) {
        return apollo_utilities_1.isEqual(reference.path, path);
    });
    return (index >= 0);
}
exports.isReferenceField = isReferenceField;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVmZXJlbmNlcy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbInJlZmVyZW5jZXMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSxxREFBMkM7QUFRM0M7Ozs7R0FJRztBQUNILDZCQUNFLFNBQTZCLEVBQzdCLFFBQXNCLEVBQ3RCLEVBQVUsRUFDVixJQUFnQjtJQUVoQixJQUFNLFVBQVUsR0FBRyxRQUFRLENBQUMsU0FBUyxDQUFDLENBQUM7SUFDdkMsSUFBSSxDQUFDLFVBQVU7UUFBRSxPQUFPLElBQUksQ0FBQztJQUU3QixJQUFNLFNBQVMsR0FBRyx3QkFBd0IsQ0FBQyxVQUFVLEVBQUUsRUFBRSxFQUFFLElBQUksQ0FBQyxDQUFDO0lBQ2pFLElBQUksU0FBUyxHQUFHLENBQUM7UUFBRSxPQUFPLEtBQUssQ0FBQztJQUNoQyxVQUFVLENBQUMsTUFBTSxDQUFDLFNBQVMsRUFBRSxDQUFDLENBQUMsQ0FBQztJQUVoQyxJQUFJLENBQUMsVUFBVSxDQUFDLE1BQU0sRUFBRTtRQUN0QixRQUFRLENBQUMsU0FBUyxDQUFDLEdBQUcsU0FBUyxDQUFDO0tBQ2pDO0lBRUQsT0FBTyxDQUFDLFVBQVUsQ0FBQyxNQUFNLENBQUM7QUFDNUIsQ0FBQztBQWxCRCxrREFrQkM7QUFFRDs7R0FFRztBQUNILDBCQUNFLFNBQTZCLEVBQzdCLFFBQXNCLEVBQ3RCLEVBQVUsRUFDVixJQUFnQjtJQUVoQixJQUFJLFVBQVUsR0FBRyxRQUFRLENBQUMsU0FBUyxDQUFDLENBQUM7SUFDckMsSUFBSSxDQUFDLFVBQVUsRUFBRTtRQUNmLFVBQVUsR0FBRyxRQUFRLENBQUMsU0FBUyxDQUFDLEdBQUcsRUFBRSxDQUFDO0tBQ3ZDO0lBRUQsSUFBTSxHQUFHLEdBQUcsd0JBQXdCLENBQUMsVUFBVSxFQUFFLEVBQUUsRUFBRSxJQUFJLENBQUMsQ0FBQztJQUMzRCxJQUFJLEdBQUcsS0FBSyxDQUFDLENBQUMsRUFBRTtRQUNkLFVBQVUsQ0FBQyxJQUFJLENBQUMsRUFBRSxFQUFFLElBQUEsRUFBRSxJQUFJLE1BQUEsRUFBRSxDQUFDLENBQUM7UUFDOUIsT0FBTyxJQUFJLENBQUM7S0FDYjtJQUNELE9BQU8sS0FBSyxDQUFDO0FBQ2YsQ0FBQztBQWpCRCw0Q0FpQkM7QUFFRDs7O0dBR0c7QUFDSCwwQkFDRSxRQUFzQixFQUN0QixJQUF3QixFQUN4QixFQUFVLEVBQ1YsSUFBZ0I7SUFFaEIsSUFBTSxVQUFVLEdBQUcsUUFBUSxDQUFDLElBQUksQ0FBQyxDQUFDO0lBQ2xDLElBQUksQ0FBQyxVQUFVLElBQUksd0JBQXdCLENBQUMsVUFBVSxFQUFFLEVBQUUsRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUM7UUFBRSxPQUFPLEtBQUssQ0FBQztJQUN2RixPQUFPLElBQUksQ0FBQztBQUNkLENBQUM7QUFURCw0Q0FTQztBQUVEOzs7R0FHRztBQUNILGtDQUFrQyxVQUEyQixFQUFFLEVBQVUsRUFBRSxJQUFnQjtJQUN6RixPQUFPLFVBQVUsQ0FBQyxTQUFTLENBQUMsVUFBQyxTQUFTO1FBQ3BDLE9BQU8sU0FBUyxDQUFDLEVBQUUsS0FBSyxFQUFFLElBQUksMEJBQU8sQ0FBQyxTQUFTLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxDQUFDO0lBQzlELENBQUMsQ0FBQyxDQUFDO0FBQ0wsQ0FBQztBQUVEOztHQUVHO0FBQ0gsMEJBQ0UsUUFBc0IsRUFDdEIsSUFBZ0I7SUFFaEIsSUFBTSxVQUFVLEdBQUcsUUFBUSxDQUFDLFVBQVUsQ0FBQyxDQUFDO0lBQ3hDLElBQUksQ0FBQyxVQUFVO1FBQUUsT0FBTyxLQUFLLENBQUM7SUFDOUIsSUFBTSxLQUFLLEdBQUcsVUFBVSxDQUFDLFNBQVMsQ0FBQyxVQUFDLFNBQVM7UUFDM0MsT0FBTywwQkFBTyxDQUFDLFNBQVMsQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLENBQUM7SUFDdkMsQ0FBQyxDQUFDLENBQUM7SUFDSCxPQUFPLENBQUMsS0FBSyxJQUFJLENBQUMsQ0FBQyxDQUFDO0FBQ3RCLENBQUM7QUFWRCw0Q0FVQyJ9