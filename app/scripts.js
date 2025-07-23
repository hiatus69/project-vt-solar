// ==========================================================
// ส่วนที่ 1: ฟังก์ชันสำหรับดึงข้อมูลจาก Strapi (นิยามไว้ก่อน)
// ==========================================================
 const strapiUrl = 'https://api.vertexplus99.com';
// --- ฟังก์ชันใหม่สำหรับโหลด "บริการของเรา" ---
    function loadMainServices() {
        const servicesApiUrl = `${strapiUrl}/api/services?populate=*&sort=displayOrder:asc`;
        const servicesGrid = document.querySelector('#services .promo-grid');

        if (!servicesGrid) return;

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

                    // เรียกใช้ฟังก์ชัน renderFeatures สำหรับส่วนบริการ
                    const featuresHTML = renderFeatures(item.features);

                    // --- จุดที่แก้ไขสำคัญ: โครงสร้าง HTML ใหม่ให้เหมือนกับโปรโมชั่น ---
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
                                <a href="contact.html" class="btn btn-secondary">สนใจบริการนี้</a>
                            </div>
                        </div>
                    `;
                    // --- จบจุดที่แก้ไข ---

                    servicesGrid.innerHTML += cardHTML;
                });
            })
            .catch(error => {
                console.error('Error fetching services:', error);
                servicesGrid.innerHTML = '<p>ไม่สามารถโหลดข้อมูลบริการได้</p>';
            });
    }


    // --- ฟังก์ชันสำหรับโหลด "โปรโมชั่นสุดพิเศษ" ---
    function loadSpecialPromotions() {
        const promoApiUrl = `${strapiUrl}/api/promotions?populate=*&sort=displayOrder:asc`;
        const promoGrid = document.querySelector('#special-promotions-container');

        if (!promoGrid) return;

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
                                <a href="contact.html" class="btn btn-secondary">สนใจแพ็กเกจนี้</a>
                            </div>
                        </div>
                    `;
                    promoGrid.innerHTML += cardHTML;
                });
            })
            .catch(error => {
                console.error('Error fetching promotions:', error);
                promoGrid.innerHTML = `<p>เกิดข้อผิดพลาดในการโหลดข้อมูลโปรโมชั่น</p>`;
            });
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

    // --- เรียกใช้งานฟังก์ชันทั้งหมดเมื่อหน้าเว็บโหลด ---
    loadMainServices();
    loadSpecialPromotions();

