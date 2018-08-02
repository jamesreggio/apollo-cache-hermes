"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var apollo_utilities_1 = require("apollo-utilities");
var ParsedQueryNode_1 = require("../ParsedQueryNode");
var util_1 = require("../util");
var ConsoleTracer_1 = require("./ConsoleTracer");
var QueryInfo_1 = require("./QueryInfo");
/**
 * Configuration and shared state used throughout the cache's operation.
 */
var CacheContext = /** @class */ (function () {
    function CacheContext(config) {
        if (config === void 0) { config = {}; }
        /** All currently known & processed GraphQL documents. */
        this._queryInfoMap = new Map();
        /** All currently known & parsed queries, for identity mapping. */
        this._operationMap = new Map();
        // Infer dev mode from NODE_ENV, by convention.
        var nodeEnv = typeof process !== 'undefined' ? process.env.NODE_ENV : 'development';
        this.entityIdForValue = _makeEntityIdMapper(config.entityIdForNode);
        this.entityTransformer = config.entityTransformer;
        this.freezeSnapshots = 'freeze' in config ? !!config.freeze : nodeEnv !== 'production';
        this.verbose = !!config.verbose;
        this.resolverRedirects = config.resolverRedirects || {};
        this.onChange = config.onChange;
        this.entityUpdaters = config.entityUpdaters || {};
        this.tracer = config.tracer || new ConsoleTracer_1.ConsoleTracer(!!config.verbose, config.logger);
        this._addTypename = config.addTypename || false;
    }
    /**
     * Performs any transformations of operation documents.
     *
     * Cache consumers should call this on any operation document prior to calling
     * any other method in the cache.
     */
    CacheContext.prototype.transformDocument = function (document) {
        if (this._addTypename && !document.hasBeenTransformed) {
            var transformedDocument = apollo_utilities_1.addTypenameToDocument(document);
            transformedDocument.hasBeenTransformed = true;
            return transformedDocument;
        }
        return document;
    };
    /**
     * Returns a memoized & parsed operation.
     *
     * To aid in various cache lookups, the result is memoized by all of its
     * values, and can be used as an identity for a specific operation.
     */
    CacheContext.prototype.parseOperation = function (raw) {
        // It appears like Apollo or someone upstream is cloning or otherwise
        // modifying the queries that are passed down.  Thus, the operation source
        // is a more reliable cache key…
        var cacheKey = operationCacheKey(raw.document, raw.fragmentName);
        var operationInstances = this._operationMap.get(cacheKey);
        if (!operationInstances) {
            operationInstances = [];
            this._operationMap.set(cacheKey, operationInstances);
        }
        try {
            // Do we already have a copy of this guy?
            for (var operationInstances_1 = tslib_1.__values(operationInstances), operationInstances_1_1 = operationInstances_1.next(); !operationInstances_1_1.done; operationInstances_1_1 = operationInstances_1.next()) {
                var instance = operationInstances_1_1.value;
                if (instance.rootId !== raw.rootId)
                    continue;
                if (!apollo_utilities_1.isEqual(instance.variables, raw.variables))
                    continue;
                return instance;
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (operationInstances_1_1 && !operationInstances_1_1.done && (_a = operationInstances_1.return)) _a.call(operationInstances_1);
            }
            finally { if (e_1) throw e_1.error; }
        }
        var updateRaw = tslib_1.__assign({}, raw, { document: this.transformDocument(raw.document) });
        var info = this._queryInfo(cacheKey, updateRaw);
        var fullVariables = tslib_1.__assign({}, info.variableDefaults, updateRaw.variables);
        var operation = {
            info: info,
            rootId: updateRaw.rootId,
            parsedQuery: ParsedQueryNode_1.expandVariables(info.parsed, fullVariables),
            isStatic: !ParsedQueryNode_1.areChildrenDynamic(info.parsed),
            variables: updateRaw.variables,
        };
        operationInstances.push(operation);
        return operation;
        var e_1, _a;
    };
    /**
     * Retrieves a memoized QueryInfo for a given GraphQL document.
     */
    CacheContext.prototype._queryInfo = function (cacheKey, raw) {
        if (!this._queryInfoMap.has(cacheKey)) {
            this._queryInfoMap.set(cacheKey, new QueryInfo_1.QueryInfo(this, raw));
        }
        return this._queryInfoMap.get(cacheKey);
    };
    return CacheContext;
}());
exports.CacheContext = CacheContext;
/**
 * Wrap entityIdForNode so that it coerces all values to strings.
 */
function _makeEntityIdMapper(mapper) {
    if (mapper === void 0) { mapper = defaultEntityIdMapper; }
    return function entityIdForNode(node) {
        if (!util_1.isObject(node))
            return undefined;
        // We don't trust upstream implementations.
        var entityId = mapper(node);
        if (typeof entityId === 'string')
            return entityId;
        if (typeof entityId === 'number')
            return String(entityId);
        return undefined;
    };
}
exports._makeEntityIdMapper = _makeEntityIdMapper;
function defaultEntityIdMapper(node) {
    return node.id;
}
exports.defaultEntityIdMapper = defaultEntityIdMapper;
function operationCacheKey(document, fragmentName) {
    if (fragmentName) {
        return fragmentName + "\u2756" + document.loc.source.body;
    }
    return document.loc.source.body;
}
exports.operationCacheKey = operationCacheKey;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQ2FjaGVDb250ZXh0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiQ2FjaGVDb250ZXh0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUFBLHFEQUFrRTtBQUlsRSxzREFBeUU7QUFHekUsZ0NBQWlEO0FBRWpELGlEQUFnRDtBQUNoRCx5Q0FBd0M7QUFzSXhDOztHQUVHO0FBQ0g7SUFpQ0Usc0JBQVksTUFBdUM7UUFBdkMsdUJBQUEsRUFBQSxXQUF1QztRQUxuRCx5REFBeUQ7UUFDeEMsa0JBQWEsR0FBRyxJQUFJLEdBQUcsRUFBcUIsQ0FBQztRQUM5RCxrRUFBa0U7UUFDakQsa0JBQWEsR0FBRyxJQUFJLEdBQUcsRUFBK0IsQ0FBQztRQUd0RSwrQ0FBK0M7UUFDL0MsSUFBTSxPQUFPLEdBQUcsT0FBTyxPQUFPLEtBQUssV0FBVyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsYUFBYSxDQUFDO1FBRXRGLElBQUksQ0FBQyxnQkFBZ0IsR0FBRyxtQkFBbUIsQ0FBQyxNQUFNLENBQUMsZUFBZSxDQUFDLENBQUM7UUFDcEUsSUFBSSxDQUFDLGlCQUFpQixHQUFHLE1BQU0sQ0FBQyxpQkFBaUIsQ0FBQztRQUNsRCxJQUFJLENBQUMsZUFBZSxHQUFHLFFBQVEsSUFBSSxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxPQUFPLEtBQUssWUFBWSxDQUFDO1FBRXZGLElBQUksQ0FBQyxPQUFPLEdBQUcsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUM7UUFDaEMsSUFBSSxDQUFDLGlCQUFpQixHQUFHLE1BQU0sQ0FBQyxpQkFBaUIsSUFBSSxFQUFFLENBQUM7UUFDeEQsSUFBSSxDQUFDLFFBQVEsR0FBRyxNQUFNLENBQUMsUUFBUSxDQUFDO1FBQ2hDLElBQUksQ0FBQyxjQUFjLEdBQUcsTUFBTSxDQUFDLGNBQWMsSUFBSSxFQUFFLENB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