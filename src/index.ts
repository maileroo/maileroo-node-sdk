const fs = require('fs');
const _crypto = require('crypto');
const axios = require('axios');

interface EmailData {
  from: string;
  to: string;
  cc: string;
  bcc: string;
  reply_to: string;
  subject: string;
  html: string;
  plain: string;
  tracking: string;
  reference_id: string;
  tags: string;
  template_id: string;
  template_data: string;
}

interface Attachment {
  file: InstanceType<typeof fs.createReadStream>;
  filename: string;
  contentType: string;
}

interface Contact {
  [key: string]: any;
}

class MailerooClient {
  private static readonly EMAIL_API_ENDPOINT = 'https://smtp.maileroo.com/';
  private static readonly CONTACTS_API_ENDPOINT =
    'https://manage.maileroo.app/';
  private static instance: MailerooClient;

  private apiKey: string;
  private emailData: EmailData = {} as EmailData;
  private emailAttachments: Attachment[] = [];
  private emailInlineAttachments: Attachment[] = [];

  private constructor(apiKey: string) {
    this.apiKey = apiKey;
    this.resetEmailData();
  }

  public static getClient(apiKey?: string): MailerooClient {
    if (!MailerooClient.instance && apiKey) {
      MailerooClient.instance = new MailerooClient(apiKey);
    }
    return MailerooClient.instance;
  }

  private resetEmailData(): void {
    this.emailData = {
      from: '',
      to: '',
      cc: '',
      bcc: '',
      reply_to: '',
      subject: '',
      html: '',
      plain: '',
      tracking: 'yes',
      reference_id: '',
      tags: '',
      template_id: '',
      template_data: '',
    };
    this.emailAttachments = [];
    this.emailInlineAttachments = [];
  }

  public setFrom(name: string, address: string): this {
    this.emailData.from += `${name} <${address}>,`;
    return this;
  }

  public setTo(name: string, address: string): this {
    this.emailData.to += `${name} <${address}>,`;
    return this;
  }

  public setCc(name: string, address: string): this {
    this.emailData.cc += `${name} <${address}>,`;
    return this;
  }

  public setBcc(name: string, address: string): this {
    this.emailData.bcc += `${name} <${address}>,`;
    return this;
  }

  public setReplyTo(name: string, address: string): this {
    this.emailData.reply_to += `${name} <${address}>,`;
    return this;
  }

  public setSubject(subject: string): this {
    this.emailData.subject = subject;
    return this;
  }

  public setHtml(html: string): this {
    this.emailData.html = html;
    return this;
  }

  public setPlain(plain: string): this {
    this.emailData.plain = plain;
    return this;
  }

  public addAttachment(
    filePath: string,
    fileName: string,
    fileType: string
  ): this {
    if (fs.existsSync(filePath)) {
      const file = fs.createReadStream(filePath);
      this.emailAttachments.push({
        file,
        filename: fileName,
        contentType: fileType,
      });
    }
    return this;
  }

  public addInlineAttachment(
    filePath: string,
    fileName: string,
    fileType: string
  ): this {
    if (fs.existsSync(filePath)) {
      const file = fs.createReadStream(filePath);
      this.emailInlineAttachments.push({
        file,
        filename: fileName,
        contentType: fileType,
      });
    }
    return this;
  }

  public setReferenceId(referenceId: string): this {
    this.emailData.reference_id = referenceId;
    return this;
  }

  public setTags(tags: string[]): this {
    this.emailData.tags = JSON.stringify(tags);
    return this;
  }

  public setTracking(tracking: boolean): this {
    this.emailData.tracking = tracking ? 'yes' : 'no';
    return this;
  }

  public setTemplateId(templateId: string): this {
    this.emailData.template_id = templateId;
    return this;
  }

  public setTemplateData(templateData: Record<string, any>): this {
    this.emailData.template_data = JSON.stringify(templateData);
    return this;
  }

  private removeTrailingCommas(): void {
    const keys: Array<keyof EmailData> = [
      'from',
      'to',
      'cc',
      'bcc',
      'reply_to',
    ];
    keys.forEach((key) => {
      if (this.emailData[key]) {
        this.emailData[key] = this.emailData[key].replace(/,$/, '');
      }
    });
  }

