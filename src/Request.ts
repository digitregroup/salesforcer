import Executable from "./Executable";
import Validable from "./Validable";
import {AxiosInstance, Method} from 'axios';

abstract class Request implements Executable, Validable {
    static readonly urlPrefix: string = '/services/data/';

    apiVersion?: string;

    abstract buildUrl(apiVersion: string): string;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    abstract execute(apiVersion: string, axios: AxiosInstance): Promise<any>;

    abstract validate(): boolean | never;

    abstract getBody(): object | undefined;

    abstract getMethod(): Method;
}

export default Request;
