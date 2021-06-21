import { serverAddr } from '../constants';


//fetch contract address and abi
export async function getContractInfo() {
    return await fetchServer('/api/info', {});
}

//decrypts PK
export function getPK() {
    
    let res = "";
    try {
        const CryptoJS = require("crypto-js");
        const passwdKey = sessionStorage.getItem('passwdKey');

        var pk = localStorage.getItem('privateKey');
        
        const bytes = CryptoJS.AES.decrypt((pk.toString()), passwdKey);
        res = bytes.toString(CryptoJS.enc.Utf8);
    }
    catch (exception_var) {
        res = "No pk found";
    }
    finally {
        return res;
    }
}

//returns list of usesr, that addres has communicated with
export async function getContacts(address, contactnum) {
    let res = "";

    try {
        res = await fetchServer('/api/contacts', { address: address, number: contactnum })
    }
    catch (exception_var) {
        res = { result: "No contacts found" };
    }
    finally {
        return res;
    }
}

//reqestes founds
export async function askForMoney(address) {
    let res = "Founds transfered";

    try {
        res = await fetchServer('/api/poor', { address: address })
    }
    catch (exception_var) {
        console.log(exception_var)
        res = "No founds left";
    }
    finally {
        return res;
    }
}

//return public key of adress
export async function getPublicKey(username, address) {
    let res = "";

    try {
        res = await fetchServer('/api/public', { username: username, address: address })
    }
    catch (exception_var) {
        console.log(exception_var)
        res = "";
    }
    finally {
        return res;
    }
}

//return address for username
export async function getAddressFromName(username) {
    var res = "";

    try {
        const ret = await fetchServer('/api/getuseraddress', { username: username })
        res = ret.result;
    }
    catch (exception_var) {
        console.log(exception_var)
        res = "";
    }
    finally {
        return res;
    }
}

//return public key of adress
export async function isUserRegistred(username, address) {
    var res = false;

    try {
        const ret = await fetchServer('/api/isvalid', { username: username, address: address })

        if (ret.result === 1)
            res = true;
    }
    catch (exception_var) {
        console.log(exception_var)
        res = false;
    }
    finally {
        return res;
    }
}

//fetch from server
export async function fetchServer(url, body, method = 'post') {
    let response = "";
    const token = sessionStorage.getItem('token');
    if (method === 'get') {
        response = await fetch(serverAddr + url, {
            method: method,
            headers: { Authorization: 'Bearer ' + token }
        })
    }
    else if (token !== null) {
        response = await fetch(serverAddr + url, {
            method: method,
            headers: { Authorization: 'Bearer ' + token },
            body: JSON.stringify(body)
        })
    }
    else {
        response = await fetch(serverAddr + url, {
            method: method,
            body: JSON.stringify(body)
        })
    }

    const json = await response.json();
    return json;
}