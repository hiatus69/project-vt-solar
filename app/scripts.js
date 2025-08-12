// ==========================================================
// ส่วนที่ 1: ฟังก์ชันสำหรับดึงข้อมูลและจัดการ (นิยามไว้ก่อน)
// ==========================================================
const strapiUrl = 'http://localhost:1337';

// --- ฟังก์ชันใหม่: สำหรับ "แปล" สถานะเป็นภาษาไทย ---
function translateStatus(status) {
    switch (status) {
        case 'Waiting_in_queue':
            return 'รอการติดต่อ';
        case 'Accepting_order':
            return 'ยืนยันนัดหมาย';
        case 'Installing':
            return 'กำลังติดตั้ง';
        case 'Completed':
            return 'เสร็จสิ้น';
        case 'Cancel':
            return 'ยกเลิก';
        default:
            return status; // ถ้าเจอสถานะที่ไม่รู้จัก ก็ให้แสดงเป็นภาษาอังกฤษไปก่อน
    }
}

// --- ฟังก์ชันสำหรับแปลง Rich Text (ใช้ร่วมกัน) ---
function renderFeatures(featuresArray) {
    if (!featuresArray) return '';
    let featuresHtml = '<ul class="promo-features">';
    featuresArray.forEach(featureItem => {
        if (featureItem.type === 'paragraph') {
            featureItem.children.forEach(child => {
                if (child.type === 'text') {
                    featuresHtml += `<li>${child.text}</li>`;
                }
            });
        }
    });
    featuresHtml += '</ul>';
    return featuresHtml;
}

// --- ฟังก์ชันสำหรับโหลด "บริการของเรา" ---
function loadMainServices() {
    const servicesGrid = document.querySelector('#services .promo-grid');
    if (!servicesGrid) return;

    const servicesApiUrl = `${strapiUrl}/api/services?populate=*&sort=displayOrder:asc`;
    fetch(servicesApiUrl)
        .then(response => response.json())
        .then(response => {
            const services = response.data;
            servicesGrid.innerHTML = '';
            if (!services || services.length === 0) {
                servicesGrid.innerHTML = '<p>ยังไม่มีบริการในขณะนี้</p>';
                return;
            }
            services.forEach(service => {
                const item = service.attributes || service;
                let imageUrl = 'https://placehold.co/600x400/cccccc/333?text=Service';
                if (item.serviceImage && item.serviceImage.data) {
                    imageUrl = `${strapiUrl}${item.serviceImage.data.attributes.url}`;
                } else if (item.serviceImage && item.serviceImage.url) {
                    imageUrl = `${strapiUrl}${item.serviceImage.url}`;
                }
                const featuresHTML = renderFeatures(item.features);
                const cardHTML = `
                    <div class="promo-card">
                        <div class="promo-card-header">
                            <img src="${imageUrl}" alt="${item.serviceName || 'บริการ'}">
                        </div>
                        <div class="promo-card-body">
                            <h3>${item.serviceName}</h3>
                            <p class="promo-description">${item.description}</p>
                            <div class="promo-price">
                                <span class="price-label">ราคาปกติ</span>
                                <span class="price-amount">${(item.price || 0).toLocaleString('en-US')}</span>
                                <span class="price-unit">บาท</span>
                            </div>
                            ${featuresHTML}
                        </div>
                        <div class="promo-card-footer">
                            <a href="contact.html" class="btn btn-secondary nav-link">สนใจบริการนี้</a>
                        </div>
                    </div>
                `;
                servicesGrid.innerHTML += cardHTML;
            });
        });
}

