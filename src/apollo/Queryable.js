"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var apollo_utilities_1 = require("apollo-utilities");
var errors_1 = require("../errors");
var util_1 = require("./util");
/**
 * Apollo-specific interface to the cache.
 */
var ApolloQueryable = /** @class */ (function () {
    function ApolloQueryable() {
    }
    ApolloQueryable.prototype.diff = function (options) {
        var rawOperation = util_1.buildRawOperationFromQuery(options.query, options.variables);
        var _a = this._queryable.read(rawOperation, options.optimistic), result = _a.result, complete = _a.complete;
        if (options.returnPartialData === false && !complete) {
            // TODO: Include more detail with this error.
            throw new errors_1.UnsatisfiedCacheError("diffQuery not satisfied by the cache.");
        }
        return { result: result, complete: complete };
    };
    ApolloQueryable.prototype.read = function (options) {
        var rawOperation = util_1.buildRawOperationFromQuery(options.query, options.variables, options.rootId);
        var _a = this._queryable.read(rawOperation, options.optimistic), result = _a.result, complete = _a.complete;
        if (!complete) {
            // TODO: Include more detail with this error.
            throw new errors_1.UnsatisfiedCacheError("read not satisfied by the cache.");
        }
        return result;
    };
    ApolloQueryable.prototype.readQuery = function (options, optimistic) {
        return this.read({
            query: options.query,
            variables: options.variables,
            optimistic: !!optimistic,
        });
    };
    ApolloQueryable.prototype.readFragment = function (options, optimistic) {
        // TODO: Support nested fragments.
        var rawOperation = util_1.buildRawOperationFromFragment(options.fragment, options.id, options.variables, options.fragmentName);
        return this._queryable.read(rawOperation, optimistic).result;
    };
    ApolloQueryable.prototype.write = function (options) {
        var rawOperation = util_1.buildRawOperationFromQuery(options.query, options.variables, options.dataId);
        this._queryable.write(rawOperation, options.result);
    };
    ApolloQueryable.prototype.writeQuery = function (options) {
        var rawOperation = util_1.buildRawOperationFromQuery(options.query, options.variables);
        this._queryable.write(rawOperation, options.data);
    };
    ApolloQueryable.prototype.writeFragment = function (options) {
        // TODO: Support nested fragments.
        var rawOperation = util_1.buildRawOperationFromFragment(options.fragment, options.id, options.variables, options.fragmentName);
        this._queryable.write(rawOperation, options.data);
    };
    ApolloQueryable.prototype.writeData = function () {
        throw new Error("writeData is not implemented by Hermes yet");
    };
    ApolloQueryable.prototype.transformDocument = function (doc) {
        return this._queryable.transformDocument(doc);
    };
    ApolloQueryable.prototype.transformForLink = function (document) {
        // @static directives are for the cache only.
        return apollo_utilities_1.removeDirectivesFromDocument([{ name: 'static' }], document);
    };
    ApolloQueryable.prototype.evict = function (options) {
        var rawOperation = util_1.buildRawOperationFromQuery(options.query, options.variables);
        return this._queryable.evict(rawOperation);
    };
    return ApolloQueryable;
}());
exports.ApolloQueryable = ApolloQueryable;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUXVlcnlhYmxlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiUXVlcnlhYmxlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQ0EscURBQWdFO0FBRWhFLG9DQUFrRDtBQUtsRCwrQkFBbUY7QUFFbkY7O0dBRUc7QUFDSDtJQUFBO0lBc0ZBLENBQUM7SUFsRkMsOEJBQUksR0FBSixVQUFRLE9BQTBCO1FBQ2hDLElBQU0sWUFBWSxHQUFHLGlDQUEwQixDQUFDLE9BQU8sQ0FBQyxLQUFLLEVBQUUsT0FBTyxDQUFDLFNBQVMsQ0FBQyxDQUFDO1FBQzVFLElBQUEsMkRBQTZFLEVBQTNFLGtCQUFNLEVBQUUsc0JBQVEsQ0FBNEQ7UUFDcEYsSUFBSSxPQUFPLENBQUMsaUJBQWlCLEtBQUssS0FBSyxJQUFJLENBQUMsUUFBUSxFQUFFO1lBQ3BELDZDQUE2QztZQUM3QyxNQUFNLElBQUksOEJBQXFCLENBQUMsdUNBQXVDLENBQUMsQ0FBQztTQUMxRTtRQUVELE9BQU8sRUFBRSxNQUFNLFFBQUEsRUFBRSxRQUFRLFVBQUEsRUFBRSxDQUFDO0lBQzlCLENBQUM7SUFFRCw4QkFBSSxHQUFKLFVBQUssT0FBMEI7UUFDN0IsSUFBTSxZQUFZLEdBQUcsaUNBQTBCLENBQUMsT0FBTyxDQUFDLEtBQUssRUFBRSxPQUFPLENBQUMsU0FBUyxFQUFFLE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUM1RixJQUFBLDJEQUE2RSxFQUEzRSxrQkFBTSxFQUFFLHNCQUFRLENBQTREO1FBQ3BGLElBQUksQ0FBQyxRQUFRLEVBQUU7WUFDYiw2Q0FBNkM7WUFDN0MsTUFBTSxJQUFJLDhCQUFxQixDQUFDLGtDQUFrQyxDQUFDLENBQUM7U0FDckU7UUFFRCxPQUFPLE1BQU0sQ0FBQztJQUNoQixDQUFDO0lBRUQsbUNBQVMsR0FBVCxVQUF1QyxPQUFvQyxFQUFFLFVBQWlCO1FBQzVGLE9BQU8sSUFBSSxDQUFDLElBQUksQ0FBQztZQUNmLEtBQUssRUFBRSxPQUFPLENBQUMsS0FB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