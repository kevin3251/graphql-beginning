const express = require('express')
const graphqlHTTP = require('express-graphql')
const { buildSchema } = require('graphql')

const { ApolloClient } = require('apollo-client')
const { createHttpLink } = require('apollo-link-http')
const { InMemoryCache } = require('apollo-cache-inmemory')
const fetch = require('cross-fetch')
const gql = require('graphql-tag')

const schema = buildSchema(`
    input MessageInput {
        content: String
        author: String
    }

    type Message {
        id: ID!
        content: String
        author: String
    }

    type Query {
        getMessage(id: ID!): Message
    }

    type Mutation {
        createMessage(input: MessageInput): Message 
        updateMessage(id: ID!, input: MessageInput): Message
    }
`)

class Message {
    constructor(id, { content, author }) {
        this.id = id
        this.content = content
        this.author = author
    }
}

const fakeDatabase = {}
const root = {
    getMessage: ({ id }) => {
        if (!fakeDatabase[id]) {
            throw new Error(`no message exists with id ${id}`)
        }
        return new Message(id, fakeDatabase[id])
    },
    createMessage: ({ input }) => {
        let id = require('crypto').randomBytes(10).toString('hex')

        fakeDatabase[id] = input
        return new Message(id, input)
    },
    updateMessage: ({ id, input }) => {
        if (!fakeDatabase[id]) {
            throw new Error(`no message exists with id ${id}`)
        }

        fakeDatabase[id] = input
        return new Message(id, input)
    }
}

const app = express()
app.use('/graphql', graphqlHTTP({
    schema, rootValue: root, graphiql: true
}))

app.listen(4000, () => {
    const link = createHttpLink({
        uri: 'http://localhost:4000/graphql', fetch
    })
    
    const cache = new InMemoryCache()
    const client = new ApolloClient({ link, cache })

    client.mutate({
        mutation: gql`
            mutation CreateMessage($input: MessageInput) {
                createMessage(input: $input) {
                    id
                }
            }
        `,
        variables: {
            input: {
                author: 'andy',
                content: 'hope is a good thing'
            }
        }
    })
        .then(data => console.log(data))
        .catch(error => console.log(error))

    console.log(`Running a GraphQL API server at localhost:4000/graphql`)
})