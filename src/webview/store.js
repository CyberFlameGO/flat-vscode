import create from "zustand";

export const useStore = create(() => ({
  sessionToken: "",
  repo: null,
  octokit: null,
}));
