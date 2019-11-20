import {AxiosInstance} from "axios";

interface Executable {
    buildUrl(apiVersion: string): string;

    // Data from external APIs could be anything and could also change
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    execute(apiVersion: string, axios: AxiosInstance): Promise<any>;
}

export default Executable;
