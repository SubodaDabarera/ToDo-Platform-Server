import { model, Schema } from "mongoose";

export interface ITodo extends Document {
  title: string;
  description: string;
  category: 'Todo' | 'In Progress' | 'Done';
  deadline: Date;
  createdDate: Date;
  updatedDate: Date;
  createdBy: Schema.Types.ObjectId;
  position: number;
  reminded: boolean;
}

const TodoSchema = new Schema<ITodo>({
  title: { type: String, required: true },
  description: String,
  category: { type: String, enum: ['Todo', 'In Progress', 'Done'], default: 'Todo' },
  deadline: Date,
  createdDate: { type: Date, default: Date.now },
  updatedDate: { type: Date, default: Date.now },
  createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: false },
  position: { type: Number, required: true },
  reminded: { type: Boolean, default: false }
});

export default model<ITodo>('Todo', TodoSchema);