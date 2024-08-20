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
    // blogerId can get from URL : https://www.blogger.com/blog/posts/3881942148498441774
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
