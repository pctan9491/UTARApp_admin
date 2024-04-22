// Initialize Firebase (use your own Firebase config)
const firebaseConfig = {
  apiKey: "AIzaSyBtSdg0XwU3cePNEn-HVlof8vj_imx0guA",
  authDomain: "utarapp-9f3db.firebaseapp.com",
  projectId: "utarapp-9f3db",
  storageBucket: "utarapp-9f3db.appspot.com",
  messagingSenderId: "331019317153",
  appId: "1:331019317153:web:79d3d098d6d5c3759da5e0",
};
firebase.initializeApp(firebaseConfig);

const db = firebase.firestore();
const notificationListContainer = document.getElementById("notificationList");
const searchTitleInput = document.getElementById("searchTitle");
const searchDateInput = document.getElementById("searchDate");
const searchButton = document.getElementById("searchButton");
const clearButton = document.getElementById("clearButton");

// Fetch notifications from Firestore
function fetchNotifications(titleFilter = "", dateFilter = "") {
  let query = db.collection("notification").orderBy("date", "desc");

  if (titleFilter) {
    query = query.where("title", "==", titleFilter);
  }

  if (dateFilter) {
    query = query.where("date", "==", dateFilter);
  }

  query
    .get()
    .then((querySnapshot) => {
      notificationListContainer.innerHTML = "";
      querySnapshot.forEach((doc) => {
        const notificationData = doc.data();
        const notificationId = doc.id;
        const notificationItem = createNotificationItem(
          notificationId,
          notificationData
        );
        notificationListContainer.appendChild(notificationItem);
      });
    })
    .catch((error) => {
      console.error("Error fetching notifications: ", error);
    });
}

// Create a notification item element
function createNotificationItem(notificationId, notificationData) {
  const notificationItem = document.createElement("div");
  notificationItem.classList.add("col-md-4", "mb-4");
  notificationItem.innerHTML = `
      <div class="card notification-item">
        <div class="card-body">
          <h5 class="notification-title">${notificationData.title}</h5>
          <p class="notification-date">${notificationData.date}</p>
        </div>
      </div>
    `;
  notificationItem.addEventListener("click", () => {
    window.location.href = `notification_details.html?id=${notificationId}`;
  });
  return notificationItem;
}

// Search notifications
function searchNotifications() {
  const titleFilter = searchTitleInput.value.trim();
  const dateFilter = searchDateInput.value;
  fetchNotifications(titleFilter, dateFilter);
}

// Clear search inputs and fetch all notifications
function clearSearch() {
  searchTitleInput.value = "";
  searchDateInput.value = "";
  fetchNotifications();
}

// Fetch notifications on page load
fetchNotifications();

// Add event listeners to search and clear buttons
searchButton.addEventListener("click", searchNotifications);
clearButton.addEventListener("click", clearSearch);
