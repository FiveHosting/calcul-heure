const API_URL = window.location.origin + '/api';
let currentUser = null;

async function apiFetch(path, options = {}) {
    const config = {
        method: options.method || 'GET',
        credentials: 'same-origin',
        headers: { ...(options.headers || {}) }
    };

    if (options.body !== undefined) {
        config.headers['Content-Type'] = 'application/json';
        config.body = JSON.stringify(options.body);
    }

    const response = await fetch(API_URL + path, config);
    const contentType = response.headers.get('content-type') || '';
    const data = contentType.includes('application/json') ? await response.json() : null;

    if (!response.ok) {
        const error = new Error(data?.error || 'Erreur');
        error.status = response.status;
        error.data = data;
        error.path = path;
        throw error;
    }

    return data;
}

function formatMoney(value) {
    return `${Number(value || 0).toFixed(2)}€`;
}

function clearElement(el) {
    if (!el) return;
    while (el.firstChild) el.removeChild(el.firstChild);
}

function createTextElement(tag, className, text) {
    const el = document.createElement(tag);
    if (className) el.className = className;
    el.textContent = text;
    return el;
}

function createIconButton(className, iconClass, label, onClick) {
    const btn = document.createElement('button');
    btn.className = className;
    btn.type = 'button';
    btn.addEventListener('click', onClick);

    const icon = document.createElement('i');
    icon.className = iconClass;

    btn.appendChild(icon);
    btn.appendChild(document.createTextNode(' ' + label));
    return btn;
}

function switchAuthPanel(panel) {
    document.getElementById('loginPanel').classList.remove('active');
    document.getElementById('registerPanel').classList.remove('active');
    document.getElementById(panel + 'Panel').classList.add('active');
}

function updateAdminButtonVisibility() {
    const adminBtn = document.getElementById('adminBtn');
    if (!adminBtn) return;

    const isAdmin = !!currentUser && String(currentUser.role).toLowerCase() === 'admin';

    adminBtn.hidden = !isAdmin;
    adminBtn.style.display = isAdmin ? 'flex' : 'none';
    adminBtn.setAttribute('aria-hidden', String(!isAdmin));
}

function resetAuthUI() {
    document.getElementById('auth').style.display = 'flex';
    document.getElementById('app').classList.remove('active');

    document.getElementById('loginPanel').classList.add('active');
    document.getElementById('registerPanel').classList.remove('active');

    document.getElementById('headerUsername').textContent = '';
    document.getElementById('headerRole').textContent = '';

    document.getElementById('loginForm').reset();
    document.getElementById('registerForm').reset();

    const entriesList = document.getElementById('entriesList');
    const usersList = document.getElementById('usersList');
    const monthlyStats = document.getElementById('monthlyStats');

    clearElement(entriesList);
    clearElement(usersList);
    clearElement(monthlyStats);

    updateAdminButtonVisibility();
}

function showApp() {
    if (!currentUser) return;

    document.getElementById('auth').style.display = 'none';
    document.getElementById('app').classList.add('active');

    document.getElementById('headerUsername').textContent = currentUser.username || '';
    document.getElementById('headerRole').textContent =
        String(currentUser.role).toLowerCase() === 'admin' ? 'Administrateur' : 'Utilisateur';

    updateAdminButtonVisibility();

    loadEntries();
    loadMonthlyStats();
}

function showAlert(message, type = 'success') {
    const alert = document.createElement('div');
    alert.className = `alert ${type}`;
    alert.textContent = String(message);
    document.body.appendChild(alert);

    setTimeout(() => {
        alert.classList.add('hide');
        setTimeout(() => alert.remove(), 300);
    }, 3000);
}

