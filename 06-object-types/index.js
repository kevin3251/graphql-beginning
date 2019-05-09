const express = require('express')
const graphqlHTTP = require('express-graphql')
const { buildSchema } = require('graphql')

const { ApolloClient } = require('apollo-client')
const { createHttpLink } = require('apollo-link-http')
const { InMemoryCache } = require('apollo-cache-inmemory')
const fetch = require('cross-fetch')
const gql = require('graphql-tag')

const schema = buildSchema(`
    type RandomDie {
        numSides:  Int!
        rollOnce: Int!
        roll(numRolls: Int!): [Int]
    }

    type Query {
        getDie(numSides: Int): RandomDie 
    }
`)

class RandomDie {
    constructor(numSides) {
        this.numSides = numSides
    }

    rollOnce() {
        // console.log(,this.numSides)
        let i = 1 + Math.floor(Math.random() * this.numSides)
        console.log(i)
        return i
    }

    roll({ numRolls }) {
        var output = []
        for (let i = 0; i < numRolls; i++) {
            output.push(this.rollOnce())
        }
        return output
    }
}

const root = {
    getDie: ({ numSides }) => new RandomDie(numSides || 6)
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
    setTimeout(() => {
        client.query({
            query: gql`
                query getDie($numSides: Int, $numRolls: Int!) {
                    getDie(numSides: $numSides) {
                        rollOnce
                        roll(numRolls: $numRolls)
                    }
                }
            `,
            variables: { numRolls: 3, numSides: 6 }
        })
            .then(data => console.log(data))
            .catch(error => console.error(error))
    }, 1000)

    console.log('Running a GraphQL API server at localhost:4000/graphql')
})