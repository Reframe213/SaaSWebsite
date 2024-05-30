document.getElementById('repoForm').addEventListener('submit', async function (e) {
    e.preventDefault();

    const repoName = document.getElementById('repoName').value;
    const file = document.getElementById('file').files[0];

    if (!repoName || !file) {
        alert('Please provide both a repository name and a file.');
        return;
    }

    try {
        // Step 1: Create the GitHub repository
        const repoResponse = await fetch('/.netlify/functions/create-github-repo', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ repoName })
        });

        const repoData = await repoResponse.json();

        if (repoResponse.status !== 201) {
            throw new Error(repoData.message || 'Failed to create repository');
        }

        // Step 2: Upload the file to the GitHub repository
        const reader = new FileReader();
        reader.onload = async function () {
            const content = btoa(reader.result);

            const uploadResponse = await fetch('/.netlify/functions/upload-file-to-github', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    repoName,
                    fileName: file.name,
                    content
                })
            });

            const uploadData = await uploadResponse.json();

            if (uploadResponse.status !== 201) {
                throw new Error(uploadData.message || 'Failed to upload file');
            }

            // Step 3: Create a new Netlify site using the GitHub repository
            const netlifyResponse = await fetch('/.netlify/functions/create-netlify-site', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ repoName })
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
