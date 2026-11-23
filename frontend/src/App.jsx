import { useState } from "react";

import {
    KeyRound,
    FileText,
    LockKeyhole,
    LockOpen,
    Grid3X3,
    RotateCcw,
    Download,
    ArrowRight,
    CheckCircle2
} from "lucide-react";

import "./App.css";


const API_URL = "http://localhost:3000";

function prepareLocalText(text) {
    text = text
        .toUpperCase()
        .replace(/[^A-Z]/g, "")
        .replace(/J/g, "I");

    let result = "";
    let i = 0;

    while (i < text.length) {
        const first = text[i];
        const second = text[i + 1];

        if (!second) {
            result += first + "X";
            i++;
        }
        else if (first === second) {
            result += first + "X";
            i++;
        }
        else {
            result += first + second;
            i += 2;
        }
    }

    return result;
}


function generateLocalMatrix(key) {
    key = key
        .toUpperCase()
        .replace(/J/g, "I");

    const matrix = [];
    const used = new Set();

    for (const char of key) {
        if (
            char >= "A" &&
            char <= "Z" &&
            !used.has(char)
        ) {
            matrix.push(char);
            used.add(char);
        }
    }

    for (const char of "ABCDEFGHIKLMNOPQRSTUVWXYZ") {
        if (!used.has(char)) {
            matrix.push(char);
            used.add(char);
        }
    }

    return matrix;
}


function getPosition(matrix, char) {
    const index = matrix.indexOf(char);

    return {
        row: Math.floor(index / 5),
        col: index % 5
    };
}


function encryptPairLocal(pair, matrix) {
    const a = pair[0];
    const b = pair[1];

    const posA = getPosition(matrix, a);
    const posB = getPosition(matrix, b);

    let result = "";
    let rule = "";

    if (posA.row === posB.row) {
        result =
            matrix[posA.row * 5 + ((posA.col + 1) % 5)] +
            matrix[posB.row * 5 + ((posB.col + 1) % 5)];

        rule = "Same row → move each letter one position to the right.";
    }
    else if (posA.col === posB.col) {
        result =
            matrix[((posA.row + 1) % 5) * 5 + posA.col] +
            matrix[((posB.row + 1) % 5) * 5 + posB.col];

        rule = "Same column → move each letter one position downward.";
    }
    else {
        result =
            matrix[posA.row * 5 + posB.col] +
            matrix[posB.row * 5 + posA.col];

        rule = "Rectangle rule → exchange the columns.";
    }

    return {
        pair,
        result,
        rule
    };
}


function decryptPairLocal(pair, matrix) {
    const a = pair[0];
    const b = pair[1];

    const posA = getPosition(matrix, a);
    const posB = getPosition(matrix, b);

    let result = "";
    let rule = "";

    if (posA.row === posB.row) {
        result =
            matrix[posA.row * 5 + ((posA.col + 4) % 5)] +
            matrix[posB.row * 5 + ((posB.col + 4) % 5)];

        rule = "Same row → move each letter one position to the left.";
    }
    else if (posA.col === posB.col) {
        result =
            matrix[((posA.row + 4) % 5) * 5 + posA.col] +
            matrix[((posB.row + 4) % 5) * 5 + posB.col];

        rule = "Same column → move each letter one position upward.";
    }
    else {
        result =
            matrix[posA.row * 5 + posB.col] +
            matrix[posB.row * 5 + posA.col];

        rule = "Rectangle rule → exchange the columns.";
    }

    return {
        pair,
        result,
        rule
    };
}


function splitPairs(text) {
    if (!text) {
        return [];
    }

    const pairs = [];

    for (let i = 0; i < text.length; i += 2) {
        pairs.push(text.substring(i, i + 2));
    }

    return pairs;
}

