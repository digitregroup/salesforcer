import Auth from './Auth';
import {Method} from 'axios';

export default interface Composable {
    getMethod(): Method;
    getBody(): object | undefined;
    validate(): boolean | never;
    buildUrl(auth: Auth): Promise<string>;
}
