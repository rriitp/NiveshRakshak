const express = require("express");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));


// Scam analysis engine
function analyzeMessage(message) {
    const text = message.toLowerCase();

    const redFlags = [];

    const rules = [
        {
            keywords: ["guaranteed return", "guaranteed profit", "100% profit", "sure profit"],
            title: "Guaranteed return claim",
            description: "The message promises guaranteed or unusually certain returns.",
            severity: "High"
        },
        {
            keywords: ["urgent", "act now", "limited time", "today only", "last chance"],
            title: "Urgency / pressure",
            description: "The message creates pressure to make a quick financial decision.",
            severity: "High"
        },
        {
            keywords: ["telegram", "whatsapp group", "secret group", "vip group"],
            title: "Private tip-group pattern",
            description: "The message redirects the user to a private messaging or tip group.",
            severity: "Medium"
        },
        {
            keywords: ["otp", "password", "pin", "cvv"],
            title: "Sensitive information request",
            description: "The message appears to request sensitive authentication or financial information.",
            severity: "Critical"
        },
        {
            keywords: ["processing fee", "withdrawal fee", "tax before withdrawal", "unlock fee"],
            title: "Payment / withdrawal red flag",
            description: "The message asks for money before releasing or processing funds.",
            severity: "Critical"
        },
        {
            keywords: ["sebi approved", "sebi registered", "government approved"],
            title: "Authority claim requires verification",
            description: "The message uses a regulatory or government authority claim that should be independently verified.",
            severity: "Medium"
        },
        {
            keywords: ["double your money", "10x", "20x", "easy money"],
            title: "Unrealistic profit language",
            description: "The message uses unusually attractive profit or wealth claims.",
            severity: "High"
        }
    ];

    rules.forEach(rule => {
        const found = rule.keywords.some(keyword => text.includes(keyword));

        if (found) {
            redFlags.push({
                title: rule.title,
                description: rule.description,
                severity: rule.severity
            });
        }
    });

    // Calculate risk score
    let score = 10;

    redFlags.forEach(flag => {
        if (flag.severity === "Critical") {
            score += 30;
        } else if (flag.severity === "High") {
            score += 22;
        } else {
            score += 12;
        }
    });

    score = Math.min(score, 98);

    let level;

    if (score >= 70) {
        level = "HIGH RISK";
    } else if (score >= 40) {
        level = "MEDIUM RISK";
    } else {
        level = "LOW RISK";
    }

    const actions = [
        "Do not transfer money until the claim and entity are independently verified.",
        "Do not share OTP, PIN, password, CVV or other sensitive credentials.",
        "Verify the organisation through official sources instead of links supplied in the message.",
        "Avoid making financial decisions under pressure or urgency."
    ];

    return {
        score,
        level,
        redFlags,
        actions
    };
}


// Analysis API
app.post("/api/analyze", (req, res) => {
    const { message } = req.body;

    if (!message || message.trim().length < 10) {
        return res.status(400).json({
            error: "Please enter a longer message for analysis."
        });
    }

    const result = analyzeMessage(message);

    res.json(result);
});


app.listen(PORT, "0.0.0.0", () => {
    console.log(`NiveshRakshak running at http://localhost:${PORT}`);
});