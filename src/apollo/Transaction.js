"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var lodashIsEqual = require("lodash.isequal");
var lodasGet = require("lodash.get");
var util_1 = require("../util");
var Queryable_1 = require("./Queryable");
function getOriginalFieldArguments(id) {
    // Split `${containerId}❖${JSON.stringify(path)}❖${JSON.stringify(args)}`
    var idComponents = id.split('❖');
    if (idComponents.length < 3) {
        return undefined;
    }
    return JSON.parse(idComponents[2]);
}
/**
 * Apollo-specific transaction interface.
 */
var ApolloTransaction = /** @class */ (function (_super) {
    tslib_1.__extends(ApolloTransaction, _super);
    function ApolloTransaction(
    /** The underlying transaction. */
    _queryable) {
        var _this = _super.call(this) || this;
        _this._queryable = _queryable;
        return _this;
    }
    ApolloTransaction.prototype.reset = function () {
        throw new Error("reset() is not allowed within a transaction");
    };
    ApolloTransaction.prototype.removeOptimistic = function (_id) {
        throw new Error("removeOptimistic() is not allowed within a transaction");
    };
    ApolloTransaction.prototype.performTransaction = function (transaction) {
        transaction(this);
    };
    ApolloTransaction.prototype.recordOptimisticTransaction = function (_transaction, _id) {
        throw new Error("recordOptimisticTransaction() is not allowed within a transaction");
    };
    ApolloTransaction.prototype.watch = function (_query) {
        throw new Error("watch() is not allowed within a transaction");
    };
    ApolloTransaction.prototype.restore = function () {
        throw new Error("restore() is not allowed within a transaction");
    };
    ApolloTransaction.prototype.extract = function () {
        throw new Error("extract() is not allowed within a transaction");
    };
    /**
     * A helper function to be used when doing EntityUpdate.
     * The method enable users to interate different parameterized at an editPath
     * of a given container Id.
     *
     * The 'updateFieldCallback' is a callback to compute new value given previous
     * list of references and an object literal of parameterized arguments at the
     * given path.
     */
    ApolloTransaction.prototype.updateListOfReferences = function (containerId, editPath, _a, _b, updateFieldCallback) {
        var writeFragment = _a.writeFragment, writeFragmentName = _a.writeFragmentName;
        var readFragment = _b.readFragment, readFragmentName = _b.readFragmentName;
        var currentContainerNode = this._queryable.getCurrentNodeSnapshot(containerId);
        if (!currentContainerNode || !currentContainerNode.outbound) {
            return;
        }
        try {
            for (var _c = tslib_1.__values(currentContainerNode.outbound), _d = _c.next(); !_d.done; _d = _c.next()) {
                var _e = _d.value, outboundId = _e.id, path = _e.path;
                if (lodashIsEqual(editPath, path)) {
                    var fieldArguments = getOriginalFieldArguments(outboundId);
                    if (fieldArguments) {
                        var cacheResult = void 0;
                        try {
                            cacheResult = this.readFragment({
                                id: containerId,
                                fragment: readFragment,
                                fragmentName: readFragmentName,
                                variables: fieldArguments,
                            }, this._queryable.isOptimisticTransaction());
                        }
                        catch (error) {
                            continue;
                        }
                        var previousData = lodasGet(cacheResult, path);
                        if (!Array.isArray(previousData)) {
                            var details = util_1.verboseTypeof(previousData) + " at ContainerId " + containerId + " with readFragment " + readFragmentName;
                            throw new Error("updateListOfReferences() expects previousData to be an array instead got " + details);
                        }
                        var updateData = updateFieldCallback(previousData, fieldArguments);
                        if (updateData !== previousData) {
                            this.writeFragment({
                                id: outboundId,
                                fragment: writeFragment,
                                fragmentName: writeFragmentName,
                                variables: fieldArguments,
                                data: updateData,
                            });
                        }
                    }
                }
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (_d && !_d.done && (_f = _c.return)) _f.call(_c);
            }
            finally { if (e_1) throw e_1.error; }
        }
        var e_1, _f;
    };
    return ApolloTransaction;
}(Queryable_1.ApolloQueryable));
exports.ApolloTransaction = ApolloTransaction;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVHJhbnNhY3Rpb24uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJUcmFuc2FjdGlvbi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFFQSw4Q0FBaUQ7QUFDakQscUNBQXdDO0FBTXhDLGdDQUFzRDtBQUV0RCx5Q0FBOEM7QUFFOUMsbUNBQW1DLEVBQVU7SUFDM0MseUVBQXlFO0lBQ3pFLElBQU0sWUFBWSxHQUFHLEVBQUUsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUM7SUFDbkMsSUFBSSxZQUFZLENBQUMsTUFBTSxHQUFHLENBQUMsRUFBRTtRQUMzQixPQUFPLFNBQVMsQ0FBQztLQUNsQjtJQUNELE9BQU8sSUFBSSxDQUFDLEtBQUssQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUNyQyxDQUFDO0FBRUQ7O0dBRUc7QUFDSDtJQUF1Qyw2Q0FBZTtJQUVwRDtJQUNFLGtDQUFrQztJQUN4QixVQUE0QjtRQUZ4QyxZQUlFLGlCQUFPLFNBQ1I7UUFIVyxnQkFBVSxHQUFWLFVBQVUsQ0FBa0I7O0lBR3hDLENBQUM7SUFFRCxpQ0FBSyxHQUFMO1FBQ0UsTUFBTSxJQUFJLEtBQUssQ0FBQyw2Q0FBNkMsQ0FBQyxDQUFDO0lBQ2pFLENBQUM7SUFFRCw0Q0FBZ0IsR0FBaEIsVUFBaUIsR0FBVztRQUMxQixNQUFNLElBQUksS0FBSyxDQUFDLHdEQUF3RCxDQUFDLENBQUM7SUFDNUUsQ0FBQztJQUVELDhDQUFrQixHQUFsQixVQUFtQixXQUF1QztRQUN4RCxXQUFXLENBQUMsSUFBSSxDQUFDLENBQUM7SUFDcEIsQ0FBQztJQUVELHVEQUEyQixHQUEzQixVQUE0QixZQUF3QyxFQUFFLEdBQVc7UUFDL0UsTUFBTSxJQUFJLEtBQUssQ0FBQyxtRUFBbUUsQ0FBQyxDQUFDO0lBQ3ZGLENBQUM7SUFFRCxpQ0FBSyxHQUFMLFVBQU0sTUFBMEI7UUFDOUIsTUFBTSxJQUFJLEtBQUssQ0FBQyw2Q0FBNkMsQ0FBQyxDQUFDO0lBQ2pFLENBQUM7SUFFRCxtQ0FBTyxHQUFQO1FBQ0UsTUFBTSxJQUFJLEtBQUssQ0FBQywrQ0FBK0MsQ0FBQyxDQUFDO0lBQ25FLENBQUM7SUFFRCxtQ0FBTyxHQUFQO1FBQ0UsTUFBTSxJQUFJLEtBQUssQ0FBQywrQ0FBK0MsQ0FBQyxDQUFDO0lBQ25FLENBQUM7SUFFRDs7Ozs7Ozs7T0FRRztJQUNILGtEQUFzQixHQUF0QixVQUNFLFdBQW1CLEVBQ25CLFFBQW9CLEVBQ3BCLEVBQWlHLEVBQ2pHLEVBQTZGLEVBQzdGLG1CQUFpRztZQUYvRixnQ0FBYSxFQUFFLHdDQUFpQjtZQUNoQyw4QkFBWSxFQUFFLHNDQUFnQjtRQUdoQyxJQUFNLG9CQUFvQixHQUFHLElBQUksQ0FBQyxVQUFVLENBQUMsc0JBQXNCLENBQUMsV0FBVyxDQUFDLENBQUM7UUFDakYsSUFBSSxDQUFDLG9CQUFvQixJQUFJLENBQUMsb0JBQW9CLENBQUMsUUFBUSxFQUFFO1lBQzNELE9BQU87U0FDUjs7WUFFRCxLQUF1QyxJQUFBLEtBQUEsaUJBQUEsb0JBQW9CLENBQUMsUUFBUSxDQUFBLGdCQUFBO2dCQUF6RCxJQUFBLGFBQXdCLEVBQXRCLGtCQUFjLEVBQUUsY0FBSTtnQkFDL0IsSUFBSSxhQUFhLENBQUMsUUFBUSxFQUFFLElBQUksQ0FBQyxFQUFFO29CQUNqQyxJQUFNLGNBQWMsR0FBRyx5QkFBeUIsQ0FBQyxVQUFVLENBQUMsQ0FBQztvQkFDN0QsSUFBSSxjQUFjLEVBQUU7d0JBQ2xCLElBQUksV0FBVyxTQUFLLENBQUM7d0JBQ3JCLElBQUk7NEJBQ0YsV0FBVyxHQUFHLElBQUksQ0FBQyxZQUFZLENBQzdCO2dDQUNFLEVBQUUsRUFBRSxXQUFXO2dDQUNmLFFBQVEsRUFBRSxZQUFZO2dDQUN0QixZQUFZLEVBQUUsZ0JBQWdCO2dDQUM5QixTQUFTLEVBQUUsY0FBYzs2QkFDMUIsRUFDRCxJQUFJLENBQUMsVUFBVSxDQUFDLHVCQUF1QixFQUFFLENBQzFDLENBQUM7eUJBQ0g7d0JBQUMsT0FBTyxLQUFLLEVBQUU7NEJBQ2QsU0FBUzt5QkFDVjt3QkFDRCxJQUFNLFlBQVksR0FBRyxRQUFRLENBQUMsV0FBVyxFQUFFLElBQUksQ0FBQyxDQUFDO3dCQUVqRCxJQUFJLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxZQUFZLENBQUMsRUFBRTs0QkFDaEMsSUFBTSxPQUFPLEdBQU0sb0JBQWEsQ0FBQyxZQUFZLENBQUMsd0JBQW1CLFdBQVcsMkJBQXNCLGdCQUFrQixDQUFDOzRCQUNySCxNQUFNLElBQUksS0FBSyxDQUFDLDhFQUE0RSxPQUFTLENBQUMsQ0FBQzt5QkFDeEc7d0JBRUQsSUFBTSxVQUFVLEdBQUcsbUJBQW1CLENBQUMsWUFBWSxFQUFFLGNBQWMsQ0FBQyxDQUFDO3dCQUNyRSxJQUFJLFVBQVUsS0FBSyxZQUFZLEVBQUU7NEJBQy9CLElBQUksQ0FBQyxhQUFhLENBQUM7Z0NBQ2pCLEVBQUUsRUFBRSxVQUFVO2dDQUNkLFFBQVEsRUFBRSxhQUFhO2dDQUN2QixZQUFZLEVBQUUsaUJBQWlCO2dDQUMvQixTQUFTLEVBQUUsY0FBYztnQ0FDekIsSUFBSSxFQUFFLFVBQVU7NkJBQ2pCLENBQUMsQ0FBQzt5QkFDSjtxQkFDRjtpQkFDRjthQUNGOzs7Ozs7Ozs7O0lBQ0gsQ0FBQztJQUVILHdCQUFDO0FBQUQsQ0FBQyxBQWxHRCxDQUF1QywyQkFBZSxHQWtHckQ7QUFsR1ksOENBQWlCIn0=