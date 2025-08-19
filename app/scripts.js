// ==========================================================
// ส่วนที่ 1: ฟังก์ชันสำหรับดึงข้อมูลและจัดการ
// ==========================================================

// const strapiUrl = 'https://api.vertexplus99.com'; // <-- สำหรับเซิร์ฟเวอร์จริง
const strapiUrl = 'http://localhost:1337'; // <-- สำหรับทดสอบบนเครื่อง

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

// --- ฟังก์ชันสำหรับโหลด "บริการของเรา" (แสดงเฉพาะที่ไม่ใช่โปรโมชั่น) ---
function loadMainServices() {
    const servicesGrid = document.querySelector('#services .promo-grid');
    if (!servicesGrid) return;

    // กรองข้อมูล: เอาเฉพาะ Service ที่ "isPromotion" เป็น false (หรือไม่ถูกตั้งค่า)
    const servicesApiUrl = `${strapiUrl}/api/services?filters[isPromotion][$not]=true&populate=*&sort=displayOrder:asc`;

    fetch(servicesApiUrl)
        .then(response => {
            if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
            return response.json();
        })
        .then(responseData => {
            const services = responseData.data;
            servicesGrid.innerHTML = '';

            if (!services || services.length === 0) {
                servicesGrid.innerHTML = '<p>ยังไม่มีบริการในขณะนี้</p>';
                return;
            }

            services.forEach(service => {
                // นำตรรกะที่แข็งแรงของคุณกลับมาใช้
                const item = service.attributes || service;
                if (!item) return;

                let imageUrl = 'https://placehold.co/600x400/cccccc/333?text=Service';

                // นำการตรวจสอบ 2 ชั้นของคุณกลับมาใช้
                if (item.serviceImage && item.serviceImage.data && item.serviceImage.data.attributes) {
                    imageUrl = `${strapiUrl}${item.serviceImage.data.attributes.url}`;
                } else if (item.serviceImage && item.serviceImage.url) {
                    imageUrl = `${strapiUrl}${item.serviceImage.url}`;
                }

                // สร้างการ์ดดีไซน์เรียบง่ายสำหรับ "บริการ"
                const cardHTML = `
              <div class="promotion-card">
                        <div class="promo-card-header">
                            <img src="${imageUrl}" alt="${item.serviceName || 'โปรโมชั่น'}">
                        </div>
                        <div class="promo-card-body">
                            <h3>${item.serviceName}</h3>
                            <p class="promo-description">${item.description || ''}</p>
                            <div class="promo-price">
                                <span class="price-label">เริ่มต้นเพียง</span>
                                <span class="price-amount">${(item.price || 0).toLocaleString('en-US')}</span>
                                <span class="price-unit">บาท</span>
                            </div>

                        </div>
                        <div class="promo-card-footer">
                            <a href="add-order.html" class="btn btn-secondary nav-link">สนใจแพ็กเกจนี้</a>
                        </div>
                    </div>
                `;
                servicesGrid.innerHTML += cardHTML;
            });
        })
        .catch(error => {
            console.error('Error loading services:', error);
            servicesGrid.innerHTML = '<p>เกิดข้อผิดพลาดในการโหลดข้อมูลบริการ</p>';
        });
}

