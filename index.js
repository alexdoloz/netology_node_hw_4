const fs = require('fs');
const http = require('http');
const translateText = require('./translate');
const Mustache = require('mustache');
const querystring = require('querystring');

const port = 3000;
const translateHTML = fs.readFileSync('translate.html', 'utf8');

function htmlWithTranslationResult(result) {
    return Mustache.render(translateHTML, {
        translationResult: result
    });
}

const server = http.createServer();
server.on('error', console.error);
server.on('request', (req, res) => {
    console.log(req.method, req.url, req.body);
    if (req.url !== "/") {
        res.writeHead(404, 'Not Found', {'Content-Type': 'text/plain; charset=utf-8'});
        res.write("Страницы не существует");
        res.end();
        return;
    }
    if (req.method.toUpperCase() === "GET") {
        res.writeHead(200, 'OK', {'Content-Type': 'text/html; charset=utf-8'});
        res.write(htmlWithTranslationResult(""));
        res.end();
        return;
    }
    let data = "";
    req.on('data', chunk => data += chunk);
    req.on('end', () => {
        console.log("Got post body of the request: ", data);
        const sourceText = querystring.parse(data).source_text;
        console.log(sourceText);
        translateText(sourceText).then(value => {
            res.writeHead(200, 'OK', {'Content-Type': 'text/html; charset=utf-8'});
            res.write(htmlWithTranslationResult(value));
            res.end();
        }, reason => {
            console.log("Translation failure: ", reason);
            res.writeHead(200, 'OK', {'Content-Type': 'text/html; charset=utf-8'});
            res.write(htmlWithTranslationResult("Не удалось перевести"));
            res.end();
        });
        return;
    });
});

server.on('listening', () => {
    console.log("Server started on port %d", port);
});

server.listen(port);