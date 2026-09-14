export class BaseApi {

    basePath = 'http://localhost:3000/';

    constructor() {}

    protected doFetch(
        url: string,
        method: RequestInit['method'] = 'GET',
        query: Record<string, string> | null = null,
        body: Record<string, unknown> | null = null
    ) {
        let params = '';
        if (query) {
            params = '?' + new URLSearchParams(query).toString();
        }

        const fetchParams: RequestInit = { method };

        if (body) {
            fetchParams.body = JSON.stringify(body);
            fetchParams.headers = {
                'Content-Type': 'application/json',
            };
        }

        return fetch(this.basePath + url + params, fetchParams);
    }
}