document.addEventListener('DOMContentLoaded', () => {
    const API_BASE = '../php/admin/';

    // --- State ---
    const state = {
        products: [],
        orders: [],
        users: [],
        categories: [
            { id: 1, name: 'Shoes', prefix: '1000' },
            { id: 2, name: 'T-Shirts', prefix: '2000' },
            { id: 3, name: 'Pants', prefix: '3000' },
            { id: 4, name: 'Jackets', prefix: '4000' }
        ],
        brands: ['Nike', 'Adidas', 'Puma']
    };

    // --- DOM Elements ---
    const pageTitle = document.getElementById('page-title');
    const sidebarItems = document.querySelectorAll('.nav-item:not(.logout)');
    const productModal = document.getElementById('product-modal');

    // --- Initial Load ---
    checkAdminAuth();

    function checkAdminAuth() {
        fetch('../php/auth_check.php')
            .then(res => res.json())
            .then(data => {
                if (!data.logged_in || (data.role !== 'admin' && data.role !== 'super_admin')) {
                    console.warn('Auth failed', data);
                    window.location.href = '../login.html';
                } else {
                    renderDashboard();
                }
            })
            .catch((err) => {
                console.error('Auth check error', err);
                window.location.href = '../login.html';
            });
    }

    // --- Navigation Logic ---
    sidebarItems.forEach(item => {
        item.addEventListener('click', () => {
            const target = item.getAttribute('data-target');
            if (target === 'search_product') return; // handled separately or just view

            sidebarItems.forEach(i => i.classList.remove('active'));
            item.classList.add('active');

            document.querySelectorAll('.view-section').forEach(view => view.classList.remove('active'));
            const targetView = document.getElementById(`${target}-view`);
            if (targetView) targetView.classList.add('active');

            pageTitle.textContent = target.charAt(0).toUpperCase() + target.slice(1).replace('_', ' ');

            if (target === 'dashboard') renderDashboard();
            if (target === 'products') fetchAndRenderProducts();
            if (target === 'orders') fetchAndRenderOrders();
            if (target === 'users') fetchAndRenderUsers();
            if (target === 'inventory') renderInventory();
            if (target === 'featured') renderFeatured();
            if (target === 'sales') renderSales();
        });
    });

    document.querySelector('.logout').addEventListener('click', () => {
        fetch('../php/auth_logout.php').then(() => window.location.href = '../login.html');
    });

    // --- Render Functions ---

    function renderDashboard() {
        fetch(API_BASE + 'dashboard_stats.php')
            .then(res => {
                if (res.status === 403) window.location.href = '../login.html';
                return res.json();
            })
            .then(data => {
                document.getElementById('stats-grid').innerHTML = `
                    <div class="stat-card">
                        <div class="stat-info"><h4>Total Sales</h4><p>$${parseFloat(data.total_sales).toFixed(2)}</p></div>
                        <div class="stat-icon"><i class="fas fa-dollar-sign"></i></div>
                    </div>
                     <div class="stat-card">
                        <div class="stat-info"><h4>Total Products</h4><p>${data.total_products}</p></div>
                        <div class="stat-icon"><i class="fas fa-tshirt"></i></div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-info"><h4>Pending Orders</h4><p>${data.pending_orders}</p></div>
                        <div class="stat-icon"><i class="fas fa-clock"></i></div>
                    </div>
                     <div class="stat-card">
                        <div class="stat-info"><h4>Low Stock</h4><p>${data.low_stock_count}</p></div>
                        <div class="stat-icon text-danger"><i class="fas fa-exclamation-triangle"></i></div>
                    </div>
                `;

                // Recent Orders
                document.getElementById('recent-orders-table').innerHTML = data.recent_orders.map(order => `
                    <tr>
                        <td>${order.order_id}</td>
                        <td>${order.full_name}</td>
                        <td>$${parseFloat(order.total_price).toFixed(2)}</td>
                        <td><span class="status-badge status-${order.status.toLowerCase()}">${order.status}</span></td>
                    </tr>
                `).join('');

                // Low Stock List
                document.getElementById('low-stock-list').innerHTML = data.low_stock_list.map(p =>
                    `<div class="list-item"><span>${p.name} (${p.size_display})</span> <span class="value">${p.quantity}</span></div>`
                ).join('');

                // Top Selling (Mocking UI for now if real data is complex, but endpoint returns it)
                if (data.top_selling) {
                    document.getElementById('top-selling-list').innerHTML = data.top_selling.map(p =>
                        `<div class="list-item"><span>${p.name}</span> <span class="value">${p.sold} sold</span></div>`
                    ).join('');
                }
            });
    }

    function fetchAndRenderProducts() {
        fetch(API_BASE + 'products.php')
            .then(res => res.json())
            .then(products => {
                state.products = products; // Cache for edit
                document.getElementById('products-table').innerHTML = products.map(product => `
                    <tr>
                        <td>${product.product_unique_id || product.product_id}</td>
                        <td><img src="../${product.main_image}" alt="${product.name}" style="width: 40px; border-radius: 4px; object-fit:cover;"></td>
                        <td>${product.name}</td>
                        <td>${product.brand || '-'}</td>
                        <td>${product.category || '-'}</td>
                        <td>$${parseFloat(product.price).toFixed(2)}</td>
                        <td><span class="${product.quantity < 10 ? 'text-danger' : ''}">${product.quantity}</span></td>
                        <td>
                            <button class="action-btn edit-btn" onclick="openEditProduct(${product.product_id})"><i class="fas fa-edit"></i></button>
                            <button class="action-btn delete-btn" onclick="deleteProduct(${product.product_id})"><i class="fas fa-trash"></i></button>
                        </td>
                    </tr>
                `).join('');
                renderInventory(); // Update inventory table if just fetched
            });
    }

    function fetchAndRenderOrders() {
        fetch(API_BASE + 'orders.php')
            .then(res => res.json())
            .then(orders => {
                state.orders = orders;
                document.getElementById('orders-table').innerHTML = orders.map(order => `
                    <tr>
                        <td>${order.id}</td>
                        <td>${order.customer}</td>
                        <td>$${parseFloat(order.total).toFixed(2)}</td>
                        <td><span class="status-badge status-${order.status.toLowerCase()}">${order.status}</span></td>
                        <td><button class="action-btn edit-btn" onclick="viewOrder('${order.id}')"><i class="fas fa-eye"></i></button></td>
                    </tr>
                `).join('');
            });
    }

    function fetchAndRenderUsers() {
        fetch(API_BASE + 'users.php')
            .then(res => res.json())
            .then(users => {
                state.users = users;
                document.getElementById('users-table').innerHTML = users.map(user => `
                    <tr>
                        <td>${user.id}</td>
                        <td>${user.name}</td>
                        <td>${user.email}</td>
                        <td><span class="status-badge">${user.role}</span></td>
                        <td><button class="action-btn delete-btn" onclick="deleteUser('${user.id}')"><i class="fas fa-trash"></i></button></td>
                    </tr>
                `).join('');
            });
    }

    function renderInventory() {
        // Client-side filtering of fetched products
        const catFilter = document.getElementById('inv-filter-category').value;
        const brandFilter = document.getElementById('inv-filter-brand').value;
        const statusFilter = document.getElementById('inv-filter-status').value;

        // Populate dynamic filters if empty
        const catSelect = document.getElementById('inv-filter-category');
        if (catSelect.options.length === 1) {
            state.categories.forEach(c => catSelect.innerHTML += `<option value="${c.name}">${c.name}</option>`);
        }
        const brandSelect = document.getElementById('inv-filter-brand');
        if (brandSelect.options.length === 1) {
            state.brands.forEach(b => brandSelect.innerHTML += `<option value="${b}">${b}</option>`);
        }

        let filtered = state.products;
        if (!filtered) return;

        if (catFilter !== 'all') filtered = filtered.filter(p => p.category === catFilter);
        if (brandFilter !== 'all') filtered = filtered.filter(p => p.brand === brandFilter);
        if (statusFilter === 'low') filtered = filtered.filter(p => p.quantity < 10);
        if (statusFilter === 'out') filtered = filtered.filter(p => p.quantity == 0);

        document.getElementById('inventory-table').innerHTML = filtered.map(p => `
            <tr>
                <td>${p.product_unique_id || p.product_id}</td>
                <td>${p.name}</td>
                <td>${p.brand}</td>
                <td>${p.category}</td>
                <td>${p.quantity}</td>
                <td><span class="status-badge ${p.quantity < 10 ? 'status-pending' : 'status-completed'}">${p.quantity < 10 ? 'Low' : 'OK'}</span></td>
            </tr>
        `).join('');
    }

    function renderFeatured() {
        if (state.products.length === 0) {
            fetch(API_BASE + 'products.php?v=' + Date.now())
                .then(res => res.json())
                .then(products => {
                    state.products = products;
                    renderFeatured();
                });
            return;
        }

        const featured = state.products.filter(p => p.is_feature == 1 || p.is_feature === '1' || p.is_feature === true);
        document.getElementById('featured-table').innerHTML = featured.map(product => `
            <tr>
                <td>${product.product_unique_id || product.product_id}</td>
                <td><img src="../${product.main_image}" alt="${product.name}" style="width: 40px; border-radius: 4px; object-fit:cover;"></td>
                <td>${product.name}</td>
                <td>$${parseFloat(product.price).toFixed(2)}</td>
                <td><span class="${product.quantity < 10 ? 'text-danger' : ''}">${product.quantity}</span></td>
                <td>
                    <button class="action-btn edit-btn" onclick="openEditProduct(${product.product_id})"><i class="fas fa-edit"></i></button>
                </td>
            </tr>
        `).join('');
    }

    function renderSales() {
        if (state.products.length === 0) {
            fetch(API_BASE + 'products.php?v=' + Date.now())
                .then(res => res.json())
                .then(products => {
                    state.products = products;
                    renderSales();
                });
            return;
        }

        const sales = state.products.filter(p => p.is_sale == 1 || p.is_sale === '1' || p.is_sale === true);
        document.getElementById('sales-table').innerHTML = sales.map(product => `
            <tr>
                <td>${product.product_unique_id || product.product_id}</td>
                <td><img src="../${product.main_image}" alt="${product.name}" style="width: 40px; border-radius: 4px; object-fit:cover;"></td>
                <td>${product.name}</td>
                <td>$${parseFloat(product.price).toFixed(2)}</td>
                <td>On Sale</td>
                <td><span class="${product.quantity < 10 ? 'text-danger' : ''}">${product.quantity}</span></td>
                <td>
                    <button class="action-btn edit-btn" onclick="openEditProduct(${product.product_id})"><i class="fas fa-edit"></i></button>
                </td>
            </tr>
        `).join('');
    }

    // Listeners for Inventory
    ['inv-filter-status', 'inv-filter-category', 'inv-filter-brand'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.addEventListener('change', renderInventory);
    });

    // --- Product Logic ---
    document.getElementById('add-product-btn').addEventListener('click', () => {
        document.getElementById('product-form').reset();
        document.getElementById('edit-product-id').value = '';
        document.getElementById('modal-title').textContent = 'Add Product';
        document.getElementById('prod-image').value = '';
        productModal.style.display = 'flex';
    });

    window.openEditProduct = (id) => {
        const p = state.products.find(prod => prod.product_id == id); // loose comparison for string/int
        if (!p) return;

        document.getElementById('edit-product-id').value = id;
        document.getElementById('prod-name').value = p.name;
        // Logic to match select options exact value
        document.getElementById('prod-brand').value = p.brand;
        document.getElementById('prod-category').value = p.category;
        document.getElementById('prod-price').value = p.price;
        document.getElementById('prod-qty').value = p.quantity;
        document.getElementById('prod-desc').value = p.description;
        document.getElementById('prod-image').value = p.main_image;
        document.getElementById('prod-colors').value = p.colors ? p.colors.join(', ') : '';

        document.getElementById('prod-featured').checked = p.is_feature == 1;
        document.getElementById('prod-onsale').checked = p.is_sale == 1;

        // Reset and Set Checkboxes
        document.querySelectorAll('.size-chk').forEach(cb => cb.checked = false);
        if (p.sizes && Array.isArray(p.sizes)) {
            p.sizes.forEach(s => {
                const cb = document.querySelector(`.size-chk[value="${s}"]`);
                if (cb) cb.checked = true;
            });
        }

        document.getElementById('modal-title').textContent = 'Edit Product';
        productModal.style.display = 'flex';
    };

    window.deleteProduct = (id) => {
        if (confirm('Delete product?')) {
            const formData = new FormData();
            formData.append('action', 'delete');
            formData.append('product_id', id);

            fetch(API_BASE + 'products.php', { method: 'POST', body: formData })
                .then(res => res.json())
                .then(res => {
                    if (res.success) {
                        fetchAndRenderProducts();
                    } else {
                        alert("Error: " + res.message);
                    }
                });
        }
    };

    document.getElementById('product-form').addEventListener('submit', (e) => {
        e.preventDefault();

        const form = document.getElementById('product-form');
        const formData = new FormData();

        formData.append('product_id', document.getElementById('edit-product-id').value);
        formData.append('name', document.getElementById('prod-name').value);
        formData.append('brand', document.getElementById('prod-brand').value);
        formData.append('category', document.getElementById('prod-category').value);
        formData.append('price', document.getElementById('prod-price').value);
        formData.append('quantity', document.getElementById('prod-qty').value);
        formData.append('description', document.getElementById('prod-desc').value);
        formData.append('colors', document.getElementById('prod-colors').value);
        formData.append('existing_image', document.getElementById('prod-image').value);

        if (document.getElementById('prod-featured').checked) formData.append('is_feature', 1);
        if (document.getElementById('prod-onsale').checked) formData.append('is_sale', 1);

        // Files
        const fileInput = document.getElementById('prod-image-file');
        if (fileInput.files.length > 0) {
            formData.append('main_image', fileInput.files[0]);
        }

        // Sizes (checkboxes to array)
        document.querySelectorAll('.size-chk:checked').forEach(cb => {
            formData.append('sizes[]', cb.value);
        });

        fetch(API_BASE + 'products.php', {
            method: 'POST',
            body: formData
        })
            .then(res => res.json())
            .then(res => {
                if (res.success) {
                    productModal.style.display = 'none';
                    fetchAndRenderProducts();
                } else {
                    alert('Error processing product: ' + res.message);
                }
            });
    });

    // --- Order Logic ---
    window.viewOrder = (id) => {
        fetch(API_BASE + 'orders.php?id=' + id)
            .then(res => res.json())
            .then(order => {
                const modal = document.getElementById('order-modal');
                const content = document.getElementById('order-details-content');

                content.innerHTML = `
                    <p><strong>Order ID:</strong> ${order.order_id}</p>
                    <p><strong>Customer:</strong> ${order.customer} (${order.email})</p>
                    <hr>
                    ${order.items.map(i => `<div style="display:flex; justify-content:space-between; padding:5px 0;"><span>${i.name} (x${i.quantity})</span><span>$${parseFloat(i.price).toFixed(2)}</span></div>`).join('')}
                    <hr>
                    <h3>Total: $${parseFloat(order.total_price).toFixed(2)}</h3>
                `;

                document.getElementById('order-status-update').value = order.status;

                // Unbind previous onclick to avoid duplicates
                const saveBtn = document.getElementById('save-order-status');
                const newBtn = saveBtn.cloneNode(true);
                saveBtn.parentNode.replaceChild(newBtn, saveBtn);

                newBtn.onclick = () => {
                    const newStatus = document.getElementById('order-status-update').value;
                    fetch(API_BASE + 'orders.php', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ order_id: order.order_id, status: newStatus })
                    }).then(() => {
                        modal.style.display = 'none';
                        fetchAndRenderOrders();
                    });
                };

                modal.style.display = 'flex';
            });
    };

    window.deleteUser = (id) => {
        if (confirm('Delete user?')) {
            fetch(API_BASE + 'users.php', {
                method: 'POST',
                body: JSON.stringify({ id: id }),
                headers: { 'Content-Type': 'application/json' }
            }).then(() => fetchAndRenderUsers());
        }
    };

    // Global Close Modal
    document.querySelectorAll('.close-modal').forEach(btn => btn.addEventListener('click', (e) => {
        e.target.closest('.modal').style.display = 'none';
    }));
});
