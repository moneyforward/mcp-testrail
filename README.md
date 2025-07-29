# TestRail MCP Server

A Model Context Protocol (MCP) server that provides integration with TestRail, allowing AI assistants to interact with TestRail projects, test cases, test runs, and results.

## Features

### Tools
- **get_projects**: Retrieve all TestRail projects
- **get_project**: Get details of a specific project
- **get_test_cases**: Retrieve test cases with optional filtering
- **create_test_case**: Create new test cases
- **get_test_runs**: Retrieve test runs for a project
- **create_test_run**: Create new test runs
- **add_test_result**: Add test results to test runs
- **get_users**: Retrieve TestRail users
- **test_connection**: Test the connection to TestRail
- **parse_testrail_url**: 🆕 Parse TestRail URLs and auto-call appropriate tools

### Resources
- **testrail://projects**: Access to all TestRail projects
- **testrail://users**: Access to all TestRail users

### Prompts
- **test_case_template**: Generate comprehensive test case templates
- **test_run_summary**: Generate detailed test run summary reports

## Installation

1. Clone this repository:
```bash
git clone <repository-url>
cd mcp-testrail
```

2. Install dependencies:
```bash
npm install
```

3. Build the project:
```bash
npm run build
```

## Configuration

Create a `.env` file in the root directory with your TestRail configuration:

```env
TESTRAIL_URL=https://your-company.testrail.io
TESTRAIL_USERNAME=your-email@company.com
TESTRAIL_API_KEY=your-api-key
DEFAULT_PROJECT_ID=1
```

### Getting TestRail API Credentials

1. Log in to your TestRail instance
2. Go to your user profile (click on your name in the top-right corner)
3. Navigate to the "API Keys" tab
4. Generate a new API key
5. Use your email address as the username and the generated key as the API key

## Usage

### With Claude Desktop

Add the server to your Claude Desktop configuration file (`claude_desktop_config.json`):

```json
{
  "mcpServers": {
    "testrail": {
      "command": "node",
      "args": ["/path/to/mcp-testrail/dist/index.js"],
      "env": {
        "TESTRAIL_URL": "https://your-company.testrail.io",
        "TESTRAIL_USERNAME": "your-email@company.com",
        "TESTRAIL_API_KEY": "your-api-key"
      }
    }
  }
}
```

### Direct Usage

You can also run the server directly:

```bash
npm start
```

Or in development mode:

```bash
npm run dev
```

## Development

### Project Structure

```
src/
├── index.ts              # Main MCP server implementation
├── testrail-client.ts    # TestRail API client
└── types.ts              # TypeScript type definitions
```

### Available Scripts

- `npm run build`: Build the TypeScript project
- `npm run watch`: Build and watch for changes
- `npm start`: Start the compiled server
- `npm run dev`: Start the server in development mode with ts-node
- `npm run lint`: Lint the source code

### Building

```bash
npm run build
```

### Testing

Test the connection to TestRail:

```bash
npm run dev
# Then use the test_connection tool
```

## API Coverage

This MCP server covers the following TestRail API endpoints:

### Projects
- `GET /get_projects` - Get all projects
- `GET /get_project/{id}` - Get project details

### Test Cases
- `GET /get_cases/{project_id}` - Get test cases
- `GET /get_case/{id}` - Get test case details
- `POST /add_case/{section_id}` - Create test case
- `POST /update_case/{id}` - Update test case

### Test Runs
- `GET /get_runs/{project_id}` - Get test runs
- `GET /get_run/{id}` - Get test run details
- `POST /add_run/{project_id}` - Create test run
- `POST /close_run/{id}` - Close test run

### Test Results
- `GET /get_results/{test_id}` - Get test results
- `POST /add_result/{test_id}` - Add test result
- `POST /add_result_for_case/{run_id}/{case_id}` - Add result for specific case

### Users
- `GET /get_users` - Get all users
- `GET /get_user/{id}` - Get user details

### Suites & Sections
- `GET /get_suites/{project_id}` - Get test suites
- `GET /get_sections/{project_id}` - Get sections
- `GET /get_milestones/{project_id}` - Get milestones

## Examples

### URL Parsing (New Feature!)

Simply paste any TestRail URL and get the data automatically:

```javascript
// Parse a test case URL
{
  "url": "https://moneyforward.tmxtestrail.com/index.php?/cases/view/2322865"
}
// Automatically detects it's a test case and retrieves case ID 2322865

// Parse a test run URL  
{
  "url": "https://company.testrail.io/runs/view/456"
}
// Automatically detects it's a test run and retrieves run details

// Parse test cases list with filters
{
  "url": "https://company.testrail.io/cases/123?suite_id=5&section_id=10"
}
// Automatically retrieves filtered test cases
```

### Creating a Test Case

```javascript
// Using the create_test_case tool
{
  "sectionId": 123,
  "title": "Test user login functionality",
  "type_id": 1,
  "priority_id": 2,
  "custom_steps_separated": [
    {
      "content": "Navigate to login page",
      "expected": "Login page is displayed"
    },
    {
      "content": "Enter valid credentials",
      "expected": "User is logged in successfully"
    }
  ]
}
```

### Adding Test Results

```javascript
// Using the add_test_result tool
{
  "runId": 456,
  "caseId": 789,
  "status_id": 1, // Passed
  "comment": "Test executed successfully",
  "elapsed": "5m",
  "version": "v1.2.3"
}
```

## Error Handling

The server includes comprehensive error handling and will return detailed error messages for:
- Invalid TestRail credentials
- Network connectivity issues
- Invalid parameters
- TestRail API errors

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details.

## Support

For issues and questions:
1. Check the TestRail API documentation
2. Verify your credentials and network connectivity
3. Check the server logs for detailed error messages
4. Open an issue in this repository 