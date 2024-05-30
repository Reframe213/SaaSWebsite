            // Initialize Netlify Identity
            netlifyIdentity.init();

            document.getElementById('repoForm').addEventListener('submit', async function (e) {
                e.preventDefault();
    
                const user = netlifyIdentity.currentUser();
    
                if (!user) {
                    alert('Please log in to continue.');
                    netlifyIdentity.open();
                    return;
                }
    
                const token = await user.jwt();
                const repoName = document.getElementById('repoName').value;
                const file = document.getElementById('file').files[0];
    
                if (!repoName || !file) {
                    alert('Please provide both a repository name and a file.');
                    return;
                }
    
                const githubToken = process.env.GitHubPAT; // Replace with your GitHub token
    
                try {
                    // Step 1: Create the GitHub repository
                    const repoResponse = await fetch('https://api.github.com/user/repos', {
                        method: 'POST',
                        headers: {
                            'Authorization': `token ${githubToken}`,
                            'Accept': 'application/vnd.github.v3+json',
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            name: repoName,
                            private: true
                        })
                    });
    
                    const repoData = await repoResponse.json();
    
                    if (repoResponse.status !== 201) {
                        throw new Error(repoData.message || 'Failed to create repository');
                    }
    
                    // Step 2: Upload the file to the GitHub repository
                    const reader = new FileReader();
                    reader.onload = async function () {
                        const content = btoa(reader.result);
    
                        const uploadResponse = await fetch(`https://api.github.com/repos/your_github_username/${repoName}/contents/${file.name}`, {
                            method: 'PUT',
                            headers: {
                                'Authorization': `token ${githubToken}`,
                                'Accept': 'application/vnd.github.v3+json',
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify({
                                message: 'Initial commit',
                                content: content
                            })
                        });
    
                        const uploadData = await uploadResponse.json();
    
                        if (uploadResponse.status !== 201) {
                            throw new Error(uploadData.message || 'Failed to upload file');
                        }
    
                        // Step 3: Create a new Netlify site using the GitHub repository
                        const netlifyResponse = await fetch('https://api.netlify.com/api/v1/sites', {
                            method: 'POST',
                            headers: {
                                'Authorization': `Bearer ${token}`,
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify({
                                name: `${repoName}-site`, // Optional, Netlify will auto-generate a name if not provided
                                repo: {
                                    provider: 'github',
                                    repo: `your_github_username/${repoName}`,
                                    private: false,
                                    branch: 'main'
                                }
                            })
                        });
    
                        const netlifyData = await netlifyResponse.json();
    
                        if (netlifyResponse.status !== 201) {
                            throw new Error(netlifyData.message || 'Failed to create Netlify site');
                        }
    
                        alert(`Repository created and file uploaded successfully. Netlify site created at ${netlifyData.url}`);
                    };
    
                    reader.readAsBinaryString(file);
                } catch (error) {
                    alert(`Error: ${error.message}`);
                }
            });