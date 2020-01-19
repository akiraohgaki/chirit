interface QueryStringDict {
    [key: string]: string;
}
export default class Utility {
    static parseQueryString(queryString?: string): QueryStringDict;
    static convertByteToHumanReadable(byte: number): string;
    static convertDatetimeToHumanReadable(datetime: string | number | Date): string;
    static generateRandomString(length?: number, addition?: string): string;
}
export {};
