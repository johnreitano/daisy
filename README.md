# MCP Datastore Server

An MCP (Model Context Protocol) server for Google Cloud Datastore that provides simple query capabilities.

## Features

- **List Kinds**: Get all available entity kinds (tables) in your Datastore
- **Get Entity**: Retrieve a specific entity by key
- **Query Entities**: Basic querying with pagination
- **Filter Entities**: Simple equality filtering on any field (including key fields)

## Setup

1. Install dependencies:
```bash
npm install
```

2. Set up authentication:
   - Set `GOOGLE_CLOUD_PROJECT` environment variable
   - Set `GOOGLE_APPLICATION_CREDENTIALS` to point to your service account key file
   - Or use Application Default Credentials (ADC)

3. Build the project:
```bash
npm run build
```

4. Run the server:
```bash
npm start
```

## Available Tools

### `datastore_list_kinds`
Lists all available entity kinds in the Datastore.

### `datastore_get`
Gets an entity by its key.
- `kind`: Entity kind
- `key`: Entity key (name or ID)
- `parent`: Parent key (optional)

### `datastore_query`
Queries entities with optional pagination.
- `kind`: Entity kind to query
- `limit`: Maximum results (default: 100)
- `offset`: Results to skip (default: 0)

### `datastore_filter`
Filters entities by field equality.
- `kind`: Entity kind to query
- `field`: Field name to filter on (including `__key__` or `key`)
- `value`: Value to match exactly
- `limit`: Maximum results (default: 100)

## Examples

```json
// List kinds
{"name": "datastore_list_kinds", "arguments": {}}

// Get entity
{"name": "datastore_get", "arguments": {"kind": "User", "key": "12345"}}

// Query with pagination
{"name": "datastore_query", "arguments": {"kind": "User", "limit": 10}}

// Filter by field
{"name": "datastore_filter", "arguments": {"kind": "User", "field": "status", "value": "active"}}

// Filter by key
{"name": "datastore_filter", "arguments": {"kind": "User", "field": "__key__", "value": "12345"}}
```