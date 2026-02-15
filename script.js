// ===== Variables =====
let products = JSON.parse(localStorage.getItem("products")) || [];
const campus = "CBU";
const placeholderImage = "https://via.placeholder.com/250x150?text=No+Image";
const adminCredentials = { username: "admin", password: "4804" };

// ===== DOMContentLoaded =====
window.addEventListener("DOMContentLoaded", () => {
    // Dark mode
    const darkToggle = document.getElementById("darkToggle");
    if (localStorage.getItem("theme") === "dark") document.body.classList.add("dark-mode");
    darkToggle.addEventListener("click", () => {
        document.body.classList.toggle("dark-mode");
        localStorage.setItem("theme", document.body.classList.contains("dark-mode") ? "dark" : "light");
    });

    updateAuthButtons();
    displayProducts();
});

// ===== Auth Functions =====
function login() {
    const username = prompt("Username:");
    const password = prompt("Password:");
    if (!username || !password) return alert("Both fields required!");

    if (username === adminCredentials.username && password === adminCredentials.password) {
        localStorage.setItem("loggedIn","true");
        localStorage.setItem("username","Admin");
        localStorage.setItem("isAdmin","true");
        alert("Welcome Admin!");
    } else {
        localStorage.setItem("loggedIn","true");
        localStorage.setItem("username",username);
        localStorage.setItem("isAdmin","false");
        alert("Welcome "+username+"!");
    }
    updateAuthButtons();
}

function signup() {
    const name = prompt("Enter your name:");
    if (!name) return;
    localStorage.setItem("loggedIn","true");
    localStorage.setItem("username",name);
    localStorage.setItem("isAdmin","false");
    alert("Account created! Welcome "+name+"!");
    updateAuthButtons();
}

function logout() {
    localStorage.removeItem("loggedIn");
    localStorage.removeItem("username");
    localStorage.removeItem("isAdmin");
    updateAuthButtons();
}

// ===== Update Auth Buttons =====
function updateAuthButtons() {
    const signupBtn = document.getElementById("signupBtn");
    const loginBtn = document.getElementById("loginBtn");
    const logoutBtn = document.getElementById("logoutBtn");
    const postBtn = document.getElementById("postBtn");

    const isLoggedIn = localStorage.getItem("loggedIn") === "true";

    signupBtn.style.display = isLoggedIn ? "none" : "inline-block";
    loginBtn.style.display = isLoggedIn ? "none" : "inline-block";
    logoutBtn.style.display = isLoggedIn ? "inline-block" : "none";
    postBtn.style.display = isLoggedIn ? "inline-block" : "none";
}

// ===== Post Item =====
function showPostForm() { document.getElementById("postFormContainer").classList.remove("hidden"); }
function hidePostForm() { document.getElementById("postFormContainer").classList.add("hidden"); }

function addProduct() {
    const title = document.getElementById("title").value.trim();
    const contact = document.getElementById("contact").value.trim();
    const imageFile = document.getElementById("imageInput").files[0]; // file input
    const price = document.getElementById("price").value.trim();
    const category = document.getElementById("category").value.trim();
    const description = document.getElementById("description").value.trim();

    if (!title || !contact) {
        alert("Title and WhatsApp number required!");
        return;
    }

    if (imageFile) {
        const reader = new FileReader();
        reader.onload = function(e) {
            saveProduct(e.target.result); // pass the base64 string
        }
        reader.readAsDataURL(imageFile);
    } else {
        saveProduct(""); // no image
    }

    hidePostForm();
    clearForm();
}

function saveProduct(img) {
    products.push({
        title: document.getElementById("title").value.trim(),
        price: document.getElementById("price").value.trim(),
        category: document.getElementById("category").value.trim(),
        contact: document.getElementById("contact").value.trim(),
        description: document.getElementById("description").value.trim(),
        image: img, // this must be the base64 string
        campus: "CBU"
    });

    localStorage.setItem("products", JSON.stringify(products));
    displayProducts();
}

function clearForm() {
    document.querySelectorAll("input, textarea").forEach(el => el.value="");
    document.getElementById("imagePreview").src = placeholderImage;
}

// ===== Display Products =====
function displayProducts(list = products) {
    const container = document.getElementById("productList");
    container.innerHTML = "";

    if (list.length === 0) {
        container.innerHTML = "<p>No items posted yet.</p>";
        return;
    }

    const isAdmin = localStorage.getItem("isAdmin") === "true";

    list.forEach((p, index) => {
        const imgSrc = p.image || "https://via.placeholder.com/250x150?text=No+Image";

        container.innerHTML += `
            <div class="card">
                <img src="${imgSrc}" class="productImg">
                <h3>${p.title}</h3>
                <p><strong>${p.price}</strong></p>
                <p>${p.category}</p>
                <p>${p.description}</p>
                <button onclick="contactSeller('${p.contact}')">Contact</button>
                ${isAdmin ? `<button onclick="deleteProduct(${index})" style="background:red;">Delete</button>` : ""}
            </div>
        `;
    });
}

// ===== Delete Product =====
function deleteProduct(index) {
    if (!confirm("Delete this item?")) return;
    products.splice(index,1);
    localStorage.setItem("products", JSON.stringify(products));
    displayProducts();
}

// ===== WhatsApp Contact =====
function contactSeller(number) {
    let cleanNumber = number.replace(/[\s+-]/g,'');
    if (!cleanNumber.startsWith("26")) cleanNumber = "26"+cleanNumber;
    const message = encodeURIComponent("Hello, I'm interested in your item!");
    window.open(`https://wa.me/${cleanNumber}?text=${message}`, "_blank");
}

// ===== Search & Filter =====
document.getElementById("searchInput").addEventListener("input", function() {
    const val = this.value.toLowerCase();
    displayProducts(products.filter(p => p.title.toLowerCase().includes(val)));
});

function filterCategory(cat) {
    if (cat==="All") displayProducts();
    else displayProducts(products.filter(p=>p.category.toLowerCase()===cat.toLowerCase()));
}
function contactSeller(number) {
    // Clean the number: remove spaces, plus signs, etc.
    let cleanNumber = number.replace(/[\s+-]/g, '');
    
    // Add Zambia country code if missing
    if (!cleanNumber.startsWith("26")) cleanNumber = "26" + cleanNumber;

    // Predefined message
    const message = encodeURIComponent("Hello, I'm interested in your item!");

    // Detect mobile devices
    const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

    if (isMobile) {
        // Open WhatsApp app directly
        window.location.href = `whatsapp://send?phone=${cleanNumber}&text=${message}`;
    } else {
        // Fallback to WhatsApp Web
        window.open(`https://wa.me/${cleanNumber}?text=${message}`, "_blank")
            || alert("Please open WhatsApp manually: " + cleanNumber);
    }
}
document.getElementById("imageInput").addEventListener("change", function() {
    const file = this.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function(e) {
        document.getElementById("imagePreview").src = e.target.result;
    }
    reader.readAsDataURL(file);
});