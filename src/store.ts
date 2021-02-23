import create from "zustand/vanilla";

type FlatStore = {
  connectionString: string;
  sql: string;
  setSql: (sql: string) => void;
  setConnectionString: (sql: string) => void;
  reset: () => void;
};

const store = create<FlatStore>((set) => ({
  sql: "",
  connectionString: "",
  setSql: (sql: string) => {
    set({
      sql,
    });
  },
  setConnectionString: (connectionString: string) => {
    set({
      connectionString,
    });
  },
  reset: () => {
    set({ connectionString: "", sql: "" });
  },
}));

export default store;
