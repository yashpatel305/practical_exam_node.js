const Task = require('../models/Task');
const Category = require('../models/Category');
const User = require('../models/User');

function taskFilterForUser(user) {
  return user.role === 'admin' ? {} : { owner: user.id };
}

exports.getTaskList = async (req, res) => {
  try {
    const showAll = req.user.role === 'admin' && req.query.scope === 'all';
    const filter = showAll ? {} : taskFilterForUser(req.user);

    const tasks = await Task.find(filter)
      .populate('owner', 'username role')
      .populate('category', 'name')
      .sort({ createdAt: -1 });

    return res.render('tasks/taskList', {
      title: showAll ? 'All User Tasks' : 'My Tasks',
      tasks,
      scope: showAll ? 'all' : 'mine',
    });
  } catch (error) {
    return res.status(500).send('Unable to fetch tasks');
  }
};

exports.getTaskForm = async (req, res) => {
  try {
    const categories = await Category.find({}).sort({ name: 1 });
    let users = [];

    if (req.user.role === 'admin') {
      users = await User.find({}, 'username role').sort({ username: 1 });
    }

    return res.render('tasks/taskForm', {
      title: 'Create Task',
      task: null,
      categories,
      users,
      formAction: '/tasks',
      methodOverride: null,
    });
  } catch (error) {
    return res.status(500).send('Unable to load task form');
  }
};

exports.createTask = async (req, res) => {
  try {
    const { title, description, status, dueDate, category, owner } = req.body;
    const ownerId = req.user.role === 'admin' && owner ? owner : req.user.id;

    const task = await Task.create({
      title,
      description,
      status,
      dueDate: dueDate || undefined,
      category: category || undefined,
      owner: ownerId,
    });

    await User.findByIdAndUpdate(ownerId, { $addToSet: { tasks: task._id } });
    return res.redirect('/tasks');
  } catch (error) {
    return res.status(500).send('Unable to create task');
  }
};

exports.getEditTaskForm = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).send('Task not found');
    }

    const isOwner = task.owner.toString() === req.user.id;
    if (req.user.role !== 'admin' && !isOwner) {
      return res.status(403).send('Forbidden');
    }

    const categories = await Category.find({}).sort({ name: 1 });
    let users = [];
    if (req.user.role === 'admin') {
      users = await User.find({}, 'username role').sort({ username: 1 });
    }

    return res.render('tasks/taskForm', {
      title: 'Edit Task',
      task,
      categories,
      users,
      formAction: `/tasks/${task._id}?_method=PUT`,
      methodOverride: 'PUT',
    });
  } catch (error) {
    return res.status(500).send('Unable to load edit form');
  }
};

exports.updateTask = async (req, res) => {
  try {
    const existingTask = await Task.findById(req.params.id);
    if (!existingTask) {
      return res.status(404).send('Task not found');
    }

    const isOwner = existingTask.owner.toString() === req.user.id;
    if (req.user.role !== 'admin' && !isOwner) {
      return res.status(403).send('Forbidden');
    }

    const { title, description, status, dueDate, category, owner } = req.body;
    const nextOwner = req.user.role === 'admin' && owner ? owner : existingTask.owner;

    existingTask.title = title;
    existingTask.description = description;
    existingTask.status = status;
    existingTask.dueDate = dueDate || undefined;
    existingTask.category = category || undefined;

    if (req.user.role === 'admin') {
      const previousOwner = existingTask.owner.toString();
      if (previousOwner !== String(nextOwner)) {
        await User.findByIdAndUpdate(previousOwner, { $pull: { tasks: existingTask._id } });
        await User.findByIdAndUpdate(nextOwner, { $addToSet: { tasks: existingTask._id } });
        existingTask.owner = nextOwner;
      }
    }

    await existingTask.save();
    return res.redirect('/tasks');
  } catch (error) {
    return res.status(500).send('Unable to update task');
  }
};

exports.deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).send('Task not found');
    }

    const isOwner = task.owner.toString() === req.user.id;
    if (req.user.role !== 'admin' && !isOwner) {
      return res.status(403).send('Forbidden');
    }

    await Task.findByIdAndDelete(task._id);
    await User.findByIdAndUpdate(task.owner, { $pull: { tasks: task._id } });

    return res.redirect('/tasks');
  } catch (error) {
    return res.status(500).send('Unable to delete task');
  }
};
