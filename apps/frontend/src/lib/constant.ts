/* eslint-disable @typescript-eslint/no-explicit-any */
export const actionSchemas: Record<string, any> = {
  Telegram: {
    fields: [
      {
        name: "useOutputFromPreviousNode",
        label: "Use Output from Previous Node",
        type: "toggle",
        required: false,
        defaultValue: false,
        description: "Automatically use the output from the previous node as the message content",
        autoPopulateField: "message",
        autoPopulateTemplate: "{{previousNode.content}}"
      },
      {
        name: "chatId",
        label: "Chat ID",
        type: "text",
        required: true,
        placeholder: "Enter chat ID (e.g., 123456789) or username (e.g., @username or username)",
        description: "Numeric chat ID or username (@ is optional, will be added automatically)"
      },
      {
        name: "message",
        label: "Message",
        type: "textarea",
        required: true,
        placeholder: "Enter your message here... Or use {{previousNode.content}} for dynamic data",
        description: "The message content to send. Supports dynamic templates like {{previousNode.content}}"
      },
      {
        name: "parseMode",
        label: "Parse Mode",
        type: "select",
        required: false,
        options: ["None", "HTML", "Markdown", "MarkdownV2"],
        placeholder: "Select parse mode (optional)",
        description: "Format for the message text. None = plain text, HTML/Markdown for rich formatting"
      }
    ]
  },
  GmailTrigger: {
    fields: [
      {
        name: "label",
        label: "Label",
        type: "text",
        required: false,
        placeholder: "INBOX",
        description: "Gmail label to monitor (default: INBOX)"
      },
      {
        name: "subjectFilter",
        label: "Subject Filter",
        type: "text",
        required: false,
        placeholder: "invoice",
        description: "Filter emails by subject keyword"
      },
      {
        name: "fromFilter",
        label: "From",
        type: "text",
        required: false,
        placeholder: "sender@example.com",
        description: "Filter emails by sender"
      },
      {
        name: "hasAttachments",
        label: "Has Attachments",
        type: "toggle",
        required: false,
        description: "Only trigger on emails with attachments"
      }
    ]
  },

  OpenAi: {
    fields: [
      {
        name: "useOutputFromPreviousNode",
        label: "Use Output from Previous Node",
        type: "toggle",
        required: false,
        defaultValue: false,
        description: "Use the previous node's output as the prompt (useful for processing emails, webhooks, etc.)",
        autoPopulateField: "prompt",
        autoPopulateTemplate: "{{previousNode.content}}"
      },
      {
        name: "prompt",
        label: "Prompt",
        type: "textarea",
        required: true,
        placeholder: "Enter your prompt... Or use {{previousNode.content}} to reference previous output",
        description: "The prompt for the AI. Supports dynamic templates like {{previousNode.content}} or {{previousNode.data.body}}"
      },
      {
        name: "model",
        label: "Model",
        type: "select",
        required: true,
        options: ["gpt-5-mini", "gpt-5", "gpt-5.1"],
      }
    ]
  },

  OpenRouter: {
    fields: [
      {
        name: "useOutputFromPreviousNode",
        label: "Use Output from Previous Node",
        type: "toggle",
        required: false,
        defaultValue: false,
        description: "Use the previous node's output as the prompt (useful for processing emails, webhooks, etc.)",
        autoPopulateField: "prompt",
        autoPopulateTemplate: "{{previousNode.content}}"
      },
      {
        name: "prompt",
        label: "Prompt",
        type: "textarea",
        required: true,
        placeholder: "Enter your prompt... Or use {{previousNode.content}} to reference previous output",
        description: "The prompt for the AI. Supports dynamic templates like {{previousNode.content}} or {{previousNode.data}}"
      },
      {
        name: "model",
        label: "Model",
        type: "select",
        required: true,
        options: [
          "openai/gpt-5-mini",
          "openai/gpt-5",
          "openai/gpt-3.5-turbo",
          "anthropic/claude-4.5-opus",
          "anthropic/claude-4-sonnet",
          "anthropic/claude-4.5-haiku",
          "google/gemini-3",
        ],
      }
    ]
  },

  WebHookNodeType: {
    fields: [
      {
        name: "url",
        label: "Webhook URL",
        type: "text",
        required: true,
        placeholder: "https://api.example.com/webhook"
      },
      {
        name: "method",
        label: "HTTP Method",
        type: "select",
        required: true,
        options: ["GET", "POST", "PUT", "DELETE", "PATCH"]
      },
      {
        name: "headers",
        label: "Headers (JSON)",
        type: "textarea",
        required: false,
        placeholder: '{"Content-Type": "application/json"}'
      },
      {
        name: "body",
        label: "Request Body",
        type: "textarea",
        required: false,
        placeholder: "Request payload"
      }
    ]
  },
  SlackNodeType: {
    fields: [
      {
        name: "channel",
        label: "Channel ID",
        type: "text",
        required: true,
        placeholder: "C12345678",
        description: "The Slack Channel ID to send the message to"
      },
      {
        name: "message",
        label: "Message",
        type: "textarea",
        required: true,
        placeholder: "Hello from workflow! {{previousNode.content}}",
        description: "The message content"
      }
    ]
  },
  DiscordNodeType: {
    fields: [
      {
        name: "webhookUrl",
        label: "Webhook URL",
        type: "text",
        required: true,
        placeholder: "https://discord.com/api/webhooks/...",
        description: "The Discord Webhook URL"
      },
      {
        name: "content",
        label: "Message Content",
        type: "textarea",
        required: true,
        placeholder: "Hello from workflow! {{previousNode.content}}",
        description: "The message content"
      }
    ]
  },
  GoogleSheetsNodeType: {
    fields: [
      {
        name: "spreadsheetId",
        label: "Spreadsheet ID",
        type: "text",
        required: true,
        placeholder: "1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms"
      },
      {
        name: "range",
        label: "Range",
        type: "text",
        required: true,
        placeholder: "Sheet1!A1:B2"
      },
      {
        name: "values",
        label: "Values (JSON Array)",
        type: "textarea",
        required: true,
        placeholder: '[["Value 1", "Value 2"]]',
        description: "JSON array of arrays for the row data"
      },
      {
        name: "operation",
        label: "Operation",
        type: "select",
        required: true,
        options: ["APPEND", "UPDATE"],
        description: "Append to end or update specific range"
      }
    ]
  },
  AwsS3NodeType: {
    fields: [
      {
        name: "bucket",
        label: "Bucket Name",
        type: "text",
        required: true,
        placeholder: "my-bucket"
      },
      {
        name: "key",
        label: "File Key (Path)",
        type: "text",
        required: true,
        placeholder: "folder/file.json"
      },
      {
        name: "content",
        label: "File Content",
        type: "textarea",
        required: false,
        placeholder: "Content to upload...",
        description: "Required for Upload operation"
      },
      {
        name: "operation",
        label: "Operation",
        type: "select",
        required: true,
        options: ["UPLOAD", "READ"],
      }
    ]
  },
  DelayNodeType: {
    fields: [
      {
        name: "duration",
        label: "Duration (ms)",
        type: "number",
        required: true,
        placeholder: "1000",
        description: "Wait time in milliseconds"
      }
    ]
  },
  FilterNodeType: {
    fields: [
      {
        name: "field",
        label: "Field to Check",
        type: "text",
        required: true,
        placeholder: "{{previousNode.status}}",
        description: "The value or Reference to check"
      },
      {
        name: "operator",
        label: "Operator",
        type: "select",
        required: true,
        options: ["equals", "contains", "greaterThan", "lessThan", "notEquals"],
      },
      {
        name: "value",
        label: "Value to compare against",
        type: "text",
        required: true,
        placeholder: "success"
      }
    ]
  },
  CodeNodeType: {
    fields: [
      {
        name: "code",
        label: "JavaScript Code",
        type: "textarea",
        required: true,
        placeholder: "return previousNode.data.value * 2;",
        description: "Function body. 'previousNode' and 'context' are available."
      }
    ]
  },
  Resend: {
    fields: [
      {
        name: "useOutputFromPreviousNode",
        label: "Use Output from Previous Node",
        type: "toggle",
        required: false,
        defaultValue: false,
        description: "Automatically use the output from the previous node as the email content",
        autoPopulateField: "html",
        autoPopulateTemplate: "<p>{{previousNode.content}}</p>"
      },
      {
        name: "from",
        label: "From",
        type: "text",
        required: true,
        placeholder: "sender@yourdomain.com",
        description: "Sender email address (must be from a verified domain in Resend). Example: noreply@yourdomain.com"
      },
      {
        name: "to",
        label: "To",
        type: "text",
        required: true,
        placeholder: "recipient@example.com",
        description: "Recipient email address(es). Use comma-separated for multiple recipients"
      },
      {
        name: "subject",
        label: "Subject",
        type: "text",
        required: true,
        placeholder: "Your email subject... Or use {{previousNode.subject}} for email threads",
        description: "Email subject line. Supports templates like Re: {{previousNode.subject}}"
      },
      {
        name: "html",
        label: "HTML Content",
        type: "textarea",
        required: true,
        placeholder: "<h1>Hello</h1><p>Your email content here...</p> Or use {{previousNode.content}}",
        description: "Email body in HTML format. Supports dynamic templates like <p>{{previousNode.content}}</p>"
      },
      {
        name: "text",
        label: "Plain Text (Optional)",
        type: "textarea",
        required: false,
        placeholder: "Plain text version of your email...",
        description: "Plain text fallback for email clients that don't support HTML"
      },
      {
        name: "replyTo",
        label: "Reply To (Optional)",
        type: "text",
        required: false,
        placeholder: "replyto@example.com",
        description: "Email address for replies"
      }
    ]
  },
  createTrelloCard: {
    fields: [
      {
        name: "listId",
        label: "List ID",
        type: "text",
        required: true,
        placeholder: "64e...",
        description: "The Trello List ID to add the card to"
      },
      {
        name: "cardTitle",
        label: "Card Title",
        type: "text",
        required: true,
        placeholder: "New Task: {{previousNode.subject}}",
        description: "Title of the card"
      },
      {
        name: "description",
        label: "Description",
        type: "textarea",
        required: false,
        placeholder: "{{previousNode.body}}",
        description: "Card description"
      }
    ]
  },
  downloadFile: {
    fields: [
      {
        name: "fileId",
        label: "File ID",
        type: "text",
        required: true,
        placeholder: "1A2B3C...",
        description: "Google Drive File ID"
      },
      {
        name: "destination",
        label: "Destination Path",
        type: "text",
        required: false,
        placeholder: "/tmp/downloads/",
        description: "Local path to save file (optional)"
      }
    ]
  },
  analyzeData: {
    fields: [
      {
        name: "data",
        label: "Data Input",
        type: "textarea",
        required: true,
        placeholder: "{{previousNode.content}}",
        description: "Data to analyze (JSON, CSV, or text)"
      },
      {
        name: "prompt",
        label: "Analysis Prompt",
        type: "textarea",
        required: true,
        placeholder: "Analyze this data for trends...",
        description: "Instructions for the AI analyst"
      },
      {
        name: "model",
        label: "Model",
        type: "select",
        required: true,
        options: ["gpt-4o", "gpt-4-turbo", "claude-3-opus"],
      }
    ]
  },
  // sendSlackMessage is assigned below to avoid circular reference
  sendTweet: {
    fields: [
      {
        name: "text",
        label: "Tweet Content",
        type: "textarea",
        required: true,
        placeholder: "Hello World! {{previousNode.content}}",
        description: "The content of your tweet"
      }
    ]
  },
  // sendEmail is assigned below
  saveToDatabase: {
    fields: [
      {
        name: "table",
        label: "Table Name",
        type: "text",
        required: true,
        placeholder: "workflow_results"
      },
      {
        name: "data",
        label: "Data (JSON)",
        type: "textarea",
        required: true,
        placeholder: "{{previousNode.content}}",
        description: "JSON object to save"
      }
    ]
  }
};

// Fix circular reference for aliases by assigning after definition
// Note: We can't spread actionSchemas inside itself during initialization.
// A safer approach is to duplicate the simple schemas or assign them after export in a real app.
// For now, I will duplicate the simple Slack fields to avoid runtime errors if 'actionSchemas' is not fully init.
actionSchemas.sendSlackMessage = actionSchemas.SlackNodeType;
actionSchemas.sendEmail = actionSchemas.Resend;
actionSchemas.extractInvoiceData = actionSchemas.OpenAi;
actionSchemas.openAiNodeType = actionSchemas.OpenAi;
actionSchemas.TelegramNodeType = actionSchemas.Telegram;
actionSchemas.ResendNodeType = actionSchemas.Resend;
actionSchemas.openRouterNodeType = actionSchemas.OpenRouter;
actionSchemas.EmailNodeType = actionSchemas.GmailTrigger;
actionSchemas.EmailTriggerType = actionSchemas.GmailTrigger;
actionSchemas.transformData = actionSchemas.CodeNodeType; // Map transformData to Code node
actionSchemas.fetchData = actionSchemas.OpenAi; // Map fetchData to OpenAI node
