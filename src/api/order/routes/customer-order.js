module.exports = {
  routes: [
    {
      method: 'GET',
      path: '/orders/me',
      handler: 'custom-order.me',
    },
  ],
};