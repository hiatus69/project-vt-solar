'use strict';

/**
 * A set of functions called "actions" for an order.
 */

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::order.order', ({ strapi }) => ({

  // สร้างฟังก์ชันใหม่ชื่อ me
  async me(ctx) {
    // 1. ตรวจสอบว่ามีผู้ใช้ล็อกอินอยู่หรือไม่
    const user = ctx.state.user;
    if (!user) {
      return ctx.badRequest('No authenticated user found');
    }

    // 2. ดึงข้อมูลออเดอร์ทั้งหมด โดย "กรอง" เอาเฉพาะที่ customer.id ตรงกับ id ของผู้ใช้ที่ล็อกอินอยู่
    const orders = await strapi.entityService.findMany('api::order.order', {
      filters: {
        customer: {
          id: user.id,
        },
      },
      populate: { // ดึงข้อมูลที่เกี่ยวข้องมาด้วย
        order_items: true,
        completionProof: true
      },
      sort: { createdAt: 'desc' } // เรียงจากล่าสุดไปเก่าสุด
    });

    // 3. ส่งข้อมูลที่กรองแล้วกลับไป
    return { data: orders };
  },

}));
