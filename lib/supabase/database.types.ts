export type FeedingRow = {
  id: string;
  created_at: string;
  amount: number;
  status: string;
  fed_by: string | null;
};

export type Database = {
  public: {
    Tables: {
      feedings: {
        Row: FeedingRow;
        Insert: {
          id?: string;
          created_at?: string;
          amount: number;
          status: string;
          fed_by?: string | null;
        };
        Update: {
          id?: string;
          created_at?: string;
          amount?: number;
          status?: string;
          fed_by?: string | null;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};
