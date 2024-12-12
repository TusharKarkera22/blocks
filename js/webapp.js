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
        fetch("https://firebase-4j9i.onrender.com/get-npk")
            .then(response => {
                if (!response.ok) {
                    throw new Error("Network response was not ok");
                }
                return response.json();
            })
            .then(data => {
                if (data && data.status === "success") {
                    updateSensorDisplay(data.data);
                    statusDisplay.textContent = "Data Loaded Successfully";
                } else {
                    statusDisplay.textContent = "No Data Available";
                }
            })
            .catch(error => {
                console.error("Error fetching data:", error);
                statusDisplay.textContent = "Error Loading Data";
            });
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
    
    document.addEventListener('visibilitychange', function() {
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
