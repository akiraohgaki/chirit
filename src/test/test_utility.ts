import Chirit from '../chirit.js';

export default function() {
    console.log(Chirit.Utility.parseQueryString());
    console.log(Chirit.Utility.parseQueryString('?key1=value1&key2'));

    console.log(Chirit.Utility.convertByteToHumanReadable(10000000000000000000000000));

    console.log(Chirit.Utility.convertDatetimeToHumanReadable('2045-01-01'));
    console.log(Chirit.Utility.convertDatetimeToHumanReadable(Date.now() - 1000000));
    console.log(Chirit.Utility.convertDatetimeToHumanReadable(new Date()));

    console.log(Chirit.Utility.generateRandomString());
    console.log(Chirit.Utility.generateRandomString(4));
    console.log(Chirit.Utility.generateRandomString(8, '~!@#$%^&*()_-+='));
}
