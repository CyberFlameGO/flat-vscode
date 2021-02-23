import { Octokit } from "@octokit/rest";
import create from "zustand/vanilla";

type FlatStore = {
  octokit: Octokit | undefined;
  connectionString: string;
  setConnectionString: (sql: string) => void;
  setOctokit: (octokit: Octokit) => void;
  reset: () => void;
};

const store = create<FlatStore>((set) => ({
  octokit: undefined,
  setOctokit: (octokit) => {
    set({ octokit });
  },
  connectionString: "",
  setConnectionString: (connectionString: string) => {
    set({
      connectionString,
    });
  },
  reset: () => {
    set({ connectionString: "" });
  },
}));

export default store;
