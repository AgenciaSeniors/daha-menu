// =========================================================
// DAHA — Script del menú público
// =========================================================

let searchTimeout;
let todosLosProductos = [];
let productoActual = null;
let puntuacionSeleccionada = 0;

// 1. CARGAR MENÚ
async function cargarMenu() {
    const grid = document.getElementById('menu-grid');
    if (grid) grid.innerHTML = '<p style="text-align:center; color:var(--text-secondary); grid-column:1/-1; padding:40px;">Cargando carta...</p>';

    try {
        if (typeof supabaseClient === 'undefined') {
            throw new Error("Supabase no está conectado. Configura config.js.");
        }

        let { data: productos, error } = await supabaseClient
            .from('productos')
            .select(`*, opiniones(puntuacion)`)
            .eq('activo', true)
            .eq('restaurant_id', CONFIG.RESTAURANT_ID)
            .order('categoria', { ascending: true })
            .order('destacado', { ascending: false })
            .order('id', { ascending: false });

        if (error) throw error;

        todosLosProductos = productos.map(prod => {
            const opiniones = prod.opiniones || [];
            const total = opiniones.length;
            const suma = opiniones.reduce((acc, curr) => acc + curr.puntuacion, 0);
            prod.ratingPromedio = total ? (suma / total).toFixed(1) : null;
            return prod;
        });

    } catch (err) {
        console.error("Error cargando:", err);
        if (grid) grid.innerHTML = `<p style="text-align:center; color:var(--red-danger); grid-column:1/-1; padding:40px;">No se pudo cargar la carta. Revisa la configuración.</p>`;
    }

    renderizarMenu(todosLosProductos);
}

// 2. RENDERIZAR
function renderizarMenu(lista) {
    const contenedor = document.getElementById('menu-grid');
    if (!contenedor) return;

    contenedor.style.display = 'block';
    contenedor.innerHTML = '';

    if (lista.length === 0) {
        contenedor.innerHTML = `
            <div style="text-align:center; grid-column:1/-1; padding:40px; color:var(--text-secondary);">
                <span style="font-size:3rem; display:block; margin-bottom:10px;">🔍</span>
                No se encontraron productos.
            </div>`;
        return;
    }

    const categorias = {
        'entrantes': { nombre: 'Entrantes', icono: '🍟' },
        'plato especial': { nombre: 'Plato Especial', icono: '⭐' },
        'completas': { nombre: 'Platos', icono: '🍽️' },
        'pizzas': { nombre: 'Pizzas', icono: '🍕' },
        'pizzas familiares': { nombre: 'Pizzas Familiares', icono: '🍕' },
        'spaguettis': { nombre: 'Pastas', icono: '🍝' },
        'bebidas': { nombre: 'Bebidas', icono: '🍺' },
        'postres': { nombre: 'Postres', icono: '🍨' },
        'agregados': { nombre: 'Agregados', icono: '🧀' },
        'agregados pizzas familiares': { nombre: 'Agregados pizzas familiares', icono: '🧀' },
    };

    Object.keys(categorias).forEach(catKey => {
        const productosCategoria = lista.filter(p => p.categoria === catKey);
        if (productosCategoria.length > 0) {
            const catInfo = categorias[catKey];
            const seccionHTML = `
                <div class="category-section" id="section-${catKey}" data-categoria="${catKey}">
                    <h2 class="category-title-casona">${catInfo.icono} ${catInfo.nombre}</h2>
                    <div class="horizontal-scroll">
                      ${productosCategoria.map(item => {
                        const esAgotado = item.estado === 'agotado';
                        const claseAgotado = esAgotado ? 'is-agotado' : '';
                        const badgeAgotado = esAgotado ? '<div class="badge-agotado-casona">AGOTADO</div>' : '';

                        return `
                            <div class="card-casona ${claseAgotado}" onclick="${esAgotado ? '' : `abrirDetalle(${item.id})`}">
                                <div class="card-img-container" style="position:relative;">
                                    ${badgeAgotado}
                                    <img src="${item.imagen_url || 'https://via.placeholder.com/300x200/C4E5DC/1F4060?text=DAHA'}" loading="lazy">
                                    ${item.destacado ? '<span class="tag-destacado">TOP</span>' : ''}
                                </div>
                                <div class="card-body">
                                    <h3>${item.nombre}</h3>
                                    <div class="card-footer">
                                        <span class="card-price">$${item.precio}</span>
                                    </div>
                                </div>
                            </div>
                        `;
                      }).join('')}
                    </div>
                </div>
            `;
            contenedor.innerHTML += seccionHTML;
        }
    });
    activarVigilanciaCategorias();
}

