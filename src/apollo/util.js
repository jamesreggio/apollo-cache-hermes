"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var apollo_utilities_1 = require("apollo-utilities");
var schema_1 = require("../schema");
/**
 * Builds a query.
 */
function buildRawOperationFromQuery(document, variables, rootId) {
    return {
        rootId: rootId || schema_1.StaticNodeId.QueryRoot,
        document: document,
        variables: variables,
    };
}
exports.buildRawOperationFromQuery = buildRawOperationFromQuery;
function buildRawOperationFromFragment(fragmentDocument, rootId, variables, fragmentName) {
    return {
        rootId: rootId,
        document: apollo_utilities_1.getFragmentQueryDocument(fragmentDocument, fragmentName),
        variables: variables,
        fragmentName: fragmentName,
        fromFragmentDocument: true,
    };
}
exports.buildRawOperationFromFragment = buildRawOperationFromFragment;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXRpbC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbInV0aWwudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSxxREFBNEQ7QUFHNUQsb0NBQStEO0FBRy9EOztHQUVHO0FBQ0gsb0NBQTJDLFFBQXNCLEVBQUUsU0FBc0IsRUFBRSxNQUFlO0lBQ3hHLE9BQU87UUFDTCxNQUFNLEVBQUUsTUFBTSxJQUFJLHFCQUFZLENBQUMsU0FBUztRQUN4QyxRQUFRLFVBQUE7UUFDUixTQUFTLFdBQUE7S0FDVixDQUFDO0FBQ0osQ0FBQztBQU5ELGdFQU1DO0FBRUQsdUNBQ0UsZ0JBQThCLEVBQzlCLE1BQWMsRUFDZCxTQUFzQixFQUN0QixZQUFxQjtJQUVyQixPQUFPO1FBQ0wsTUFBTSxRQUFBO1FBQ04sUUFBUSxFQUFFLDJDQUF3QixDQUFDLGdCQUFnQixFQUFFLFlBQVksQ0FBQztRQUNsRSxTQUFTLFdBQUE7UUFDVCxZQUFZLGNBQUE7UUFDWixvQkFBb0IsRUFBRSxJQUFJO0tBQzNCLENBQUM7QUFDSixDQUFDO0FBYkQsc0VBYUMifQ==