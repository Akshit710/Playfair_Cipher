#include <windows.h>
#include <string>
#include <cctype>

using namespace std;

char matrix[5][5];

// ---------------- PLAYFAIR FUNCTIONS ----------------

bool isUsed(char ch, string used)
{
    for (char c : used)
    {
        if (c == ch)
            return true;
    }

    return false;
}

void generateMatrix(string key)
{
    string used = "";
    string alphabet = "ABCDEFGHIKLMNOPQRSTUVWXYZ";

    for (char &ch : key)
    {
        ch = toupper(ch);

        if (ch == 'J')
            ch = 'I';
    }

    for (char ch : key)
    {
        if (isalpha(ch) && !isUsed(ch, used))
            used += ch;
    }

    for (char ch : alphabet)
    {
        if (!isUsed(ch, used))
            used += ch;
    }

    int index = 0;

    for (int row = 0; row < 5; row++)
    {
        for (int col = 0; col < 5; col++)
        {
            matrix[row][col] = used[index++];
        }
    }
}

string prepareText(string text)
{
    string cleanText = "";

    for (char ch : text)
    {
        if (isalpha(ch))
        {
            ch = toupper(ch);

            if (ch == 'J')
                ch = 'I';

            cleanText += ch;
        }
    }

    string preparedText = "";
    int i = 0;

    while (i < cleanText.length())
    {
        char first = cleanText[i];

        if (i + 1 >= cleanText.length())
        {
            preparedText += first;
            preparedText += 'X';
            i++;
        }
        else if (cleanText[i] == cleanText[i + 1])
        {
            preparedText += first;
            preparedText += 'X';
            i++;
        }
        else
        {
            preparedText += cleanText[i];
            preparedText += cleanText[i + 1];
            i += 2;
        }
    }

    return preparedText;
}

string encryptText(string text)
{
    string encryptedText = "";

    for (int i = 0; i < text.length(); i += 2)
    {
        char first = text[i];
        char second = text[i + 1];

        int firstRow = 0, firstCol = 0;
        int secondRow = 0, secondCol = 0;

        for (int row = 0; row < 5; row++)
        {
            for (int col = 0; col < 5; col++)
            {
                if (matrix[row][col] == first)
                {
                    firstRow = row;
                    firstCol = col;
                }

                if (matrix[row][col] == second)
                {
                    secondRow = row;
                    secondCol = col;
                }
            }
        }

        if (firstRow == secondRow)
        {
            encryptedText += matrix[firstRow][(firstCol + 1) % 5];
            encryptedText += matrix[secondRow][(secondCol + 1) % 5];
        }
        else if (firstCol == secondCol)
        {
            encryptedText += matrix[(firstRow + 1) % 5][firstCol];
            encryptedText += matrix[(secondRow + 1) % 5][secondCol];
        }
        else
        {
            encryptedText += matrix[firstRow][secondCol];
            encryptedText += matrix[secondRow][firstCol];
        }
    }

    return encryptedText;
}

string decryptText(string text)
{
    string decryptedText = "";

    for (int i = 0; i < text.length(); i += 2)
    {
        char first = text[i];
        char second = text[i + 1];

        int firstRow = 0, firstCol = 0;
        int secondRow = 0, secondCol = 0;

        for (int row = 0; row < 5; row++)
        {
            for (int col = 0; col < 5; col++)
            {
                if (matrix[row][col] == first)
                {
                    firstRow = row;
                    firstCol = col;
                }

                if (matrix[row][col] == second)
                {
                    secondRow = row;
                    secondCol = col;
                }
            }
        }

        if (firstRow == secondRow)
        {
            decryptedText += matrix[firstRow][(firstCol + 4) % 5];
            decryptedText += matrix[secondRow][(secondCol + 4) % 5];
        }
        else if (firstCol == secondCol)
        {
            decryptedText += matrix[(firstRow + 4) % 5][firstCol];
            decryptedText += matrix[(secondRow + 4) % 5][secondCol];
        }
        else
        {
            decryptedText += matrix[firstRow][secondCol];
            decryptedText += matrix[secondRow][firstCol];
        }
    }

    return decryptedText;
}

