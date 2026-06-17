import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface TaskUIState {
  openAssignFor: string | null;
  openAttFor: string | null;
  collapsedCompleted: Record<string, boolean>;
  editingTaskId: string | null;
  openListMenu: string | null;
  openTaskMenu: string | null;
  openMovePicker: string | null;
  renamingListId: string | null;
  renameValue: string;
  newSubtaskInputs: Record<string, string>;
  addingList: boolean;
  newListName: string;
  calendarFor: string | null;
  editDeadlineFor: string | null;
  timeFor: string | null;
  repeatFor: string | null;
  tomorrowClickCount: Record<string, number>;
  dragData: any | null;
  dragOverTarget: any | null;
}

const initialState: TaskUIState = {
  openAssignFor: null,
  openAttFor: null,
  collapsedCompleted: {},
  editingTaskId: null,
  openListMenu: null,
  openTaskMenu: null,
  openMovePicker: null,
  renamingListId: null,
  renameValue: "",
  newSubtaskInputs: {},
  addingList: false,
  newListName: "",
  calendarFor: null,
  editDeadlineFor: null,
  timeFor: null,
  repeatFor: null,
  tomorrowClickCount: {},
  dragData: null,
  dragOverTarget: null,
};

const taskUISlice = createSlice({
  name: "taskUI",
  initialState,
  reducers: {
    setOpenAssignFor: (state, action: PayloadAction<string | null>) => { state.openAssignFor = action.payload; },
    setOpenAttFor: (state, action: PayloadAction<string | null>) => { state.openAttFor = action.payload; },
    toggleCollapsedCompleted: (state, action: PayloadAction<string>) => { 
      state.collapsedCompleted[action.payload] = !state.collapsedCompleted[action.payload]; 
    },
    setEditingTaskId: (state, action: PayloadAction<string | null>) => { state.editingTaskId = action.payload; },
    setOpenListMenu: (state, action: PayloadAction<string | null>) => { state.openListMenu = action.payload; },
    setOpenTaskMenu: (state, action: PayloadAction<string | null>) => { state.openTaskMenu = action.payload; },
    setOpenMovePicker: (state, action: PayloadAction<string | null>) => { state.openMovePicker = action.payload; },
    startRenameList: (state, action: PayloadAction<{ id: string; name: string }>) => {
      state.renamingListId = action.payload.id;
      state.renameValue = action.payload.name;
    },
    setRenameValue: (state, action: PayloadAction<string>) => { state.renameValue = action.payload; },
    clearRenamingList: (state) => { state.renamingListId = null; state.renameValue = ""; },
    setNewSubtaskInput: (state, action: PayloadAction<{ parentId: string; value: string }>) => {
      state.newSubtaskInputs[action.payload.parentId] = action.payload.value;
    },
    setAddingList: (state, action: PayloadAction<boolean>) => { state.addingList = action.payload; },
    setNewListName: (state, action: PayloadAction<string>) => { state.newListName = action.payload; },
    setCalendarFor: (state, action: PayloadAction<string | null>) => { state.calendarFor = action.payload; },
    setEditDeadlineFor: (state, action: PayloadAction<string | null>) => { state.editDeadlineFor = action.payload; },
    setTimeFor: (state, action: PayloadAction<string | null>) => { state.timeFor = action.payload; },
    setRepeatFor: (state, action: PayloadAction<string | null>) => { state.repeatFor = action.payload; },
    incrementTomorrowClick: (state, action: PayloadAction<string>) => {
      state.tomorrowClickCount[action.payload] = (state.tomorrowClickCount[action.payload] || 0) + 1;
    },
    resetTomorrowClick: (state, action: PayloadAction<string>) => {
      state.tomorrowClickCount[action.payload] = 0;
    },
    setDragData: (state, action: PayloadAction<any | null>) => { state.dragData = action.payload; },
    setDragOverTarget: (state, action: PayloadAction<any | null>) => { state.dragOverTarget = action.payload; },
    closeAllEditing: (state) => {
      state.editingTaskId = null;
      state.calendarFor = null;
      state.editDeadlineFor = null;
      state.timeFor = null;
      state.repeatFor = null;
      state.openAssignFor = null;
      state.openAttFor = null;
      state.openListMenu = null;
      state.openTaskMenu = null;
      state.openMovePicker = null;
    }
  },
});

export const {
  setOpenAssignFor, setOpenAttFor, toggleCollapsedCompleted, setEditingTaskId, setOpenListMenu,
  setOpenTaskMenu, setOpenMovePicker, startRenameList, setRenameValue, clearRenamingList,
  setNewSubtaskInput, setAddingList, setNewListName, setCalendarFor, setEditDeadlineFor,
  setTimeFor, setRepeatFor, incrementTomorrowClick, resetTomorrowClick, setDragData,
  setDragOverTarget, closeAllEditing
} = taskUISlice.actions;

export default taskUISlice.reducer;
