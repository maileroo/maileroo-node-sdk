const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export interface EmailAddressJSON {
    address: string;
    display_name?: string;
}

export class EmailAddress {

    private readonly address: string;
    private readonly displayName: string | null;

    constructor(address: string, displayName?: string | null) {

        if (address.trim() === "") {
            throw new Error("Email address must be a non-empty string.");
        }

        if (!EMAIL_RE.test(address)) {
            throw new Error("Invalid email address format: " + address);
        }

        if (displayName !== undefined && displayName !== null) {

            if (displayName.trim() === "") {
                throw new Error("Display name must be a non-empty string or null.");
            }

        }

        this.address = address;
        this.displayName = displayName ?? null;

    }

    getAddress(): string {
        return this.address;
    }

    getDisplayName(): string | null {
        return this.displayName;
    }

    toJSON(): EmailAddressJSON {
        const data: EmailAddressJSON = {address: this.address};
        if (this.displayName !== null) data.display_name = this.displayName;
        return data;
    }

}

export default EmailAddress;