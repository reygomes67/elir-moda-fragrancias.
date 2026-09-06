const products = [
  { name: 'Vestido Aurora', category: 'Moda', price: 289.9, description: 'Linho leve, cintura marcada e movimento para dias luminosos.', tag: 'Mais amado', badge: 'Destaque', image: 'https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=1200&q=85' },
  { name: 'Blusa Essência', category: 'Moda', price: 135.9, compareAt: 159.9, description: 'Decote suave e corte preciso para acompanhar sua rotina.', tag: 'Novo', badge: 'Promoção', image: 'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=1200&q=85' },
  { name: 'Calça Horizonte', category: 'Moda', price: 239.9, description: 'Alfaiataria descomplicada em uma silhueta que alonga.', tag: 'Versátil', badge: 'Destaque', image: 'https://images.unsplash.com/photo-1506629905607-d9d9c8f2a7a5?auto=format&fit=crop&w=1200&q=85' },
  { name: 'Âmbar 07', category: 'Perfumaria', price: 219.9, description: 'Âmbar dourado, baunilha e madeiras em uma presença envolvente.', tag: 'Assinatura', badge: 'Destaque', image: 'https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&w=1200&q=85' },
  { name: 'Jardim Solar', category: 'Perfumaria', price: 169.9, compareAt: 189.9, description: 'Flores brancas e cítricos para deixar leveza por onde passa.', tag: 'Fresco', badge: 'Promoção', image: 'https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=1200&q=85' },
  { name: 'Noite de Cedro', category: 'Perfumaria', price: 249.9, description: 'Rosa escura, cedro e especiarias para momentos inesquecíveis.', tag: 'Intenso', badge: 'Novo', image: 'https://images.unsplash.com/photo-1619994403073-2cec844b8e63?auto=format&fit=crop&w=1200&q=85' }
];

const productGrid = document.querySelector('#product-grid');
const resultsCount = document.querySelector('#results-count');
const money = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
const cart = new Map();
const cartDrawer = document.querySelector('#cart-drawer');
const cartOverlay = document.querySelector('#cart-overlay');
const cartItems = document.querySelector('#cart-items');
const cartCount = document.querySelector('#cart-count');
const favoritesDrawer = document.querySelector('#favorites-drawer');
const favoritesOverlay = document.querySelector('#cart-overlay');
const favoritesItems = document.querySelector('#favorites-items');
const favoritesCount = document.querySelector('#favorites-count');
const cartSubtotal = document.querySelector('#cart-subtotal');
const cartDiscount = document.querySelector('#cart-discount');
const cartTotal = document.querySelector('#cart-total');
const cartCouponLabel = document.querySelector('#cart-coupon-label');
const couponInput = document.querySelector('#coupon-input');
const couponFeedback = document.querySelector('#coupon-feedback');
const sortSelect = document.querySelector('#sort-select');
let appliedCoupon = '';
let activeSort = 'default';

const coupons = { ELIR10: 0.1 };
const favorites = new Set(JSON.parse(localStorage.getItem('elir-favorites') || '[]'));

function getCheckoutTotals() {
  const subtotal = [...cart.values()].reduce((total, item) => total + item.price * item.quantity, 0);
  const discount = appliedCoupon ? subtotal * coupons[appliedCoupon] : 0;
  const shipping = 0;
  return { subtotal, discount, shipping, total: subtotal - discount + shipping };
}

