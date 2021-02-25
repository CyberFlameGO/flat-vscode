import create from "zustand";

export const useStore = create(() => ({
  repo: null,
  octokit: null,
}));
