import { Project } from "@/models/Project";

export const getAllProjects = async () => {
    const projects = await Project.find();
    return projects;
  };