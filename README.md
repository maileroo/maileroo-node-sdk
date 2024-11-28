
# Maileroo Node.js Client

## Overview

Welcome to the official Node.js SDK for Maileroo, a powerful and flexible email sending API. This SDK allows you to easily integrate Maileroo's email sending capabilities into your PHP applications.

## Features

- Send basic and template-based emails
- Add attachments and inline attachments
- Manage contacts (create, update, delete, and list)
- Generate unique reference IDs for email tracking
- Chainable methods for setting email data

## Installation

```
npm install maileroo
```

## Usage

### Initialization

```typescript
const { MailerooClient } = require('maileroo');

const apiKey = 'your_api_key';
const mailerooClient = MailerooClient.getClient(apiKey);
```

### Sending an Email

#### Basic Email

```typescript
await mailerooClient
  .setFrom('John Doe', 'john@example.com')
  .setTo('Jane Smith', 'jane@example.com')
  .setSubject('Hello World!')
  .setHtml('<h1>Welcome</h1>')
  .setPlain('Welcome')
  .sendBasicEmail();
```

#### Template Email

```typescript
await mailerooClient
  .setFrom('John Doe', 'john@example.com')
  .setTo('Jane Smith', 'jane@example.com')
  .setTemplateId('template_id')
  .setTemplateData({ name: 'Jane' })
  .sendTemplateEmail();
```

### Managing Attachments

```typescript
mailerooClient.addAttachment('./path/to/file.pdf', 'file.pdf', 'application/pdf');
mailerooClient.addInlineAttachment('./path/to/image.png', 'image.png', 'image/png');
```

### Contact Management

#### Create Contact

```typescript
await mailerooClient.createContact('list_id', { email: 'jane@example.com', name: 'Jane Smith' });
```

#### Update Contact

```typescript
await mailerooClient.updateContact('list_id', 'jane@example.com', { name: 'Jane Doe' });
```

#### Delete Contact

```typescript
await mailerooClient.deleteContact('list_id', 'jane@example.com');
```

#### Get Contact

```typescript
const contact = await mailerooClient.getContact('list_id', 'jane@example.com');
console.log(contact);
```

#### List Contacts

```typescript
const contacts = await mailerooClient.listContacts('list_id', 'query', 1);
console.log(contacts);
```

## Error Handling

The library throws errors if an API request fails. Use try-catch blocks to handle these errors gracefully:

```typescript
try {
  await mailerooClient.sendBasicEmail();
} catch (error) {
  console.error(error.message);
}
```

## License

This library is distributed under the MIT License. Feel free to use and modify it.