async function loadEntries() {
    try {
        const entries = await apiFetch('/entries');
        const list = document.getElementById('entriesList');
        clearElement(list);

        entries.forEach((entry) => {
            const card = createTextElement('div', 'entry-card', '');

            const header = createTextElement('div', 'entry-card-header', '');
            header.appendChild(createTextElement('div', 'entry-card-date', entry.date));
            card.appendChild(header);

            card.appendChild(createTextElement('div', 'entry-card-time', `${entry.startTime} - ${entry.endTime}`));

            const details = createTextElement('div', 'entry-card-details', '');

            const duration = createTextElement('div', 'entry-detail', '');
            duration.appendChild(createTextElement('div', 'entry-detail-label', 'Durée'));
            duration.appendChild(createTextElement('div', 'entry-detail-value', `${entry.hours}h ${entry.minutes}m`));

            const rate = createTextElement('div', 'entry-detail', '');
            rate.appendChild(createTextElement('div', 'entry-detail-label', 'Taux'));
            rate.appendChild(createTextElement('div', 'entry-detail-value', `${entry.hourlyRate}€/h`));

            details.appendChild(duration);
            details.appendChild(rate);
            card.appendChild(details);

            const salaryBox = createTextElement('div', 'entry-card-salary', '');
            salaryBox.appendChild(createTextElement('div', 'entry-card-salary-label', 'Salaire'));
            salaryBox.appendChild(createTextElement('div', 'entry-card-salary-value', formatMoney(entry.salary)));
            card.appendChild(salaryBox);

            if (entry.description) {
                card.appendChild(createTextElement('div', 'entry-card-description', entry.description));
            }

            const actions = createTextElement('div', 'entry-card-actions', '');
            actions.appendChild(
                createIconButton('btn-delete', 'fas fa-trash', 'Supprimer', () => deleteEntry(entry.id))
            );

            card.appendChild(actions);
            list.appendChild(card);
        });
    } catch (err) {
        showAlert(err.message, 'error');
    }
}

async function deleteEntry(id) {
    if (!confirm('Supprimer cette entrée ?')) return;

    try {
        await apiFetch('/entries/' + id, { method: 'DELETE' });
        showAlert('Entrée supprimée', 'success');
        loadEntries();
        loadMonthlyStats();
    } catch (err) {
        showAlert(err.message, 'error');
    }
}

