(function ($) {

  "use strict";

  // API Configuration
  const API_PATH = 'php/';

  // Global User State
  let currentUser = null;

  var searchPopup = function () {
    // open search box
    $('.secondary-nav').on('click', '.search-button', function (e) {
      $('.search-popup').toggleClass('is-visible');
    });

    $('#header-nav').on('click', '.btn-close-search', function (e) {
      $('.search-popup').toggleClass('is-visible');
    });

    $(".search-popup-trigger").on("click", function (b) {
      b.preventDefault();
      $(".search-popup").addClass("is-visible"),
        setTimeout(function () {
          $(".search-popup").find("#search-form").focus()
        }, 350)
    }),
      $(".search-popup").on("click", function (b) {
        ($(b.target).is(".search-popup-close") || $(b.target).is(".search-popup-close svg") || $(b.target).is(".search-popup-close path") || $(b.target).is(".search-popup")) && (b.preventDefault(),
          $(this).removeClass("is-visible"))
      }),
      $(document).keyup(function (b) {
        "27" === b.which && $(".search-popup").removeClass("is-visible")
      })
  }

  // Preloader
  var initPreloader = function () {
    $(document).ready(function ($) {
      var Body = $('body');
      Body.addClass('preloader-site');
    });
    $(window).load(function () {
      $('.preloader-wrapper').fadeOut();
      $('body').removeClass('preloader-site');
    });
  }

  // init jarallax parallax
  var initJarallax = function () {
    if (document.querySelectorAll(".jarallax").length > 0) {
      jarallax(document.querySelectorAll(".jarallax"));
    }
    if (document.querySelectorAll(".jarallax-img").length > 0) {
      jarallax(document.querySelectorAll(".jarallax-img"), {
        keepImg: true,
      });
    }
  }

  // Tab Section
  var initTabs = function () {
    const tabs = document.querySelectorAll('[data-tab-target]')
    const tabContents = document.querySelectorAll('[data-tab-content]')

    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        const target = document.querySelector(tab.dataset.tabTarget)
        tabContents.forEach(tabContent => {
          tabContent.classList.remove('active')
        })
        tabs.forEach(tab => {
          tab.classList.remove('active')
        })
        tab.classList.add('active')
        target.classList.add('active')
      })
    });
  }

  // --- DYNAMIC FEATURES START ---

  // 1. Authentication
  function checkLogin() {
    $.ajax({
      url: API_PATH + 'auth_check.php',
      method: 'GET',
      dataType: 'json',
      success: function (response) {
        if (response.logged_in) {
          currentUser = response;
          updateAuthUI();
          if (window.location.pathname.includes('cart.html')) {
            loadCart();
          }
        } else {
          // If on cart page and not logged in, show message
          if (window.location.pathname.includes('cart.html')) {
            $('#cart-items-container').html('<tr><td colspan="6" class="text-center">Please <a href="login.html">login</a> to view your cart.</td></tr>');
            $('#checkout-btn').hide();
          }
        }
      }
    });
  }

  function updateAuthUI() {
    // Update header icons or text
    // Assuming .icon-user is the login link
    $('.icon-user').parent().attr('href', '#').on('click', function (e) {
      e.preventDefault();
      // Simple logout or profile dropdown
      if (confirm('Logged in as ' + currentUser.name + '. Logout?')) {
        logout();
      }
    });
    // Add logic to hide/show login/signup forms if on login page
    if (window.location.pathname.includes('login.html')) {
      if (currentUser.role === 'admin') {
        window.location.href = 'admin/admin.html';
      } else {
        $('.padding-large .container').html('<div class="text-center"><h2>Welcome, ' + currentUser.name + '</h2><p>You are already logged in.</p><a href="index.html" class="btn btn-black">Go Home</a> <button id="logout-btn" class="btn btn-outline-black">Logout</button></div>');
        $('#logout-btn').click(logout);
      }
    }
  }

  function logout() {
    $.ajax({
      url: API_PATH + 'auth_logout.php',
      method: 'POST',
      success: function () {
        window.location.reload();
      }
    });
  }


  // 2.a Load Homepage Sections
  function loadHomepageSections() {
    // 1. Featured Products
    if ($('#featured-products').length) {
      $.ajax({
        url: API_PATH + 'products.php?is_feature=1&limit=8',
        success: function (products) {
          const wrapper = $('#featured-products .swiper-wrapper');
          wrapper.empty();
          products.forEach(p => {
            const image = p.main_image || 'images/product-item1.jpg';
            wrapper.append(`
                        <div class="swiper-slide">
                        <div class="product-item">
                            <div class="image-holder">
                            <img src="${image}" alt="${p.name}" class="product-image" style="width:100%; height:300px; object-fit:cover;">
                            </div>
                            <div class="cart-concern">
                            <div class="cart-button d-flex justify-content-between align-items-center">
                                <button type="button" class="btn-wrap cart-link d-flex align-items-center add-to-cart-btn" 
                                        data-id="${p.product_id}" data-name="${p.name}" data-price="${p.price}" 
                                        data-image="${image}" data-color="${p.colors ? p.colors[0] : ''}" data-size="${p.sizes ? p.sizes[0] : ''}">
                                    add to cart <i class="icon icon-arrow-io"></i>
                                </button>
                                <button type="button" class="view-btn tooltip d-flex" onclick="window.location.href='single-product.html?id=${p.product_id}'">
                                <i class="icon icon-screen-full"></i><span class="tooltip-text">Quick view</span></button>
                                <button type="button" class="wishlist-btn add-to-wishlist-btn" 
                                        data-id="${p.product_id}" data-name="${p.name}" data-price="${p.price}" data-image="${image}">
                                    <i class="icon icon-heart"></i></button>
                            </div>
                            </div>
                            <div class="product-detail">
                            <h3 class="product-title"><a href="single-product.html?id=${p.product_id}">${p.name}</a></h3>
                            <span class="item-price text-primary">$${parseFloat(p.price).toFixed(2)}</span>
                            </div>
                        </div>
                        </div>
                      `);
          });

          // Initialize Swiper for Featured
          new Swiper("#featured-products .product-swiper", {
            slidesPerView: 4,
            spaceBetween: 30,
            pagination: {
              el: "#featured-products .swiper-pagination",
              clickable: true,
            },
            breakpoints: {
              0: { slidesPerView: 1 },
              576: { slidesPerView: 2 },
              992: { slidesPerView: 3 },
              1200: { slidesPerView: 4 }
            }
          });
        }
      });
    }

    // 2. Flash Sales (Sale Products)
    if ($('#flash-sales').length) {
      $.ajax({
        url: API_PATH + 'products.php?is_sale=1&limit=8', // Increased limit to fill swiper
        success: function (products) {
          const wrapper = $('#flash-sales .swiper-wrapper');
          wrapper.empty();
          products.forEach(p => {
            const image = p.main_image || 'images/selling-products9.jpg';
            wrapper.append(`
                        <div class="swiper-slide">
                          <div class="product-item">
                            <img src="${image}" alt="${p.name}" class="product-image" style="width:100%; height:300px; object-fit:cover;">
                            <div class="cart-concern">
                              <div class="cart-button d-flex justify-content-between align-items-center">
                                <button type="button" class="btn-wrap cart-link d-flex align-items-center add-to-cart-btn" 
                                        data-id="${p.product_id}" data-name="${p.name}" data-price="${p.price}" 
                                        data-image="${image}" data-color="${p.colors ? p.colors[0] : ''}" data-size="${p.sizes ? p.sizes[0] : ''}">
                                    add to cart <i class="icon icon-arrow-io"></i></button>
                                <button type="button" class="view-btn tooltip d-flex" onclick="window.location.href='single-product.html?id=${p.product_id}'"><i class="icon icon-screen-full"></i></button>
                                <button type="button" class="wishlist-btn add-to-wishlist-btn" 
                                        data-id="${p.product_id}" data-name="${p.name}" data-price="${p.price}" data-image="${image}">
                                    <i class="icon icon-heart"></i></button>
                              </div>
                            </div>
                            <div class="discount">On Sale</div>
                            <div class="product-detail">
                              <h3 class="product-title"><a href="single-product.html?id=${p.product_id}">${p.name}</a></h3>
                              <div class="item-price text-primary">$${parseFloat(p.price).toFixed(2)}</div>
                            </div>
                          </div>
                        </div>
                      `);
          });

          // Initialize Swiper for Flash Sales
          new Swiper("#flash-sales .product-swiper", {
            slidesPerView: 4,
            spaceBetween: 30,
            pagination: {
              el: "#flash-sales .swiper-pagination",
              clickable: true,
            },
            breakpoints: {
              0: { slidesPerView: 1 },
              576: { slidesPerView: 2 },
              992: { slidesPerView: 3 },
              1200: { slidesPerView: 4 }
            }
          });
        }
      });
    }
  }


  // Global Filter State
  let activeFilters = {
    brand: '',
    min_price: '',
    max_price: ''
  };

  // 2. Products & Shop
  function loadShopProducts() {
    // Only run on shop page or where product grids exist
    if (!$('#product-grid-all').length) return;

    let query = API_PATH + 'products.php?';
    if (activeFilters.brand) query += `brand=${encodeURIComponent(activeFilters.brand)}&`;
    if (activeFilters.min_price) query += `min_price=${activeFilters.min_price}&`;
    if (activeFilters.max_price) query += `max_price=${activeFilters.max_price}&`;

    $.ajax({
      url: query,
      method: 'GET',
      dataType: 'json',
      success: function (products) {
        const allContainer = $('#product-grid-all');
        allContainer.empty();

        // Clear category containers
        $('#product-grid-shoes').empty();
        $('#product-grid-tshirts').empty();
        $('#product-grid-pants').empty();
        $('#product-grid-jackets').empty();

        if (products.length === 0) {
          allContainer.html('<p style="width:100%; text-align:center; padding: 50px;">No products found.</p>');
          return;
        }

        products.forEach(p => {
          const image = p.main_image || 'images/product-item1.jpg'; // fallback
          const card = `
          <div class="product-item col-lg-4 col-md-6 col-sm-6">
                        <div class="image-holder">
                        <img src="${image}" alt="${p.name}" class="product-image" style="width:100%; height:300px; object-fit:cover;">
                        </div>
                        <div class="cart-concern">
                        <div class="cart-button d-flex justify-content-between align-items-center">
                            <button type="button" class="btn-wrap cart-link d-flex align-items-center add-to-cart-btn" 
                                    data-id="${p.product_id}" data-name="${p.name}" data-price="${p.price}" 
                                    data-image="${image}" data-color="${p.colors ? p.colors[0] : ''}" data-size="${p.sizes ? p.sizes[0] : ''}">
                                Add to Cart <i class="icon icon-arrow-io"></i>
                            </button>
                            <button type="button" class="view-btn tooltip d-flex" onclick="window.location.href='single-product.html?id=${p.product_id}'">
                            <i class="icon icon-screen-full"></i>
                            <span class="tooltip-text">Quick view</span>
                            </button>
                            <button type="button" class="wishlist-btn add-to-wishlist-btn"
                                    data-id="${p.product_id}" data-name="${p.name}" data-price="${p.price}" data-image="${image}">
                            <i class="icon icon-heart"></i>
                            </button>
                        </div>
                        </div>
                        <div class="product-detail">
                        <h3 class="product-title">
                            <a href="single-product.html?id=${p.product_id}">${p.name}</a>
                        </h3>
                        <div class="item-price text-primary">$${parseFloat(p.price).toFixed(2)}</div>
                        </div>
                    </div >
            `;

          allContainer.append(card);

          // Distribute to categories (Simple string matching)
          if (p.category_name === 'Shoes') $('#product-grid-shoes').append(card);
          else if (p.category_name === 'T-Shirts') $('#product-grid-tshirts').append(card);
          else if (p.category_name === 'Pants') $('#product-grid-pants').append(card);
          else if (p.category_name === 'Jackets') $('#product-grid-jackets').append(card);
        });
      }
    });
  }

  // 3. Cart Functions
  function addToCart(productId, quantity, color, size) {
    if (!currentUser) {
      alert("Please login to add items to cart.");
      window.location.href = 'login.html';
      return;
    }

    $.ajax({
      url: API_PATH + 'cart_actions.php',
      method: 'POST',
      contentType: 'application/json',
      data: JSON.stringify({
        action: 'add',
        product_id: productId,
        quantity: quantity,
        color: color,
        size: size
      }),
      success: function (res) {
        if (res.success) {
          alert("Item added to cart!");
        } else {
          alert("Error: " + res.message);
        }
      },
      error: function () {
        alert("Failed to add to cart.");
      }
    });
  }

  function loadCart() {
    $.ajax({
      url: API_PATH + 'cart_actions.php',
      method: 'GET',
      success: function (res) {
        const container = $('#cart-items-container');
        container.empty();
        if (res.success && res.items.length > 0) {
          res.items.forEach(item => {
            const row = `
            <tr>
                            <td><img src="${item.main_image}" width="80" height="80" style="object-fit:cover;"></td>
                            <td>
                                <h5>${item.name}</h5>
                                <small>Color: ${item.color || 'N/A'}, Size: ${item.size || 'N/A'}</small>
                            </td>
                            <td>$${parseFloat(item.price).toFixed(2)}</td>
                            <td>
                                <input type="number" min="1" value="${item.quantity}" class="form-control cart-qty-input" style="width:70px;" data-id="${item.cart_id}">
                            </td>
                            <td>$${parseFloat(item.total_price).toFixed(2)}</td>
                            <td><button class="btn btn-danger btn-sm delete-cart-item" data-id="${item.cart_id}">X</button></td>
                        </tr>
            `;
            container.append(row);
          });
          $('#cart-subtotal').text(parseFloat(res.subtotal).toFixed(2));
        } else {
          container.html('<tr><td colspan="6" class="text-center">Your cart is empty.</td></tr>');
          $('#cart-subtotal').text('0.00');
        }
      }
    });
  }

  // 4. Wishlist (LocalStorage)
  function addToWishlist(item) {
    let wishlist = JSON.parse(localStorage.getItem('ultras_wishlist')) || [];
    // Check duplicate
    if (!wishlist.find(i => i.id == item.id)) {
      wishlist.push(item);
      localStorage.setItem('ultras_wishlist', JSON.stringify(wishlist));
      alert("Added to wishlist!");
    } else {
      alert("Item already in wishlist.");
    }
  }

  function loadWishlist() {
    if (!window.location.pathname.includes('wishlist.html')) return;

    const wishlist = JSON.parse(localStorage.getItem('ultras_wishlist')) || [];
    const container = $('#wishlist-items-container');
    container.empty();

    if (wishlist.length > 0) {
      wishlist.forEach((item, index) => {
        const row = `
            <tr>
                    <td><img src="${item.image}" width="80" height="80" style="object-fit:cover;"></td>
                    <td><h5>${item.name}</h5></td>
                    <td>$${parseFloat(item.price).toFixed(2)}</td>
                    <td>
                        <button class="btn btn-sm btn-black move-to-cart" data-index="${index}" data-id="${item.id}" data-color="" data-size="">Add to Cart</button>
                        <button class="btn btn-sm btn-danger remove-wishlist" data-index="${index}">Remove</button>
                    </td>
                </tr>
            `;
        container.append(row);
      });
    } else {
      container.html('<tr><td colspan="4" class="text-center">Wishlist is empty.</td></tr>');
    }
  }

  // 5. Search
  function performSearch(query) {
    if (query.length < 2) return;
    // Use existing search popup to show results? 
    // Or just console log for now as UI requirements "result_display" implies showing it somewhere.
    // I'll replace the search form area with results or append to it.

    $.ajax({
      url: API_PATH + 'search.php?q=' + encodeURIComponent(query),
      method: 'GET',

      success: function (results) {
        let resHtml = '<ul class="search-results-list" style="list-style:none; padding:10px; background:#fff; position:absolute; width:100%; z-index:999;">';
        if (results.length > 0) {
          results.forEach(r => {
            resHtml += `<li style="border-bottom:1px solid #eee; padding:5px;"><a href="single-product.html?id=${r.product_id}">
            <img src="${r.main_image}" width="30"> ${r.name} - $${r.price}
            </a></li>`;
          });
        } else {
          resHtml += '<li>No results found</li>';
        }
        resHtml += '</ul>';

        $('.search-results-list').remove();
        $('.search-form').append(resHtml);
      }
    });
  }


  // document ready
  $(document).ready(function () {
    searchPopup();
    initPreloader();
    initTabs();
    initJarallax();
    checkLogin();
    loadShopProducts();
    loadHomepageSections();
    loadWishlist();

    // Filter Handlers
    $('.filter-brand').click(function (e) {
      e.preventDefault();
      activeFilters.brand = $(this).data('brand');
      // Visual feedback (optional)
      $('.filter-brand').removeClass('active');
      $(this).addClass('active');
      loadShopProducts();
    });

    $('.filter-price').click(function (e) {
      e.preventDefault();
      activeFilters.min_price = $(this).data('min');
      activeFilters.max_price = $(this).data('max');
      // Visual feedback (optional)
      $('.filter-price').removeClass('active');
      $(this).addClass('active');
      loadShopProducts();
    });

    jQuery(document).ready(function ($) {
      if (jQuery('.stellarnav').length) {
        jQuery('.stellarnav').stellarNav({
          position: 'right'
        });
      }
    });

    // Swiper inits (kept from original)
    if ($(".main-swiper").length) {
      var swiper = new Swiper(".main-swiper", {
        speed: 500,
        loop: true,
        navigation: { nextEl: ".button-next", prevEl: ".button-prev" },
        pagination: { el: "#billboard .swiper-pagination", clickable: true },
      });
    }

    // Event Listeners

    // Login Form
    $('#login-form').on('submit', function (e) {
      e.preventDefault();
      const email = $('#login-email').val();
      const password = $('#login-password').val();
      const remember_me = $('#login-remember').is(':checked');

      $.ajax({
        url: API_PATH + 'auth_login.php',
        method: 'POST',
        data: JSON.stringify({ email, password, remember_me }),
        contentType: 'application/json',
        success: function (res) {
          if (res.success) {
            window.location.href = res.role === 'admin' ? 'admin/admin.html' : 'index.html';
          } else {
            $('#login-message').html('<div class="alert alert-danger">' + res.message + '</div>');
          }
        }
      });
    });

    // Signup Form
    $('#signup-form').on('submit', function (e) {
      e.preventDefault();
      const data = {
        full_name: $('#signup-name').val(),
        email: $('#signup-email').val(),
        phone: $('#signup-phone').val(),
        address: $('#signup-address').val(),
        password: $('#signup-password').val()
      };
      $.ajax({
        url: API_PATH + 'auth_signup.php',
        method: 'POST',
        data: JSON.stringify(data),
        contentType: 'application/json',
        success: function (res) {
          if (res.success) {
            $('#signup-message').html('<div class="alert alert-success">' + res.message + '. Please login.</div>');
            $('#signup-form')[0].reset();
          } else {
            $('#signup-message').html('<div class="alert alert-danger">' + res.message + '</div>');
          }
        }
      });
    });

    // Add to Cart
    $(document).on('click', '.add-to-cart-btn', function (e) {
      e.preventDefault();
      const btn = $(this);
      addToCart(
        btn.data('id'),
        1, // qty
        btn.data('color'),
        btn.data('size')
      );
    });

    // Update Cart Quantity
    $(document).on('change', '.cart-qty-input', function () {
      const id = $(this).data('id');
      const qty = $(this).val();
      $.ajax({
        url: API_PATH + 'cart_actions.php',
        method: 'POST',
        contentType: 'application/json',
        data: JSON.stringify({ action: 'update', cart_id: id, quantity: qty }),
        success: function () { loadCart(); }
      });
    });

    // Delete Cart Item
    $(document).on('click', '.delete-cart-item', function () {
      const id = $(this).data('id');
      $.ajax({
        url: API_PATH + 'cart_actions.php',
        method: 'POST',
        contentType: 'application/json',
        data: JSON.stringify({ action: 'delete', cart_id: id }),
        success: function () { loadCart(); }
      });
    });

    // Checkout
    $('#checkout-btn').click(function () {
      $.ajax({
        url: API_PATH + 'checkout.php',
        method: 'POST',
        success: function (res) {
          if (res.success) {
            alert('Order placed! Order ID: ' + res.order_id);
            loadCart(); // should be empty
          } else {
            alert(res.message);
          }
        }
      });
    });

    // Add to Wishlist
    $(document).on('click', '.add-to-wishlist-btn', function (e) {
      e.preventDefault();
      const btn = $(this);
      addToWishlist({
        id: btn.data('id'),
        name: btn.data('name'),
        price: btn.data('price'),
        image: btn.data('image')
      });
    });

    // Remove Wishlist
    $(document).on('click', '.remove-wishlist', function () {
      const index = $(this).data('index');
      let wishlist = JSON.parse(localStorage.getItem('ultras_wishlist')) || [];
      wishlist.splice(index, 1);
      localStorage.setItem('ultras_wishlist', JSON.stringify(wishlist));
      loadWishlist();
    });

    // Move Wishlist to Cart
    $(document).on('click', '.move-to-cart', function () {
      const btn = $(this);
      addToCart(btn.data('id'), 1, '', ''); // default color/size
    });

    // Details for Search
    $('.search-field').on('input', function () {
      performSearch($(this).val());
    });

    // Load Single Product if on page
    loadSingleProduct();

  }); // end document.ready

  // 6. Single Product Page Logic
  function loadSingleProduct() {
    if (!$('#single-product').length) return;

    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get('id');

    if (!id) {
      $('#single-product').html('<div class="container py-5"><h3>No product specified.</h3></div>');
      return;
    }

    $.ajax({
      url: API_PATH + 'products.php?id=' + id,
      method: 'GET',
      dataType: 'json',
      success: function (product) {
        if (product.error) {
          $('#single-product').html('<div class="container py-5"><h3>Product not found.</h3></div>');
          return;
        }

        // Bind Data
        $('#sp-title').text(product.name);
        $('#sp-price').text('$' + parseFloat(product.price).toFixed(2));
        $('#sp-description').text(product.description || 'No description available.');
        $('#sp-brand').text(product.brand_name || 'N/A');
        $('#sp-category').text(product.category_name || 'N/A');

        const image = product.main_image || 'images/product-item1.jpg';
        $('#sp-main-image').attr('src', image);

        // Colors
        const colorSelect = $('#sp-color');
        if (product.colors && product.colors.length > 0) {
          product.colors.forEach(c => {
            colorSelect.append(`< option value = "${c}" > ${c}</option > `);
          });
        } else {
          colorSelect.replaceWith('<span>N/A</span>');
        }

        // Sizes
        const sizeSelect = $('#sp-size');
        if (product.sizes && product.sizes.length > 0) {
          product.sizes.forEach(s => {
            sizeSelect.append(`< option value = "${s}" > ${s}</option > `);
          });
        } else {
          sizeSelect.replaceWith('<span>N/A</span>');
        }

        // Actions
        $('#sp-add-to-cart').off('click').on('click', function () {
          const qty = $('#sp-quantity').val();
          const color = $('#sp-color').val();
          const size = $('#sp-size').val();
          addToCart(product.product_id, qty, color, size);
        });

        $('#sp-add-to-wishlist').off('click').on('click', function () {
          addToWishlist({
            id: product.product_id,
            name: product.name,
            price: product.price,
            image: image
          });
        });

        // Load Related (Category based)
        loadRelatedProducts(product.category_id);
      }
    });
  }

  function loadRelatedProducts(catId) {
    if (!$('#related-wrapper').length || !catId) return;
    $.ajax({
      url: API_PATH + 'products.php?category_id=' + catId + '&limit=4',
      success: function (products) {
        const wrapper = $('#related-wrapper');
        wrapper.empty();
        products.forEach(p => {
          const image = p.main_image || 'images/product-item1.jpg';
          wrapper.append(`
            < div class="swiper-slide" >
              <div class="product-item">
                <div class="image-holder">
                  <img src="${image}" alt="${p.name}" class="product-image" style="width:100%; height:300px; object-fit:cover;">
                </div>
                <div class="product-detail">
                  <h3 class="product-title"><a href="single-product.html?id=${p.product_id}">${p.name}</a></h3>
                  <span class="item-price text-primary">$${parseFloat(p.price).toFixed(2)}</span>
                </div>
              </div>
                        </div >
            `);
        });
        // Re-init swiper if needed, or rely on existing global init if class matches
        new Swiper("#related-products .product-swiper", {
          slidesPerView: 4,
          spaceBetween: 30,
          breakpoints: {
            0: { slidesPerView: 1 },
            576: { slidesPerView: 2 },
            992: { slidesPerView: 3 },
            1200: { slidesPerView: 4 }
          }
        });
      }
    });
  }

  // Quick View Logic (Optional Placeholder as Modal structure is needed in HTML)
  // For now, let's just create a global function that redirects or alerts,
  // since creating a dynamic modal from scratch via JS is verbose.
  // The user requirement said "Open modal OR redirect".
  // We will redirect for now, or build a simple overlay.
  window.openQuickView = function (id) {
    window.location.href = 'single-product.html?id=' + id;
  };


})(jQuery);