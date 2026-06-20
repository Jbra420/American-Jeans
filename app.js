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
        name: "American Eagle Slim",
        brand: "American Eagle",
        category: "Hombre",
        price: 52.00,
        sizes: ["28", "30", "32"],
        image: "https://images.unsplash.com/photo-1582552919992-373e46713bc4?auto=format&fit=crop&w=600&q=80"
    },
    {
        id: 4,
        name: "Calvin Klein Bootcut",
        brand: "Calvin Klein",
        category: "Mujer",
        price: 65.00,
        sizes: ["5", "7", "9", "11"],
        image: "https://images.unsplash.com/photo-1604176354204-9268737828e4?auto=format&fit=crop&w=600&q=80"
    },
    {
        id: 5,
        name: "Vans Old Skool Classic",
        brand: "Vans",
        category: "Hombre",
        price: 75.00,
        sizes: ["8", "9", "10", "11"],
        image: "https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?auto=format&fit=crop&w=600&q=80"
    },
    {
        id: 6,
        name: "Skechers D'Lites",
        brand: "Skechers",
        category: "Mujer",
        price: 85.00,
        sizes: ["6", "7", "8"],
        image: "https://images.unsplash.com/photo-1560769629-975ec94e6a86?auto=format&fit=crop&w=600&q=80"
    },
    {
        id: 7,
        name: "New Balance 574 Core",
        brand: "New Balance",
        category: "Hombre",
        price: 90.00,
        sizes: ["9", "10", "11", "12"],
        image: "https://images.unsplash.com/photo-1532298229144-0ec0c57515c7?auto=format&fit=crop&w=600&q=80"
    },
    {
        id: 8,
        name: "Levi's Trucker Jacket",
        brand: "Levi's",
        category: "Mujer",
        price: 110.00,
        sizes: ["S", "M", "L"],
        image: "https://images.unsplash.com/photo-1576871337632-b9aef4c17ab9?auto=format&fit=crop&w=600&q=80"
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
        const filters = ['Todos', 'Hombre', 'Mujer', "Levi's", 'Vans', 'New Balance'];
        this.filterContainer.innerHTML = filters.map(f => `
            <button class="filter-btn px-4 py-2 md:px-6 md:py-2 rounded-full glass text-xs md:text-sm font-bold transition-all hover:bg-blue-600 ${f === 'Todos' ? 'bg-blue-600 border-none' : ''}" 
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
            <div class="product-card group relative bg-white/5 rounded-3xl overflow-hidden border border-white/5 transition-all hover:border-blue-500/50 animate__animated animate__fadeIn">
                <div class="h-80 overflow-hidden relative">
                    <img src="${p.image}" alt="${p.name}" class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110">
                    <div class="absolute inset-0 bg-gradient-to-t from-black/90 to-transparent lg:opacity-0 lg:group-hover:opacity-100 transition-opacity flex items-end p-4 md:p-6">
                        <button onclick="showroom.contactWhatsApp('${p.name}', '${p.brand}')" class="btn-buy w-full bg-green-500 text-white py-3 rounded-xl font-bold lg:translate-y-4 lg:group-hover:translate-y-0 transition-all duration-300 flex items-center justify-center gap-2 active:scale-95 shadow-[0_0_15px_rgba(34,197,94,0.4)]">
                            <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/></svg>
                            <span>WhatsApp</span>
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