// --- ฟังก์ชันสำหรับโหลด "โปรโมชั่นสุดพิเศษ" (แสดงเฉพาะที่เป็นโปรโมชั่น) ---
function loadSpecialPromotions() {
    const promoGrid = document.querySelector('#special-promotions-container');
    if (!promoGrid) return;

    // กรองข้อมูล: เอาเฉพาะ Service ที่ "isPromotion" เป็น true
    const promoApiUrl = `${strapiUrl}/api/services?filters[isPromotion][$eq]=true&populate=*&sort=displayOrder:asc`;

    fetch(promoApiUrl)
        .then(response => {
            if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
            return response.json();
        })
        .then(responseData => {
            const promotions = responseData.data;
            promoGrid.innerHTML = '';

            if (!promotions || promotions.length === 0) {
                promoGrid.innerHTML = '<p>ยังไม่มีโปรโมชั่นในขณะนี้</p>';
                return;
            }

            promotions.forEach(promotion => {
                // ใช้ || promotion เพื่อความยืดหยุ่นสูงสุด
                const item = promotion.attributes || promotion;
                if (!item) return;

                let imageUrl = 'https://placehold.co/600x400/cccccc/333?text=Service';

                // นำการตรวจสอบ 2 ชั้นของคุณกลับมาใช้
                if (item.serviceImage && item.serviceImage.data && item.serviceImage.data.attributes) {
                    imageUrl = `${strapiUrl}${item.serviceImage.data.attributes.url}`;
                } else if (item.serviceImage && item.serviceImage.url) {
                    imageUrl = `${strapiUrl}${item.serviceImage.url}`;
                }
                const featuresHTML = renderFeatures(item.features);

                // สร้างการ์ดดีไซน์ละเอียดสำหรับ "โปรโมชั่น"
                const cardHTML = `
                    <div class="promotion-card">
                        <div class="promo-card-header">
                            <img src="${imageUrl}" alt="${item.serviceName || 'โปรโมชั่น'}">
                        </div>
                        <div class="promo-card-body">
                            <h3>${item.serviceName}</h3>
                            <p class="promo-description">${item.description || ''}</p>
                            <div class="promo-price">
                                <span class="price-label">เริ่มต้นเพียง</span>
                                <span class="price-amount">${(item.price || 0).toLocaleString('en-US')}</span>
                                <span class="price-unit">บาท</span>
                            </div>
                            ${featuresHTML}
                        </div>
                        <div class="promo-card-footer">
                            <a href="add-order.html" class="btn btn-secondary nav-link">สนใจแพ็กเกจนี้</a>
                        </div>
                    </div>
                `;
                promoGrid.innerHTML += cardHTML;
            });
        })
        .catch(error => {
            console.error('Error loading promotions:', error);
            promoGrid.innerHTML = '<p>เกิดข้อผิดพลาดในการโหลดข้อมูลโปรโมชั่น</p>';
        });
}

// --- ฟังก์ชันสำหรับจัดการ "หน้าสร้าง Order" (เวอร์ชันสมบูรณ์) ---
function handleNewOrderPage() {
    const orderForm = document.getElementById('new-order-form');
    if (!orderForm) return;

    const packageSelect = document.getElementById('order-package-select');
    const fileInput = document.getElementById('citizenIdImage');
    const imagePreview = document.getElementById('imagePreview');

    // --- ส่วนดึงข้อมูลแพ็กเกจ (ส่วนนี้ถูกต้องแล้ว) ---
    let allServices = [];
    fetch(`${strapiUrl}/api/services?populate=*`)
        .then(res => res.json())
        .then(response => {
            allServices = response.data;
            packageSelect.innerHTML = '<option value="">-- กรุณาเลือกแพ็กเกจ --</option>';
            allServices.forEach(service => {
                const item = service.attributes || service;
                if(!item || !item.serviceName) return;
                const option = document.createElement('option');
                option.value = service.id;
                option.textContent = `${item.serviceName} - ${item.price.toLocaleString('en-US')} บาท`;
                packageSelect.appendChild(option);
            });
        });

    // ... (ส่วน image preview event listener) ...

  orderForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        const feedbackDiv = document.getElementById('order-feedback');
        feedbackDiv.textContent = 'กำลังส่งข้อมูล...';
        feedbackDiv.style.display = 'block';

        const selectedServiceId = packageSelect.value;
        if (!selectedServiceId || !fileInput || fileInput.files.length === 0) {
            feedbackDiv.textContent = 'กรุณากรอกข้อมูลและแนบไฟล์รูปภาพให้ครบถ้วน';
            return;
        }

        // --- ★★★ สร้าง Payload ให้ตรงกับ Schema ทุกประการ ★★★ ---
        const dataPayload = {
            contactName: document.getElementById('order-contact-name').value,
            contactPhone: document.getElementById('order-contact-phone').value,
            installationAddress: document.getElementById('order-install-address').value,
            customerNotes: document.getElementById('order-notes').value,
            service: selectedServiceId // ส่ง ID ของ service เพื่อเชื่อม Relation
        };

        const formData = new FormData();
        formData.append('data', JSON.stringify(dataPayload));

        // --- ★★★ ตรวจสอบให้แน่ใจว่าชื่อฟิลด์ citizenId ตรงกับ Schema ★★★ ---
        formData.append('files.citizenId', fileInput.files[0]);

        try {
            const response = await fetch(`${strapiUrl}/api/orders`, {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                const errorData = await response.json();
                // แสดง Error ที่ละเอียดขึ้นจาก Strapi
                console.error('Strapi Error Details:', errorData.error.details);
                throw new Error(errorData.error.message || 'เกิดข้อผิดพลาดในการส่งข้อมูล');
            }

            const result = await response.json();
            feedbackDiv.textContent = `ส่งข้อมูลสำเร็จ! เลขที่อ้างอิงของคุณคือ ${result.data.id}`;
            orderForm.reset();
            if (imagePreview) imagePreview.style.display = 'none';

        } catch (error) {
            feedbackDiv.textContent = `เกิดข้อผิดพลาด: ${error.message}`;
        }
    });
}

