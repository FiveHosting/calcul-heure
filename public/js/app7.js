const API_URL = window.location.origin + '/api';
let currentUser = null;
let selectedMonth = new Date().toISOString().slice(0, 7);

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
adminBtn.classList.remove('is-hidden');
adminBtn.hidden = !isAdmin;
adminBtn.style.display = isAdmin ? 'inline-flex' : 'none';
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
clearElement(document.getElementById('entriesList'));
clearElement(document.getElementById('usersList'));
clearElement(document.getElementById('monthlyStats'));
clearElement(document.getElementById('comparisonStats'));
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
syncMonthPicker();
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

function getPreviousMonth(month) {
const [year, m] = month.split('-').map(Number);
const date = new Date(year, m - 1, 1);
date.setMonth(date.getMonth() - 1);
return date.toISOString().slice(0, 7);
}

function getMonthLabel(month) {
const [year, m] = month.split('-').map(Number);
return new Date(year, m - 1, 1).toLocaleDateString('fr-FR', {
month: 'long',
year: 'numeric'
});
}

function updateMonthDisplay() {
const label = document.getElementById('monthDisplayLabel');
const sub = document.getElementById('monthDisplaySub');

if (label) label.textContent = getMonthLabel(selectedMonth);
if (sub) sub.textContent = 'Touchez pour choisir';
}

function syncMonthPicker() {
const monthPicker = document.getElementById('monthPicker');
if (monthPicker) monthPicker.value = selectedMonth;
updateMonthDisplay();
}

function openMonthPicker() {
const monthPicker = document.getElementById('monthPicker');
if (!monthPicker) return;

try {
if (typeof monthPicker.showPicker === 'function') {
monthPicker.showPicker();
return;
}
} catch (e) {}

monthPicker.removeAttribute('disabled');
monthPicker.focus();

try {
monthPicker.click();
} catch (e) {}
}

function renderSummaryCards(container, cards) {
clearElement(container);

cards.forEach((card) => {
const el = document.createElement('div');
el.className = 'summary-card';
el.appendChild(createTextElement('div', 'summary-label', card.label));
el.appendChild(createTextElement('div', 'summary-value', card.value));

if (card.subvalue) {
el.appendChild(
createTextElement(
'div',
`summary-subvalue ${card.subClass || 'neutral'}`,
card.subvalue
)
);
}

container.appendChild(el);
});
}

function aggregateEntriesForMonth(entries, month) {
const filtered = entries.filter((entry) => String(entry.date).startsWith(month));

return filtered.reduce((acc, entry) => {
acc.filtered.push(entry);
acc.count += 1;
acc.hours += Number(entry.totalHours || entry.hours || 0);
acc.salary += Number(entry.salary || 0);

const day = String(entry.date);
if (!acc.byDay[day]) acc.byDay[day] = { hours: 0, salary: 0 };

acc.byDay[day].hours += Number(entry.totalHours || entry.hours || 0);
acc.byDay[day].salary += Number(entry.salary || 0);

return acc;
}, {
filtered: [],
count: 0,
hours: 0,
salary: 0,
byDay: {}
});
}

function diffPercent(current, previous) {
if (!previous && !current) return { text: 'Aucune variation', className: 'neutral' };
if (!previous) return { text: 'Nouveau mois suivi', className: 'positive' };

const pct = ((current - previous) / previous) * 100;
const sign = pct > 0 ? '+' : '';

return {
text: `${sign}${pct.toFixed(1)}% vs mois précédent`,
className: pct >= 0 ? 'positive' : 'negative'
};
}

function roundRect(ctx, x, y, width, height, radius) {
const r = Math.min(radius, width / 2, height / 2);

ctx.beginPath();
ctx.moveTo(x + r, y);
ctx.arcTo(x + width, y, x + width, y + height, r);
ctx.arcTo(x + width, y + height, x, y + height, r);
ctx.arcTo(x, y + height, x, y, r);
ctx.arcTo(x, y, x + width, y, r);
ctx.closePath();
}

