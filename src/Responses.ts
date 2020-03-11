/** The base part of the Error response from Salesforce */
export interface SalesforceErrorObject {
    message: string;
    errorCode: string;
    fields?: Array<string>;
}

/** Salesforce errors are wrapped inside arrays */
export type SalesforceError = Array<SalesforceErrorObject>;

/** A marker interface for easyier use in CompositeSubrequestResponse */
// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface SalesforceResponse {}

export interface CompositeResponse extends SalesforceResponse {
    compositeResponse: Array<CompositeSubrequestResponse>;
}

export interface CompositeSubrequestResponse {
    body: SalesforceResponse | SalesforceError | null;
    httpHeaders: Map<string, string>;
    httpStatusCode: number;
    referenceId: string;
}

/** A marker interface for easyier use in SObjects */
export type RecordResponse = SalesforceResponse;

export interface SalesforceRecord extends RecordResponse {
    attributes: {
        type: string;
        url: string;
    };
}

export interface QueryResponse<T extends SalesforceRecord> extends RecordResponse {
    totalSize: number;
    done: boolean;
    records: Array<T>;
}

/** The response from a POST on /sobjects API */
export interface RecordCreateResponse extends RecordResponse {
    id: string;
    success: boolean;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    errors: Array<any>; // I actualy have yet to find a case where it is not empty
}





