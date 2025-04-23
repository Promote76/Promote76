/**
 * RPC Test Server for SWF
 * 
 * This server serves a simple HTML page that makes a direct RPC request to the Hardhat node
 * and displays the result.
 */

const express = require('express');
const app = express();
const PORT = 5000;
const cors = require('cors');

// Enable CORS for all routes
app.use(cors());

const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Hardhat RPC Test</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            padding: 20px;
            max-width: 800px;
            margin: 0 auto;
        }
        pre {
            background-color: #f5f5f5;
            padding: 15px;
            border-radius: 5px;
            overflow: auto;
        }
        button {
            background-color: #4f46e5;
            color: white;
            border: none;
            padding: 10px 15px;
            border-radius: 5px;
            cursor: pointer;
            font-size: 16px;
            margin: 10px 0;
        }
        .error {
            color: red;
            font-weight: bold;
        }
        .success {
            color: green;
            font-weight: bold;
        }
    </style>
</head>
<body>
    <h1>Hardhat RPC Test</h1>
    <p>This page tests direct RPC calls to the Hardhat node.</p>
    
    <button id="testRpc">Test RPC Call</button>
    <button id="testManual">Test Manual JSON-RPC</button>
    <button id="testApiHealth">Test API Health</button>
    
    <h2>Result:</h2>
    <pre id="result">Click a button to test...</pre>
    
    <h2>Full Response:</h2>
    <pre id="fullResponse"></pre>
    
    <script>
        document.getElementById('testRpc').addEventListener('click', async () => {
            const resultElement = document.getElementById('result');
            const fullResponseElement = document.getElementById('fullResponse');
            
            resultElement.textContent = 'Testing RPC call...';
            resultElement.className = '';
            fullResponseElement.textContent = '';
            
            try {
                const response = await fetch('http://localhost:8545', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        jsonrpc: '2.0',
                        method: 'eth_blockNumber',
                        params: [],
                        id: 1
                    })
                });
                
                // Log the raw response text for debugging
                const responseText = await response.text();
                fullResponseElement.textContent = responseText;
                
                try {
                    // Try to parse the response as JSON
                    const data = JSON.parse(responseText);
                    
                    if (data.error) {
                        resultElement.textContent = 'Error: ' + data.error.message;
                        resultElement.className = 'error';
                    } else {
                        resultElement.textContent = 'Success: Block number = ' + data.result;
                        resultElement.className = 'success';
                    }
                } catch (parseError) {
                    resultElement.textContent = 'JSON Parse Error: ' + parseError.message;
                    resultElement.className = 'error';
                }
            } catch (fetchError) {
                resultElement.textContent = 'Fetch Error: ' + fetchError.message;
                resultElement.className = 'error';
            }
        });
        
        document.getElementById('testManual').addEventListener('click', async () => {
            const resultElement = document.getElementById('result');
            const fullResponseElement = document.getElementById('fullResponse');
            
            resultElement.textContent = 'Testing manual JSON construction...';
            resultElement.className = '';
            fullResponseElement.textContent = '';
            
            // Create a manual JSON-RPC response to test parsing
            const testJson = {
                jsonrpc: '2.0',
                id: 1,
                result: '0x10'
            };
            
            const jsonStr = JSON.stringify(testJson);
            fullResponseElement.textContent = jsonStr;
            
            try {
                // Try to parse our manually created JSON
                const data = JSON.parse(jsonStr);
                resultElement.textContent = 'Success: Parsed manual JSON correctly';
                resultElement.className = 'success';
            } catch (parseError) {
                resultElement.textContent = 'JSON Parse Error: ' + parseError.message;
                resultElement.className = 'error';
            }
        });
        
        document.getElementById('testApiHealth').addEventListener('click', async () => {
            const resultElement = document.getElementById('result');
            const fullResponseElement = document.getElementById('fullResponse');
            
            resultElement.textContent = 'Testing API health endpoint...';
            resultElement.className = '';
            fullResponseElement.textContent = '';
            
            try {
                const response = await fetch('http://localhost:5001/api/health');
                
                // Log the raw response text for debugging
                const responseText = await response.text();
                fullResponseElement.textContent = responseText;
                
                try {
                    // Try to parse the response as JSON
                    const data = JSON.parse(responseText);
                    resultElement.textContent = 'Success: API Health = ' + data.status;
                    resultElement.className = 'success';
                } catch (parseError) {
                    resultElement.textContent = 'JSON Parse Error: ' + parseError.message;
                    resultElement.className = 'error';
                }
            } catch (fetchError) {
                resultElement.textContent = 'Fetch Error: ' + fetchError.message;
                resultElement.className = 'error';
            }
        });
    </script>
</body>
</html>
`;

// Route to serve the RPC test page
app.get('/', (req, res) => {
  res.setHeader('Content-Type', 'text/html');
  res.send(htmlContent);
});

// Start the server and keep it alive even if there are connection issues
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`RPC Test server running at http://0.0.0.0:${PORT}`);
  console.log(`Multiple test options available: RPC, Manual JSON, API Health`);
  
  // Keep the process running indefinitely
  setInterval(() => {
    console.log('Keeping server alive: ' + new Date().toISOString());
  }, 60000);
});

// Handle process termination
process.on('SIGINT', () => {
  console.log('Shutting down server...');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('Uncaught exception:', err);
  // Keep the server running despite errors
});