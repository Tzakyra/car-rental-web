// ==================== KONFIGURATION ====================
const API_BASE_URL = 'http://localhost:8080/api/v1';

// ==================== STATE HANTERING ====================
const state = {
    user: null,
    isAdmin: false,
    credentials: null, // För Basic Auth
    cars: [],
    bookings: [],
    users: [],
    currentPage: 'home'
};

// ==================== THEME TOGGLE ====================
function toggleTheme() {
    const body = document.body;
    const themeIcon = document.querySelector('.theme-icon');
    
    if (body.classList.contains('theme--light')) {
        body.classList.remove('theme--light');
        themeIcon.textContent = '☀️';
        localStorage.setItem('theme', 'dark');
    } else {
        body.classList.add('theme--light');
        themeIcon.textContent = '🌙';
        localStorage.setItem('theme', 'light');
    }
}

// Ladda sparat tema vid sidladdning
function loadTheme() {
    const savedTheme = localStorage.getItem('theme');
    const themeIcon = document.querySelector('.theme-icon');
    
    if (savedTheme === 'light') {
        document.body.classList.add('theme--light');
        if (themeIcon) themeIcon.textContent = '🌙';
    } else {
        if (themeIcon) themeIcon.textContent = '☀️';
    }
}

// ==================== BILMAPPNING ====================
const carImageMap = {
    'corvette': 'corvetteZ06.jpg',
    'bmw': 'BMWM440I.jpg',
    'skoda superb': 'skodaSuperb.jpg',
    'skoda enyaq': 'skodaEnyaq.jpg',
    'peugeot': 'peugeotTraveller.jpg',
    'traveller': 'peugeotTraveller.jpg',
    'mercedes': 'MercedesBenzMarcoPolo300.jpg',
    'marco polo': 'MercedesBenzMarcoPolo300.jpg',
    'nissan': 'nissanJuke.jpg',
    'juke': 'nissanJuke.jpg',
    'volkswagen': 'volkswagenBuzz.jpg',
    'buzz': 'volkswagenBuzz.jpg',
    'default': 'default-car.jpg'
};

// Cache för bilnamn -> bildsökväg
const imageCache = new Map();

function getCarImage(carName, carModel = '') {
    const cacheKey = `${carName}-${carModel}`;
    // Kolla cache först
    if (imageCache.has(cacheKey)) {
        return imageCache.get(cacheKey);
    }
    
    const lowerName = carName.toLowerCase();
    const lowerModel = carModel.toLowerCase();
    const fullName = `${lowerName} ${lowerModel}`.trim();
    
    let imagePath = 'frontend/images/default-car.jpg'; // Fallbackbild
    
    // Sortera nycklar efter längd (längst först) för att matcha mer specifika namn först
    const sortedKeys = Object.keys(carImageMap).sort((a, b) => b.length - a.length);
    
    for (const key of sortedKeys) {
        if (fullName.includes(key) || lowerName.includes(key)) {
            imagePath = `frontend/images/${carImageMap[key]}`;
            break;
        }
    }
    
    // Spara i cache
    imageCache.set(cacheKey, imagePath);
    return imagePath;
}

// ==================== HJÄLPFUNKTIONER ====================
function showError(message, elementId = 'login-error') {
    const errorElement = document.getElementById(elementId);
    if (errorElement) {
        errorElement.textContent = message;
        errorElement.style.display = 'block';
    }
}

function clearError(elementId = 'login-error') {
    const errorElement = document.getElementById(elementId);
    if (errorElement) {
        errorElement.textContent = '';
        errorElement.style.display = 'none';
    }
}

// Meddelandemodal
function showMessage(title, message, type = 'info') {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.style.display = 'block';
    
    const iconMap = {
        'success': '✅',
        'error': '❌',
        'info': 'ℹ️',
        'warning': '⚠️'
    };
    
    modal.innerHTML = `
        <div class="modal-content">
            <h2 style="text-align: center;">${iconMap[type]} ${title}</h2>
            <p style="text-align: center; margin: 20px 0;">${message}</p>
            <div style="text-align: center;">
                <button class="btn-primary" onclick="this.closest('.modal').remove()">OK</button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
    
    // Stäng vid klick utanför
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.remove();
        }
    });
}

// Toast-notifikation (liten alert som försvinner automatiskt)
function showToast(message, type = 'info', duration = 4000) {
    // Skapa container om den inte finns
    let container = document.querySelector('.alert-container');
    if (!container) {
        container = document.createElement('div');
        container.className = 'alert-container';
        document.body.appendChild(container);
    }
    
    // Skapa alert
    const alert = document.createElement('div');
    alert.className = `alert alert-${type} alert-dismissible`;
    alert.innerHTML = `
        ${message}
        <button class="alert-close" onclick="this.parentElement.remove()">×</button>
    `;
    
    container.appendChild(alert);
    
    // Ta bort automatiskt efter duration
    setTimeout(() => {
        alert.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => alert.remove(), 300);
    }, duration);
}

// Lägg till slideOut animation
const style = document.createElement('style');
style.textContent = `
    @keyframes slideOut {
        from {
            opacity: 1;
            transform: translateX(0);
        }
        to {
            opacity: 0;
            transform: translateX(100%);
        }
    }
`;
document.head.appendChild(style);

// Bekräftelsedialog
function showConfirm(title, message, onConfirm, onCancel = null) {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.style.display = 'block';
    
    modal.innerHTML = `
        <div class="modal-content">
            <h2>⚠️ ${title}</h2>
            <p style="margin: 20px 0;">${message}</p>
            <div style="display: flex; gap: 10px; justify-content: center;">
                <button class="btn-success" id="confirm-yes">Ja</button>
                <button class="btn-secondary" id="confirm-no">Avbryt</button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
    
    // Hantera bekräftelse
    modal.querySelector('#confirm-yes').addEventListener('click', () => {
        modal.remove();
        if (onConfirm) onConfirm();
    });
    
    // Hantera avbryt
    modal.querySelector('#confirm-no').addEventListener('click', () => {
        modal.remove();
        if (onCancel) onCancel();
    });
    
    // Stäng vid klick utanför (räknas som avbryt)
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.remove();
            if (onCancel) onCancel();
        }
    });
}

// ==================== API FUNKTIONER ====================
async function apiCall(endpoint, options = {}) {
    const defaultOptions = {
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json'
        }
    };

    // Lägg till Basic Auth om användaren är inloggad
    if (state.credentials) {
        defaultOptions.headers['Authorization'] = 'Basic ' + state.credentials;
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...defaultOptions,
        ...options,
        headers: {
            ...defaultOptions.headers,
            ...options.headers
        }
    });

    // Om 401, logga ut användaren
    if (response.status === 401) {
        if (state.user) {
            state.user = null;
            state.isAdmin = false;
            updateUIAfterLogout();
            openModal('login-modal');
        }
        throw new Error('Du måste logga in');
    }

    // Hantera 404 för /bookings/me som tom lista
    if (response.status === 404 && endpoint === '/bookings/me') {
        return [];
    }

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }

    // Hantera 204 No Content och 201 Created utan body
    if (response.status === 204 || response.status === 201) {
        return null;
    }

    // Kolla om svaret har content innan vi försöker parsa JSON
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
        return response.json();
    }
    
    // Om inget content-type eller inte JSON, returnera null
    return null;
}

