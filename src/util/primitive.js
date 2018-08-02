"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function isScalar(value) {
    return value === null || typeof value !== 'object';
}
exports.isScalar = isScalar;
function isObject(value) {
    return value !== null && typeof value === 'object' && !Array.isArray(value);
}
exports.isObject = isObject;
function isObjectOrNull(value) {
    return typeof value === 'object' && !Array.isArray(value);
}
exports.isObjectOrNull = isObjectOrNull;
function isNil(value) {
    return value === null || value === undefined || Number.isNaN(value);
}
exports.isNil = isNil;
function isNumber(element) {
    return typeof element === 'number' && !Number.isNaN(element);
}
exports.isNumber = isNumber;
function verboseTypeof(value) {
    if (value === null) {
        return 'null';
    }
    return typeof value;
}
exports.verboseTypeof = verboseTypeof;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHJpbWl0aXZlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsicHJpbWl0aXZlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBRUEsa0JBQXlCLEtBQVU7SUFDakMsT0FBTyxLQUFLLEtBQUssSUFBSSxJQUFJLE9BQU8sS0FBSyxLQUFLLFFBQVEsQ0FBQztBQUNyRCxDQUFDO0FBRkQsNEJBRUM7QUFFRCxrQkFBeUIsS0FBVTtJQUNqQyxPQUFPLEtBQUssS0FBSyxJQUFJLElBQUksT0FBTyxLQUFLLEtBQUssUUFBUSxJQUFJLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQztBQUM5RSxDQUFDO0FBRkQsNEJBRUM7QUFFRCx3QkFBK0IsS0FBVTtJQUN2QyxPQUFPLE9BQU8sS0FBSyxLQUFLLFFBQVEsSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLENBQUM7QUFDNUQsQ0FBQztBQUZELHdDQUVDO0FBRUQsZUFBc0IsS0FBVTtJQUM5QixPQUFPLEtBQUssS0FBSyxJQUFJLElBQUksS0FBSyxLQUFLLFNBQVMsSUFBSSxNQUFNLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxDQUFDO0FBQ3RFLENBQUM7QUFGRCxzQkFFQztBQUVELGtCQUF5QixPQUFZO0lBQ25DLE9BQU8sT0FBTyxPQUFPLEtBQUssUUFBUSxJQUFJLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsQ0FBQztBQUMvRCxDQUFDO0FBRkQsNEJBRUM7QUFFRCx1QkFBOEIsS0FBVTtJQUN0QyxJQUFJLEtBQUssS0FBSyxJQUFJLEVBQUU7UUFDbEIsT0FBTyxNQUFNLENBQUM7S0FDZjtJQUNELE9BQU8sT0FBTyxLQUFLLENBQUM7QUFDdEIsQ0FBQztBQUxELHNDQUtDIn0=