const express = require("express");
const { ApolloServer, gql } = require("apollo-server-express");
const sql = require("mssql");

const typeDefs = gql`
  type Query {
    getUsers: [User]
  }

  type User {
    id: ID
    email: String
  }
`;

const resolvers = {
  Query: {
    getUsers: async () => {
      try {
        // Create a SQL Server connection pool
        const pool = await sql.connect({
          user: "sa",
          password: "",
          server: "0.0.0.0",
          database: "fsm",
          options: {
            encrypt: false,
          },
        });

        // Query the database
        const result = await pool
          .request()
          .query("SELECT id, email FROM dbo.users");
        // Return the result
        return result.recordset;
      } catch (error) {
        console.error("Error querying the database:", error);
        throw error;
      }
    },
  },
};

const server = new ApolloServer({ typeDefs, resolvers });

const app = express();

async function startServer() {
  await server.start();

  server.applyMiddleware({ app });

  const PORT = process.env.PORT || 3001;
  app.listen(PORT, () => {
    console.log(
      `Apollo Server running at http://localhost:${PORT}${server.graphqlPath}`,
    );
  });
}

startServer();
