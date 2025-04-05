import { Request, Response } from "express";
import Todo, { ITodo } from "../models/Todo";
import { TodoCategory } from "../types/todo";
import { AuthRequest } from "../middleware/auth";

interface ICreateTodoRequest {
  title: string;
  description?: string;
  category: TodoCategory;
  deadline: Date;
}

export const createTodo = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const { title, description, category, deadline } = req.body;
    
    // Get max position for the category
    const maxPosition = await Todo.findOne({ 
      createdBy: req.userId, 
      category 
    })
    .sort('-position')
    .select('position');
    
    const newTodo = new Todo({
      title,
      description,
      category,
      deadline,
      createdBy: req.userId,
      position: (maxPosition?.position || 0) + 1
    });
    
    await newTodo.save();
    res.status(201).json(newTodo);
  } catch (error) {
    console.error("Error creating todo:", error);
    res.status(400).json({ error: (error as Error).message });
  }
};

export const getTodos = async (req: AuthRequest, res: Response) => {
  try {
    const todos = await Todo.find({ createdBy: req.userId })
      .sort({ category: 1, position: 1 });
    res.json(todos);
  } catch (error) {
    console.error("Error fetching todos:", error);
    res.status(500).json({ error: (error as Error).message });
  }
};
