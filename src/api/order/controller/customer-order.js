'use strict';
const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::order.order', ({ strapi }) => ({
  // ฟังก์ชันใหม่ชื่อ me
  async me(ctx) {
    const user = ctx.state.user;
    if (!user) {
      return ctx.badRequest('No authenticated user found');
    }

    // กรองข้อมูล: หาเฉพาะออเดอร์ที่ customer.id ตรงกับ user.id
    const orders = await strapi.entityService.findMany('api::order.order', {
      filters: { customer: { id: user.id } },
      populate: { order_items: true, completionProof: true }, 
      sort: { createdAt: 'desc' }
    });

    return { data: orders };
  },
}));