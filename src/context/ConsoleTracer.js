"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var INDENT = '  ';
/**
 * The default tracer used by the cache.
 *
 * By default it logs only warnings, but a verbose mode can be enabled to log
 * out all cache operations.
 */
var ConsoleTracer = /** @class */ (function () {
    function ConsoleTracer(_verbose, _logger) {
        if (_logger === void 0) { _logger = ConsoleTracer.DefaultLogger; }
        this._verbose = _verbose;
        this._logger = _logger;
        // Used when emulating grouping behavior.
        this._indent = 0;
    }
    ConsoleTracer.prototype.warning = function (message) {
        var metadata = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            metadata[_i - 1] = arguments[_i];
        }
        if (this._verbose)
            return;
        this._emit.apply(this, tslib_1.__spread(['warn', message], metadata));
    };
    ConsoleTracer.prototype.readEnd = function (operation, info) {
        if (!this._verbose)
            return;
        var message = this.formatOperation('read', operation);
        if (info.cacheHit) {
            this._emit('debug', message + " (cached)", info.result);
        }
        else {
            this._emit('info', message, info.result);
        }
    };
    ConsoleTracer.prototype.writeEnd = function (operation, info) {
        var _this = this;
        if (!this._verbose)
            return;
        var payload = info.payload, newSnapshot = info.newSnapshot, warnings = info.warnings;
        var message = this.formatOperation('write', operation);
        // Extended logging for writes that trigger warnings.
        if (warnings) {
            this._group(message, function () {
                _this._emit('warn', 'payload with warnings:', payload);
                try {
                    for (var warnings_1 = tslib_1.__values(warnings), warnings_1_1 = warnings_1.next(); !warnings_1_1.done; warnings_1_1 = warnings_1.next()) {
                        var warning = warnings_1_1.value;
                        _this._emit('warn', warning);
                    }
                }
                catch (e_1_1) { e_1 = { error: e_1_1 }; }
                finally {
                    try {
                        if (warnings_1_1 && !warnings_1_1.done && (_a = warnings_1.return)) _a.call(warnings_1);
                    }
                    finally { if (e_1) throw e_1.error; }
                }
                _this._emit('debug', 'new snapshot:', newSnapshot);
                var e_1, _a;
            });
        }
        else {
            this._emit('debug', message, { payload: payload, newSnapshot: newSnapshot });
        }
    };
    ConsoleTracer.prototype.transactionEnd = function (error) {
        if (error) {
            this._emit('warn', "Rolling transaction back due to error:", error);
        }
    };
    // eslint-disable-next-line class-methods-use-this
    ConsoleTracer.prototype.formatOperation = function (action, operation) {
        var _a = operation.info, operationType = _a.operationType, operationName = _a.operationName;
        return action + "(" + operationType + " " + operationName + ")";
    };
    // Internal
    ConsoleTracer.prototype._emit = function (level, message) {
        var metadata = [];
        for (var _i = 2; _i < arguments.length; _i++) {
            metadata[_i - 2] = arguments[_i];
        }
        if (this._indent) {
            for (var i = 0; i < this._indent; i++) {
                message = "" + INDENT + message;
            }
        }
        (_a = this._logger)[level].apply(_a, tslib_1.__spread([message], metadata));
        var _a;
    };
    ConsoleTracer.prototype._group = function (message, callback) {
        this._groupStart(message);
        try {
            callback();
        }
        finally {
            this._groupEnd();
        }
    };
    ConsoleTracer.prototype._groupStart = function (message) {
        if (this._logger.group && this._logger.groupEnd) {
            this._logger.group(message);
        }
        else {
            this._indent += 1;
            this._logger.info(message);
        }
    };
    ConsoleTracer.prototype._groupEnd = function () {
        if (this._logger.group && this._logger.groupEnd) {
            this._logger.groupEnd();
        }
        else {
            this._indent -= 1;
        }
    };
    return ConsoleTracer;
}());
exports.ConsoleTracer = ConsoleTracer;
(function (ConsoleTracer) {
    ConsoleTracer.DefaultLogger = {
        debug: _makeDefaultEmitter('debug'),
        info: _makeDefaultEmitter('info'),
        warn: _makeDefaultEmitter('warn'),
        // Grouping:
        group: _makeDefaultEmitter('group'),
        groupEnd: console.groupEnd ? console.groupEnd.bind(console) : function () { },
    };
})(ConsoleTracer = exports.ConsoleTracer || (exports.ConsoleTracer = {}));
exports.ConsoleTracer = ConsoleTracer;
function _makeDefaultEmitter(level) {
    var method = console[level] || console.log; // eslint-disable-line no-console
    return function defaultLogger(message) {
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
        }
        method.call.apply(method, tslib_1.__spread([console, "[Cache] " + message], args));
    };
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQ29uc29sZVRyYWNlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIkNvbnNvbGVUcmFjZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBSUEsSUFBTSxNQUFNLEdBQUcsSUFBSSxDQUFDO0FBRXBCOzs7OztHQUtHO0FBQ0g7SUFLRSx1QkFDVSxRQUFpQixFQUNqQixPQUEyRDtRQUEzRCx3QkFBQSxFQUFBLFVBQWdDLGFBQWEsQ0FBQyxhQUFhO1FBRDNELGFBQVEsR0FBUixRQUFRLENBQVM7UUFDakIsWUFBTyxHQUFQLE9BQU8sQ0FBb0Q7UUFMckUseUNBQXlDO1FBQ2pDLFlBQU8sR0FBRyxDQUFDLENBQUM7SUFLakIsQ0FBQztJQUVKLCtCQUFPLEdBQVAsVUFBUSxPQUFlO1FBQUUsa0JBQWtCO2FBQWxCLFVBQWtCLEVBQWxCLHFCQUFrQixFQUFsQixJQUFrQjtZQUFsQixpQ0FBa0I7O1FBQ3pDLElBQUksSUFBSSxDQUFDLFFBQVE7WUFBRSxPQUFPO1FBQzFCLElBQUksQ0FBQyxLQUFLLE9BQVYsSUFBSSxvQkFBTyxNQUFNLEVBQUUsT0FBTyxHQUFLLFFBQVEsR0FBRTtJQUMzQyxDQUFDO0lBRUQsK0JBQU8sR0FBUCxVQUFRLFNBQTRCLEVBQUUsSUFBcUI7UUFDekQsSUFBSSxDQUFDLElBQUksQ0FBQyxRQUFRO1lBQUUsT0FBTztRQUMzQixJQUFNLE9BQU8sR0FBRyxJQUFJLENBQUMsZUFBZSxDQUFDLE1BQU0sRUFBRSxTQUFTLENBQUMsQ0FBQztRQUN4RCxJQUFJLElBQUksQ0FBQyxRQUFRLEVBQUU7WUFDakIsSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLEVBQUssT0FBTyxjQUFXLEVBQUUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDO1NBQ3pEO2FBQU07WUFDTCxJQUFJLENBQUMsS0FBSyxDQUFDLE1BQU0sRUFBRSxPQUFPLEVBQUUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDO1NBQzFDO0lBQ0gsQ0FBQztJQUVELGdDQUFRLEdBQVIs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