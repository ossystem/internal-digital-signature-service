module.exports = app => {
  app.get('/', (req, res) => {
    return res.json({
      success: true
    })
  });
};
