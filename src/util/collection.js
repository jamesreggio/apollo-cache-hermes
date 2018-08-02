"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var lodashGet = require("lodash.get");
/**
 * Gets a nested value, with support for blank paths.
 */
function deepGet(target, path) {
    return path.length ? lodashGet(target, path) : target;
}
exports.deepGet = deepGet;
function pathBeginsWith(target, prefix) {
    if (target.length < prefix.length)
        return false;
    for (var i = 0; i < prefix.length; i++) {
        if (prefix[i] !== target[i])
            return false;
    }
    return true;
}
exports.pathBeginsWith = pathBeginsWith;
/**
 * Adds values to a set, mutating it.
 */
function addToSet(target, source) {
    try {
        for (var source_1 = tslib_1.__values(source), source_1_1 = source_1.next(); !source_1_1.done; source_1_1 = source_1.next()) {
            var value = source_1_1.value;
            target.add(value);
        }
    }
    catch (e_1_1) { e_1 = { error: e_1_1 }; }
    finally {
        try {
            if (source_1_1 && !source_1_1.done && (_a = source_1.return)) _a.call(source_1);
        }
        finally { if (e_1) throw e_1.error; }
    }
    var e_1, _a;
}
exports.addToSet = addToSet;
/**
 * An immutable deep set, where it only creates containers (objects/arrays) if
 * they differ from the _original_ object copied from - even if
 * `_setValue` is called against it multiple times.
 */
