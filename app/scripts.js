// ==========================================================
// ส่วนที่ 1: ฟังก์ชันสำหรับดึงข้อมูลและจัดการ
// ==========================================================

const strapiUrl = 'https://api.vertexplus99.com'; // <-- สำหรับเซิร์ฟเวอร์จริง
// const strapiUrl = 'http://localhost:1337'; // <-- สำหรับทดสอบบนเครื่อง

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
    const file = fileInput.files[0];

    if (!selectedServiceId || !file) {
        feedbackDiv.textContent = 'กรุณากรอกข้อมูลและแนบไฟล์รูปภาพให้ครบถ้วน';
        return;
    }

    try {
        // --- ขั้นตอนที่ 1: อัปโหลดไฟล์ไปที่ Media Library ก่อน ---
        console.log("ขั้นตอนที่ 1: กำลังอัปโหลดไฟล์...");
        const uploadFormData = new FormData();
        uploadFormData.append('files', file);

        const uploadResponse = await fetch(`${strapiUrl}/api/upload`, {
            method: 'POST',
            body: uploadFormData,
            // ไม่ต้องมี Authorization header ถ้าเป็นการอัปโหลดแบบ Public
        });

        if (!uploadResponse.ok) {
            throw new Error('ไม่สามารถอัปโหลดไฟล์ได้');
        }

        // --- ขั้นตอนที่ 2: ดึง ID ของไฟล์ที่อัปโหลดสำเร็จออกมา ---
        const uploadedFiles = await uploadResponse.json();
        const imageId = uploadedFiles[0].id; // <-- ID ของไฟล์ใน Media Library
        console.log(`ขั้นตอนที่ 2: อัปโหลดไฟล์สำเร็จ ได้ ID: ${imageId}`);

        // --- ขั้นตอนที่ 3: สร้าง Order โดยส่งข้อมูลเป็น JSON ธรรมดา ---
        console.log("ขั้นตอนที่ 3: กำลังสร้าง Order...");
        const dataPayload = {
            contactName: document.getElementById('order-contact-name').value,
            contactPhone: document.getElementById('order-contact-phone').value,
            installationAddress: document.getElementById('order-install-address').value,
            customerNotes: document.getElementById('order-notes').value,
            service: selectedServiceId,
            citizenId: imageId // <-- ★★★ ส่ง ID ของไฟล์ไปเชื่อมความสัมพันธ์ ★★★
        };

        const orderResponse = await fetch(`${strapiUrl}/api/orders`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ data: dataPayload }), // <-- ส่งเป็น JSON ปกติ
        });

        if (!orderResponse.ok) {
            const errorData = await orderResponse.json();
            console.error('Strapi Error Details:', errorData.error.details);
            throw new Error(errorData.error.message || 'เกิดข้อผิดพลาดในการสร้าง Order');
        }

        const result = await orderResponse.json();
        feedbackDiv.textContent = `ส่งข้อมูลสำเร็จ! เลขที่อ้างอิงของคุณคือ ${result.data.id}`;
        orderForm.reset();
        if (imagePreview) imagePreview.style.display = 'none';

    } catch (error) {
        feedbackDiv.textContent = `เกิดข้อผิดพลาด: ${error.message}`;
    }
});
}

// --- ฟังก์ชันสำหรับจัดการหน้า "ล็อกอินพนักงาน" (เวอร์ชันแก้ไข) ---
function handleEmployeeLogin() {
    const loginForm = document.getElementById('employee-login-form');
    if (!loginForm) return;

    const feedbackDiv = document.getElementById('login-feedback');

    loginForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        feedbackDiv.textContent = 'กำลังตรวจสอบ...';
        feedbackDiv.className = 'form-feedback';
        feedbackDiv.style.display = 'block';

        const formData = new FormData(loginForm);
        const data = Object.fromEntries(formData.entries());

        try {
            // --- ขั้นตอนที่ 1: ล็อกอินเพื่อรับ JWT Token ---
            const loginResponse = await fetch(`${strapiUrl}/api/auth/local`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });

            const loginResult = await loginResponse.json();

            if (loginResult.error) {
                throw new Error(loginResult.error.message || 'อีเมลหรือรหัสผ่านไม่ถูกต้อง');
            }

            const jwt = loginResult.jwt;

            // --- ขั้นตอนที่ 2: ใช้ Token เพื่อดึงข้อมูล User พร้อม Role ---
            const userResponse = await fetch(`${strapiUrl}/api/users/me?populate=role`, {
                headers: {
                    'Authorization': `Bearer ${jwt}`
                }
            });

            if (!userResponse.ok) {
                throw new Error('ไม่สามารถดึงข้อมูลผู้ใช้ได้');
            }

            const userWithRole = await userResponse.json();

            // --- ขั้นตอนที่ 3: ตรวจสอบ Role ---
            if (userWithRole && userWithRole.role && userWithRole.role.name === 'Employee') {
                localStorage.setItem('jwt_employee', jwt);
                localStorage.setItem('employee', JSON.stringify(userWithRole));
                window.location.hash = 'dashboard.html'; // ส่งไปหน้า Dashboard
            } else {
                throw new Error('คุณไม่มีสิทธิ์เข้าถึงระบบนี้ หรือไม่พบ Role');
            }

        } catch (error) {
            feedbackDiv.textContent = `เกิดข้อผิดพลาด: ${error.message}`;
            feedbackDiv.className = 'form-feedback error';
        }
    });
}

