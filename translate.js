const https = require('https');
const querystring = require('querystring');

// Знакомое API :)
// https://appworld.blackberry.com/webstore/content/60003894/?lang=en&countrycode=RU
const translate = "translate.yandex.net"
const translateEndpoint = "/api/v1.5/tr.json/translate";
const apiKey = "trnsl.1.1.20160723T183155Z.f2a3339517e26a3c.d86d2dc91f2e374351379bb3fe371985273278df";
const lang = "ru-en";

function translateText(text) {    
    return new Promise((resolve, reject) => {
        console.log(translateEndpoint + "?" + querystring.stringify(
            {
                key: apiKey,
                text: text,
                lang: lang
            }
        ));
        const translationOptions = {
            hostname: translate,
            path: translateEndpoint + "?" + querystring.stringify(
                {
                    key: apiKey,
                    text: text,
                    lang: lang
                }
            )
        }
        const req = https.request(translationOptions, (res) => {
            let data = "";
            res.on('error', (err) => {
                reject(err);
            })
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    const result = JSON.parse(data)
                    if (!result.text || !result.text[0]) {
                        reject(new Error(`Malformed JSON ${result}`));
                        return;
                    } 
                    console.log(`Translation of ${text} ended: ${result.text[0]}`);
                    resolve(result.text[0]);
                } catch(err) {
                    reject(err);
                }
            });
        });
        req.on('error', err => reject(err));
        req.end();
    });
}


module.exports = translateText;