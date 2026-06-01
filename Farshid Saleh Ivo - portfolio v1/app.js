const subCount = document.querySelector(".sub-count");

const getYouTubeSubs = async () => {
    try {
        const response = await fetch(
            "/.netlify/functions/subscribers"
        );

        const data = await response.json();

        subCount.innerHTML =
            Number(data.subscriberCount).toLocaleString();
    } catch (error) {
        console.error(error);

        subCount.innerHTML =
            "Error loading subscriber count";
    }
};

getYouTubeSubs();

document
    .getElementById("hamburgerMenu")
    .addEventListener("click", function () {
        const navbar =
            document.getElementById("navbar");

        navbar.classList.toggle("showNav");
    });

function toggleSkills() {
    const skillsList =
        document.getElementById("skillsList");

    const toggleButton =
        document.getElementById("toggleButton");

    if (
        skillsList.classList.contains("collapsed")
    ) {
        skillsList.classList.remove("collapsed");
        skillsList.classList.add("expanded");

        toggleButton.textContent =
            "Hide Skills";
    } else {
        skillsList.classList.remove("expanded");
        skillsList.classList.add("collapsed");

        toggleButton.textContent =
            "Show Skills";
    }
}