async function loadAdminData() {
    if (!currentUser || String(currentUser.role).toLowerCase() !== 'admin') return;

    try {
        const udata = await apiFetch('/admin/users');
        const usersList = document.getElementById('usersList');
        clearElement(usersList);

        const isMobile = window.innerWidth <= 768;

        if (isMobile) {
            (udata.users || []).forEach((user) => {
                const card = document.createElement('div');
                card.className = 'user-mobile-card';

                const top = document.createElement('div');
                top.className = 'user-mobile-top';

                const identity = document.createElement('div');
                identity.className = 'user-mobile-identity';

                const username = document.createElement('div');
                username.className = 'user-mobile-name';
                username.textContent = user.username;

                const email = document.createElement('div');
                email.className = 'user-mobile-email';
                email.textContent = user.email;

                identity.appendChild(username);
                identity.appendChild(email);

                const badge = document.createElement('span');
                badge.className = `badge ${user.role === 'admin' ? 'badge-admin' : 'badge-user'}`;
                badge.textContent = user.role;

                top.appendChild(identity);
                top.appendChild(badge);
                card.appendChild(top);

                const stats = document.createElement('div');
                stats.className = 'user-mobile-stats';

                const stat1 = document.createElement('div');
                stat1.className = 'user-mobile-stat';
                stat1.innerHTML = `<span>Entrées</span><strong>${String(user.total_entries || 0)}</strong>`;

                const stat2 = document.createElement('div');
                stat2.className = 'user-mobile-stat';
                stat2.innerHTML = `<span>Heures</span><strong>${Number(user.total_hours || 0).toFixed(1)}h</strong>`;

                const stat3 = document.createElement('div');
                stat3.className = 'user-mobile-stat';
                stat3.innerHTML = `<span>Salaire</span><strong>${formatMoney(user.total_salary || 0)}</strong>`;

                stats.appendChild(stat1);
                stats.appendChild(stat2);
                stats.appendChild(stat3);
                card.appendChild(stats);

                const actions = document.createElement('div');
                actions.className = 'user-mobile-actions';

                actions.appendChild(
                    createIconButton(
                        'btn-action',
                        'fas fa-user-tie',
                        user.role === 'admin' ? 'Retirer admin' : 'Admin',
                        () => changeUserRole(user.id, user.role, user.username)
                    )
                );

                if (user.id !== currentUser.id) {
                    actions.appendChild(
                        createIconButton(
                            'btn-action-delete',
                            'fas fa-trash',
                            'Supprimer',
                            () => deleteUser(user.id, user.username)
                        )
                    );
                } else {
                    const currentAccount = createTextElement('span', 'user-mobile-current', 'Compte actuel');
                    actions.appendChild(currentAccount);
                }

                card.appendChild(actions);
                usersList.appendChild(card);
            });
        } else {
            (udata.users || []).forEach((user) => {
                const tr = document.createElement('tr');

                tr.appendChild(createTextElement('td', '', user.username));
                tr.appendChild(createTextElement('td', '', user.email));

                const roleTd = document.createElement('td');
                roleTd.appendChild(
                    createTextElement(
                        'span',
                        `badge ${user.role === 'admin' ? 'badge-admin' : 'badge-user'}`,
                        user.role
                    )
                );
                tr.appendChild(roleTd);

                tr.appendChild(createTextElement('td', '', String(user.total_entries || 0)));
                tr.appendChild(createTextElement('td', '', `${Number(user.total_hours || 0).toFixed(1)}h`));
                tr.appendChild(createTextElement('td', '', formatMoney(user.total_salary || 0)));

                const actionsTd = document.createElement('td');
                actionsTd.style.display = 'flex';
                actionsTd.style.gap = '8px';
                actionsTd.style.flexWrap = 'wrap';

                actionsTd.appendChild(
                    createIconButton(
                        'btn-action',
                        'fas fa-user-tie',
                        user.role === 'admin' ? 'Retirer admin' : 'Admin',
                        () => changeUserRole(user.id, user.role, user.username)
                    )
                );

                if (user.id !== currentUser.id) {
                    actionsTd.appendChild(
                        createIconButton(
                            'btn-action-delete',
                            'fas fa-trash',
                            'Supprimer',
                            () => deleteUser(user.id, user.username)
                        )
                    );
                } else {
                    const currentAccount = createTextElement('span', '', 'Compte actuel');
                    currentAccount.style.fontSize = '12px';
                    currentAccount.style.color = 'var(--text-secondary)';
                    actionsTd.appendChild(currentAccount);
                }

                tr.appendChild(actionsTd);
                usersList.appendChild(tr);
            });
        }

        const stats = await apiFetch('/admin/stats');
        const elTotalUsers = document.getElementById('totalUsers');
        const elTotalEntries = document.getElementById('totalEntries');
        const elTotalHours = document.getElementById('totalHours');
        const elTotalSalary = document.getElementById('totalSalary');

        if (elTotalUsers) elTotalUsers.textContent = stats.totalUsers;
        if (elTotalEntries) elTotalEntries.textContent = stats.totalEntries;
        if (elTotalHours) elTotalHours.textContent = Number(stats.totalHours || 0).toFixed(1) + 'h';
        if (elTotalSalary) elTotalSalary.textContent = formatMoney(stats.totalSalary || 0);
    } catch (err) {
        showAlert(err.message, 'error');
    }
}

async function changeUserRole(userId, currentRole, username) {
    const newRole = currentRole === 'admin' ? 'user' : 'admin';
    if (!confirm(`Changer le rôle de ${username} en ${newRole} ?`)) return;

    try {
        await apiFetch('/admin/users/' + userId + '/role', {
            method: 'PUT',
            body: { role: newRole }
        });
        showAlert(`Rôle changé en ${newRole}`, 'success');
        loadAdminData();
    } catch (err) {
        showAlert(err.message, 'error');
    }
}

async function deleteUser(userId, username) {
    if (!confirm(`Êtes-vous sûr de vouloir supprimer ${username} ? Cette action est irréversible.`)) return;

    try {
        await apiFetch('/admin/users/' + userId, { method: 'DELETE' });
        showAlert(`Utilisateur ${username} supprimé`, 'success');
        loadAdminData();
    } catch (err) {
        showAlert(err.message, 'error');
    }
}

