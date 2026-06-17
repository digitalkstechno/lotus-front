import { Building2, Users, User as UserIcon } from "lucide-react";
import { newTask } from "./utils";

export const initialLists = [
  {
    id: "l1",
    name: "My Tasks",
    sortBy: "deadline",
    tasks: [{ ...newTask("demo22") }],
  },
  { id: "l2", name: "demo", sortBy: "deadline", tasks: [] },
  { id: "l3", name: "test", sortBy: "deadline", tasks: [] },
  { id: "l4", name: "demo2", sortBy: "deadline", tasks: [] },
];

export const ASSIGN_PALETTE = [
  { type: "Unit", icon: Building2, items: ["Sales Unit", "Marketing Unit"] },
  { type: "Team", icon: Users, items: ["Design Team", "Dev Team"] },
  { type: "User", icon: UserIcon, items: ["Riya Shah", "Aman Patel"] },
];

export const ASSIGN_COLORS: Record<string, string> = {
  Unit: "bg-blue-50 text-blue-700 border-blue-200",
  Team: "bg-purple-50 text-purple-700 border-purple-200",
  Staff: "bg-emerald-50 text-emerald-700 border-emerald-200",
  "Unit Head": "bg-amber-50 text-amber-700 border-amber-200",
  "Team Head": "bg-orange-50 text-orange-700 border-orange-200",
};

export const SORT_LABELS = {
  "my-order": "My order",
  date: "Date",
  deadline: "Deadline",
  starred: "Starred recently",
  title: "Title",
};

export const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
export const DAYS = ["M", "T", "W", "T", "F", "S", "S"];
