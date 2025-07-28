module.exports = {
  routes: [
    {
      method: 'GET',
      path: '/orders/me', // นี่คือ URL ของถนนเส้นใหม่ของเรา
      handler: 'custom-order.me', // บอกว่าให้ไปเรียกใช้ฟังก์ชัน me จากไฟล์ custom-order
      config: {
        policies: [],
        middlewares: [],
      },
    },
  ],
};
