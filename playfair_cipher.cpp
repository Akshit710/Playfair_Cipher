#include <iostream>
#include <string>
#include <cctype>

using namespace std;

char matrix[5][5];

// Function to check if a character is already used
bool isUsed(char ch, string used)
{
    for (char c : used)
    {
        if (c == ch)
        {
            return true;
        }
    }

    return false;
}

// Function to generate the 5x5 Playfair matrix
void generateMatrix(string key)
{
    string used = "";
    string alphabet = "ABCDEFGHIKLMNOPQRSTUVWXYZ";

    // Convert key to uppercase
    for (char &ch : key)
    {
        ch = toupper(ch);

        // Playfair combines I and J
        if (ch == 'J')
        {
            ch = 'I';
        }
    }

    // Add key letters first
    for (char ch : key)
    {
        if (isalpha(ch) && !isUsed(ch, used))
        {
            used += ch;
        }
    }

    // Add remaining alphabet letters
    for (char ch : alphabet)
    {
        if (!isUsed(ch, used))
        {
            used += ch;
        }
    }

    // Put letters into the 5x5 matrix
    int index = 0;

    for (int row = 0; row < 5; row++)
    {
        for (int col = 0; col < 5; col++)
        {
            matrix[row][col] = used[index];
            index++;
        }
    }
}

// Function to display the matrix
void displayMatrix()
{
    cout << "\nPlayfair Key Matrix:\n\n";

    for (int row = 0; row < 5; row++)
    {
        for (int col = 0; col < 5; col++)
        {
            cout << matrix[row][col] << " ";
        }

        cout << endl;
    }
}

// Function to prepare plaintext
string prepareText(string text)
{
    string cleanText = "";

    // Convert to uppercase and remove unwanted characters
    for (char ch : text)
    {
        if (isalpha(ch))
        {
            ch = toupper(ch);

            // Convert J to I
            if (ch == 'J')
            {
                ch = 'I';
            }

            cleanText += ch;
        }
    }

    string preparedText = "";

    int i = 0;

    while (i < cleanText.length())
    {
        char first = cleanText[i];

        // If there is no second character
        if (i + 1 >= cleanText.length())
        {
            preparedText += first;
            preparedText += 'X';
            i++;
        }

        // If both characters are the same
        else if (cleanText[i] == cleanText[i + 1])
        {
            preparedText += first;
            preparedText += 'X';
            i++;
        }

        // Normal pair
        else
        {
            preparedText += cleanText[i];
            preparedText += cleanText[i + 1];
            i += 2;
        }
    }

    return preparedText;
}

// Function to display plaintext pairs
void displayPairs(string text)
{
    cout << "\nPrepared Plaintext Pairs:\n\n";

    for (int i = 0; i < text.length(); i += 2)
    {
        cout << text[i] << text[i + 1] << " ";
    }

    cout << endl;
}

// Function to encrypt plaintext
string encryptText(string text)
{
    string encryptedText = "";

    for (int i = 0; i < text.length(); i += 2)
    {
        char first = text[i];
        char second = text[i + 1];

        int firstRow = 0, firstCol = 0;
        int secondRow = 0, secondCol = 0;

        // Find positions of both characters
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

        // Same row: move right
        if (firstRow == secondRow)
        {
            encryptedText += matrix[firstRow][(firstCol + 1) % 5];
            encryptedText += matrix[secondRow][(secondCol + 1) % 5];
        }

        // Same column: move down
        else if (firstCol == secondCol)
        {
            encryptedText += matrix[(firstRow + 1) % 5][firstCol];
            encryptedText += matrix[(secondRow + 1) % 5][secondCol];
        }

        // Rectangle rule
        else
        {
            encryptedText += matrix[firstRow][secondCol];
            encryptedText += matrix[secondRow][firstCol];
        }
    }

    return encryptedText;
}

// Function to decrypt ciphertext
string decryptText(string text)
{
    string decryptedText = "";

    for (int i = 0; i < text.length(); i += 2)
    {
        char first = text[i];
        char second = text[i + 1];

        int firstRow = 0, firstCol = 0;
        int secondRow = 0, secondCol = 0;

        // Find positions of both characters
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

        // Same row: move left
        if (firstRow == secondRow)
        {
            decryptedText += matrix[firstRow][(firstCol + 4) % 5];
            decryptedText += matrix[secondRow][(secondCol + 4) % 5];
        }

        // Same column: move up
        else if (firstCol == secondCol)
        {
            decryptedText += matrix[(firstRow + 4) % 5][firstCol];
            decryptedText += matrix[(secondRow + 4) % 5][secondCol];
        }

        // Rectangle rule
        else
        {
            decryptedText += matrix[firstRow][secondCol];
            decryptedText += matrix[secondRow][firstCol];
        }
    }

    return decryptedText;
}

int main()
{
    string key;
    string plaintext;

    cout << "=================================\n";
    cout << "       PLAYFAIR CIPHER\n";
    cout << "=================================\n";

    // Get key
    cout << "\nEnter key: ";
    cin >> key;

    // Generate and display matrix
    generateMatrix(key);
    displayMatrix();

    // Clear input buffer
    cin.ignore();

    // Get plaintext
    cout << "\nEnter plaintext: ";
    getline(cin, plaintext);

    // Prepare plaintext
    string preparedText = prepareText(plaintext);

    // Display pairs
    displayPairs(preparedText);

    // Encrypt plaintext
    string encryptedText = encryptText(preparedText);

    cout << "\nEncrypted Text: " << encryptedText << endl;

    // Decrypt ciphertext
    string decryptedText = decryptText(encryptedText);

    cout << "Decrypted Text: " << decryptedText << endl;

    return 0;
}