const axios = jest.genMockFromModule('axios');

axios.post = async (url, data, config) => {
    if (config.params.password === 'fakeValidPassword') {
        return {
            data: {
                "access_token": "fakeAccessToken",
                "instance_url": "https://my.fake.tld",
                "id": "https://my.fake.tld/id/00D1X0000008bP2UAI/0051t000003LPVHAA4",
                "token_type": "Bearer",
                "issued_at": "1573829868942",
                "signature": "RmFrZSBzaWduYXR1cmU="
            },
            status: 200,
            statusText: 'OK',
            headers: {},
            config: {},
            request: {},
        };
    } else {
        const e = new Error('Request failed with status code 400');
        Object.assign(e, {
            config: {},
            request: {},
            response: {
                data: {
                    error: 'invalid_grant',
                    error_description: 'authentication failure'
                },
                status: 400,
                statusText: 'Bad Request',
                headers: {},
                config: {},
                request: {},
            },
            isAxiosError: true,
        });

        throw e;
    }
};

axios.create = ({baseUrl, headers}) => {
    return {
        request: async function({url, method, data}) {
            const responseData = {
                data: {},
                status: 201,
                statusText: 'OK',
                headers: {},
                config: {},
                request: {},
            };

            if (url.includes('composite')) {
                responseData.data.compositeResponse = [];

                if (data.compositeRequest.find(i => i.referenceId.includes('bad'))) {
                    responseData.status = 400;
                    responseData.statusText = 'Bad Request';

                    for (const r of data.compositeRequest) {

                        responseData.data.compositeResponse.push({
                            "body" : [ {
                                "message" : "Email: invalid email address: Not a real email address",
                                "errorCode" : "INVALID_EMAIL_ADDRESS",
                                "fields" : [ "Email" ]
                            } ],
                            "httpHeaders" : { },
                            "httpStatusCode" : 400,
                            "referenceId" : "badContact"
                        });
                    }

                    const e = new Error('Request failed with status code 400');

                    Object.assign(e, {
                        config: {},
                        request: {},
                        response: responseData,
                        isAxiosError: true,
                    });

                    throw e;
                } else {
                    for (const r of data.compositeRequest) {
                        responseData.data.compositeResponse.push({
                            body: {
                                id: '001R00000033I6AIAU',
                                success: true,
                                errors: []
                            },
                            httpHeaders: {
                                Location: r.url + '/001R00000033I6AIAU',
                            },
                            httpStatusCode: 201,
                            referenceId: r.referenceId,
                        });
                    }

                    return responseData;
                }
            }

            if (data.totally && data.totally === 'wrong') {
                responseData.status = 400;
                responseData.statusText = 'Bad Request';
                responseData.data = [{
                    "message": "You're creating a duplicate record. We recommend you use an existing record instead.",
                    "errorCode": "DUPLICATES_DETECTED",
                    "fields": []
                }];

                const e = new Error('Request failed with status code 400');

                Object.assign(e, {
                    config: {},
                    request: {},
                    response: responseData,
                    isAxiosError: true,
                });

                throw e;
            }

            responseData.data = {
                id: '00Q1w0000029yNwEAI',
                success: true,
                errors: [],
            };

            return responseData;
        }
    };
};

module.exports = axios;
