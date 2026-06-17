export const uid = () => Math.random().toString(36).slice(2, 9);

export const newTask = (title = "") => ({
  id: uid(),
  title,
  completed: false,
  starred: false,
  details: "",
  date: null,
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
    const today = new Date();
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    if (d.toDateString() === today.toDateString()) return "Today";
    if (d.toDateString() === tomorrow.toDateString()) return "Tomorrow";
    
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    return `${days[d.getDay()]}, ${months[d.getMonth()]} ${d.getDate()}`;
  }
  return null;
};

export const formatDate = (dateStr: string) => {
  if (!dateStr || dateStr === "today" || dateStr === "tomorrow") {
    return dateStr === "today" ? "Today" : dateStr === "tomorrow" ? "Tomorrow" : null;
  }
  const d = new Date(dateStr);
  const today = new Date();
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  if (d.toDateString() === today.toDateString()) return "Today";
  if (d.toDateString() === tomorrow.toDateString()) return "Tomorrow";
  
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`;
};
