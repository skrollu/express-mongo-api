const { GraphQLScalarType } = require('graphql');
const { Kind } = require('graphql/language');

module.exports = new GraphQLScalarType({
  name: 'Date',
  description: 'A Date() type in GraphQL as a scalar',
  serialize(value) {
    //console.log("serialized")
    return value.toISOString();
  },
  parseValue(value) {
    //console.log("parseValue")
    const dateValue = new Date(value);
    return isNaN(dateValue) ? undefined : dateValue;
  },
  parseLiteral(ast) {
    //console.log("parseLiteral")
    if (ast.kind == Kind.STRING) {
      const value = new Date(ast.value);
      return isNaN(value) ? undefined : value;
    }
  },
});