import { GraphQLScalarType } from "graphql";
import { Kind } from "graphql/language";

export const DateType = new GraphQLScalarType({
  name: "Date",
  description: "Date custom scalar type",
  serialize(value: any) {
    return value.toISOString(); // Serialize date to ISO string
  },
  parseValue(value: any) {
    return new Date(value); // Parse value from input string
  },
  parseLiteral(ast) {
    if (ast.kind === Kind.STRING) {
      return new Date(ast.value); // Parse literal value from input string
    }
    return null;
  },
});
