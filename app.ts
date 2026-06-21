// Definición de tipo para los productos del catálogo
interface Product {
    id: number;
    name: string;
    brand: string;
    category: 'Pantalones' | 'Camisas' | 'Jackets' | 'Zapatos' | 'Accesorios' | 'Otros';
    gender: 'Hombre' | 'Mujer' | 'Unisex';
    price: number;
    sizes: string[];
    image: string;
    isNew?: boolean;
}

class Showroom {
    private products: Product[] = [];
    private currentCategory: string = 'Todos';
    private currentGender: string = 'Todos';
    private adminPasswordVal: string = 'american123'; // Contraseña por defecto

    // Elementos del Catálogo
    private gridElement!: HTMLElement;
    private genderFilterContainer!: HTMLElement;
    private categoryFilterContainer!: HTMLElement;

    // Elementos de Administración
    private adminAccessBtn!: HTMLButtonElement;
    private adminAuthDialog!: HTMLDialogElement;
    private adminAuthForm!: HTMLFormElement;
    private adminPasswordInput!: HTMLInputElement;
    private authErrorMsg!: HTMLElement;
    private closeAuthBtn!: HTMLButtonElement;

    private adminPanelDialog!: HTMLDialogElement;
    private closeAdminPanelBtn!: HTMLButtonElement;
    private downloadJsonBtn!: HTMLButtonElement;
    private resetCatalogBtn!: HTMLButtonElement;

    private productForm!: HTMLFormElement;
    private formTitle!: HTMLElement;
    private productIdInput!: HTMLInputElement;
    private formNameInput!: HTMLInputElement;
    private formBrandInput!: HTMLInputElement;
    private formPriceInput!: HTMLInputElement;
    private formCategorySelect!: HTMLSelectElement;
    private formGenderSelect!: HTMLSelectElement;
    private formSizesInput!: HTMLInputElement;
    private formImageInput!: HTMLInputElement;
    private formIsNewCheckbox!: HTMLInputElement;
    private cancelEditBtn!: HTMLButtonElement;

    private adminProductsTableBody!: HTMLElement;

    constructor() {
        this.getDomElements();
        this.setupAdminListeners();
        this.loadCatalog();
    }

    private getDomElements(): void {
        this.gridElement = document.getElementById('product-grid')!;
        this.genderFilterContainer = document.getElementById('gender-filter-container')!;
        this.categoryFilterContainer = document.getElementById('category-filter-container')!;

        // Auth Dialog Elements
        this.adminAccessBtn = document.getElementById('admin-access-btn') as HTMLButtonElement;
        this.adminAuthDialog = document.getElementById('admin-auth-dialog') as HTMLDialogElement;
        this.adminAuthForm = document.getElementById('admin-auth-form') as HTMLFormElement;
        this.adminPasswordInput = document.getElementById('admin-password') as HTMLInputElement;
        this.authErrorMsg = document.getElementById('auth-error-msg')!;
        this.closeAuthBtn = document.getElementById('close-auth-btn') as HTMLButtonElement;

        // Panel Dialog Elements
        this.adminPanelDialog = document.getElementById('admin-panel-dialog') as HTMLDialogElement;
        this.closeAdminPanelBtn = document.getElementById('close-admin-panel-btn') as HTMLButtonElement;
        this.downloadJsonBtn = document.getElementById('download-json-btn') as HTMLButtonElement;
        this.resetCatalogBtn = document.getElementById('reset-catalog-btn') as HTMLButtonElement;

        // Form Elements
        this.productForm = document.getElementById('product-form') as HTMLFormElement;
        this.formTitle = document.getElementById('form-title')!;
        this.productIdInput = document.getElementById('product-id') as HTMLInputElement;
        this.formNameInput = document.getElementById('form-name') as HTMLInputElement;
        this.formBrandInput = document.getElementById('form-brand') as HTMLInputElement;
        this.formPriceInput = document.getElementById('form-price') as HTMLInputElement;
        this.formCategorySelect = document.getElementById('form-category') as HTMLSelectElement;
        this.formGenderSelect = document.getElementById('form-gender') as HTMLSelectElement;
        this.formSizesInput = document.getElementById('form-sizes') as HTMLInputElement;
        this.formImageInput = document.getElementById('form-image') as HTMLInputElement;
        this.formIsNewCheckbox = document.getElementById('form-is-new') as HTMLInputElement;
        this.cancelEditBtn = document.getElementById('cancel-edit-btn') as HTMLButtonElement;

        // Table List
        this.adminProductsTableBody = document.getElementById('admin-products-table-body')!;
    }

