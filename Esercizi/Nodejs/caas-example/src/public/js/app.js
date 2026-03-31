/**
 * Customer Management WebApp - Client-side JavaScript
 */

// API Base URL
const API_BASE_URL = '/api';

// State
let currentPage = 1;
let currentLimit = 10;
let currentSearch = '';
let currentSortBy = 'created_at';
let currentOrder = 'DESC';
let deleteCustomerId = null;

// Bootstrap Modals
let customerModal;
let deleteModal;

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    initializeModals();
    initializeEventListeners();
    loadStats();
    loadCustomers();
    checkHealth();
});

/**
 * Initialize Bootstrap modals
 */
function initializeModals() {
    customerModal = new bootstrap.Modal(document.getElementById('customerModal'));
    deleteModal = new bootstrap.Modal(document.getElementById('deleteModal'));
}

/**
 * Initialize all event listeners
 */
function initializeEventListeners() {
    // Add customer button
    document.getElementById('btnAddCustomer').addEventListener('click', openAddModal);

    // Refresh button
    document.getElementById('btnRefresh').addEventListener('click', () => {
        loadStats();
        loadCustomers();
    });

    // Search input with debounce
    let searchTimeout;
    document.getElementById('searchInput').addEventListener('input', (e) => {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
            currentSearch = e.target.value;
            currentPage = 1;
            loadCustomers();
        }, 500);
    });

    // Save customer button
    document.getElementById('btnSaveCustomer').addEventListener('click', saveCustomer);

    // Confirm delete button
    document.getElementById('btnConfirmDelete').addEventListener('click', confirmDelete);

    // Sort table headers
    document.querySelectorAll('.sortable').forEach(header => {
        header.addEventListener('click', () => {
            const sortBy = header.getAttribute('data-sort');
            if (currentSortBy === sortBy) {
                currentOrder = currentOrder === 'ASC' ? 'DESC' : 'ASC';
            } else {
                currentSortBy = sortBy;
                currentOrder = 'ASC';
            }
            updateSortIcons();
            loadCustomers();
        });
    });
}

/**
 * Update sort icons
 */
function updateSortIcons() {
    document.querySelectorAll('.sortable').forEach(header => {
        const icon = header.querySelector('i');
        header.classList.remove('sorted');
        
        if (header.getAttribute('data-sort') === currentSortBy) {
            header.classList.add('sorted');
            icon.className = currentOrder === 'ASC' ? 'bi bi-chevron-up' : 'bi bi-chevron-down';
        } else {
            icon.className = 'bi bi-chevron-expand';
        }
    });
}

/**
 * Check health status
 */
async function checkHealth() {
    try {
        const response = await fetch('/ready');
        const data = await response.json();
        
        const statusElement = document.getElementById('dbStatus');
        if (data.status === 'ready') {
            statusElement.textContent = 'Connected';
            statusElement.parentElement.parentElement.classList.remove('bg-warning');
            statusElement.parentElement.parentElement.classList.add('bg-success');
        } else {
            statusElement.textContent = 'Disconnected';
            statusElement.parentElement.parentElement.classList.remove('bg-success');
            statusElement.parentElement.parentElement.classList.add('bg-danger');
        }
    } catch (error) {
        console.error('Health check failed:', error);
        document.getElementById('dbStatus').textContent = 'Error';
    }
}

/**
 * Load statistics
 */
async function loadStats() {
    try {
        const response = await fetch(`${API_BASE_URL}/customers/stats`);
        const data = await response.json();

        if (data.success) {
            document.getElementById('totalCustomers').textContent = data.data.total;
            document.getElementById('recentCustomers').textContent = data.data.recentlyAdded;
            document.getElementById('withCompany').textContent = data.data.withCompany;
        }
    } catch (error) {
        console.error('Error loading stats:', error);
        showToast('Errore nel caricamento delle statistiche', 'danger');
    }
}

/**
 * Load customers with pagination and filters
 */
async function loadCustomers() {
    try {
        const params = new URLSearchParams({
            page: currentPage,
            limit: currentLimit,
            sortBy: currentSortBy,
            order: currentOrder,
        });

        if (currentSearch) {
            params.append('search', currentSearch);
        }

        const response = await fetch(`${API_BASE_URL}/customers?${params}`);
        const data = await response.json();

        if (data.success) {
            renderCustomersTable(data.data);
            renderPagination(data.pagination);
        } else {
            showToast('Errore nel caricamento dei clienti', 'danger');
        }
    } catch (error) {
        console.error('Error loading customers:', error);
        showToast('Errore di connessione al server', 'danger');
        renderEmptyState('Errore di connessione');
    }
}

/**
 * Render customers table
 */
