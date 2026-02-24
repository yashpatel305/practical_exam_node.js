const Category = require('../models/Category');

exports.createCategory = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) {
      return res.redirect('/tasks/new');
    }

    await Category.create({
      name,
      createdBy: req.user.id,
    });

    return res.redirect('/tasks/new');
  } catch (error) {
    return res.redirect('/tasks/new');
  }
};
