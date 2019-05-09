const express = require('express')
const graphqlHTTP = require('express-graphql')
const { buildSchema } = require('graphql')

const { ApolloClient } = require('apollo-client')
const { createHttpLink } = require('apollo-link-http')
const { InMemoryCache } = require('apollo-cache-inmemory')
const fetch = require('cross-fetch')
const gql = require('graphql-tag')

const schema = buildSchema(`
    type Query {
        rollDice(numDice: Int!, numSides: Int): [Int]
    }
`)

const root = {
    rollDice: ({ numDice, numSides }) => {
        let output = []
        for (let i = 0; i < numDice; i++) {
            output.push(1 + Math.floor(Math.random() * (numSides || 6)))
        }
        return output
    }
}

const app = express()
app.use('/graphql', graphqlHTTP({
    schema,
    rootValue: root,
    graphiql: true
}))

app.listen(4000, () => {
    const link = createHttpLink({
        uri: 'http://localhost:4000/graphql',
        fetch
    })

    const cache = new InMemoryCache()
    const client = new ApolloClient({ link, cache })

    client.query({
        query: gql`
            query RollDice($dice: Int!, $sides:Int) {
                rollDice(numDice: $dice, numSides: $sides)
            }
        `,
        variables: { dice: 3, sides: 6 }
    })
        .then(data => console.log(data))
        .catch(error => console.error(error))


    console.log('Running a GraphQL API server at localhost:4000/graphql')
})