// --- ฟังก์ชันสำหรับโหลด "โปรโมชั่นสุดพิเศษ" ---
function loadSpecialPromotions() {
    const promoGrid = document.querySelector('#special-promotions-container');
    if (!promoGrid) return;

    const promoApiUrl = `${strapiUrl}/api/promotions?populate=*&sort=displayOrder:asc`;
    fetch(promoApiUrl)
        .then(response => response.json())
        .then(response => {
            const promotions = response.data;
            promoGrid.innerHTML = '';
            if (!promotions || promotions.length === 0) {
                promoGrid.innerHTML = '<p>ยังไม่มีโปรโมชั่นในขณะนี้</p>';
                return;
            }
            promotions.forEach(promotion => {
                const item = promotion.attributes || promotion;
                let imageUrl = 'https://placehold.co/600x400/cccccc/333?text=No+Image';
                if (item.promoImage && item.promoImage.data) {
                    imageUrl = `${strapiUrl}${item.promoImage.data.attributes.url}`;
                } else if (item.promoImage && item.promoImage.url) {
                     imageUrl = `${strapiUrl}${item.promoImage.url}`;
                }
                const featuresHTML = renderFeatures(item.features);
                const cardHTML = `
                    <div class="promotion-card">
                        <div class="promo-card-header">
                            <img src="${imageUrl}" alt="ภาพโปรโมชั่น ${item.packageName || ''}">
                        </div>
                        <div class="promo-card-body">
                            <h3>${item.packageName}</h3>
                            <p class="promo-description">${item.description}</p>
                            <div class="promo-price">
                                <span class="price-label">เริ่มต้นเพียง</span>
                                <span class="price-amount">${(item.price || 0).toLocaleString('en-US')}</span>
                                <span class="price-unit">บาท</span>
                            </div>
                            ${featuresHTML}
                        </div>
                        <div class="promo-card-footer">
                            <a href="contact.html" class="btn btn-secondary nav-link">สนใจแพ็กเกจนี้</a>
                        </div>
                    </div>
                `;
                promoGrid.innerHTML += cardHTML;
            });
        });
}