// --- ฟังก์ชันสำหรับจัดการหน้า "ล็อกอินพนักงาน" ---
function handleEmployeeLogin() {
    const loginForm = document.getElementById('employee-login-form');
    if (!loginForm) return;

    const feedbackDiv = document.getElementById('login-feedback');

    loginForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        feedbackDiv.textContent = 'กำลังตรวจสอบ...';
        feedbackDiv.style.display = 'block';

        const formData = new FormData(loginForm);
        const data = Object.fromEntries(formData.entries());

        try {
            const response = await fetch(`${strapiUrl}/api/auth/local`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });

            const result = await response.json();

            if (result.error) {
                throw new Error(result.error.message);
            }

            // ตรวจสอบว่าเป็น Role "Employee" หรือไม่
            if (result.user && result.user.role.name === 'Employee') {
                localStorage.setItem('jwt_employee', result.jwt); // เก็บ Token แยก
                localStorage.setItem('employee', JSON.stringify(result.user));
                window.location.hash = 'dashboard.html'; // ส่งไปหน้า Dashboard
            } else {
                throw new Error('คุณไม่มีสิทธิ์เข้าถึงระบบนี้');
            }

        } catch (error) {
            feedbackDiv.textContent = `เกิดข้อผิดพลาด: ${error.message}`;
            feedbackDiv.className = 'form-feedback error';
        }
    });
}

// --- ฟังก์ชันสำหรับโหลด "รายการ Order ทั้งหมด" ---
async function loadAllOrders() {
    const tableBody = document.getElementById('orders-table-body');
    if (!tableBody) return;

    const token = localStorage.getItem('jwt_employee');
    if (!token) {
        alert('กรุณาเข้าสู่ระบบก่อน');
        window.location.hash = 'login-employee.html';
        return;
    }

    try {
        // ใช้ sort=createdAt:desc เพื่อเรียงตามเวลาล่าสุดก่อน
        const response = await fetch(`${strapiUrl}/api/orders?populate=service&sort=createdAt:desc`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!response.ok) throw new Error('ไม่สามารถดึงข้อมูลได้');

        const responseData = await response.json();
        const orders = responseData.data;

        tableBody.innerHTML = '';
        if (!orders || orders.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="5">ยังไม่มี Order ในระบบ</td></tr>';
            return;
        }

        orders.forEach(order => {
            const item = order.attributes;
            const row = `
                <tr>
                    <td>${order.id}</td>
                    <td>${item.contactName}</td>
                    <td>${new Date(item.createdAt).toLocaleDateString('th-TH')}</td>
                    <td>${item.Status_order || 'N/A'}</td>
                    <td><a href="#order-detail.html?id=${order.id}" class="nav-link">ดูข้อมูล</a></td>
                </tr>
            `;
            tableBody.innerHTML += row;
        });

    } catch (error) {
        console.error(error);
        tableBody.innerHTML = `<tr><td colspan="5">เกิดข้อผิดพลาด: ${error.message}</td></tr>`;
    }
}

