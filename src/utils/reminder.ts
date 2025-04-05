import Todo from "../models/Todo";

const cron = require('node-cron');


cron.schedule('0 9 * * *', async () => { // Run daily at 9 AM
    const todos = await Todo.find({
      deadline: { 
        $lte: new Date(new Date().getTime() + 24 * 60 * 60 * 1000) 
      }
    }).populate('createdBy');
  
    // todos.forEach(todo => {
    //   sendEmail({
    //     to: todo.createdBy.email,
    //     subject: `Deadline Approaching: ${todo.title}`,
    //     text: `Your task "${todo.title}" is due on ${todo.deadline}`
    //   });
    // });
  });