// ==================== AUTH FUNKTIONER ====================
let isRegisterMode = false;

function toggleRegisterMode() {
    isRegisterMode = !isRegisterMode;
    const title = document.getElementById('auth-modal-title');
    const submitBtn = document.getElementById('auth-submit-btn');
    const toggleBtn = document.getElementById('toggle-register-btn');
    const registerFields = document.getElementById('register-fields');
    const demoText = document.getElementById('demo-text');
    
    // Hämta registreringsfälten
    const firstNameInput = document.getElementById('reg-firstName');
    const lastNameInput = document.getElementById('reg-lastName');
    const emailInput = document.getElementById('reg-email');
    const phoneInput = document.getElementById('reg-phone');
    
    if (isRegisterMode) {
        title.textContent = 'Skapa konto';
        submitBtn.textContent = 'Registrera';
        toggleBtn.textContent = 'Tillbaka till inloggning';
        registerFields.style.display = 'block';
        demoText.style.display = 'none';
        
        // Gör registreringsfälten obligatoriska
        firstNameInput.required = true;
        lastNameInput.required = true;
        emailInput.required = true;
        phoneInput.required = true;
    } else {
        title.textContent = 'Logga in';
        submitBtn.textContent = 'Logga in';
        toggleBtn.textContent = 'Skapa konto';
        registerFields.style.display = 'none';
        demoText.style.display = 'block';
        
        // Ta bort obligatorisk markering från registreringsfälten
        firstNameInput.required = false;
        lastNameInput.required = false;
        emailInput.required = false;
        phoneInput.required = false;
    }
    clearError();
}

async function register(username, password, firstName, lastName, email, phone) {
    // Trimma alla värden
    username = username?.trim();
    password = password?.trim();
    firstName = firstName?.trim();
    lastName = lastName?.trim();
    email = email?.trim();
    phone = phone?.trim();

    if (!username || !password || !firstName || !lastName || !email || !phone) {
        showToast('Alla fält är obligatoriska!', 'error');
        return false;
    }

    // Bekräftelse innan konto skapas
    return new Promise((resolve) => {
        showConfirm(
            'Skapa konto',
            `Vill du skapa kontot "${username}"?`,
            async () => {
                // Användaren klickade Ja
                const userData = {
                    username: username,
                    password: password,
                    firstName: firstName,
                    lastName: lastName,
                    email: email,
                    phone: phone,
                    role: 'ROLE_USER'
                };

                try {
                    await apiCall('/users', {
                        method: 'POST',
                        body: JSON.stringify(userData)
                    });
                    
                    showToast('Konto skapat! Loggar in...', 'success');
                    
                    // Återställ formuläret
                    document.getElementById('login-form').reset();
                    
                    // Växla tillbaka till login-läge
                    const title = document.getElementById('auth-modal-title');
                    const submitBtn = document.getElementById('auth-submit-btn');
                    const toggleBtn = document.getElementById('toggle-register-btn');
                    const registerFields = document.getElementById('register-fields');
                    const demoText = document.getElementById('demo-text');
                    
                    isRegisterMode = false;
                    title.textContent = 'Logga in';
                    submitBtn.textContent = 'Logga in';
                    toggleBtn.textContent = 'Skapa konto';
                    registerFields.style.display = 'none';
                    demoText.style.display = 'block';
                    clearError();
                    
                    // Logga in automatiskt efter registrering
                    const loginSuccess = await login(username, password);
                    resolve(loginSuccess);
                } catch (error) {
                    showToast('Kunde inte skapa konto: ' + error.message, 'error');
                    resolve(false);
                }
            },
            () => {
                // Användaren klickade Nej/Avbryt - stäng modal och gå till hemsidan
                closeModal('login-modal');
                showPage('home');
                
                // Återställ formuläret och läget
                document.getElementById('login-form').reset();
                const title = document.getElementById('auth-modal-title');
                const submitBtn = document.getElementById('auth-submit-btn');
                const toggleBtn = document.getElementById('toggle-register-btn');
                const registerFields = document.getElementById('register-fields');
                const demoText = document.getElementById('demo-text');
                
                isRegisterMode = false;
                title.textContent = 'Logga in';
                submitBtn.textContent = 'Logga in';
                toggleBtn.textContent = 'Skapa konto';
                registerFields.style.display = 'none';
                demoText.style.display = 'block';
                clearError();
                
                resolve(false);
            }
        );
    });
}

async function login(username, password) {
    try {
        // Skapa Basic Auth credentials
        const credentials = btoa(username + ':' + password);
        
        // Använd Basic Auth direkt för login
        const response = await fetch(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Basic ' + credentials
            },
            body: JSON.stringify({ username, password })
        });

        if (!response.ok) {
            throw new Error('Invalid credentials');
        }

        const data = await response.json();

        if (data.username) {
            state.user = data.username;
            state.isAdmin = data.isAdmin;
            state.credentials = credentials; // Spara för framtida API-anrop
            updateUIAfterLogin();
            closeModal('login-modal');
            isRegisterMode = false;
            showPage('home');
            return true;
        }
    } catch (error) {
        showToast('Ogiltigt användarnamn eller lösenord', 'error');
        return false;
    }
}

function logout() {
    state.user = null;
    state.isAdmin = false;
    state.credentials = null;
    updateUIAfterLogout();
    showPage('home');
}

function updateUIAfterLogin() {
    document.getElementById('login-btn').style.display = 'none';
    document.getElementById('user-info').style.display = 'flex';
    document.getElementById('username-display').textContent = state.user;
    document.getElementById('mybookings-link').style.display = 'block';
    
    if (state.isAdmin) {
        document.getElementById('admin-link').style.display = 'block';
    }
}

function updateUIAfterLogout() {
    document.getElementById('login-btn').style.display = 'block';
    document.getElementById('user-info').style.display = 'none';
    document.getElementById('mybookings-link').style.display = 'none';
    document.getElementById('admin-link').style.display = 'none';
}

// ==================== MODAL FUNKTIONER ====================
// Öppna och stäng modaler = stoppar allt annat tills du är klar med just det fönstret
function openModal(modalId) {
    document.getElementById(modalId).style.display = 'block';
}

function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
}

// ==================== SIDRENDERING ====================
function showPage(pageName) {
    state.currentPage = pageName;
    // Tvingar sidan att alltid scrolla till toppen av sidan
    window.scrollTo(0, 0);
    
    // Uppdatera aktiv nav-länk
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
        if (link.dataset.page === pageName) {
            link.classList.add('active');
        }
    });

    const mainContent = document.getElementById('main-content');
    
    switch(pageName) {
        case 'home':
            renderHomePage(mainContent);
            break;
        case 'cars':
        case 'cars-sport':
        case 'cars-electric':
        case 'cars-family':
        case 'cars-cab':
        case 'cars-kombi':
        case 'cars-halvkombi':
        case 'cars-sedan':
        case 'cars-suv':
            renderCarsPage(mainContent, pageName);
            break;
        case 'mybookings':
            if (!state.user) {
                openModal('login-modal');
                return;
            }
            renderMyBookingsPage(mainContent);
            break;
        case 'admin':
            if (!state.isAdmin) {
                mainContent.innerHTML = '<div class="text-center"><h2>Åtkomst nekad</h2><p>Du måste vara admin för att se denna sida.</p></div>';
                return;
            }
            renderAdminPage(mainContent);
            break;
        case 'contact':
            renderContactPage(mainContent);
            break;
        default:
            renderHomePage(mainContent);
    }
}

