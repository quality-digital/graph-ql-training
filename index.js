const express = require('express');
const bodyParser = require('body-parser');
const { graphqlExpress, graphiqlExpress } = require('apollo-server-express');
const { makeExecutableSchema } = require('graphql-tools');
const mongoose = require("mongoose");
mongoose.connect('mongodb://localhost:27017/products', {useNewUrlParser: true, useUnifiedTopology: true});


const Product = mongoose.model('Product', { name: String, price: Number });

const createProduct = async (name, price) => {
  const product = new Product({ name, price });
  await product.save();
  return 'saved';
}

const getProducts = async(name) => {
  const products = await Product.find({});
  return name ? products.filter((product) => product.name === name) : products;
}

// The GraphQL schema in string form
const typeDefs = `
  type Query { products(name: String): [Product] }
  type Product { name: String, price: Int }
  type Mutation {
    insertProduct(name: String, price: Int): String
  }
`;

// The resolvers
const resolvers = {
  Query: { products: (_, {name}) => getProducts(name) },
  Mutation: {
    insertProduct: (_, {name, price}) => createProduct(name, price), 
  }
};

// Put together a schema
const schema = makeExecutableSchema({
  typeDefs,
  resolvers,
});

// Initialize the app
const app = express();

// The GraphQL endpoint
app.use('/graphql', bodyParser.json(), graphqlExpress({ schema }));

// GraphiQL, a visual editor for queries
app.use('/graphiql', graphiqlExpress({ endpointURL: '/graphql' }));

// Start the server
app.listen(3000, () => {
  console.log('Go to http://localhost:3000/graphiql to run queries!');
});