function lazyImmutableDeepSet(target, original, path, value) {
    if (!path.length)
        return value;
    var parentNode;
    var targetNode = target;
    var originalNode = original;
    // We assume that the last path component is the key of a value; not a
    // container, so we stop there.
    for (var i = 0; i < path.length; i++) {
        var key = path[i];
        // If the target still references the original's objects, we need to diverge
        if (!targetNode || targetNode === originalNode) {
            if (typeof key === 'number') {
                targetNode = originalNode ? tslib_1.__spread(originalNode) : [];
            }
            else if (typeof key === 'string') {
                targetNode = originalNode ? tslib_1.__assign({}, originalNode) : {};
            }
            else {
                throw new Error("Unknown path type " + JSON.stringify(key) + " in path " + JSON.stringify(path) + " at index " + i);
            }
            if (i === 0) {
                // Make sure we have a reference to the new target. We can keep the
                // reference here because "target" is pointing as currentNode.data.
                target = targetNode;
            }
            else {
                parentNode[path[i - 1]] = targetNode;
            }
        }
        // Regardless, we keep walking deeper.
        parentNode = targetNode;
        targetNode = targetNode[key];
        originalNode = originalNode && originalNode[key];
    }
    // Finally, set the value in our previously or newly cloned target.
    parentNode[path[path.length - 1]] = value;
    return target;
}
exports.lazyImmutableDeepSet = lazyImmutableDeepSet;
function setsHaveSomeIntersection(left, right) {
    // Walk the smaller set.
    var _a = tslib_1.__read(left.size > right.size ? [right, left] : [left, right], 2), toIterate = _a[0], toCheck = _a[1];
    try {
        for (var toIterate_1 = tslib_1.__values(toIterate), toIterate_1_1 = toIterate_1.next(); !toIterate_1_1.done; toIterate_1_1 = toIterate_1.next()) {
            var value = toIterate_1_1.value;
            if (toCheck.has(value))
                return true;
        }
    }
    catch (e_2_1) { e_2 = { error: e_2_1 }; }
    finally {
        try {
            if (toIterate_1_1 && !toIterate_1_1.done && (_b = toIterate_1.return)) _b.call(toIterate_1);
        }
        finally { if (e_2) throw e_2.error; }
    }
    return false;
    var e_2, _b;
}
exports.setsHaveSomeIntersection = setsHaveSomeIntersection;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29sbGVjdGlvbi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImNvbGxlY3Rpb24udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEsc0NBQXlDO0FBSXpDOztHQUVHO0FBQ0gsaUJBQXdCLE1BQVcsRUFBRSxJQUFnQjtJQUNuRCxPQUFPLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxNQUFNLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQztBQUN4RCxDQUFDO0FBRkQsMEJBRUM7QUFFRCx3QkFBK0IsTUFBa0IsRUFBRSxNQUFrQjtJQUNuRSxJQUFJLE1BQU0sQ0FBQyxNQUFNLEdBQUcsTUFBTSxDQUFDLE1BQU07UUFBRSxPQUFPLEtBQUssQ0FBQztJQUNoRCxLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsTUFBTSxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBRTtRQUN0QyxJQUFJLE1BQU0sQ0FBQyxDQUFDLENBQUMsS0FBSyxNQUFNLENBQUMsQ0FBQyxDQUFDO1lBQUUsT0FBTyxLQUFLLENBQUM7S0FDM0M7SUFDRCxPQUFPLElBQUksQ0FBQztBQUNkLENBQUM7QUFORCx3Q0FNQztBQUVEOztHQUVHO0FBQ0gsa0JBQTRCLE1BQWMsRUFBRSxNQUFtQjs7UUFDN0QsS0FBb0IsSUFBQSxXQUFBLGlCQUFBLE1BQU0sQ0FBQSw4QkFBQTtZQUFyQixJQUFNLEtBQUssbUJBQUE7WUFDZCxNQUFNLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxDQUFDO1NBQ25COzs7Ozs7Ozs7O0FBQ0gsQ0FBQztBQUpELDRCQUlDO0FBRUQ7Ozs7R0FJRztBQUNILDhCQUNFLE1BQTJCLEVBQzNCLFFBQTZCLEVBQzdCLElBQWdCLEVBQ2hCLEtBQVU7SUFFVixJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU07UUFBRSxPQUFPLEtBQUssQ0FBQztJQUUvQixJQUFJLFVBQVUsQ0FBQztJQUNmLElBQUksVUFBVSxHQUFRLE1BQU0sQ0FBQztJQUM3QixJQUFJLFlBQVksR0FBUSxRQUFRLENBQUM7SUFDakMsc0VBQXNFO0lBQ3RFLCtCQUErQjtJQUMvQixLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsSUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBRTtRQUNwQyxJQUFNLEdBQUcsR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDcEIsNEVBQTRFO1FBQzVFLElBQUksQ0FBQyxVQUFVLElBQUksVUFBVSxLQUFLLFlBQVksRUFBRTtZQUM5QyxJQUFJLE9BQU8sR0FBRyxLQUFLLFFBQVEsRUFBRTtnQkFDM0IsVUFBVSxHQUFHLFlBQVksQ0FBQyxDQUFDLGtCQUFLLFlBQVksRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDO2FBQ3BEO2lCQUFNLElBQUksT0FBTyxHQUFHLEtBQUssUUFBUSxFQUFFO2dCQUNsQyxVQUFVLEdBQUcsWUFBWSxDQUFDLENBQUMsc0JBQU0sWUFBWSxFQUFHLENBQUMsQ0FBQyxFQUFFLENBQUM7YUFDdEQ7aUJBQU07Z0JBQ0wsTUFBTSxJQUFJLEtBQUssQ0FBQyx1QkFBcUIsSUFBSSxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsaUJBQVksSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsa0JBQWEsQ0FBRyxDQUFDLENBQUM7YUFDM0c7WUFFRCxJQUFJLENBQUMsS0FBSyxDQUFDLEVBQUU7Z0JBQ1gsbUVBQW1FO2dCQUNuRSxtRUFBbUU7Z0JBQ25FLE1BQU0sR0FBRyxVQUFVLENBQUM7YUFDckI7aUJBQU07Z0JBQ0wsVUFBVSxDQUFDLElBQUksQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxVQUFVLENBQUM7YUFDdEM7U0FDRjtRQUVELHNDQUFzQztRQUN0QyxVQUFVLEdBQUcsVUFBVSxDQUFDO1FBQ3hCLFVBQVUsR0FBRyxVQUFVLENBQUMsR0FBRyxDQUFDLENBQUM7UUFDN0IsWUFBWSxHQUFHLFlBQVksSUFBSSxZQUFZLENBQUMsR0FBRyxDQUFDLENBQUM7S0FDbEQ7SUFFRCxtRUFBbUU7SUFDbkUsVUFBVSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsS0FBSyxDQUFDO0lBRTFDLE9BQU8sTUFBaUIsQ0FBQztBQUMzQixDQUFDO0FBNUNELG9EQTRDQztBQUVELGtDQUFpRCxJQUFpQixFQUFFLEtBQWtCO0lBQ3BGLHdCQUF3QjtJQUNsQixJQUFBLDhFQUE2RSxFQUE1RSxpQkFBUyxFQUFFLGVBQU8sQ0FBMkQ7O1FBRXBGLEtBQW9CLElBQUEsY0FBQSxpQkFBQSxTQUFTLENBQUEsb0NBQUE7WUFBeEIsSUFBTSxLQUFLLHNCQUFBO1lBQ2QsSUFBSSxPQUFPLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQztnQkFBRSxPQUFPLElBQUksQ0FBQztTQUNyQzs7Ozs7Ozs7O0lBQ0QsT0FBTyxLQUFLLENBQUM7O0FBQ2YsQ0FBQztBQVJELDREQVFDIn0=