async function loadMonthlyStats() {
    try {
        const entries = await apiFetch('/entries');
        const months = {};

        entries.forEach((entry) => {
            const month = entry.date.substring(0, 7);
            if (!months[month]) months[month] = { hours: 0, salary: 0, count: 0 };
            months[month].hours += entry.totalHours || 0;
            months[month].salary += entry.salary || 0;
            months[month].count += 1;
        });

        const monthlyContainer = document.getElementById('monthlyStats');
        if (!monthlyContainer) return;

        clearElement(monthlyContainer);

        const sorted = Object.entries(months).sort(([a], [b]) => b.localeCompare(a));

        if (!sorted.length) {
            const p = createTextElement('p', '', 'Aucune entrée');
            p.style.color = 'var(--text-secondary)';
            monthlyContainer.appendChild(p);
            return;
        }

        sorted.forEach(([month, data]) => {
            const card = document.createElement('div');
            card.className = 'monthly-card';
            card.appendChild(createTextElement('div', 'monthly-card-title', month));

            const grid = document.createElement('div');
            grid.className = 'monthly-card-grid';

            const items = [
                ['Entrées:', String(data.count), 'var(--primary)'],
                ['Heures:', `${data.hours.toFixed(1)}h`, 'var(--primary)'],
                ['Salaire:', formatMoney(data.salary), 'var(--success)']
            ];

            items.forEach(([label, value, color]) => {
                const box = document.createElement('div');
                const spanLabel = createTextElement('span', 'monthly-card-label', label);
                const spanValue = createTextElement('span', 'monthly-card-value', value);
                spanValue.style.color = color;
                box.appendChild(spanLabel);
                box.appendChild(spanValue);
                grid.appendChild(box);
            });

            card.appendChild(grid);
            monthlyContainer.appendChild(card);
        });
    } catch (err) {
        showAlert(err.message, 'error');
    }
}

function changePassword() {
    document.getElementById('oldPasswordInput').value = '';
    document.getElementById('newPasswordInput').value = '';
    document.getElementById('confirmPasswordInput').value = '';
    document.getElementById('changePwdModal').classList.add('active');
}

function closeChangePwdModal() {
    document.getElementById('changePwdModal').classList.remove('active');
}

async function submitChangePassword() {
    const oldPwd = document.getElementById('oldPasswordInput').value;
    const newPwd = document.getElementById('newPasswordInput').value;
    const confirmPwd = document.getElementById('confirmPasswordInput').value;

    if (!oldPwd || !newPwd || !confirmPwd) {
        showAlert('Tous les champs sont obligatoires', 'error');
        return;
    }

    if (newPwd.length < 10) {
        showAlert('Le mot de passe doit contenir au moins 10 caractères', 'error');
        return;
    }

    if (confirmPwd !== newPwd) {
        showAlert('Les mots de passe ne correspondent pas', 'error');
        return;
    }

    try {
        await apiFetch('/auth/change-password', {
            method: 'POST',
            body: { oldPassword: oldPwd, newPassword: newPwd }
        });
        showAlert('Mot de passe changé avec succès !', 'success');
        closeChangePwdModal();
    } catch (err) {
        showAlert(err.message, 'error');
    }
}

function showTab(eventOrButton) {
    let element = null;

    if (eventOrButton && eventOrButton.currentTarget) {
        element = eventOrButton.currentTarget;
    } else if (eventOrButton && eventOrButton.getAttribute) {
        element = eventOrButton;
    }

    if (!element) return;

    const tab = element.getAttribute('data-tab');
    if (!tab) return;

    if (tab === 'admin' && (!currentUser || String(currentUser.role).toLowerCase() !== 'admin')) {
        showAlert('Accès refusé : vous n\'êtes pas administrateur', 'error');
        return;
    }

    document.querySelectorAll('.tab-content').forEach((el) => el.classList.remove('active'));
    document.querySelectorAll('.nav-tab').forEach((el) => el.classList.remove('active'));

    const tabContent = document.getElementById(tab + 'Tab');
    if (tabContent) tabContent.classList.add('active');
    element.classList.add('active');

    if (tab === 'admin') loadAdminData();
    if (tab === 'entries') {
        loadEntries();
        loadMonthlyStats();
    }
}

async function logout() {
    try {
        await apiFetch('/auth/logout', { method: 'POST' });
    } catch (e) {
        // On force quand même la déconnexion côté interface.
    }

    currentUser = null;
    resetAuthUI();
}