function renderProducts(category = 'Todos') {
  const visibleProducts = (category === 'Todos' ? [...products] : products.filter((product) => product.category === category)).sort((firstProduct, secondProduct) => {
    if (activeSort === 'price-asc') return firstProduct.price - secondProduct.price;
    if (activeSort === 'price-desc') return secondProduct.price - firstProduct.price;
    return 0;
  });
  resultsCount.textContent = `${visibleProducts.length} ${visibleProducts.length === 1 ? 'peça selecionada' : 'peças selecionadas'}`;
  productGrid.innerHTML = visibleProducts.map((product, index) => `
    <article class="product-card" style="animation-delay: ${index * 60}ms">
      <div class="product-visual ${product.category.toLowerCase()}">
        <img class="h-full w-full object-cover transition duration-700 hover:scale-105" src="${product.image}" alt="${product.name}" loading="lazy" onerror="this.style.display='none'" />
        <span class="product-tag">${product.tag}</span>
        <span class="absolute left-3 top-3 z-10 bg-ink px-2.5 py-1 text-[10px] font-bold uppercase tracking-[.14em] text-sand">${product.badge}</span>
        <button class="absolute bottom-3 right-3 z-10 flex h-10 w-10 items-center justify-center bg-white/90 text-xl text-amber shadow-sm transition hover:scale-110" data-favorite="${product.name}" aria-label="${favorites.has(product.name) ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}: ${product.name}" aria-pressed="${favorites.has(product.name)}">${favorites.has(product.name) ? '♥' : '♡'}</button>
      </div>
      <div class="p-5"><div class="mb-3 flex items-start justify-between gap-3"><h3 class="font-display text-3xl font-semibold leading-none">${product.name}</h3><div class="text-right"><strong class="block whitespace-nowrap text-sm">${money.format(product.price)}</strong>${product.compareAt ? `<del class="text-xs text-ink/40">${money.format(product.compareAt)}</del>` : ''}</div></div><p class="text-sm leading-6 text-ink/60">${product.description}</p><button class="button-primary mt-5 flex w-full items-center justify-between px-4 py-3 text-[10px] font-bold uppercase tracking-[.13em]" data-add="${product.name}"><span>${cart.has(product.name) ? 'No carrinho ✓' : 'Adicionar ao pedido'}</span><span aria-hidden="true">${cart.has(product.name) ? '✓' : '+'}</span></button></div>
    </article>`).join('');
}

function saveFavorites() {
  localStorage.setItem('elir-favorites', JSON.stringify([...favorites]));
}

function renderFavorites() {
  const favoriteProducts = products.filter((product) => favorites.has(product.name));
  favoritesCount.textContent = favoriteProducts.length;
  favoritesItems.innerHTML = favoriteProducts.length ? favoriteProducts.map((product) => `
    <article class="mb-4 flex gap-4 border-b border-ink/10 pb-4 last:border-0">
      <img class="h-24 w-20 object-cover" src="${product.image}" alt="${product.name}" loading="lazy" />
      <div class="min-w-0 flex-1"><div class="flex items-start justify-between gap-2"><h3 class="font-display text-2xl font-semibold leading-none">${product.name}</h3><button class="text-lg text-ink/50 hover:text-ink" data-favorite-remove="${product.name}" aria-label="Remover ${product.name} dos favoritos">×</button></div><p class="mt-2 text-sm">${money.format(product.price)}</p><button class="button-outline mt-3 px-3 py-2 text-[10px] font-bold uppercase tracking-[.1em]" data-favorite-add="${product.name}">Adicionar ao carrinho</button></div>
    </article>`).join('') : '<div class="flex h-full flex-col items-center justify-center text-center"><p class="font-display text-3xl">Nenhum favorito ainda.</p><p class="mt-2 max-w-xs text-sm leading-6 text-ink/60">Toque no coração dos produtos que combinam com você.</p><button class="button-outline mt-6 px-5 py-3 text-xs font-bold uppercase tracking-[.12em]" data-favorites-continue>Explorar produtos</button></div>';
}

function renderCart() {
  const items = [...cart.values()];
  const itemCount = items.reduce((total, item) => total + item.quantity, 0);
  const totals = getCheckoutTotals();
  cartCount.textContent = itemCount;
  cartSubtotal.textContent = money.format(totals.subtotal);
  cartDiscount.textContent = totals.discount ? `- ${money.format(totals.discount)}` : '- R$ 0,00';
  cartTotal.textContent = money.format(totals.total);
  cartCouponLabel.textContent = appliedCoupon ? `(${appliedCoupon})` : '';
  cartItems.innerHTML = items.length ? items.map((item) => `
    <article class="mb-4 border-b border-ink/10 pb-4 last:border-0">
      <div class="flex items-start justify-between gap-4"><div><h3 class="font-display text-2xl font-semibold">${item.name}</h3><p class="mt-1 text-xs text-ink/55">${money.format(item.price)} cada</p></div><button class="text-lg text-ink/50 hover:text-ink" data-cart-remove="${item.name}" aria-label="Remover ${item.name}">×</button></div>
      <div class="mt-3 flex items-center justify-between"><span class="text-sm font-semibold">${money.format(item.price * item.quantity)}</span><div class="flex items-center border border-ink/20"><button class="flex h-8 w-8 items-center justify-center text-lg hover:bg-white" data-cart-decrease="${item.name}" aria-label="Diminuir quantidade de ${item.name}">−</button><span class="flex h-8 min-w-8 items-center justify-center border-x border-ink/20 text-sm">${item.quantity}</span><button class="flex h-8 w-8 items-center justify-center text-lg hover:bg-white" data-cart-increase="${item.name}" aria-label="Aumentar quantidade de ${item.name}">+</button></div></div>
    </article>`).join('') : '<div class="flex h-full flex-col items-center justify-center text-center"><p class="font-display text-3xl">Seu carrinho está vazio.</p><p class="mt-2 max-w-xs text-sm leading-6 text-ink/60">Adicione suas peças favoritas para montar seu pedido.</p><button class="button-outline mt-6 px-5 py-3 text-xs font-bold uppercase tracking-[.12em]" data-cart-continue>Continuar explorando</button></div>';
}