    private setupAdminListeners(): void {
        // Abrir y cerrar login
        this.adminAccessBtn?.addEventListener('click', () => {
            this.adminPasswordInput.value = '';
            this.authErrorMsg.classList.add('hidden');
            this.adminAuthDialog.showModal();
        });

        this.closeAuthBtn?.addEventListener('click', () => {
            this.adminAuthDialog.close();
        });

        // Intentar iniciar sesión
        this.adminAuthForm?.addEventListener('submit', (e) => {
            e.preventDefault();
            if (this.adminPasswordInput.value === this.adminPasswordVal) {
                this.adminAuthDialog.close();
                this.showAdminPanel();
            } else {
                this.authErrorMsg.classList.remove('hidden');
            }
        });

        // Cerrar panel de administración
        this.closeAdminPanelBtn?.addEventListener('click', () => {
            this.adminPanelDialog.close();
        });

        // Guardar/actualizar producto
        this.productForm?.addEventListener('submit', (e) => this.saveProduct(e));

        // Cancelar edición
        this.cancelEditBtn?.addEventListener('click', () => this.resetForm());

        // Descargar JSON de productos
        this.downloadJsonBtn?.addEventListener('click', () => this.downloadJson());

        // Restaurar catálogo desde el servidor (products.json)
        this.resetCatalogBtn?.addEventListener('click', () => {
            if (confirm('¿Estás seguro de que deseas eliminar tus cambios locales y restaurar el catálogo original del servidor?')) {
                localStorage.removeItem('american_jeans_catalog');
                this.loadCatalog();
            }
        });
    }

    private async loadCatalog(): Promise<void> {
        try {
            const localData = localStorage.getItem('american_jeans_catalog');
            if (localData) {
                this.products = JSON.parse(localData);
            } else {
                const response = await fetch('products.json');
                if (response.ok) {
                    this.products = await response.json();
                    localStorage.setItem('american_jeans_catalog', JSON.stringify(this.products));
                } else {
                    console.error('No se pudo cargar el archivo products.json del servidor.');
                }
            }
        } catch (error) {
            console.error('Error cargando el catálogo de productos:', error);
        } finally {
            this.initUI();
        }
    }

    private initUI(): void {
        this.renderFilters();
        this.filterProducts();
        if (this.adminPanelDialog.open) {
            this.renderAdminProducts();
        }
    }

