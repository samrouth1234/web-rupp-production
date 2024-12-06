function initializeTabs(tabListId, contentId) {
	document.querySelectorAll(`#${tabListId} [role='tab']`).forEach((tab) => {
		tab.addEventListener('click', function () {
			// Remove active class from all tabs
			document.querySelectorAll(`#${tabListId} [role='tab']`).forEach((t) => t.classList.remove('active-tab'));

			// Add active class to current tab
			this.classList.add('active-tab');

			// Hide all tab panels
			document.querySelectorAll(`#${contentId} [role='tabpanel']`).forEach((content) => content.classList.add('hidden'));

			// Show target panel
			const target = this.getAttribute('data-tabs-target');
			document.querySelector(target).classList.remove('hidden');

			// Store active tab in local storage
			localStorage.setItem(`${tabListId}-activeTab`, target);
		});
	});

	// Restore active tab on page load
	window.addEventListener('DOMContentLoaded', function () {
		const activeTab = localStorage.getItem(`${tabListId}-activeTab`);
		if (activeTab) {
			const activeButton = document.querySelector(`[data-tabs-target="${activeTab}"]`);
			if (activeButton) {
				activeButton.click();
			}
		}
	});
}

// Initialize both sets of tabs
initializeTabs('default-tab', 'default-tab-content');
initializeTabs('featured-tab', 'featured-tab-content');

$(document).ready(function () {
	let cart = {}; // Object to store cart items

	// Add item to the cart
	$('.add-to-cart').on('click', function () {
		const productId = $(this).data('id');
		const productTitle = $(this).data('title');
		const productPrice = $(this).data('price');
		const productImage = $(this).data('image');

		// Check if the product already exists in the cart
		if (cart[productId]) {
			cart[productId].quantity += 1; // Increment quantity
		} else {
			cart[productId] = {
				id: productId,
				title: productTitle,
				price: productPrice,
				image: productImage,
				quantity: 1
			};
		}

		updateCartUI();
	});

	// Update the cart UI
	function updateCartUI() {
		const cartItemsContainer = $('.cart-items');
		const cartCount = $('.cart-count');
		cartItemsContainer.empty(); // Clear the cart items container
		let totalItems = 0;

		$.each(cart, function (key, item) {
			totalItems += item.quantity;

			// Add item to the cart dropdown
			cartItemsContainer.append(`
							<div class="cart-item">
									<img src="${item.image}" alt="${item.title}" />
									<div>
											<p>${item.title}</p>
											<p>x${item.quantity}</p>
									</div>
									<button class="remove-from-cart" data-id="${item.id}">
											<i class="bi bi-trash"></i>
									</button>
							</div>
					`);
		});

		// Update cart count
		cartCount.text(totalItems).show();

		// Show or hide the cart dropdown based on items
		if (totalItems > 0) {
			$('.cart-dropdown').show();
		} else {
			$('.cart-dropdown').hide();
		}
	}

	// Remove item from the cart
	$(document).on('click', '.remove-from-cart', function () {
		const productId = $(this).data('id');

		// Remove the item or decrease quantity
		if (cart[productId].quantity > 1) {
			cart[productId].quantity -= 1;
		} else {
			delete cart[productId];
		}

		updateCartUI();
	});

	// Toggle cart dropdown visibility
	$('.cart-icon').on('click', function (e) {
		e.preventDefault();
		$('.cart-dropdown').toggle();
	});
});

// fetch product
$(document).ready(function () {
	// Fetch JSON data
	$.getJSON('/lib/data.json', function (data) {
		let allProducts = data;

		// Function to render products
		function renderProducts(products, limit = 8) {
			const productContainer = $('#product-container');
			productContainer.empty(); // Clear existing products

			// Ensure we only display up to the specified limit
			const displayedProducts = products.slice(0, limit);

			displayedProducts.forEach((product) => {
				const productCard = `
					<div class="card-featured-product bg-white border border-gray-200 rounded-lg shadow relative">
						<div>
							<div class="image-container">
								<img class="pb-4 image-card w-full md:h-44 object-contain" src="${product.image}" alt="${product.title}" />
								<div class="icon-overlay">
									<p class="background-heart-icon"><i class="bi bi-heart text-xl"></i></p>
									<button 
										data-id="${product.id}"
										data-title="${product.title}"
										data-price="${product.price}"
										data-image="${product.image}"
										class="add-to-cart background-cart-icon">
										<i class="bi bi-cart-plus text-xl"></i>
									</button>
								</div>
							</div>
						</div>
						<div>
							<div class="flex items-center mt-2">
								<div class="flex items-center space-x-1 rtl:space-x-reverse">
									${renderStars(product.rating)}
								</div>
								<span class="text-xs font-normal px-1 py-0.5 rounded ms-1">(${product.reviews})</span>
							</div>
							<p class="description-card-featured hover:underline">${product.description}</p>
							<p class="price-card mt-2">$ ${product.price}</p>
						</div>
					</div>
				`;
				productContainer.append(productCard);
			});
		}

		// Helper function to render stars
		function renderStars(rating) {
			let stars = '';
			for (let i = 1; i <= 5; i++) {
				stars += `<i class="bi ${i <= rating ? 'bi-star-fill text-yellow-500' : 'bi-star text-gray-300'}"></i>`;
			}
			return stars;
		}

		// Initial render of first 8 products
		renderProducts(allProducts);

		// Filter products based on category
		$('.filter-btn').on('click', function () {
			const category = $(this).data('category');
			let filteredProducts;
			if (category === 'All') {
				filteredProducts = allProducts;
			} else {
				filteredProducts = allProducts.filter((product) => product.category === category);
			}
			renderProducts(filteredProducts, 8); // Always limit to 8 products
		});
	});
});

