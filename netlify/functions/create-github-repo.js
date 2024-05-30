const fetch = require('node-fetch');

exports.handler = async function(event, context) {
  const { repoName } = JSON.parse(event.body);
  const githubPAT = process.env.GITHUB_PAT;

  const response = await fetch('https://api.github.com/user/repos', {
    method: 'POST',
    headers: {
      'Authorization': `token ${githubPAT}`,
      'Accept': 'application/vnd.github.v3+json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      name: repoName,
      private: true
    })
  });

  const data = await response.json();

  return {
    statusCode: response.status,
    body: JSON.stringify(data)
  };
};
