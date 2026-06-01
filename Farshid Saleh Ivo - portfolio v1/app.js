const subCount = document.querySelector(".sub-count");
const subCount2 = document.querySelector(".sub-count-2");

const getYouTubeSubs = async () => {
    try {
        const response = await fetch("/.netlify/functions/subscribers");
        const data = await response.json();

        subCount.innerHTML = Number(data.subscriberCount).toLocaleString();
        subCount2.innerHTML = Number(data.subscriberCount2).toLocaleString();
    } catch (error) {
        console.error(error);
        subCount.innerHTML = "Error loading subscriber count";
        subCount2.innerHTML = "Error loading subscriber count";
    }
};