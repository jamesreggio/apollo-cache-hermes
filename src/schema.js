"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var util_1 = require("./util");
/**
 * There are a few pre-defined nodes present in all schemas.
 */
var StaticNodeId;
(function (StaticNodeId) {
    StaticNodeId["QueryRoot"] = "ROOT_QUERY";
    StaticNodeId["MutationRoot"] = "ROOT_MUTATION";
    StaticNodeId["SubscriptionRoot"] = "ROOT_SUBSCRIPTION";
})(StaticNodeId = exports.StaticNodeId || (exports.StaticNodeId = {}));
function isSerializable(value, allowUndefined) {
    if (util_1.isScalar(value)) {
        // NaN is considered to typeof number
        var isNaNValue = Number.isNaN(value);
        return allowUndefined ? !isNaNValue : !isNaNValue && value !== undefined;
    }
    if (util_1.isObject(value)) {
        try {
            for (var _a = tslib_1.__values(Object.getOwnPropertyNames(value)), _b = _a.next(); !_b.done; _b = _a.next()) {
                var propName = _b.value;
                if (!isSerializable(value[propName], allowUndefined)) {
                    return false;
                }
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (_b && !_b.done && (_c = _a.return)) _c.call(_a);
            }
            finally { if (e_1) throw e_1.error; }
        }
        return true;
    }
    if (Array.isArray(value)) {
        try {
            for (var value_1 = tslib_1.__values(value), value_1_1 = value_1.next(); !value_1_1.done; value_1_1 = value_1.next()) {
                var element = value_1_1.value;
                if (!isSerializable(element, allowUndefined)) {
                    return false;
                }
            }
        }
        catch (e_2_1) { e_2 = { error: e_2_1 }; }
        finally {
            try {
                if (value_1_1 && !value_1_1.done && (_d = value_1.return)) _d.call(value_1);
            }
            finally { if (e_2) throw e_2.error; }
        }
        return true;
    }
    return false;
    var e_1, _c, e_2, _d;
}
exports.isSerializable = isSerializable;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2NoZW1hLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsic2NoZW1hLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUlBLCtCQUEwRDtBQW1CMUQ7O0dBRUc7QUFDSCxJQUFZLFlBSVg7QUFKRCxXQUFZLFlBQVk7SUFDdEIsd0NBQXdCLENBQUE7SUFDeEIsOENBQThCLENBQUE7SUFDOUIsc0RBQXNDLENBQUE7QUFDeEMsQ0FBQyxFQUpXLFlBQVksR0FBWixvQkFBWSxLQUFaLG9CQUFZLFFBSXZCO0FBOEVELHdCQUErQixLQUFVLEVBQUUsY0FBd0I7SUFDakUsSUFBSSxlQUFRLENBQUMsS0FBSyxDQUFDLEVBQUU7UUFDbkIscUNBQXFDO1FBQ3JDLElBQU0sVUFBVSxHQUFHLE1BQU0sQ0FBQyxLQUFLLENBQUMsS0FBWSxDQUFDLENBQUM7UUFDOUMsT0FBTyxjQUFjLENBQUMsQ0FBQyxDQUFDLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDLFVBQVUsSUFBSSxLQUFLLEtBQUssU0FBUyxDQUFDO0tBQzFFO0lBRUQsSUFBSSxlQUFRLENBQUMsS0FBSyxDQUFDLEVBQUU7O1lBQ25CLEtBQXVCLElBQUEsS0FBQSxpQkFBQSxNQUFNLENBQUMsbUJBQW1CLENBQUMsS0FBSyxDQUFDLENBQUEsZ0JBQUE7Z0JBQW5ELElBQU0sUUFBUSxXQUFBO2dCQUNqQixJQUFJLENBQUMsY0FBYyxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsRUFBRSxjQUFjLENBQUMsRUFBRTtvQkFDcEQsT0FBTyxLQUFLLENBQUM7aUJBQ2Q7YUFDRjs7Ozs7Ozs7O1FBQ0QsT0FBTyxJQUFJLENBQUM7S0FDYjtJQUVELElBQUksS0FBSyxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsRUFBRTs7WUFDeEIsS0FBc0IsSUFBQSxVQUFBLGlCQUFBLEtBQUssQ0FBQSw0QkFBQTtnQkFBdEIsSUFBTSxPQUFPLGtCQUFBO2dCQUNoQixJQUFJLENBQUMsY0FBYyxDQUFDLE9BQU8sRUFBRSxjQUFjLENBQUMsRUFBRTtvQkFDNUMsT0FBTyxLQUFLLENBQUM7aUJBQ2Q7YUFDRjs7Ozs7Ozs7O1FBQ0QsT0FBTyxJQUFJLENBQUM7S0FDYjtJQUVELE9BQU8sS0FBSyxDQUFDOztBQUNmLENBQUM7QUExQkQsd0NBMEJDIn0=