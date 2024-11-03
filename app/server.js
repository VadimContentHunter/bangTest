const express = require("express");
const path = require("path");
const setupWebSocketServer = require("./server/services/websocketServer");
const SessionHandler = require("./server/handlers/SessionHandler");
const { renderTemplate, parseCookies, createCookie } = require("./server/services/helper"); // Импортируем необходимые функции
const GameHandler = require("./server/handlers/GameHandler");
const Player = require("./server/models/Player");

const app = express();
const serverIp = "127.0.0.1";
const port = 8080;
const pathClient = path.join(__dirname, "client");
const pathClientHtml = path.join(pathClient, "html");
const pathClientCss = path.join(pathClient, "css");
const pathClientJs = path.join(pathClient, "js");
const pathClientResources = path.join(pathClient, "resources");
const pathClientNodeModuleJs = path.resolve(__dirname, "../node_modules");

SessionHandler.sessionLifetime = 3600;
const gameHandler = new GameHandler();

// Обслуживаем статические файлы из соответствующих папок
app.use("/html", express.static(pathClientHtml));
app.use("/css", express.static(pathClientCss));
app.use("/js", express.static(pathClientJs));
app.use("/resources", express.static(pathClientResources));
app.use(
    "/module/vadimcontenthunter-jsonrpc-formatter",
    express.static(path.join(pathClientNodeModuleJs, "vadimcontenthunter-jsonrpc-formatter", "src"))
);

// Middleware для загрузки сессий
app.use((req, res, next) => {
    SessionHandler.loadSessions(); // Загружаем сессии из файла
    req.sessionId = SessionHandler.getCreateSessionId(req.headers.cookie); // Получаем или создаем sessionId
    res.setHeader(
        "Set-Cookie",
        createCookie("sessionId", req.sessionId, {
            maxAge: SessionHandler.sessionLifetime * 1000,
            path: "/",
        })
    );
    next(); // Передаем управление следующему middleware
});

// Обрабатываем запрос на корень ("/")
app.get("/", (req, res) => {
    SessionHandler.addParametersToSession(req.sessionId, { lastUrl: req.url });

    const templatePath = path.join(pathClientHtml, "index.html");
    const htmlContent = renderTemplate(templatePath, {
        pageTitle: "Bang!-Test",
        cssLinks: `
            <link rel="stylesheet" href="/css/vars.css" />
            <link rel="stylesheet" href="/css/reset.css" />
            <link rel="stylesheet" href="/css/icons.css" />
            <link rel="stylesheet" href="/css/main.css" />
            <link rel="stylesheet" href="/css/auth.css" />
            <link rel="stylesheet" href="/css/notification.css" />
        `,
        scriptHeadLinks: `
            <script src="/module/vadimcontenthunter-jsonrpc-formatter/JsonRpcFormatter.js"></script>
            <script src="/js/NotificationsHtml.js"></script>
            <script src="/js/websocketClient.js"></script>
            <script src="/js/RequestManager.js"></script>
            <script>const serverIp = "${serverIp}:${port}";</script>
        `,
        scriptEndLinks: `
            <script src="/js/auth.js"></script>
        `,
    });
    res.send(htmlContent);
});

// Обрабатываем запрос на корень ("/")
app.get("/playroom", (req, res) => {
    SessionHandler.addParametersToSession(req.sessionId, { lastUrl: req.url });
    const player = gameHandler.connect(req.sessionId);

    if (player instanceof Player) {
        const templatePath = path.join(pathClientHtml, "playroom.html");
        const htmlContent = renderTemplate(templatePath, {
            pageTitle: "Bang!-Test",
            cssLinks: `
            <link rel="stylesheet" href="/css/vars.css" />
            <link rel="stylesheet" href="/css/reset.css" />
            <link rel="stylesheet" href="/css/icons.css" />
            <link rel="stylesheet" href="/css/main.css" />
            <link rel="stylesheet" href="/css/notification.css" />
        `,
            scriptHeadLinks: `
            <script src="/module/vadimcontenthunter-jsonrpc-formatter/JsonRpcFormatter.js"></script>
            <script src="/js/NotificationsHtml.js"></script>
            <script src="/js/websocketClient.js"></script>
            <script src="/js/RequestManager.js"></script>
            <script>const serverIp = "${serverIp}:${port}";</script>
        `,
            scriptEndLinks: `
            <script src=""></script>
        `,
            content: `
            <h1>Игрок</h1>
            <h2>id: ${player?.id ?? "---"}</h2>
            <h2>name: ${player?.name ?? "---"}</h2>
            <h2>sessionId: ${player?.sessionId ?? "---"}</h2>
        `,
        });
        res.send(htmlContent);
    } else {
        res.send(`Игрок не найден. <a href="/">Попробовать снова</a>`);
        // res.redirect(301, "/");
    }
});

// Обработка ошибок 404
app.use((req, res) => {
    res.status(404).sendFile(path.join(pathClientHtml, "404.html"));
});

// Обработка ошибок
app.use((err, req, res, next) => {
    console.error(err.stack);
    const statusCode = err.statusCode || 500;
    const message = err.message || "Что-то пошло не так";
    res.status(statusCode).json({
        success: false,
        message,
    });
});

// Запускаем HTTP сервер с Express
const server = app.listen(port, () => {
    console.log(`HTTP сервер запущен на http://localhost:${port}`);
});

setupWebSocketServer(server, gameHandler);
