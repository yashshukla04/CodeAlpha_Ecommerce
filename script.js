/* script.js */

let cart = [];
let allProducts = []; // Store products globally to find them for details
let currentUser = localStorage.getItem('user');

document.addEventListener('DOMContentLoaded', () => {
    loadProducts();
    updateAuthUI();
});

// 1. Fetch Products
async function loadProducts() {
    try {
        const res = await fetch('http://localhost:5000/api/products');
        allProducts = await res.json(); // Save to global variable
        const container = document.getElementById('product-list');
        
        container.innerHTML = allProducts.map(p => `
            <div class="col-md-4 col-sm-6">
                <div class="card product-card shadow-sm h-100">
                    <div class="product-img-container" style="cursor: pointer;" onclick="viewDetails('${p._id}')">
                        <img src="${p.image}" class="card-img-top product-img">
                    </div>
                    <div class="card-body d-flex flex-column">
                        <h5 class="card-title fw-bold" style="cursor: pointer;" onclick="viewDetails('${p._id}')">${p.name}</h5>
                        <p class="text-muted small flex-grow-1">${p.description.substring(0, 50)}...</p>
                        <div class="d-flex justify-content-between align-items-center mt-3">
                            <span class="price-tag">₹${p.price.toLocaleString('en-IN')}</span>
                            <button onclick="addToCart('${p._id}')" class="btn btn-primary btn-sm">Add +</button>
                        </div>
                    </div>
                </div>
            </div>
        `).join('');
    } catch (err) { console.error(err); }
}

// 2. View Details 
function viewDetails(id) {
    const product = allProducts.find(p => p._id === id);
    if(!product) return;

    document.getElementById('detail-name').innerText = product.name;
    document.getElementById('detail-price').innerText = `₹${product.price.toLocaleString('en-IN')}`;
    document.getElementById('detail-desc').innerText = product.description;
    document.getElementById('detail-extra').innerText = product.details || "No additional details.";
    document.getElementById('detail-img').src = product.image;

    new bootstrap.Modal(document.getElementById('detailsModal')).show();
}

// 3. Auth Functions
async function register() {
    const u = document.getElementById('reg-user').value;
    const p = document.getElementById('reg-pass').value;
    const res = await fetch('http://localhost:5000/api/register', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: u, password: p })
    });
    alert((await res.json()).message);
}

async function login() {
    const u = document.getElementById('login-user').value;
    const p = document.getElementById('login-pass').value;
    const res = await fetch('http://localhost:5000/api/login', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: u, password: p })
    });
    const data = await res.json();
    if(res.ok) {
        currentUser = data.username;
        localStorage.setItem('user', currentUser);
        updateAuthUI();
        bootstrap.Modal.getInstance(document.getElementById('authModal')).hide();
        alert("Welcome " + currentUser);
    } else {
        alert(data.message);
    }
}

function logout() {
    localStorage.removeItem('user');
    currentUser = null;
    updateAuthUI();
    window.location.reload();
}

function updateAuthUI() {
    const s = document.getElementById('auth-section');
    s.innerHTML = currentUser 
        ? `<span class="fw-bold me-2">👤 ${currentUser}</span><button onclick="logout()" class="btn btn-outline-danger btn-sm">Logout</button>`
        : `<button class="btn btn-outline-dark btn-sm" data-bs-toggle="modal" data-bs-target="#authModal">🔑 Login</button>`;
}

// 4. Cart Logic
function addToCart(id) {
    if(!currentUser) return alert("Please Login first!");
    const product = allProducts.find(p => p._id === id);
    cart.push(product);
    updateCartUI();
}

function updateCartUI() {
    document.getElementById('cart-count').innerText = cart.length;
    const total = cart.reduce((sum, item) => sum + item.price, 0);
    document.getElementById('cart-total').innerText = total.toLocaleString('en-IN');
    
    document.getElementById('cart-items').innerHTML = cart.length === 0 ? '<p class="text-center">Empty</p>' : 
        cart.map((item, i) => `
            <div class="list-group-item d-flex justify-content-between">
                <div>${item.name}<br><small>₹${item.price.toLocaleString('en-IN')}</small></div>
                <button onclick="cart.splice(${i},1);updateCartUI()" class="btn btn-sm text-danger">x</button>
            </div>`).join('');
}

// 5. Checkout (Database Order Processing)
async function checkout() {
    if(cart.length === 0) return alert("Cart is empty");

    const total = cart.reduce((sum, item) => sum + item.price, 0);

    const res = await fetch('http://localhost:5000/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: currentUser, items: cart, total: total })
    });

    if (res.ok) {
        alert(`✅ Order Placed Successfully!\nTotal: ₹${total.toLocaleString('en-IN')}`);
        cart = [];
        updateCartUI();
        bootstrap.Modal.getInstance(document.getElementById('cartModal')).hide();
    } else {
        alert("Error processing order.");
    }
}