// ==================== HEM-SIDA ====================
function renderHomePage(container) {
    container.innerHTML = `
        <div class="hero-section">
            <h1>Välkommen till WigellDrive</h1>
            <p>Din pålitliga partner för biluthyrning</p>
            <button class="btn-primary" onclick="showPage('cars')">Bläddra bland våra bilar</button>
        </div>
        
        <div class="page-header">
            <h2 class="page-title">Varför välja oss?</h2>
        </div>
        
        <div class="cards-container">
            <div class="card">
                <div class="card-content">
                    <h3 class="card-title">🚗 Brett utbud</h3>
                    <p>Vi erbjuder allt från ekonomiska sedaner till lyxiga sportbilar och rymliga SUV:ar.</p>
                </div>
            </div>
            <div class="card">
                <div class="card-content">
                    <h3 class="card-title">💰 Bästa priset</h3>
                    <p>Konkurrenskraftiga priser och transparenta villkor utan dolda avgifter.</p>
                </div>
            </div>
            <div class="card">
                <div class="card-content">
                    <h3 class="card-title">⚡ Snabb service</h3>
                    <p>Boka online på några minuter och hämta din bil samma dag.</p>
                </div>
            </div>
        </div>
    `;
}

// ==================== BILSIDA ====================
async function renderCarsPage(container, filterType = 'cars') {
    try {
        const cars = await apiCall('/cars');
        state.cars = cars;

        let filteredCars = cars;
        let pageTitle = 'Alla bilar';

        if (filterType === 'cars-sport') {
            filteredCars = cars.filter(car => car.type.toLowerCase().includes('sport'));
            pageTitle = 'Sportbilar';
        } else if (filterType === 'cars-electric') {
            filteredCars = cars.filter(car => car.type.toLowerCase().includes('el'));
            pageTitle = 'Elbilar';
        } else if (filterType === 'cars-family') {
            filteredCars = cars.filter(car => car.type.toLowerCase().includes('familj'));
            pageTitle = 'Familjebilar';
        } else if (filterType === 'cars-cab') {
            filteredCars = cars.filter(car => car.type.toLowerCase().includes('cab'));
            pageTitle = 'Cab';
        } else if (filterType === 'cars-kombi') {
            filteredCars = cars.filter(car => car.type.toLowerCase().includes('kombi') && !car.type.toLowerCase().includes('halvkombi'));
            pageTitle = 'Kombi';
        } else if (filterType === 'cars-halvkombi') {
            filteredCars = cars.filter(car => car.type.toLowerCase().includes('halvkombi'));
            pageTitle = 'Halvkombi';
        } else if (filterType === 'cars-sedan') {
            filteredCars = cars.filter(car => car.type.toLowerCase().includes('sedan'));
            pageTitle = 'Sedan';
        } else if (filterType === 'cars-suv') {
            filteredCars = cars.filter(car => car.type.toLowerCase().includes('suv'));
            pageTitle = 'SUV';
        }

        container.innerHTML = `
            <div class="page-header">
                <h1 class="page-title">${pageTitle}</h1>
                <p class="page-description">Välj bland våra ${filteredCars.length} tillgängliga bilar</p>
            </div>

            <div class="filters-container">
                <div class="filter-group">
                    <label for="sort-select">Sortera:</label>
                    <select id="sort-select" onchange="sortCars(this.value)">
                        <option value="name-asc">Namn (A-Ö)</option>
                        <option value="name-desc">Namn (Ö-A)</option>
                        <option value="type-asc">Typ (A-Ö)</option>
                        <option value="type-desc">Typ (Ö-A)</option>
                        <option value="price-asc">Pris (Låg-Hög)</option>
                        <option value="price-desc">Pris (Hög-Låg)</option>
                    </select>
                </div>
            </div>

            <div id="cars-container" class="cards-container">
                ${renderCarCards(filteredCars)}
            </div>
        `;
    } catch (error) {
        container.innerHTML = `<div class="text-center"><p class="error-message">Kunde inte ladda bilar: ${error.message}</p></div>`;
    }
}

function renderCarCards(cars) {
    if (cars.length === 0) {
        return '<p class="text-center">Inga bilar tillgängliga.</p>';
    }

    return cars.map(car => {
        const imagePath = getCarImage(car.name, car.model);
        return `
        <div class="card car-card">
            <div class="card-image-container">
                <img src="${imagePath}" alt="${car.name}" class="card-image" loading="lazy">
                <div class="card-image-overlay"></div>
            </div>
            <div class="card-content">
                <h3 class="card-title">${car.name}</h3>
                <p class="card-subtitle">${car.model} - ${car.type}</p>
                
                <ul class="card-features">
                    <li>${car.feature1}</li>
                    <li>${car.feature2}</li>
                    <li>${car.feature3}</li>
                </ul>
                
                <div class="card-price">${car.price} kr/dag</div>
                
                ${car.booked 
                    ? '<span class="badge badge-danger">Upptagen</span>' 
                    : '<span class="badge badge-success">Tillgänglig</span>'
                }
                
                <div class="card-footer">
                    ${!car.booked 
                        ? `<button class="btn-primary" onclick="bookCar(${car.id})">Boka nu</button>` 
                        : '<button class="btn-secondary" disabled>Inte tillgänglig</button>'
                    }
                    <button class="btn-secondary btn-small" onclick="showCarDetails(${car.id})">Detaljer</button>
                </div>
            </div>
        </div>
    `;
    }).join('');
}

// Sorteringsfunktion Bilar
function sortCars(sortType) {
    const container = document.getElementById('cars-container');
    const [field, order] = sortType.split('-');
    
    let sortedCars = [...state.cars];
    
    sortedCars.sort((a, b) => {
        let aVal = a[field];
        let bVal = b[field];
        
        if (typeof aVal === 'string') {
            aVal = aVal.toLowerCase();
            bVal = bVal.toLowerCase();
        }
        
        if (order === 'asc') {
            return aVal > bVal ? 1 : -1;
        } else {
            return aVal < bVal ? 1 : -1;
        }
    });
    
    container.innerHTML = renderCarCards(sortedCars);
}

async function showCarDetails(carId) {
    const car = state.cars.find(c => c.id === carId);
    if (!car) return;

    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.style.display = 'block';
    modal.innerHTML = `
        <div class="modal-content">
            <span class="close" onclick="this.parentElement.parentElement.remove()">&times;</span>
            <h2>${car.name}</h2>
            <p><strong>Modell:</strong> ${car.model}</p>
            <p><strong>Typ:</strong> ${car.type}</p>
            <p><strong>Pris:</strong> ${car.price} kr/dag</p>
            <p><strong>Status:</strong> ${car.booked ? 'Upptagen' : 'Tillgänglig'}</p>
            <h3>Funktioner:</h3>
            <ul>
                <li>${car.feature1}</li>
                <li>${car.feature2}</li>
                <li>${car.feature3}</li>
            </ul>
            ${!car.booked ? `<button class="btn-primary mt-2" onclick="bookCar(${car.id}); this.parentElement.parentElement.remove();">Boka denna bil</button>` : ''}
        </div>
    `;
    document.body.appendChild(modal);
}