// 3. DETALLE DE PRODUCTO
async function abrirDetalle(id) {
    const idNum = Number(id);
    productoActual = todosLosProductos.find(p => p.id === idNum);
    if (!productoActual) return;

    setText('det-titulo', productoActual.nombre);
    setText('det-desc', productoActual.descripcion);
    setText('det-price', `$${productoActual.precio}`);
    const imgEl = document.getElementById('det-img');
    if (imgEl) imgEl.src = productoActual.imagen_url || '';

    try {
        const { data: notas, error } = await supabaseClient
            .from('opiniones')
            .select('puntuacion')
            .eq('producto_id', idNum);

        if (error) throw error;

        let promedioTotal = "0.0";
        let cantidadTotal = 0;

        if (notas && notas.length > 0) {
            const suma = notas.reduce((acc, curr) => acc + curr.puntuacion, 0);
            promedioTotal = (suma / notas.length).toFixed(1);
            cantidadTotal = notas.length;
        }

        const notaValor = document.getElementById('det-puntuacion-valor');
        const cantidadTexto = document.getElementById('det-cantidad-opiniones');
        if (notaValor) notaValor.textContent = promedioTotal;
        if (cantidadTexto) cantidadTexto.textContent = `(${cantidadTotal} reseñas)`;

    } catch (err) {
        console.error("Error en promedio:", err);
    }

    const modal = document.getElementById('modal-detalle');
    if (modal) {
        modal.style.display = 'flex';
        setTimeout(() => modal.classList.add('active'), 10);
    }
}

function setText(id, text) {
    const el = document.getElementById(id);
    if (el) el.textContent = text;
}

function cerrarDetalle() {
    const modal = document.getElementById('modal-detalle');
    if (modal) {
        modal.classList.remove('active');
        setTimeout(() => modal.style.display = 'none', 350);
    }
}

// 4. FILTROS Y NAVEGACIÓN
function filtrar(cat, btn) {
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    if (btn) btn.classList.add('active');

    if (cat === 'todos') {
        renderizarMenu(todosLosProductos);
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
    }

    const buscador = document.getElementById('search-input');
    if (buscador && buscador.value !== "") {
        buscador.value = "";
        renderizarMenu(todosLosProductos);
    }

    const seccionDestino = document.getElementById(`section-${cat}`);
    if (seccionDestino) {
        const posicion = seccionDestino.offsetTop - 120;
        window.scrollTo({ top: posicion, behavior: 'smooth' });
    }
}

function irAlInicio(btn) {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    const inputBusqueda = document.getElementById('search-input');
    if (inputBusqueda) inputBusqueda.value = "";
    filtrar('todos', btn);
}

// 5. BUSCADOR
document.addEventListener('input', (e) => {
    if (e.target.id === 'search-input') {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
            const busqueda = e.target.value.toLowerCase().trim();
            if (busqueda === "") {
                renderizarMenu(todosLosProductos);
            } else {
                const filtrados = todosLosProductos.filter(p =>
                    p.nombre.toLowerCase().includes(busqueda) ||
                    (p.descripcion && p.descripcion.toLowerCase().includes(busqueda))
                );
                renderizarMenu(filtrados);
            }
        }, 300);
    }
});

// 6. ILUMINACIÓN AUTOMÁTICA DE CATEGORÍAS (scroll observer)
const opcionesScroll = {
    rootMargin: '-150px 0px -70% 0px',
    threshold: 0
};

const observadorScroll = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const categoriaActiva = entry.target.getAttribute('data-categoria');
            actualizarBotonActivo(categoriaActiva);
        }
    });
}, opcionesScroll);

function actualizarBotonActivo(cat) {
    const botones = document.querySelectorAll('.filter-btn');
    botones.forEach(btn => {
        btn.classList.remove('active');
        const onclickAttr = btn.getAttribute('onclick') || '';
        if (onclickAttr.includes(`'${cat}'`)) {
            btn.classList.add('active');
            btn.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
        }
    });
}

function activarVigilanciaCategorias() {
    const secciones = document.querySelectorAll('.category-section');
    secciones.forEach(sec => observadorScroll.observe(sec));
}

// 7. SISTEMA DE OPINIONES
function abrirOpinionDesdeDetalle() {
    cerrarDetalle();
    const modalOp = document.getElementById('modal-opinion');
    if (modalOp) {
        modalOp.style.display = 'flex';
        setTimeout(() => modalOp.classList.add('active'), 10);
        resetearFormularioOpinion();
    }
}

