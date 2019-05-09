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
        id: { type: graphql.GraphQLString }
    }
})