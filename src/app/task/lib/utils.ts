export const uid = () => Math.random().toString(36).slice(2, 9);

export const newTask = (title = "") => ({
  id: uid(),
  title,
  completed: false,
  starred: false,
  details: "",
  due: null,
  dueDate: null,
  dueTime: null,
  repeat: null,
  assign: null,
  attachments: [],
  subtasks: [],
  createdAt: Date.now(),
});

const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

export const formatDueLabel = (task: any) => {
  if (!task.dueDate && !task.due) return null;
  if (task.due === "today") return "Today";
  if (task.due === "tomorrow") return "Tomorrow";
  if (task.dueDate) {
    const d = new Date(task.dueDate);
    return `${d.getDate()} ${MONTHS[d.getMonth()]}`;
  }
  return null;
};
