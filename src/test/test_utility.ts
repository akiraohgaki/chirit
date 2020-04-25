import {Utility} from '../chirit.js';

export default function() {
    console.log(Utility.parseQueryString());
    console.log(Utility.parseQueryString('?key1=value1&key2'));

    console.log(Utility.convertByteToHumanReadable(10000000000000000000000000));

    console.log(Utility.convertDatetimeToHumanReadable('3000-01-01'));
    console.log(Utility.convertDatetimeToHumanReadable(Date.now() - 86400000));
    console.log(Utility.convertDatetimeToHumanReadable(new Date()));

    console.log(Utility.generateRandomString());
    console.log(Utility.generateRandomString(4));
    console.log(Utility.generateRandomString(8, '~!@#$%^&*()_-+='));
}
