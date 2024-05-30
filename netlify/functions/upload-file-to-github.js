const fetch = require('node-fetch');

exports.handler = async function(event, context) {
  const { repoName, fileName, content } = JSON.parse(event.body);
  const githubPAT = process.env.GITHUB_PAT;

  const response = await fetch(`https://api.github.com/repos/Reframe213/${repoName}/contents/${fileName}`, {
    method: 'PUT',
    headers: {
      'Authorization': `token ${githubPAT}`,
      'Accept': 'application/vnd.github.v3+json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      message: 'Initial commit',
      content: content
    })
  });

  const data = await response.json();

  return {
    statusCode: response.status,
    body: JSON.stringify(data)
  };
};