function bindUIEvents() {
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            try {
                const data = await apiFetch('/auth/login', {
                    method: 'POST',
                    body: {
                        username: document.getElementById('loginUsername').value,
                        password: document.getElementById('loginPassword').value
                    }
                });

                currentUser = data.user;
                showApp();
            } catch (err) {
                showAlert(err.message, 'error');
            }
        });
    }

    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const pwd = document.getElementById('registerPassword').value;
            const pwd2 = document.getElementById('registerPassword2').value;

            if (pwd !== pwd2) {
                showAlert('Les mots de passe ne correspondent pas', 'error');
                return;
            }

            try {
                const data = await apiFetch('/auth/register', {
                    method: 'POST',
                    body: {
                        username: document.getElementById('registerUsername').value,
                        email: document.getElementById('registerEmail').value,
                        password: pwd
                    }
                });

                currentUser = data.user;
                document.getElementById('registerForm').reset();
                showAlert('Compte créé avec succès !', 'success');
                showApp();
            } catch (err) {
                showAlert(err.message, 'error');
            }
        });
    }

    const entryForm = document.getElementById('entryForm');
    if (entryForm) {
        entryForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            try {
                await apiFetch('/entries', {
                    method: 'POST',
                    body: {
                        date: document.getElementById('entryDate').value,
                        startTime: document.getElementById('entryStartTime').value,
                        endTime: document.getElementById('entryEndTime').value,
                        hourlyRate: parseFloat(document.getElementById('entryHourlyRate').value),
                        description: document.getElementById('entryDescription').value
                    }
                });

                document.getElementById('entryForm').reset();
                document.getElementById('entryDate').value = new Date().toISOString().split('T')[0];

                showAlert('Entrée ajoutée !', 'success');
                loadEntries();
                loadMonthlyStats();

                const entriesBtn = document.querySelector('.nav-tab[data-tab="entries"]');
                if (entriesBtn) showTab(entriesBtn);
            } catch (err) {
                showAlert(err.message, 'error');
            }
        });
    }

    const registerToggle = document.getElementById('registerToggle');
    if (registerToggle) {
        registerToggle.addEventListener('click', () => switchAuthPanel('register'));
    }

    const loginToggle = document.getElementById('loginToggle');
    if (loginToggle) {
        loginToggle.addEventListener('click', () => switchAuthPanel('login'));
    }

    const changePasswordBtn = document.getElementById('changePasswordBtn');
    if (changePasswordBtn) {
        changePasswordBtn.addEventListener('click', changePassword);
    }

    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', logout);
    }

    document.querySelectorAll('.nav-tab').forEach((button) => {
        button.addEventListener('click', () => showTab(button));
    });

    const closeChangePwdBtn = document.getElementById('closeChangePwdBtn');
    if (closeChangePwdBtn) {
        closeChangePwdBtn.addEventListener('click', closeChangePwdModal);
    }

    const submitChangePwdBtn = document.getElementById('submitChangePwdBtn');
    if (submitChangePwdBtn) {
        submitChangePwdBtn.addEventListener('click', submitChangePassword);
    }

    const changePwdModal = document.getElementById('changePwdModal');
    if (changePwdModal) {
        changePwdModal.addEventListener('click', (event) => {
            if (event.target === changePwdModal) {
                closeChangePwdModal();
            }
        });
    }
}

window.addEventListener('load', async () => {
    bindUIEvents();
    resetAuthUI();

    const entryDate = document.getElementById('entryDate');
    if (entryDate) {
        entryDate.value = new Date().toISOString().split('T')[0];
    }

    try {
        const data = await apiFetch('/auth/me');
        currentUser = data.user;
        showApp();
    } catch (e) {
        if (e.status === 401) {
            currentUser = null;
            resetAuthUI();
            return;
        }

        currentUser = null;
        resetAuthUI();
        showAlert('Erreur lors de la vérification de session', 'error');
        console.error(e);
    }
});

window.addEventListener('resize', () => {
    if (currentUser && String(currentUser.role).toLowerCase() === 'admin') {
        loadAdminData();
    }
});