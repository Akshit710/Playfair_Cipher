function generateMatrix(key) {
    key = key.toUpperCase().replace(/J/g, "I");

    let matrix = [];
    let used = new Set();

    for (let char of key) {
        if (char >= "A" && char <= "Z" && !used.has(char)) {
            matrix.push(char);
            used.add(char);
        }
    }

    for (let char of "ABCDEFGHIKLMNOPQRSTUVWXYZ") {
        if (!used.has(char)) {
            matrix.push(char);
            used.add(char);
        }
    }

    return matrix;
}


function findPosition(matrix, char) {
    let index = matrix.indexOf(char);

    return {
        row: Math.floor(index / 5),
        col: index % 5
    };
}


function prepareText(text) {
    text = text.toUpperCase()
        .replace(/[^A-Z]/g, "")
        .replace(/J/g, "I");

    let result = "";

    let i = 0;

    while (i < text.length) {
        let first = text[i];
        let second = text[i + 1];

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


function encrypt(text, key) {
    const matrix = generateMatrix(key);
    text = prepareText(text);

    let result = "";

    for (let i = 0; i < text.length; i += 2) {
        let a = text[i];
        let b = text[i + 1];

        let posA = findPosition(matrix, a);
        let posB = findPosition(matrix, b);

        if (posA.row === posB.row) {
            result += matrix[posA.row * 5 + (posA.col + 1) % 5];
            result += matrix[posB.row * 5 + (posB.col + 1) % 5];
        }
        else if (posA.col === posB.col) {
            result += matrix[((posA.row + 1) % 5) * 5 + posA.col];
            result += matrix[((posB.row + 1) % 5) * 5 + posB.col];
        }
        else {
            result += matrix[posA.row * 5 + posB.col];
            result += matrix[posB.row * 5 + posA.col];
        }
    }

    return result;
}


function decrypt(text, key) {
    const matrix = generateMatrix(key);

    text = text.toUpperCase()
        .replace(/[^A-Z]/g, "")
        .replace(/J/g, "I");

    let result = "";

    for (let i = 0; i < text.length; i += 2) {
        let a = text[i];
        let b = text[i + 1];

        let posA = findPosition(matrix, a);
        let posB = findPosition(matrix, b);

        if (posA.row === posB.row) {
            result += matrix[posA.row * 5 + (posA.col + 4) % 5];
            result += matrix[posB.row * 5 + (posB.col + 4) % 5];
        }
        else if (posA.col === posB.col) {
            result += matrix[((posA.row + 4) % 5) * 5 + posA.col];
            result += matrix[((posB.row + 4) % 5) * 5 + posB.col];
        }
        else {
            result += matrix[posA.row * 5 + posB.col];
            result += matrix[posB.row * 5 + posA.col];
        }
    }

    return result;
}


module.exports = {
    generateMatrix,
    prepareText,
    encrypt,
    decrypt
};