interface Contact {
    [key: string]: any;
}
declare class MailerooClient {
    private static readonly EMAIL_API_ENDPOINT;
    private static readonly CONTACTS_API_ENDPOINT;
    private static instance;
    private apiKey;
    private emailData;
    private emailAttachments;
    private emailInlineAttachments;
    private constructor();
    static getClient(apiKey?: string): MailerooClient;
    private resetEmailData;
    setFrom(name: string, address: string): this;
    setTo(name: string, address: string): this;
    setCc(name: string, address: string): this;
    setBcc(name: string, address: string): this;
    setReplyTo(name: string, address: string): this;
    setSubject(subject: string): this;
    setHtml(html: string): this;
    setPlain(plain: string): this;
    addAttachment(filePath: string, fileName: string, fileType: string): this;
    addInlineAttachment(filePath: string, fileName: string, fileType: string): this;
    setReferenceId(referenceId: string): this;
    setTags(tags: string[]): this;
    setTracking(tracking: boolean): this;
    setTemplateId(templateId: string): this;
    setTemplateData(templateData: Record<string, any>): this;
    private removeTrailingCommas;
    private sendEmailRequest;
    sendBasicEmail(): Promise<boolean>;
    sendTemplateEmail(): Promise<boolean>;
    generateReferenceId(): string;
    private sendCustomRequest;
    createContact(listId: string, contact: Contact): Promise<boolean>;
    updateContact(listId: string, emailAddress: string, contact: Contact): Promise<boolean>;
    deleteContact(listId: string, emailAddress: string): Promise<boolean>;
    getContact(listId: string, emailAddress: string): Promise<any>;
    listContacts(listId: string, query?: string, page?: number): Promise<any[]>;
}
export { MailerooClient };
//# sourceMappingURL=index.d.ts.map