function App() {

    const [key, setKey] = useState("");
    const [plaintext, setPlaintext] = useState("");
    const [ciphertext, setCiphertext] = useState("");

    const [preparedText, setPreparedText] = useState("");
    const [encryptedText, setEncryptedText] = useState("");
    const [decryptedText, setDecryptedText] = useState("");

    const [matrix, setMatrix] = useState([]);

    const [matrixSteps, setMatrixSteps] = useState([]);
    const [showMatrixSteps, setShowMatrixSteps] = useState(false);

    const [error, setError] = useState("");

    const [selectedFile, setSelectedFile] = useState(null);
    const [fileStatus, setFileStatus] = useState("");

    async function request(endpoint, payload) {

        const response = await fetch(
            `${API_URL}${endpoint}`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(payload)
            }
        );

        const data = await response.json();

        if (!response.ok) {
            throw new Error(
                data.error || "Something went wrong."
            );
        }

        return data;
    }

    function buildMatrixSteps(
        currentKey,
        currentPlaintext,
        currentEncrypted,
        currentDecrypted
    ) {

        if (!currentKey.trim()) {
            setMatrixSteps([]);
            return;
        }

        const cleanedKey = currentKey
            .toUpperCase()
            .replace(/[^A-Z]/g, "")
            .replace(/J/g, "I");

        const uniqueKey = [];
        const used = new Set();

        for (const char of cleanedKey) {
            if (!used.has(char)) {
                uniqueKey.push(char);
                used.add(char);
            }
        }

        const remainingLetters =
            "ABCDEFGHIKLMNOPQRSTUVWXYZ"
                .split("")
                .filter(
                    char => !used.has(char)
                )
                .join("");

        const finalMatrix =
            generateLocalMatrix(currentKey);

        const prepared =
            prepareLocalText(currentPlaintext);

        const plaintextPairs =
            splitPairs(prepared);

        const encryptionDetails =
            plaintextPairs.map(
                pair =>
                    encryptPairLocal(
                        pair,
                        finalMatrix
                    )
            );

        const decryptionPairs =
            splitPairs(
                currentEncrypted
            );

        const decryptionDetails =
            decryptionPairs.map(
                pair =>
                    decryptPairLocal(
                        pair,
                        finalMatrix
                    )
            );


        const steps = [

            {
                number: 1,
                title: "Entered Key",
                description:
                    "The key entered by the user is converted to uppercase and prepared for the Playfair matrix.",
                value:
                    uniqueKey.join("")
                    || "—"
            },

            {
                number: 2,
                title: "Remove Duplicates",
                description:
                    "Repeated letters are removed so that every key letter appears only once.",
                value:
                    uniqueKey.join("")
                    || "—"
            },

            {
                number: 3,
                title: "Apply I / J Rule",
                description:
                    "The Playfair cipher uses a 5 × 5 matrix, so I and J share one position.",
                value: "I / J"
            },

            {
                number: 4,
                title: "Add Remaining Letters",
                description:
                    "The remaining alphabet letters are added in order, excluding J and letters already used in the key.",
                value:
                    remainingLetters
                    || "—"
            },

            {
                number: 5,
                title: "Plaintext Preparation & Encryption",
                description:
                    "The plaintext is cleaned, J is changed to I, repeated letters are separated with X, and an X is added when required. The prepared text is then divided into digraphs and encrypted using the Playfair rules.",
                prepared: prepared || "—",
                pairs: plaintextPairs,
                encryptionDetails
            },

            {
                number: 6,
                title: "Encrypted Answer",
                description:
                    "The encrypted digraphs are combined to produce the final ciphertext.",
                value:
                    currentEncrypted
                    || "No result available yet."
            },

            {
                number: 7,
                title: "Decryption Pairs",
                description:
                    "The ciphertext is divided into two-letter digraphs before applying the reverse Playfair rules.",
                pairs:
                    decryptionPairs.length
                        ? decryptionPairs
                        : ["—"]
            },

            {
                number: 8,
                title: "Decryption Process",
                description:
                    "Each ciphertext pair is decrypted using the same-row, same-column, or rectangle rule in reverse.",
                decryptionDetails
            },

            {
                number: 9,
                title: "Decrypted Answer",
                description:
                    "The decrypted pairs are combined to produce the recovered plaintext.",
                value:
                    currentDecrypted
                    || "No result available yet."
            }
        ];

        setMatrixSteps(steps);
    }



    async function generateMatrix() {

        if (!key.trim()) {
            setMatrix([]);
            setMatrixSteps([]);
            return;
        }

        try {

            setError("");

            const data =
                await request(
                    "/api/matrix",
                    {
                        key
                    }
                );

            setMatrix(data.matrix);

            buildMatrixSteps(
                key,
                plaintext,
                encryptedText,
                decryptedText
            );

        }
        catch (err) {

            setError(
                err.message
            );
        }
    }



    async function handleEncrypt() {

        if (!key.trim()) {
            setError(
                "Please enter a key."
            );
            return;
        }

        if (!plaintext.trim()) {
            setError(
                "Please enter plaintext."
            );
            return;
        }

        try {

            setError("");

            const data =
                await request(
                    "/api/encrypt",
                    {
                        key,
                        text: plaintext
                    }
                );

            setPreparedText(
                data.preparedText
            );

            setEncryptedText(
                data.encryptedText
            );

            setCiphertext(
                data.encryptedText
            );

            const newMatrix =
                generateLocalMatrix(key);

            setMatrix(
                newMatrix
            );

            buildMatrixSteps(
                key,
                plaintext,
                data.encryptedText,
                decryptedText
            );

            setShowMatrixSteps(true);

        }
        catch (err) {

            setError(
                err.message
            );
        }
    }



    async function handleDecrypt() {

        if (!key.trim()) {
            setError(
                "Please enter a key."
            );
            return;
        }

        if (!ciphertext.trim()) {
            setError(
                "Please enter ciphertext."
            );
            return;
        }

        try {

            setError("");

            const data =
                await request(
                    "/api/decrypt",
                    {
                        key,
                        text: ciphertext
                    }
                );

            setDecryptedText(
                data.decryptedText
            );

            setEncryptedText(
                ciphertext.toUpperCase()
            );

            const newMatrix =
                generateLocalMatrix(key);

            setMatrix(
                newMatrix
            );

            buildMatrixSteps(
                key,
                plaintext,
                ciphertext.toUpperCase(),
                data.decryptedText
            );

            setShowMatrixSteps(true);

        }
        catch (err) {

            setError(
                err.message
            );
        }
    }



    function handleFileSelect(event) {

        const file =
            event.target.files[0];

        if (!file) {
            setSelectedFile(null);
            setFileStatus("");
            return;
        }

        setSelectedFile(file);

        setFileStatus(
            `Selected: ${file.name}`
        );
    }



    async function processFile(operation) {

        if (!selectedFile) {

            setFileStatus(
                "Please select a .txt or .log file first."
            );

            return;
        }

        if (!key.trim()) {

            setFileStatus(
                "Please enter a key before processing the file."
            );

            return;
        }

        try {

            setFileStatus(
                "Processing file..."
            );

            const text =
                await selectedFile.text();

            let result;

            if (operation === "encrypt") {

                result =
                    await request(
                        "/api/encrypt",
                        {
                            key,
                            text
                        }
                    );

                downloadFile(
                    result.encryptedText,
                    `${selectedFile.name}_encrypted.txt`
                );

                setFileStatus(
                    "File encrypted successfully."
                );

            }
            else {

                result =
                    await request(
                        "/api/decrypt",
                        {
                            key,
                            text
                        }
                    );

                downloadFile(
                    result.decryptedText,
                    `${selectedFile.name}_decrypted.txt`
                );

                setFileStatus(
                    "File decrypted successfully."
                );
            }

        }
        catch (err) {

            setFileStatus(
                err.message
            );
        }
    }



    function downloadFile(content, filename) {

        const blob =
            new Blob(
                [content],
                {
                    type: "text/plain"
                }
            );

        const url =
            URL.createObjectURL(blob);

        const link =
            document.createElement("a");

        link.href = url;
        link.download = filename;

        document.body.appendChild(link);

        link.click();

        document.body.removeChild(link);

        URL.revokeObjectURL(url);
    }



    function downloadResult() {

        const report = `
PLAYFAIR CIPHER RESULT
======================

Key:
${key || "—"}

Plaintext:
${plaintext || "—"}

Prepared Text:
${preparedText || "—"}

Encrypted Text:
${encryptedText || "—"}

Decrypted Text:
${decryptedText || "—"}
`;

        downloadFile(
            report,
            "playfair_result.txt"
        );
    }



    function handleClear() {

        setKey("");
        setPlaintext("");
        setCiphertext("");

        setPreparedText("");
        setEncryptedText("");
        setDecryptedText("");

        setMatrix([]);

        setMatrixSteps([]);
        setShowMatrixSteps(false);

        setError("");

        setSelectedFile(null);
        setFileStatus("");
    }



    function renderMatrix(
        matrixData,
        className = "matrix"
    ) {

        if (!matrixData.length) {
            return null;
        }

        return (
            <div className={className}>

                {matrixData.map(
                    (letter, index) => (
                        <div
                            className={
                                className === "matrix"
                                    ? "matrix-cell"
                                    : "step-matrix-cell"
                            }
                            key={index}
                        >
                            {letter}
                        </div>
                    )
                )}

            </div>
        );
    }


    function renderMatrixStep(step) {

        return (
            <div
                className="matrix-step"
                key={step.number}
            >

                <div className="step-number">
                    {step.number}
                </div>

                <div className="step-content">

                    <h3>
                        Step {step.number} — {step.title}
                    </h3>

                    <p>
                        {step.description}
                    </p>


                    {}

                    {step.value && (
                        <div className="step-value">
                            {step.value}
                        </div>
                    )}


                    {}

                    {step.prepared && (
                        <div className="detail-block">

                            <strong>
                                Prepared Text
                            </strong>

                            <div className="step-value">
                                {step.prepared}
                            </div>

                        </div>
                    )}


                    {}

                    {step.pairs && (
                        <div className="detail-block">

                            <strong>
                                Pairs
                            </strong>

                            <div className="pair-list">

                                {step.pairs.map(
                                    (pair, index) => (
                                        <span
                                            className="pair-item"
                                            key={index}
                                        >
                                            {pair}
                                        </span>
                                    )
                                )}

                            </div>

                        </div>
                    )}


                    {}

                    {step.encryptionDetails &&
                        step.encryptionDetails.length > 0 && (

                            <div className="process-list">

                                {step.encryptionDetails.map(
                                    (item, index) => (
                                        <div
                                            className="process-row"
                                            key={index}
                                        >

                                            <span className="process-pair">
                                                {item.pair}
                                            </span>

                                            <ArrowRight
                                                size={15}
                                            />

                                            <span className="process-result">
                                                {item.result}
                                            </span>

                                            <span className="process-rule">
                                                {item.rule}
                                            </span>

                                        </div>
                                    )
                                )}

                            </div>
                        )}


                    {}

                    {step.decryptionDetails &&
                        step.decryptionDetails.length > 0 && (

                            <div className="process-list">

                                {step.decryptionDetails.map(
                                    (item, index) => (
                                        <div
                                            className="process-row"
                                            key={index}
                                        >

                                            <span className="process-pair">
                                                {item.pair}
                                            </span>

                                            <ArrowRight
                                                size={15}
                                            />

                                            <span className="process-result">
                                                {item.result}
                                            </span>

                                            <span className="process-rule">
                                                {item.rule}
                                            </span>

                                        </div>
                                    )
                                )}

                            </div>
                        )}

                </div>

            </div>
        );
    }
 

    return (

        <div className="app">

            {/* HEADER */}

            <header className="header">

                <div className="header-content">

                    <div className="logo-area">

                        <div className="logo-icon">
                            <CheckCircle2 size={20} />
                        </div>

                        <div className="title-area">
                            <h1>
                                Cipher<span>Matrix</span>
                            </h1>
                        </div>

                    </div>


                    <div className="header-right">

                        <span>
                            Secure
                        </span>

                        <span className="header-divider"></span>

                        <span>
                            Simple
                        </span>

                    </div>

                </div>

            </header>


            {}

            <main className="container">

                <div className="main-layout">




                    <div className="left-column">


                        {}

                        <section className="card">

                            <div className="section-heading">

                                <div className="section-icon green-icon">
                                    <KeyRound size={20} />
                                </div>

                                <div>

                                    <h2>
                                        Enter Details
                                    </h2>

                                    <p>
                                        Enter your key and text to perform Playfair encryption or decryption.
                                    </p>

                                </div>

                            </div>


                            <div className="divider"></div>


                            {}

                            <div className="form-row">

                                <div className="field-icon key-icon">
                                    <KeyRound size={18} />
                                </div>

                                <div className="field">

                                    <label>
                                        Key
                                    </label>

                                    <input
                                        type="text"
                                        value={key}
                                        onChange={(e) =>
                                            setKey(e.target.value)
                                        }
                                        onBlur={generateMatrix}
                                        placeholder="Enter encryption key"
                                    />

                                </div>

                            </div>


                            {}

                            <div className="form-row">

                                <div className="field-icon text-icon">
                                    <FileText size={18} />
                                </div>

                                <div className="field">

                                    <label>
                                        Plaintext
                                    </label>

                                    <input
                                        type="text"
                                        value={plaintext}
                                        onChange={(e) =>
                                            setPlaintext(e.target.value)
                                        }
                                        placeholder="Enter text to encrypt"
                                    />

                                </div>

                            </div>


                            {}

                            <div className="form-row">

                                <div className="field-icon shield-icon">
                                    <LockOpen size={18} />
                                </div>

                                <div className="field">

                                    <label>
                                        Ciphertext
                                    </label>

                                    <input
                                        type="text"
                                        value={ciphertext}
                                        onChange={(e) =>
                                            setCiphertext(e.target.value)
                                        }
                                        placeholder="Enter text to decrypt"
                                    />

                                </div>

                            </div>


                            {error && (
                                <div className="error">
                                    {error}
                                </div>
                            )}


                            {/* BUTTONS */}

                            <div className="buttons">

                                <button
                                    className="encrypt-button"
                                    onClick={handleEncrypt}
                                >
                                    <LockKeyhole size={17} />
                                    Encrypt
                                </button>


                                <button
                                    className="decrypt-button"
                                    onClick={handleDecrypt}
                                >
                                    <LockOpen size={17} />
                                    Decrypt
                                </button>


                                <button
                                    className="clear-button"
                                    onClick={handleClear}
                                >
                                    <RotateCcw size={16} />
                                    Clear / Reset
                                </button>

                            </div>

                        </section>


                        {/* RESULTS */}

                        <section className="card">

                            <div className="section-heading">

                                <div className="section-icon green-icon">
                                    <Grid3X3 size={20} />
                                </div>

                                <div>

                                    <h2>
                                        Results
                                    </h2>

                                    <p>
                                        View the output of your encryption and decryption.
                                    </p>

                                </div>

                            </div>


                            <div className="divider"></div>


                            {/* PREPARED */}

                            <div className="result-row">

                                <div className="result-icon blue-result">
                                    <ArrowRight size={17} />
                                </div>

                                <div className="result-content">

                                    <strong>
                                        Prepared Text
                                    </strong>

                                    <span>
                                        {preparedText || "—"}
                                    </span>

                                </div>

                            </div>


                            {/* ENCRYPTED */}

                            <div className="result-row">

                                <div className="result-icon purple-result">
                                    <LockKeyhole size={17} />
                                </div>

                                <div className="result-content">

                                    <strong>
                                        Encrypted Text
                                    </strong>

                                    <span>
                                        {encryptedText || "—"}
                                    </span>

                                </div>

                            </div>


                            {/* DECRYPTED */}

                            <div className="result-row">

                                <div className="result-icon green-result">
                                    <LockOpen size={17} />
                                </div>

                                <div className="result-content">

                                    <strong>
                                        Decrypted Text
                                    </strong>

                                    <span>
                                        {decryptedText || "—"}
                                    </span>

                                </div>

                            </div>


                            <button
                                className="download-button"
                                onClick={downloadResult}
                            >
                                <Download size={16} />
                                Download Result
                            </button>

                        </section>


                        {/* FILE ENCRYPTION */}

                        <section className="card file-card">

                            <div className="section-heading">

                                <div className="section-icon green-icon">
                                    <FileText size={20} />
                                </div>

                                <div>

                                    <h2>
                                        File Encryption
                                    </h2>

                                    <p>
                                        Encrypt or decrypt .txt and .log files directly in your browser.
                                    </p>

                                </div>

                            </div>


                            <div className="divider"></div>


                            <div className="file-upload-area">

                                <label className="file-label">
                                    Select File
                                </label>

                                <input
                                    type="file"
                                    accept=".txt,.log"
                                    onChange={handleFileSelect}
                                />


                                {selectedFile && (
                                    <div className="selected-file">

                                        <FileText size={18} />

                                        <span>
                                            {selectedFile.name}
                                        </span>

                                    </div>
                                )}


                                {fileStatus && (
                                    <div className="file-status">
                                        {fileStatus}
                                    </div>
                                )}

                            </div>


                            <div className="file-buttons">

                                <button
                                    className="encrypt-button"
                                    onClick={() =>
                                        processFile("encrypt")
                                    }
                                >
                                    <LockKeyhole size={17} />
                                    Encrypt File
                                </button>


                                <button
                                    className="decrypt-button"
                                    onClick={() =>
                                        processFile("decrypt")
                                    }
                                >
                                    <LockOpen size={17} />
                                    Decrypt File
                                </button>

                            </div>

                        </section>

                    </div>


                    <div className="right-column">

                        <section className="card matrix-card">

                            <div className="section-heading matrix-heading">

                                <div className="section-icon matrix-icon">
                                    <Grid3X3 size={20} />
                                </div>

                                <div>

                                    <h2>
                                        5 × 5 Key Matrix
                                    </h2>

                                    <p>
                                        The Playfair cipher matrix generated from your key.
                                    </p>

                                </div>

                            </div>


                            <div className="divider matrix-divider"></div>


                            {/* MATRIX */}

                            <div className="matrix-container">

                                {matrix.length > 0 ? (

                                    renderMatrix(matrix)

                                ) : (

                                    <div className="matrix-placeholder">

                                        <div className="placeholder-grid">

                                            {Array.from(
                                                { length: 25 }
                                            ).map(
                                                (_, index) => (
                                                    <div
                                                        className="placeholder-cell"
                                                        key={index}
                                                    >
                                                        •
                                                    </div>
                                                )
                                            )}

                                        </div>

                                        <p>
                                            Enter a key to generate the matrix.
                                        </p>

                                    </div>

                                )}

                            </div>


                            {/* MATRIX DETAILS BUTTON */}

                            {matrix.length > 0 && (

                                <button
                                    className="matrix-steps-button"
                                    onClick={() =>
                                        setShowMatrixSteps(
                                            !showMatrixSteps
                                        )
                                    }
                                >
                                    {showMatrixSteps
                                        ? "Hide Matrix Details"
                                        : "Show Matrix Details"}
                                </button>

                            )}


                            {/* MATRIX DETAILS */}

                            {showMatrixSteps &&
                                matrixSteps.length > 0 && (

                                    <div className="matrix-steps">

                                        {matrixSteps.map(
                                            step =>
                                                renderMatrixStep(
                                                    step
                                                )
                                        )}

                                    </div>

                                )}

                        </section>

                    </div>

                </div>

            </main>


            {/* FOOTER */}

            <footer>

                <p>
                    CipherMatrix
                </p>

                <span>
                    •
                </span>

                <p>
                    Playfair Cipher Implementation
                </p>

            </footer>

        </div>
    );
}


export default App;