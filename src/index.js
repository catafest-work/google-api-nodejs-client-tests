// 'use strict';

// const {google} = require('googleapis');
// const blogger = google.blogger('v3');

// const API_KEY = 'AIzaSyBGQAYJWvs-f7W6BR9LPs6srYIN13qqtkw'; // Replace with your actual API key
// const BLOG_ID = '3881942148498441774'; // Your blog ID

// async function getBlogInfo() {
//   try {
//     const res = await blogger.blogs.get({
//       key: API_KEY,
//       blogId: BLOG_ID
//     });
//     // console.log('Blog info:', res.data);
//     console.log('Blog test');
//     console.log('Blog info:', JSON.stringify(res.data, null, 2));
//   } catch (error) {
//     // console.error('Error fetching blog info:', error.message);
//     console.error('Error fetching blog info:', error);
//     console.error('Error details:', JSON.stringify(error, null, 2));
//   }
// }

// const {google} = require('googleapis');

// // Each API may support multiple versions. With this sample, we're getting
// // v3 of the blogger API, and using an API key to authenticate.
// const blogger = google.blogger({
//   version: 'v3',
//   auth: 'AIzaSyBGQAYJWvs-f7W6BR9LPs6srYIN13qqtkw'
// });

// const params = {
//   blogId: '3881942148498441774'
// };

// // get the blog details
// blogger.blogs.get(params, (err, res) => {
//   if (err) {
//     console.error(err);
//     throw err;
//   }
//   console.log(`The blog url is ${res.data.url}`);
// });

// const fs = require('fs');
// const {google} = require('googleapis');

// const blogger = google.blogger({
//   version: 'v3',
//   auth: 'AIzaSyBGQAYJWvs-f7W6BR9LPs6srYIN13qqtkw'
// });

// const params = {
//   blogId: '3881942148498441774'
// };

// // get the blog details
// blogger.blogs.get(params, (err, res) => {
//   if (err) {
//     console.error(err);
//     throw err;
//   }
//   const result = `The blog url is ${res.data.url}`;
//   fs.writeFile('blog_info.txt', result, (err) => {
//     if (err) throw err;
//     console.log('Blog info saved to blog_info.txt');
//   });
// });

// const {google} = require('googleapis');

// const blogger = google.blogger({
//   version: 'v3',
//   auth: 'AIzaSyBGQAYJWvs-f7W6BR9LPs6srYIN13qqtkw'
// });

// const params = {
//   blogId: '3881942148498441774'
// };

// // Get blog details and posts
// blogger.blogs.get(params, (err, res) => {
//   if (err) {
//     console.error(err);
//     throw err;
//   }
//   console.log(`The blog url is ${res.data.url}`);

//   // Get posts
//   blogger.posts.list(params, (err, res) => {
//     if (err) {
//       console.error(err);
//       throw err;
//     }
//     console.log('Posts:');
//     res.data.items.forEach(post => {
//       console.log(`- ${post.title}`);
//     });

//     // Add new post
//     const currentDate = new Date().toISOString().split('T')[0];
//     const newPost = {
//       title: `Post automat ${currentDate}`,
//       content: `Acesta este un post automat din data de ${currentDate}`
//     };

//     blogger.posts.insert({
//       blogId: params.blogId,
//       resource: newPost
//     }, (err, res) => {
//       if (err) {
//         console.error(err);
//         throw err;
//       }
//       console.log(`New post created: ${res.data.title}`);
//     });
//   });
// });

// const {google} = require('googleapis');

// const API_KEY = 'AIzaSyBGQAYJWvs-f7W6BR9LPs6srYIN13qqtkw'; // Replace with your actual API key

// const blogger = google.blogger({
//   version: 'v3',
//   auth: API_KEY
// });

// const params = {
//   blogId: '3881942148498441774'
// };

// // Get blog details and posts
// blogger.blogs.get(params)
//   .then(res => {
//     console.log(`The blog url is ${res.data.url}`);
//     return blogger.posts.list(params);
//   })
//   .then(res => {
//     console.log('Posts:');
//     res.data.items.forEach(post => {
//       console.log(`- ${post.title}`);
//     });
    
//     console.log('Note: Creating new posts requires additional permissions not available with an API key.');
//   })
//   .catch(err => {
//     console.error('Error:', err);
//   });

const {google} = require('googleapis');
const fs = require('fs');
const readline = require('readline');
// const redirectUri = 'urn:ietf:wg:oauth:2.0:oob';
const credentials = JSON.parse(fs.readFileSync('src/client.json'));
const {client_secret, client_id, redirect_uris = []} = credentials.web || {};
const redirectUri = redirect_uris[0] || 'http://localhost';
//const  redirectUri="https://oauth2.example.com/code"

const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirectUri);

const SCOPES = ['https://www.googleapis.com/auth/blogger'];

const authUrl = oAuth2Client.generateAuthUrl({
  access_type: 'offline',
  scope: SCOPES,
});

console.log('Authorize this app by visiting this url:', authUrl);

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

rl.question('Enter the code from that page here: ', (code) => {
  rl.close();
  oAuth2Client.getToken(code, (err, token) => {
    if (err) return console.error('Error retrieving access token', err);
    oAuth2Client.setCredentials(token);
    fs.writeFileSync('token.json', JSON.stringify(token));
    console.log('Token stored to token.json');
    
    // Now that we have the token, we can make API calls
    const blogger = google.blogger({version: 'v3', auth: oAuth2Client});
    
    const params = {
      blogId: '3881942148498441774'
    };

    blogger.blogs.get(params)
      .then(res => {
        console.log(`The blog url is ${res.data.url}`);
        return blogger.posts.list(params);
      })
      .then(res => {
        console.log('Posts:');
        res.data.items.forEach(post => {
          console.log(`- ${post.title}`);
        });

        const currentDate = new Date().toISOString().split('T')[0];
        const newPost = {
          title: `Post automat ${currentDate}`,
          content: `Acesta este un post automat din data de ${currentDate}`
        };

        return blogger.posts.insert({
          blogId: params.blogId,
          requestBody: newPost
        });
      })
      .then(res => {
        console.log(`New post created: ${res.data.title}`);
      })
      .catch(err => {
        console.error('Error:', err);
      });
  });
});