// ---------------- GUI ----------------

HWND keyBox;
HWND plaintextBox;
HWND preparedBox;
HWND encryptedBox;
HWND decryptedBox;
HWND matrixBox;

void setText(HWND box, string text)
{
    SetWindowTextA(box, text.c_str());
}

string getText(HWND box)
{
    char buffer[5000];

    GetWindowTextA(box, buffer, sizeof(buffer));

    return string(buffer);
}

void showMatrix()
{
    string result = "";

    for (int row = 0; row < 5; row++)
    {
        for (int col = 0; col < 5; col++)
        {
            result += matrix[row][col];
            result += "   ";
        }

        result += "\r\n\r\n";
    }

    setText(matrixBox, result);
}

// ---------------- WINDOW PROCEDURE ----------------

LRESULT CALLBACK WindowProcedure(
    HWND hwnd,
    UINT msg,
    WPARAM wp,
    LPARAM lp)
{
    switch (msg)
    {
        case WM_COMMAND:
        {
            if (LOWORD(wp) == 1)
            {
                string key = getText(keyBox);
                string plaintext = getText(plaintextBox);

                if (key.empty() || plaintext.empty())
                {
                    MessageBoxA(
                        hwnd,
                        "Please enter both Key and Plaintext.",
                        "Input Required",
                        MB_OK | MB_ICONWARNING
                    );

                    break;
                }

                generateMatrix(key);

                string prepared = prepareText(plaintext);
                string encrypted = encryptText(prepared);
                string decrypted = decryptText(encrypted);

                setText(preparedBox, prepared);
                setText(encryptedBox, encrypted);
                setText(decryptedBox, decrypted);

                showMatrix();
            }

            if (LOWORD(wp) == 2)
            {
                string key = getText(keyBox);
                string encrypted = getText(encryptedBox);

                if (key.empty() || encrypted.empty())
                {
                    MessageBoxA(
                        hwnd,
                        "Please enter a key and encrypt some text first.",
                        "Input Required",
                        MB_OK | MB_ICONWARNING
                    );

                    break;
                }

                generateMatrix(key);

                string decrypted = decryptText(encrypted);

                setText(decryptedBox, decrypted);
                showMatrix();
            }

            break;
        }

        case WM_DESTROY:
            PostQuitMessage(0);
            break;

        default:
            return DefWindowProcA(hwnd, msg, wp, lp);
    }

    return 0;
}

// ---------------- MAIN ----------------

