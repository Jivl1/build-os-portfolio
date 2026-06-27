const navbar = document.querySelector("[data-navbar]");
const menuToggle = document.querySelector("[data-menu-toggle]");
const mobileMenu = document.querySelector("[data-mobile-menu]");
const cartOpen = document.querySelector("[data-cart-open]");
const cartClose = document.querySelector("[data-cart-close]");
const cartSidebar = document.querySelector("[data-cart-sidebar]");
const cartOverlay = document.querySelector("[data-cart-overlay]");
const cartItems = document.querySelector("[data-cart-items]");
const cartCount = document.querySelector("[data-cart-count]");
const cartTotal = document.querySelector("[data-cart-total]");
const addCartButtons = [...document.querySelectorAll("[data-add-cart]")];
const revealItems = [...document.querySelectorAll(".reveal")];
const counters = [...document.querySelectorAll("[data-counter]")];
const faqItems = [...document.querySelectorAll(".faq-item")];
let cart = [];

const setNavbarState = () => {
  navbar.classList.toggle("scrolled", window.scrollY > 10);
};

const closeMenu = () => {
  mobileMenu.classList.remove("open");
  menuToggle.classList.remove("open");
  menuToggle.setAttribute("aria-expanded", "false");
};

menuToggle.addEventListener("click", () => {
  const isOpen = mobileMenu.classList.toggle("open");
  menuToggle.classList.toggle("open", isOpen);
  menuToggle.setAttribute("aria-expanded", String(isOpen));
});

mobileMenu.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", closeMenu);
});

window.addEventListener("scroll", setNavbarState);

if ("IntersectionObserver" in window) {
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("visible");
        revealObserver.unobserve(entry.target);
      });
    },
    { threshold: 0.15 }
  );

  revealItems.forEach((item) => revealObserver.observe(item));
} else {
  revealItems.forEach((item) => item.classList.add("visible"));
}

const animateCounter = (el, target, duration, suffix) => {
  let start = 0;
  const decimals = String(target).includes(".") ? 1 : 0;
  const step = (timestamp) => {
    if (!start) start = timestamp;
    const progress = Math.min((timestamp - start) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    const value = target * eased;
    if (progress >= 1) {
      el.textContent = `${decimals ? target.toFixed(decimals) : target}${suffix}`;
      return;
    }
    el.textContent = `${decimals ? value.toFixed(decimals) : Math.floor(value)}${suffix}`;
    requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
};

if ("IntersectionObserver" in window) {
  const counterObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting || entry.target.dataset.done) return;
        entry.target.dataset.done = "true";
        animateCounter(
          entry.target,
          Number(entry.target.dataset.target),
          1500,
          entry.target.dataset.suffix || ""
        );
        counterObserver.unobserve(entry.target);
      });
    },
    { threshold: 0.6 }
  );

  counters.forEach((counter) => counterObserver.observe(counter));
}

faqItems.forEach((item) => {
  const button = item.querySelector("button");
  button.addEventListener("click", () => {
    const shouldOpen = !item.classList.contains("open");
    faqItems.forEach((other) => other.classList.remove("open"));
    item.classList.toggle("open", shouldOpen);
  });
});

const openCart = () => {
  closeMenu();
  cartSidebar.classList.add("open");
  cartOverlay.classList.add("open");
};

const closeCart = () => {
  cartSidebar.classList.remove("open");
  cartOverlay.classList.remove("open");
};

const money = (value) => `$${value.toFixed(2)}`;

const renderCart = () => {
  const itemCount = cart.reduce((sum, item) => sum + item.qty, 0);
  const total = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  cartCount.textContent = itemCount;
  cartTotal.textContent = money(total);

  if (!cart.length) {
    cartItems.innerHTML = '<p class="empty-cart">Your cart is empty.</p>';
    return;
  }

  cartItems.innerHTML = cart
    .map(
      (item) => `
        <article class="cart-item">
          <div class="cart-thumb"></div>
          <div>
            <h3>${item.name}</h3>
            <p>${item.variant}</p>
            <div class="qty-controls">
              <button type="button" data-qty="minus" data-id="${item.id}">-</button>
              <span>${item.qty}</span>
              <button type="button" data-qty="plus" data-id="${item.id}">+</button>
            </div>
          </div>
          <span class="cart-price">${money(item.price * item.qty)}</span>
        </article>
      `
    )
    .join("");
};

addCartButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const id = `${button.dataset.name}-${button.dataset.variant}`;
    const existing = cart.find((item) => item.id === id);
    if (existing) {
      existing.qty += 1;
    } else {
      cart.push({
        id,
        name: button.dataset.name,
        variant: button.dataset.variant,
        price: Number(button.dataset.price),
        qty: 1,
      });
    }
    renderCart();
    openCart();
  });
});

cartItems.addEventListener("click", (event) => {
  const button = event.target.closest("[data-qty]");
  if (!button) return;

  const item = cart.find((entry) => entry.id === button.dataset.id);
  if (!item) return;

  if (button.dataset.qty === "plus") item.qty += 1;
  if (button.dataset.qty === "minus") item.qty -= 1;
  cart = cart.filter((entry) => entry.qty > 0);
  renderCart();
});

cartOpen.addEventListener("click", openCart);
cartClose.addEventListener("click", closeCart);
cartOverlay.addEventListener("click", closeCart);

document.querySelector(".newsletter").addEventListener("submit", (event) => {
  event.preventDefault();
  event.currentTarget.reset();
});

setNavbarState();
renderCart();