// --- ฟังก์ชันสำหรับโหลด "รายการ Order ทั้งหมด" (เวอร์ชันแก้ไขล่าสุด) ---
async function loadAllOrders() {
    const tableBody = document.getElementById('orders-table-body');
    if (!tableBody) return;

    const token = localStorage.getItem('jwt_employee');
    if (!token) {
        alert('กรุณาเข้าสู่ระบบก่อน');
        window.location.hash = 'login.html';
        return;
    }

    const startDateInput = document.getElementById('start-date');
    const endDateInput = document.getElementById('end-date');
    const searchButton = document.getElementById('search-button');
    const resetButton = document.getElementById('reset-button');

    const fetchAndDisplayOrders = async (startDate = '', endDate = '') => {
        tableBody.innerHTML = '<tr><td colspan="5">กำลังโหลดข้อมูล...</td></tr>';
        
        let apiUrl = `${strapiUrl}/api/orders?populate=service&sort=createdAt:desc`;
        if (startDate && endDate) {
            apiUrl += `&filters[createdAt][$gte]=${startDate}&filters[createdAt][$lte]=${endDate}`;
        }

        try {
            const response = await fetch(apiUrl, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!response.ok) throw new Error(`ไม่สามารถดึงข้อมูลได้ (Status: ${response.status})`);

            const responseData = await response.json();
            const orders = responseData.data;

            tableBody.innerHTML = '';
            if (!orders || orders.length === 0) {
                tableBody.innerHTML = '<tr><td colspan="5">ไม่พบ Order ที่ตรงกับเงื่อนไข</td></tr>';
                return;
            }

            orders.forEach(order => {
                // --- ★★★ จุดที่แก้ไข ★★★ ---
                // ใช้ || order เพื่อรองรับข้อมูลที่ไม่มี .attributes
                const item = order.attributes || order; 
                if (!item) return; // เพิ่มการป้องกัน Error อีกชั้น

                const row = `
                    <tr>
                        <td>${order.id}</td>
                        <td>${new Date(item.createdAt).toLocaleDateString('th-TH')}</td>
                        <td>${item.contactName || 'N/A'}</td>
                        <td>${item.contactPhone || 'N/A'}</td>
                        <td>${item.installationAddress}</td>
                        <td><a href="#order-detail.html?id=${order.id}" class="nav-link">ดูข้อมูล</a></td>
                    </tr>
                `;
                tableBody.innerHTML += row;
            });

        } catch (error) {
            console.error(error);
            tableBody.innerHTML = `<tr><td colspan="5">เกิดข้อผิดพลาด: ${error.message}</td></tr>`;
        }
    };

    searchButton.addEventListener('click', () => {
        fetchAndDisplayOrders(startDateInput.value, endDateInput.value);
    });

    resetButton.addEventListener('click', () => {
        startDateInput.value = '';
        endDateInput.value = '';
        fetchAndDisplayOrders();
    });

    fetchAndDisplayOrders();
}

