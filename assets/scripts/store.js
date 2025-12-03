async function loadStoreApps() {
    const storeList = document.getElementById("store-list");

    const response = await fetch("apps/apps.json");
    const appFiles = await response.json();

    storeList.innerHTML = "";

    for (const file of appFiles) {
        const appData = await fetch("apps/" + file).then(r => r.json());

        const card = document.createElement("div");
        card.className =
            "bg-gray-800 p-4 rounded-xl border border-gray-700 shadow-lg flex flex-col items-center text-center";

        card.innerHTML = `
            <img src="${appData.icon}" class="w-20 h-20 rounded mb-4 shadow-md">
            <h3 class="text-lg font-bold">${appData.name}</h3>
            <p class="text-gray-400 text-sm mt-2">${appData.description}</p>

            <button class="install-btn mt-4 w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg"
                    data-file="${file}">
                Installer
            </button>
        `;

        storeList.appendChild(card);
    }

    // Installation
    document.querySelectorAll(".install-btn").forEach(btn => {
        btn.addEventListener("click", () => installApp(btn.dataset.file));
    });
}

async function installApp(fileName) {
    const appData = await fetch("apps/" + fileName).then(r => r.json());

    let installed = JSON.parse(localStorage.getItem("installedApps") || "[]");

    // déjà installé
    if (installed.find(a => a.name === appData.name)) {
        alert("Application déjà installée !");
        return;
    }

    installed.push(appData);
    localStorage.setItem("installedApps", JSON.stringify(installed));

    alert("Application installée !");
}

window.onload = loadStoreApps;