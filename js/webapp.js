"use strict";
(function () {
    // DOM Elements
    var nitrogenValue = document.querySelector("#nitrogen-value"),
        phosphorusValue = document.querySelector("#phosphorus-value"),
        potassiumValue = document.querySelector("#potassium-value"),
        lastUpdatedElement = document.querySelector("#last-updated"),
        statusDisplay = document.querySelector("#status-display"),
        refreshButton = document.querySelector("#refresh"),
        checkConnectionButton = document.querySelector("#check-connection"),
        addNotificationButton = document.querySelector("#add-notification"),
        reloadButton = document.querySelector("#reload"),
        onlineStatusIndicator = document.querySelector("#online-status");

    // Utility Functions
    function updateSensorDisplay(data) {
        console.log("Updating Display with Data:", data);
        nitrogenValue.textContent = data.nitrogen || '--';
        phosphorusValue.textContent = data.phosphorus || '--';
        potassiumValue.textContent = data.potassium || '--';

        var timestamp = new Date().toLocaleString();
        lastUpdatedElement.textContent = timestamp;
    }

    function handleConnectionStatus() {
        var connectionStatus = window.navigator.onLine;
        statusDisplay.textContent = connectionStatus ? "Connected" : "Offline";
        onlineStatusIndicator.classList.toggle("online", connectionStatus);
        onlineStatusIndicator.classList.toggle("offline", !connectionStatus);
    }

    function fetchNPKData() {
        var xhr = new XMLHttpRequest();
        xhr.open("GET", "https://firebase-4j9i.onrender.com/get-npk", true);
        xhr.onreadystatechange = function() {
            if (xhr.readyState === 4 && xhr.status === 200) {
                try {
                    var data = JSON.parse(xhr.responseText);
                    if (data && data.status === "success") {
                        updateSensorDisplay(data.data);
                        statusDisplay.textContent = "Data Loaded Successfully";
                    } else {
                        statusDisplay.textContent = "No Data Available";
                    }
                } catch (e) {
                    console.error("Error parsing JSON response:", e);
                    statusDisplay.textContent = "Error Loading Data";
                }
            } else if (xhr.readyState === 4) {
                statusDisplay.textContent = "Error Loading Data";
            }
        };
        xhr.send();
    }
    

    // Notifications
    function setupNotifications() {
        if ("Notification" in window) {
            Notification.requestPermission().then(function (permission) {
                if (permission === "granted") {
                    console.log("Notification permission granted");
                }
            });
        }
    }

    function sendNPKAlertNotification(type, value) {
        if (Notification.permission === "granted") {
            new Notification("NPK Alert", {
                body: `${type} level is critical: ${value}`,
                tag: `npk-${type}-alert`
            });
        }
    }

    // Event Listeners
    if (refreshButton) {
        refreshButton.onclick = fetchNPKData;
    }

    if (checkConnectionButton) {
        checkConnectionButton.onclick = handleConnectionStatus;
    }

    if (addNotificationButton) {
        addNotificationButton.onclick = setupNotifications;
    }

    if (reloadButton) {
        reloadButton.onclick = fetchNPKData;
    }

    // Connection and Visibility Event Listeners
    window.addEventListener('online', handleConnectionStatus);
    window.addEventListener('offline', handleConnectionStatus);

    document.addEventListener('visibilitychange', function () {
        if (!document.hidden) {
            fetchNPKData();
        }
    });

    // Initialize on script load
    function init() {
        handleConnectionStatus();
        fetchNPKData();
        setupNotifications();
    }

    // Run initialization
    init();
})();