document.querySelectorAll(".app-btn").forEach(btn => {

    btn.addEventListener("click", () => {

        const url = btn.dataset.url;

        const start = Date.now();

        window.location.href = url;

        setTimeout(() => {

            if (Date.now() - start < 2500) {

                console.log("Возврат на страницу");

            }

        }, 1500);

    });

});

const input = document.getElementById("searchInput");
const button = document.getElementById("searchBtn");

function searchGoogle(){

    const query = input.value.trim();

    if(!query) return;

    window.open(
        "https://www.google.com/search?q=" +
        encodeURIComponent(query),
        "_blank"
    );

}

button.addEventListener("click", searchGoogle);

input.addEventListener("keydown", e => {

    if(e.key === "Enter"){

        searchGoogle();

    }

});