import sponsors from '../../sponsors.json'

export async function getSponsors () {
  return sponsors
}

// NOTE: When github updates their sponsors API we wont have to manage this list by hand.

// import { ApolloClient, InMemoryCache, createHttpLink, gql } from '@apollo/client'
// import { setContext } from '@apollo/client/link/context'

// const httpLink = createHttpLink({
//   uri: 'https://api.github.com/graphql'
// })

// const authLink = setContext((_, { headers }) => {
//   return {
//     headers: {
//       ...headers,
//       authorization: `Bearer ${process.env.GITHUB_TOKEN}`
//     }
//   }
// })

// const client = new ApolloClient({
//   link: authLink.concat(httpLink),
//   cache: new InMemoryCache({
//     possibleTypes: {
//       Sponsors: ['User', 'Organization']
//     }
//   })
// })

// export async function getSponsors () {
//   const { data } = await client.query({
//     fetchPolicy: 'cache-first',
//     query: gql`
//       query GetSponsors {
//         user (login: "SupremeTechnopriest") {
//           sponsors (first: 100) {
//             totalCount
//             nodes {
//               ... on User {
//                 login
//                 avatarUrl
//                 name
//                 url
//                 websiteUrl
//               }
//               ... on Organization {
//                 login
//                 name
//                 avatarUrl
//                 url
//                 websiteUrl
//               }
//             }
//           }
//         }
//       }
//     `
//   })

//   const result = {
//     individuals: [],
//     organizations: []
//   }

//   data.user.sponsors.nodes.forEach((node: any) => {
//     const sponsor = {
//       name: node.name || node.login,
//       image: node.avatarUrl,
//       website: node.websiteUrl || node.url
//     }
//     if (node.__typename === 'User') {
//       result.individuals.push(sponsor)
//     }
//     if (node.__typename === 'Organization') {
//       result.organizations.push(sponsor)
//     }
//   })

//   return result
// }
