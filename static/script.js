document.addEventListener('DOMContentLoaded', function() {
    const analyzeForm = document.getElementById('analyzeForm');
    const resultsDiv = document.getElementById('results');
    const featureList = document.getElementById('featureList');
    const featureDetails = document.getElementById('featureDetails');
    
    // Feature descriptions matching your model
    const featureDescriptions = [
        "XSS detected (<script> tag)",
        "SQL injection (SELECT FROM)",
        "SQL injection (DROP TABLE)",
        "SQL injection (UNION SELECT)",
        "SQL injection (INSERT INTO)",
        "SQL injection (OR 1=1)",
        "Path traversal (../)",
        "XSS detected (alert function)",
        "SQL comment (--)",
        "SQL injection (single quote)",
        "Potential injection (double quote)",
        "Suspicious keywords (admin/root/password)"
    ];

    analyzeForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const path = document.getElementById('path').value;
        const body = document.getElementById('body').value;
        
        analyzeRequest(path, body);
    });

    function analyzeRequest(path, body) {
        fetch('/predict', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ path, body }),
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            displayResults(data, path, body);
        })
        .catch(error => {
            console.error('Error:', error);
            resultsDiv.innerHTML = `
                <div class="alert alert-danger">
                    Error: ${error.message}
                </div>
            `;
        });
    }

    function displayResults(data, path, body) {
        featureDetails.classList.remove('d-none');
        featureList.innerHTML = '';
        
        if (data.prediction === 1) {
            resultsDiv.innerHTML = `
                <div>
                    <h3 class="text-danger">⚠️ MALICIOUS REQUEST</h3>
                    <p>This request contains potential security threats.</p>
                </div>
            `;
        } else {
            resultsDiv.innerHTML = `
                <div>
                    <h3 class="text-success">✅ SAFE REQUEST</h3>
                    <p>This request appears to be legitimate.</p>
                </div>
            `;
        }

        // Display detected features
        if (data.features) {
            for (let i = 0; i < featureDescriptions.length; i++) {
                const featureKey = `feature_${i}`;
                if (data.features[featureKey] === 1) {
                    const li = document.createElement('li');
                    li.className = 'list-group-item list-group-item-danger';
                    li.textContent = featureDescriptions[i];
                    featureList.appendChild(li);
                }
            }
        }
        
        if (featureList.children.length === 0) {
            const li = document.createElement('li');
            li.className = 'list-group-item';
            li.textContent = 'No malicious patterns detected';
            featureList.appendChild(li);
        }
    }
});