    private renderFilters(): void {
        const genders = ['Todos', 'Hombre', 'Mujer'];
        const categories = ['Todos', 'Pantalones', 'Camisas', 'Jackets', 'Zapatos', 'Accesorios', 'Otros'];

        // Renderizar Filtros de Género
        this.genderFilterContainer.innerHTML = genders.map(g => `
            <button
                class="gender-btn px-4 py-1.5 rounded-full text-xs font-bold transition-all border ${g === this.currentGender ? 'bg-blue-600 border-blue-600 text-white' : 'glass border-white/10 text-slate-300 hover:text-white hover:border-white/20'}"
                data-gender="${g}">
                ${g}
            </button>
        `).join('');

        this.genderFilterContainer.querySelectorAll('.gender-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const target = e.currentTarget as HTMLButtonElement;
                this.currentGender = target.dataset.gender!;
                this.initUI();
            });
        });

        // Renderizar Filtros de Categorías
        this.categoryFilterContainer.innerHTML = categories.map(c => `
            <button
                class="category-btn px-4 py-2 rounded-full text-xs md:text-sm font-bold transition-all border ${c === this.currentCategory ? 'bg-blue-600 border-blue-600 text-white' : 'glass border-white/10 text-slate-300 hover:text-white hover:border-white/20'}"
                data-category="${c}">
                ${c}
            </button>
        `).join('');

        this.categoryFilterContainer.querySelectorAll('.category-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const target = e.currentTarget as HTMLButtonElement;
                this.currentCategory = target.dataset.category!;
                this.initUI();
            });
        });
    }

    private filterProducts(): void {
        const filtered = this.products.filter(p => {
            const matchGender = this.currentGender === 'Todos' || p.gender === this.currentGender || p.gender === 'Unisex';
            const matchCategory = this.currentCategory === 'Todos' || p.category === this.currentCategory;
            return matchGender && matchCategory;
        });

        this.renderProducts(filtered);
    }

    private renderProducts(products: Product[]): void {
        if (products.length === 0) {
            this.gridElement.innerHTML = `
                <div class="col-span-full text-center py-20 text-slate-500">
                    <p class="text-4xl mb-3">😕</p>
                    <p class="font-semibold text-lg text-slate-400">Sin productos para estos filtros.</p>
                    <p class="text-xs text-slate-500 mt-1">Prueba combinando otro género y categoría.</p>
                </div>`;
            return;
        }

        this.gridElement.innerHTML = products.map(p => `
            <div class="product-card group relative bg-white/5 rounded-3xl overflow-hidden border border-white/5 transition-all duration-300 hover:border-blue-500/50 hover:shadow-xl hover:shadow-blue-900/20 animate__animated animate__fadeIn">
                <div class="h-80 overflow-hidden relative">
                    <img
                        src="${p.image}"
                        alt="${p.name}"
                        loading="lazy"
                        class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110">
                    <div class="absolute inset-0 bg-gradient-to-t from-black/90 to-transparent lg:opacity-0 lg:group-hover:opacity-100 transition-opacity flex items-end p-4 md:p-6">
                        <button
                            onclick="window.showroom.contactWhatsApp('${p.name}', '${p.brand}')"
                            class="btn-buy w-full bg-green-500 text-white py-3 rounded-xl font-bold lg:translate-y-4 lg:group-hover:translate-y-0 transition-all duration-300 flex items-center justify-center gap-2 active:scale-95 shadow-[0_0_15px_rgba(34,197,94,0.4)]">
                            <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/></svg>
                            <span>Consultar por WhatsApp</span>
                        </button>
                    </div>
                    ${p.isNew ? '<span class="absolute top-4 left-4 bg-blue-600/80 backdrop-blur-md text-[10px] px-3 py-1 rounded-full font-black uppercase tracking-tighter">New Arrival</span>' : ''}
                </div>
                <div class="p-6">
                    <p class="text-blue-400 text-xs font-bold mb-1 uppercase tracking-widest">${p.brand} • ${p.category} (${p.gender})</p>
                    <h3 class="text-lg font-bold text-white mb-3">${p.name}</h3>
                    <div class="flex justify-between items-center">
                        <span class="text-2xl font-black text-white">$${p.price.toFixed(2)}</span>
                        <div class="flex gap-1 flex-wrap justify-end max-w-[120px]">
                            ${p.sizes.slice(0, 2).map(s => `<span class="text-[10px] border border-white/20 px-2 py-1 rounded">${s}</span>`).join('')}
                            ${p.sizes.length > 2 ? `<span class="text-[10px] border border-white/20 px-2 py-1 rounded">+${p.sizes.length - 2}</span>` : ''}
                        </div>
                    </div>
                </div>
            </div>
        `).join('');
    }

    private showAdminPanel(): void {
        this.resetForm();
        this.renderAdminProducts();
        this.adminPanelDialog.showModal();
    }

    private renderAdminProducts(): void {
        if (this.products.length === 0) {
            this.adminProductsTableBody.innerHTML = `
                <tr>
                    <td colspan="4" class="p-8 text-center text-slate-500">No hay productos en el catálogo.</td>
                </tr>`;
            return;
        }

        this.adminProductsTableBody.innerHTML = this.products.map(p => `
            <tr class="border-b border-white/5 hover:bg-white/[0.02] text-xs transition">
                <td class="p-3">
                    <img src="${p.image}" alt="${p.name}" class="w-12 h-12 object-cover rounded-xl border border-white/10">
                </td>
                <td class="p-3">
                    <div class="font-bold text-white">${p.name}</div>
                    <div class="text-[10px] text-slate-400 mt-0.5">${p.brand} • ${p.category} • ${p.gender}</div>
                    <div class="text-[9px] text-slate-500">Tallas: ${p.sizes.join(', ')}</div>
                </td>
                <td class="p-3 text-right font-semibold text-white">
                    $${p.price.toFixed(2)}
                </td>
                <td class="p-3">
                    <div class="flex justify-center gap-2">
                        <button onclick="window.showroom.editProduct(${p.id})" class="bg-blue-600/20 hover:bg-blue-600/40 text-blue-400 border border-blue-500/20 px-2.5 py-1 rounded-lg font-bold transition">
                            Editar
                        </button>
                        <button onclick="window.showroom.deleteProduct(${p.id})" class="bg-red-600/20 hover:bg-red-600/40 text-red-400 border border-red-500/20 px-2.5 py-1 rounded-lg font-bold transition">
                            Borrar
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
    }

    private saveProduct(e: Event): void {
        e.preventDefault();

        const idStr = this.productIdInput.value;
        const name = this.formNameInput.value.trim();
        const brand = this.formBrandInput.value.trim();
        const price = parseFloat(this.formPriceInput.value);
        const category = this.formCategorySelect.value as any;
        const gender = this.formGenderSelect.value as any;
        const sizes = this.formSizesInput.value.split(',').map(s => s.trim()).filter(s => s.length > 0);
        const image = this.formImageInput.value.trim();
        const isNew = this.formIsNewCheckbox.checked;

        if (idStr === '') {
            // Generar nuevo ID único
            const newId = this.products.reduce((max, p) => p.id > max ? p.id : max, 0) + 1;
            const newProduct: Product = { id: newId, name, brand, price, category, gender, sizes, image, isNew };
            this.products.push(newProduct);
        } else {
            // Actualizar producto existente
            const id = parseInt(idStr);
            const index = this.products.findIndex(p => p.id === id);
            if (index !== -1) {
                this.products[index] = { id, name, brand, price, category, gender, sizes, image, isNew };
            }
        }

        // Guardar cambios localmente
        localStorage.setItem('american_jeans_catalog', JSON.stringify(this.products));
        this.initUI();
        this.resetForm();
    }

    public editProduct(id: number): void {
        const product = this.products.find(p => p.id === id);
        if (!product) return;

        this.formTitle.textContent = 'Editar Producto';
        this.productIdInput.value = product.id.toString();
        this.formNameInput.value = product.name;
        this.formBrandInput.value = product.brand;
        this.formPriceInput.value = product.price.toFixed(2);
        this.formCategorySelect.value = product.category;
        this.formGenderSelect.value = product.gender;
        this.formSizesInput.value = product.sizes.join(', ');
        this.formImageInput.value = product.image;
        this.formIsNewCheckbox.checked = !!product.isNew;

        this.cancelEditBtn.classList.remove('hidden');
    }

    public deleteProduct(id: number): void {
        if (!confirm('¿Estás seguro de que deseas eliminar este producto del catálogo?')) return;

        this.products = this.products.filter(p => p.id !== id);
        localStorage.setItem('american_jeans_catalog', JSON.stringify(this.products));
        this.initUI();
        this.resetForm();
    }

    private resetForm(): void {
        this.productForm.reset();
        this.productIdInput.value = '';
        this.formTitle.textContent = 'Añadir Nuevo Producto';
        this.cancelEditBtn.classList.add('hidden');
    }

    private downloadJson(): void {
        const dataStr = JSON.stringify(this.products, null, 2);
        const blob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);

        const link = document.createElement('a');
        link.href = url;
        link.download = 'products.json';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }

    public contactWhatsApp(name: string, brand: string): void {
        // Reemplaza con el número real en formato internacional
        const phone = "593984186548"; // Número de Cuenca/Ecuador
        const text = encodeURIComponent(`¡Hola American Jeans! 👋 Vi en su web el modelo *${name}* de *${brand}*. ¿Tienen stock disponible? ¿Cuáles tallas hay?`);
        window.open(`https://wa.me/${phone}?text=${text}`, '_blank');
    }
}

// Inicializar y exponer para el onclick inline
const showroom = new Showroom();
(window as any).showroom = showroom;