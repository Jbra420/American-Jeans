"use strict";
class Showroom {
    constructor() {
        this.products = [];
        this.currentCategory = 'Todos';
        this.currentGender = 'Todos';
        this.currentStatus = 'Todos';
        this.adminPasswordVal = 'american123'; // Contraseña por defecto
        this.isDbOnline = false; // Indica si Firebase está conectado
        this.db = null; // Instancia de Firestore
        this.getDomElements();
        this.setupAdminListeners();
        this.loadCatalog();
    }
    getDomElements() {
        this.gridElement = document.getElementById('product-grid');
        this.genderFilterContainer = document.getElementById('gender-filter-container');
        this.statusFilterContainer = document.getElementById('status-filter-container');
        this.categoryFilterContainer = document.getElementById('category-filter-container');
        this.catalogSearchInput = document.getElementById('catalog-search');
        this.productCountBadge = document.getElementById('product-count-badge');
        // Auth Dialog Elements
        this.adminAccessBtn = document.getElementById('admin-access-btn');
        this.adminAuthDialog = document.getElementById('admin-auth-dialog');
        this.adminAuthForm = document.getElementById('admin-auth-form');
        this.adminPasswordInput = document.getElementById('admin-password');
        this.authErrorMsg = document.getElementById('auth-error-msg');
        this.closeAuthBtn = document.getElementById('close-auth-btn');
        // Panel Dialog Elements
        this.adminPanelDialog = document.getElementById('admin-panel-dialog');
        this.closeAdminPanelBtn = document.getElementById('close-admin-panel-btn');
        this.downloadJsonBtn = document.getElementById('download-json-btn');
        this.resetCatalogBtn = document.getElementById('reset-catalog-btn');
        this.dbStatusIndicator = document.getElementById('db-status-indicator');
        // Form Elements
        this.productForm = document.getElementById('product-form');
        this.formTitle = document.getElementById('form-title');
        this.productIdInput = document.getElementById('product-id');
        this.formNameInput = document.getElementById('form-name');
        this.formBrandInput = document.getElementById('form-brand');
        this.formPriceInput = document.getElementById('form-price');
        this.formCategorySelect = document.getElementById('form-category');
        this.formGenderSelect = document.getElementById('form-gender');
        this.formSizesInput = document.getElementById('form-sizes');
        this.formImageFileInput = document.getElementById('form-image-file');
        this.formImageBase64Input = document.getElementById('form-image-base64');
        this.imagePreview = document.getElementById('image-preview');
        this.imagePreviewContainer = document.getElementById('image-preview-container');
        this.clearImageBtn = document.getElementById('clear-image-btn');
        this.formStatusSelect = document.getElementById('form-status');
        this.cancelEditBtn = document.getElementById('cancel-edit-btn');
        // Table List
        this.adminProductsTableBody = document.getElementById('admin-products-table-body');
    }
    setupAdminListeners() {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l;
        // Abrir y cerrar login
        (_a = this.adminAccessBtn) === null || _a === void 0 ? void 0 : _a.addEventListener('click', () => {
            this.adminPasswordInput.value = '';
            this.authErrorMsg.classList.add('hidden');
            this.adminAuthDialog.showModal();
        });
        (_b = this.closeAuthBtn) === null || _b === void 0 ? void 0 : _b.addEventListener('click', () => {
            this.adminAuthDialog.close();
        });
        // Intentar iniciar sesión
        (_c = this.adminAuthForm) === null || _c === void 0 ? void 0 : _c.addEventListener('submit', (e) => {
            e.preventDefault();
            if (this.adminPasswordInput.value === this.adminPasswordVal) {
                this.adminAuthDialog.close();
                this.showAdminPanel();
            }
            else {
                this.authErrorMsg.classList.remove('hidden');
            }
        });
        // Cerrar panel de administración
        (_d = this.closeAdminPanelBtn) === null || _d === void 0 ? void 0 : _d.addEventListener('click', () => {
            this.adminPanelDialog.close();
        });
        // Evento de búsqueda del catálogo
        (_e = this.catalogSearchInput) === null || _e === void 0 ? void 0 : _e.addEventListener('input', () => {
            this.filterProducts();
        });
        // Procesamiento de subida de imagen local
        (_f = this.formImageFileInput) === null || _f === void 0 ? void 0 : _f.addEventListener('change', (e) => {
            var _a;
            const file = (_a = this.formImageFileInput.files) === null || _a === void 0 ? void 0 : _a[0];
            if (file) {
                this.processAndCompressImage(file);
            }
        });
        // Limpiar la imagen cargada
        (_g = this.clearImageBtn) === null || _g === void 0 ? void 0 : _g.addEventListener('click', () => {
            this.clearFormImage();
        });
        // Guardar/actualizar producto
        (_h = this.productForm) === null || _h === void 0 ? void 0 : _h.addEventListener('submit', (e) => this.saveProduct(e));
        // Cancelar edición
        (_j = this.cancelEditBtn) === null || _j === void 0 ? void 0 : _j.addEventListener('click', () => this.resetForm());
        // Descargar JSON de productos
        (_k = this.downloadJsonBtn) === null || _k === void 0 ? void 0 : _k.addEventListener('click', () => this.downloadJson());
        // Restaurar catálogo desde el servidor (products.json)
        (_l = this.resetCatalogBtn) === null || _l === void 0 ? void 0 : _l.addEventListener('click', async () => {
            if (confirm('¿Estás seguro de que deseas eliminar TODOS los cambios locales y restaurar el catálogo original de respaldo?')) {
                if (this.db) {
                    try {
                        const response = await fetch('products.json');
                        if (response.ok) {
                            const seedProducts = await response.json();
                            // Borrar todos los existentes en Firestore uno por uno
                            const deletePromises = this.products.map(p => this.db.collection("products").doc(p.id.toString()).delete());
                            await Promise.all(deletePromises);
                            // Subir lote
                            const batch = this.db.batch();
                            seedProducts.forEach(p => {
                                const docRef = this.db.collection("products").doc(p.id.toString());
                                batch.set(docRef, p);
                            });
                            await batch.commit();
                            alert("Colección de Firebase restaurada con éxito.");
                        }
                    }
                    catch (err) {
                        console.error(err);
                        alert("Error al intentar restaurar el catálogo en Firebase.");
                    }
                }
                else {
                    localStorage.removeItem('american_jeans_catalog');
                    this.loadCatalog();
                }
            }
        });
    }
    processAndCompressImage(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            var _a;
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const maxDimension = 600; // Resolución ideal para previsualización e incrustación liviana
                let width = img.width;
                let height = img.height;
                if (width > height) {
                    if (width > maxDimension) {
                        height = Math.round((height * maxDimension) / width);
                        width = maxDimension;
                    }
                }
                else {
                    if (height > maxDimension) {
                        width = Math.round((width * maxDimension) / height);
                        height = maxDimension;
                    }
                }
                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx === null || ctx === void 0 ? void 0 : ctx.drawImage(img, 0, 0, width, height);
                // Compresión optimizada (formato jpeg con 0.75 de calidad)
                const base64Str = canvas.toDataURL('image/jpeg', 0.75);
                this.setFormImage(base64Str);
            };
            img.src = (_a = e.target) === null || _a === void 0 ? void 0 : _a.result;
        };
        reader.readAsDataURL(file);
    }
    setFormImage(base64) {
        this.formImageBase64Input.value = base64;
        this.imagePreview.src = base64;
        this.imagePreview.classList.remove('hidden');
        this.clearImageBtn.classList.remove('hidden');
        // Ocultar el texto de "Sin foto"
        const noPhotoText = this.imagePreviewContainer.querySelector('span');
        if (noPhotoText)
            noPhotoText.classList.add('hidden');
    }
    clearFormImage() {
        this.formImageFileInput.value = '';
        this.formImageBase64Input.value = '';
        this.imagePreview.src = '';
        this.imagePreview.classList.add('hidden');
        this.clearImageBtn.classList.add('hidden');
        // Mostrar el texto de "Sin foto"
        const noPhotoText = this.imagePreviewContainer.querySelector('span');
        if (noPhotoText)
            noPhotoText.classList.remove('hidden');
    }
    async loadCatalog() {
        // 1. Intentar inicializar Firebase
        try {
            const config = window.firebaseConfig;
            if (config && config.projectId && !config.projectId.includes("REEMPLAZAR")) {
                firebase.initializeApp(config);
                this.db = firebase.firestore();
                this.isDbOnline = true;
                this.updateDbStatusIndicator(true);
                // Escucha en tiempo real mediante snapshot
                this.db.collection("products").onSnapshot(async (snapshot) => {
                    if (snapshot.empty) {
                        console.log("La base de datos de Firebase está vacía. Sembrando catálogo inicial...");
                        await this.seedFirebaseCatalog();
                        return;
                    }
                    const list = [];
                    snapshot.forEach((doc) => {
                        list.push(Object.assign({ id: parseInt(doc.id) }, doc.data()));
                    });
                    this.products = list.sort((a, b) => a.id - b.id);
                    localStorage.setItem('american_jeans_catalog', JSON.stringify(this.products));
                    this.initUI();
                }, (error) => {
                    console.error("Error en escucha en tiempo real de Firestore:", error);
                    this.isDbOnline = false;
                    this.updateDbStatusIndicator(false);
                    this.loadLocalCatalogFallback();
                });
                return;
            }
        }
        catch (error) {
            console.warn("No se pudo iniciar Firebase. Cargando catálogo local...");
        }
        // 2. Si Firebase no está configurado, cargamos localmente
        this.isDbOnline = false;
        this.updateDbStatusIndicator(false);
        this.loadLocalCatalogFallback();
    }
    async seedFirebaseCatalog() {
        if (!this.db)
            return;
        try {
            const response = await fetch('products.json');
            if (response.ok) {
                const seedProducts = await response.json();
                const batch = this.db.batch();
                seedProducts.forEach(p => {
                    const docRef = this.db.collection("products").doc(p.id.toString());
                    batch.set(docRef, p);
                });
                await batch.commit();
                console.log("Sembrado inicial de Firebase completado con éxito.");
            }
        }
        catch (err) {
            console.error("Error al sembrar catálogo inicial en Firebase:", err);
        }
    }
    async loadLocalCatalogFallback() {
        try {
            const localData = localStorage.getItem('american_jeans_catalog');
            if (localData) {
                this.products = JSON.parse(localData);
            }
            else {
                const response = await fetch('products.json');
                if (response.ok) {
                    this.products = await response.json();
                    localStorage.setItem('american_jeans_catalog', JSON.stringify(this.products));
                }
            }
        }
        catch (error) {
            console.error('Error cargando catálogo local:', error);
        }
        finally {
            this.initUI();
        }
    }
    updateDbStatusIndicator(isOnline) {
        if (!this.dbStatusIndicator)
            return;
        if (isOnline) {
            this.dbStatusIndicator.innerHTML = `🟢 <span class="text-emerald-400 font-bold">Firebase Firestore Activo</span>. Los cambios se sincronizan en tiempo real para todos los usuarios.`;
            this.dbStatusIndicator.className = "text-xs text-emerald-400/90 font-medium mt-1";
        }
        else {
            this.dbStatusIndicator.innerHTML = `⚠️ <span class="text-amber-400 font-bold">Modo Local (Firebase desconectado)</span>. Edita localmente. Configura 'firebase-config.js' para activar el guardado en línea.`;
            this.dbStatusIndicator.className = "text-xs text-amber-400/90 font-medium mt-1";
        }
    }
    initUI() {
        this.renderFilters();
        this.filterProducts();
        if (this.adminPanelDialog.open) {
            this.renderAdminProducts();
        }
    }
    renderFilters() {
        const genders = ['Todos', 'Hombre', 'Mujer'];
        const collections = ['Todos', 'Novedades', 'Promociones'];
        const categories = ['Todos', 'Pantalones', 'Camisas', 'Jackets', 'Zapatos', 'Accesorios', 'Otros'];
        // Renderizar Filtros de Género
        this.genderFilterContainer.innerHTML = genders.map(g => `
            <button
                class="gender-btn w-full px-5 py-2.5 rounded-2xl text-xs font-bold transition-all border text-left flex justify-between items-center ${g === this.currentGender ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-500/20' : 'glass border-white/5 text-slate-400 hover:text-white hover:border-white/10'}"
                data-gender="${g}">
                <span>${g}</span>
                <span class="text-[10px] opacity-60">${g === 'Todos' ? this.products.length : this.products.filter(p => p.gender === g || p.gender === 'Unisex').length}</span>
            </button>
        `).join('');
        this.genderFilterContainer.querySelectorAll('.gender-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const target = e.currentTarget;
                this.currentGender = target.dataset.gender;
                this.initUI();
            });
        });
        // Renderizar Filtros de Colección
        this.statusFilterContainer.innerHTML = collections.map(col => {
            let count = 0;
            if (col === 'Todos')
                count = this.products.length;
            else if (col === 'Novedades')
                count = this.products.filter(p => p.status === 'Nuevo').length;
            else if (col === 'Promociones')
                count = this.products.filter(p => p.status === 'Promo').length;
            return `
                <button
                    class="status-btn w-full px-5 py-2.5 rounded-2xl text-xs font-bold transition-all border text-left flex justify-between items-center ${col === this.currentStatus ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-500/20' : 'glass border-white/5 text-slate-400 hover:text-white hover:border-white/10'}"
                    data-status="${col}">
                    <span>${col}</span>
                    <span class="text-[10px] opacity-60">${count}</span>
                </button>
            `;
        }).join('');
        this.statusFilterContainer.querySelectorAll('.status-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const target = e.currentTarget;
                this.currentStatus = target.dataset.status;
                this.initUI();
            });
        });
        // Renderizar Filtros de Categorías
        this.categoryFilterContainer.innerHTML = categories.map(c => `
            <button
                class="category-btn w-full px-5 py-2.5 rounded-2xl text-xs font-bold transition-all border text-left flex justify-between items-center ${c === this.currentCategory ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-500/20' : 'glass border-white/5 text-slate-400 hover:text-white hover:border-white/10'}"
                data-category="${c}">
                <span>${c}</span>
                <span class="text-[10px] opacity-60">${c === 'Todos' ? this.products.length : this.products.filter(p => p.category === c).length}</span>
            </button>
        `).join('');
        this.categoryFilterContainer.querySelectorAll('.category-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const target = e.currentTarget;
                this.currentCategory = target.dataset.category;
                this.initUI();
            });
        });
    }
    filterProducts() {
        const query = this.catalogSearchInput.value.toLowerCase().trim();
        const filtered = this.products.filter(p => {
            const matchGender = this.currentGender === 'Todos' || p.gender === this.currentGender || p.gender === 'Unisex';
            const matchCategory = this.currentCategory === 'Todos' || p.category === this.currentCategory;
            let matchStatus = true;
            if (this.currentStatus === 'Novedades')
                matchStatus = p.status === 'Nuevo';
            else if (this.currentStatus === 'Promociones')
                matchStatus = p.status === 'Promo';
            const matchSearch = query === '' ||
                p.name.toLowerCase().includes(query) ||
                p.brand.toLowerCase().includes(query) ||
                p.category.toLowerCase().includes(query);
            return matchGender && matchCategory && matchStatus && matchSearch;
        });
        // Actualizar el contador
        this.productCountBadge.textContent = `${filtered.length} ${filtered.length === 1 ? 'artículo' : 'artículos'}`;
        this.renderProducts(filtered);
    }
    renderProducts(products) {
        if (products.length === 0) {
            this.gridElement.innerHTML = `
                <div class="col-span-full text-center py-20 text-slate-500 glass rounded-[32px] border border-white/5">
                    <p class="text-4xl mb-3">😕</p>
                    <p class="font-luxury font-bold text-lg text-slate-300">No encontramos lo que buscas</p>
                    <p class="text-xs text-slate-500 mt-1.5">Intenta buscando otra prenda o cambiando tus filtros.</p>
                </div>`;
            return;
        }
        this.gridElement.innerHTML = products.map(p => {
            let badgeHtml = '';
            if (p.status === 'Nuevo') {
                badgeHtml = `<span class="absolute top-4 left-4 bg-blue-500/80 backdrop-blur-md text-[9px] px-3 py-1 rounded-full font-extrabold uppercase tracking-widest border border-blue-400/20 shadow-lg shadow-blue-500/20 z-20 animate__animated animate__pulse animate__infinite">Nuevo</span>`;
            }
            else if (p.status === 'Promo') {
                badgeHtml = `<span class="absolute top-4 left-4 bg-rose-500/80 backdrop-blur-md text-[9px] px-3 py-1 rounded-full font-extrabold uppercase tracking-widest border border-rose-400/20 shadow-lg shadow-rose-500/20 z-20 animate__animated animate__pulse animate__infinite">Oferta</span>`;
            }
            return `
                <div class="product-card group relative bg-white/[0.02] rounded-[32px] overflow-hidden border border-white/5 transition-all duration-500 hover:border-blue-500/30 hover:shadow-2xl hover:shadow-blue-500/5 animate__animated animate__fadeIn">
                    <div class="aspect-[3/4] w-full overflow-hidden relative bg-slate-950">
                        <img
                            src="${p.image}"
                            alt="${p.name}"
                            loading="lazy"
                            class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105">
                        
                        <!-- Hover overlay with WhatsApp -->
                        <div class="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-end p-4 md:p-6 z-10">
                            <button
                                onclick="window.showroom.contactWhatsApp('${p.name}', '${p.brand}')"
                                class="w-full bg-green-500 hover:bg-green-400 text-white py-3.5 rounded-2xl font-bold transition-all duration-300 flex items-center justify-center gap-2 active:scale-95 shadow-[0_0_20px_rgba(34,197,94,0.4)] translate-y-3 group-hover:translate-y-0">
                                <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/></svg>
                                <span>Consultar WhatsApp</span>
                            </button>
                        </div>

                        <!-- WhatsApp touch helper for mobile (visible when not hovered, subtle green icon) -->
                        <div class="lg:hidden absolute bottom-3.5 right-3.5 bg-green-500 text-white p-3 rounded-full shadow-lg shadow-green-500/20 active:scale-95 z-20"
                            onclick="event.stopPropagation(); window.showroom.contactWhatsApp('${p.name}', '${p.brand}')">
                            <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/></svg>
                        </div>

                        ${badgeHtml}
                    </div>
                    <div class="p-6 space-y-2">
                        <p class="text-blue-400 text-[10px] font-bold uppercase tracking-widest">${p.brand} • ${p.category} (${p.gender})</p>
                        <h3 class="text-base font-bold text-white tracking-tight line-clamp-1 group-hover:text-blue-300 transition duration-300">${p.name}</h3>
                        <div class="flex justify-between items-center pt-2 border-t border-white/5">
                            <span class="text-xl font-extrabold text-white">$${p.price.toFixed(2)}</span>
                            <div class="flex gap-1 flex-wrap justify-end">
                                ${p.sizes.slice(0, 3).map(s => `<span class="text-[9px] border border-white/10 px-1.5 py-0.5 rounded bg-white/[0.02] text-slate-400 font-bold">${s}</span>`).join('')}
                                ${p.sizes.length > 3 ? `<span class="text-[9px] border border-white/10 px-1.5 py-0.5 rounded bg-white/[0.02] text-slate-400 font-bold">+${p.sizes.length - 3}</span>` : ''}
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    }
    showAdminPanel() {
        this.resetForm();
        this.renderAdminProducts();
        this.adminPanelDialog.showModal();
    }
    renderAdminProducts() {
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
                    <div class="text-[10px] text-slate-400 mt-0.5">${p.brand} • ${p.category} • ${p.gender} • <span class="${p.status === 'Promo' ? 'text-rose-400 font-bold' : p.status === 'Nuevo' ? 'text-blue-400 font-bold' : 'text-slate-500'}">${p.status}</span></div>
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
    async saveProduct(e) {
        e.preventDefault();
        const idStr = this.productIdInput.value;
        const name = this.formNameInput.value.trim();
        const brand = this.formBrandInput.value.trim();
        const price = parseFloat(this.formPriceInput.value);
        const category = this.formCategorySelect.value;
        const gender = this.formGenderSelect.value;
        const sizes = this.formSizesInput.value.split(',').map(s => s.trim()).filter(s => s.length > 0);
        const image = this.formImageBase64Input.value.trim();
        const status = this.formStatusSelect.value;
        if (!image) {
            alert('Por favor selecciona una foto para el producto.');
            return;
        }
        let savedProduct;
        if (idStr === '') {
            const newId = this.products.reduce((max, p) => p.id > max ? p.id : max, 0) + 1;
            savedProduct = { id: newId, name, brand, price, category, gender, sizes, image, status };
            // Si está conectado a Firebase, subir a Firestore
            if (this.db) {
                try {
                    await this.db.collection("products").doc(newId.toString()).set(savedProduct);
                }
                catch (err) {
                    console.error("Error guardando en Firestore:", err);
                    alert("Error de red al guardar en Firebase.");
                }
            }
            else {
                this.products.push(savedProduct);
                localStorage.setItem('american_jeans_catalog', JSON.stringify(this.products));
                this.initUI();
            }
        }
        else {
            const id = parseInt(idStr);
            savedProduct = { id, name, brand, price, category, gender, sizes, image, status };
            if (this.db) {
                try {
                    await this.db.collection("products").doc(id.toString()).set(savedProduct);
                }
                catch (err) {
                    console.error("Error editando en Firestore:", err);
                    alert("Error de red al guardar en Firebase.");
                }
            }
            else {
                const index = this.products.findIndex(p => p.id === id);
                if (index !== -1) {
                    this.products[index] = savedProduct;
                    localStorage.setItem('american_jeans_catalog', JSON.stringify(this.products));
                    this.initUI();
                }
            }
        }
        this.resetForm();
    }
    async deleteProduct(id) {
        if (!confirm('¿Estás seguro de que deseas eliminar este producto del catálogo?'))
            return;
        if (this.db) {
            try {
                await this.db.collection("products").doc(id.toString()).delete();
            }
            catch (err) {
                console.error("Error eliminando de Firestore:", err);
                alert("Error de red al eliminar en Firebase.");
            }
        }
        else {
            this.products = this.products.filter(p => p.id !== id);
            localStorage.setItem('american_jeans_catalog', JSON.stringify(this.products));
            this.initUI();
        }
        this.resetForm();
    }
    editProduct(id) {
        const product = this.products.find(p => p.id === id);
        if (!product)
            return;
        this.formTitle.textContent = 'Editar Producto';
        this.productIdInput.value = product.id.toString();
        this.formNameInput.value = product.name;
        this.formBrandInput.value = product.brand;
        this.formPriceInput.value = product.price.toFixed(2);
        this.formCategorySelect.value = product.category;
        this.formGenderSelect.value = product.gender;
        this.formSizesInput.value = product.sizes.join(', ');
        // Cargar imagen en formulario
        this.setFormImage(product.image);
        // Cargar estado de colección
        this.formStatusSelect.value = product.status || 'Normal';
        this.cancelEditBtn.classList.remove('hidden');
    }
    resetForm() {
        this.productForm.reset();
        this.productIdInput.value = '';
        this.clearFormImage();
        this.formStatusSelect.value = 'Normal';
        this.formTitle.textContent = 'Añadir Nuevo Producto';
        this.cancelEditBtn.classList.add('hidden');
    }
    downloadJson() {
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
    contactWhatsApp(name, brand) {
        const phone = "593984186548"; // Número de Cuenca/Ecuador
        const text = encodeURIComponent(`¡Hola American Jeans! 👋 Vi en su web el modelo *${name}* de *${brand}*. ¿Tienen stock disponible? ¿Cuáles tallas hay?`);
        window.open(`https://wa.me/${phone}?text=${text}`, '_blank');
    }
}
// Inicializar y exponer para el onclick inline
const showroom = new Showroom();
window.showroom = showroom;