function toggleCart(forceOpen) {
  const shouldOpen = typeof forceOpen === 'boolean' ? forceOpen : cartDrawer.classList.contains('translate-x-full');
  if (shouldOpen) toggleFavorites(false);
  cartDrawer.classList.toggle('translate-x-full', !shouldOpen);
  cartDrawer.setAttribute('aria-hidden', String(!shouldOpen));
  document.querySelector('#cart-toggle').setAttribute('aria-expanded', String(shouldOpen));
  cartOverlay.classList.toggle('hidden', !shouldOpen);
  document.body.classList.toggle('overflow-hidden', shouldOpen);
}

function toggleFavorites(forceOpen) {
  const shouldOpen = typeof forceOpen === 'boolean' ? forceOpen : favoritesDrawer.classList.contains('translate-x-full');
  if (shouldOpen) toggleCart(false);
  favoritesDrawer.classList.toggle('translate-x-full', !shouldOpen);
  favoritesDrawer.setAttribute('aria-hidden', String(!shouldOpen));
  document.querySelector('#favorites-toggle').setAttribute('aria-expanded', String(shouldOpen));
  favoritesOverlay.classList.toggle('hidden', !shouldOpen);
  document.body.classList.toggle('overflow-hidden', shouldOpen);
}

function calculateSize() {
  const bust = Number(document.querySelector('#bust').value);
  const waist = Number(document.querySelector('#waist').value);
  const result = document.querySelector('#size-result');
  if (!bust && !waist) { result.classList.add('hidden'); return null; }
  let size = 'P';
  if (bust > 96 || waist > 80) size = 'G';
  else if (bust > 88 || waist > 70) size = 'M';
  result.classList.remove('hidden');
  result.innerHTML = `<p class="text-xs font-bold uppercase tracking-[.15em] text-amber">Seu tamanho sugerido</p><p class="mt-2 font-display text-4xl font-semibold">${size} <span class="font-sans text-sm font-normal text-ink/60">· pensado para você</span></p>`;
  return size;
}

function getChoice(name) { return document.querySelector(`input[name="${name}"]:checked`)?.value || 'Não informado'; }

function openWhatsApp() {
  const size = calculateSize() || 'Não informado';
  const selected = cart.size ? [...cart.values()].map((item) => `${item.name} (${item.quantity}x)`).join(', ') : 'Ainda vou escolher com vocês';
  const totals = getCheckoutTotals();
  const coupon = appliedCoupon || 'Nenhum';
  const message = ['Olá, ELIR! Quero montar meu pedido.', '', `Tamanho sugerido: ${size}`, `Família olfativa: ${getChoice('family')}`, `Ocasião: ${getChoice('occasion')}`, `Produtos: ${selected}`, `Cupom utilizado: ${coupon}`, `Subtotal: ${money.format(totals.subtotal)}`, `Desconto: ${money.format(totals.discount)}`, 'Envio/retirada: a combinar com a loja', `Total final: ${money.format(totals.total)}`].join('\n');
  window.open(`https://wa.me/5599999999999?text=${encodeURIComponent(message)}`, '_blank', 'noopener,noreferrer');
}

function applyCoupon() {
  const code = couponInput.value.trim().toUpperCase();
  if (!code) {
    appliedCoupon = '';
    couponFeedback.textContent = 'Digite um cupom para aplicar.';
    couponFeedback.className = 'min-h-4 text-xs text-ink/60';
  } else if (coupons[code]) {
    appliedCoupon = code;
    couponFeedback.textContent = 'Cupom aplicado: 10% de desconto.';
    couponFeedback.className = 'min-h-4 text-xs text-green-700';
  } else {
    appliedCoupon = '';
    couponFeedback.textContent = 'Cupom não encontrado. Tente ELIR10.';
    couponFeedback.className = 'min-h-4 text-xs text-red-700';
  }
  renderCart();
}

