"use strict";
// Datos de productos (Simulando el inventario)
const PRODUCTS = [
    {
        id: 1,
        name: "Levi's 501 Original Fit",
        brand: "Levi's",
        category: "Hombre",
        price: 58.00,
        sizes: ["30", "32", "34", "36"],
        image: "https://images.unsplash.com/photo-1542272604-787c3835535d?auto=format&fit=crop&w=600&q=80"
    },
    {
        id: 2,
        name: "Hollister High-Rise Jean",
        brand: "Hollister",
        category: "Mujer",
        price: 45.00,
        sizes: ["3", "5", "7", "9"],
        image: "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=600&q=80"
    },
    {
        id: 3,
        name: "American Eagle Slim Straight",
        brand: "American Eagle",
        category: "Hombre",
        price: 52.00,
        sizes: ["28", "30", "32"],
        image: "https://images.unsplash.com/photo-1582552919992-373e46713bc4?auto=format&fit=crop&w=600&q=80"
    },
    {
        id: 4,
        name: "Calvin Klein Modern Bootcut",
        brand: "Calvin Klein",
        category: "Mujer",
        price: 65.00,
        sizes: ["5", "7", "9", "11"],
        image: "https://images.unsplash.com/photo-1604176354204-9268737828e4?auto=format&fit=crop&w=600&q=80"
    }
];
class Showroom {
    gridElement;
    filterContainer;
    currentFilter = 'Todos';
    constructor() {
        this.gridElement = document.getElementById('product-grid');
        this.filterContainer = document.getElementById('filter-container');
        this.init();
    }
    init() {
        this.renderFilters();
        this.renderProducts(PRODUCTS);
    }
    renderFilters() {
        const filters = ['Todos', 'Hombre', 'Mujer', "Levi's", 'Hollister'];
        this.filterContainer.innerHTML = filters.map(f => `
            <button class="filter-btn px-6 py-2 rounded-full glass text-sm font-bold transition-all hover:bg-blue-600 ${f === 'Todos' ? 'bg-blue-600 border-none' : ''}" 
                    data-filter="${f}">
                ${f}
            </button>
        `).join('');
        this.filterContainer.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.handleFilter(e));
        });
    }
    handleFilter(e) {
        const target = e.target;
        const filter = target.dataset.filter;
        // Estética de botones
        this.filterContainer.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('bg-blue-600'));
        target.classList.add('bg-blue-600');
        const filtered = filter === 'Todos'
            ? PRODUCTS
            : PRODUCTS.filter(p => p.category === filter || p.brand === filter);
        this.renderProducts(filtered);
    }
    renderProducts(products) {
        this.gridElement.innerHTML = products.map(p => `
            <div class="product-card group relative bg-white/5 rounded-3xl overflow-hidden border border-white/5 transition-all hover:border-blue-500/50">
                <div class="h-80 overflow-hidden relative">
                    <img src="${p.image}" alt="${p.name}" class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110">
                    <div class="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-6">
                        <button onclick="showroom.contactWhatsApp('${p.name}', '${p.brand}')" class="btn-buy w-full bg-green-500 text-white py-3 rounded-xl font-bold translate-y-4 transition-all duration-300 opacity-0 flex items-center justify-center gap-2">
                            <span>Consultar WhatsApp</span>
                        </button>
                    </div>
                    <span class="absolute top-4 left-4 bg-black/60 backdrop-blur-md text-[10px] px-3 py-1 rounded-full font-black uppercase tracking-tighter">New Arrival</span>
                </div>
                <div class="p-6">
                    <p class="text-blue-400 text-xs font-bold mb-1 uppercase tracking-widest">${p.brand}</p>
                    <h3 class="text-lg font-bold text-white mb-2">${p.name}</h3>
                    <div class="flex justify-between items-center">
                        <span class="text-2xl font-black text-white">$${p.price.toFixed(2)}</span>
                        <div class="flex gap-1">
                            ${p.sizes.slice(0, 2).map(s => `<span class="text-[10px] border border-white/20 px-2 py-1 rounded">${s}</span>`).join('')}
                            <span class="text-[10px] border border-white/20 px-2 py-1 rounded">+</span>
                        </div>
                    </div>
                </div>
            </div>
        `).join('');
    }
    contactWhatsApp(name, brand) {
        const phone = "593900000000"; // Número del local en Cuenca
        const text = encodeURIComponent(`¡Hola American Jeans Cuenca! 👋 Vi en su web el modelo ${name} de la marca ${brand}. ¿Tienen stock disponible para visitarlos hoy?`);
        window.open(`https://wa.me/${phone}?text=${text}`, '_blank');
    }
}
// Inicializar
const showroom = new Showroom();
