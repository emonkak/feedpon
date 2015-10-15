import Event from './event';
import {Credential} from 'services/feedly/feedly-interfaces';

export default class AuthSuccessEvent extends Event<Credential> {}
