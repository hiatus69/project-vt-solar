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
        .then(response => response.json())
        .then(apiResponse => { // เปลี่ยนชื่อตัวแปรเป็น apiResponse เพื่อความชัดเจน
            
            // --- จุดที่แก้ไขสำคัญ ---
            // เราจะเข้าถึงข้อมูลจาก apiResponse.data โดยตรง
            const promotions = apiResponse.data; 
            // --- จบจุดที่แก้ไขสำคัญ ---
            
            promotionsGrid.innerHTML = '';

            if (promotions.length === 0) {
                promotionsGrid.innerHTML = '<p>ยังไม่มีโปรโมชั่นในขณะนี้</p>';
                return;
            }

            promotions.forEach(promotion => {
                // ไม่ต้องมี const attributes = promotion.attributes; แล้ว
                
                let imageUrl = 'https://placehold.co/600x400/cccccc/333?text=No+Image';
                // อ่านข้อมูลรูปภาพจากโครงสร้างใหม่
                if (promotion.promoImage && promotion.promoImage.url) {
                    imageUrl = `http://localhost:1337${promotion.promoImage.url}`;
                }

                const featuresHTML = renderFeatures(promotion.features);

                // สร้างโค้ด HTML ของการ์ด 1 ใบ โดยอ่านจาก promotion โดยตรง
                const cardHTML = `
                    <div class="promo-card">
                        <div class="promo-card-header">
                            <img src="${imageUrl}" alt="ภาพโปรโมชั่น ${promotion.packageName || 'โปรโมชั่น'}">
                        </div>
                        <div class="promo-card-body">
                            <h3>${promotion.packageName}</h3>
                            <p class="promo-description">${promotion.description}</p>
                            <div class="promo-price">
                                <span class="price-label">เริ่มต้นเพียง</span>
                                <span class="price-amount">${(promotion.price || 0).toLocaleString('en-US')}</span>
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