async function bookCar(carId) {
    if (!state.user) {
        openModal('login-modal');
        return;
    }

    const car = state.cars.find(c => c.id === carId);
    if (!car) return;

    // Skapa bokningsmodal
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.id = 'booking-modal';
    modal.style.display = 'block';
    modal.innerHTML = `
        <div class="modal-content">
            <span class="close" onclick="this.parentElement.parentElement.remove()">&times;</span>
            <h2>Boka ${car.name}</h2>
            <p class="card-subtitle">
            Bilmodell: ${car.model} <br> 
            Pris: ${car.price} kr/dag</p>
            
            <form id="booking-form" onsubmit="handleBookingSubmit(event, ${carId})">
                <div class="form-group">
                    <label for="booking-start-date">Startdatum:</label>
                    <input type="date" id="booking-start-date" name="startDate" required min="${new Date().toISOString().split('T')[0]}">
                </div>
                
                <div class="form-group">
                    <label for="booking-end-date">Slutdatum:</label>
                    <input type="date" id="booking-end-date" name="endDate" required min="${new Date().toISOString().split('T')[0]}">
                </div>
                
                <div id="booking-error" class="error-message" style="display: none;"></div>
                
                <div class="form-group">
                    <div id="booking-price-summary">
                        <p><strong>Antal dagar:</strong> <span id="booking-days">0</span></p>
                        <p><strong>Totalt pris:</strong> <span id="booking-total-price">0</span> kr</p>
                    </div>
                </div>
                
                <button type="submit" class="btn-primary">Bekräfta bokning</button>
                <button type="button" class="btn-secondary" onclick="this.closest('.modal').remove()">Avbryt</button>
            </form>
        </div>
    `;
    document.body.appendChild(modal);
    
    // Event listeners för att beräkna pris för bokning
    const startDateInput = document.getElementById('booking-start-date');
    const endDateInput = document.getElementById('booking-end-date');
    
    function calculatePrice() {
        const startDate = startDateInput.value;
        const endDate = endDateInput.value;
        
        if (startDate && endDate) {
            const start = new Date(startDate);
            const end = new Date(endDate);
            const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
            
            if (days > 0) {
                const totalPrice = days * car.price;
                document.getElementById('booking-days').textContent = days;
                document.getElementById('booking-total-price').textContent = totalPrice;
                document.getElementById('booking-price-summary').style.display = 'block';
            } else {
                document.getElementById('booking-price-summary').style.display = 'none';
            }
        }
    }
    
    startDateInput.addEventListener('change', calculatePrice);
    endDateInput.addEventListener('change', calculatePrice);
}

async function handleBookingSubmit(event, carId) {
    event.preventDefault();
    const form = event.target;
    const formData = new FormData(form);
    
    const startDate = formData.get('startDate');
    const endDate = formData.get('endDate');
    
    // Validera datum
    if (new Date(startDate) >= new Date(endDate)) {
        showToast('Slutdatum måste vara efter startdatum', 'error');
        return;
    }

    try {
        await apiCall('/bookings', {
            method: 'POST',
            body: JSON.stringify({
                carId: carId,
                fromDate: startDate,  
                toDate: endDate       
            })
        });

        form.closest('.modal').remove();
        showToast('Din bokning har bekräftats!', 'success');
        showPage('mybookings');
    } catch (error) {
        showToast('Bokning misslyckades: ' + error.message, 'error');
    }
}

// ==================== MINA BOKNINGAR ====================
async function renderMyBookingsPage(container) {
    try {
        // Hämta både bokningar och bilar
        const [bookings, cars] = await Promise.all([
            apiCall('/bookings/me'),
            apiCall('/cars')
        ]);
        state.cars = cars; // Uppdatera state med bilar
        renderBookingsContent(container, bookings);
    } catch (error) {
        // Om 404, betyder det att användaren inte har några bokningar
        if (error.message.includes('404')) {
            // Hämta bilar ändå för att state ska vara uppdaterat
            try {
                const cars = await apiCall('/cars');
                state.cars = cars;
            } catch (e) {
                // Ignorera fel vid hämtning av bilar
            }
            renderBookingsContent(container, []);
        } else {
            container.innerHTML = `<div class="text-center"><p class="error-message">Kunde inte ladda bokningar: ${error.message}</p></div>`;
        }
    }
}

function renderBookingsContent(container, bookings) {
    currentMyBookingsData = bookings;
    container.innerHTML = `
        <div class="page-header">
            <h1 class="page-title">Mina bokningar</h1>
            <p class="page-description">Här ser du alla dina bokningar</p>
        </div>

        ${bookings.length === 0 
            ? `
                <div class="panel panel-info text-center">
                    <h3>Inga bokningar finns tillgängliga</h3>
                    <p style="margin: 15px 0;">Du har inga aktiva bokningar för tillfället.</p>
                    <button class="btn-primary" onclick="showPage('cars')">Bläddra bland bilar</button>
                </div>
            `
            : `
                <div class="table-container">
                    <table>
                        <thead>
                            <tr>
                                <th class="sortable" onclick="sortMyBookings('id')">Boknings-ID</th>
                                <th class="sortable" onclick="sortMyBookings('carId')">Bil-ID</th>
                                <th class="sortable" onclick="sortMyBookings('carName')">Bil</th>
                                <th class="sortable" onclick="sortMyBookings('fromDate')">Startdatum</th>
                                <th class="sortable" onclick="sortMyBookings('toDate')">Slutdatum</th>
                                <th class="sortable" onclick="sortMyBookings('days')">Antal dagar</th>
                                <th class="sortable" onclick="sortMyBookings('totalPrice')">Totalt pris</th>
                                <th>Åtgärder</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${bookings.map(booking => {
                                const car = state.cars.find(c => c.id === booking.carId);
                                const carName = car ? `${car.name} ${car.model}` : 'Okänd bil';
                                
                                // Beräkna antal dagar och totalpris
                                const startDate = new Date(booking.fromDate);
                                const endDate = new Date(booking.toDate);
                                const days = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
                                const totalPrice = car ? days * car.price : 0;
                                
                                return `
                                <tr>
                                    <td>${booking.id}</td>
                                    <td>${booking.carId}</td>
                                    <td>${carName}</td>
                                    <td>${booking.fromDate}</td>
                                    <td>${booking.toDate}</td>
                                    <td>${days}</td>
                                    <td><strong>${totalPrice} kr</strong></td>
                                    <td>
                                        <button class="btn-primary btn-small" onclick="showPage('contact')">Kontakta oss</button>
                                    </td>
                                </tr>
                            `}).join('')}
                        </tbody>
                    </table>
                </div>
            `
        }
    `;
}

async function returnCar(bookingId) {
    showConfirm(
        'Returnera bil',
        'Vill du verkligen returnera denna bil?',
        async () => {
            try {
                await apiCall(`/bookings/return/${bookingId}`, {
                    method: 'PUT'
                });
                showToast('Bilen har returnerats!', 'success');
                showPage('mybookings');
            } catch (error) {
                showMessage('Fel uppstod', 'Kunde inte returnera bil: ' + error.message, 'error');
            }
        }
    );
}

// Sorteringslogik för Mina Bokningar
let myBookingsSortState = { field: null, order: 'asc' };
let currentMyBookingsData = [];

