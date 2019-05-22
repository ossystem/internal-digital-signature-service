module.exports = app => {
  app.post('/sign', (req, res) => {
    const body = req.body || {};

    // TODO: Add logic for signing data

    res.json({
      success: true,
      body
    })
  });
};
