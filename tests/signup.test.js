const  { ApolloClient, InMemoryCache, ApolloProvider, gql , HttpLink, createHttpLink}  = require('@apollo/client/core')
const fetch = require('cross-fetch');

const httpLink = createHttpLink({
  uri: 'http://localhost:4000',
  fetch
});

const client = new ApolloClient({

    link: httpLink,
    cache: new InMemoryCache(),
  });

const getAllUsersQ = gql`
  query Query {
    getAllUsers {
      id
    }
  }
`

const signUpUsersQ = gql`
  mutation Mutation($email: String!, $password: String!, $firstName: String!, $lastName: String!) {
  signup(email: $email, password: $password, firstName: $firstName, lastName: $lastName) {
    token
    user {
      id
    }
  }
}
`

test('should return error', async ()=>{
  try{
    const data = await client.query({query: getAllUsersQ})
  } catch  (err){
    expect(err.message).toMatch('You do not have rights')
  }
})

test('Should return new user and their token', async ()=>{
  try{
    const data = await client.mutate({mutation: signUpUsersQ, variables:{  
      "email": "bus@bus7.com",
      "password": "qwertyuiop",
      "firstName": "nikita",
      "lastName": "buslaev",
    }});

    console.log(json)

    expect(data).toHaveProperty('data')
  } catch  (err){
    throw err
  }
})