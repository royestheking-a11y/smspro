/**
 * SMS Parser Utility
 * Extracts transaction information from bKash and Nagad SMS messages
 */

/**
 * Parse bKash SMS message
 * Example: "Tk 500.00 received from 01XXXXXXXXX. TrxID BK12ABC3DEF at 12/25/2024 2:30 PM"
 */
function parseBkashSMS(message) {
    const result = {
        provider: 'bkash',
        trxId: null,
        amount: null,
        sender: null,
        rawMessage: message
    };

    // Extract TrxID (various formats: TrxID BK..., Trx ID:..., Transaction ID...)
    const trxPatterns = [
        /TrxID\s+([A-Z0-9]{10,15})/i,
        /Trx\s*ID\s*:?\s*([A-Z0-9]{10,15})/i,
        /Transaction\s*ID\s*:?\s*([A-Z0-9]{10,15})/i
    ];

    for (const pattern of trxPatterns) {
        const match = message.match(pattern);
        if (match) {
            result.trxId = match[1];
            break;
        }
    }

    // Extract amount (Tk 500.00, Taka 500, BDT 500.00)
    const amountPatterns = [
        /(?:Tk|Taka|BDT)\s*([0-9,]+\.?[0-9]*)/i,
        /([0-9,]+\.?[0-9]*)\s*(?:Tk|Taka|BDT)/i
    ];

    for (const pattern of amountPatterns) {
        const match = message.match(pattern);
        if (match) {
            result.amount = parseFloat(match[1].replace(/,/g, ''));
            break;
        }
    }

    // Extract sender phone number
    const senderPattern = /(?:from|sender)\s+(01[0-9]{9})/i;
    const senderMatch = message.match(senderPattern);
    if (senderMatch) {
        result.sender = senderMatch[1];
    }

    return result;
}

/**
 * Parse Nagad SMS message
 * Example: "You have received Tk. 500.00 from 01XXXXXXXXX. Trx ID: NGD123456789 at 25-12-2024 14:30"
 */
function parseNagadSMS(message) {
    const result = {
        provider: 'nagad',
        trxId: null,
        amount: null,
        sender: null,
        rawMessage: message
    };

    // Extract TrxID (NGD..., Nagad..., Transaction ID...)
    const trxPatterns = [
        /Trx\s*ID\s*:?\s*([A-Z0-9]{10,15})/i,
        /TrxID\s*:?\s*([A-Z0-9]{10,15})/i,
        /Transaction\s*ID\s*:?\s*([A-Z0-9]{10,15})/i
    ];

    for (const pattern of trxPatterns) {
        const match = message.match(pattern);
        if (match) {
            result.trxId = match[1];
            break;
        }
    }

    // Extract amount
    const amountPatterns = [
        /(?:Tk|Taka)\.\s*([0-9,]+\.?[0-9]*)/i,
        /([0-9,]+\.?[0-9]*)\s*(?:Tk|Taka)/i
    ];

    for (const pattern of amountPatterns) {
        const match = message.match(pattern);
        if (match) {
            result.amount = parseFloat(match[1].replace(/,/g, ''));
            break;
        }
    }

    // Extract sender phone number
    const senderPattern = /(?:from|sender)\s+(01[0-9]{9})/i;
    const senderMatch = message.match(senderPattern);
    if (senderMatch) {
        result.sender = senderMatch[1];
    }

    return result;
}

/**
 * Parse Rocket SMS message
 * Example: "Bill Pay from A/C: 01xxxxxxxxx to 1234. Amount: Tk 500.00. Fee: Tk 0.00. TxnId: 1234567890. Bal: Tk 1000.00"
 */
