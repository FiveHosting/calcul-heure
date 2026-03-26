// ===== CONFIGURATION =====
const API_URL = window.location.hostname === 'localhost' ? 'http://localhost:3000/api' : '/api';

// ===== ÉTATS GLOBAUX =====
let token = localStorage.getItem('token');
let currentUser = {};

// ===== UTILITAIRES =====
function showAlert(message, type = 'info') {
    const alert = document.createElement('div');
    alert.className = `alert ${type}`;
    alert.textContent = message;
    document.body.appendChild(alert);

    setTimeout(() => {
        alert.classList.add('hide');
        setTimeout(() => alert.remove(), 300);
    }, 3000);
}

function showModal(title, content, buttons = []) {
    const modal = document.getElementById('modal');
    const modalContent = modal.querySelector('.modal-content');

    modalContent.innerHTML = `
        <div class="modal-header">
            <h2>${title}</h2>
        </div>
        <div class="modal-body">
            ${content}
        </div>
        <div class="modal-footer">
            ${buttons.map(btn => `<button class="btn ${btn.class || ''}" onclick="${btn.action}">${btn.text}</button>`).join('')}
        </div>
    `;

    modal.classList.add('active');
}

function hideModal() {
    document.getElementById('modal').classList.remove('active');
}

// ===== AUTHENTIFICATION =====
async function login() {
    const username = document.getElementById('loginUsername').value;
    const password = document.getElementById('loginPassword').value;

    try {
        const res = await fetch(API_URL + '/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Erreur de connexion');

        token = data.token;
        localStorage.setItem('token', token);

        // Décoder le token pour obtenir les infos utilisateur
        const payload = JSON.parse(atob(token.split('.')[1]));
        currentUser = {
            id: payload.id,
            username: payload.username,
            email: payload.email,
            role: payload.role
        };

        showAlert('Connexion réussie !', 'success');
        showApp();
    } catch (err) {
        showAlert(err.message, 'error');
    }
}

async function register() {
    const username = document.getElementById('registerUsername').value;
    const email = document.getElementById('registerEmail').value;
    const password = document.getElementById('registerPassword').value;

    try {
        const res = await fetch(API_URL + '/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, email, password })
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Erreur d\'inscription');

        showAlert('Compte créé avec succès !', 'success');
        showAuthPanel('login');
    } catch (err) {
        showAlert(err.message, 'error');
    }
}

function showAuthPanel(panel) {
    document.querySelectorAll('.auth-panel').forEach(p => p.classList.remove('active'));
    document.getElementById(panel + 'Panel').classList.add('active');
}

function logout() {
    token = null;
    currentUser = {};
    localStorage.clear();
    document.getElementById('app').classList.remove('active');
    document.getElementById('auth').style.display = 'block';
    showAuthPanel('login');
}

// ===== APPLICATION PRINCIPALE =====
function showApp() {
    document.getElementById('auth').style.display = 'none';
    document.getElementById('app').classList.add('active');
    document.getElementById('headerUsername').textContent = currentUser.username;
    document.getElementById('headerRole').textContent = currentUser.role === 'admin' ? 'Administrateur' : 'Utilisateur';

    // Afficher le bouton admin UNIQUEMENT si l'utilisateur est admin
    const adminBtn = document.getElementById('adminBtn');
    if (currentUser.role === 'admin') {
        adminBtn.style.display = 'flex';
    } else {
        adminBtn.style.display = 'none';
    }

    loadEntries();
    loadMonthlyStats();
}

function showTab(event) {
    // Gérer les appels sans event ou avec event object
    let element = null;
    if (event && event.currentTarget) {
        element = event.currentTarget;
    } else if (event && event.getAttribute) {
        element = event;
    } else {
        return;
    }

    const tab = element.getAttribute('data-tab');
    if (!tab) return;

    // Sécurité: vérifier que l'utilisateur a le droit d'accéder à cet onglet
    if (tab === 'admin' && currentUser.role !== 'admin') {
        showAlert('Accès refusé: vous n\'êtes pas administrateur', 'error');
        return;
    }

    document.querySelectorAll('.tab-content').forEach(el => el.classList.remove('active'));
    document.querySelectorAll('.nav-tab').forEach(el => el.classList.remove('active'));
    document.getElementById(tab + 'Tab').classList.add('active');
    element.classList.add('active');
    if (tab === 'admin') loadAdminData();
    if (tab === 'entries') {
        loadEntries();
        loadMonthlyStats();
    }
}

