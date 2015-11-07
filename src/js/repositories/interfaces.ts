import * as feedly from '../services/feedly/interfaces'

export const ICredentialRepository = class {}
export interface ICredentialRepository {
    get(): Promise<feedly.Credential>

    put(credential: feedly.Credential): Promise<void>

    delete(): Promise<void>
}
