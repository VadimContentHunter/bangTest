# jsonrpc-formatter

A package for working with JSON-RPC 2.0. It automates the process of data formatting and supports all required fields and methods of the specification.

## Features

- Serialize JSON-RPC requests and responses.
- Deserialize JSON-RPC responses.
- Verify error objects and format error responses according to the JSON-RPC specification.

## Installation

You can install the package using npm:

```bash
npm install vadimcontenthunter-jsonrpc-formatter
```

## Usage

### Serialize a JSON-RPC Request

```javascript
const { JsonRpcFormatter } = require('jsonrpc-formatter');

const request = JsonRpcFormatter.serializeRequest("methodName", { param1: "value1" });
console.log(request);
```

### Deserialize a JSON-RPC Response

```javascript
const response = '{"jsonrpc":"2.0","result":{"data":"value"},"id":1}';
const parsedResponse = JsonRpcFormatter.deserializeResponse(response);
console.log(parsedResponse);
```

### Format an Error Response

```javascript
const errorResponse = JsonRpcFormatter.formatError(-32601, "Method not found", 1);
console.log(errorResponse);
```

## Application Examples

- *Will be added later*

## License

This project is licensed under the MIT License. See the LICENSE file for details.
