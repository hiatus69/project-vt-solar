document.addEventListener('DOMContentLoaded', () => {

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
    
});