function drawBarChart(canvasId, labels, values, color, valueFormatter = (v) => String(v)) {
const canvas = document.getElementById(canvasId);
if (!canvas) return;

const ctx = canvas.getContext('2d');
const dpr = window.devicePixelRatio || 1;
const cssWidth = canvas.clientWidth || canvas.parentElement?.clientWidth || 600;
const cssHeight = 280;

canvas.width = cssWidth * dpr;
canvas.height = cssHeight * dpr;
canvas.style.height = cssHeight + 'px';
ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

ctx.clearRect(0, 0, cssWidth, cssHeight);
ctx.fillStyle = 'rgba(255,255,255,0.02)';
ctx.fillRect(0, 0, cssWidth, cssHeight);

if (!labels.length) {
ctx.fillStyle = '#94a3b8';
ctx.font = '14px Arial';
ctx.textAlign = 'center';
ctx.fillText('Aucune donnée pour cette période', cssWidth / 2, cssHeight / 2);
return;
}

const padding = { top: 24, right: 14, bottom: 52, left: 44 };
const chartWidth = cssWidth - padding.left - padding.right;
const chartHeight = cssHeight - padding.top - padding.bottom;
const maxValue = Math.max(...values, 1);
const stepX = chartWidth / labels.length;
const barWidth = Math.max(18, Math.min(46, stepX * 0.58));

ctx.strokeStyle = 'rgba(148,163,184,0.15)';
ctx.lineWidth = 1;

for (let i = 0; i <= 4; i += 1) {
const y = padding.top + (chartHeight / 4) * i;
ctx.beginPath();
ctx.moveTo(padding.left, y);
ctx.lineTo(cssWidth - padding.right, y);
ctx.stroke();

const labelValue = ((maxValue / 4) * (4 - i));
ctx.fillStyle = '#94a3b8';
ctx.font = '12px Arial';
ctx.textAlign = 'right';
ctx.fillText(valueFormatter(labelValue), padding.left - 8, y + 4);
}

values.forEach((value, index) => {
const x = padding.left + stepX * index + (stepX - barWidth) / 2;
const barHeight = (value / maxValue) * chartHeight;
const y = padding.top + chartHeight - barHeight;

ctx.fillStyle = color;
roundRect(ctx, x, y, barWidth, Math.max(barHeight, 2), 10);
ctx.fill();

ctx.fillStyle = '#e5eefc';
ctx.font = '12px Arial';
ctx.textAlign = 'center';
ctx.fillText(labels[index], x + barWidth / 2, cssHeight - 18);
});
}

function drawDonutChart(canvasId, data) {
const canvas = document.getElementById(canvasId);
if (!canvas) return;

const ctx = canvas.getContext('2d');
const dpr = window.devicePixelRatio || 1;
const cssWidth = canvas.clientWidth || canvas.parentElement?.clientWidth || 600;
const cssHeight = 280;

canvas.width = cssWidth * dpr;
canvas.height = cssHeight * dpr;
canvas.style.height = cssHeight + 'px';
ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
ctx.clearRect(0, 0, cssWidth, cssHeight);

const total = data.reduce((sum, item) => sum + item.value, 0);

if (!total) {
ctx.fillStyle = '#94a3b8';
ctx.font = '14px Arial';
ctx.textAlign = 'center';
ctx.fillText('Aucune donnée', cssWidth / 2, cssHeight / 2);
return;
}

const centerX = cssWidth / 2;
const centerY = cssHeight / 2 - 8;
const radius = Math.min(cssWidth, cssHeight) * 0.22;
const innerRadius = radius * 0.58;
let start = -Math.PI / 2;

data.forEach((item) => {
const angle = (item.value / total) * Math.PI * 2;
ctx.beginPath();
ctx.moveTo(centerX, centerY);
ctx.arc(centerX, centerY, radius, start, start + angle);
ctx.closePath();
ctx.fillStyle = item.color;
ctx.fill();
start += angle;
});

ctx.globalCompositeOperation = 'destination-out';
ctx.beginPath();
ctx.arc(centerX, centerY, innerRadius, 0, Math.PI * 2);
ctx.fill();
ctx.globalCompositeOperation = 'source-over';

ctx.fillStyle = '#e5eefc';
ctx.font = '700 20px Arial';
ctx.textAlign = 'center';
ctx.fillText(String(total), centerX, centerY + 6);
}

