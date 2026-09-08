export type FeedingRow = {
  id: string;
  created_at: string;
  amount: number;
  status: string;
  fed_by: string | null;
};

export type MessageRow = {
  id: string;
  created_at: string;
  name: string;
  message: string;
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
      messages: {
        Row: MessageRow;
        Insert: {
          id?: string;
          created_at?: string;
          name: string;
          message: string;
        };
        Update: {
          id?: string;
          created_at?: string;
          name?: string;
          message?: string;
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
