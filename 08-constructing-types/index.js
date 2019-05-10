const express = require('express')
const graphqlHTTP = require('express-graphql')
const graphql = require('graphql')

const fakeDatabase = {
    a: {
        id: 'a',
        name: 'alice'
    },
    b: {
        id: 'b',
        name: 'bob'
    }
}

const userType = new graphql.GraphQLObjectType({
    name: 'User',
    fields: {
        id: { type: graphql.GraphQLString },
        name: { type: graphql.GraphQLString }
    }
})

const queryType = new graphql.GraphQLObjectType({
    name: 'Query',
    fields: {
        user: {
            type: userType,
            args: {
                id: { type: graphql.GraphQLString }
            },
            resolve: function (_, { id }) {
                return fakeDatabase[id]
            }
        }
    }
})

const schema = new graphql.GraphQLSchema({ query: queryType })
const app = express()

app.use('/graphql', graphqlHTTP({
    schema, graphiql: true
}))

app.listen(4000, () => {
    console.log('Running a GraphQL API server at localhost:4000/graphql')
})