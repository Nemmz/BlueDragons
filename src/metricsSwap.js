document.addEventListener("DOMContentLoaded", () => {

    document.querySelectorAll(".metric-arrow").forEach(arrow => {
        arrow.addEventListener("click", (e) => {
            e.stopPropagation();

            const menu = arrow.parentElement.querySelector(".metric-menu");

            // Close all other menus
            document.querySelectorAll(".metric-menu").forEach(m => {
                if (m !== menu) m.style.display = "none";
            });

            // Toggle current
            menu.style.display = (menu.style.display === "block") ? "none" : "block";
        });
    });

    // When selecting a metric option
    document.querySelectorAll(".metric-menu div").forEach(option => {
        option.addEventListener("click", () => {
            const newValue = option.getAttribute("data-value");
            const cell = option.closest(".metric-cell");
            cell.querySelector(".metric-text").textContent = newValue;

            // Close the menu
            option.parentElement.style.display = "none";
        });
    });

    // Click anywhere else closes menus
    document.addEventListener("click", () => {
        document.querySelectorAll(".metric-menu").forEach(m => m.style.display = "none");
    });

});