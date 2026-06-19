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
  
  let label = "";
  let d: Date | null = null;
  let showTime = false;
  
  if (task.dueDate) {
    d = new Date(task.dueDate);
    if (typeof task.dueDate === "string" && task.dueDate.includes("T")) showTime = true;
  } else if (task.due === "today") {
    d = new Date();
  } else if (task.due === "tomorrow") {
    d = new Date();
    d.setDate(d.getDate() + 1);
  } else if (task.due === "yesterday") {
    d = new Date();
    d.setDate(d.getDate() - 1);
  }

  if (d) {
    const pad = (n: number) => String(n).padStart(2, '0');
    label = `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`;
    
    if (task.dueTime) {
      let [hStr, mStr] = task.dueTime.split(":");
      let h = Number(hStr);
      const ampm = h >= 12 ? 'PM' : 'AM';
      h = h % 12;
      if (h === 0) h = 12;
      label += ` ${String(h).padStart(2, '0')}:${mStr} ${ampm}`;
    } else if (showTime) {
      let h = d.getHours();
      let m = d.getMinutes();
      const ampm = h >= 12 ? 'PM' : 'AM';
      h = h % 12;
      if (h === 0) h = 12;
      label += ` ${pad(h)}:${pad(m)} ${ampm}`;
    }
  } else {
    label = task.due;
  }
  
  return label;
};

export const formatDate = (dateStr: string) => {
  if (!dateStr) return null;
  let d: Date;
  let showTime = false;

  if (dateStr === "today") d = new Date();
  else if (dateStr === "tomorrow") { d = new Date(); d.setDate(d.getDate() + 1); }
  else if (dateStr === "yesterday") { d = new Date(); d.setDate(d.getDate() - 1); }
  else {
    d = new Date(dateStr);
    // If it's a full ISO string with time (e.g., contains 'T'), show the time
    if (dateStr.includes("T")) showTime = true;
  }
  
  const pad = (n: number) => String(n).padStart(2, '0');
  let formatted = `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`;
  
  if (showTime) {
    let h = d.getHours();
    let m = d.getMinutes();
    const ampm = h >= 12 ? 'PM' : 'AM';
    h = h % 12;
    if (h === 0) h = 12;
    formatted += ` ${pad(h)}:${pad(m)} ${ampm}`;
  }
  
  return formatted;
};

export const isPastDate = (dateStr: string) => {
  if (!dateStr) return false;
  if (dateStr === "today" || dateStr === "tomorrow") return false;
  if (dateStr === "yesterday") return true;
  const d = new Date(dateStr);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  d.setHours(0, 0, 0, 0);
  return d < today;
};