// ===== GESTION DES ENTRÉES =====
async function loadEntries() {
    try {
        const res = await fetch(API_URL + '/entries', {
            headers: { 'Authorization': 'Bearer ' + token }
        });
        const data = await res.json();
        const entries = Array.isArray(data) ? data : [];
        document.getElementById('entriesList').innerHTML = entries.map(e => `
            <div class="entry-card">
                <div class="entry-card-header">
                    <div class="entry-card-date">${e.date}</div>
                </div>
                <div class="entry-card-time">${e.startTime} - ${e.endTime}</div>
                <div class="entry-card-details">
                    <div class="entry-detail">
                        <div class="entry-detail-label">Durée</div>
                        <div class="entry-detail-value">${e.hours}h ${e.minutes}m</div>
                    </div>
                    <div class="entry-detail">
                        <div class="entry-detail-label">Taux</div>
                        <div class="entry-detail-value">${e.hourlyRate}€/h</div>
                    </div>
                </div>
                <div class="entry-card-salary">
                    <div class="entry-card-salary-label">Salaire</div>
                    <div class="entry-card-salary-value">${e.salary.toFixed(2)}€</div>
                </div>
                ${e.description ? `<div class="entry-card-description">${e.description}</div>` : ''}
                <div class="entry-card-actions">
                    <button class="btn-delete" onclick="deleteEntry(${e.id})">
                        <i class="fas fa-trash"></i> Supprimer
                    </button>
                </div>
            </div>
        `).join('');
    } catch (err) {
        showAlert(err.message, 'error');
    }
}

async function addEntry() {
    const formData = new FormData(document.getElementById('entryForm'));
    const data = {
        date: formData.get('date'),
        startTime: formData.get('startTime'),
        endTime: formData.get('endTime'),
        hourlyRate: parseFloat(formData.get('hourlyRate')),
        description: formData.get('description')
    };

    try {
        const res = await fetch(API_URL + '/entries', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + token
            },
            body: JSON.stringify(data)
        });
        const result = await res.json();
        if (!res.ok) throw new Error(result.error || 'Erreur');

        document.getElementById('entryForm').reset();
        const today = new Date().toISOString().split('T')[0];
        document.getElementById('entryDate').value = today;
        showAlert('Entrée ajoutée !', 'success');
        loadEntries();
        loadMonthlyStats(); // Mettre à jour les stats globales
        showTab('entries');
    } catch (err) {
        showAlert(err.message, 'error');
    }
}

async function deleteEntry(id) {
    if (!confirm('Supprimer cette entrée ?')) return;
    try {
        const res = await fetch(API_URL + '/entries/' + id, {
            method: 'DELETE',
            headers: { 'Authorization': 'Bearer ' + token }
        });
        if (!res.ok) throw new Error('Erreur');
        showAlert('Entrée supprimée', 'success');
        loadEntries();
        loadMonthlyStats(); // Recharger les stats mensuelles
    } catch (err) {
        showAlert(err.message, 'error');
    }
}

// ===== STATISTIQUES =====
async function loadMonthlyStats() {
    try {
        const res = await fetch(API_URL + '/entries', {
            headers: { 'Authorization': 'Bearer ' + token }
        });
        const entries = await res.json();

        // Calculer les stats mensuelles
        const monthlyStats = {};
        entries.forEach(entry => {
            const month = entry.date.substring(0, 7); // YYYY-MM
            if (!monthlyStats[month]) {
                monthlyStats[month] = { entries: 0, hours: 0, salary: 0 };
            }
            monthlyStats[month].entries++;
            monthlyStats[month].hours += entry.total_hours || 0;
            monthlyStats[month].salary += entry.salary || 0;
        });

        // Trier par mois décroissant
        const sortedMonths = Object.keys(monthlyStats).sort().reverse();

        let statsHtml = '';
        sortedMonths.slice(0, 12).forEach(month => {
            const stats = monthlyStats[month];
            const monthName = new Date(month + '-01').toLocaleDateString('fr-FR', { year: 'numeric', month: 'long' });
            statsHtml += `
                <div class="stat-item">
                    <div class="stat-month">${monthName}</div>
                    <div class="stat-values">
                        <span>${stats.entries} entrées</span>
                        <span>${stats.hours.toFixed(1)}h</span>
                        <span>${stats.salary.toFixed(2)}€</span>
                    </div>
                </div>
            `;
        });

        document.getElementById('monthlyStats').innerHTML = statsHtml || '<p>Aucune donnée disponible</p>';
    } catch (err) {
        console.error('Erreur chargement stats:', err);
    }
}

