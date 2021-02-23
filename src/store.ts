import create from "zustand/vanilla";

type FlatStore = {
  connectionString: string;
  setConnectionString: (sql: string) => void;
  reset: () => void;
};

const store = create<FlatStore>((set) => ({
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
