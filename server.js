
const express = require('express');
const graphqlHTTP = require('express-graphql');
const { buildSchema } = require('graphql');


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
    getMessages(id: ID): [Message]
    getMessage(id: ID!): Message
  }
  
  type Mutation {
    createMessage(input: MessageInput): Message
    updateMessage(id: ID!, input: MessageInput): Message
  }
`);

class Message {
  constructor(id, content, author) {
    this.id = id;
    this.content = content;
    this.author = author;
  }
}


let fakeDatabase = [
  {
    id: 1,
    author: 'Jose Fernando Lopez Fernandez',
    content: 'Test 1'
  },
  {
    id: 2,
    author: 'Jose Fernando Lopez Fernandez',
    content: 'Test 2'
  }
];

const root = {
  getMessage: function({id}) {
    if (!fakeDatabase[id]) {
      throw new Error('Message id not found:', id);
    }

    return new Message(id, fakeDatabase[id]);
  },
  getMessages: function({id}) {
    let messages = [];

    if (!fakeDatabase.length) {
      return messages;
    }

    fakeDatabase.forEach(message => messages.push(new Message(message.id, message.content, message.author)));

    return messages;
  },
  createMessage: function({input}) {
    // Create a random id for our database
    const id = require('crypto').randomBytes(10).toString('hex');

    const newMessage = new Message(id, input.content, input.author);

    fakeDatabase.push(newMessage);

    return newMessage;
  },
  updateMessage: function({ id, input}) {
    if (!fakeDatabase[id]) {
      throw new Error('No message with that id exists.', id);
    }

    // This replaces all the old data, but some apps might want partial update.
    fakeDatabase[id] = input;

    return new Message(id, input);
  }
};

const app = express();

app.use('/graphql', graphqlHTTP({
  schema: schema,
  rootValue: root,
  graphiql: true
}));

app.listen(4000);

console.log(`Running GraphQL API server at localhost:4000/graphql`);

// Create Message query
// mutation AddMessage {
//   createMessage(input: {
//     author: "Jose Fernando Lopez Fernandez",
//       content: "I really hope this is working..."
//   }) {
//     id
//   }
// }