// --- ฟังก์ชันสำหรับจัดการการสมัครสมาชิก ---
function handleRegistration() {
    const registerForm = document.getElementById('register-form');
    if (!registerForm) return; // ถ้าไม่เจอฟอร์มนี้ ก็ไม่ต้องทำอะไร

    const feedbackDiv = document.getElementById('register-feedback');

    registerForm.addEventListener('submit', (event) => {
        event.preventDefault(); // หยุดการส่งฟอร์มแบบปกติ

        // ดึงข้อมูลจากฟอร์ม
        const firstname = document.getElementById('reg-firstname').value;
        const lastname = document.getElementById('reg-lastname').value;
        const address = document.getElementById('reg-address').value;
        const phone = document.getElementById('reg-phone').value;
        const email = document.getElementById('reg-email').value;
        const password = document.getElementById('reg-password').value;

        // เตรียมข้อมูลเพื่อส่งไปที่ Strapi
        const registrationData = {
            username: email, // Strapi ใช้ username เป็นค่า unique, เราจะใช้อีเมลแทน
            email: email,
            password: password,
            firstname: firstname,
            lastname: lastname,
            address: address,
            phone_number: phone
        };

        // ส่งข้อมูลไปที่ API สำหรับการลงทะเบียนของ Strapi
        fetch(`${strapiUrl}/api/auth/local/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(registrationData),
        })
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                // ถ้า Strapi ส่ง error กลับมา
                feedbackDiv.textContent = data.error.message;
                feedbackDiv.className = 'form-feedback error';
            } else {
                // ถ้าสำเร็จ
                feedbackDiv.textContent = 'สมัครสมาชิกสำเร็จ! กำลังนำคุณไปยังหน้าเข้าสู่ระบบ...';
                feedbackDiv.className = 'form-feedback success';

                // รอ 2 วินาที แล้วค่อยพาไปหน้า login
                setTimeout(() => {
                    // ใช้ฟังก์ชัน loadContent ของเราเพื่อเปลี่ยนหน้า
                    loadContent('login.html');
                }, 2000);
            }
        })
        .catch(error => {
            console.error('Registration error:', error);
            feedbackDiv.textContent = 'เกิดข้อผิดพลาดในการเชื่อมต่อ กรุณาลองใหม่อีกครั้ง';
            feedbackDiv.className = 'form-feedback error';
        });
    });
}

// --- ฟังก์ชันสำหรับจัดการการเข้าสู่ระบบ ---
function handleLogin() {
    const loginForm = document.getElementById('login-form');
    if (!loginForm) return;

    const feedbackDiv = document.getElementById('login-feedback');

    loginForm.addEventListener('submit', (event) => {
        event.preventDefault();

        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;

        // ส่งข้อมูลไปที่ API สำหรับการล็อกอินของ Strapi
        fetch(`${strapiUrl}/api/auth/local`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                identifier: email, // Strapi ใช้ identifier สำหรับ email/username
                password: password,
            }),
        })
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                feedbackDiv.textContent = 'อีเมลหรือรหัสผ่านไม่ถูกต้อง';
                feedbackDiv.className = 'form-feedback error';
            } else {
                // ถ้าล็อกอินสำเร็จ
                // 1. เก็บ "บัตรผ่าน" (JWT) และข้อมูลผู้ใช้ไว้ในเบราว์เซอร์
                localStorage.setItem('jwt', data.jwt);
                localStorage.setItem('user', JSON.stringify(data.user));

                feedbackDiv.textContent = 'เข้าสู่ระบบสำเร็จ!';
                feedbackDiv.className = 'form-feedback success';

                // 2. โหลดหน้าเว็บใหม่ทั้งหมดเพื่ออัปเดตสถานะการล็อกอิน
                // ในอนาคตเราจะเปลี่ยนเป็นการพาไปหน้าโปรไฟล์
                setTimeout(() => {
                    window.location.href = 'index.html';
                }, 1000);
            }
        })
        .catch(error => {
            console.error('Login error:', error);
            feedbackDiv.textContent = 'เกิดข้อผิดพลาดในการเชื่อมต่อ กรุณาลองใหม่อีกครั้ง';
            feedbackDiv.className = 'form-feedback error';
        });
    });
}

// ==========================================================
// ส่วนที่ 2: โค้ดสำหรับเปลี่ยนหน้า (SPA Logic) - ทำงานแค่ครั้งเดียว
// ==========================================================
document.addEventListener('DOMContentLoaded', () => {

    const contentContainer = document.getElementById('app-content');

    // ฟังก์ชันสำหรับโหลดเนื้อหาหน้าเว็บ
    const loadContent = (url) => {
        // ก่อนโหลดเนื้อหาใหม่ ให้แสดงสถานะกำลังโหลด (ถ้าต้องการ)
        contentContainer.innerHTML = '<h2>กำลังโหลดเนื้อหา...</h2>';

        fetch(url)
            .then(response => {
                if (!response.ok) throw new Error('Network response was not ok.');
                return response.text();
            })
            .then(html => {
                contentContainer.innerHTML = html;

                // หลังจากวางโครงสร้างหน้าเสร็จแล้ว ให้เรียกฟังก์ชันเพื่อดึงข้อมูลมาใส่
                if (url.includes('home-content.html')) {
                    loadMainServices();
                    loadSpecialPromotions();
                }
                else if (url.includes('register.html')) {
                    handleRegistration(); // <-- เรียกใช้ฟังก์ชันสมัครสมาชิกที่นี่
                }
                else if (url.includes('login.html')) {
                    handleLogin(); // <-- เรียกใช้ฟังก์ชันล็อกอินที่นี่
                }
            })
            .catch(error => {
                console.error('Failed to load content:', error);
                contentContainer.innerHTML = '<h1>เกิดข้อผิดพลาดในการโหลดหน้าเว็บ</h1>';
            });
    };

    // โหลดเนื้อหาหน้าแรกเมื่อเปิดเว็บครั้งแรก
    loadContent('home-content.html');

    // เพิ่ม Event Listener ให้กับทุกๆ ลิงก์ในเมนู (ใช้ Event Delegation)
    document.body.addEventListener('click', (event) => {
        // ตรวจสอบว่าสิ่งที่คลิกคือ .nav-link หรือไม่
        if (event.target.matches('.nav-link')) {
            event.preventDefault();
            const href = event.target.getAttribute('href');

            // ไม่โหลดซ้ำถ้าคลิกหน้าเดิม
            if(window.location.hash === `#${href}`) return;

            loadContent(href);

            // อัปเดต active class ที่เมนู
            document.querySelectorAll('.nav-link').forEach(item => item.classList.remove('active'));
            // หาเมนูที่ตรงกับ href แล้วเพิ่ม active class
            document.querySelector(`.nav-link[href='${href}']`).classList.add('active');

            // (ทางเลือก) อัปเดต URL hash เพื่อให้ปุ่ม back/forward ทำงานได้
            window.location.hash = href;
        }
    });

    // (ทางเลือก) ทำให้ปุ่ม back/forward ของเบราว์เซอร์ทำงานได้
    window.addEventListener('popstate', () => {
        const hash = window.location.hash.substring(1);
        if (hash) {
            loadContent(hash);
        } else {
            loadContent('home-content.html');
        }
    });

});