function parseRocketSMS(message) {
    const result = {
        provider: 'rocket',
        trxId: null,
        amount: null,
        sender: null,
        rawMessage: message
    };

    // Extract TrxID (TxnId:..., TrxID...)
    const trxPatterns = [
        /TxnId\s*:?\s*([A-Z0-9]+)/i,
        /TrxID\s*:?\s*([A-Z0-9]+)/i,
        /Transaction\s*ID\s*:?\s*([A-Z0-9]+)/i
    ];

    for (const pattern of trxPatterns) {
        const match = message.match(pattern);
        if (match) {
            result.trxId = match[1];
            break;
        }
    }

    // Extract amount
    const amountPatterns = [
        /Amount\s*:\s*Tk\s*([0-9,]+\.?[0-9]*)/i,
        /(?:Tk|Taka|BDT)\s*([0-9,]+\.?[0-9]*)/i
    ];

    for (const pattern of amountPatterns) {
        const match = message.match(pattern);
        if (match) {
            result.amount = parseFloat(match[1].replace(/,/g, ''));
            break;
        }
    }

    // Extract sender
    const senderPattern = /(?:from|A\/C)\s*:?\s*(01[0-9]{9})/i;
    const senderMatch = message.match(senderPattern);
    if (senderMatch) {
        result.sender = senderMatch[1];
    }

    return result;
}

/**
 * Parse Generic Bank SMS message
 * Looks for common banking keywords like "Credited", "Deposit", "Trx"
 */
function parseBankSMS(message) {
    const result = {
        provider: 'bank',
        trxId: null,
        amount: null,
        sender: null,
        rawMessage: message
    };

    // Only proceed if it looks like a bank transaction (Credit/Deposit)
    if (!/credit|deposit|received/i.test(message)) {
        return result;
    }

    // Extract TrxID
    const trxPatterns = [
        /Trx\s*ID\s*:?\s*([A-Z0-9]{6,})/i,
        /Ref\s*:?\s*([A-Z0-9]{6,})/i,
        /Txn\s*:?\s*([A-Z0-9]{6,})/i
    ];

    for (const pattern of trxPatterns) {
        const match = message.match(pattern);
        if (match) {
            result.trxId = match[1];
            break;
        }
    }

    // Extract amount
    const amountPatterns = [
        /(?:BDT|Tk)\s*\.?\s*([0-9,]+\.?[0-9]*)/i,
        /([0-9,]+\.?[0-9]*)\s*(?:BDT|Tk)/i
    ];

    for (const pattern of amountPatterns) {
        const match = message.match(pattern);
        if (match) {
            result.amount = parseFloat(match[1].replace(/,/g, ''));
            break;
        }
    }

    return result;
}

/**
 * Supported Senders Whitelist
 * Only messages from these senders will be processed
 */
const ALLOWED_SENDERS = {
    BKASH: ['bkash'],
    NAGAD: ['nagad', '+8801970716167'],
    ROCKET: ['16222'],
    BANK: ['ibbl', 'islami.bank', 'islamibank'] // Normalized to lowercase
};

/**
 * Main parser function - auto-detects provider matches whitelist
 */
function parseSMS(message, sender = '') {
    const senderLower = sender.toLowerCase().trim();
    const messageLower = message.toLowerCase();

    // 1. bKash Checking
    if (ALLOWED_SENDERS.BKASH.includes(senderLower) || senderLower.includes('bkash')) {
        return parseBkashSMS(message);
    }

    // 2. Nagad Checking
    if (ALLOWED_SENDERS.NAGAD.includes(senderLower) || senderLower.includes('nagad')) {
        return parseNagadSMS(message);
    }

    // 3. Rocket Checking
    if (ALLOWED_SENDERS.ROCKET.includes(senderLower) || senderLower.includes('rocket')) {
        return parseRocketSMS(message);
    }

    // 4. Bank Checking
    if (ALLOWED_SENDERS.BANK.some(s => senderLower.includes(s))) {
        return parseBankSMS(message);
    }

    // Fallback: If sender is unknown/generic but message looks legitimate (e.g. testing)
    // We can strict block or allow fuzzy matching. 
    // For production security, we return null if sender not matched.

    // NOTE: For testing purposes if sender is empty or 'test', we try to auto-detect from content
    if (senderLower === '' || senderLower === 'test' || senderLower === 'unknown') {
        const bkashResult = parseBkashSMS(message);
        if (bkashResult.trxId) return bkashResult;

        const nagadResult = parseNagadSMS(message);
        if (nagadResult.trxId) return nagadResult;

        const rocketResult = parseRocketSMS(message);
        if (rocketResult.trxId) return rocketResult;
    }

    // Return null if sender is unrecognized
    return null;
}

module.exports = {
    parseSMS,
    parseBkashSMS,
    parseNagadSMS,
    parseRocketSMS,
    parseBankSMS
};
