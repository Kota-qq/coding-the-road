export interface Post {
  id: string;
  properties: {
    Title: {
      title: Array<{
        plain_text: string;
      }>;
    };
    Date: {
      date?: {
        start: string;
      };
    };
  };
} 