function cerrarModalOpiniones() {
    const modalOp = document.getElementById('modal-opinion');
    if (modalOp) {
        modalOp.classList.remove('active');
        setTimeout(() => modalOp.style.display = 'none', 350);
    }
}

function resetearFormularioOpinion() {
    puntuacionSeleccionada = 0;
    const estrellas = document.querySelectorAll('#stars-container span');
    estrellas.forEach(s => s.style.color = '#ddd');
    const nombre = document.getElementById('cliente-nombre');
    const comentario = document.getElementById('cliente-comentario');
    if (nombre) nombre.value = '';
    if (comentario) comentario.value = '';
}

// Listener para estrellas
document.addEventListener('click', (e) => {
    const estrella = e.target.closest('#stars-container span');
    if (estrella) {
        puntuacionSeleccionada = parseInt(estrella.getAttribute('data-val'));
        const todasLasEstrellas = document.querySelectorAll('#stars-container span');
        todasLasEstrellas.forEach((s, i) => {
            s.style.color = (i < puntuacionSeleccionada) ? '#E85A2E' : '#ddd';
        });
    }
});

async function enviarOpinion() {
    if (!puntuacionSeleccionada || puntuacionSeleccionada === 0) {
        alert("⚠️ Por favor, selecciona una puntuación con las estrellas.");
        return;
    }

    const elNombre = document.getElementById('cliente-nombre');
    const elComentario = document.getElementById('cliente-comentario');

    if (!elNombre || !elComentario) {
        alert("❌ Error técnico: faltan campos en el formulario.");
        return;
    }

    const btn = document.getElementById('btn-enviar-opinion');
    btn.disabled = true;
    btn.textContent = "ENVIANDO...";

    try {
        const { error } = await supabaseClient
            .from('opiniones')
            .insert([{
                producto_id: productoActual.id,
                cliente_nombre: elNombre.value.trim() || "Anónimo",
                comentario: elComentario.value.trim(),
                puntuacion: puntuacionSeleccionada,
                restaurant_id: CONFIG.RESTAURANT_ID
            }]);

        if (error) throw error;

        alert("✅ ¡Gracias! Tu opinión ha sido enviada.");
        cerrarModalOpiniones();
    } catch (err) {
        console.error("Error al enviar:", err);
        alert("❌ No se pudo enviar: " + err.message);
    } finally {
        btn.disabled = false;
        btn.textContent = "ENVIAR";
    }
}

async function abrirListaOpiniones() {
    const contenedor = document.getElementById('contenedor-opiniones-full');
    const modalLista = document.getElementById('modal-lista-opiniones');
    if (!productoActual) return;

    modalLista.style.display = 'flex';
    setTimeout(() => modalLista.classList.add('active'), 10);

    contenedor.innerHTML = '<p style="text-align:center; padding:20px; color:var(--text-secondary);">Cargando comentarios...</p>';

    try {
        const { data: opiniones, error } = await supabaseClient
            .from('opiniones')
            .select('*')
            .eq('producto_id', productoActual.id)
            .order('id', { ascending: false });

        if (error) throw error;

        if (!opiniones || opiniones.length === 0) {
            contenedor.innerHTML = '<p style="text-align:center; padding:20px; color:var(--text-muted);">Este producto no tiene reseñas aún.</p>';
            return;
        }

        contenedor.innerHTML = opiniones.map(op => `
            <div style="background:var(--mint-soft); padding:14px; border-radius:12px; margin-bottom:12px; border-left:4px solid var(--coral);">
                <div style="display:flex; justify-content:space-between; align-items:center;">
                    <strong style="color:var(--navy); font-size:0.95rem;">${op.cliente_nombre || 'Anónimo'}</strong>
                    <span style="color:var(--coral); font-size:0.9rem;">${'★'.repeat(op.puntuacion)}</span>
                </div>
                <p style="color:var(--text-secondary); font-size:0.88rem; margin-top:8px; line-height:1.5;">
                    "${op.comentario || 'Sin comentario.'}"
                </p>
            </div>
        `).join('');

    } catch (err) {
        contenedor.innerHTML = '<p style="color:var(--red-danger); text-align:center;">Error al conectar.</p>';
    }
}

function cerrarListaOpiniones() {
    const modalLista = document.getElementById('modal-lista-opiniones');
    if (modalLista) {
        modalLista.classList.remove('active');
        setTimeout(() => modalLista.style.display = 'none', 300);
    }
}

// INICIO
document.addEventListener('DOMContentLoaded', cargarMenu);