// --- ฟังก์ชันสำหรับจัดการการสมัครสมาชิก (เวอร์ชันแก้ไขใหม่) ---
function handleRegistration() {
    const registerForm = document.getElementById('register-form');
    if (!registerForm) return;

    const feedbackDiv = document.getElementById('register-feedback');

    registerForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        feedbackDiv.className = 'form-feedback';
        feedbackDiv.textContent = 'กำลังดำเนินการ...';
        feedbackDiv.style.display = 'block';

        const formData = new FormData(registerForm);
        const data = Object.fromEntries(formData.entries());

        try {
            // ---- ขั้นตอนที่ 1: สมัครสมาชิกด้วยข้อมูลพื้นฐาน ----
            const registerResponse = await fetch(`${strapiUrl}/api/auth/local/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    username: data.email,
                    email: data.email,
                    password: data.password,
                }),
            });

            const registerData = await registerResponse.json();

            if (registerData.error) {
                // ถ้าการสมัครพื้นฐานล้มเหลว (เช่น อีเมลซ้ำ)
                throw new Error(registerData.error.message);
            }

            // ---- ขั้นตอนที่ 2: อัปเดตโปรไฟล์ด้วยข้อมูลที่เหลือ ----
            const { jwt, user } = registerData;
            
            const updateUserResponse = await fetch(`${strapiUrl}/api/users/${user.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${jwt}`, // ใช้ "บัตรผ่าน" ที่เพิ่งได้มา
                },
                body: JSON.stringify({
                    firstname: data.firstname,
                    lastname: data.lastname,
                    address: data.address,
                    phone_number: data.phone,
                }),
            });

            if (!updateUserResponse.ok) {
                 const updateError = await updateUserResponse.json();
                 throw new Error(updateError.error.message || 'สร้างบัญชีสำเร็จ แต่ไม่สามารถอัปเดตข้อมูลโปรไฟล์ได้');
            }

            // ---- ถ้าทุกอย่างสำเร็จ ----
            feedbackDiv.textContent = 'สมัครสมาชิกสำเร็จ! กรุณาเข้าสู่ระบบ';
            feedbackDiv.className = 'form-feedback success';
            setTimeout(() => { 
            
                window.location.href = loadContent('login.html');
            }, 2000);

        } catch (error) {
            console.error('Registration error:', error);
            feedbackDiv.textContent = error.message || 'เกิดข้อผิดพลาดในการสมัคร';
            feedbackDiv.className = 'form-feedback error';
        }
    });
}


// --- ฟังก์ชันสำหรับจัดการการเข้าสู่ระบบ ---
function handleLogin() {
    const loginForm = document.getElementById('login-form');
    if (!loginForm) return;

    const feedbackDiv = document.getElementById('login-feedback');

    loginForm.addEventListener('submit', (event) => {
        event.preventDefault();
        const formData = new FormData(loginForm);
        const data = Object.fromEntries(formData.entries());

        fetch(`${strapiUrl}/api/auth/local`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                identifier: data.email,
                password: data.password,
            }),
        })
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                feedbackDiv.textContent = 'อีเมลหรือรหัสผ่านไม่ถูกต้อง';
                feedbackDiv.className = 'form-feedback error';
                feedbackDiv.style.display = 'block';
            } else {
                localStorage.setItem('jwt', data.jwt);
                localStorage.setItem('user', JSON.stringify(data.user));
                window.location.href = 'index.html'; // โหลดหน้าใหม่เพื่อให้สถานะล็อกอินอัปเดตทั้งหมด
            }
        })
        .catch(error => {
            feedbackDiv.textContent = 'เกิดข้อผิดพลาดในการเชื่อมต่อ';
            feedbackDiv.className = 'form-feedback error';
            feedbackDiv.style.display = 'block';
        });
    });
}

// --- ฟังก์ชันสำหรับแสดงข้อมูลผู้ใช้ในหน้าโปรไฟล์ ---
function loadUserProfile() {
    const profileContainer = document.getElementById('user-profile-data');
    if (!profileContainer) return;

    const user = JSON.parse(localStorage.getItem('user'));

    if (user) {
        profileContainer.innerHTML = `
            <span class="label">ชื่อ-นามสกุล:</span>
            <span>${user.firstname || ''} ${user.lastname || ''}</span>
            <span class="label">อีเมล:</span>
            <span>${user.email}</span>
            <span class="label">ที่อยู่:</span>
            <span>${user.address || 'ยังไม่ได้ระบุ'}</span>
            <span class="label">เบอร์โทรศัพท์:</span>
            <span>${user.phone_number || 'ยังไม่ได้ระบุ'}</span>
        `;
    }
}

// --- ฟังก์ชันใหม่: สำหรับจัดการหน้าสร้างออเดอร์ ---
function handleNewOrderPage() {
    const user = JSON.parse(localStorage.getItem('user'));
    const token = localStorage.getItem('jwt');
    const orderForm = document.getElementById('new-order-form');
    const packageSelect = document.getElementById('order-package-select');

    if (!orderForm || !user || !token) {
        alert('เกิดข้อผิดพลาด: กรุณาเข้าสู่ระบบก่อน');
        window.location.hash = 'login.html';
        return;
    }

    // 1. ดึงข้อมูล Service ทั้งหมดมาใส่ใน Dropdown
    let allServices = []; // สร้างตัวแปรสำหรับเก็บข้อมูล service ทั้งหมด
    fetch(`${strapiUrl}/api/services`)
        .then(res => res.json())
        .then(response => {
            allServices = response.data;
            packageSelect.innerHTML = '<option value="">-- กรุณาเลือกแพ็กเกจ --</option>'; // เคลียร์ของเก่า
            allServices.forEach(service => {
                const item = service.attributes || service;
                const option = document.createElement('option');
                option.value = service.id; // เก็บ ID ของ service ไว้
                option.textContent = `${item.serviceName} - ${item.price.toLocaleString('en-US')} บาท`;
                packageSelect.appendChild(option);
            });
        });

    // 2. ดึงข้อมูลลูกค้ามาใส่ในฟอร์มเป็นค่าเริ่มต้น
    document.getElementById('order-contact-name').value = `${user.firstname || ''} ${user.lastname || ''}`;
    document.getElementById('order-install-address').value = user.address || '';
    document.getElementById('order-contact-phone').value = user.phone_number || '';
    
    // 3. จัดการการ submit ฟอร์ม
    orderForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        const feedbackDiv = document.getElementById('order-feedback');
        feedbackDiv.className = 'form-feedback';
        feedbackDiv.textContent = 'กำลังส่งคำขอ...';
        feedbackDiv.style.display = 'block';

        const selectedServiceId = packageSelect.value;
        if (!selectedServiceId) {
            feedbackDiv.textContent = 'กรุณาเลือกแพ็กเกจที่สนใจ';
            feedbackDiv.className = 'form-feedback error';
            return;
        }

        // หาข้อมูล service ที่ถูกเลือกจาก list ที่เราเก็บไว้
        const selectedService = allServices.find(s => s.id == selectedServiceId);
        const serviceAttributes = selectedService.attributes || selectedService;
        
        // ดึงข้อมูลล่าสุดจากฟอร์ม
        const contactName = document.getElementById('order-contact-name').value;
        const installationAddress = document.getElementById('order-install-address').value;
        const contactPhone = document.getElementById('order-contact-phone').value;
        const customerNotes = document.getElementById('order-notes').value;
        
        try {
    // ---- ไม่ต้องสร้าง Order Item ที่นี่แล้ว ----

    // ---- สร้าง Order หลัก โดยส่งข้อมูลทั้งหมดไปให้ Controller ใหม่ของเรา ----
    const orderResponse = await fetch(`${strapiUrl}/api/orders`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
            data: {
                // ส่งข้อมูลแพ็กเกจที่เลือกไปเป็นก้อนเดียว
                orderItemData: {
                    packageName: serviceAttributes.serviceName,
                    price: serviceAttributes.price,
                    features: serviceAttributes.features
                },
                // ส่งข้อมูลติดต่อที่กรอกไปเป็นอีกก้อน
                contactInfo: {
                    contactName: contactName,
                    installationAddress: installationAddress,
                    contactPhone: contactPhone,
                    customerNotes: customerNotes
                }
            }
        })
    });

            const orderData = await orderResponse.json();
            if (orderData.error) throw new Error(orderData.error.message);
            
            feedbackDiv.textContent = 'ส่งคำขอของคุณเรียบร้อยแล้ว!';
            feedbackDiv.className = 'form-feedback success';

            setTimeout(() => {
                window.location.hash = 'profile.html';
            }, 3000);

        } catch (error) {
            feedbackDiv.textContent = `เกิดข้อผิดพลาด: ${error.message}`;
            feedbackDiv.className = 'form-feedback error';
        }
    });
}

// --- ฟังก์ชันสำหรับดึงประวัติออเดอร์ของลูกค้า (เวอร์ชันแก้ไขสมบูรณ์) ---
async function loadUserOrders() {
    const ordersContainer = document.getElementById('user-orders-list');
    if (!ordersContainer) return;

    const token = localStorage.getItem('jwt');
    const userString = localStorage.getItem('user');

    if (!token || !userString) {
        ordersContainer.innerHTML = '<p>กรุณาเข้าสู่ระบบเพื่อดูประวัติการสั่งซื้อ</p>';
        return;
    }

    try {
        const user = JSON.parse(userString);
        const userId = user.id;

        // --- นี่คือบรรทัดที่ถูกต้อง 100% ---
        const filterUrl = `${strapiUrl}/api/orders?filters[customer][id][$eq]=${userId}&populate=order_item&sort=createdAt:desc`;

        const response = await fetch(filterUrl, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!response.ok) {
            throw new Error(`เกิดข้อผิดพลาดจากเซิร์ฟเวอร์: ${response.status}`);
        }

        const responseData = await response.json();
        const orders = responseData.data;

        if (!orders || orders.length === 0) {
            ordersContainer.innerHTML = '<p>คุณยังไม่มีประวัติการสั่งซื้อ</p>';
            return;
        }
        ordersContainer.innerHTML = '';
        orders.forEach(order => {
            const orderData = order.attributes || order;
            const orderCard = document.createElement('div');
            orderCard.className = 'order-card';
            const itemName = orderData.order_item?.data?.attributes?.packageName || 'ไม่มีข้อมูลสินค้า';
            const itemPrice = orderData.order_item?.data?.attributes?.price || 0;
            const thaiStatus = translateStatus(orderData.Status_order);
            orderCard.innerHTML = `
                <h3>Order ID: ${order.id}</h3>
                <p><strong>สถานะ:</strong> ${thaiStatus}</p>
                <p><strong>วันที่สั่ง:</strong> ${new Date(orderData.createdAt).toLocaleDateString('th-TH')}</p>
                <p><strong>สินค้าที่สั่ง:</strong> ${itemName}</p>
                <p><strong>ราคา:</strong> ${itemPrice.toLocaleString()} บาท</p>
            `;
            ordersContainer.appendChild(orderCard);
        });

    } catch (error) {
        ordersContainer.innerHTML = `<p class="error">เกิดข้อผิดพลาดในการดึงข้อมูล: ${error.message}</p>`;
    }
}

// ==========================================================
// ส่วนที่ 2: โค้ดสำหรับควบคุมหน้าเว็บทั้งหมด (SPA Logic)
// ==========================================================
document.addEventListener('DOMContentLoaded', () => {
    
    const contentContainer = document.getElementById('app-content');
    const footerContainer = document.getElementById('page-footer');
    const navLinksContainer = document.querySelector('.nav-links');

    // --- ฟังก์ชันสำหรับอัปเดตเมนูตามสถานะล็อกอิน ---
    function updateNavbar() {
        const userString = localStorage.getItem('user');
        if (!userString) {
            navLinksContainer.innerHTML = `
                <a href="home-content.html" class="nav-link">หน้าหลัก</a>
                <a href="about.html" class="nav-link">เกี่ยวกับเรา</a>
                <a href="contact.html" class="nav-link">ติดต่อเรา</a>
                <a href="register.html" class="nav-link">สมัครสมาชิก</a>
                <a href="login.html" class="nav-link">เข้าสู่ระบบ</a>
            `;
            return;
        }

        const user = JSON.parse(userString);
        // สมมติว่าเรายังไม่มี role employee ในตอนนี้
        navLinksContainer.innerHTML = `
            <a href="home-content.html" class="nav-link">หน้าหลัก</a>
            <a href="about.html" class="nav-link">เกี่ยวกับเรา</a>
            <a href="contact.html" class="nav-link">ติดต่อเรา</a>
            <a href="profile.html" class="nav-link">โปรไฟล์</a>
            <a href="#" id="logout-button" class="nav-link">ออกจากระบบ</a>
        `;
    }
    
    // --- ฟังก์ชันหลักสำหรับโหลดเนื้อหา ---
    const loadContent = (url) => {
        const page = url.split('#')[0];
        const id = url.split('#')[1];

        contentContainer.innerHTML = '<h2>กำลังโหลดเนื้อหา...</h2>';
        footerContainer.innerHTML = '';
        
        fetch(page)
            .then(response => {
                if (!response.ok) throw new Error('ไม่สามารถโหลดไฟล์เนื้อหาได้');
                return response.text();
            })
            .then(htmlString => {
                const parser = new DOMParser();
                const doc = parser.parseFromString(htmlString, 'text/html');
                const mainContent = doc.querySelector('main');
                const footerContent = doc.querySelector('footer');

                contentContainer.innerHTML = mainContent ? mainContent.innerHTML : 'เนื้อหาไม่ถูกต้อง';
                footerContainer.innerHTML = footerContent ? footerContent.innerHTML : '';
                
                // เรียกใช้ฟังก์ชันที่จำเป็นสำหรับหน้านั้นๆ
                if (page.includes('home-content.html')) {
                    loadMainServices();
                    loadSpecialPromotions();
                } else if (page.includes('register.html')) {
                    handleRegistration();
                } else if (page.includes('login.html')) {
                    handleLogin();
                } else if (page.includes('profile.html')) {
                    loadUserProfile(); // เรียกฟังก์ชันแสดงข้อมูลส่วนตัว
                    loadUserOrders();  // เรียกฟังก์ชันแสดงประวัติ Order
                } else if (url.includes('new-order.html')) {
                    handleNewOrderPage();
                }
            })
            .catch(error => {
                console.error('Failed to load content:', error);
                contentContainer.innerHTML = '<h1>เกิดข้อผิดพลาดในการโหลดหน้าเว็บ</h1>';
            });
    };

    // --- Event Listeners ---
    document.body.addEventListener('click', (event) => {
        const link = event.target.closest('.nav-link');
        
        if (link && !link.id.includes('logout-button')) {
            event.preventDefault();
            const href = link.getAttribute('href');
            window.location.hash = href;
        }

        if (event.target.matches('#logout-button')) {
            event.preventDefault();
            localStorage.removeItem('jwt');
            localStorage.removeItem('user');
            alert('ออกจากระบบสำเร็จ!');
            window.location.href = 'index.html';
        }
    });

    // ทำให้ปุ่ม back/forward และการเข้าเว็บด้วย URL hash ทำงานได้
    const handleHashChange = () => {
        let hash = window.location.hash.substring(1);
        if (!hash) {
            hash = localStorage.getItem('user') ? 'profile.html' : 'home-content.html';
        }
        loadContent(hash);

        // อัปเดต active class ที่เมนู
        document.querySelectorAll('.nav-link').forEach(item => item.classList.remove('active'));
        const activeLink = document.querySelector(`.nav-link[href='${hash}']`);
        if (activeLink) activeLink.classList.add('active');
    };

    window.addEventListener('hashchange', handleHashChange);

    // --- เริ่มต้นการทำงาน ---
    updateNavbar(); // อัปเดตเมนูก่อน
    handleHashChange(); // โหลดเนื้อหาเริ่มต้นตาม URL hash หรือสถานะล็อกอิน
});