document.querySelectorAll('.filter-button').forEach((button) => button.addEventListener('click', () => {
  document.querySelectorAll('.filter-button').forEach((item) => item.classList.remove('is-active'));
  button.classList.add('is-active');
  renderProducts(button.dataset.category);
}));
sortSelect.addEventListener('change', () => {
  activeSort = sortSelect.value;
  renderProducts(document.querySelector('.filter-button.is-active').dataset.category);
});
document.querySelectorAll('.field-input').forEach((input) => input.addEventListener('input', calculateSize));
document.querySelectorAll('input[name="family"], input[name="occasion"]').forEach((input) => input.addEventListener('change', () => {
  const family = getChoice('family');
  const occasion = getChoice('occasion');
  document.querySelector('#quiz-result').innerHTML = `<strong class="text-amber-200">Nossa sugestão:</strong> ${family.toLowerCase()} para ${occasion.toLowerCase()} combina com uma presença autêntica e memorável.`;
}));
productGrid.addEventListener('click', (event) => {
  const favoriteName = event.target.dataset.favorite;
  if (favoriteName) {
    favorites.has(favoriteName) ? favorites.delete(favoriteName) : favorites.add(favoriteName);
    saveFavorites();
    renderFavorites();
    renderProducts(document.querySelector('.filter-button.is-active').dataset.category);
    return;
  }
  const productName = event.target.dataset.add;
  if (!productName) return;
  const product = products.find((item) => item.name === productName);
  const item = cart.get(productName);
  cart.set(productName, { ...product, quantity: item ? item.quantity + 1 : 1 });
  renderCart();
  renderProducts(document.querySelector('.filter-button.is-active').dataset.category);
  toggleCart(true);
});
favoritesItems.addEventListener('click', (event) => {
  const removeName = event.target.dataset.favoriteRemove;
  const addName = event.target.dataset.favoriteAdd;
  if (event.target.dataset.favoritesContinue !== undefined) { toggleFavorites(false); return; }
  if (removeName) {
    favorites.delete(removeName);
    saveFavorites();
    renderFavorites();
    renderProducts(document.querySelector('.filter-button.is-active').dataset.category);
  }
  if (addName) {
    const product = products.find((item) => item.name === addName);
    const item = cart.get(addName);
    cart.set(addName, { ...product, quantity: item ? item.quantity + 1 : 1 });
    renderCart();
    renderProducts(document.querySelector('.filter-button.is-active').dataset.category);
    toggleFavorites(false);
    toggleCart(true);
  }
});
cartItems.addEventListener('click', (event) => {
  const name = event.target.dataset.cartIncrease || event.target.dataset.cartDecrease || event.target.dataset.cartRemove;
  if (event.target.dataset.cartContinue !== undefined) { toggleCart(false); return; }
  if (!name) return;
  const item = cart.get(name);
  if (event.target.dataset.cartRemove !== undefined || (event.target.dataset.cartDecrease !== undefined && item.quantity === 1)) cart.delete(name);
  else if (event.target.dataset.cartIncrease !== undefined) cart.set(name, { ...item, quantity: item.quantity + 1 });
  else cart.set(name, { ...item, quantity: item.quantity - 1 });
  renderCart();
  renderProducts(document.querySelector('.filter-button.is-active').dataset.category);
});
document.querySelector('#cart-toggle').addEventListener('click', () => toggleCart());
document.querySelector('#cart-close').addEventListener('click', () => toggleCart(false));
document.querySelector('#favorites-toggle').addEventListener('click', () => toggleFavorites());
document.querySelector('#favorites-close').addEventListener('click', () => toggleFavorites(false));
cartOverlay.addEventListener('click', () => { toggleCart(false); toggleFavorites(false); });
document.querySelector('#cart-whatsapp').addEventListener('click', openWhatsApp);
document.querySelector('#coupon-apply').addEventListener('click', applyCoupon);
couponInput.addEventListener('keydown', (event) => { if (event.key === 'Enter') applyCoupon(); });
document.addEventListener('keydown', (event) => { if (event.key === 'Escape') { toggleCart(false); toggleFavorites(false); } });
document.querySelector('#whatsapp-button').addEventListener('click', openWhatsApp);
document.querySelector('#quiz-result').textContent = 'Escolha uma família e uma ocasião para receber uma recomendação personalizada.';
renderProducts();
renderCart();
renderFavorites();