async function loadEntries() {
try {
const entries = await apiFetch('/entries');
const currentMonthData = aggregateEntriesForMonth(entries, selectedMonth).filtered;
const list = document.getElementById('entriesList');
clearElement(list);

if (!currentMonthData.length) {
list.appendChild(createTextElement('div', 'empty-state', 'Aucune entrée pour ce mois.'));
return;
}

currentMonthData
.sort((a, b) => String(b.date).localeCompare(String(a.date)))
.forEach((entry) => {
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

async function loadMonthlyStats() {
try {
const entries = await apiFetch('/entries');
const current = aggregateEntriesForMonth(entries, selectedMonth);
const previousMonth = getPreviousMonth(selectedMonth);
const previous = aggregateEntriesForMonth(entries, previousMonth);

const hoursTitle = document.getElementById('hoursChartTitle');
const salaryTitle = document.getElementById('salaryChartTitle');

if (hoursTitle) hoursTitle.textContent = getMonthLabel(selectedMonth);
if (salaryTitle) salaryTitle.textContent = getMonthLabel(selectedMonth);

renderSummaryCards(document.getElementById('monthlyStats'), [
{
label: 'Entrées',
value: String(current.count),
subvalue: getMonthLabel(selectedMonth),
subClass: 'neutral'
},
{
label: 'Heures',
value: `${current.hours.toFixed(1)}h`,
subvalue: `Moyenne ${(current.count ? current.hours / current.count : 0).toFixed(1)}h / entrée`,
subClass: 'neutral'
},
{
label: 'Salaire',
value: formatMoney(current.salary),
subvalue: `Moyenne ${formatMoney(current.count ? current.salary / current.count : 0)} / entrée`,
subClass: 'neutral'
}
]);

const diffEntries = diffPercent(current.count, previous.count);
const diffHours = diffPercent(current.hours, previous.hours);
const diffSalary = diffPercent(current.salary, previous.salary);

renderSummaryCards(document.getElementById('comparisonStats'), [
{
label: 'Évolution des entrées',
value: String(current.count - previous.count),
subvalue: diffEntries.text,
subClass: diffEntries.className
},
{
label: 'Évolution des heures',
value: `${(current.hours - previous.hours).toFixed(1)}h`,
subvalue: diffHours.text,
subClass: diffHours.className
},
{
label: 'Évolution du salaire',
value: formatMoney(current.salary - previous.salary),
subvalue: diffSalary.text,
subClass: diffSalary.className
}
]);

const byDay = Object.entries(current.byDay).sort(([a], [b]) => a.localeCompare(b));
const labels = byDay.map(([day]) => day.slice(-2));
const hoursValues = byDay.map(([, value]) => Number(value.hours.toFixed(2)));
const salaryValues = byDay.map(([, value]) => Number(value.salary.toFixed(2)));

drawBarChart('hoursChart', labels, hoursValues, 'rgba(139, 92, 246, 0.88)', (v) => `${v.toFixed(0)}h`);
drawBarChart('salaryChart', labels, salaryValues, 'rgba(34, 197, 94, 0.88)', (v) => `${v.toFixed(0)}€`);
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
const users = udata.users || [];

if (isMobile) {
users.forEach((user) => {
const card = document.createElement('div');
card.className = 'user-mobile-card';

const top = document.createElement('div');
top.className = 'user-mobile-top';

const identity = document.createElement('div');
identity.className = 'user-mobile-identity';
identity.appendChild(createTextElement('div', 'user-mobile-name', user.username));
identity.appendChild(createTextElement('div', 'user-mobile-email', user.email));

const badge = document.createElement('span');
badge.className = `badge ${user.role === 'admin' ? 'badge-admin' : 'badge-user'}`;
badge.textContent = user.role;

top.appendChild(identity);
top.appendChild(badge);
card.appendChild(top);

const stats = document.createElement('div');
stats.className = 'user-mobile-stats';

[
['Entrées', String(user.total_entries || 0)],
['Heures', `${Number(user.total_hours || 0).toFixed(1)}h`],
['Salaire', formatMoney(user.total_salary || 0)]
].forEach(([label, value]) => {
const stat = document.createElement('div');
stat.className = 'user-mobile-stat';
stat.innerHTML = `<span>${label}</span><strong>${value}</strong>`;
stats.appendChild(stat);
});

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
actions.appendChild(createTextElement('span', 'user-mobile-current', 'Compte actuel'));
}

card.appendChild(actions);
usersList.appendChild(card);
});
} else {
users.forEach((user) => {
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
currentAccount.style.color = 'var(--text-soft)';
actionsTd.appendChild(currentAccount);
}

tr.appendChild(actionsTd);
usersList.appendChild(tr);
});
}

const stats = await apiFetch('/admin/stats');
document.getElementById('totalUsers').textContent = stats.totalUsers;
document.getElementById('totalEntries').textContent = stats.totalEntries;
document.getElementById('totalHours').textContent = `${Number(stats.totalHours || 0).toFixed(1)}h`;
document.getElementById('totalSalary').textContent = formatMoney(stats.totalSalary || 0);

const adminCount = users.filter((u) => u.role === 'admin').length;
const userCount = users.filter((u) => u.role !== 'admin').length;

drawDonutChart('adminRoleChart', [
{ label: 'Admins', value: adminCount, color: 'rgba(139, 92, 246, 0.9)' },
{ label: 'Users', value: userCount, color: 'rgba(59, 130, 246, 0.88)' }
]);

const topUsers = [...users]
.sort((a, b) => Number(b.total_salary || 0) - Number(a.total_salary || 0))
.slice(0, 6);

drawBarChart(
'adminSalaryChart',
topUsers.map((u) => u.username.slice(0, 8)),
topUsers.map((u) => Number(u.total_salary || 0)),
'rgba(34, 197, 94, 0.88)',
(v) => `${v.toFixed(0)}€`
);
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

if (currentUser && userId === currentUser.id) {
const data = await apiFetch('/auth/me');
currentUser = data.user;
updateAdminButtonVisibility();
}
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

if (eventOrButton && eventOrButton.currentTarget) element = eventOrButton.currentTarget;
else if (eventOrButton && eventOrButton.getAttribute) element = eventOrButton;

if (!element) return;

const tab = element.getAttribute('data-tab');
if (!tab) return;

if (tab === 'admin' && (!currentUser || String(currentUser.role).toLowerCase() !== 'admin')) {
showAlert('Accès refusé : vous n\\'êtes pas administrateur', 'error');
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

function exportSelectedMonthToPdf() {
window.print();
}

function changeSelectedMonth(offset) {
const [year, month] = selectedMonth.split('-').map(Number);
const date = new Date(year, month - 1, 1);
date.setMonth(date.getMonth() + offset);
selectedMonth = date.toISOString().slice(0, 7);
syncMonthPicker();
loadEntries();
loadMonthlyStats();
}

async function logout() {
try {
await apiFetch('/auth/logout', { method: 'POST' });
} catch (e) {}

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

document.getElementById('registerToggle')?.addEventListener('click', () => switchAuthPanel('register'));
document.getElementById('loginToggle')?.addEventListener('click', () => switchAuthPanel('login'));
document.getElementById('changePasswordBtn')?.addEventListener('click', changePassword);
document.getElementById('exportPdfBtn')?.addEventListener('click', exportSelectedMonthToPdf);
document.getElementById('refreshAdminBtn')?.addEventListener('click', loadAdminData);
document.getElementById('logoutBtn')?.addEventListener('click', logout);

const monthPicker = document.getElementById('monthPicker');
const monthDisplayBtn = document.getElementById('monthDisplayBtn');
const prevMonthBtn = document.getElementById('prevMonthBtn');
const nextMonthBtn = document.getElementById('nextMonthBtn');

if (monthPicker) {
monthPicker.value = selectedMonth;

monthPicker.addEventListener('change', () => {
if (!monthPicker.value) return;
selectedMonth = monthPicker.value;
syncMonthPicker();
loadEntries();
loadMonthlyStats();
});
}

if (monthDisplayBtn) {
monthDisplayBtn.addEventListener('click', (e) => {
e.preventDefault();
openMonthPicker();
});
}

if (prevMonthBtn) {
prevMonthBtn.addEventListener('click', (e) => {
e.preventDefault();
changeSelectedMonth(-1);
});
}

if (nextMonthBtn) {
nextMonthBtn.addEventListener('click', (e) => {
e.preventDefault();
changeSelectedMonth(1);
});
}

document.querySelectorAll('.nav-tab').forEach((button) => {
button.addEventListener('click', () => showTab(button));
});

document.getElementById('closeChangePwdBtn')?.addEventListener('click', closeChangePwdModal);
document.getElementById('submitChangePwdBtn')?.addEventListener('click', submitChangePassword);

document.getElementById('changePwdModal')?.addEventListener('click', (event) => {
if (event.target === document.getElementById('changePwdModal')) {
closeChangePwdModal();
}
});
}

window.addEventListener('load', async () => {
bindUIEvents();
resetAuthUI();

const entryDate = document.getElementById('entryDate');
if (entryDate) entryDate.value = new Date().toISOString().split('T')[0];

syncMonthPicker();

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
loadMonthlyStats();

if (currentUser && String(currentUser.role).toLowerCase() === 'admin') {
loadAdminData();
}
});