async function loadOrderDetail() {
    // ... ส่วนบนของฟังก์ชันเหมือนเดิม ไม่ต้องเปลี่ยนแปลง ...
    const title = document.getElementById('order-detail-title');
    const content = document.getElementById('order-detail-content');
    if (!content) return;
    const token = localStorage.getItem('jwt_employee');
    if (!token) { window.location.hash = 'login.html'; return; }
    const hash = window.location.hash;
    const match = hash.match(/id=(\d+)/);
    const orderId = match ? match[1] : null;
    if (!orderId) { content.innerHTML = '<p class="error">ไม่พบ ID</p>'; return; }
    title.textContent = `รายละเอียด Order #${orderId}`;
    content.innerHTML = '<p>กำลังโหลดข้อมูล...</p>';

    try {
        const apiUrl = `${strapiUrl}/api/orders/employee/${orderId}`;
        const response = await fetch(apiUrl, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const responseData = await response.json();
        if (!response.ok) {
            throw new Error(`ไม่สามารถดึงข้อมูลได้ (Status: ${response.status})`);
        }
        
        const orderData = responseData.data || responseData;
        if (!orderData) {
            throw new Error("ไม่พบข้อมูล Order ในการตอบกลับ");
        }
        const item = orderData.attributes || orderData;

        // --- ★★★ แก้ไข 2 บรรทัดนี้ครับ ★★★ ---
        const serviceName = item.service?.serviceName || 'ไม่มีข้อมูลแพ็กเกจ';
        const citizenIdImageUrl = item.citizenId?.url 
            ? `${strapiUrl}${item.citizenId.url}`
            : null;

        content.innerHTML = `
            <div class="detail-card">
                <h3>ข้อมูลลูกค้า</h3>
                <p><strong>ชื่อผู้ติดต่อ:</strong> ${item.contactName || 'N/A'}</p>
                <p><strong>เบอร์โทรศัพท์:</strong> ${item.contactPhone || 'N/A'}</p>
                <p><strong>ที่อยู่ติดตั้ง:</strong> ${item.installationAddress || 'N/A'}</p>
            </div>
            <div class="detail-card">
                <h3>ข้อมูลแพ็กเกจ</h3>
                <p><strong>แพ็กเกจที่เลือก:</strong> ${serviceName}</p>
                <p><strong>หมายเหตุจากลูกค้า:</strong></p>
                <div class="notes-box">${item.customerNotes || 'ไม่มี'}</div>
            </div>
            <div class="detail-card" style="grid-column: 1 / -1;">
                <h3>รูปบัตรประชาชน</h3>
                ${citizenIdImageUrl 
                    ? `<img src="${citizenIdImageUrl}" alt="รูปบัตรประชาชน" style="max-width: 100%; border-radius: 8px;">`
                    : '<p>ไม่พบรูปภาพ</p>' // หมายเหตุ: ถ้า Order นี้ไม่มีรูป citizenId ก็จะแสดงข้อความนี้ ซึ่งถูกต้องแล้ว
                }
            </div>
        `;

    } catch (error) {
        console.error("[loadOrderDetail] เกิดข้อผิดพลาด:", error);
        content.innerHTML = `<p class="error">เกิดข้อผิดพลาด: ${error.message}</p>`;
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
                } else if (page.includes('login.html')) { // <-- เพิ่ม
                     handleEmployeeLogin();
                } else if (page.includes('dashboard.html')) { // <-- เพิ่ม
                      loadAllOrders();
                } else if (page.includes('order-detail.html')) {
                    loadOrderDetail();
            }
                // ... เพิ่มเงื่อนไขสำหรับหน้าอื่นๆ ที่นี่ ...
            })
            .catch(error => {
                console.error('Failed to load content:', error);
                contentContainer.innerHTML = '<h1>เกิดข้อผิดพลาดในการโหลดหน้าเว็บ</h1>';
            });
    };

// --- Event Listeners ที่สมบูรณ์ ---
    document.body.addEventListener('click', (event) => {
        const link = event.target.closest('a');
        if (!link) return;

        const href = link.getAttribute('href');
        if (!href) return;
        
        // ถ้าเป็นลิงก์สำหรับเปลี่ยนหน้า SPA เท่านั้น ถึงจะทำงาน
        if (href.endsWith('.html')) {
            event.preventDefault();
            window.location.hash = href;
        }
        // ถ้าเป็นลิงก์อื่นๆ (เช่น #services หรือ https://...) จะปล่อยให้ Browser จัดการเอง
    });

const handleHashChange = () => {
    let hash = window.location.hash.substring(1) || 'home-content.html';

    // แยกชื่อไฟล์ออกจากพารามิเตอร์
    const pageName = hash.split('?')[0];

    if (pageName.endsWith('.html')) {
        loadContent(pageName);
    }

    // อัปเดต active class ที่เมนู
    document.querySelectorAll('.nav-link').forEach(item => item.classList.remove('active'));
    const activeLink = document.querySelector(`.nav-link[href='${pageName}']`);
    if (activeLink) activeLink.classList.add('active');
};

    window.addEventListener('hashchange', handleHashChange);

    // --- เริ่มต้นการทำงาน ---
    handleHashChange(); // โหลดเนื้อหาเริ่มต้นตาม URL
});