  private async sendEmailRequest(
    endpoint: string,
    method: 'POST' | 'PUT' = 'POST'
  ): Promise<any> {
    this.removeTrailingCommas();
    const url = `${MailerooClient.EMAIL_API_ENDPOINT}${endpoint}`;
    const headers = {
      'X-API-Key': this.apiKey,
      'Content-Type': 'multipart/form-data',
    };

    const formData: any = { ...this.emailData };

    this.emailAttachments.forEach((attachment, index) => {
      formData[`attachments[${index}]`] = attachment;
    });

    this.emailInlineAttachments.forEach((attachment, index) => {
      formData[`inline_attachments[${index}]`] = attachment;
    });

    try {
      const response = await axios({ method, url, headers, data: formData });
      return response.data;
    } catch (error: any) {
      throw new Error(error?.response?.data?.message || 'An error occurred');
    }
  }

  public async sendBasicEmail(): Promise<boolean> {
    const response = await this.sendEmailRequest('/send', 'POST');
    this.resetEmailData();
    if (response.success) {
      return true;
    }
    throw new Error(response.message);
  }

  public async sendTemplateEmail(): Promise<boolean> {
    const response = await this.sendEmailRequest('/send-template', 'POST');
    this.resetEmailData();
    if (response.success) {
      return true;
    }
    throw new Error(response.message);
  }

  public generateReferenceId(): string {
    return _crypto.randomBytes(12).toString('hex');
  }

  private async sendCustomRequest(
    url: string,
    method: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE' = 'GET',
    data: Record<string, any> = {},
    sendJson: boolean = true
  ): Promise<any> {
    const headers: Record<string, string> = { 'X-API-Key': this.apiKey };
    if (sendJson) headers['Content-Type'] = 'application/json';

    try {
      const response = await axios({
        method,
        url,
        headers,
        data: sendJson ? JSON.stringify(data) : data,
      });
      return response.data;
    } catch (error: any) {
      throw new Error(error?.response?.data?.message || 'An error occurred');
    }
  }

  public async createContact(
    listId: string,
    contact: Contact
  ): Promise<boolean> {
    const url = `${MailerooClient.CONTACTS_API_ENDPOINT}v1/contact/${listId}`;
    const response = await this.sendCustomRequest(url, 'PUT', contact);
    if (response.success) {
      return true;
    }
    throw new Error(response.message);
  }

  public async updateContact(
    listId: string,
    emailAddress: string,
    contact: Contact
  ): Promise<boolean> {
    const url = `${MailerooClient.CONTACTS_API_ENDPOINT}v1/contact/${listId}/${emailAddress}`;
    const response = await this.sendCustomRequest(url, 'PATCH', contact);
    if (response.success) {
      return true;
    }
    throw new Error(response.message);
  }

  public async deleteContact(
    listId: string,
    emailAddress: string
  ): Promise<boolean> {
    const url = `${MailerooClient.CONTACTS_API_ENDPOINT}v1/contact/${listId}/${emailAddress}`;
    const response = await this.sendCustomRequest(url, 'DELETE');
    if (response.success) {
      return true;
    }
    throw new Error(response.message);
  }

  public async getContact(listId: string, emailAddress: string): Promise<any> {
    const url = `${MailerooClient.CONTACTS_API_ENDPOINT}v1/contact/${listId}/${emailAddress}`;
    const response = await this.sendCustomRequest(url, 'GET', {}, false);
    if (response.success) {
      return response.contact;
    }
    throw new Error(response.message);
  }

  public async listContacts(
    listId: string,
    query: string = '',
    page: number = 1
  ): Promise<any[]> {
    const url = `${MailerooClient.CONTACTS_API_ENDPOINT}v1/contacts/${listId}?query=${query}&page=${page}`;
    const response = await this.sendCustomRequest(url, 'GET', {}, false);
    if (response.success) {
      return response.data;
    }
    throw new Error(response.message);
  }
}

export { MailerooClient };