function sortMyBookings(field) {
    let order = 'asc';
    if (myBookingsSortState.field === field) {
        order = myBookingsSortState.order === 'asc' ? 'desc' : 'asc';
    }
    
    myBookingsSortState = { field, order };
    
    // Sortera datan
    const sortedBookings = [...currentMyBookingsData].sort((a, b) => {
        const car_a = state.cars.find(c => c.id === a.carId);
        const car_b = state.cars.find(c => c.id === b.carId);
        
        let aVal, bVal;
        
        if (field === 'carName') {
            aVal = car_a ? `${car_a.name} ${car_a.model}`.toLowerCase() : '';
            bVal = car_b ? `${car_b.name} ${car_b.model}`.toLowerCase() : '';
        } else if (field === 'days') {
            const startA = new Date(a.fromDate);
            const endA = new Date(a.toDate);
            const startB = new Date(b.fromDate);
            const endB = new Date(b.toDate);
            aVal = Math.ceil((endA - startA) / (1000 * 60 * 60 * 24));
            bVal = Math.ceil((endB - startB) / (1000 * 60 * 60 * 24));
        } else if (field === 'totalPrice') {
            const startA = new Date(a.fromDate);
            const endA = new Date(a.toDate);
            const daysA = Math.ceil((endA - startA) / (1000 * 60 * 60 * 24));
            const startB = new Date(b.fromDate);
            const endB = new Date(b.toDate);
            const daysB = Math.ceil((endB - startB) / (1000 * 60 * 60 * 24));
            aVal = car_a ? daysA * car_a.price : 0;
            bVal = car_b ? daysB * car_b.price : 0;
        } else {
            aVal = a[field];
            bVal = b[field];
        }
        
        if (typeof aVal === 'string') {
            aVal = aVal.toLowerCase();
            bVal = bVal.toLowerCase();
        }
        
        if (order === 'asc') {
            return aVal > bVal ? 1 : -1;
        } else {
            return aVal < bVal ? 1 : -1;
        }
    });
    
    // Rendera om tabellen med sorterad data
    const container = document.getElementById('main-content');
    renderBookingsContent(container, sortedBookings);
    
    // Uppdatera sorteringsindikatorer
    document.querySelectorAll('.table-container th').forEach(th => {
        th.classList.remove('sort-asc', 'sort-desc');
    });
    const headerCells = document.querySelectorAll('.table-container th.sortable');
    headerCells.forEach(th => {
        const onclick = th.getAttribute('onclick');
        if (onclick && onclick.includes(`'${field}'`)) {
            th.classList.add(`sort-${order}`);
        }
    });
}

// ==================== ADMIN SIDA ====================
async function renderAdminPage(container) {
    container.innerHTML = `
        <div class="page-header">
            <h1 class="page-title">Admin Panel</h1>
        </div>

        <div class="admin-section">
            <h2>Hantera bilar</h2>
            <div class="admin-actions">
                <button class="btn-success" onclick="showAddCarForm()">Lägg till bil</button>
                <button class="btn-primary" onclick="loadAdminCars()">Ladda om</button>
            </div>
            <div id="admin-cars-container"></div>
        </div>

        <div class="admin-section">
            <h2>Hantera användare</h2>
            <div class="admin-actions">
                <button class="btn-success" onclick="showAddUserForm()">Lägg till användare</button>
                <button class="btn-primary" onclick="loadAdminUsers()">Ladda om</button>
            </div>
            <div id="admin-users-container"></div>
        </div>

        <div class="admin-section">
            <h2>Alla bokningar</h2>
            <div class="admin-actions">
                <button class="btn-primary" onclick="loadAdminBookings()">Ladda om</button>
            </div>
            <div id="admin-bookings-container"></div>
        </div>
    `;

    loadAdminCars();
    loadAdminUsers();
    loadAdminBookings();
}

function renderAdminCarsTable(cars) {
    const container = document.getElementById('admin-cars-container');
    container.innerHTML = `
        <div class="table-container">
            <table>
                <thead>
                    <tr>
                        <th class="sortable" data-field="id" onclick="sortAdminTable('cars', 'id')">ID</th>
                        <th class="sortable" data-field="name" onclick="sortAdminTable('cars', 'name')">Namn</th>
                        <th class="sortable" data-field="model" onclick="sortAdminTable('cars', 'model')">Modell</th>
                        <th class="sortable" data-field="type" onclick="sortAdminTable('cars', 'type')">Typ</th>
                        <th class="sortable" data-field="price" onclick="sortAdminTable('cars', 'price')">Pris</th>
                        <th>Bokad</th>
                        <th>Åtgärder</th>
                    </tr>
                </thead>
                <tbody>
                    ${cars.map(car => `
                        <tr>
                            <td>${car.id}</td>
                            <td>${car.name}</td>
                            <td>${car.model}</td>
                            <td>${car.type}</td>
                            <td>${car.price} kr</td>
                            <td>${car.booked ? '<span class="badge badge-danger">Ja</span>' : '<span class="badge badge-success">Nej</span>'}</td>
                            <td>
                                <button class="btn-warning btn-small" onclick="editCar(${car.id})">Redigera</button>
                                <button class="btn-danger btn-small" onclick="deleteCar(${car.id})">Ta bort</button>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;
}

async function loadAdminCars() {
    try {
        const cars = await apiCall('/cars');
        state.cars = cars;
        renderAdminCarsTable(cars);
    } catch (error) {
        console.error('Error loading cars:', error);
    }
}

function renderAdminUsersTable(users) {
    const container = document.getElementById('admin-users-container');
    container.innerHTML = `
        <div class="table-container">
            <table>
                <thead>
                    <tr>
                        <th class="sortable" data-field="id" onclick="sortAdminTable('users', 'id')">ID</th>
                        <th class="sortable" data-field="username" onclick="sortAdminTable('users', 'username')">Användarnamn</th>
                        <th class="sortable" data-field="firstName" onclick="sortAdminTable('users', 'firstName')">Förnamn</th>
                        <th class="sortable" data-field="lastName" onclick="sortAdminTable('users', 'lastName')">Efternamn</th>
                        <th class="sortable" data-field="email" onclick="sortAdminTable('users', 'email')">E-post</th>
                        <th class="sortable" data-field="phone" onclick="sortAdminTable('users', 'phone')">Telefon</th>
                        <th>Roll</th>
                        <th>Åtgärder</th>
                    </tr>
                </thead>
                <tbody>
                    ${users.map(user => `
                        <tr>
                            <td>${user.id}</td>
                            <td>${user.username}</td>
                            <td>${user.firstName || 'N/A'}</td>
                            <td>${user.lastName || 'N/A'}</td>
                            <td>${user.email || 'N/A'}</td>
                            <td>${user.phone || 'N/A'}</td>
                            <td>${user.role}</td>
                            <td>
                                <button class="btn-warning btn-small" onclick="editUser(${user.id})">Redigera</button>
                                <button class="btn-danger btn-small" onclick="deleteUser(${user.id})">Ta bort</button>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;
}

async function loadAdminUsers() {
    try {
        const users = await apiCall('/users');
        state.users = users;
        renderAdminUsersTable(users);
    } catch (error) {
        console.error('Error loading users:', error);
    }
}

