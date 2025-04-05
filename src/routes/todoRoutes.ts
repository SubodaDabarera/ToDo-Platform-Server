import { createTodo, getTodos } from "../controllers/todoController";
import { authenticate, AuthRequest } from "../middleware/auth";
import Todo, { ITodo } from "../models/Todo";
import express, { Response } from 'express';

const router = express.Router();

// Get all todos for current user
//@ts-ignore
router.get('/', authenticate, getTodos);

// Create new todo
//@ts-ignore
router.post('/', authenticate, createTodo);

// Update todo one item (including drag & drop)
//@ts-ignore
router.put('item/:id', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { title, description, category, deadline, position } = req.body;
    const todo = await Todo.findOne({
      _id: req.params.id,
      createdBy: req.userId
    });

    if (!todo) return res.status(404).json({ message: 'Todo not found' });

    // Handle position changes
    if (category !== todo.category || position !== todo.position) {
      // Decrement position for items in old category that were after this item
      await Todo.updateMany({
        createdBy: req.userId,
        category: todo.category,
        position: { $gt: todo.position }
      }, { $inc: { position: -1 } });

      // Increment position for items in new category that are at or after the new position
      await Todo.updateMany({
        createdBy: req.userId,
        category,
        position: { $gte: position }
      }, { $inc: { position: 1 } });
    }

    todo.title = title || todo.title;
    todo.description = description || todo.description;
    todo.category = category || todo.category;
    todo.deadline = deadline || todo.deadline;
    todo.position = position ?? todo.position;
    todo.updatedDate = new Date();

    await todo.save();
    res.json(todo);
  } catch (err) {
    console.error("Error updating todo:", err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Bulk position update
//@ts-ignore
router.put('/reorder', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { todos } = req.body;
    
    if (!Array.isArray(todos)) {
      return res.status(400).json({ message: 'Invalid request format' });
    }
    
    const bulkOps = todos.map((todo: any) => ({
      updateOne: {
        filter: { _id: todo._id, createdBy: req.userId },
        update: { 
          $set: { 
            position: todo.position, 
            category: todo.category,
            updatedDate: new Date()
          } 
        }
      }
    }));

    await Todo.bulkWrite(bulkOps);
    res.status(200).json({ message: 'Todos reordered successfully' });
  } catch (err) {
    console.error("Error reordering todos:", err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete todo
//@ts-ignore
router.delete('/:id', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const todo = await Todo.findOneAndDelete({
      _id: req.params.id,
      createdBy: req.userId
    });
    
    if (!todo) return res.status(404).json({ message: 'Todo not found' });
    
    // Update positions for remaining todos in same category
    await Todo.updateMany({
      createdBy: req.userId,
      category: todo.category,
      position: { $gt: todo.position }
    }, { $inc: { position: -1 } });

    res.status(200).json({ message: 'Todo deleted successfully' });
  } catch (err) {
    console.error("Error deleting todo:", err);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