function renderCustomersTable(customers) {
    const tbody = document.getElementById('customersTableBody');

    if (customers.length === 0) {
        renderEmptyState('Nessun cliente trovato');
        return;
    }

    tbody.innerHTML = customers.map(customer => `
        <tr class="fade-in">
            <td>${escapeHtml(customer.first_name)}</td>
            <td>${escapeHtml(customer.last_name)}</td>
            <td>${escapeHtml(customer.email)}</td>
            <td>${customer.phone ? escapeHtml(customer.phone) : '-'}</td>
            <td>${customer.company ? escapeHtml(customer.company) : '-'}</td>
            <td>${customer.city ? escapeHtml(customer.city) : '-'}</td>
            <td>
                <div class="btn-group btn-group-sm" role="group">
                    <button class="btn btn-outline-primary" onclick="viewCustomer(${customer.id})" title="Visualizza">
                        <i class="bi bi-eye"></i>
                    </button>
                    <button class="btn btn-outline-warning" onclick="editCustomer(${customer.id})" title="Modifica">
                        <i class="bi bi-pencil"></i>
                    </button>
                    <button class="btn btn-outline-danger" onclick="deleteCustomer(${customer.id}, '${escapeHtml(customer.first_name)} ${escapeHtml(customer.last_name)}')" title="Elimina">
                        <i class="bi bi-trash"></i>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
}

/**
 * Render empty state
 */
function renderEmptyState(message) {
    const tbody = document.getElementById('customersTableBody');
    tbody.innerHTML = `
        <tr>
            <td colspan="7" class="text-center">
                <div class="empty-state">
                    <i class="bi bi-inbox"></i>
                    <p class="mb-0">${message}</p>
                </div>
            </td>
        </tr>
    `;
}

/**
 * Render pagination
 */
function renderPagination(pagination) {
    const paginationElement = document.getElementById('pagination');
    const { page, totalPages } = pagination;

    if (totalPages <= 1) {
        paginationElement.innerHTML = '';
        return;
    }

    let html = '';

    // Previous button
    html += `
        <li class="page-item ${page === 1 ? 'disabled' : ''}">
            <a class="page-link" href="#" onclick="changePage(${page - 1}); return false;">
                <i class="bi bi-chevron-left"></i>
            </a>
        </li>
    `;

    // Page numbers
    const maxVisible = 5;
    let startPage = Math.max(1, page - Math.floor(maxVisible / 2));
    let endPage = Math.min(totalPages, startPage + maxVisible - 1);

    if (endPage - startPage < maxVisible - 1) {
        startPage = Math.max(1, endPage - maxVisible + 1);
    }

    if (startPage > 1) {
        html += `<li class="page-item"><a class="page-link" href="#" onclick="changePage(1); return false;">1</a></li>`;
        if (startPage > 2) {
            html += `<li class="page-item disabled"><span class="page-link">...</span></li>`;
        }
    }

    for (let i = startPage; i <= endPage; i++) {
        html += `
            <li class="page-item ${i === page ? 'active' : ''}">
                <a class="page-link" href="#" onclick="changePage(${i}); return false;">${i}</a>
            </li>
        `;
    }

    if (endPage < totalPages) {
        if (endPage < totalPages - 1) {
            html += `<li class="page-item disabled"><span class="page-link">...</span></li>`;
        }
        html += `<li class="page-item"><a class="page-link" href="#" onclick="changePage(${totalPages}); return false;">${totalPages}</a></li>`;
    }

    // Next button
    html += `
        <li class="page-item ${page === totalPages ? 'disabled' : ''}">
            <a class="page-link" href="#" onclick="changePage(${page + 1}); return false;">
                <i class="bi bi-chevron-right"></i>
            </a>
        </li>
    `;

    paginationElement.innerHTML = html;
}

/**
 * Change page
 */
function changePage(page) {
    currentPage = page;
    loadCustomers();
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

/**
 * Open add customer modal
 */
function openAddModal() {
    document.getElementById('modalTitle').textContent = 'Nuovo Cliente';
    document.getElementById('customerForm').reset();
    document.getElementById('customerId').value = '';
    customerModal.show();
}

/**
 * View customer details
 */
async function viewCustomer(id) {
    try {
        const response = await fetch(`${API_BASE_URL}/customers/${id}`);
        const data = await response.json();

        if (data.success) {
            const customer = data.data;
            alert(`
Nome: ${customer.first_name} ${customer.last_name}
Email: ${customer.email}
Telefono: ${customer.phone || 'N/A'}
Azienda: ${customer.company || 'N/A'}
Indirizzo: ${customer.address || 'N/A'}
Città: ${customer.city || 'N/A'}, ${customer.state || 'N/A'} ${customer.postal_code || ''}
Paese: ${customer.country || 'N/A'}
Note: ${customer.notes || 'N/A'}
            `);
        }
    } catch (error) {
        console.error('Error viewing customer:', error);
        showToast('Errore nel caricamento dei dettagli', 'danger');
    }
}

/**
 * Edit customer
 */
async function editCustomer(id) {
    try {
        const response = await fetch(`${API_BASE_URL}/customers/${id}`);
        const data = await response.json();

        if (data.success) {
            const customer = data.data;
            document.getElementById('modalTitle').textContent = 'Modifica Cliente';
            document.getElementById('customerId').value = customer.id;
            document.getElementById('firstName').value = customer.first_name;
            document.getElementById('lastName').value = customer.last_name;
            document.getElementById('email').value = customer.email;
            document.getElementById('phone').value = customer.phone || '';
            document.getElementById('company').value = customer.company || '';
            document.getElementById('address').value = customer.address || '';
            document.getElementById('city').value = customer.city || '';
            document.getElementById('state').value = customer.state || '';
            document.getElementById('postalCode').value = customer.postal_code || '';
            document.getElementById('country').value = customer.country || 'Italia';
            document.getElementById('notes').value = customer.notes || '';

            customerModal.show();
        }
    } catch (error) {
        console.error('Error loading customer:', error);
        showToast('Errore nel caricamento del cliente', 'danger');
    }
}

/**
 * Save customer (create or update)
 */
async function saveCustomer() {
    const form = document.getElementById('customerForm');
    
    if (!form.checkValidity()) {
        form.classList.add('was-validated');
        return;
    }

    const customerId = document.getElementById('customerId').value;
    const customerData = {
        first_name: document.getElementById('firstName').value.trim(),
        last_name: document.getElementById('lastName').value.trim(),
        email: document.getElementById('email').value.trim(),
        phone: document.getElementById('phone').value.trim(),
        company: document.getElementById('company').value.trim(),
        address: document.getElementById('address').value.trim(),
        city: document.getElementById('city').value.trim(),
        state: document.getElementById('state').value.trim(),
        postal_code: document.getElementById('postalCode').value.trim(),
        country: document.getElementById('country').value.trim(),
        notes: document.getElementById('notes').value.trim(),
    };

    try {
        const url = customerId 
            ? `${API_BASE_URL}/customers/${customerId}`
            : `${API_BASE_URL}/customers`;
        
        const method = customerId ? 'PUT' : 'POST';

        const response = await fetch(url, {
            method,
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(customerData),
        });

        const data = await response.json();

        if (data.success) {
            showToast(data.message, 'success');
            customerModal.hide();
            form.classList.remove('was-validated');
            loadStats();
            loadCustomers();
        } else {
            showToast(data.message || 'Errore nel salvataggio', 'danger');
        }
    } catch (error) {
        console.error('Error saving customer:', error);
        showToast('Errore di connessione al server', 'danger');
    }
}

/**
 * Delete customer
 */
function deleteCustomer(id, name) {
    deleteCustomerId = id;
    document.getElementById('deleteCustomerName').textContent = name;
    deleteModal.show();
}

/**
 * Confirm delete
 */
async function confirmDelete() {
    if (!deleteCustomerId) return;

    try {
        const response = await fetch(`${API_BASE_URL}/customers/${deleteCustomerId}`, {
            method: 'DELETE',
        });

        const data = await response.json();

        if (data.success) {
            showToast(data.message, 'success');
            deleteModal.hide();
            deleteCustomerId = null;
            loadStats();
            loadCustomers();
        } else {
            showToast(data.message || 'Errore nell\'eliminazione', 'danger');
        }
    } catch (error) {
        console.error('Error deleting customer:', error);
        showToast('Errore di connessione al server', 'danger');
    }
}

/**
 * Show toast notification
 */
function showToast(message, type = 'info') {
    const toastContainer = document.getElementById('toastContainer');
    const toastId = 'toast-' + Date.now();

    const toastColors = {
        success: 'bg-success text-white',
        danger: 'bg-danger text-white',
        warning: 'bg-warning text-dark',
        info: 'bg-info text-white',
    };

    const toastHTML = `
        <div id="${toastId}" class="toast ${toastColors[type]}" role="alert">
            <div class="toast-header ${toastColors[type]}">
                <i class="bi bi-${type === 'success' ? 'check-circle' : type === 'danger' ? 'exclamation-circle' : 'info-circle'} me-2"></i>
                <strong class="me-auto">Notifica</strong>
                <button type="button" class="btn-close ${type === 'success' || type === 'danger' || type === 'info' ? 'btn-close-white' : ''}" data-bs-dismiss="toast"></button>
            </div>
            <div class="toast-body">
                ${message}
            </div>
        </div>
    `;

    toastContainer.insertAdjacentHTML('beforeend', toastHTML);

    const toastElement = document.getElementById(toastId);
    const toast = new bootstrap.Toast(toastElement, { delay: 3000 });
    toast.show();

    toastElement.addEventListener('hidden.bs.toast', () => {
        toastElement.remove();
    });
}

/**
 * Escape HTML to prevent XSS
 */
function escapeHtml(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text ? text.toString().replace(/[&<>"']/g, m => map[m]) : '';
}