// ===== ADMINISTRATION =====
async function loadAdminData() {
    if (currentUser.role !== 'admin') return;
    try {
        const ures = await fetch(API_URL + '/admin/users', {
            headers: { 'Authorization': 'Bearer ' + token }
        });
        const udata = await ures.json();
        document.querySelector('#usersList').innerHTML = (udata.users || []).map(u => `
            <tr>
                <td>${u.username}</td>
                <td>${u.email}</td>
                <td><span class="badge ${u.role === 'admin' ? 'badge-admin' : 'badge-user'}">${u.role}</span></td>
                <td>${u.total_entries || 0}</td>
                <td>${(u.total_hours || 0).toFixed(1)}h</td>
                <td>${(u.total_salary || 0).toFixed(2)}€</td>
                <td style="display: flex; gap: 5px; flex-wrap: wrap;">
                    <button class="btn-action" onclick="changeUserRole(${u.id}, '${u.role}', '${u.username}')" title="Changer le rôle">
                        <i class="fas fa-user-tie"></i> ${u.role === 'admin' ? 'Retirer admin' : 'Admin'}
                    </button>
                    ${u.id !== currentUser.id ? `
                    <button class="btn-action-delete" onclick="deleteUser(${u.id}, '${u.username}')" title="Supprimer l'utilisateur">
                        <i class="fas fa-trash"></i> Supprimer
                    </button>` : '<span style="font-size: 12px; color: var(--text-secondary);">Compte actuel</span>'}
                </td>
            </tr>
        `).join('');

        const sres = await fetch(API_URL + '/admin/stats', {
            headers: { 'Authorization': 'Bearer ' + token }
        });
        const stats = await sres.json();
        const elTotalUsers = document.getElementById('totalUsers');
        const elTotalEntries = document.getElementById('totalEntries');
        const elTotalHours = document.getElementById('totalHours');
        const elTotalSalary = document.getElementById('totalSalary');

        if (elTotalUsers) elTotalUsers.textContent = stats.totalUsers;
        if (elTotalEntries) elTotalEntries.textContent = stats.totalEntries;
        if (elTotalHours) elTotalHours.textContent = (stats.totalHours || 0).toFixed(1) + 'h';
        if (elTotalSalary) elTotalSalary.textContent = (stats.totalSalary || 0).toFixed(2) + '€';
    } catch (err) {
        showAlert(err.message, 'error');
    }
}

async function changeUserRole(userId, currentRole, username) {
    const newRole = currentRole === 'admin' ? 'user' : 'admin';
    if (!confirm(`Confirmer le changement de rôle de ${username} en ${ newRole}?`)) return;
    try {
        const res = await fetch(API_URL + '/admin/users/' + userId + '/role', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + token
            },
            body: JSON.stringify({ role: newRole })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Erreur');
        showAlert(`Rôle changé en ${newRole}`, 'success');
        loadAdminData();
    } catch (err) {
        showAlert(err.message, 'error');
    }
}

async function deleteUser(userId, username) {
    if (!confirm(`Êtes-vous sûr de vouloir supprimer ${username}? Cette action est irréversible.`)) return;
    try {
        const res = await fetch(API_URL + '/admin/users/' + userId, {
            method: 'DELETE',
            headers: { 'Authorization': 'Bearer ' + token }
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Erreur');
        showAlert(`Utilisateur ${username} supprimé`, 'success');
        loadAdminData();
    } catch (err) {
        showAlert(err.message, 'error');
    }
}

function changePassword() {
    const newPassword = prompt('Nouveau mot de passe:');
    if (!newPassword || newPassword.length < 6) {
        showAlert('Mot de passe trop court (minimum 6 caractères)', 'error');
        return;
    }

    const oldPassword = prompt('Ancien mot de passe:');
    if (!oldPassword) return;

    fetch(API_URL + '/auth/change-password', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + token
        },
        body: JSON.stringify({ oldPassword, newPassword })
    })
    .then(res => res.json())
    .then(data => {
        if (data.error) throw new Error(data.error);
        showAlert('Mot de passe changé avec succès', 'success');
    })
    .catch(err => showAlert(err.message, 'error'));
}

// ===== INITIALISATION =====
document.addEventListener('DOMContentLoaded', function() {
    // Attacher les event listeners aux formulaires
    document.getElementById('loginForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        await login();
    });

    document.getElementById('registerForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const pwd = document.getElementById('registerPassword').value;
        const pwd2 = document.getElementById('registerPassword2').value;
        if (pwd !== pwd2) {
            showAlert('Les mots de passe ne correspondent pas', 'error');
            return;
        }
        await register();
    });

    document.getElementById('entryForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        await addEntry();
    });

    // Vérifier si l'utilisateur est déjà connecté
    if (token) {
        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            const now = Date.now() / 1000;
            if (payload.exp > now) {
                currentUser = {
                    id: payload.id,
                    username: payload.username,
                    email: payload.email,
                    role: payload.role
                };
                showApp();
                return;
            }
        } catch (e) {
            localStorage.removeItem('token');
        }
    }

    // Afficher le panneau de connexion
    document.getElementById('auth').style.display = 'block';
    showAuthPanel('login');
});