int WINAPI WinMain(
    HINSTANCE hInstance,
    HINSTANCE hPrevInstance,
    LPSTR lpCmdLine,
    int nCmdShow)
{
    const char CLASS_NAME[] = "PlayfairCipherWindow";

    WNDCLASSA wc = {};

    wc.lpfnWndProc = WindowProcedure;
    wc.hInstance = hInstance;
    wc.lpszClassName = CLASS_NAME;
    wc.hbrBackground = (HBRUSH)(COLOR_WINDOW + 1);
    wc.hCursor = LoadCursor(NULL, IDC_ARROW);

    RegisterClassA(&wc);

    HWND hwnd = CreateWindowA(
        CLASS_NAME,
        "Playfair Cipher - Encryption & Decryption",
        WS_OVERLAPPEDWINDOW,
        200,
        100,
        750,
        700,
        NULL,
        NULL,
        hInstance,
        NULL
    );

    if (hwnd == NULL)
        return 0;

    CreateWindowA(
        "STATIC",
        "PLAYFAIR CIPHER",
        WS_VISIBLE | WS_CHILD,
        270,
        20,
        250,
        35,
        hwnd,
        NULL,
        hInstance,
        NULL
    );

    CreateWindowA(
        "STATIC",
        "Key:",
        WS_VISIBLE | WS_CHILD,
        50,
        80,
        100,
        25,
        hwnd,
        NULL,
        hInstance,
        NULL
    );

    keyBox = CreateWindowA(
        "EDIT",
        "MONARCHY",
        WS_VISIBLE | WS_CHILD | WS_BORDER,
        150,
        78,
        250,
        28,
        hwnd,
        NULL,
        hInstance,
        NULL
    );

    CreateWindowA(
        "STATIC",
        "Plaintext:",
        WS_VISIBLE | WS_CHILD,
        50,
        125,
        100,
        25,
        hwnd,
        NULL,
        hInstance,
        NULL
    );

    plaintextBox = CreateWindowA(
        "EDIT",
        "HELLO",
        WS_VISIBLE | WS_CHILD | WS_BORDER,
        150,
        123,
        450,
        28,
        hwnd,
        NULL,
        hInstance,
        NULL
    );

    CreateWindowA(
        "BUTTON",
        "ENCRYPT",
        WS_VISIBLE | WS_CHILD,
        150,
        170,
        130,
        35,
        hwnd,
        (HMENU)1,
        hInstance,
        NULL
    );

    CreateWindowA(
        "BUTTON",
        "DECRYPT",
        WS_VISIBLE | WS_CHILD,
        300,
        170,
        130,
        35,
        hwnd,
        (HMENU)2,
        hInstance,
        NULL
    );

    CreateWindowA(
        "STATIC",
        "Prepared Plaintext:",
        WS_VISIBLE | WS_CHILD,
        50,
        225,
        180,
        25,
        hwnd,
        NULL,
        hInstance,
        NULL
    );

    preparedBox = CreateWindowA(
        "EDIT",
        "",
        WS_VISIBLE | WS_CHILD | WS_BORDER | ES_READONLY,
        230,
        223,
        370,
        28,
        hwnd,
        NULL,
        hInstance,
        NULL
    );

    CreateWindowA(
        "STATIC",
        "Encrypted Text:",
        WS_VISIBLE | WS_CHILD,
        50,
        270,
        180,
        25,
        hwnd,
        NULL,
        hInstance,
        NULL
    );

    encryptedBox = CreateWindowA(
        "EDIT",
        "",
        WS_VISIBLE | WS_CHILD | WS_BORDER | ES_READONLY,
        230,
        268,
        370,
        28,
        hwnd,
        NULL,
        hInstance,
        NULL
    );

    CreateWindowA(
        "STATIC",
        "Decrypted Text:",
        WS_VISIBLE | WS_CHILD,
        50,
        315,
        180,
        25,
        hwnd,
        NULL,
        hInstance,
        NULL
    );

    decryptedBox = CreateWindowA(
        "EDIT",
        "",
        WS_VISIBLE | WS_CHILD | WS_BORDER | ES_READONLY,
        230,
        313,
        370,
        28,
        hwnd,
        NULL,
        hInstance,
        NULL
    );

    CreateWindowA(
        "STATIC",
        "PLAYFAIR KEY MATRIX",
        WS_VISIBLE | WS_CHILD,
        270,
        370,
        250,
        30,
        hwnd,
        NULL,
        hInstance,
        NULL
    );

    matrixBox = CreateWindowA(
        "EDIT",
        "",
        WS_VISIBLE | WS_CHILD | WS_BORDER | ES_READONLY | ES_MULTILINE,
        250,
        410,
        250,
        180,
        hwnd,
        NULL,
        hInstance,
        NULL
    );

    ShowWindow(hwnd, nCmdShow);
    UpdateWindow(hwnd);

    MSG msg = {};

    while (GetMessageA(&msg, NULL, 0, 0))
    {
        TranslateMessage(&msg);
        DispatchMessageA(&msg);
    }

    return 0;
}