# Prompt-to-Workflow Feature

A natural language interface for generating workflows from user prompts. This feature allows users to describe what they want their workflow to do in plain English, and the system will generate a complete workflow with appropriate triggers and actions.

## Features

### 1. Prompt Input Interface
- Clean, intuitive UI for entering workflow requirements
- Support for natural language descriptions
- Example prompts for common use cases
- Template selection to guide workflow generation

### 2. Template System
- Email Automation: Send, receive, and process emails
- Social Media: Post and interact on social platforms
- Data Processing: Automate data collection and analysis
- Notifications: Send alerts and notifications

### 3. AI-Powered Generation
- Analyzes user prompts to extract key requirements
- Determines appropriate trigger type (manual, schedule, webhook)
- Suggests relevant actions based on prompt keywords
- Generates valid workflow structure with nodes and edges

### 4. Workflow Customization
- Generated workflows are fully editable in the workflow designer
- Users can modify, add, or remove nodes after generation
- Supports all existing action types (Gmail, Slack, Twitter, Database, etc.)

## Usage

### From the Dashboard
1. Click "Create with Prompt" button on the dashboard
2. Enter your workflow requirements in the text area
3. (Optional) Select a template to guide generation
4. Click "Generate Workflow"
5. Review and edit the generated workflow
6. Save and execute the workflow

### API Endpoint
**URL:** `POST /api/v1/workflow/generate`

**Headers:**
- `Authorization`: Bearer token or cookie-based authentication
- `Content-Type`: application/json

**Body:**
```json
{
  "prompt": "Send an email to my team every Monday morning with a summary of last week's sales",
  "template": "email-automation"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Workflow generated successfully",
  "data": {
    "workflowId": "cmksucu5t0001gssntp8wspd4",
    "name": "Send an email to my team every Monday morning with a summary of last week's sales",
    "active": false,
    "createdAt": "2026-01-25T11:30:00Z"
  },
  "statusCode": 201
}
```

## How It Works

### 1. Prompt Analysis
The system analyzes the user's prompt to extract key information:
- **What:** The main action to be performed
- **When:** The trigger condition (manual, scheduled, webhook)
- **Where:** The target system or service
- **Details:** Additional parameters (recipients, content, etc.)

### 2. Workflow Generation
Based on the analysis, the system generates a workflow with:
- **Trigger Node:** Manual, schedule, or webhook based on the prompt
- **Action Node:** Appropriate action type (email, Slack, Twitter, etc.)
- **Connections:** Edge connecting the trigger to the action
- **Configurable Fields:** Placeholders for user-specific information

### 3. Template Application
If a template is selected, it provides additional context:
- Pre-defined node types and configurations
- Common workflow patterns for specific use cases
- Example configurations for quick setup

## Examples

### Email Automation
**Prompt:** "Send a daily email summary of new support tickets"

**Generated Workflow:**
- Trigger: Scheduled (daily at 9 AM)
- Action: Send Email (Gmail) with dynamic content from support system

### Social Media
**Prompt:** "Post a tweet every morning with a random quote"

**Generated Workflow:**
- Trigger: Scheduled (daily at 8 AM)
- Action: Send Tweet (Twitter) with content from quote API

### Data Processing
**Prompt:** "Extract sales data from CSV and save to Google Sheets"

**Generated Workflow:**
- Trigger: Manual (button click)
- Action: Read CSV File, Transform Data, Save to Google Sheets

## Future Enhancements

### AI Integration
- Integration with OpenAI GPT-4 for more advanced prompt understanding
- Natural language to code conversion for custom actions
- Enhanced error handling and suggestions for ambiguous prompts

### Advanced Templates
- Pre-built templates for complex workflows
- Template sharing and community contributions
- Template versioning and updates

### Interactive Generation
- Step-by-step refinement of generated workflows
- Auto-complete suggestions for common workflow patterns
- Real-time preview of generated workflow structure

### Collaboration
- Shared prompt history and workflow templates
- Comments and feedback on generated workflows
- Team collaboration on workflow design

## Technical Details

### Frontend
- React-based UI with Tailwind CSS
- Integration with existing workflow editor
- Responsive design for mobile and desktop

### Backend
- Node.js with Express framework
- Prompt parsing and analysis service
- Workflow generation based on templates and patterns
- Integration with existing workflow API

### Database
- Stores generated workflows in PostgreSQL
- Supports template management and prompt history
- Provides analytics on prompt usage and workflow generation success rates
