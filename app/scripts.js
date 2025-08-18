// ==========================================================
// ส่วนที่ 1: ฟังก์ชันสำหรับดึงข้อมูลและจัดการ
// ==========================================================

const strapiUrl = 'https://api.vertexplus99.com'; // <-- ใช้ URL ของเซิร์ฟเวอร์จริง

// --- ฟังก์ชันสำหรับโหลด "บริการของเรา" (สำหรับหน้า home) ---
function loadMainServices() {
    const servicesGrid = document.querySelector('#services .promo-grid');
    if (!servicesGrid) return;

    const servicesApiUrl = `${strapiUrl}/api/services?populate=*&sort=displayOrder:asc`;
    fetch(servicesApiUrl)
        .then(response => {
            if (!response.ok) throw new Error('Could not fetch services.');
            return response.json();
        })
        .then(response => {
            const services = response.data;
            servicesGrid.innerHTML = '';
            if (!services || services.length === 0) {
                servicesGrid.innerHTML = '<p>ยังไม่มีบริการในขณะนี้</p>';
                return;
            }
            services.forEach(service => {
                const item = service.attributes || service;
                let imageUrl = item.serviceImage?.data?.attributes?.url
                    ? `${strapiUrl}${item.serviceImage.data.attributes.url}`
                    : 'https://placehold.co/600x400/cccccc/333?text=Service';

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
                        </div>
                        <div class="promo-card-footer">
                            <a href="add-order.html" class="btn btn-secondary nav-link">สนใจบริการนี้</a>
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

// --- ฟังก์ชันสำหรับโหลด "โปรโมชั่นสุดพิเศษ" (สำหรับหน้า home) ---
function loadSpecialPromotions() {
    // โค้ดส่วนนี้จะคล้ายกับ loadMainServices หากคุณมี API สำหรับโปรโมชั่น
    // ถ้ายังไม่มี สามารถเว้นว่างไว้ก่อนได้ครับ
    const promoGrid = document.querySelector('#special-promotions-container');
    if (promoGrid) {
        // ใส่โค้ด fetch โปรโมชั่นที่นี่
    }
}

// --- ฟังก์ชันสำหรับจัดการ "หน้าสร้าง Order" ---
function handleNewOrderPage() {
    const orderForm = document.getElementById('new-order-form');
    const packageSelect = document.getElementById('order-package-select');

    if (!orderForm) return;

    let allServices = [];
    fetch(`${strapiUrl}/api/services`)
        .then(res => res.json())
        .then(response => {
            allServices = response.data;
            packageSelect.innerHTML = '<option value="">-- กรุณาเลือกแพ็กเกจ --</option>';
            allServices.forEach(service => {
                const item = service.attributes || service;
                const option = document.createElement('option');
                option.value = service.id;
                option.textContent = `${item.serviceName} - ${item.price.toLocaleString('en-US')} บาท`;
                packageSelect.appendChild(option);
            });
        });

    orderForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        const feedbackDiv = document.getElementById('order-feedback');
        feedbackDiv.textContent = 'กำลังส่งข้อมูล...';
        feedbackDiv.className = 'form-feedback';
        feedbackDiv.style.display = 'block';

        const selectedServiceId = packageSelect.value;
        if (!selectedServiceId) {
            feedbackDiv.textContent = 'กรุณาเลือกแพ็กเกจที่สนใจ';
            feedbackDiv.className = 'form-feedback error';
            return;
        }

        const selectedService = allServices.find(s => s.id == selectedServiceId);
        const serviceAttributes = selectedService.attributes || selectedService;

        const formData = new FormData(orderForm);
        const contactData = Object.fromEntries(formData.entries());

        try {
            const response = await fetch(`${strapiUrl}/api/orders`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    data: {
                        orderItemData: {
                            packageName: serviceAttributes.serviceName,
                            price: serviceAttributes.price,
                            features: serviceAttributes.features,
                        },
                        contactInfo: {
                            contactName: contactData.contactName,
                            installationAddress: contactData.installationAddress,
                            contactPhone: contactData.contactPhone,
                            customerNotes: contactData.customerNotes,
                            citizenId: contactData.citizenId,
                        }
                    }
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error.message || 'เกิดข้อผิดพลาดในการส่งข้อมูล');
            }

            const result = await response.json();
            feedbackDiv.textContent = `ส่งข้อมูลสำเร็จ! เลขที่อ้างอิงของคุณคือ ${result.data.id} เจ้าหน้าที่จะติดต่อกลับโดยเร็วที่สุด`;
            feedbackDiv.className = 'form-feedback success';
            orderForm.reset();

        } catch (error) {
            feedbackDiv.textContent = `เกิดข้อผิดพลาด: ${error.message}`;
            feedbackDiv.className = 'form-feedback error';
        }
    });
}

// ==========================================================
// ส่วนที่ 2: โค้ดสำหรับควบคุมหน้าเว็บทั้งหมด (SPA Logic)
// ==========================================================
document.addEventListener('DOMContentLoaded', () => {

    const contentContainer = document.getElementById('app-content');

    // --- ฟังก์ชันหลักสำหรับโหลดเนื้อหา ---
    const loadContent = (url) => {
        const page = url.split('#')[0] || url;

        // ถ้าไม่มี URL ที่ระบุ ให้ไปที่หน้าหลักเสมอ
        if (!page) {
            page = 'home-content.html';
        }

        fetch(page)
            .then(response => {
                if (!response.ok) throw new Error(`ไม่สามารถโหลดไฟล์ ${page} ได้`);
                return response.text();
            })
            .then(htmlString => {
                const parser = new DOMParser();
                const doc = parser.parseFromString(htmlString, 'text/html');
                const mainContent = doc.querySelector('main');

                contentContainer.innerHTML = mainContent ? mainContent.innerHTML : 'เนื้อหาไม่ถูกต้อง';

                // เรียกใช้ฟังก์ชันที่จำเป็นสำหรับหน้านั้นๆ
                if (page.includes('home-content.html')) {
                    loadMainServices();
                    loadSpecialPromotions();
                } else if (page.includes('add-order.html')) {
                    handleNewOrderPage();
                }
            })
            .catch(error => {
                console.error('Failed to load content:', error);
                contentContainer.innerHTML = '<h1>เกิดข้อผิดพลาดในการโหลดหน้าเว็บ</h1>';
            });
    };

    // --- Event Listeners สำหรับการคลิกเมนู ---
    document.body.addEventListener('click', (event) => {
        const link = event.target.closest('.nav-link');

        if (link) {
            event.preventDefault();
            const href = link.getAttribute('href');
            window.location.hash = href;
        }
    });

    // --- จัดการการเปลี่ยนแปลง URL hash ---
    const handleHashChange = () => {
        let hash = window.location.hash.substring(1);
        if (!hash) {
            hash = 'home-content.html'; // หน้าเริ่มต้น
        }
        loadContent(hash);

        // อัปเดต active class ที่เมนู
        document.querySelectorAll('.nav-link').forEach(item => item.classList.remove('active'));
        const activeLink = document.querySelector(`.nav-link[href='${hash}']`);
        if (activeLink) activeLink.classList.add('active');
    };

    window.addEventListener('hashchange', handleHashChange);

    // --- เริ่มต้นการทำงาน ---
    handleHashChange(); // โหลดเนื้อหาเริ่มต้นตาม URL
});
