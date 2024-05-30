const fetch = require('node-fetch');

exports.handler = async function(event, context) {
  const { repoName } = JSON.parse(event.body);
  const netlifyToken = process.env.NETLIFY_PAT;

  const response = await fetch('https://api.netlify.com/api/v1/sites', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${netlifyToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      name: `${repoName}-site`,
      repo: {
        provider: 'github',
        repo: `Reframe213/${repoName}`,
        private: false,
        branch: 'main'
      }
    })
  });

  const data = await response.json();

  return {
    statusCode: response.status,
    body: JSON.stringify(data)
  };
};
