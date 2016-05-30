export interface Redirection {
    url: string;
    redirectUrl: string;
}

export const IRedirectionRepository = class {};
export interface IRedirectionRepository {
    get(url: string): Promise<Redirection>;

    put(redirection: Redirection): Promise<void>;
}
