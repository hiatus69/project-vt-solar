// รอให้หน้าเว็บ HTML โหลดให้เสร็จก่อน แล้วค่อยเริ่มทำงาน
document.addEventListener('DOMContentLoaded', () => {

    // ที่อยู่ของ API ที่ Strapi สร้างให้เรา
    const apiUrl = 'http://localhost:1337/api/promotions?populate=*&sort=displayOrder:asc';

    // เลือกพื้นที่ว่างที่เราเตรียมไว้ใน index.html
    const promotionsGrid = document.querySelector('#special-promotions-container');

    if (!promotionsGrid) {
        console.error('Promotion grid container not found!');
        return;
    }

    // ฟังก์ชันสำหรับแปลงข้อมูล Rich Text (features) ให้เป็น HTML
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

    // เริ่มไปดึงข้อมูล
    fetch(apiUrl)
        .then(response => {
            if (!response.ok) { throw new Error('Network response was not ok'); }
            return response.json();
        })
        .then(data => {
            const promotions = data.data;
            promotionsGrid.innerHTML = '';

            if (promotions.length === 0) {
                promotionsGrid.innerHTML = '<p>ยังไม่มีโปรโมชั่นในขณะนี้</p>';
                return;
            }

            promotions.forEach(promotion => {
                const attributes = promotion.attributes;
                
                // ==========================================================
                // VVVV --- โค้ดส่วนป้องกัน Error ที่สำคัญอยู่ตรงนี้ --- VVVV
                // ==========================================================
                
                // 1. สร้าง URL รูปภาพสำรองไว้เป็นค่าเริ่มต้น
                let imageUrl = 'https://placehold.co/600x400/cccccc/333?text=No+Image';
                
                // 2. ตรวจสอบก่อนว่ามีข้อมูล promoImage และ data อยู่ข้างในจริงหรือไม่
                if (attributes.promoImage && attributes.promoImage.data) {
                    // 3. ถ้ามี ค่อยใช้รูปจริง
                    imageUrl = `http://localhost:1337${attributes.promoImage.data.attributes.url}`;
                }
                
                // ==========================================================
                // ^^^^ --- สิ้นสุดส่วนป้องกัน Error --- ^^^^
                // ==========================================================

                const featuresHTML = renderFeatures(attributes.features);

                // สร้างโค้ด HTML ของการ์ด 1 ใบ
                const cardHTML = `
                    <div class="promotion-card">
                        <div class="promo-card-header">
                            <img src="${imageUrl}" alt="ภาพโปรโมชั่น ${attributes.packageName || 'โปรโมชั่น'}">
                        </div>
                        <div class="promo-card-body">
                            <h3>${attributes.packageName}</h3>
                            <p class="promo-description">${attributes.description}</p>
                            <div class="promo-price">
                                <span class="price-label">เริ่มต้นเพียง</span>
                                <span class="price-amount">${(attributes.price || 0).toLocaleString('en-US')}</span>
                                <span class="price-unit">บาท</span>
                            </div>
                            ${featuresHTML}
                        </div>
                        <div class="promo-card-footer">
                            <a href="contact.html" class="btn btn-secondary">สนใจแพ็กเกจนี้</a>
                        </div>
                    </div>
                `;
                promotionsGrid.innerHTML += cardHTML;
            });
        })
        .catch(error => {
            console.error('There was a problem fetching promotions:', error);
            promotionsGrid.innerHTML = `<p>เกิดข้อผิดพลาดในการโหลดข้อมูลโปรโมชั่น: ${error.message}</p>`;
        });
});