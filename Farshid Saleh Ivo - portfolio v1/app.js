const subCount = document.querySelector(".sub-count");
const subCount2 = document.querySelector(".sub-count-2");

const getYouTubeSubs = async () => {
    try {
        const response = await fetch("/.netlify/functions/subscribers");
        const data = await response.json();

        subCount.textContent = Number(data.subscriberCount).toLocaleString();
        subCount2.textContent = Number(data.subscriberCount2).toLocaleString();
    } catch (error) {
        console.error(error);
        subCount.textContent = "Error";
        subCount2.textContent = "Error";
    }
};

getYouTubeSubs(); // ← THIS IS REQUIRED

function toggleSkills() {
    const skillsList = document.getElementById("skillsList");
    const button = document.getElementById("toggleButton");

    skillsList.classList.toggle("collapsed");

    if (skillsList.classList.contains("collapsed")) {
        button.textContent = "Show Skills";
    } else {
        button.textContent = "Hide Skills";
    }
}
            "Show Skills";
