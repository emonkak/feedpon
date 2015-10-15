import HttpClient from 'services/http/HttpClient';

((self: Worker) => {
    let httpClient = new HttpClient();

    self.onmessage = (e) => {
        let message = e.data;
        let id = message.id;
        let request = message.request;

        httpClient.send(request)
            .then((resopnse) => self.postMessage({id: id, response: response, success: true}))
            .catch((response) => self.postMessage({id: id, response: response, success: false}));
    };
})(<any> self);
