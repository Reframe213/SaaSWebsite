const fetch = require('node-fetch');

exports.handler = async function(event, context) {
  const githubPAT = process.env.GITHUB_PAT;
  
  // Make sure the token is available
  if (!githubPAT) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'GitHub PAT not found' }),
    };
  }

  // Example GitHub API request
  const response = await fetch('https://api.github.com/user', {
    headers: {
      Authorization: `Bearer ${githubPAT}`,
    },
  });

  const data = await response.json();

  return {
    statusCode: 200,
    body: JSON.stringify(data),
  };
};