function renderAdminBookingsTable(bookings) {
    const container = document.getElementById('admin-bookings-container');
    container.innerHTML = `
        <div class="table-container">
            <table>
                <thead>
                    <tr>
                        <th class="sortable" data-field="id" onclick="sortAdminTable('bookings', 'id')">Boknings-ID</th>
                        <th class="sortable" data-field="userId" onclick="sortAdminTable('bookings', 'userId')">Användar-ID</th>
                        <th class="sortable" data-field="carId" onclick="sortAdminTable('bookings', 'carId')">Bil-ID</th>
                        <th class="sortable" data-field="fromDate" onclick="sortAdminTable('bookings', 'fromDate')">Startdatum</th>
                        <th class="sortable" data-field="toDate" onclick="sortAdminTable('bookings', 'toDate')">Slutdatum</th>
                        <th class="sortable" data-field="days" onclick="sortAdminTable('bookings', 'days')">Antal dagar</th>
                        <th class="sortable" data-field="totalPrice" onclick="sortAdminTable('bookings', 'totalPrice')">Totalt pris</th>
                        <th>Åtgärder</th>
                    </tr>
                </thead>
                <tbody>
                    ${bookings.map(booking => {
                        const car = state.cars.find(c => c.id === booking.carId);
                        
                        // Beräkna antal dagar och totalpris
                        const startDate = new Date(booking.fromDate);
                        const endDate = new Date(booking.toDate);
                        const days = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
                        const totalPrice = car ? days * car.price : 0;
                        
                        return `
                        <tr>
                            <td>${booking.id}</td>
                            <td>${booking.userId}</td>
                            <td>${booking.carId}</td>
                            <td>${booking.fromDate}</td>
                            <td>${booking.toDate}</td>
                            <td>${days}</td>
                            <td><strong>${totalPrice} kr</strong></td>
                            <td>
                                <button class="btn-danger btn-small" onclick="deleteBooking(${booking.id})">Ta bort</button>
                            </td>
                        </tr>
                    `}).join('')}
                </tbody>
            </table>
        </div>
    `;
}

async function loadAdminBookings() {
    try {
        const bookings = await apiCall('/bookings');
        state.bookings = bookings;
        renderAdminBookingsTable(bookings);
    } catch (error) {
        console.error('Error loading bookings:', error);
    }
}

// Sorteringslogik för Admin-tabeller
let sortState = {};

function sortAdminTable(tableType, field) {
    const currentSort = sortState[tableType] || { field: null, order: 'asc' };
    
    let order = 'asc';
    if (currentSort.field === field) {
        order = currentSort.order === 'asc' ? 'desc' : 'asc';
    }
    
    sortState[tableType] = { field, order };
    
    const data = state[tableType];
    data.sort((a, b) => {
        let aVal = a[field];
        let bVal = b[field];
        
        if (typeof aVal === 'string') {
            aVal = aVal.toLowerCase();
            bVal = bVal.toLowerCase();
        }
        
        if (order === 'asc') {
            return aVal > bVal ? 1 : -1;
        } else {
            return aVal < bVal ? 1 : -1;
        }
    });
    
    // Rendera om tabellen med sorterad data
    if (tableType === 'cars') {
        renderAdminCarsTable(data);
    } else if (tableType === 'users') {
        renderAdminUsersTable(data);
    } else if (tableType === 'bookings') {
        renderAdminBookingsTable(data);
    }
    
    // Uppdatera sorteringsindikatorer
    const headerCell = document.querySelector(`#admin-${tableType}-container th[data-field="${field}"]`);
    if (headerCell) {
        document.querySelectorAll(`#admin-${tableType}-container th`).forEach(th => {
            th.classList.remove('sort-asc', 'sort-desc');
        });
        headerCell.classList.add(`sort-${order}`);
    }
}

// ==================== ADMIN CRUD OPERATIONER ====================
function showAddCarForm() {
    // Samla alla unika features från befintliga bilar
    const allFeatures = new Set();
    state.cars.forEach(car => {
        if (car.feature1) allFeatures.add(car.feature1);
        if (car.feature2) allFeatures.add(car.feature2);
        if (car.feature3) allFeatures.add(car.feature3);
    });
    
    const featureOptions = Array.from(allFeatures).sort().map(f => `<option value="${f}">`).join('');
    
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.style.display = 'block';
    modal.innerHTML = `
        <div class="modal-content">
            <span class="close" onclick="this.parentElement.parentElement.remove()">&times;</span>
            <h2>Lägg till bil</h2>
            <form id="add-car-form" onsubmit="handleAddCar(event)">
                <div class="form-group">
                    <label>Namn:</label>
                    <input type="text" name="name" required>
                </div>
                <div class="form-group">
                    <label>Modell:</label>
                    <input type="text" name="model" required>
                </div>
                <div class="form-group">
                    <label>Typ:</label>
                    <select name="type" required>
                        <option value="El">El</option>
                        <option value="Familj">Familj</option>
                        <option value="Sport">Sport</option>
                        <option value="Kombi">Kombi</option>
                        <option value="Halvkombi">Halvkombi</option>
                        <option value="Sedan">Sedan</option>
                        <option value="Cab">Cab</option>
                        <option value="SUV">SUV</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>Funktion 1:</label>
                    <input type="text" name="feature1" list="features-list" required placeholder="Välj eller skriv egen...">
                </div>
                <div class="form-group">
                    <label>Funktion 2:</label>
                    <input type="text" name="feature2" list="features-list" required placeholder="Välj eller skriv egen...">
                </div>
                <div class="form-group">
                    <label>Funktion 3:</label>
                    <input type="text" name="feature3" list="features-list" required placeholder="Välj eller skriv egen...">
                </div>
                <datalist id="features-list">
                    ${featureOptions}
                </datalist>
                <div class="form-group">
                    <label>Pris (kr/dag):</label>
                    <input type="number" name="price" required>
                </div>
                <div class="form-group" style="margin-bottom: 20px;">
                    <label style="font-weight: 600; display: block; margin-bottom: 8px;">Bokad</label>
                    <label style="display: flex; align-items: center; gap: 8px; cursor: pointer;">
                        <input type="checkbox" name="booked" style="width: auto; cursor: pointer;">
                        <span>Bilen är för närvarande bokad</span>
                    </label>
                </div>
                <button type="submit" class="btn-success">Lägg till</button>
            </form>
        </div>
    `;
    document.body.appendChild(modal);
}

