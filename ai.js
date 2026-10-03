const insightsBtn = document.getElementById("insights-btn");
const insightsOutput = document.getElementById("insights-output");

insightsBtn.addEventListener("click", async function () {
    const saved = JSON.parse(localStorage.getItem("transactions")) || [];

    insightsBtn.disabled = true;
    insightsOutput.textContent = "Thinking...";

    try {
        const response = await fetch("/.netlify/functions/insights", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ transactions: saved })
        });

        const data = await response.json();

        if (!response.ok) {
            insightsOutput.textContent = "Something went wrong. Please try again later.";
            console.log(data);
        } else {
            insightsOutput.textContent = data.insight;
        }
    } catch (error) {
        insightsOutput.textContent = "Could not reach the AI. Check your internet and try again.";
        console.log(error);
    }

    insightsBtn.disabled = false;
});