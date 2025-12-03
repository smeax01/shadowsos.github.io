function loadInstalledApps() {
    const desktop = document.getElementById("desktop-icons");
    const installed = JSON.parse(localStorage.getItem("installedApps") || "[]");

    desktop.innerHTML = "";

    installed.forEach(app => {
        const icon = document.createElement("div");
        icon.className = "flex flex-col items-center w-20 cursor-pointer";

        icon.innerHTML = `
            <img src="${app.icon}" class="w-16 h-16 mb-2">
            <span class="text-white text-sm text-center">${app.name}</span>
        `;

        icon.addEventListener("click", () => openApp(app.path));

        desktop.appendChild(icon);
    });
}

function openApp(path) {
    const win = document.getElementById("window");
    const frame = document.getElementById("app-frame");

    frame.src = path;
    win.style.display = "block";
}

window.onload = loadInstalledApps;