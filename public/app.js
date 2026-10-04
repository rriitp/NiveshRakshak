const messageInput = document.getElementById("messageInput");
const analyzeButton = document.getElementById("analyzeButton");
const demoButton = document.getElementById("demoButton");

const resultSection = document.getElementById("resultSection");

const riskLevel = document.getElementById("riskLevel");
const riskScore = document.getElementById("riskScore");

const redFlags = document.getElementById("redFlags");
const safeActions = document.getElementById("safeActions");


// Demo message
const demoMessage = `
SEBI approved investment opportunity!

Guaranteed 30% return in just 7 days.
Limited time offer — act now!

Join our exclusive Telegram VIP group
and contact our investment advisor.

To withdraw your profit, pay a small
processing fee first.
`;


// Put demo message into textarea
demoButton.addEventListener("click", () => {

    messageInput.value = demoMessage.trim();

    messageInput.focus();

});


// Analyze message
analyzeButton.addEventListener("click", async () => {

    const message = messageInput.value.trim();

    if (!message) {

        alert("Please paste a suspicious investment message first.");

        return;
    }


    analyzeButton.disabled = true;

    analyzeButton.textContent = "Analyzing...";


    try {

        const response = await fetch("/api/analyze", {

            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                message: message
            })

        });


        const data = await response.json();


        if (!response.ok) {

            alert(data.error || "Something went wrong.");

            return;
        }


        showResult(data);


    } catch (error) {

        console.error(error);

        alert(
            "Unable to connect to the analysis server. " +
            "Make sure Node.js server is running."
        );

    } finally {

        analyzeButton.disabled = false;

        analyzeButton.textContent = "🔍 Analyze Risk";

    }

});


// Display result
function showResult(data) {

    resultSection.classList.remove("hidden");


    riskLevel.textContent = data.level;

    riskScore.textContent = data.score;


    // Risk color
    if (data.score >= 70) {

        riskLevel.style.color = "#c62828";

    } else if (data.score >= 40) {

        riskLevel.style.color = "#b26a00";

    } else {

        riskLevel.style.color = "#16803c";

    }


    // Red flags
    redFlags.innerHTML = "";


    if (data.redFlags.length === 0) {

        redFlags.innerHTML = `
            <div class="flag">
                <strong>No major red flags detected</strong>
                <p>
                    This does not guarantee that the message is safe.
                    Independently verify important financial claims.
                </p>
            </div>
        `;

    } else {

        data.redFlags.forEach(flag => {

            const div = document.createElement("div");

            div.className = "flag";

            div.innerHTML = `
                <strong>🚩 ${escapeHTML(flag.title)}</strong>
                <p>${escapeHTML(flag.description)}</p>
            `;

            redFlags.appendChild(div);

        });

    }


    // Safe actions
    safeActions.innerHTML = "";

    data.actions.forEach(action => {

        const li = document.createElement("li");

        li.textContent = action;

        safeActions.appendChild(li);

    });


    // Scroll to result
    resultSection.scrollIntoView({
        behavior: "smooth",
        block: "start"
    });

}


// Basic HTML escaping
function escapeHTML(text) {

    const div = document.createElement("div");

    div.textContent = text;

    return div.innerHTML;
}