const express = require("express");

const {
    generateMatrix,
    prepareText,
    encrypt,
    decrypt
} = require("./playfair");

const app = express();

const PORT = 3000;

app.use(express.json());
app.use((req, res, next) => {
    res.header(
        "Access-Control-Allow-Origin",
        "http://localhost:5173"
    );

    res.header(
        "Access-Control-Allow-Methods",
        "GET, POST, PUT, DELETE, OPTIONS"
    );

    res.header(
        "Access-Control-Allow-Headers",
        "Content-Type"
    );

    if (req.method === "OPTIONS") {
        return res.sendStatus(200);
    }

    next();
});


app.get("/", (req, res) => {
    res.send("Playfair Cipher Backend is running!");
});

app.get("/api/test", (req, res) => {
    res.json({
        message: "Playfair Cipher API is working!"
    });
});

app.post("/api/matrix", (req, res) => {
    const { key } = req.body;

    if (!key) {
        return res.status(400).json({
            error: "Key is required"
        });
    }

    const matrix = generateMatrix(key);

    res.json({
        key: key,
        matrix: matrix
    });
});

app.post("/api/encrypt", (req, res) => {
    const { key, text } = req.body;

    if (!key || !text) {
        return res.status(400).json({
            error: "Key and text are required"
        });
    }

    const preparedText = prepareText(text);
    const encryptedText = encrypt(text, key);

    res.json({
        key: key,
        originalText: text,
        preparedText: preparedText,
        encryptedText: encryptedText
    });
});

app.post("/api/decrypt", (req, res) => {
    const { key, text } = req.body;

    if (!key || !text) {
        return res.status(400).json({
            error: "Key and text are required"
        });
    }

    const decryptedText = decrypt(text, key);

    res.json({
        key: key,
        encryptedText: text,
        decryptedText: decryptedText
    });
});

app.listen(PORT, () => {
    console.log(
        `Server running at http://localhost:${PORT}`
    );
});