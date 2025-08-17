# Maileroo Node.js SDK

Maileroo is a robust email delivery platform designed for effortless sending of transactional and marketing emails. This Node.js SDK offers a straightforward interface for working with the Maileroo API, supporting basic email formats,
templates, bulk sending, and scheduling capabilities.

# Features

- Send basic HTML or plain text emails with ease
- Use pre-defined templates with dynamic data
- Send up to 500 personalized emails in bulk
- Schedule emails for future delivery
- Manage scheduled emails (list & delete)
- Add tags, custom headers, and reference IDs
- Attach files to your emails
- Support for multiple recipients, CC, BCC, and Reply-To
- Enable or disable open and click tracking
- Built-in input validation and error handling

## Install

```bash
npm i maileroo-sdk
# or
yarn add maileroo-sdk
```

## Quick Start

```javascript
import {MailerooClient, EmailAddress, Attachment} from "maileroo-sdk";

const client = new MailerooClient("your-api-key");

const referenceId = await client.sendBasicEmail({
    from: new EmailAddress("sender@example.com", "Sender Name"),
    to: [new EmailAddress("recipient@example.com", "Recipient Name")],
    subject: "Hello from Maileroo!",
    html: "<h1>Hello World!</h1><p>This is a test email.</p>",
    plain: "Hello World! This is a test email."
});

console.log("Email sent with reference ID:", referenceId);
```

## Usage Examples

### 1. Basic Email with Attachments

```javascript
import {MailerooClient, EmailAddress, Attachment} from "maileroo-sdk";

const client = new MailerooClient("your-api-key");

const referenceId = await client.sendBasicEmail({
    from: new EmailAddress("sender@example.com", "Your Company"),
    to: [
        new EmailAddress("john@example.com", "John Doe"),
        new EmailAddress("jane@example.com")
    ],
    cc: [new EmailAddress("manager@example.com", "Manager")],
    bcc: [new EmailAddress("archive@example.com")],
    reply_to: new EmailAddress("support@example.com", "Support Team"),
    subject: "Monthly Report",
    html: "<h1>Monthly Report</h1><p>Please find the report attached.</p>",
    plain: "Monthly Report - Please find the report attached.",
    attachments: [
        await Attachment.fromFile("/path/to/report.pdf", "application/pdf", false),
        Attachment.fromContent("data.csv", "id,name\n1,John", "text/csv", false, false),
        await Attachment.fromStream("stream.txt", Readable.from(["Hello world from a stream!"]), "text/plain", false),
    ],
    tracking: true,
    tags: {campaign: "monthly-report", type: "business"},
    headers: {
        "X-Custom-Header": "Custom Value",
        "X-Another-Header": "Another Value"
    },
    reference_id: client.getReferenceId()
});
```

### 2. Sending Emails with Templates

```javascript
const referenceId = await client.sendTemplatedEmail({
    from: new EmailAddress("noreply@example.com", "Your App"),
    to: new EmailAddress("user@example.com", "John Doe"),
    subject: "Welcome to Our Service!",
    template_id: 123,
    template_data: {
        user_name: "John Doe",
        activation_link: "https://example.com/activate/abc123",
        company_name: "Your Company"
    }
});
```

### 3. Bulk Email Sending

```javascript
const result = await client.sendBulkEmails({
    subject: "Newsletter - March 2024",
    html: "<h1>Hello {{name}}!</h1><p>Here’s your newsletter.</p>",
    plain: "Hello {{name}}! Here’s your newsletter.",
    tracking: false,
    tags: {campaign: "newsletter", month: "march"},
    messages: [
        {
            from: new EmailAddress("newsletter@example.com", "Newsletter Team"),
            to: new EmailAddress("john@example.com", "John Doe"),
            template_data: {name: "John"}
        },
        {
            from: new EmailAddress("newsletter@example.com", "Newsletter Team"),
            to: new EmailAddress("jane@example.com", "Jane Smith"),
            template_data: {name: "Jane"}
        }
    ]
});

console.log("Bulk email reference IDs:", result);
```

### 4. Scheduling Emails

```javascript
const scheduledAt = new Date(Date.now() + 24 * 3600 * 1000);

const referenceId = await client.sendBasicEmail({
    from: new EmailAddress("scheduler@example.com", "Scheduler"),
    to: new EmailAddress("recipient@example.com", "Recipient"),
    subject: "Scheduled Email - Daily Report",
    html: "<h1>Daily Report</h1><p>This was scheduled.</p>",
    plain: "Daily Report - Scheduled",
    scheduled_at: scheduledAt
});

console.log("Scheduled with reference ID:", referenceId);
```

### 5. Managing Scheduled Emails

```javascript
const scheduled = await client.getScheduledEmails(1, 20);

for (const email of scheduled.results) {
    console.log("Email:", email.reference_id, email.subject);
    if (email.reference_id === "cancel-me") {
        await client.deleteScheduledEmail(email.reference_id);
        console.log("Cancelled email:", email.reference_id);
    }
}
```

### 6. Deleting Scheduled Emails

```javascript
const referenceId = "your-scheduled-email-reference-id";
await client.deleteScheduledEmail(referenceId);
console.log("Deleted scheduled email with reference ID:", referenceId);
```

## API Reference

### MailerooClient

```
new MailerooClient(apiKey: string, timeoutSec?: number)
```

#### Methods

- `sendBasicEmail(data): Promise<string>`
- `sendTemplatedEmail(data): Promise<string>`
- `sendBulkEmails(data): Promise<string[]>`
- `getScheduledEmails(page?: number, per_page?: number): Promise<object>`
- `deleteScheduledEmail(referenceId: string): Promise<boolean>`
- `getReferenceId(): string`

### EmailAddress

```
new EmailAddress(address: string, displayName?: string)
```

- `.getAddress()`
- `.getDisplayName()`
- `.toJSON()`

### Attachment

Factory Methods:

- `Attachment.fromFile(path: string, contentType?: string, inline?: boolean): Promise<Attachment>`
- `Attachment.fromContent(fileName: string, content: string|Buffer, contentType?: string, inline?: boolean, isBase64?: boolean): Attachment`
- `Attachment.fromStream(fileName: string, stream: AsyncIterable<Buffer>, contentType?: string, inline?: boolean): Promise<Attachment>`

## Documentation

For detailed API documentation, including all available endpoints, parameters, and response formats, please refer to the [Maileroo API Documentation](https://maileroo.com/docs).

## License

This SDK is released under the MIT License.

## Support

Please visit our [support page](https://maileroo.com/contact-form) for any issues or questions regarding Maileroo. If you find any bugs or have feature requests, feel free to open an issue on our GitHub repository.