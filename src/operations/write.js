"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var SnapshotEditor_1 = require("./SnapshotEditor");
/**
 * Merges a payload with an existing graph snapshot, generating a new one.
 *
 * Performs the minimal set of edits to generate new immutable versions of each
 * node, while preserving immutability of the parent snapshot.
 */
function write(context, snapshot, raw, payload) {
    var tracerContext;
    if (context.tracer.writeStart) {
        tracerContext = context.tracer.writeStart(raw, payload);
    }
    // We _could_ go purely functional with the editor, but it's honestly pretty
    // convenient to follow the builder function instead - it'd end up passing
    // around a context object anyway.
    var editor = new SnapshotEditor_1.SnapshotEditor(context, snapshot);
    var warnings = editor.mergePayload(raw, payload).warnings;
    var newSnapshot = editor.commit();
    if (context.tracer.writeEnd) {
        context.tracer.writeEnd(context.parseOperation(raw), { payload: payload, newSnapshot: newSnapshot, warnings: warnings }, tracerContext);
    }
    return newSnapshot;
}
exports.write = write;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid3JpdGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJ3cml0ZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUtBLG1EQUFrRTtBQUVsRTs7Ozs7R0FLRztBQUNILGVBQXNCLE9BQXFCLEVBQUUsUUFBdUIsRUFBRSxHQUFpQixFQUFFLE9BQW1CO0lBQzFHLElBQUksYUFBYSxDQUFDO0lBQ2xCLElBQUksT0FBTyxDQUFDLE1BQU0sQ0FBQyxVQUFVLEVBQUU7UUFDN0IsYUFBYSxHQUFHLE9BQU8sQ0FBQyxNQUFNLENBQUMsVUFBVSxDQUFDLEdBQUcsRUFBRSxPQUFPLENBQUMsQ0FBQztLQUN6RDtJQUVELDRFQUE0RTtJQUM1RSwwRUFBMEU7SUFDMUUsa0NBQWtDO0lBQ2xDLElBQU0sTUFBTSxHQUFHLElBQUksK0JBQWMsQ0FBQyxPQUFPLEVBQUUsUUFBUSxDQUFDLENBQUM7SUFDN0MsSUFBQSxxREFBUSxDQUF1QztJQUN2RCxJQUFNLFdBQVcsR0FBRyxNQUFNLENBQUMsTUFBTSxFQUFFLENBQUM7SUFFcEMsSUFBSSxPQUFPLENBQUMsTUFBTSxDQUFDLFFBQVEsRUFBRTtRQUMzQixPQUFPLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxPQUFPLENBQUMsY0FBYyxDQUFDLEdBQUcsQ0FBQyxFQUFFLEVBQUUsT0FBTyxTQUFBLEVBQUUsV0FBVyxhQUFBLEVBQUUsUUFBUSxVQUFBLEVBQUUsRUFBRSxhQUFhLENBQUMsQ0FBQztLQUN6RztJQUVELE9BQU8sV0FBVyxDQUFDO0FBQ3JCLENBQUM7QUFsQkQsc0JBa0JDIn0=