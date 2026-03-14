export interface Client {
  id: string;
  name: string;
  contact: string;
  notes: string;
  created_at: string;
}

export interface Service {
  id: string;
  client_id: string;
  client_name?: string;
  name: string;
  status: 'ongoing' | 'finished';
  total_value: number;
  paid_value: number;
  created_at: string;
}

export interface GalleryImage {
  id: string;
  gallery_id: string;
  url: string;
}

export interface GalleryItem {
  id: string;
  title: string;
  description?: string;
  type: 'image' | 'video';
  url: string;
  images?: { url: string }[];
  created_at: string;
}

export interface Stats {
  clients: number;
  services: number;
  finances: {
    total: number;
    paid: number;
    remaining: number;
  };
}