// ==========================================================
// ส่วนที่ 2: โค้ดสำหรับควบคุมหน้าเว็บทั้งหมด (SPA Logic)
// ==========================================================
document.addEventListener('DOMContentLoaded', () => {

    const contentContainer = document.getElementById('app-content');
    const footerContainer = document.getElementById('page-footer');

    // --- ฟังก์ชันหลักสำหรับโหลดเนื้อหา (ไม่มีการเปลี่ยนแปลง) ---
    const loadContent = (page) => {
        fetch(page)
            .then(response => {
                if (!response.ok) throw new Error(`ไม่สามารถโหลดไฟล์ ${page} ได้`);
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
                } else if (page.includes('add-order.html')) {
                    handleNewOrderPage();
                } else if (page.includes('login-employee.html')) { // <-- เพิ่ม
                     handleEmployeeLogin();
                } else if (page.includes('dashboard.html')) { // <-- เพิ่ม
                      loadAllOrders();
            }
                // ... เพิ่มเงื่อนไขสำหรับหน้าอื่นๆ ที่นี่ ...
            })
            .catch(error => {
                console.error('Failed to load content:', error);
                contentContainer.innerHTML = '<h1>เกิดข้อผิดพลาดในการโหลดหน้าเว็บ</h1>';
            });
    };

    // --- Event Listeners สำหรับการคลิกลิงก์ (ไม่มีการเปลี่ยนแปลง) ---
    document.body.addEventListener('click', (event) => {
        const link = event.target.closest('a');
        if (!link) return;
        const href = link.getAttribute('href');
        if (href && !href.startsWith('#')) {
            event.preventDefault();
            window.location.hash = href;
        }
    });

    // --- จัดการการเปลี่ยนแปลง URL hash (แก้ไขใหม่ทั้งหมด) ---
    const handleHashChange = () => {
        let hash = window.location.hash.substring(1);

        // ถ้าไม่มี hash ใน URL ให้ไปที่หน้าหลัก
        if (!hash) {
            hash = 'home-content.html';
        }

        // --- จุดที่แก้ไขที่สำคัญที่สุด ---
        // ตรวจสอบก่อนว่า hash เป็นชื่อไฟล์ .html หรือไม่
        if (hash.endsWith('.html')) {
            // ถ้าใช่ ถึงจะสั่งให้โหลดเนื้อหา
            loadContent(hash);
        }
        // ถ้า hash เป็นอย่างอื่น (เช่น 'services') จะไม่ทำอะไรเลย ปล่อยให้ browser เลื่อนหน้าจอไปเอง

        // อัปเดต active class ที่เมนู
        document.querySelectorAll('.nav-link').forEach(item => item.classList.remove('active'));
        // หาลิงก์ที่ตรงกับ hash ที่เป็น .html เท่านั้น
        const activeLink = document.querySelector(`.nav-link[href='${hash.split('#')[0]}']`);
        if (activeLink) activeLink.classList.add('active');
    };

    window.addEventListener('hashchange', handleHashChange);

    // --- เริ่มต้นการทำงาน ---
    handleHashChange(); // โหลดเนื้อหาเริ่มต้นตาม URL
});
