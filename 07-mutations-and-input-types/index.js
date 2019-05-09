const express = require('express')
const graphqlHTTP = require('express-graphql')
const { buildSchema } = require('graphql')

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