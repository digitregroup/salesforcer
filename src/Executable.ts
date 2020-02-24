import Auth from './Auth';
import {SalesforceResponse} from './Responses';

export default interface Executable {
    execute(auth: Auth): Promise<SalesforceResponse>;
}
