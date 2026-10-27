import { useContext } from "react";
import { TaskChangesContext } from "./TaskChangesContext";

export function useTaskChanges() {
  return useContext(TaskChangesContext);
}