async function handleAddCar(event) {
    event.preventDefault();
    const form = event.target;
    const formData = new FormData(form);

    // Konvertera checkbox till boolean string
    formData.set('booked', formData.get('booked') === 'on' ? 'true' : 'false');

    try {
        const response = await fetch(`${API_BASE_URL}/cars`, {
            method: 'POST',
            credentials: 'include',
            body: formData  // Skicka FormData direkt
            // Ta INTE med Content-Type header - den sätts automatiskt för FormData
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const newCar = await response.json();
        
        form.closest('.modal').remove();
        showToast(`${newCar.name} har lagts till!`, 'success');
        loadAdminCars();
    } catch (error) {
        showMessage('Fel uppstod', 'Kunde inte lägga till bil: ' + error.message, 'error');
    }
}

async function editCar(carId) {
    const car = state.cars.find(c => c.id === carId);
    if (!car) return;

    // Samla alla unika features från befintliga bilar
    const allFeatures = new Set();
    state.cars.forEach(c => {
        if (c.feature1) allFeatures.add(c.feature1);
        if (c.feature2) allFeatures.add(c.feature2);
        if (c.feature3) allFeatures.add(c.feature3);
    });
    
    const featureOptions = Array.from(allFeatures).sort().map(f => `<option value="${f}">`).join('');

    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.style.display = 'block';
    modal.innerHTML = `
        <div class="modal-content">
            <span class="close" onclick="this.parentElement.parentElement.remove()">&times;</span>
            <h2>Redigera bil</h2>
            <form id="edit-car-form" onsubmit="handleEditCar(event, ${carId})">
                <div class="form-group">
                    <label>Namn:</label>
                    <input type="text" name="name" value="${car.name}" required>
                </div>
                <div class="form-group">
                    <label>Modell:</label>
                    <input type="text" name="model" value="${car.model}" required>
                </div>
                <div class="form-group">
                    <label>Typ:</label>
                    <select name="type" required>
                        <option value="El" ${car.type === 'El' ? 'selected' : ''}>El</option>
                        <option value="Familj" ${car.type === 'Familj' ? 'selected' : ''}>Familj</option>
                        <option value="Sport" ${car.type === 'Sport' ? 'selected' : ''}>Sport</option>
                        <option value="Kombi" ${car.type === 'Kombi' ? 'selected' : ''}>Kombi</option>
                        <option value="Halvkombi" ${car.type === 'Halvkombi' ? 'selected' : ''}>Halvkombi</option>
                        <option value="Sedan" ${car.type === 'Sedan' ? 'selected' : ''}>Sedan</option>
                        <option value="Cab" ${car.type === 'Cab' ? 'selected' : ''}>Cab</option>
                        <option value="SUV" ${car.type === 'SUV' ? 'selected' : ''}>SUV</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>Funktion 1:</label>
                    <input type="text" name="feature1" value="${car.feature1}" list="features-list-edit" required placeholder="Välj eller skriv egen...">
                </div>
                <div class="form-group">
                    <label>Funktion 2:</label>
                    <input type="text" name="feature2" value="${car.feature2}" list="features-list-edit" required placeholder="Välj eller skriv egen...">
                </div>
                <div class="form-group">
                    <label>Funktion 3:</label>
                    <input type="text" name="feature3" value="${car.feature3}" list="features-list-edit" required placeholder="Välj eller skriv egen...">
                </div>
                <datalist id="features-list-edit">
                    ${featureOptions}
                </datalist>
                <div class="form-group">
                    <label>Pris (kr/dag):</label>
                    <input type="number" name="price" value="${car.price}" required>
                </div>
                <div class="form-group" style="margin-bottom: 20px;">
                    <label style="font-weight: 600; display: block; margin-bottom: 8px;">Bokad</label>
                    <label style="display: flex; align-items: center; gap: 8px; cursor: pointer;">
                        <input type="checkbox" name="booked" ${car.booked ? 'checked' : ''} style="width: auto; cursor: pointer;">
                        <span>Bilen är för närvarande bokad</span>
                    </label>
                </div>
                <button type="submit" class="btn-warning">Uppdatera</button>
            </form>
        </div>
    `;
    document.body.appendChild(modal);
}

async function handleEditCar(event, carId) {
    event.preventDefault();
    const form = event.target;
    const formData = new FormData(form);

    const carData = {
        name: formData.get('name'),
        model: formData.get('model'),
        type: formData.get('type'),
        feature1: formData.get('feature1'),
        feature2: formData.get('feature2'),
        feature3: formData.get('feature3'),
        price: parseFloat(formData.get('price')),
        booked: formData.get('booked') === 'on'
    };

    try {
        await apiCall(`/cars/${carId}`, {
            method: 'PUT',
            body: JSON.stringify(carData)
        });
        
        form.closest('.modal').remove();
        showToast(`${carData.name} har uppdaterats!`, 'success');
        loadAdminCars();
    } catch (error) {
        showMessage('Fel uppstod', 'Kunde inte uppdatera bil: ' + error.message, 'error');
    }
}

async function deleteCar(carId) {
    const car = state.cars.find(c => c.id === carId);
    const carName = car ? car.name : `bil #${carId}`;
    
    showConfirm(
        'Ta bort bil',
        `Vill du verkligen ta bort ${carName}? Detta går inte att ångra.`,
        async () => {
            try {
                await apiCall(`/cars/${carId}`, {
                    method: 'DELETE'
                });
                showToast(`${carName} har tagits bort!`, 'success');
                loadAdminCars();
            } catch (error) {
                showMessage('Fel uppstod', 'Kunde inte ta bort bil: ' + error.message, 'error');
            }
        }
    );
}

function showAddUserForm() {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.style.display = 'block';
    modal.innerHTML = `
        <div class="modal-content">
            <span class="close" onclick="this.parentElement.parentElement.remove()">&times;</span>
            <h2>Lägg till användare</h2>
            <form id="add-user-form" onsubmit="handleAddUser(event)">
                <div class="form-group">
                    <label>Användarnamn:</label>
                    <input type="text" name="username" required>
                </div>
                <div class="form-group">
                    <label>Lösenord:</label>
                    <input type="password" name="password" required>
                </div>
                <div class="form-group">
                    <label>Förnamn:</label>
                    <input type="text" name="firstName">
                </div>
                <div class="form-group">
                    <label>Efternamn:</label>
                    <input type="text" name="lastName">
                </div>
                <div class="form-group">
                    <label>E-post:</label>
                    <input type="email" name="email">
                </div>
                <div class="form-group">
                    <label>Telefon:</label>
                    <input type="tel" name="phone" placeholder="0700123456">
                </div>
                <div class="form-group">
                    <label>Roll:</label>
                    <select name="role" required>
                        <option value="ROLE_USER">Användare</option>
                        <option value="ROLE_ADMIN">Admin</option>
                    </select>
                </div>
                <button type="submit" class="btn-success">Lägg till</button>
            </form>
        </div>
    `;
    document.body.appendChild(modal);
}

async function handleAddUser(event) {
    event.preventDefault();
    const form = event.target;
    const formData = new FormData(form);

    // Trimma alla värden för att ta bort whitespace
    const username = formData.get('username')?.trim();
    const password = formData.get('password')?.trim();
    const firstName = formData.get('firstName')?.trim();
    const lastName = formData.get('lastName')?.trim();
    const email = formData.get('email')?.trim();
    const phone = formData.get('phone')?.trim();

    // Validera att användarnamn och lösenord inte är tomma
    if (!username || !password) {
        showMessage('Obligatoriska fält saknas', 'Användarnamn och lösenord är obligatoriska!', 'warning');
        return;
    }

    const userData = {
        username: username,
        password: password,
        firstName: firstName || 'N/A',
        lastName: lastName || 'N/A',
        email: email || `${username}@example.com`,
        phone: phone || '0000000000',
        role: formData.get('role')
    };

    try {
        await apiCall('/users', {
            method: 'POST',
            body: JSON.stringify(userData)
        });
        
        form.closest('.modal').remove();
        showToast(`Användaren "${username}" har skapats!`, 'success');
        loadAdminUsers();
    } catch (error) {
        showMessage('Fel uppstod', 'Kunde inte lägga till användare: ' + error.message, 'error');
    }
}

async function editUser(userId) {
    const user = state.users.find(u => u.id === userId);
    if (!user) return;

    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.style.display = 'block';
    modal.innerHTML = `
        <div class="modal-content">
            <span class="close" onclick="this.parentElement.parentElement.remove()">&times;</span>
            <h2>Redigera användare</h2>
            <form id="edit-user-form" onsubmit="handleEditUser(event, ${userId})">
                <div class="form-group">
                    <label>Användarnamn:</label>
                    <input type="text" name="username" value="${user.username}" required>
                </div>
                <div class="form-group">
                    <label>Nytt lösenord (lämna tomt för att behålla):</label>
                    <input type="password" name="password">
                </div>
                <div class="form-group">
                    <label>Förnamn:</label>
                    <input type="text" name="firstName" value="${user.firstName || ''}">
                </div>
                <div class="form-group">
                    <label>Efternamn:</label>
                    <input type="text" name="lastName" value="${user.lastName || ''}">
                </div>
                <div class="form-group">
                    <label>E-post:</label>
                    <input type="email" name="email" value="${user.email || ''}">
                </div>
                <div class="form-group">
                    <label>Telefon:</label>
                    <input type="tel" name="phone" value="${user.phone || ''}">
                </div>
                <div class="form-group">
                    <label>Roll:</label>
                    <select name="role" required>
                        <option value="ROLE_USER" ${user.role === 'ROLE_USER' ? 'selected' : ''}>Användare</option>
                        <option value="ROLE_ADMIN" ${user.role === 'ROLE_ADMIN' ? 'selected' : ''}>Admin</option>
                    </select>
                </div>
                <button type="submit" class="btn-warning">Uppdatera</button>
            </form>
        </div>
    `;
    document.body.appendChild(modal);
}

async function handleEditUser(event, userId) {
    event.preventDefault();
    const form = event.target;
    const formData = new FormData(form);

    // Trimma alla värden
    const username = formData.get('username')?.trim();
    const firstName = formData.get('firstName')?.trim();
    const lastName = formData.get('lastName')?.trim();
    const email = formData.get('email')?.trim();
    const phone = formData.get('phone')?.trim();
    const password = formData.get('password')?.trim();

    const userData = {
        username: username || 'user',
        firstName: firstName || 'N/A',
        lastName: lastName || 'N/A',
        email: email || `${username}@example.com`,
        phone: phone || '0000000000',
        role: formData.get('role')
    };

    // Lägg bara till lösenord om det är ifyllt
    if (password) {
        userData.password = password;
    }

    try {
        await apiCall(`/users/${userId}`, {
            method: 'PUT',
            body: JSON.stringify(userData)
        });
        
        form.closest('.modal').remove();
        showToast(`${userData.username} har uppdaterats!`, 'success');
        loadAdminUsers();
    } catch (error) {
        showMessage('Fel uppstod', 'Kunde inte uppdatera användare: ' + error.message, 'error');
    }
}

async function deleteUser(userId) {
    const user = state.users.find(u => u.id === userId);
    const username = user ? user.username : `användare #${userId}`;
    
    showConfirm(
        'Ta bort användare',
        `Vill du verkligen ta bort ${username}? Detta går inte att ångra.`,
        async () => {
            try {
                await apiCall(`/users/${userId}`, {
                    method: 'DELETE'
                });
                showToast(`${username} har tagits bort!`, 'success');
                loadAdminUsers();
            } catch (error) {
                showMessage('Fel uppstod', 'Kunde inte ta bort användare: ' + error.message, 'error');
            }
        }
    );
}

async function deleteBooking(bookingId) {
    showConfirm(
        'Ta bort bokning',
        `Vill du verkligen ta bort bokning #${bookingId}? Detta går inte att ångra.`,
        async () => {
            try {
                await apiCall(`/bookings/${bookingId}`, {
                    method: 'DELETE'
                });
                showToast(`Bokning #${bookingId} har tagits bort!`, 'success');
                loadAdminBookings();
            } catch (error) {
                showMessage('Fel uppstod', 'Kunde inte ta bort bokning: ' + error.message, 'error');
            }
        }
    );
}

// ==================== KONTAKTSIDA ====================
function renderContactPage(container) {
    container.innerHTML = `
        <div class="page-header">
            <h1 class="page-title">Kontakta oss</h1>
            <p class="page-description">Vi finns här för att hjälpa dig</p>
        </div>

        <div class="cards-container">
            <div class="card">
                <div class="card-content">
                    <h3 class="card-title">📞 Telefon</h3>
                    <p>060-12 34 56</p>
                    <p class="help-text">Mån-Fre 08:00-17:00</p>
                </div>
            </div>
            <div class="card">
                <div class="card-content">
                    <h3 class="card-title">📧 E-post</h3>
                    <p>info@wigelldrive.se</p>
                    <p class="help-text">Vi svarar inom 24 timmar</p>
                </div>
            </div>
            <div class="card">
                <div class="card-content">
                    <h3 class="card-title">📌 Besök oss</h3>
                    <p>Bilgatan 123</p>
                    <p>123 45 Sundsvall</p>
                    <p class="help-text">Mån-Fre 08:00-17:00</p>
                </div>
            </div>
        </div>
    `;
}

// ==================== HÄNDELSELYSSNARE ====================
document.addEventListener('DOMContentLoaded', () => {
    // Login knapp
    document.getElementById('login-btn').addEventListener('click', () => {
        openModal('login-modal');
    });

    // Logout knapp
    document.getElementById('logout-btn').addEventListener('click', logout);

    // Login/Register formulär
    document.getElementById('login-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        clearError();
        
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        
        if (isRegisterMode) {
            const firstName = document.getElementById('reg-firstName').value;
            const lastName = document.getElementById('reg-lastName').value;
            const email = document.getElementById('reg-email').value;
            const phone = document.getElementById('reg-phone').value;
            
            await register(username, password, firstName, lastName, email, phone);
        } else {
            await login(username, password);
        }
    });

    // Stäng modal när man klickar på X
    document.querySelectorAll('.close').forEach(closeBtn => {
        closeBtn.addEventListener('click', (e) => {
            const modal = e.target.closest('.modal');
            if (modal) {
                modal.style.display = 'none';
            }
        });
    });

    // Stäng modal när man klickar utanför
    window.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal')) {
            e.target.style.display = 'none';
        }
    });

    // Navigationslänkar
    document.querySelectorAll('[data-page]').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const page = e.target.dataset.page;
            if (page) {
                showPage(page);
            }
        });
    });

    // Tema-växlingsknapp
    const themeToggleBtn = document.getElementById('theme-toggle');
    if (themeToggleBtn) {
        themeToggleBtn.addEventListener('click', toggleTheme);
    }

    // (lyssnare för Bilar i mobil-version verkar just nu blockera andra klickhändelser - ex, att stänga menyn med chevron)
    // Mobile dropdown toggle
    document.querySelectorAll('.nav-dropdown > .nav-link').forEach(link => {
        link.addEventListener('click', (e) => {
            // Bara toggle på mobil (om chevron är synlig)
            const chevron = link.querySelector('.dropdown-chevron');
            if (chevron && window.getComputedStyle(chevron).display !== 'none') {
                e.preventDefault();
                e.stopPropagation();
                const dropdown = link.closest('.nav-dropdown');
                dropdown.classList.toggle('open');
            }
        });
    });

    // Stäng dropdown när man klickar på ett menyalternativ (mobil)
    document.querySelectorAll('.dropdown-menu a').forEach(link => {
        link.addEventListener('click', () => {
            // Stäng alla öppna dropdowns
            document.querySelectorAll('.nav-dropdown.open').forEach(dropdown => {
                dropdown.classList.remove('open');
            });
        });
    });

    // Ladda sparat tema
    loadTheme();

    // Initial sidladdning
    showPage('home');
});
