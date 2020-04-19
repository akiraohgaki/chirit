import { Dictionary } from './types.js';
export default class Utility {
    static parseQueryString(queryString?: string): Dictionary<string>;
    static convertByteToHumanReadable(byte: number): string;
    static convertDatetimeToHumanReadable(datetime: string | number | Date): string;
    static generateRandomString(length?: number, addition?: string): string;
}
