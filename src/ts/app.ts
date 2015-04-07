import HttpClient from './services/http/HttpClient';

new HttpClient().send({method: 'GET', url: '/index.html'});
